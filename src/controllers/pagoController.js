const Pago = require('../models/Pago');
const Reserva = require('../models/Reserva');

// @desc    Obtener todos los pagos
// @route   GET /api/pagos
// @access  Private/Admin
exports.getPagos = async (req, res, next) => {
    try {
        const filtro = {};
        if (req.query.estado) filtro.estado = req.query.estado;
        if (req.query.metodo_pago) filtro.metodo_pago = req.query.metodo_pago;

        const pagos = await Pago.find(filtro)
            .populate('usuario_id', 'nombre apellido email')
            .populate('reserva_id', 'codigo_qr total')
            .sort({ fecha_pago: -1 });

        res.status(200).json({
            success: true,
            count: pagos.length,
            data: pagos
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener pagos del usuario actual
// @route   GET /api/pagos/mis-pagos
// @access  Private
exports.getMisPagos = async (req, res, next) => {
    try {
        const pagos = await Pago.find({ usuario_id: req.usuario._id })
            .populate('reserva_id', 'codigo_qr total estado')
            .sort({ fecha_pago: -1 });

        res.status(200).json({
            success: true,
            count: pagos.length,
            data: pagos
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener un pago por ID
// @route   GET /api/pagos/:id
// @access  Private
exports.getPago = async (req, res, next) => {
    try {
        const pago = await Pago.findById(req.params.id)
            .populate('usuario_id', 'nombre apellido email')
            .populate('reserva_id');

        if (!pago) {
            return res.status(404).json({
                success: false,
                message: 'Pago no encontrado'
            });
        }

        // Verificar que el usuario es dueño o admin
        if (pago.usuario_id._id.toString() !== req.usuario._id.toString() 
            && req.usuario.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para ver este pago'
            });
        }

        res.status(200).json({
            success: true,
            data: pago
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Crear pago
// @route   POST /api/pagos
// @access  Private
exports.createPago = async (req, res, next) => {
    try {
        const { reserva_id, metodo_pago } = req.body;

        // Verificar que la reserva existe
        const reserva = await Reserva.findById(reserva_id);
        if (!reserva) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        // Verificar que la reserva pertenece al usuario
        if (reserva.usuario_id.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para pagar esta reserva'
            });
        }

        // Verificar que no hay un pago completado para esta reserva
        const pagoExistente = await Pago.findOne({
            reserva_id,
            estado: 'completado'
        });

        if (pagoExistente) {
            return res.status(400).json({
                success: false,
                message: 'Esta reserva ya fue pagada'
            });
        }

        // Crear pago
        const pago = await Pago.create({
            reserva_id,
            usuario_id: req.usuario._id,
            monto: reserva.total,
            metodo_pago,
            estado: 'procesando'
        });

        // Simular procesamiento de pago (en producción se integraría con pasarela de pago)
        // Aquí se podría integrar Stripe, PayPal, etc.
        
        // Por ahora, marcamos como completado automáticamente
        pago.estado = 'completado';
        await pago.save();

        // Actualizar estado de la reserva
        reserva.estado = 'confirmada';
        await reserva.save();

        res.status(201).json({
            success: true,
            data: pago
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar estado del pago
// @route   PUT /api/pagos/:id
// @access  Private/Admin
exports.updatePago = async (req, res, next) => {
    try {
        const pago = await Pago.findByIdAndUpdate(
            req.params.id,
            { estado: req.body.estado },
            { new: true, runValidators: true }
        );

        if (!pago) {
            return res.status(404).json({
                success: false,
                message: 'Pago no encontrado'
            });
        }

        // Si el pago se completa, actualizar la reserva
        if (req.body.estado === 'completado') {
            await Reserva.findByIdAndUpdate(pago.reserva_id, { estado: 'confirmada' });
        }

        // Si el pago falla o se reembolsa, actualizar la reserva
        if (req.body.estado === 'fallido' || req.body.estado === 'reembolsado') {
            await Reserva.findByIdAndUpdate(pago.reserva_id, { estado: 'cancelada' });
        }

        res.status(200).json({
            success: true,
            data: pago
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Solicitar reembolso
// @route   POST /api/pagos/:id/reembolso
// @access  Private
exports.solicitarReembolso = async (req, res, next) => {
    try {
        const pago = await Pago.findById(req.params.id);

        if (!pago) {
            return res.status(404).json({
                success: false,
                message: 'Pago no encontrado'
            });
        }

        // Verificar que el usuario es dueño
        if (pago.usuario_id.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado'
            });
        }

        // Solo se puede reembolsar pagos completados
        if (pago.estado !== 'completado') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden reembolsar pagos completados'
            });
        }

        // Simular proceso de reembolso
        pago.estado = 'reembolsado';
        await pago.save();

        // Cancelar la reserva asociada
        await Reserva.findByIdAndUpdate(pago.reserva_id, { estado: 'cancelada' });

        res.status(200).json({
            success: true,
            message: 'Reembolso procesado correctamente'
        });
    } catch (error) {
        next(error);
    }
};
