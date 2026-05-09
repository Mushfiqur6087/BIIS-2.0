# ─────────────────────────────────────────────
# BIIS 2.0 — Node.js Application
# oracledb v6+ runs in "Thin" mode by default:
# no Oracle Instant Client required.
# ─────────────────────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app

# Copy only package files first for better layer caching
COPY Project/package*.json ./
RUN npm ci --omit=dev

# ─── Final image ──────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application
COPY Project/ ./

# Create directories that need to exist at runtime
RUN mkdir -p logs public/img docs/scholarship

EXPOSE 3000

ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
