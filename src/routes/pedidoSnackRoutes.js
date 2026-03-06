const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validarCampos } = require('../middlewares/validacion');
const { protegerRuta, autorizarRoles } = require('../middlewares/auth');
const {
    getPedidos,
    getMisPedidos,
    getPedido,
    createPedido,
    updatePedido,
    cancelarPedido
} = require('../controllers/pedidoSnackController');

// Validaciones
const validacionesPedido = [
    body('items', 'Los items son requeridos').isArray({ min: 1 }),
    body('items.*.snack_id', 'ID de snack no válido').isMongoId(),
    body('items.*.cantidad', 'La cantidad debe ser positiva').isInt({ min: 1 }),
    validarCampos
];

// Todas las rutas requieren autenticación
router.use(protegerRuta);

router.get('/mis-pedidos', getMisPedidos);
router.post('/', validacionesPedido, createPedido);
router.get('/:id', getPedido);
router.delete('/:id', cancelarPedido);

// Rutas admin
router.get('/', autorizarRoles('admin', 'empleado'), getPedidos);
router.put('/:id', autorizarRoles('admin', 'empleado'), updatePedido);

module.exports = router;
