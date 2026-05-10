# ─────────────────────────────────────────────
# BIIS 2.0 — SvelteKit Frontend
# Multi-stage: build → lean production image
# ─────────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

# Install deps first (layer cache)
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build

# ─── Production image ──────────────────────────
FROM node:18-alpine

WORKDIR /app

# Copy only the adapter-node output and the deps it needs at runtime
COPY --from=build /app/build           ./build
COPY --from=build /app/package.json    ./
COPY --from=build /app/package-lock.json ./
RUN npm ci --omit=dev

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "build"]
