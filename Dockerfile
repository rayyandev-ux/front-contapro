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

EXPOSE 3000

# Healthcheck against root
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD curl -fsS http://localhost:${PORT}/ || exit 1

USER node

# Start: standalone server
CMD ["node", "server.js"]