# ─────────────────────────────────────────────
# BIIS 2.0 — Express REST API Backend
# ─────────────────────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

# ─── Final image ──────────────────────────────
FROM node:18-alpine

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY backend/ ./

RUN mkdir -p logs public/img docs/scholarship

EXPOSE 3000

ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
