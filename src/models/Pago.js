const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
    reserva_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reserva',
        required: [true, 'La reserva es requerida']
    },
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El usuario es requerido']
    },
    monto: {
        type: Number,
        required: [true, 'El monto es requerido'],
        min: [0, 'El monto no puede ser negativo']
    },
    metodo_pago: {
        type: String,
        enum: ['tarjeta_credito', 'tarjeta_debito', 'efectivo', 'paypal', 'transferencia'],
        required: [true, 'El método de pago es requerido']
    },
    estado: {
        type: String,
        enum: ['pendiente', 'procesando', 'completado', 'fallido', 'reembolsado'],
        default: 'pendiente'
    },
    referencia: {
        type: String,
        unique: true,
        sparse: true
    },
    fecha_pago: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

// Generar referencia única antes de guardar
pagoSchema.pre('save', function(next) {
    if (!this.referencia) {
        this.referencia = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

// Índice para búsquedas por usuario y reserva
pagoSchema.index({ usuario_id: 1, reserva_id: 1 });

module.exports = mongoose.model('Pago', pagoSchema);
