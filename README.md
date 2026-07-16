# SecureLens

AI‑powered Security Intelligence Platform.

## Overview
- Orchestrates multiple open‑source security scanners.
- Correlates findings into a unified model.
- Prioritizes risks and provides an AI Security Copilot.

## Packages
- `apps/frontend` – Next.js 15 UI.
- `apps/backend` – NestJS API.
- `apps/worker` – BullMQ background jobs.
- `packages/*` – Shared libraries.

## Development
```bash
# Install pnpm globally if not present
npm i -g pnpm

# Install all dependencies
pnpm install

# Start services
./scripts/start.sh
```
