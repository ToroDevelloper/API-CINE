const request = require('supertest');
const app = require('../src/index');
const db = require('./setup');


beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Auth Endpoints', () => {
    describe('POST /api/auth/registro', () => {
        it('debe registrar un usuario exitosamente', async () => {
            const res = await request(app).post('/api/auth/registro').send({
                nombre: 'Test',
                apellido: 'User',
                email: 'test@example.com',
                password: 'password123'
            });
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.headers['set-cookie']).toBeDefined();
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/auth/registro').send({
                nombre: 'Test',
                apellido: 'User',
                email: 'test@example.com',
                password: 'password123'
            });
        });

        it('debe loguearse exitosamente con credenciales correctas', async () => {
            const res = await request(app).post('/api/auth/login').send({
                email: 'test@example.com',
                password: 'password123'
            });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it('debe fallar con credenciales incorrectas', async () => {
            const res = await request(app).post('/api/auth/login').send({
                email: 'test@example.com',
                password: 'wrongpassword'
            });
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/me', () => {
        it('debe devolver 401 si no hay token', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('debe devolver 401 si el token es invalido', async () => {
            const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalidtoken');
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('debe obtener el usuario actual con un token valido', async () => {
            const registerRes = await request(app).post('/api/auth/registro').send({
                nombre: 'Test',
                apellido: 'User',
                email: 'test@example.com',
                password: 'password123'
            });
            const cookies = registerRes.headers['set-cookie'];

            const res = await request(app).get('/api/auth/me').set('Cookie', cookies);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe('test@example.com');
        });
    });
});
