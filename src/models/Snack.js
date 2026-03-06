const mongoose = require('mongoose');

const snackSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    precio: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    categoria: {
        type: String,
        enum: ['palomitas', 'bebidas', 'dulces', 'combos', 'nachos', 'otros'],
        required: [true, 'La categoría es requerida']
    },
    imagen_url: {
        type: String,
        trim: true
    },
    disponible: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Snack', snackSchema);
