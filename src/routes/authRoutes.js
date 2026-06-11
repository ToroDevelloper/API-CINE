const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { validarCampos } = require('../middlewares/validacion');
const { protegerRuta } = require('../middlewares/auth');
const {
    registro,
    login,
    logout,
    getMe,
    actualizarDatos,
    cambiarPassword
} = require('../controllers/authController');

// Rate limiting para autenticación (deshabilitado en tests)
const authLimiter = process.env.NODE_ENV === 'test'
    ? (req, res, next) => next()
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        message: { success: false, message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
        standardHeaders: true,
        legacyHeaders: false,
    });

// Validaciones
const validacionesRegistro = [
    body('nombre', 'El nombre es requerido').notEmpty().trim(),
    body('apellido', 'El apellido es requerido').notEmpty().trim(),
    body('email', 'Email no válido').isEmail().normalizeEmail(),
    body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    validarCampos
];

const validacionesLogin = [
    body('email', 'Email no válido').isEmail().normalizeEmail(),
    body('password', 'La contraseña es requerida').notEmpty(),
    validarCampos
];

// Rutas públicas (con rate limiting)
router.post('/registro', authLimiter, validacionesRegistro, registro);
router.post('/login', authLimiter, validacionesLogin, login);
router.post('/logout', logout);

// Rutas protegidas
router.get('/me', protegerRuta, getMe);
router.put('/actualizar', protegerRuta, actualizarDatos);
router.put('/cambiar-password', protegerRuta, cambiarPassword);

module.exports = router;
