const { validarReserva, validarEstadoReserva } = require('../src/utils/validators');

describe('validarReserva', () => {
    it('should return error when funcion_id is missing', () => {
        const result = validarReserva({ funcion_id: '', asientos_ids: ['id1'] });
        expect(result.valido).toBe(false);
        expect(result.errores).toContain('El campo funcion_id es obligatorio y no puede estar vacío.');
    });

    it('should return error when funcion_id is not a string', () => {
        const result = validarReserva({ funcion_id: 123, asientos_ids: ['id1'] });
        expect(result.valido).toBe(false);
        expect(result.errores).toContain('El campo funcion_id es obligatorio y no puede estar vacío.');
    });

    it('should return error when asientos_ids is missing', () => {
        const result = validarReserva({ funcion_id: 'abc123' });
        expect(result.valido).toBe(false);
        expect(result.errores).toContain('El campo asientos_ids es obligatorio.');
    });

    it('should return error when asientos_ids is not an array', () => {
        const result = validarReserva({ funcion_id: 'abc123', asientos_ids: 'not-an-array' });
        expect(result.valido).toBe(false);
        expect(result.errores).toContain('El campo asientos_ids debe ser un arreglo de IDs.');
    });

    it('should return error when asientos_ids is empty', () => {
        const result = validarReserva({ funcion_id: 'abc123', asientos_ids: [] });
        expect(result.valido).toBe(false);
        expect(result.errores).toContain('Debes seleccionar al menos un asiento para la reserva.');
    });

    it('should return error when asientos_ids contains invalid entries', () => {
        const result = validarReserva({ funcion_id: 'abc123', asientos_ids: ['valid', '', 123] });
        expect(result.valido).toBe(false);
        expect(result.errores[0]).toContain('ID(s) de asiento inválido(s)');
    });

    it('should pass validation with valid inputs', () => {
        const result = validarReserva({ funcion_id: 'abc123', asientos_ids: ['id1', 'id2'] });
        expect(result.valido).toBe(true);
        expect(result.errores).toEqual([]);
    });
});

describe('validarEstadoReserva', () => {
    it('should return error when estado is missing', () => {
        const result = validarEstadoReserva('');
        expect(result.valido).toBe(false);
        expect(result.errores).toContain('El campo estado es obligatorio y no puede estar vacío.');
    });

    it('should return error when estado is not a string', () => {
        const result = validarEstadoReserva(123);
        expect(result.valido).toBe(false);
        expect(result.errores).toContain('El campo estado es obligatorio y no puede estar vacío.');
    });

    it('should return error when estado is invalid', () => {
        const result = validarEstadoReserva('invalid-status');
        expect(result.valido).toBe(false);
        expect(result.errores[0]).toContain('Estado inválido');
    });

    it('should pass with valid estado "pendiente"', () => {
        const result = validarEstadoReserva('pendiente');
        expect(result.valido).toBe(true);
        expect(result.errores).toEqual([]);
    });

    it('should pass with valid estado "confirmada"', () => {
        const result = validarEstadoReserva('confirmada');
        expect(result.valido).toBe(true);
        expect(result.errores).toEqual([]);
    });

    it('should pass with valid estado "cancelada"', () => {
        const result = validarEstadoReserva('cancelada');
        expect(result.valido).toBe(true);
        expect(result.errores).toEqual([]);
    });

    it('should pass with valid estado "completada"', () => {
        const result = validarEstadoReserva('completada');
        expect(result.valido).toBe(true);
        expect(result.errores).toEqual([]);
    });
});
