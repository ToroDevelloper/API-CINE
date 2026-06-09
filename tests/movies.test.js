const request = require('supertest');
const app = require('../src/index');
const db = require('./setup');
const Usuario = require('../src/models/Usuario');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Movies Endpoints', () => {
    let cookies, peliculaId;

    beforeEach(async () => {
        await request(app).post('/api/auth/registro').send({
            nombre: 'Admin', apellido: 'User', email: 'admin@test.com', password: 'password123'
        });
        await Usuario.findOneAndUpdate({ email: 'admin@test.com' }, { rol: 'admin' });
        const resAdmin = await request(app).post('/api/auth/login').send({
            email: 'admin@test.com', password: 'password123'
        });
        cookies = resAdmin.headers['set-cookie'];

        const resMovie = await request(app).post('/api/peliculas').set('Cookie', cookies).send({
            titulo: 'Movie Test', sinopsis: 'S', duracion_min: 100, idioma: 'ES', clasificacion: 'A', fecha_estreno: '2023-01-01'
        });
        peliculaId = resMovie.body.data._id;
    });

    it('debe obtener las peliculas', async () => {
        const res = await request(app).get('/api/peliculas');
        expect(res.statusCode).toBe(200);
    });

    it('debe crear una pelicula', async () => {
        const res = await request(app).post('/api/peliculas').set('Cookie', cookies).send({
            titulo: 'Movie Test 2', sinopsis: 'S', duracion_min: 100, idioma: 'ES', clasificacion: 'A', fecha_estreno: '2023-01-01'
        });
        expect(res.statusCode).toBe(201);
    });

    it('debe obtener una pelicula por id', async () => {
        const res = await request(app).get(`/api/peliculas/${peliculaId}`);
        expect(res.statusCode).toBe(200);
    });

    it('debe actualizar una pelicula', async () => {
        const res = await request(app).put(`/api/peliculas/${peliculaId}`).set('Cookie', cookies).send({
            titulo: 'Updated Movie'
        });
        expect(res.statusCode).toBe(200);
    });

    it('debe eliminar una pelicula', async () => {
        const res = await request(app).delete(`/api/peliculas/${peliculaId}`).set('Cookie', cookies);
        expect(res.statusCode).toBe(200);
    });

    it('debe devolver 404 para pelicula no encontrada', async () => {
        const res = await request(app).get('/api/peliculas/6a28761e1e7546179b4bb399');
        expect(res.statusCode).toBe(404);
    });
});
