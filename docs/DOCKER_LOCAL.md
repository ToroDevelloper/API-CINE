# Docker local full-stack

Este entorno levanta Frontend, Backend y MongoDB en una red Docker aislada.

## Levantar servicios

```bash
docker compose up --build -d
```

## Verificar estado

```bash
docker compose ps
curl http://localhost:3001/health
curl -I http://localhost:3000/
```

## Verificar usuario seguro no-root

```bash
docker compose exec backend whoami
docker compose exec frontend whoami
```

La salida esperada en ambos casos es:

```text
node
```

## Verificar comunicacion interna

```bash
docker compose logs backend
docker compose exec mongodb mongosh --quiet --eval "db.adminCommand('ping')"
```

El backend usa `mongodb://mongodb:27017/api_cine`, donde `mongodb` es el nombre del servicio dentro de la red `cine_network`.

## Verificar persistencia

```bash
docker compose down
docker compose up -d
docker volume ls | grep mongodb
```

Los datos se conservan en los volumenes:

```text
mongodb_data
mongodb_config
```

## Apagar entorno

```bash
docker compose down
```

Para borrar tambien la base local persistida:

```bash
docker compose down -v
```
