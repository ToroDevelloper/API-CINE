const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validarCampos } = require('../middlewares/validacion');
const { protegerRuta, autorizarRoles } = require('../middlewares/auth');
const {
    getPagos,
    getMisPagos,
    getPago,
    createPago,
    updatePago,
    solicitarReembolso
} = require('../controllers/pagoController');

// Validaciones
const validacionesPago = [
    body('reserva_id', 'La reserva es requerida').isMongoId(),
    body('metodo_pago', 'Método de pago no válido').isIn(['tarjeta_credito', 'tarjeta_debito', 'efectivo', 'paypal', 'transferencia']),
    validarCampos
];

// Todas las rutas requieren autenticación
router.use(protegerRuta);

router.get('/mis-pagos', getMisPagos);
router.post('/', validacionesPago, createPago);
router.get('/:id', getPago);
router.post('/:id/reembolso', solicitarReembolso);

// Rutas admin
router.get('/', autorizarRoles('admin'), getPagos);
router.put('/:id', autorizarRoles('admin'), updatePago);

module.exports = router;
