const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'El contenido es obligatorio']
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pelicula',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Comment', commentSchema);
