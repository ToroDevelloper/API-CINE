// Middleware para manejar errores globales
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log para desarrollo
    console.error(err);

    // Error de Mongoose - ID mal formado
    if (err.name === 'CastError') {
        const message = 'Recurso no encontrado';
        error = { message, statusCode: 404 };
    }

    // Error de Mongoose - Duplicado
    if (err.code === 11000) {
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'desconocido';
        const message = `El valor del campo '${field}' ya existe`;
        error = { message, statusCode: 400 };
    }

    // Error de Mongoose - Validación
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token inválido';
        error = { message, statusCode: 401 };
    }

    // Error de JWT expirado
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expirado';
        error = { message, statusCode: 401 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
    });
};

// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Ruta ${req.originalUrl} no encontrada`
    });
};

module.exports = {
    errorHandler,
    notFound
};
