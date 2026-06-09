const request = require('supertest');
const app = require('../src/index');
const db = require('./setup');
const Usuario = require('../src/models/Usuario');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Pedidos Endpoints', () => {
    let adminCookies, cookies, snackId;

    beforeEach(async () => {
        const resUser = await request(app).post('/api/auth/registro').send({
            nombre: 'User', apellido: 'Cliente', email: 'user@test.com', password: 'password123'
        });
        cookies = resUser.headers['set-cookie'];

        await request(app).post('/api/auth/registro').send({
            nombre: 'Admin', apellido: 'Admin', email: 'admin@test.com', password: 'password123'
        });
        await Usuario.findOneAndUpdate({ email: 'admin@test.com' }, { rol: 'admin' });
        const resAdmin = await request(app).post('/api/auth/login').send({
            email: 'admin@test.com', password: 'password123'
        });
        adminCookies = resAdmin.headers['set-cookie'];

        const resSnack = await request(app).post('/api/snacks').set('Cookie', adminCookies).send({
            nombre: 'Palomitas', precio: 50, categoria: 'palomitas'
        });
        snackId = resSnack.body.data._id;
    });

    it('debe crear un pedido de snack', async () => {
        const res = await request(app).post('/api/pedidos-snacks').set('Cookie', cookies).send({
            items: [{ snack_id: snackId, cantidad: 2 }]
        });
        expect(res.statusCode).toBe(201);
    });

    it('debe obtener los pedidos del usuario', async () => {
        await request(app).post('/api/pedidos-snacks').set('Cookie', cookies).send({
            items: [{ snack_id: snackId, cantidad: 2 }]
        });
        const res = await request(app).get('/api/pedidos-snacks/mis-pedidos').set('Cookie', cookies);
        expect(res.statusCode).toBe(200);
    });
});
