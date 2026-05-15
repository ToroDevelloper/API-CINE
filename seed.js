require('dotenv').config();
const mongoose = require('mongoose');
const Pelicula = require('./src/models/Pelicula');
const Usuario = require('./src/models/Usuario');
const Sala = require('./src/models/Sala');
const Asiento = require('./src/models/Asiento');
const Funcion = require('./src/models/Funcion');
const Snack = require('./src/models/Snack');
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
    },
    {
        titulo: 'Dragon ball Super: Broly',
        sinopsis: 'Tras el Torneo de Poder, la Tierra vive en paz hasta que Goku y Vegeta enfrentan a Broly, un poderoso saiyan exiliado con un poder incontrolable. Freezer, buscando venganza, trae a Broly y a su padre Paragus a la Tierra, desencadenando una batalla épica que reescribe la historia y el origen de los saiyans.',
        duracion_min: 100,
        generos: ['Acción', 'Drama','Animado','Ciencia Ficción'],
        idioma: 'Español latino',
        clasificacion: 'PG-13',
        fecha_estreno: new Date('2022-05-14'),
        poster_url: 'https://static.wikia.nocookie.net/dragonball/images/f/fb/Dragon_Ball_Super_Broly_poster.png/revision/latest?cb=20180709221734&path-prefix=es',
        activa: true

    }
];

const salas = [
    { nombre: 'Sala 1 - Estándar', capacidad: 50, tipo: '2D', activa: true },
    { nombre: 'Sala 2 - Estándar', capacidad: 50, tipo: '2D', activa: true },
    { nombre: 'Sala 3 - 3D', capacidad: 40, tipo: '3D', activa: true },
    { nombre: 'Sala 4 - IMAX', capacidad: 30, tipo: 'IMAX', activa: true },
    { nombre: 'Sala 5 - VIP', capacidad: 20, tipo: 'VIP', activa: true },
];

const generarAsientos = (salaId, tipo) => {
    const filas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const asientos = [];
    
    for (const fila of filas) {
        const numAsientos = fila <= 'D' ? 8 : 6;
        for (let num = 1; num <= numAsientos; num++) {
            let asientoTipo = 'normal';
            if (tipo === 'VIP') {
                asientoTipo = 'vip';
            } else if (fila === 'A' || fila === 'B') {
                asientoTipo = 'preferencial';
            } else if (num <= 2 || num > numAsientos - 2) {
                asientoTipo = 'pareja';
            }
            
            asientos.push({
                sala_id: salaId,
                fila,
                numero: num,
                tipo: asientoTipo
            });
        }
    }
    return asientos;
};

const funciones = (peliculas, salas) => {
    const funcs = [];
    const precios = { '2D': 8, '3D': 12, 'IMAX': 18, '4DX': 22, 'VIP': 25 };
    const salaTipoToFormato = { '2D': '2D', '3D': '3D', 'IMAX': 'IMAX', '4DX': '4DX', 'VIP': '2D' };

    peliculas.forEach((peli, i) => {
        const salaIndex = i % salas.length;
        const precioBase = precios[salas[salaIndex].tipo] || 8;

        const hoy = new Date();
        const horas = [14, 17, 20, 15, 18, 21, 14, 17, 20, 16, 19, 22, 13, 16, 20, 14, 18, 21];
        const fechas = horas.map((h, i) => {
            const d = new Date(hoy);
            d.setDate(d.getDate() + Math.floor(i / 3));
            d.setHours(h, 0, 0, 0);
            return d;
        });

        const baseIdx = i * 3;
        const formato = salaTipoToFormato[salas[salaIndex].tipo] || '2D';

        for (let j = 0; j < 3; j++) {
            funcs.push({
                pelicula_id: peli._id,
                sala_id: salas[salaIndex]._id,
                fecha_hora: fechas[baseIdx + j],
                precio_base: precioBase,
                idioma: j === 1 ? 'subtitulada' : 'español',
                formato,
                activa: true
            });
        }
    });

    return funcs;
};

const snacks = [
    {
        nombre: 'Palomitas Grandes',
        descripcion: 'Palomitas de maíz grandes con mantequilla',
        precio: 6.50,
        categoria: 'palomitas',
        imagen_url: 'https://static.vecteezy.com/system/resources/previews/069/647/390/non_2x/a-large-striped-popcorn-bucket-overflowing-with-fresh-popcorn-on-a-colorful-blurred-background-photo.jpg',
        disponible: true
    },
    {
        nombre: 'Palomitas Medianas',
        descripcion: 'Palomitas de maíz medianas con mantequilla',
        precio: 4.50,
        categoria: 'palomitas',
        imagen_url: 'https://foodhero.org/sites/foodhero-prod/files/recipe-imgs/Stovetop%20Popcorn_Sp_v_WM.png',
        disponible: true
    },
    {
        nombre: 'Palomitas Caramelizadas',
        descripcion: 'Palomitas dulces con caramelo',
        precio: 7.00,
        categoria: 'palomitas',
        imagen_url: 'https://img-global.cpcdn.com/recipes/55d304653be7fa2d/1200x630cq80/photo.jpg',
        disponible: true
    },
    {
        nombre: 'Coca-Cola 500ml',
        descripcion: 'Refresco Coca-Cola frío',
        precio: 3.50,
        categoria: 'bebidas',
        imagen_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300',
        disponible: true
    },
    {
        nombre: 'Agua Mineral',
        descripcion: 'Agua mineral sin gas 500ml',
        precio: 2.00,
        categoria: 'bebidas',
        imagen_url: 'https://hatsu.co/wp-content/uploads/2026/04/Banners-Web-HATSU-03.jpg',
        disponible: true
    },
    {
        nombre: 'Cerveza Artesanal',
        descripcion: 'Cerveza artesanal local 355ml',
        precio: 5.00,
        categoria: 'bebidas',
        imagen_url: 'https://www.revistacompensar.com/wp-content/uploads/2021/08/cerveza-artesanal.jpg',
        disponible: true
    },
    {
        nombre: 'Nachos con Queso',
        descripcion: 'Nachos crujientes con salsa de queso',
        precio: 5.50,
        categoria: 'nachos',
        imagen_url: 'https://i.pinimg.com/736x/10/b7/07/10b7076561649cf63c0b4c7f281760db.jpg',
        disponible: true
    },
    {
        nombre: 'Hot Dog',
        descripcion: 'Hot dog clásico con mostaza y ketchup',
        precio: 4.00,
        categoria: 'otros',
        imagen_url: 'https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/21861ad1f03b6136a02bf810234cd666/Derivates/d257bb4fe192628f00a98b1f08a7976fbf7f21d4.jpg',
        disponible: true
    },
    {
        nombre: 'Chocolate Bar',
        descripcion: 'Barra de chocolate con leche',
        precio: 2.50,
        categoria: 'dulces',
        imagen_url: 'https://royceindia.com/cdn/shop/files/ChocolateBarBlack_1.webp?v=1705398052&width=1080',
        disponible: true
    },
    {
        nombre: 'Combo Pareja',
        descripcion: '2 Palomitas grandes + 2 Bebidas + 1 Chocolate',
        precio: 18.00,
        categoria: 'combos',
        imagen_url: 'https://static.promodescuentos.com/threads/raw/Y2zwx/849354_1/re/768x768/qt/60/849354_1.jpg',
        disponible: true
    },
    {
        nombre: 'Combo Familiar',
        descripcion: '4 Palomitas grandes + 4 Bebidas + 2 Chocolates',
        precio: 32.00,
        categoria: 'combos',
        imagen_url: 'https://cdn.inoutdelivery.com/cinecolombia.inoutdelivery.com/sm/1709247865188-6.Mega-Combo.png',
        disponible: true
    },
    {
        nombre: 'M&Ms',
        descripcion: 'Bolsa de M&Ms de chocolate',
        precio: 2.00,
        categoria: 'dulces',
        imagen_url: 'https://pbs.twimg.com/media/FKq1-TBXsAMch9J.jpg',
        disponible: true
    }
];

const adminSeed = {
    nombre: process.env.SEED_ADMIN_NOMBRE || 'Administrador',
    apellido: process.env.SEED_ADMIN_APELLIDO || 'Sistema',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@cine.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin1234',
    rol: 'admin'
};

const userSeed = {
    nombre: 'Usuario',
    apellido: 'Prueba',
    email: 'user@cine.com',
    password: 'User1234',
    rol: 'cliente'
};

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB conectado');
        
        await Pelicula.deleteMany({});
        console.log('Películas borradas');
        
        const peliculasInsertadas = await Pelicula.insertMany(peliculas);
        console.log(`${peliculasInsertadas.length} Películas insertadas`);

        await Sala.deleteMany({});
        console.log('Salas borradas');
        
        const salasInsertadas = await Sala.insertMany(salas);
        console.log(`${salasInsertadas.length} Salas insertadas`);

        await Asiento.deleteMany({});
        console.log('Asientos borrados');
        
        let totalAsientos = 0;
        for (const sala of salasInsertadas) {
            const asientosSala = generarAsientos(sala._id, sala.tipo);
            await Asiento.insertMany(asientosSala);
            totalAsientos += asientosSala.length;
        }
        console.log(`${totalAsientos} Asientos insertados`);

        await Funcion.deleteMany({});
        console.log('Funciones borradas');
        
        const funcionesData = funciones(peliculasInsertadas, salasInsertadas);
        const funcionesInsertadas = await Funcion.insertMany(funcionesData);
        console.log(`${funcionesInsertadas.length} Funciones insertadas`);

        await Snack.deleteMany({});
        console.log('Snacks borrados');
        
        const snacksInsertados = await Snack.insertMany(snacks);
        console.log(`${snacksInsertados.length} Snacks insertados`);

        const adminHash = await bcrypt.hash(adminSeed.password, 12);
        await Usuario.findOneAndUpdate(
            { email: adminSeed.email },
            {
                $set: {
                    nombre: adminSeed.nombre,
                    apellido: adminSeed.apellido,
                    password_hash: adminHash,
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
        console.log(`Admin listo: ${adminSeed.email}`);

        const userHash = await bcrypt.hash(userSeed.password, 12);
        await Usuario.findOneAndUpdate(
            { email: userSeed.email },
            {
                $set: {
                    nombre: userSeed.nombre,
                    apellido: userSeed.apellido,
                    password_hash: userHash,
                    rol: userSeed.rol,
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
        console.log(`Usuario cliente listo: ${userSeed.email}`);
        
        console.log('\n Seed completado exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

seedDB();
