/* eslint-disable jest/no-conditional-expect */
const request = require('supertest');
const app = require('../src/index');
const db = require('./setup');
const Usuario = require('../src/models/Usuario');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('404 Error Cases Endpoints', () => {
    let adminCookies;
    const fakeId = '605c72ef2f8fb814b56fa18a';

    beforeEach(async () => {
        await request(app).post('/api/auth/registro').send({
            nombre: 'Admin', apellido: 'User', email: 'admin@test.com', password: 'password123'
        });
        await Usuario.findOneAndUpdate({ email: 'admin@test.com' }, { rol: 'admin' });
        const resAdmin = await request(app).post('/api/auth/login').send({
            email: 'admin@test.com', password: 'password123'
        });
        adminCookies = resAdmin.headers['set-cookie'];
    });

    const routes = [
        '/api/peliculas',
        '/api/salas',
        '/api/funciones',
        '/api/asientos',
        '/api/snacks',
        '/api/pedidos-snacks',
        '/api/reservas',
        '/api/pagos',
        '/api/tasks',
        '/api/usuarios',
        '/api/comments'
    ];

    it('debe devolver 404 para entidades no encontradas', async () => {
        for (const route of routes) {
            // GET /:id
            if (route !== '/api/asientos') {
                const res1 = await request(app).get(`${route}/${fakeId}`).set('Cookie', adminCookies);
                expect(res1.statusCode).toBe(404);
            }
            
            // PUT /:id
            const res2 = await request(app).put(`${route}/${fakeId}`).set('Cookie', adminCookies).send({});
            expect([400, 404]).toContain(res2.statusCode);
            
            // DELETE /:id
            const res3 = await request(app).delete(`${route}/${fakeId}`).set('Cookie', adminCookies);
            expect(res3.statusCode).toBe(404);
        }
    });
});
