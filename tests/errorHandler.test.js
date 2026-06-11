const { errorHandler, notFound } = require('../src/middlewares/errorHandler');

describe('Error Handler Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { originalUrl: '/api/test' };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    describe('errorHandler', () => {
        it('should handle CastError (invalid ObjectId) with 404', () => {
            const err = { name: 'CastError', message: 'Cast to ObjectId failed' };
            errorHandler(err, req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Recurso no encontrado' });
        });

        it('should handle duplicate key error (11000) with 400', () => {
            const err = { name: 'MongoServerError', code: 11000, keyValue: { email: 'dup@test.com' } };
            errorHandler(err, req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "El valor del campo 'email' ya existe" });
        });

        it('should handle duplicate key error without keyValue with 400', () => {
            const err = { name: 'MongoServerError', code: 11000 };
            errorHandler(err, req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "El valor del campo 'desconocido' ya existe" });
        });

        it('should handle ValidationError with 400', () => {
            const err = {
                name: 'ValidationError',
                errors: {
                    nombre: { message: 'El nombre es obligatorio' },
                    email: { message: 'Email inválido' }
                }
            };
            errorHandler(err, req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'El nombre es obligatorio, Email inválido'
            });
        });

        it('should handle JsonWebTokenError with 401', () => {
            const err = { name: 'JsonWebTokenError', message: 'invalid token' };
            errorHandler(err, req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Token inválido' });
        });

        it('should handle TokenExpiredError with 401', () => {
            const err = { name: 'TokenExpiredError', message: 'jwt expired' };
            errorHandler(err, req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Token expirado' });
        });

        it('should handle generic errors with 500', () => {
            const err = { message: 'Something went wrong' };
            errorHandler(err, req, res, next);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Something went wrong' });
        });

        it('should use fallback message for 500 when no message', () => {
            const err = {};
            errorHandler(err, req, res, next);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error interno del servidor' });
        });
    });

    describe('notFound', () => {
        it('should return 404 with route info', () => {
            notFound(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Ruta /api/test no encontrada' });
        });
    });
});
