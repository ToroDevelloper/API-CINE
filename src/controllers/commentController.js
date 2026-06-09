const Comment = require('../models/Comment');
const Pelicula = require('../models/Pelicula');

exports.getComments = async (req, res, next) => {
    try {
        const filter = req.params.movieId ? { movie: req.params.movieId } : {};
        const comments = await Comment.find(filter).populate('user', 'nombre');
        res.status(200).json({ success: true, count: comments.length, data: comments });
    } catch (error) {
        next(error);
    }
};

exports.createComment = async (req, res, next) => {
    try {
        req.body.user = req.usuario._id;
        
        if (req.params.movieId) {
            req.body.movie = req.params.movieId;
            const movie = await Pelicula.findById(req.params.movieId);
            if (!movie) {
                return res.status(404).json({ success: false, error: 'Película no encontrada' });
            }
        } else if (!req.body.movie) {
            return res.status(400).json({ success: false, error: 'Se requiere el ID de la película' });
        }

        const comment = await Comment.create(req.body);
        res.status(201).json({ success: true, data: comment });
    } catch (error) {
        next(error);
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ success: false, error: 'Comentario no encontrado' });
        }
        if (comment.user.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ success: false, error: 'No autorizado para eliminar este comentario' });
        }
        await comment.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
