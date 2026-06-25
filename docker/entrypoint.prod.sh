#!/usr/bin/env bash

set -Eeuo pipefail

cd /app

echo "=================================="
echo "Astro Production Container"
echo "=================================="

# Production serves the pre-built static output only. If dist/ is missing or
# empty the image was built incorrectly (or someone bind-mounted over it) —
# fail fast instead of silently degrading or falling back to a dev server.
if [ ! -d dist ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "FATAL: dist/ is missing or empty — rebuild the image before running." >&2
    exit 1
fi

# Bind 0.0.0.0 so the container is reachable on its network behind Traefik.
# Overridable for constrained deployments.
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-4321}"

echo "Serving built dist/ via astro preview on ${HOST}:${PORT}..."

# `astro preview` serves the static dist/ output: no HMR websocket, no dev
# middleware, no source maps — the production-appropriate static server.
exec npm run preview -- --host "${HOST}" --port "${PORT}"
