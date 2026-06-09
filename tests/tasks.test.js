const request = require('supertest');
const app = require('../src/index');
const db = require('./setup');
const Usuario = require('../src/models/Usuario');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Tasks & Comments Endpoints', () => {
    let cookies, adminCookies, movieId;

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
        movieId = movie.body.data._id;
    });

    describe('Tasks', () => {
        it('debe crear una tarea', async () => {
            const res = await request(app).post('/api/tasks').set('Cookie', cookies).send({
                title: 'Tarea 1', description: 'Desc 1'
            });
            expect(res.statusCode).toBe(201);
        });

        it('debe obtener las tareas del usuario', async () => {
            await request(app).post('/api/tasks').set('Cookie', cookies).send({
                title: 'Tarea 1', description: 'Desc 1'
            });
            const res = await request(app).get('/api/tasks').set('Cookie', cookies);
            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(1);
        });

        it('debe actualizar la tarea', async () => {
            const task = await request(app).post('/api/tasks').set('Cookie', cookies).send({
                title: 'Tarea 1', description: 'Desc 1'
            });
            const res = await request(app).put(`/api/tasks/${task.body.data._id}`).set('Cookie', cookies).send({
                completed: true
            });
            expect(res.statusCode).toBe(200);
            expect(res.body.data.completed).toBe(true);
        });

        it('debe eliminar la tarea', async () => {
            const task = await request(app).post('/api/tasks').set('Cookie', cookies).send({
                title: 'Tarea 1', description: 'Desc 1'
            });
            const res = await request(app).delete(`/api/tasks/${task.body.data._id}`).set('Cookie', cookies);
            expect(res.statusCode).toBe(200);
        });
    });

    describe('Comments', () => {
        it('debe crear un comentario', async () => {
            const res = await request(app).post('/api/comments').set('Cookie', cookies).send({
                content: 'Buenisima', movie: movieId
            });
            expect(res.statusCode).toBe(201);
        });

        it('debe obtener comentarios', async () => {
            await request(app).post('/api/comments').set('Cookie', cookies).send({
                content: 'Buenisima', movie: movieId
            });
            const res = await request(app).get('/api/comments');
            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(1);
        });

        it('debe eliminar comentario propio', async () => {
            const comment = await request(app).post('/api/comments').set('Cookie', cookies).send({
                content: 'Buenisima', movie: movieId
            });
            const res = await request(app).delete(`/api/comments/${comment.body.data._id}`).set('Cookie', cookies);
            expect(res.statusCode).toBe(200);
        });
    });
});
