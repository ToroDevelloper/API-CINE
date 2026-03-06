const mongoose = require('mongoose');

const peliculaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título es requerido'],
        trim: true
    },
    sinopsis: {
        type: String,
        required: [true, 'La sinopsis es requerida']
    },
    duracion_min: {
        type: Number,
        required: [true, 'La duración es requerida'],
        min: [1, 'La duración mínima es 1 minuto']
    },
    generos: [{
        type: String,
        trim: true
    }],
    idioma: {
        type: String,
        required: [true, 'El idioma es requerido'],
        trim: true
    },
    clasificacion: {
        type: String,
        enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'A', 'B', 'B15', 'C', 'D'],
        required: [true, 'La clasificación es requerida']
    },
    director: {
        type: String,
        trim: true
    },
    actores: [{
        type: String,
        trim: true
    }],
    poster_url: {
        type: String,
        trim: true
    },
    fecha_estreno: {
        type: Date,
        required: [true, 'La fecha de estreno es requerida']
    },
    activa: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índice para búsquedas por título
peliculaSchema.index({ titulo: 'text', sinopsis: 'text' });

module.exports = mongoose.model('Pelicula', peliculaSchema);
