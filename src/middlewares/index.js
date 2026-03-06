const { protegerRuta, autorizarRoles } = require('./auth');
const { errorHandler, notFound } = require('./errorHandler');
const { validarCampos } = require('./validacion');

module.exports = {
    protegerRuta,
    autorizarRoles,
    errorHandler,
    notFound,
    validarCampos
};
