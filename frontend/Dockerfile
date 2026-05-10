# ─────────────────────────────────────────────
# BIIS 2.0 — SvelteKit Frontend
# ─────────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ─── Production image ──────────────────────────
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
RUN npm ci --omit=dev

EXPOSE 3000

CMD ["node", "build"]
