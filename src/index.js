require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const connectDB = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares');

// Crear app
const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Documentación Swagger
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger-spec.yml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Logger en desarrollo
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Ruta base
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API de Cine - Bienvenido',
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
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
        console.log(`http://localhost:${PORT}`);
        console.log(`API: http://localhost:${PORT}/api`);
        console.log(`Documentación: http://localhost:${PORT}/api-docs`);
    });
}

module.exports = app;
