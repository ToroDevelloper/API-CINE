FROM node:24-alpine AS build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

ARG VITE_API_URL=https://api-cine-backend.onrender.com
ENV VITE_API_URL=${VITE_API_URL}

COPY frontend ./
RUN npm run build
RUN npm prune --omit=dev

FROM node:24-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/build ./build

USER node

EXPOSE 3000

CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
