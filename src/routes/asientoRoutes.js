const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validarCampos } = require('../middlewares/validacion');
const { protegerRuta, autorizarRoles } = require('../middlewares/auth');
const {
    getAsientosPorSala,
    getAsiento,
    createAsiento,
    createAsientosBulk,
    updateAsiento,
    deleteAsiento
} = require('../controllers/asientoController');

// Validaciones
const validacionesAsiento = [
    body('sala_id', 'La sala es requerida').isMongoId(),
    body('fila', 'La fila es requerida').notEmpty().trim(),
    body('numero', 'El número debe ser positivo').isInt({ min: 1 }),
    body('tipo').optional().isIn(['normal', 'vip', 'preferencial', 'pareja', 'discapacitado']),
    validarCampos
];

const validacionesBulk = [
    body('sala_id', 'La sala es requerida').isMongoId(),
    body('filas', 'Las filas son requeridas (ej: A,B,C)').notEmpty(),
    body('asientosPorFila', 'Asientos por fila requerido').isInt({ min: 1 }),
    validarCampos
];

// Rutas públicas
router.get('/sala/:salaId', getAsientosPorSala);
router.get('/:id', getAsiento);

// Rutas protegidas (admin)
router.post('/', protegerRuta, autorizarRoles('admin'), validacionesAsiento, createAsiento);
router.post('/bulk', protegerRuta, autorizarRoles('admin'), validacionesBulk, createAsientosBulk);
router.put('/:id', protegerRuta, autorizarRoles('admin'), updateAsiento);
router.delete('/:id', protegerRuta, autorizarRoles('admin'), deleteAsiento);

module.exports = router;
