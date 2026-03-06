const mongoose = require('mongoose');

const salaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la sala es requerido'],
        trim: true
    },
    capacidad: {
        type: Number,
        required: [true, 'La capacidad es requerida'],
        min: [1, 'La capacidad mínima es 1']
    },
    tipo: {
        type: String,
        enum: ['2D', '3D', 'IMAX', '4DX', 'VIP'],
        default: '2D'
    },
    activa: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Sala', salaSchema);
