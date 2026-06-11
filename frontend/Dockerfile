FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY frontend/package.json ./frontend/package.json
RUN pnpm install --frozen-lockfile

ARG VITE_API_URL=https://api-cine-backend.onrender.com
ENV VITE_API_URL=${VITE_API_URL}

COPY frontend ./frontend
WORKDIR /app/frontend
RUN pnpm run build
RUN pnpm prune --prod

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app/frontend

COPY --from=build --chown=node:node /app/frontend/package.json ./package.json
COPY --from=build --chown=node:node /app/frontend/node_modules ./node_modules
COPY --from=build --chown=node:node /app/frontend/build ./build

USER node

EXPOSE 3000

CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
