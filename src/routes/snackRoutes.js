const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validarCampos } = require('../middlewares/validacion');
const { protegerRuta, autorizarRoles } = require('../middlewares/auth');
const {
    getSnacks,
    getSnack,
    createSnack,
    updateSnack,
    deleteSnack,
    getSnacksPorCategoria
} = require('../controllers/snackController');

// Validaciones
const validacionesSnack = [
    body('nombre', 'El nombre es requerido').notEmpty().trim(),
    body('precio', 'El precio debe ser positivo').isFloat({ min: 0 }),
    body('categoria', 'Categoría no válida').isIn(['palomitas', 'bebidas', 'dulces', 'combos', 'nachos', 'otros']),
    validarCampos
];

// Rutas públicas
router.get('/', getSnacks);
router.get('/categoria/:categoria', getSnacksPorCategoria);
router.get('/:id', getSnack);

// Rutas protegidas (admin)
router.post('/', protegerRuta, autorizarRoles('admin'), validacionesSnack, createSnack);
router.put('/:id', protegerRuta, autorizarRoles('admin'), updateSnack);
router.delete('/:id', protegerRuta, autorizarRoles('admin'), deleteSnack);

module.exports = router;
