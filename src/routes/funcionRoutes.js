const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validarCampos } = require('../middlewares/validacion');
const { protegerRuta, autorizarRoles } = require('../middlewares/auth');
const {
    getFunciones,
    getFuncion,
    createFuncion,
    updateFuncion,
    deleteFuncion,
    getFuncionesPorPelicula
} = require('../controllers/funcionController');

// Validaciones
const validacionesFuncion = [
    body('pelicula_id', 'La película es requerida').isMongoId(),
    body('sala_id', 'La sala es requerida').isMongoId(),
    body('fecha_hora', 'Fecha y hora no válida').isISO8601(),
    body('precio_base', 'El precio debe ser positivo').isFloat({ min: 0 }),
    body('idioma').optional().isIn(['español', 'subtitulada', 'doblada']),
    body('formato').optional().isIn(['2D', '3D', 'IMAX', '4DX']),
    validarCampos
];

// Rutas públicas
router.get('/', getFunciones);
router.get('/pelicula/:peliculaId', getFuncionesPorPelicula);
router.get('/:id', getFuncion);

// Rutas protegidas (admin)
router.post('/', protegerRuta, autorizarRoles('admin'), validacionesFuncion, createFuncion);
router.put('/:id', protegerRuta, autorizarRoles('admin'), updateFuncion);
router.delete('/:id', protegerRuta, autorizarRoles('admin'), deleteFuncion);

module.exports = router;
