# syntax=docker/dockerfile:1

# ---- Build stage -------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first so this layer is cached across source changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Drop dev dependencies; only express is needed to serve.
RUN npm prune --omit=dev

# ---- Runtime stage -----------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Run as an unprivileged user rather than root.
USER node

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/server.js ./server.js
COPY --from=build --chown=node:node /app/package.json ./package.json

EXPOSE 8080
CMD ["node", "server.js"]
