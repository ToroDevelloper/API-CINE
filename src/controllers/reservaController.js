const Reserva = require('../models/Reserva');
const Funcion = require('../models/Funcion');
const Asiento = require('../models/Asiento');
const { validarReserva, validarEstadoReserva } = require('../utils/validators');

// @desc    Obtener todas las reservas
// @route   GET /api/reservas
// @access  Private/Admin
exports.getReservas = async (req, res, next) => {
    try {
        const filtro = {};
        if (req.query.estado) filtro.estado = req.query.estado;
        if (req.query.usuario_id) filtro.usuario_id = req.query.usuario_id;
        if (req.query.funcion_id) filtro.funcion_id = req.query.funcion_id;

        const reservas = await Reserva.find(filtro)
            .populate('usuario_id', 'nombre apellido email')
            .populate({
                path: 'funcion_id',
                populate: [
                    { path: 'pelicula_id', select: 'titulo poster_url' },
                    { path: 'sala_id', select: 'nombre' }
                ]
            })
            .populate('asientos_ids', 'fila numero tipo')
            .sort({ fecha_reserva: -1 });

        res.status(200).json({
            success: true,
            count: reservas.length,
            data: reservas
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener reservas del usuario actual
// @route   GET /api/reservas/mis-reservas
// @access  Private
exports.getMisReservas = async (req, res, next) => {
    try {
        const reservas = await Reserva.find({ usuario_id: req.usuario._id })
            .populate({
                path: 'funcion_id',
                populate: [
                    { path: 'pelicula_id', select: 'titulo poster_url duracion_min' },
                    { path: 'sala_id', select: 'nombre tipo' }
                ]
            })
            .populate('asientos_ids', 'fila numero tipo')
            .sort({ fecha_reserva: -1 });

        res.status(200).json({
            success: true,
            count: reservas.length,
            data: reservas
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener una reserva por ID
// @route   GET /api/reservas/:id
// @access  Private
exports.getReserva = async (req, res, next) => {
    try {
        const reserva = await Reserva.findById(req.params.id)
            .populate('usuario_id', 'nombre apellido email telefono')
            .populate({
                path: 'funcion_id',
                populate: [
                    { path: 'pelicula_id' },
                    { path: 'sala_id' }
                ]
            })
            .populate('asientos_ids');

        if (!reserva) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        // Verificar que el usuario es dueño de la reserva o es admin
        if (reserva.usuario_id._id.toString() !== req.usuario._id.toString() 
            && req.usuario.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para ver esta reserva'
            });
        }

        res.status(200).json({
            success: true,
            data: reserva
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Crear reserva
// @route   POST /api/reservas
// @access  Private
exports.createReserva = async (req, res, next) => {
    try {
        const { funcion_id, asientos_ids } = req.body;

        // ── Validación de campos con validators.js ────────────────────────────
        const { valido, errores } = validarReserva({ funcion_id, asientos_ids });
        if (!valido) {
            return res.status(400).json({
                success: false,
                message: 'Datos de reserva inválidos.',
                errores
            });
        }

        // Verificar que la función existe y está activa
        const funcion = await Funcion.findById(funcion_id);
        if (!funcion || !funcion.activa) {
            return res.status(404).json({
                success: false,
                message: 'Función no encontrada o no disponible'
            });
        }

        // Verificar que la función no ha pasado
        if (new Date(funcion.fecha_hora) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'No se puede reservar para funciones pasadas'
            });
        }

        // Verificar que los asientos existen y pertenecen a la sala de la función
        const asientos = await Asiento.find({
            _id: { $in: asientos_ids },
            sala_id: funcion.sala_id
        });

        if (asientos.length !== asientos_ids.length) {
            return res.status(400).json({
                success: false,
                message: 'Algunos asientos no son válidos para esta sala'
            });
        }

        // Verificar que los asientos no están reservados para esta función
        const reservasExistentes = await Reserva.find({
            funcion_id,
            asientos_ids: { $in: asientos_ids },
            estado: { $in: ['pendiente', 'confirmada'] }
        });

        if (reservasExistentes.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Algunos asientos ya están reservados'
            });
        }

        // Calcular total
        const total = funcion.precio_base * asientos_ids.length;

        const reserva = await Reserva.create({
            usuario_id: req.usuario._id,
            funcion_id,
            asientos_ids,
            total
        });

        res.status(201).json({
            success: true,
            data: reserva
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar estado de reserva
// @route   PUT /api/reservas/:id
// @access  Private
exports.updateReserva = async (req, res, next) => {
    try {
        // ── Validación del estado con validators.js ───────────────────────────
        const { valido, errores } = validarEstadoReserva(req.body.estado);
        if (!valido) {
            return res.status(400).json({
                success: false,
                message: 'Estado de reserva inválido.',
                errores
            });
        }

        let reserva = await Reserva.findById(req.params.id);

        if (!reserva) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        // Solo admin o dueño puede actualizar
        if (reserva.usuario_id.toString() !== req.usuario._id.toString() 
            && req.usuario.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para modificar esta reserva'
            });
        }

        reserva = await Reserva.findByIdAndUpdate(
            req.params.id,
            { estado: req.body.estado },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: reserva
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancelar reserva
// @route   DELETE /api/reservas/:id
// @access  Private
exports.cancelarReserva = async (req, res, next) => {
    try {
        let reserva = await Reserva.findById(req.params.id);

        if (!reserva) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        // Solo admin o dueño puede cancelar
        if (reserva.usuario_id.toString() !== req.usuario._id.toString() 
            && req.usuario.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para cancelar esta reserva'
            });
        }

        reserva = await Reserva.findByIdAndUpdate(
            req.params.id,
            { estado: 'cancelada' },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Reserva cancelada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener asientos disponibles para una función
// @route   GET /api/reservas/asientos-disponibles/:funcionId
// @access  Public
exports.getAsientosDisponibles = async (req, res, next) => {
    try {
        const funcion = await Funcion.findById(req.params.funcionId);
        
        if (!funcion) {
            return res.status(404).json({
                success: false,
                message: 'Función no encontrada'
            });
        }

        // Obtener todos los asientos de la sala
        const todosAsientos = await Asiento.find({ sala_id: funcion.sala_id });

        // Obtener asientos ya reservados
        const reservas = await Reserva.find({
            funcion_id: req.params.funcionId,
            estado: { $in: ['pendiente', 'confirmada'] }
        });

        const asientosReservadosIds = reservas.flatMap(r => 
            r.asientos_ids.map(id => id.toString())
        );

        // Marcar disponibilidad
        const asientosConDisponibilidad = todosAsientos.map(asiento => ({
            ...asiento.toObject(),
            disponible: !asientosReservadosIds.includes(asiento._id.toString())
        }));

        res.status(200).json({
            success: true,
            data: asientosConDisponibilidad
        });
    } catch (error) {
        next(error);
    }
};
