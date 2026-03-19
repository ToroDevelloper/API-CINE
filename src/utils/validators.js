/**
 * validators.js
 * Funciones de validación reutilizables para los controladores de la API.
 */

/**
 * Valida que los campos requeridos para crear una reserva estén presentes
 * y tengan el formato correcto antes de persistir en MongoDB.
 *
 * @param {Object} datos - Objeto con los campos del body de la petición.
 * @param {string}   datos.funcion_id   - ID de la función (MongoId).
 * @param {Array}    datos.asientos_ids - Array de IDs de asientos (mínimo 1).
 * @returns {{ valido: boolean, errores: string[] }}
 */
const validarReserva = ({ funcion_id, asientos_ids }) => {
    const errores = [];

    // ── funcion_id ────────────────────────────────────────────────────────────
    if (!funcion_id || typeof funcion_id !== 'string' || funcion_id.trim() === '') {
        errores.push('El campo funcion_id es obligatorio y no puede estar vacío.');
    }

    // ── asientos_ids ──────────────────────────────────────────────────────────
    if (!asientos_ids) {
        errores.push('El campo asientos_ids es obligatorio.');
    } else if (!Array.isArray(asientos_ids)) {
        errores.push('El campo asientos_ids debe ser un arreglo de IDs.');
    } else if (asientos_ids.length === 0) {
        errores.push('Debes seleccionar al menos un asiento para la reserva.');
    } else {
        // Verificar que cada elemento del arreglo sea un string no vacío
        const invalidos = asientos_ids.filter(
            (id) => typeof id !== 'string' || id.trim() === ''
        );
        if (invalidos.length > 0) {
            errores.push(
                `Se encontraron ${invalidos.length} ID(s) de asiento inválido(s) en el arreglo.`
            );
        }
    }

    return {
        valido: errores.length === 0,
        errores
    };
};

/**
 * Valida que el estado proporcionado para actualizar una reserva sea uno
 * de los valores permitidos por el modelo.
 *
 * @param {string} estado - Nuevo estado a asignar.
 * @returns {{ valido: boolean, errores: string[] }}
 */
const validarEstadoReserva = (estado) => {
    const errores = [];
    const estadosPermitidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];

    if (!estado || typeof estado !== 'string' || estado.trim() === '') {
        errores.push('El campo estado es obligatorio y no puede estar vacío.');
    } else if (!estadosPermitidos.includes(estado.trim())) {
        errores.push(
            `Estado inválido: "${estado}". Los valores permitidos son: ${estadosPermitidos.join(', ')}.`
        );
    }

    return {
        valido: errores.length === 0,
        errores
    };
};

module.exports = {
    validarReserva,
    validarEstadoReserva
};
