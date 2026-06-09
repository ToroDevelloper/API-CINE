const request = require('supertest');
const app = require('../src/index');
const db = require('./setup');
const Usuario = require('../src/models/Usuario');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Snacks Endpoints', () => {
    let adminCookies;

    beforeEach(async () => {
        await request(app).post('/api/auth/registro').send({
            nombre: 'Admin', apellido: 'Admin', email: 'admin@test.com', password: 'password123'
        });
        await Usuario.findOneAndUpdate({ email: 'admin@test.com' }, { rol: 'admin' });
        const resAdmin = await request(app).post('/api/auth/login').send({
            email: 'admin@test.com', password: 'password123'
        });
        adminCookies = resAdmin.headers['set-cookie'];
    });

    it('debe crear un snack', async () => {
        const res = await request(app).post('/api/snacks').set('Cookie', adminCookies).send({
            nombre: 'Palomitas', precio: 50, categoria: 'palomitas'
        });
        expect(res.statusCode).toBe(201);
    });

    it('debe obtener los snacks', async () => {
        await request(app).post('/api/snacks').set('Cookie', adminCookies).send({
            nombre: 'Palomitas', precio: 50, categoria: 'palomitas'
        });
        const res = await request(app).get('/api/snacks');
        expect(res.statusCode).toBe(200);
    });

    it('debe actualizar un snack', async () => {
        const snack = await request(app).post('/api/snacks').set('Cookie', adminCookies).send({
            nombre: 'Palomitas', precio: 50, categoria: 'palomitas'
        });
        const res = await request(app).put(`/api/snacks/${snack.body.data._id}`).set('Cookie', adminCookies).send({
            precio: 60
        });
        expect(res.statusCode).toBe(200);
    });

    it('debe eliminar un snack', async () => {
        const snack = await request(app).post('/api/snacks').set('Cookie', adminCookies).send({
            nombre: 'Palomitas', precio: 50, categoria: 'palomitas'
        });
        const res = await request(app).delete(`/api/snacks/${snack.body.data._id}`).set('Cookie', adminCookies);
        expect(res.statusCode).toBe(200);
    });
});
