const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const config = require('../config');

// Middleware para proteger rutas
const protegerRuta = async (req, res, next) => {
    try {
        let token;

        // Verificar si hay token en el header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado. Token no proporcionado'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, config.jwt.secret);

        // Buscar usuario
        const usuario = await Usuario.findById(decoded.id);

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (!usuario.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario desactivado'
            });
        }

        // Agregar usuario a la request
        req.usuario = usuario;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

// Middleware para verificar roles
const autorizarRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.usuario.rol)) {
            return res.status(403).json({
                success: false,
                message: `Rol ${req.usuario.rol} no tiene permiso para esta acción`
            });
        }
        next();
    };
};

module.exports = {
    protegerRuta,
    autorizarRoles
};
