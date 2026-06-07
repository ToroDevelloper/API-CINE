FROM node:24-alpine AS deps

ENV PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false
ENV npm_config_verify_deps_before_run=false
WORKDIR /app
RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY frontend/package.json ./frontend/package.json
RUN pnpm --filter api-cine-frontend install --frozen-lockfile

FROM node:24-alpine AS prod-deps

ENV PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false
ENV npm_config_verify_deps_before_run=false
WORKDIR /app
RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY frontend/package.json ./frontend/package.json
RUN pnpm --filter api-cine-frontend install --prod --frozen-lockfile

FROM node:24-alpine AS builder

ENV PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false
ENV npm_config_verify_deps_before_run=false
WORKDIR /app
RUN corepack enable

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY frontend ./frontend
WORKDIR /app/frontend
RUN ./node_modules/.bin/react-router build

FROM node:24-alpine AS runner

ENV NODE_ENV=production
ENV PORT=5173
ENV PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false
ENV npm_config_verify_deps_before_run=false
WORKDIR /app
RUN corepack enable

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=prod-deps --chown=node:node /app/frontend/node_modules ./frontend/node_modules
COPY --from=builder --chown=node:node /app/frontend/build ./frontend/build
COPY --chown=node:node frontend/package.json ./frontend/package.json
COPY --chown=node:node frontend/server.mjs ./frontend/server.mjs

WORKDIR /app/frontend

USER node

EXPOSE 5173

CMD ["node", "server.mjs"]
