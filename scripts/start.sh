#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Start website frontend directly. Docker Compose currently depends on
# backend/worker Dockerfiles that are not present in this repository.
if command -v pnpm >/dev/null 2>&1; then
  pnpm --filter securelens-frontend dev
else
  cd apps/frontend
  npm run dev
fi
