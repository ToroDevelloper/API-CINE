const Sala = require('../models/Sala');

// @desc    Obtener todas las salas
// @route   GET /api/salas
// @access  Public
exports.getSalas = async (req, res, next) => {
    try {
        const filtro = {};
        if (req.query.tipo) filtro.tipo = req.query.tipo;
        if (req.query.activa) filtro.activa = req.query.activa === 'true';

        const salas = await Sala.find(filtro);

        res.status(200).json({
            success: true,
            count: salas.length,
            data: salas
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener una sala por ID
// @route   GET /api/salas/:id
// @access  Public
exports.getSala = async (req, res, next) => {
    try {
        const sala = await Sala.findById(req.params.id);

        if (!sala) {
            return res.status(404).json({
                success: false,
                message: 'Sala no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: sala
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Crear sala
// @route   POST /api/salas
// @access  Private/Admin
exports.createSala = async (req, res, next) => {
    try {
        const sala = await Sala.create(req.body);

        res.status(201).json({
            success: true,
            data: sala
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar sala
// @route   PUT /api/salas/:id
// @access  Private/Admin
exports.updateSala = async (req, res, next) => {
    try {
        const sala = await Sala.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!sala) {
            return res.status(404).json({
                success: false,
                message: 'Sala no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: sala
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar sala
// @route   DELETE /api/salas/:id
// @access  Private/Admin
exports.deleteSala = async (req, res, next) => {
    try {
        const sala = await Sala.findByIdAndUpdate(
            req.params.id,
            { activa: false },
            { new: true }
        );

        if (!sala) {
            return res.status(404).json({
                success: false,
                message: 'Sala no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Sala desactivada correctamente'
        });
    } catch (error) {
        next(error);
    }
};
