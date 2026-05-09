#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# docker-entrypoint.sh
# Waits for Oracle DB to be fully ready (checked by Docker healthcheck),
# then starts the Node.js application.
#
# The actual DB initialization (schema + seed data) is handled by the
# gvenzl/oracle-free image via /container-entrypoint-initdb.d/ on first boot.
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "============================================"
echo "  BIIS 2.0 — Starting Application"
echo "============================================"
echo "  DB Host     : ${DB_HOST:-oracle}"
echo "  DB User     : ${DB_USER}"
echo "  DB Connect  : ${DB_CONNECTION}"
echo "  Port        : ${PORT:-3000}"
echo "============================================"

exec node server.js
