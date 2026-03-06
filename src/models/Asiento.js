const mongoose = require('mongoose');

const asientoSchema = new mongoose.Schema({
    sala_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sala',
        required: [true, 'La sala es requerida']
    },
    fila: {
        type: String,
        required: [true, 'La fila es requerida'],
        trim: true,
        uppercase: true
    },
    numero: {
        type: Number,
        required: [true, 'El número de asiento es requerido'],
        min: [1, 'El número mínimo es 1']
    },
    tipo: {
        type: String,
        enum: ['normal', 'vip', 'preferencial', 'pareja', 'discapacitado'],
        default: 'normal'
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índice único compuesto para evitar duplicados
asientoSchema.index({ sala_id: 1, fila: 1, numero: 1 }, { unique: true });

module.exports = mongoose.model('Asiento', asientoSchema);
