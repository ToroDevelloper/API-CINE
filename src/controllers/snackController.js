const Snack = require('../models/Snack');

// @desc    Obtener todos los snacks
// @route   GET /api/snacks
// @access  Public
exports.getSnacks = async (req, res, next) => {
    try {
        const filtro = {};
        if (req.query.categoria) filtro.categoria = req.query.categoria;
        if (req.query.disponible) filtro.disponible = req.query.disponible === 'true';

        const snacks = await Snack.find(filtro).sort({ categoria: 1, nombre: 1 });

        res.status(200).json({
            success: true,
            count: snacks.length,
            data: snacks
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener un snack por ID
// @route   GET /api/snacks/:id
// @access  Public
exports.getSnack = async (req, res, next) => {
    try {
        const snack = await Snack.findById(req.params.id);

        if (!snack) {
            return res.status(404).json({
                success: false,
                message: 'Snack no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: snack
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Crear snack
// @route   POST /api/snacks
// @access  Private/Admin
exports.createSnack = async (req, res, next) => {
    try {
        const snack = await Snack.create(req.body);

        res.status(201).json({
            success: true,
            data: snack
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar snack
// @route   PUT /api/snacks/:id
// @access  Private/Admin
exports.updateSnack = async (req, res, next) => {
    try {
        const snack = await Snack.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!snack) {
            return res.status(404).json({
                success: false,
                message: 'Snack no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: snack
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar snack
// @route   DELETE /api/snacks/:id
// @access  Private/Admin
exports.deleteSnack = async (req, res, next) => {
    try {
        const snack = await Snack.findByIdAndUpdate(
            req.params.id,
            { disponible: false },
            { new: true }
        );

        if (!snack) {
            return res.status(404).json({
                success: false,
                message: 'Snack no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Snack desactivado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener snacks por categoría
// @route   GET /api/snacks/categoria/:categoria
// @access  Public
exports.getSnacksPorCategoria = async (req, res, next) => {
    try {
        const snacks = await Snack.find({
            categoria: req.params.categoria,
            disponible: true
        }).sort({ nombre: 1 });

        res.status(200).json({
            success: true,
            count: snacks.length,
            data: snacks
        });
    } catch (error) {
        next(error);
    }
};
