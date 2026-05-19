# Despliegue backend en Render con MongoDB Atlas

Este repo queda preparado para CI/CD asi:

- GitHub Actions ejecuta `pnpm install --frozen-lockfile` y `pnpm run test:ci` en `main` y `toro-despliegue`.
- Render lee `render.yaml`, usa Node, instala con `pnpm install --frozen-lockfile`, arranca con `pnpm start` y revisa `/health`.
- Render despliega la rama `main` solo despues de que pasen los checks de CI (`autoDeployTrigger: checksPass`).

## 1. Preparar MongoDB Atlas

1. En Atlas, crea un proyecto y un cluster.
2. Usa AWS y una region cercana a Render. Este repo usa `oregon` en Render, asi que en Atlas conviene `Oregon (us-west-2)` cuando este disponible.
3. En Database Access, crea un usuario de base de datos para la app. Guarda usuario y password.
4. En Network Access, permite las IP de salida de tu servicio Render. Despues de crear el servicio, Render las muestra en `Connect > Outbound`.
5. En el cluster, entra a `Connect > Drivers` y copia el connection string.
6. Ajusta la URI para usar la base `api_cine`, por ejemplo:

```text
mongodb+srv://USUARIO:PASSWORD@cluster0.xxxxx.mongodb.net/api_cine?retryWrites=true&w=majority
```

Si el password tiene caracteres especiales, codificalos para URL antes de ponerlo en la URI.

## 2. Subir la rama y validar CI

1. Confirma que estas en la rama:

```bash
git branch --show-current
```

2. Haz commit y push de `toro-despliegue`.
3. Abre un Pull Request hacia `main`.
4. Espera que el check `Backend CI / Test backend` pase.
5. Haz merge a `main`.

## 3. Crear el servicio en Render

1. En Render, conecta tu cuenta de GitHub y selecciona este repositorio.
2. Crea un Blueprint desde el repo usando el archivo `render.yaml`.
3. Cuando Render pida variables con `sync: false`, configura:

```text
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=https://tu-frontend.com,http://localhost:5173,http://localhost:5174,http://localhost:5175
```

4. `JWT_SECRET` se genera automaticamente por `render.yaml`. Si prefieres controlarlo manualmente, cambialo en Render por un valor largo y secreto.
5. Verifica que Render use:

```text
Build Command: corepack enable && pnpm install --frozen-lockfile
Start Command: pnpm start
Health Check Path: /health
Auto-Deploy: After CI Checks Pass
```

## 4. Verificar produccion

Cuando termine el deploy, prueba:

```text
https://TU-SERVICIO.onrender.com/health
https://TU-SERVICIO.onrender.com/
https://TU-SERVICIO.onrender.com/api-docs
```

Si necesitas cargar datos iniciales, ejecuta el seed apuntando a Atlas desde tu maquina local o desde un shell controlado:

```powershell
$env:MONGODB_URI='mongodb+srv://.../api_cine?retryWrites=true&w=majority'
$env:JWT_SECRET='usa_el_mismo_secret_o_uno_temporal'
pnpm run seed
```

## Referencias

- Render Blueprints: https://render.com/docs/blueprint-spec
- Render con GitHub y checks de CI: https://render.com/docs/deploys
- Render + MongoDB Atlas: https://render.com/docs/connect-to-mongodb-atlas
- IPs de salida en Render: https://render.com/docs/outbound-ip-addresses
- GitHub Actions para Node.js: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
