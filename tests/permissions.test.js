const request = require('supertest');
const app = require('../src/index');
const db = require('./setup');
const Usuario = require('../src/models/Usuario');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Permissions Endpoints (403 Forbidden)', () => {
    it('debe denegar acceso si el usuario autenticado no tiene rol admin', async () => {
        // Register cliente
        const resCliente = await request(app).post('/api/auth/registro').send({
            nombre: 'Cliente',
            apellido: 'Cliente',
            email: 'cliente@example.com',
            password: 'password123'
        });
        const cookies = resCliente.headers['set-cookie'];

        // Try creating a pelicula
        const res = await request(app).post('/api/peliculas').set('Cookie', cookies).send({
            titulo: 'Pelicula de prueba',
            sinopsis: 'Sinopsis',
            duracion_min: 120,
            idioma: 'Español',
            clasificacion: 'A',
            fecha_estreno: '2023-01-01'
        });

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it('debe permitir acceso si el usuario es admin', async () => {
        // Register
        await request(app).post('/api/auth/registro').send({
            nombre: 'Admin',
            apellido: 'Admin',
            email: 'admin@example.com',
            password: 'password123'
        });
        
        // Change role to admin manually
        await Usuario.findOneAndUpdate({ email: 'admin@example.com' }, { rol: 'admin' });
        
        // Login again to get token
        const resLogin = await request(app).post('/api/auth/login').send({
            email: 'admin@example.com',
            password: 'password123'
        });
        const adminCookies = resLogin.headers['set-cookie'];

        // Try creating a pelicula
        const res = await request(app).post('/api/peliculas').set('Cookie', adminCookies).send({
            titulo: 'Pelicula de prueba',
            sinopsis: 'Sinopsis',
            duracion_min: 120,
            idioma: 'Español',
            clasificacion: 'A',
            fecha_estreno: '2023-01-01'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });
});
