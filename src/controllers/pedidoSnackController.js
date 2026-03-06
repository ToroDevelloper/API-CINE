const PedidoSnack = require('../models/PedidoSnack');
const Snack = require('../models/Snack');

// @desc    Obtener todos los pedidos
// @route   GET /api/pedidos-snacks
// @access  Private/Admin
exports.getPedidos = async (req, res, next) => {
    try {
        const filtro = {};
        if (req.query.estado) filtro.estado = req.query.estado;
        if (req.query.usuario_id) filtro.usuario_id = req.query.usuario_id;

        const pedidos = await PedidoSnack.find(filtro)
            .populate('usuario_id', 'nombre apellido email')
            .populate('reserva_id', 'codigo_qr')
            .populate('items.snack_id', 'nombre precio')
            .sort({ fecha_pedido: -1 });

        res.status(200).json({
            success: true,
            count: pedidos.length,
            data: pedidos
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener pedidos del usuario actual
// @route   GET /api/pedidos-snacks/mis-pedidos
// @access  Private
exports.getMisPedidos = async (req, res, next) => {
    try {
        const pedidos = await PedidoSnack.find({ usuario_id: req.usuario._id })
            .populate('reserva_id', 'codigo_qr')
            .populate('items.snack_id', 'nombre imagen_url')
            .sort({ fecha_pedido: -1 });

        res.status(200).json({
            success: true,
            count: pedidos.length,
            data: pedidos
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener un pedido por ID
// @route   GET /api/pedidos-snacks/:id
// @access  Private
exports.getPedido = async (req, res, next) => {
    try {
        const pedido = await PedidoSnack.findById(req.params.id)
            .populate('usuario_id', 'nombre apellido email')
            .populate('reserva_id')
            .populate('items.snack_id');

        if (!pedido) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        // Verificar que el usuario es dueño o admin
        if (pedido.usuario_id._id.toString() !== req.usuario._id.toString() 
            && req.usuario.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para ver este pedido'
            });
        }

        res.status(200).json({
            success: true,
            data: pedido
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Crear pedido
// @route   POST /api/pedidos-snacks
// @access  Private
exports.createPedido = async (req, res, next) => {
    try {
        const { reserva_id, items } = req.body;

        // Validar y calcular items
        const itemsConPrecio = [];
        let total = 0;

        for (const item of items) {
            const snack = await Snack.findById(item.snack_id);
            
            if (!snack || !snack.disponible) {
                return res.status(400).json({
                    success: false,
                    message: `Snack ${item.snack_id} no disponible`
                });
            }

            const subtotal = snack.precio * item.cantidad;
            total += subtotal;

            itemsConPrecio.push({
                snack_id: item.snack_id,
                cantidad: item.cantidad,
                precio_unitario: snack.precio,
                subtotal
            });
        }

        const pedido = await PedidoSnack.create({
            usuario_id: req.usuario._id,
            reserva_id,
            items: itemsConPrecio,
            total
        });

        res.status(201).json({
            success: true,
            data: pedido
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar estado del pedido
// @route   PUT /api/pedidos-snacks/:id
// @access  Private/Admin
exports.updatePedido = async (req, res, next) => {
    try {
        const pedido = await PedidoSnack.findByIdAndUpdate(
            req.params.id,
            { estado: req.body.estado },
            { new: true, runValidators: true }
        );

        if (!pedido) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: pedido
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancelar pedido
// @route   DELETE /api/pedidos-snacks/:id
// @access  Private
exports.cancelarPedido = async (req, res, next) => {
    try {
        let pedido = await PedidoSnack.findById(req.params.id);

        if (!pedido) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        // Solo se puede cancelar si está pendiente
        if (pedido.estado !== 'pendiente') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden cancelar pedidos pendientes'
            });
        }

        // Solo admin o dueño puede cancelar
        if (pedido.usuario_id.toString() !== req.usuario._id.toString() 
            && req.usuario.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para cancelar este pedido'
            });
        }

        pedido = await PedidoSnack.findByIdAndUpdate(
            req.params.id,
            { estado: 'cancelado' },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Pedido cancelado correctamente'
        });
    } catch (error) {
        next(error);
    }
};
