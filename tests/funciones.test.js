const request = require('supertest');
const app = require('../src/index');
const db = require('./setup');
const Usuario = require('../src/models/Usuario');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Funciones Endpoints', () => {
    let adminCookies, movieId, salaId;

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

        const resMovie = await request(app).post('/api/peliculas').set('Cookie', adminCookies).send({
            titulo: 'Movie 1', sinopsis: 'S', duracion_min: 100, idioma: 'ES', clasificacion: 'A', fecha_estreno: '2023-01-01'
        });
        movieId = resMovie.body.data._id;
    });

    it('debe crear una funcion', async () => {
        const res = await request(app).post('/api/funciones').set('Cookie', adminCookies).send({
            pelicula_id: movieId, sala_id: salaId, fecha_hora: '2026-12-31T20:00:00.000Z', precio_base: 100
        });
        expect(res.statusCode).toBe(201);
    });

    it('debe obtener las funciones', async () => {
        await request(app).post('/api/funciones').set('Cookie', adminCookies).send({
            pelicula_id: movieId, sala_id: salaId, fecha_hora: '2026-12-31T20:00:00.000Z', precio_base: 100
        });
        const res = await request(app).get('/api/funciones');
        expect(res.statusCode).toBe(200);
    });

    it('debe actualizar una funcion', async () => {
        const funcion = await request(app).post('/api/funciones').set('Cookie', adminCookies).send({
            pelicula_id: movieId, sala_id: salaId, fecha_hora: '2026-12-31T20:00:00.000Z', precio_base: 100
        });
        const res = await request(app).put(`/api/funciones/${funcion.body.data._id}`).set('Cookie', adminCookies).send({
            precio_base: 120
        });
        expect(res.statusCode).toBe(200);
    });

    it('debe eliminar una funcion', async () => {
        const funcion = await request(app).post('/api/funciones').set('Cookie', adminCookies).send({
            pelicula_id: movieId, sala_id: salaId, fecha_hora: '2026-12-31T20:00:00.000Z', precio_base: 100
        });
        const res = await request(app).delete(`/api/funciones/${funcion.body.data._id}`).set('Cookie', adminCookies);
        expect(res.statusCode).toBe(200);
    });
});
