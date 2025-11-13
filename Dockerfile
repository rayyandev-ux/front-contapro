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
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}

# Install minimal tools for healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Install production deps (Next is in dependencies)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy build output and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN chown -R node:node /app

EXPOSE 3000

# Healthcheck against API health endpoint
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD curl -fsS http://localhost:${PORT}/api/health || exit 1

USER node

# Bind explícitamente a 0.0.0.0 y usa PORT vía npm
CMD ["sh", "-c", "npm run start -- -p ${PORT:-3000} -H 0.0.0.0"]