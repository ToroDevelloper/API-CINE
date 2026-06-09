const request = require('supertest');
const app = require('../src/index');
const db = require('./setup');
const Usuario = require('../src/models/Usuario');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Salas Endpoints', () => {
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

    it('debe crear una sala', async () => {
        const res = await request(app).post('/api/salas').set('Cookie', adminCookies).send({
            nombre: 'Sala VIP', capacidad: 30, tipo: 'VIP'
        });
        expect(res.statusCode).toBe(201);
    });

    it('debe obtener las salas', async () => {
        await request(app).post('/api/salas').set('Cookie', adminCookies).send({
            nombre: 'Sala VIP', capacidad: 30, tipo: 'VIP'
        });
        const res = await request(app).get('/api/salas');
        expect(res.statusCode).toBe(200);
    });

    it('debe actualizar una sala', async () => {
        const sala = await request(app).post('/api/salas').set('Cookie', adminCookies).send({
            nombre: 'Sala VIP', capacidad: 30, tipo: 'VIP'
        });
        const res = await request(app).put(`/api/salas/${sala.body.data._id}`).set('Cookie', adminCookies).send({
            capacidad: 40
        });
        expect(res.statusCode).toBe(200);
    });

    it('debe eliminar una sala', async () => {
        const sala = await request(app).post('/api/salas').set('Cookie', adminCookies).send({
            nombre: 'Sala VIP', capacidad: 30, tipo: 'VIP'
        });
        const res = await request(app).delete(`/api/salas/${sala.body.data._id}`).set('Cookie', adminCookies);
        expect(res.statusCode).toBe(200);
    });
});
