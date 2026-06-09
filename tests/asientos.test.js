const request = require('supertest');
const app = require('../src/index');
const db = require('./setup');
const Usuario = require('../src/models/Usuario');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Asientos Endpoints', () => {
    let adminCookies, salaId;

    beforeEach(async () => {
        await request(app).post('/api/auth/registro').send({
            nombre: 'Admin', apellido: 'Admin', email: 'admin@test.com', password: 'password123'
        });
        await Usuario.findOneAndUpdate({ email: 'admin@test.com' }, { rol: 'admin' });
        const resAdmin = await request(app).post('/api/auth/login').send({
            email: 'admin@test.com', password: 'password123'
        });
        adminCookies = resAdmin.headers['set-cookie'];

        const resSala = await request(app).post('/api/salas').set('Cookie', adminCookies).send({
            nombre: 'Sala 1', capacidad: 50, tipo: '2D'
        });
        salaId = resSala.body.data._id;
    });

    it('debe crear un asiento', async () => {
        const res = await request(app).post('/api/asientos').set('Cookie', adminCookies).send({
            sala_id: salaId, fila: 'A', numero: 1, tipo: 'normal'
        });
        expect(res.statusCode).toBe(201);
    });

    it('debe obtener los asientos', async () => {
        await request(app).post('/api/asientos').set('Cookie', adminCookies).send({
            sala_id: salaId, fila: 'A', numero: 1, tipo: 'normal'
        });
        const res = await request(app).get(`/api/asientos/sala/${salaId}`);
        expect(res.statusCode).toBe(200);
    });

    it('debe actualizar un asiento', async () => {
        const asiento = await request(app).post('/api/asientos').set('Cookie', adminCookies).send({
            sala_id: salaId, fila: 'A', numero: 1, tipo: 'normal'
        });
        const res = await request(app).put(`/api/asientos/${asiento.body.data._id}`).set('Cookie', adminCookies).send({
            estado: 'ocupado'
        });
        expect(res.statusCode).toBe(200);
    });

    it('debe eliminar un asiento', async () => {
        const asiento = await request(app).post('/api/asientos').set('Cookie', adminCookies).send({
            sala_id: salaId, fila: 'A', numero: 1, tipo: 'normal'
        });
        const res = await request(app).delete(`/api/asientos/${asiento.body.data._id}`).set('Cookie', adminCookies);
        expect(res.statusCode).toBe(200);
    });
});
