require('dotenv').config();
const mongoose = require('mongoose');
const Pelicula = require('./src/models/Pelicula');
const Usuario = require('./src/models/Usuario');
const bcrypt = require('bcryptjs');

const peliculas = [
    {
        titulo: 'Avatar: El Camino del Agua',
        sinopsis: 'Jake Sully vive con su familia en Pandora. Cuando los RDA regresan, deben dejar su hogar y explorar nuevas regiones.',
        duracion_min: 192,
        generos: ['Ciencia Ficción', 'Acción', 'Aventura'],
        idioma: 'Inglés',
        clasificacion: 'PG-13',
        fecha_estreno: new Date('2022-12-16'),
        poster_url: 'https://i.redd.it/mxgifuk46jx91.jpg',
        activa: true
    },
    {
        titulo: 'Top Gun: Maverick',
        sinopsis: 'Después de más de 30 años de servicio, Pete Maverick Mitchell sigue empujando los límites como piloto de pruebas de la Marina.',
        duracion_min: 130,
        generos: ['Acción', 'Drama'],
        idioma: 'Inglés',
        clasificacion: 'PG-13',
        fecha_estreno: new Date('2022-05-27'),
        poster_url: 'https://i.redd.it/5d7pxlv8eax81.jpg',
        activa: true
    },
    {
        titulo: 'Barbie',
        sinopsis: 'Barbie vive una vida perfecta en Barbieland. Sin embargo, un día se comienza a preguntar sobre la mortalidad.',
        duracion_min: 114,
        generos: ['Comedia', 'Aventura', 'Fantasía'],
        idioma: 'Inglés',
        clasificacion: 'PG-13',
        fecha_estreno: new Date('2023-07-21'),
        poster_url: 'https://image.tmdb.org/t/p/original/fNtqD4BTFj0Bgo9lyoAtmNFzxHN.jpg',
        activa: true
    },
    {
        titulo: 'Oppenheimer',
        sinopsis: 'La historia de J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica durante la Segunda Guerra Mundial.',
        duracion_min: 180,
        generos: ['Drama', 'Biografía', 'Historia'],
        idioma: 'Inglés',
        clasificacion: 'R',
        fecha_estreno: new Date('2023-07-21'),
        poster_url: 'https://i.redd.it/4nj1l524d1ya1.jpg',
        activa: true
    },
    {
        titulo: 'The Batman',
        sinopsis: 'Batman se embarca en una búsqueda psicológica y física a través de la ciudad de Gotham para descubrir la verdad.',
        duracion_min: 176,
        generos: ['Acción', 'Crimen', 'Drama'],
        idioma: 'Inglés',
        clasificacion: 'PG-13',
        fecha_estreno: new Date('2022-03-04'),
        poster_url: 'https://i.imgur.com/FENEQMQ.jpg',
        activa: true
    }
];

const adminSeed = {
    nombre: process.env.SEED_ADMIN_NOMBRE || 'Administrador',
    apellido: process.env.SEED_ADMIN_APELLIDO || 'Sistema',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@cine.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin1234',
    rol: 'admin'
};

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB conectado');
        
        await Pelicula.deleteMany({});
        console.log('Películas borradas');
        
        await Pelicula.insertMany(peliculas);
        console.log('Películas insertadas exitosamente');

        const passwordHash = await bcrypt.hash(adminSeed.password, 12);

        await Usuario.findOneAndUpdate(
            { email: adminSeed.email },
            {
                $set: {
                    nombre: adminSeed.nombre,
                    apellido: adminSeed.apellido,
                    password_hash: passwordHash,
                    rol: adminSeed.rol,
                    activo: true
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        console.log(`Usuario admin listo: ${adminSeed.email}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

seedDB();
