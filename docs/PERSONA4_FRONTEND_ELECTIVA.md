# Persona 4 - Frontend, CI/CD, Render y errores semanticos

Este documento deja la guia operativa para validar la parte de Persona 4 en las dos entregas: Proyecto Frontend y Electiva.

## Render y despliegue

- Servicio frontend en Render: `api-cine-frontend`.
- Puerto esperado: `3000`.
- Variable obligatoria en Render:

```text
VITE_API_URL=https://URL-REAL-DEL-BACKEND-RENDER
```

- La URL del backend no debe terminar en `/`.
- GitHub Secret obligatorio:

```text
RENDER_DEPLOY_HOOK
```

- El deploy automatico solo debe correr cuando:
  - todas las validaciones pasan;
  - el evento es `push`;
  - la rama es `main`.

## Validacion CI local

Ejecutar desde `frontend/`:

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npx playwright install chromium --with-deps
npm run test:e2e
```

En Fedora local, `npx playwright install chromium --with-deps` puede pedir `sudo`. Si no hay permisos interactivos, instalar solo el navegador para prueba local:

```bash
npx playwright install chromium
npm run test:e2e
```

En GitHub Actions se mantiene `--with-deps` porque el runner si puede instalar dependencias del sistema.

## Lighthouse en produccion

Ejecutar la auditoria directamente contra el dominio final de Render:

```bash
npx lighthouse https://URL-FRONTEND-RENDER/ --view
npx lighthouse https://URL-FRONTEND-RENDER/login --view
npx lighthouse https://URL-FRONTEND-RENDER/dashboard --view
```

Guardar capturas o reportes HTML para:

- `/`
- `/login` o `/register`
- `/dashboard` o ruta principal autenticada

Meta minima: mas de `90` en Rendimiento, Accesibilidad, Buenas Practicas y SEO.

## Demo 401 y 403

### 401 Unauthorized

1. Iniciar sesion.
2. Borrar cookie/token desde DevTools o storage del navegador.
3. Abrir una ruta protegida o ejecutar una accion autenticada.
4. Evidenciar que el frontend:
   - notifica al backend con `POST /api/auth/logout`;
   - limpia `localStorage`;
   - limpia `sessionStorage`;
   - reinicia estado de autenticacion y carrito;
   - redirige a `/login`;
   - muestra mensaje de sesion expirada.

### 403 Forbidden

1. Iniciar sesion con usuario cliente.
2. Intentar una accion administrativa, por ejemplo administrar peliculas, usuarios, salas o funciones.
3. Evidenciar respuesta `403` del backend.
4. Evidenciar mensaje visible distinto: `Acceso denegado`.

## Datos de demo

Preparar antes de la sustentacion:

- Usuario administrador.
- Usuario cliente.
- Peliculas publicadas.
- Funciones disponibles.
- Reservas asociadas al usuario cliente.
- Datos de pagos o pedidos de snacks si se muestra ese flujo.

## Revision de rutas frontend/backend

- El frontend consume la API desde `VITE_API_URL`; no debe depender de `http://localhost:3000` en produccion.
- La landing usa el servicio `getPeliculas()` en vez de un `fetch` hardcodeado.
- `useTaskStore` fue revisado: el backend actual tiene rutas `/tasks`, por lo que no queda desalineado en esta rama.
