const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    apellido: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email no válido']
    },
    password_hash: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: 6,
        select: false
    },
    telefono: {
        type: String,
        trim: true
    },
    fecha_registro: {
        type: Date,
        default: Date.now
    },
    rol: {
        type: String,
        enum: ['cliente', 'admin', 'empleado'],
        default: 'cliente'
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Encriptar contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password_hash')) return next();
    this.password_hash = await bcrypt.hash(this.password_hash, 12);
    next();
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
