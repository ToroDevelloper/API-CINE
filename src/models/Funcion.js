const mongoose = require('mongoose');

const funcionSchema = new mongoose.Schema({
    pelicula_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pelicula',
        required: [true, 'La película es requerida']
    },
    sala_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sala',
        required: [true, 'La sala es requerida']
    },
    fecha_hora: {
        type: Date,
        required: [true, 'La fecha y hora son requeridas']
    },
    precio_base: {
        type: Number,
        required: [true, 'El precio base es requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    idioma: {
        type: String,
        enum: ['español', 'subtitulada', 'doblada'],
        default: 'español'
    },
    formato: {
        type: String,
        enum: ['2D', '3D', 'IMAX', '4DX'],
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

// Índice para búsquedas por fecha
funcionSchema.index({ fecha_hora: 1, pelicula_id: 1 });

module.exports = mongoose.model('Funcion', funcionSchema);
