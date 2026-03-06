const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validarCampos } = require('../middlewares/validacion');
const { protegerRuta } = require('../middlewares/auth');
const {
    registro,
    login,
    getMe,
    actualizarDatos,
    cambiarPassword
} = require('../controllers/authController');

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

// Rutas públicas
router.post('/registro', validacionesRegistro, registro);
router.post('/login', validacionesLogin, login);

// Rutas protegidas
router.get('/me', protegerRuta, getMe);
router.put('/actualizar', protegerRuta, actualizarDatos);
router.put('/cambiar-password', protegerRuta, cambiarPassword);

module.exports = router;
