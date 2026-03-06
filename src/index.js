require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares');

// Crear app
const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger en desarrollo
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Ruta base
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎬 API de Cine - Bienvenido',
        version: '1.0.0',
        endpoints: '/api'
    });
});

// Montar rutas
app.use('/api', routes);

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
});

module.exports = app;
