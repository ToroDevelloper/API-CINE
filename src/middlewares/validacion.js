const { validationResult } = require('express-validator');

// Middleware para validar resultados de express-validator
const validarCampos = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                campo: err.path,
                mensaje: err.msg
            }))
        });
    }
    
    next();
};

module.exports = {
    validarCampos
};
