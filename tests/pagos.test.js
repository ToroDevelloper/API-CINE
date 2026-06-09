const request = require('supertest');
const app = require('../src/index');
const db = require('./setup');
const Usuario = require('../src/models/Usuario');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Pagos Endpoints', () => {
    let adminCookies, cookies, reservaId;

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

        const sala = await request(app).post('/api/salas').set('Cookie', adminCookies).send({
            nombre: 'Sala 1', capacidad: 50, tipo: '2D'
        });

        const movie = await request(app).post('/api/peliculas').set('Cookie', adminCookies).send({
            titulo: 'Movie 1', sinopsis: 'S', duracion_min: 100, idioma: 'ES', clasificacion: 'A', fecha_estreno: '2023-01-01'
        });

        const asiento = await request(app).post('/api/asientos').set('Cookie', adminCookies).send({
            sala_id: sala.body.data._id, fila: 'A', numero: 1, tipo: 'normal'
        });

        const funcion = await request(app).post('/api/funciones').set('Cookie', adminCookies).send({
            pelicula_id: movie.body.data._id, sala_id: sala.body.data._id, fecha_hora: '2026-12-31T20:00:00.000Z', precio_base: 100
        });

        const reserva = await request(app).post('/api/reservas').set('Cookie', cookies).send({
            funcion_id: funcion.body.data._id, asientos_ids: [asiento.body.data._id]
        });
        reservaId = reserva.body.data._id;
    });

    it('debe procesar un pago', async () => {
        const res = await request(app).post('/api/pagos').set('Cookie', cookies).send({
            reserva_id: reservaId, metodo_pago: 'efectivo'
        });
        expect(res.statusCode).toBe(201);
    });

    it('debe obtener los pagos del usuario', async () => {
        await request(app).post('/api/pagos').set('Cookie', cookies).send({
            reserva_id: reservaId, metodo_pago: 'efectivo'
        });
        const res = await request(app).get('/api/pagos/mis-pagos').set('Cookie', cookies);
        expect(res.statusCode).toBe(200);
    });
});
