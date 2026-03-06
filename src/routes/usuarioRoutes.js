const express = require('express');
const router = express.Router();
const { protegerRuta, autorizarRoles } = require('../middlewares/auth');
const {
    getUsuarios,
    getUsuario,
    updateUsuario,
    deleteUsuario
} = require('../controllers/usuarioController');

// Todas las rutas requieren autenticación y rol admin
router.use(protegerRuta);
router.use(autorizarRoles('admin'));

router.route('/')
    .get(getUsuarios);

router.route('/:id')
    .get(getUsuario)
    .put(updateUsuario)
    .delete(deleteUsuario);

module.exports = router;
