# Multi-stage Dockerfile for Next.js (production image)

# --- Build stage ---
FROM node:20-bullseye AS builder
WORKDIR /app

# Install dependencies (including dev for building)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
ARG NEXT_PUBLIC_API_BASE
ARG NEXT_PUBLIC_LANDING_HOST
ARG NEXT_PUBLIC_APP_HOST
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE} \
    NEXT_PUBLIC_LANDING_HOST=${NEXT_PUBLIC_LANDING_HOST} \
    NEXT_PUBLIC_APP_HOST=${NEXT_PUBLIC_APP_HOST}
RUN npm run build

# --- Runtime stage ---
FROM node:20-bullseye-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

# Minimal tool for healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Copy app (standalone) and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Optional fallback: install prod deps to allow `next start` if needed
COPY package.json package-lock.json ./
RUN npm ci --omit=dev || true

EXPOSE 3000

# Healthcheck against root
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD curl -fsS http://localhost:${PORT}/ || exit 1

USER node

# Start: prefer standalone `server.js`; fallback to `next start`
CMD ["sh", "-c", "if [ -f server.js ]; then node server.js; else npm run start -- -p ${PORT:-3000} -H 0.0.0.0; fi"]