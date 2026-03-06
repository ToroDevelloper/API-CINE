const mongoose = require('mongoose');

const pedidoSnackSchema = new mongoose.Schema({
    reserva_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reserva'
    },
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El usuario es requerido']
    },
    items: [{
        snack_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Snack',
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: [1, 'La cantidad mínima es 1']
        },
        precio_unitario: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        required: [true, 'El total es requerido'],
        min: [0, 'El total no puede ser negativo']
    },
    estado: {
        type: String,
        enum: ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    fecha_pedido: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índice para búsquedas por usuario
pedidoSnackSchema.index({ usuario_id: 1, fecha_pedido: -1 });

module.exports = mongoose.model('PedidoSnack', pedidoSnackSchema);
