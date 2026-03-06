const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const salaRoutes = require('./salaRoutes');
const peliculaRoutes = require('./peliculaRoutes');
const asientoRoutes = require('./asientoRoutes');
const funcionRoutes = require('./funcionRoutes');
const reservaRoutes = require('./reservaRoutes');
const snackRoutes = require('./snackRoutes');
const pedidoSnackRoutes = require('./pedidoSnackRoutes');
const pagoRoutes = require('./pagoRoutes');

// Montar rutas
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/salas', salaRoutes);
router.use('/peliculas', peliculaRoutes);
router.use('/asientos', asientoRoutes);
router.use('/funciones', funcionRoutes);
router.use('/reservas', reservaRoutes);
router.use('/snacks', snackRoutes);
router.use('/pedidos-snacks', pedidoSnackRoutes);
router.use('/pagos', pagoRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
