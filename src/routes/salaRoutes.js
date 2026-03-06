const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validarCampos } = require('../middlewares/validacion');
const { protegerRuta, autorizarRoles } = require('../middlewares/auth');
const {
    getSalas,
    getSala,
    createSala,
    updateSala,
    deleteSala
} = require('../controllers/salaController');

// Validaciones
const validacionesSala = [
    body('nombre', 'El nombre es requerido').notEmpty().trim(),
    body('capacidad', 'La capacidad debe ser un número positivo').isInt({ min: 1 }),
    body('tipo').optional().isIn(['2D', '3D', 'IMAX', '4DX', 'VIP']),
    validarCampos
];

// Rutas públicas
router.get('/', getSalas);
router.get('/:id', getSala);

// Rutas protegidas (admin)
router.post('/', protegerRuta, autorizarRoles('admin'), validacionesSala, createSala);
router.put('/:id', protegerRuta, autorizarRoles('admin'), updateSala);
router.delete('/:id', protegerRuta, autorizarRoles('admin'), deleteSala);

module.exports = router;
