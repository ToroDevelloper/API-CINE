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

    it('debe obtener un asiento por ID', async () => {
        const asiento = await request(app).post('/api/asientos').set('Cookie', adminCookies).send({
            sala_id: salaId, fila: 'A', numero: 1, tipo: 'normal'
        });
        const res = await request(app).get(`/api/asientos/${asiento.body.data._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.fila).toBe('A');
    });

    it('debe retornar 404 al obtener asiento inexistente', async () => {
        const fakeId = '000000000000000000000000';
        const res = await request(app).get(`/api/asientos/${fakeId}`);
        expect(res.statusCode).toBe(404);
    });

    it('debe retornar 404 al actualizar asiento inexistente', async () => {
        const fakeId = '000000000000000000000000';
        const res = await request(app).put(`/api/asientos/${fakeId}`).set('Cookie', adminCookies).send({
            estado: 'ocupado'
        });
        expect(res.statusCode).toBe(404);
    });

    it('debe retornar 404 al eliminar asiento inexistente', async () => {
        const fakeId = '000000000000000000000000';
        const res = await request(app).delete(`/api/asientos/${fakeId}`).set('Cookie', adminCookies);
        expect(res.statusCode).toBe(404);
    });

    it('debe retornar 404 al crear asiento con sala inexistente', async () => {
        const fakeSalaId = '000000000000000000000000';
        const res = await request(app).post('/api/asientos').set('Cookie', adminCookies).send({
            sala_id: fakeSalaId, fila: 'B', numero: 1, tipo: 'normal'
        });
        expect(res.statusCode).toBe(404);
    });

    it('debe crear asientos en bulk', async () => {
        const res = await request(app).post('/api/asientos/bulk').set('Cookie', adminCookies).send({
            sala_id: salaId, filas: 'A,B', asientosPorFila: 3, tipo: 'normal'
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.count).toBe(6);
    });

    it('debe retornar 404 en bulk con sala inexistente', async () => {
        const fakeSalaId = '000000000000000000000000';
        const res = await request(app).post('/api/asientos/bulk').set('Cookie', adminCookies).send({
            sala_id: fakeSalaId, filas: 'A', asientosPorFila: 2
        });
        expect(res.statusCode).toBe(404);
    });
});
