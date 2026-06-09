const Task = require('../models/Task');

exports.getTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({ user: req.usuario._id });
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        next(error);
    }
};

exports.createTask = async (req, res, next) => {
    try {
        req.body.user = req.usuario._id;
        const task = await Task.create(req.body);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

exports.updateTask = async (req, res, next) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Tarea no encontrada' });
        }
        if (task.user.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ success: false, error: 'No autorizado para actualizar esta tarea' });
        }
        task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Tarea no encontrada' });
        }
        if (task.user.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ success: false, error: 'No autorizado para eliminar esta tarea' });
        }
        await task.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
