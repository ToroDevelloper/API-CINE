const Asiento = require('../models/Asiento');
const Sala = require('../models/Sala');

// @desc    Obtener asientos de una sala
// @route   GET /api/asientos/sala/:salaId
// @access  Public
exports.getAsientosPorSala = async (req, res, next) => {
    try {
        const asientos = await Asiento.find({ sala_id: req.params.salaId })
            .populate('sala_id', 'nombre tipo')
            .sort({ fila: 1, numero: 1 });

        res.status(200).json({
            success: true,
            count: asientos.length,
            data: asientos
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener un asiento por ID
// @route   GET /api/asientos/:id
// @access  Public
exports.getAsiento = async (req, res, next) => {
    try {
        const asiento = await Asiento.findById(req.params.id)
            .populate('sala_id', 'nombre tipo');

        if (!asiento) {
            return res.status(404).json({
                success: false,
                message: 'Asiento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: asiento
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Crear asiento
// @route   POST /api/asientos
// @access  Private/Admin
exports.createAsiento = async (req, res, next) => {
    try {
        // Verificar que la sala existe
        const sala = await Sala.findById(req.body.sala_id);
        if (!sala) {
            return res.status(404).json({
                success: false,
                message: 'Sala no encontrada'
            });
        }

        const asiento = await Asiento.create(req.body);

        res.status(201).json({
            success: true,
            data: asiento
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Crear múltiples asientos para una sala
// @route   POST /api/asientos/bulk
// @access  Private/Admin
exports.createAsientosBulk = async (req, res, next) => {
    try {
        const { sala_id, filas, asientosPorFila, tipo } = req.body;

        // Verificar que la sala existe
        const sala = await Sala.findById(sala_id);
        if (!sala) {
            return res.status(404).json({
                success: false,
                message: 'Sala no encontrada'
            });
        }

        const asientos = [];
        const filasArray = filas.split(',').map(f => f.trim().toUpperCase());

        for (const fila of filasArray) {
            for (let numero = 1; numero <= asientosPorFila; numero++) {
                asientos.push({
                    sala_id,
                    fila,
                    numero,
                    tipo: tipo || 'normal'
                });
            }
        }

        const asientosCreados = await Asiento.insertMany(asientos, { ordered: false });

        res.status(201).json({
            success: true,
            count: asientosCreados.length,
            data: asientosCreados
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar asiento
// @route   PUT /api/asientos/:id
// @access  Private/Admin
exports.updateAsiento = async (req, res, next) => {
    try {
        const asiento = await Asiento.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!asiento) {
            return res.status(404).json({
                success: false,
                message: 'Asiento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: asiento
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar asiento
// @route   DELETE /api/asientos/:id
// @access  Private/Admin
exports.deleteAsiento = async (req, res, next) => {
    try {
        const asiento = await Asiento.findByIdAndDelete(req.params.id);

        if (!asiento) {
            return res.status(404).json({
                success: false,
                message: 'Asiento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Asiento eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
};
