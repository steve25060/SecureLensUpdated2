#!/usr/bin/env bash
set -euo pipefail

# Stop containers and remove volumes
docker compose -f docker-compose.yml down -v

# Remove node_modules and lockfiles
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
find . -name 'pnpm-lock.yaml' -delete

echo "Clean complete."
