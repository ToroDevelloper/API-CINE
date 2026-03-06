# 🎬 API de Cine

API REST para un sistema de gestión de cine desarrollada con Node.js, Express y MongoDB (Mongoose).

## 📂 Estructura del Proyecto

```
API-CINE/
├── src/
│   ├── config/
│   │   ├── database.js      # Conexión a MongoDB
│   │   └── index.js         # Configuración general
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── usuarioController.js
│   │   ├── salaController.js
│   │   ├── peliculaController.js
│   │   ├── asientoController.js
│   │   ├── funcionController.js
│   │   ├── reservaController.js
│   │   ├── snackController.js
│   │   ├── pedidoSnackController.js
│   │   └── pagoController.js
│   ├── middlewares/
│   │   ├── auth.js          # Autenticación JWT
│   │   ├── errorHandler.js  # Manejo de errores
│   │   ├── validacion.js    # Validación de campos
│   │   └── index.js
│   ├── models/
│   │   ├── Usuario.js
│   │   ├── Sala.js
│   │   ├── Pelicula.js
│   │   ├── Asiento.js
│   │   ├── Funcion.js
│   │   ├── Reserva.js
│   │   ├── Snack.js
│   │   ├── PedidoSnack.js
│   │   ├── Pago.js
│   │   └── index.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── usuarioRoutes.js
│   │   ├── salaRoutes.js
│   │   ├── peliculaRoutes.js
│   │   ├── asientoRoutes.js
│   │   ├── funcionRoutes.js
│   │   ├── reservaRoutes.js
│   │   ├── snackRoutes.js
│   │   ├── pedidoSnackRoutes.js
│   │   ├── pagoRoutes.js
│   │   └── index.js
│   └── index.js             # Punto de entrada
├── docker-compose.yml       # Contenedor MongoDB
├── package.json
├── .env
└── README.md
```

## 🗄️ Modelo de Datos

El sistema gestiona **9 entidades** relacionadas mediante ObjectId:

| Entidad | Relaciones |
|---------|------------|
| **Usuario** | → Reservas, Pedidos, Pagos |
| **Sala** | → Asientos, Funciones |
| **Pelicula** | → Funciones |
| **Asiento** | → Sala (FK), Reservas |
| **Funcion** | → Pelicula (FK), Sala (FK), Reservas |
| **Reserva** | → Usuario (FK), Funcion (FK), Asientos (FK[]), Pagos |
| **Snack** | → PedidoSnack (items) |
| **PedidoSnack** | → Usuario (FK), Reserva (FK), Snacks |
| **Pago** | → Usuario (FK), Reserva (FK) |

## 🚀 Instalación

### 1. Clonar e instalar dependencias

```bash
cd API-CINE
npm install
```

### 2. Iniciar MongoDB con Docker

```bash
docker-compose up -d
```

### 3. Configurar variables de entorno

El archivo `.env` ya está configurado:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/api_cine
JWT_SECRET=tu_clave_secreta_super_segura_aqui
JWT_EXPIRES_IN=24h
```

### 4. Iniciar el servidor

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

## 📡 Endpoints de la API

Base URL: `http://localhost:3000/api`

### 🔐 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/registro` | Registrar usuario |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/me` | Obtener usuario actual |
| PUT | `/auth/actualizar` | Actualizar datos |
| PUT | `/auth/cambiar-password` | Cambiar contraseña |

### 👥 Usuarios (Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/usuarios` | Listar usuarios |
| GET | `/usuarios/:id` | Obtener usuario |
| PUT | `/usuarios/:id` | Actualizar usuario |
| DELETE | `/usuarios/:id` | Desactivar usuario |

### 🎦 Salas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/salas` | Listar salas |
| GET | `/salas/:id` | Obtener sala |
| POST | `/salas` | Crear sala (Admin) |
| PUT | `/salas/:id` | Actualizar sala (Admin) |
| DELETE | `/salas/:id` | Desactivar sala (Admin) |

### 🎬 Películas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/peliculas` | Listar películas |
| GET | `/peliculas/cartelera` | Películas en cartelera |
| GET | `/peliculas/proximos-estrenos` | Próximos estrenos |
| GET | `/peliculas/:id` | Obtener película |
| POST | `/peliculas` | Crear película (Admin) |
| PUT | `/peliculas/:id` | Actualizar película (Admin) |
| DELETE | `/peliculas/:id` | Desactivar película (Admin) |

### 💺 Asientos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/asientos/sala/:salaId` | Asientos por sala |
| GET | `/asientos/:id` | Obtener asiento |
| POST | `/asientos` | Crear asiento (Admin) |
| POST | `/asientos/bulk` | Crear múltiples asientos (Admin) |
| PUT | `/asientos/:id` | Actualizar asiento (Admin) |
| DELETE | `/asientos/:id` | Eliminar asiento (Admin) |

### 🎟️ Funciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/funciones` | Listar funciones |
| GET | `/funciones/pelicula/:peliculaId` | Funciones por película |
| GET | `/funciones/:id` | Obtener función |
| POST | `/funciones` | Crear función (Admin) |
| PUT | `/funciones/:id` | Actualizar función (Admin) |
| DELETE | `/funciones/:id` | Desactivar función (Admin) |

### 📋 Reservas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/reservas` | Listar reservas (Admin) |
| GET | `/reservas/mis-reservas` | Mis reservas |
| GET | `/reservas/asientos-disponibles/:funcionId` | Asientos disponibles |
| GET | `/reservas/:id` | Obtener reserva |
| POST | `/reservas` | Crear reserva |
| PUT | `/reservas/:id` | Actualizar estado |
| DELETE | `/reservas/:id` | Cancelar reserva |

### 🍿 Snacks

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/snacks` | Listar snacks |
| GET | `/snacks/categoria/:categoria` | Snacks por categoría |
| GET | `/snacks/:id` | Obtener snack |
| POST | `/snacks` | Crear snack (Admin) |
| PUT | `/snacks/:id` | Actualizar snack (Admin) |
| DELETE | `/snacks/:id` | Desactivar snack (Admin) |

### 🛒 Pedidos de Snacks

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pedidos-snacks` | Listar pedidos (Admin/Empleado) |
| GET | `/pedidos-snacks/mis-pedidos` | Mis pedidos |
| GET | `/pedidos-snacks/:id` | Obtener pedido |
| POST | `/pedidos-snacks` | Crear pedido |
| PUT | `/pedidos-snacks/:id` | Actualizar estado (Admin/Empleado) |
| DELETE | `/pedidos-snacks/:id` | Cancelar pedido |

### 💳 Pagos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pagos` | Listar pagos (Admin) |
| GET | `/pagos/mis-pagos` | Mis pagos |
| GET | `/pagos/:id` | Obtener pago |
| POST | `/pagos` | Crear pago |
| PUT | `/pagos/:id` | Actualizar estado (Admin) |
| POST | `/pagos/:id/reembolso` | Solicitar reembolso |

## 🔒 Autenticación

La API usa **JWT (JSON Web Tokens)**. Incluye el token en el header:

```
Authorization: Bearer <tu_token>
```

### Roles disponibles:
- `cliente` - Usuario estándar
- `empleado` - Puede gestionar pedidos
- `admin` - Acceso total

## 📦 Tecnologías

- **Node.js** + **Express** - Backend
- **MongoDB** + **Mongoose** - Base de datos y ORM
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **express-validator** - Validación de datos
- **Docker** - Contenedor MongoDB

## 🐳 Comandos Docker

```bash
# Iniciar MongoDB
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```