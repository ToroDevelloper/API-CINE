const Pelicula = require('../models/Pelicula');

// @desc    Obtener todas las películas
// @route   GET /api/peliculas
// @access  Public
exports.getPeliculas = async (req, res, next) => {
    try {
        const filtro = {};
        if (req.query.genero) filtro.generos = { $in: [req.query.genero] };
        if (req.query.clasificacion) filtro.clasificacion = req.query.clasificacion;
        if (req.query.activa) filtro.activa = req.query.activa === 'true';
        if (req.query.buscar) {
            filtro.$text = { $search: req.query.buscar };
        }

        const peliculas = await Pelicula.find(filtro).sort({ fecha_estreno: -1 });

        res.status(200).json({
            success: true,
            count: peliculas.length,
            data: peliculas
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener una película por ID
// @route   GET /api/peliculas/:id
// @access  Public
exports.getPelicula = async (req, res, next) => {
    try {
        const pelicula = await Pelicula.findById(req.params.id);

        if (!pelicula) {
            return res.status(404).json({
                success: false,
                message: 'Película no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: pelicula
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Crear película
// @route   POST /api/peliculas
// @access  Private/Admin
exports.createPelicula = async (req, res, next) => {
    try {
        const pelicula = await Pelicula.create(req.body);

        res.status(201).json({
            success: true,
            data: pelicula
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar película
// @route   PUT /api/peliculas/:id
// @access  Private/Admin
exports.updatePelicula = async (req, res, next) => {
    try {
        const pelicula = await Pelicula.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!pelicula) {
            return res.status(404).json({
                success: false,
                message: 'Película no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: pelicula
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar película
// @route   DELETE /api/peliculas/:id
// @access  Private/Admin
exports.deletePelicula = async (req, res, next) => {
    try {
        const pelicula = await Pelicula.findByIdAndUpdate(
            req.params.id,
            { activa: false },
            { new: true }
        );

        if (!pelicula) {
            return res.status(404).json({
                success: false,
                message: 'Película no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Película desactivada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener películas en cartelera
// @route   GET /api/peliculas/cartelera
// @access  Public
exports.getCartelera = async (req, res, next) => {
    try {
        const hoy = new Date();
        const peliculas = await Pelicula.find({
            activa: true,
            fecha_estreno: { $lte: hoy }
        }).sort({ fecha_estreno: -1 });

        res.status(200).json({
            success: true,
            count: peliculas.length,
            data: peliculas
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener próximos estrenos
// @route   GET /api/peliculas/proximos-estrenos
// @access  Public
exports.getProximosEstrenos = async (req, res, next) => {
    try {
        const hoy = new Date();
        const peliculas = await Pelicula.find({
            activa: true,
            fecha_estreno: { $gt: hoy }
        }).sort({ fecha_estreno: 1 });

        res.status(200).json({
            success: true,
            count: peliculas.length,
            data: peliculas
        });
    } catch (error) {
        next(error);
    }
};
