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

// Middlewares
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
const allowedOrigins = (process.env.CORS_ORIGIN || defaultOrigins.join(','))
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Documentacion Swagger
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

// Health check para Render
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        uptime: process.uptime()
    });
});

// Montar rutas
app.use('/api', routes);

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();

    return app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
        console.log(`http://localhost:${PORT}`);
        console.log(`API: http://localhost:${PORT}/api`);
        console.log(`Documentacion: http://localhost:${PORT}/api-docs`);
    });
};

// Iniciar servidor fuera de pruebas
if (process.env.NODE_ENV !== 'test') {
    startServer().catch(() => {
        process.exit(1);
    });
}

module.exports = app;
module.exports.startServer = startServer;
