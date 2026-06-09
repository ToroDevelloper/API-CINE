const request = require('supertest');
const app = require('../src/index');
const db = require('./setup');
const Usuario = require('../src/models/Usuario');


beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Reservations Endpoints', () => {
    let cookies, adminCookies, funcionId, asientoId;

    beforeEach(async () => {
        // Register client
        const resUser = await request(app).post('/api/auth/registro').send({
            nombre: 'User', apellido: 'Cliente', email: 'user@test.com', password: 'password123'
        });
        cookies = resUser.headers['set-cookie'];

        // Register admin
        await request(app).post('/api/auth/registro').send({
            nombre: 'Admin', apellido: 'Admin', email: 'admin@test.com', password: 'password123'
        });
        await Usuario.findOneAndUpdate({ email: 'admin@test.com' }, { rol: 'admin' });
        const resAdmin = await request(app).post('/api/auth/login').send({
            email: 'admin@test.com', password: 'password123'
        });
        adminCookies = resAdmin.headers['set-cookie'];

        // Create movie
        const movie = await request(app).post('/api/peliculas').set('Cookie', adminCookies).send({
            titulo: 'Movie 1', sinopsis: 'S', duracion_min: 100, idioma: 'ES', clasificacion: 'A', fecha_estreno: '2023-01-01'
        });

        // Create sala
        const sala = await request(app).post('/api/salas').set('Cookie', adminCookies).send({
            nombre: 'Sala 1', capacidad: 50, tipo: '2D'
        });

        // Create seats
        const asiento = await request(app).post('/api/asientos').set('Cookie', adminCookies).send({
            sala_id: sala.body.data._id, fila: 'A', numero: 1, tipo: 'normal'
        });
        asientoId = asiento.body.data._id;

        // Create funcion
        const funcion = await request(app).post('/api/funciones').set('Cookie', adminCookies).send({
            pelicula_id: movie.body.data._id, sala_id: sala.body.data._id,
            fecha_hora: '2026-12-31T20:00:00.000Z', precio_base: 100
        });
        funcionId = funcion.body.data._id;
    });

    it('debe crear una reserva', async () => {
        const res = await request(app).post('/api/reservas').set('Cookie', cookies).send({
            funcion_id: funcionId,
            asientos_ids: [asientoId]
        });
        expect(res.statusCode).toBe(201);
    });

    it('debe obtener las reservas', async () => {
        const res = await request(app).get('/api/reservas/mis-reservas').set('Cookie', cookies);
        expect(res.statusCode).toBe(200);
    });
});
