const request = require('supertest');
const app = require('../src/index');
const db = require('./setup');
const Usuario = require('../src/models/Usuario');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Usuarios Endpoints', () => {
    let adminCookies, userId;

    beforeEach(async () => {
        const user = await request(app).post('/api/auth/registro').send({
            nombre: 'User', apellido: 'Cliente', email: 'user@test.com', password: 'password123'
        });
        userId = user.body.data._id;

        await request(app).post('/api/auth/registro').send({
            nombre: 'Admin', apellido: 'Admin', email: 'admin@test.com', password: 'password123'
        });
        await Usuario.findOneAndUpdate({ email: 'admin@test.com' }, { rol: 'admin' });
        const resAdmin = await request(app).post('/api/auth/login').send({
            email: 'admin@test.com', password: 'password123'
        });
        adminCookies = resAdmin.headers['set-cookie'];
    });

    it('debe obtener todos los usuarios', async () => {
        const res = await request(app).get('/api/usuarios').set('Cookie', adminCookies);
        expect(res.statusCode).toBe(200);
    });

    it('debe obtener un usuario por id', async () => {
        const res = await request(app).get(`/api/usuarios/${userId}`).set('Cookie', adminCookies);
        expect(res.statusCode).toBe(200);
    });

    it('debe actualizar un usuario', async () => {
        const res = await request(app).put(`/api/usuarios/${userId}`).set('Cookie', adminCookies).send({
            rol: 'empleado'
        });
        expect(res.statusCode).toBe(200);
    });

    it('debe eliminar un usuario', async () => {
        const res = await request(app).delete(`/api/usuarios/${userId}`).set('Cookie', adminCookies);
        expect(res.statusCode).toBe(200);
    });
});
