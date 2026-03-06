const Usuario = require('../models/Usuario');

// @desc    Obtener todos los usuarios
// @route   GET /api/usuarios
// @access  Private/Admin
exports.getUsuarios = async (req, res, next) => {
    try {
        const usuarios = await Usuario.find();

        res.status(200).json({
            success: true,
            count: usuarios.length,
            data: usuarios
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener un usuario por ID
// @route   GET /api/usuarios/:id
// @access  Private/Admin
exports.getUsuario = async (req, res, next) => {
    try {
        const usuario = await Usuario.findById(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: usuario
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar usuario
// @route   PUT /api/usuarios/:id
// @access  Private/Admin
exports.updateUsuario = async (req, res, next) => {
    try {
        const usuario = await Usuario.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: usuario
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar usuario (desactivar)
// @route   DELETE /api/usuarios/:id
// @access  Private/Admin
exports.deleteUsuario = async (req, res, next) => {
    try {
        const usuario = await Usuario.findByIdAndUpdate(
            req.params.id,
            { activo: false },
            { new: true }
        );

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Usuario desactivado correctamente'
        });
    } catch (error) {
        next(error);
    }
};
