const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El usuario es requerido']
    },
    funcion_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Funcion',
        required: [true, 'La función es requerida']
    },
    asientos_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asiento',
        required: [true, 'Al menos un asiento es requerido']
    }],
    total: {
        type: Number,
        required: [true, 'El total es requerido'],
        min: [0, 'El total no puede ser negativo']
    },
    estado: {
        type: String,
        enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
        default: 'pendiente'
    },
    fecha_reserva: {
        type: Date,
        default: Date.now()
    },
    codigo_qr: {
        type: String,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Generar código QR único antes de guardar
reservaSchema.pre('save', function(next) {
    if (!this.codigo_qr) {
        this.codigo_qr = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

// Índice para búsquedas por usuario y función
reservaSchema.index({ usuario_id: 1, funcion_id: 1 });

module.exports = mongoose.model('Reserva', reservaSchema);
