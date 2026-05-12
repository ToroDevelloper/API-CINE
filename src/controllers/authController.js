const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const config = require('../config');

// Generar JWT
const generarToken = (id) => {
    return jwt.sign({ id }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
    });
};

// @desc    Registrar usuario
// @route   POST /api/auth/registro
// @access  Public
exports.registro = async (req, res, next) => {
    try {
        const { nombre, apellido, email, password } = req.body;

        // Verificar si el usuario ya existe
        const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Crear usuario
        const usuario = await Usuario.create({
            nombre,
            apellido,
            email,
            password_hash: password
        });

        // Generar token
        const token = generarToken(usuario._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            data: {
                _id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validar email y password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Por favor proporcione email y contraseña'
            });
        }

        // Buscar usuario
        const usuario = await Usuario.findOne({ email }).select('+password_hash');

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isMatch = await usuario.compararPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        if (!usuario.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario desactivado'
            });
        }

        // Generar token
        const token = generarToken(usuario._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 día
        });

        res.status(200).json({
            success: true,
            data: {
                _id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const usuario = await Usuario.findById(req.usuario._id);

        res.status(200).json({
            success: true,
            data: usuario
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar datos del usuario
// @route   PUT /api/auth/actualizar
// @access  Private
exports.actualizarDatos = async (req, res, next) => {
    try {
        const camposActualizar = {
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            telefono: req.body.telefono
        };

        const usuario = await Usuario.findByIdAndUpdate(
            req.usuario._id,
            camposActualizar,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: usuario
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cambiar contraseña
// @route   PUT /api/auth/cambiar-password
// @access  Private
exports.cambiarPassword = async (req, res, next) => {
    try {
        const { passwordActual, nuevaPassword } = req.body;

        const usuario = await Usuario.findById(req.usuario._id).select('+password_hash');

        // Verificar contraseña actual
        const isMatch = await usuario.compararPassword(passwordActual);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        usuario.password_hash = nuevaPassword;
        await usuario.save();

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout usuario (borra cookie JWT)
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(0)
        });

        res.status(200).json({
            success: true,
            message: 'Sesión cerrada'
        });
    } catch (error) {
        next(error);
    }
};
