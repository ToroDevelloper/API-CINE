const request = require('supertest');
const app = require('../src/index');

describe('API Routes', () => {
    describe('GET /', () => {
        it('deberia retornar el mensaje de bienvenida y estado 200', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('API de Cine - Bienvenido');
        });
    });

    describe('GET /health', () => {
        it('deberia retornar estado saludable para Render', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.status).toBe('ok');
        });
    });

    describe('GET /api', () => {
        it('deberia retornar 404 para una ruta de API inexistente', async () => {
            const res = await request(app).get('/api/ruta-que-no-existe');
            expect(res.statusCode).toBe(404);
        });
    });
});
