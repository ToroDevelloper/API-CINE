const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validarCampos } = require('../middlewares/validacion');
const { protegerRuta, autorizarRoles } = require('../middlewares/auth');
const {
    getPeliculas,
    getPelicula,
    createPelicula,
    updatePelicula,
    deletePelicula,
    getCartelera,
    getProximosEstrenos
} = require('../controllers/peliculaController');

// Validaciones
const validacionesPelicula = [
    body('titulo', 'El título es requerido').notEmpty().trim(),
    body('sinopsis', 'La sinopsis es requerida').notEmpty(),
    body('duracion_min', 'La duración debe ser un número positivo').isInt({ min: 1 }),
    body('idioma', 'El idioma es requerido').notEmpty().trim(),
    body('clasificacion', 'Clasificación no válida').isIn(['G', 'PG', 'PG-13', 'R', 'NC-17', 'A', 'B', 'B15', 'C', 'D']),
    body('fecha_estreno', 'Fecha de estreno no válida').isISO8601(),
    validarCampos
];

// Rutas públicas
router.get('/', getPeliculas);
router.get('/cartelera', getCartelera);
router.get('/proximos-estrenos', getProximosEstrenos);
router.get('/:id', getPelicula);

// Rutas protegidas (admin)
router.post('/', protegerRuta, autorizarRoles('admin'), validacionesPelicula, createPelicula);
router.put('/:id', protegerRuta, autorizarRoles('admin'), updatePelicula);
router.delete('/:id', protegerRuta, autorizarRoles('admin'), deletePelicula);

module.exports = router;
