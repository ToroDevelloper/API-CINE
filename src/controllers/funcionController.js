const Funcion = require('../models/Funcion');
const Pelicula = require('../models/Pelicula');
const Sala = require('../models/Sala');

// @desc    Obtener todas las funciones
// @route   GET /api/funciones
// @access  Public
exports.getFunciones = async (req, res, next) => {
    try {
        const filtro = {};
        if (req.query.pelicula_id) filtro.pelicula_id = req.query.pelicula_id;
        if (req.query.sala_id) filtro.sala_id = req.query.sala_id;
        if (req.query.formato) filtro.formato = req.query.formato;
        if (req.query.activa) filtro.activa = req.query.activa === 'true';
        
        // Filtrar por fecha
        if (req.query.fecha) {
            const fecha = new Date(req.query.fecha);
            const inicioDelDia = new Date(fecha.setHours(0, 0, 0, 0));
            const finDelDia = new Date(fecha.setHours(23, 59, 59, 999));
            filtro.fecha_hora = { $gte: inicioDelDia, $lte: finDelDia };
        }

        const funciones = await Funcion.find(filtro)
            .populate('pelicula_id', 'titulo duracion_min poster_url clasificacion')
            .populate('sala_id', 'nombre tipo capacidad')
            .sort({ fecha_hora: 1 });

        res.status(200).json({
            success: true,
            count: funciones.length,
            data: funciones
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener una función por ID
// @route   GET /api/funciones/:id
// @access  Public
exports.getFuncion = async (req, res, next) => {
    try {
        const funcion = await Funcion.findById(req.params.id)
            .populate('pelicula_id')
            .populate('sala_id');

        if (!funcion) {
            return res.status(404).json({
                success: false,
                message: 'Función no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: funcion
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Crear función
// @route   POST /api/funciones
// @access  Private/Admin
exports.createFuncion = async (req, res, next) => {
    try {
        // Verificar que la película existe
        const pelicula = await Pelicula.findById(req.body.pelicula_id);
        if (!pelicula) {
            return res.status(404).json({
                success: false,
                message: 'Película no encontrada'
            });
        }

        // Verificar que la sala existe
        const sala = await Sala.findById(req.body.sala_id);
        if (!sala) {
            return res.status(404).json({
                success: false,
                message: 'Sala no encontrada'
            });
        }

        const funcion = await Funcion.create(req.body);

        res.status(201).json({
            success: true,
            data: funcion
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar función
// @route   PUT /api/funciones/:id
// @access  Private/Admin
exports.updateFuncion = async (req, res, next) => {
    try {
        const funcion = await Funcion.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!funcion) {
            return res.status(404).json({
                success: false,
                message: 'Función no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: funcion
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar función
// @route   DELETE /api/funciones/:id
// @access  Private/Admin
exports.deleteFuncion = async (req, res, next) => {
    try {
        const funcion = await Funcion.findByIdAndUpdate(
            req.params.id,
            { activa: false },
            { new: true }
        );

        if (!funcion) {
            return res.status(404).json({
                success: false,
                message: 'Función no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Función desactivada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener funciones por película
// @route   GET /api/funciones/pelicula/:peliculaId
// @access  Public
exports.getFuncionesPorPelicula = async (req, res, next) => {
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const funciones = await Funcion.find({
            pelicula_id: req.params.peliculaId,
            activa: true,
            fecha_hora: { $gte: hoy }
        })
            .populate('sala_id', 'nombre tipo')
            .sort({ fecha_hora: 1 });

        res.status(200).json({
            success: true,
            count: funciones.length,
            data: funciones
        });
    } catch (error) {
        next(error);
    }
};
