# Multi-stage Dockerfile for Next.js (production)

# --- Build stage ---
FROM node:20-bullseye AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Build application
COPY . .
ARG NEXT_PUBLIC_API_BASE
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
RUN npm run build

# --- Runtime stage ---
FROM node:20-bullseye-slim AS runtime
WORKDIR /app

ARG NEXT_PUBLIC_API_BASE
ENV NODE_ENV=development \
    PORT=3000 \
    HOST=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}

# Install minimal tools for healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Install full deps for dev mode (incl. TypeScript, eslint, etc.)
COPY package.json package-lock.json ./
RUN npm ci

# Copy entire source for dev server (not using .next build output)
COPY . .
RUN chown -R node:node /app

EXPOSE 3000

# Healthcheck against landing route
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD curl -fsS http://localhost:${PORT}/ || exit 1

USER node

# Ejecutar en modo desarrollo, vinculando a 0.0.0.0 y puerto configurable
CMD ["sh", "-c", "npm run dev -- -p ${PORT:-3000} -H 0.0.0.0"]