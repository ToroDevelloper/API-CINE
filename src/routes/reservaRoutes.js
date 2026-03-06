const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validarCampos } = require('../middlewares/validacion');
const { protegerRuta, autorizarRoles } = require('../middlewares/auth');
const {
    getReservas,
    getMisReservas,
    getReserva,
    createReserva,
    updateReserva,
    cancelarReserva,
    getAsientosDisponibles
} = require('../controllers/reservaController');

// Validaciones
const validacionesReserva = [
    body('funcion_id', 'La función es requerida').isMongoId(),
    body('asientos_ids', 'Los asientos son requeridos').isArray({ min: 1 }),
    body('asientos_ids.*', 'ID de asiento no válido').isMongoId(),
    validarCampos
];

// Ruta pública
router.get('/asientos-disponibles/:funcionId', getAsientosDisponibles);

// Rutas protegidas
router.use(protegerRuta);

router.get('/mis-reservas', getMisReservas);
router.post('/', validacionesReserva, createReserva);
router.get('/:id', getReserva);
router.put('/:id', updateReserva);
router.delete('/:id', cancelarReserva);

// Rutas admin
router.get('/', autorizarRoles('admin'), getReservas);

module.exports = router;
