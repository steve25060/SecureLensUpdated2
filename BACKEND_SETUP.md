# SecureLens Backend Setup Guide

## Quick Start - One Command

To start the entire backend stack (PostgreSQL, Redis, Prisma setup, and NestJS) with a single command:

### Option 1: Using npm script (Recommended)
```bash
cd /home/stavan/SecureLens/apps/backend
npm run dev:full
```

### Option 2: Using bash script
```bash
cd /home/stavan/SecureLens/apps/backend
./start-dev.sh
```

## What Gets Started Automatically

When you run the startup command, the following services will automatically start:

1. ✅ **PostgreSQL Database** (Port: 5433)
   - Database: `securelens`
   - User: `securelens`
   - Password: `securelens`
   - Runs in Docker container

2. ✅ **Redis Cache** (Port: 6380)
   - In-memory data store for caching and queue management
   - Runs in Docker container

3. ✅ **Prisma Database Setup**
   - Automatically runs migrations
   - Syncs database schema with models
   - No manual migration needed

4. ✅ **NestJS Backend Server** (Port: 4000)
   - Hot-reloading development server
   - Runs on `http://localhost:4000`
   - Swagger API docs on `http://localhost:4000/api`

## Services Status

Once everything starts, you'll see output like:

```
🚀 Starting SecureLens Backend Development Environment...

✓ Docker is running
✓ PostgreSQL running on localhost:5433
✓ Redis running on localhost:6380
✓ PostgreSQL is ready
✓ Database schema synced

============================================================
✓ SecureLens Backend Development Ready!
============================================================

Services Status:
  PostgreSQL: ✓ Running on localhost:5433
  Redis:      ✓ Running on localhost:6380
  Backend:    Starting...

Environment Variables:
  DATABASE_URL: postgresql://securelens:***@localhost:5433/securelens
  REDIS_URL: redis://localhost:6380

Backend listening on http://localhost:4000
```

## Manual Service Management

If you need to manage services separately:

### Start only the backend (assuming services are already running)
```bash
cd /home/stavan/SecureLens/apps/backend
npm run dev
```

### Start Docker services only
```bash
cd /home/stavan/SecureLens
docker-compose up -d postgres redis
```

### Stop all services
```bash
cd /home/stavan/SecureLens
docker-compose down
```

### View service logs
```bash
# PostgreSQL logs
docker-compose logs postgres

# Redis logs
docker-compose logs redis

# Backend logs (in another terminal)
cd /home/stavan/SecureLens/apps/backend
npm run dev
```

## Database Management

### Prisma Commands

```bash
cd /home/stavan/SecureLens/apps/backend

# Run migrations
npx prisma migrate deploy

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Push schema changes (for development)
npx prisma db push

# View database in Prisma Studio
npx prisma studio
```

### PostgreSQL Direct Access

```bash
# Connect to PostgreSQL directly
PGPASSWORD=securelens psql -h localhost -U securelens -d securelens -p 5433

# Example query
SELECT * FROM users;
```

## Environment Setup

The backend uses the following environment variables (from `.env`):

```
DATABASE_URL=postgresql://securelens:securelens@localhost:5433/securelens
REDIS_URL=redis://localhost:6380
JWT_SECRET=your_jwt_secret_here
FRONTEND_ORIGIN=http://localhost:3000
PORT=4000
```

These are automatically set by the startup script.

## Troubleshooting

### PostgreSQL Connection Refused
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# Restart the container
docker-compose restart postgres
```

### Redis Connection Issues
```bash
# Check if Redis container is running
docker ps | grep redis

# Restart Redis
docker-compose restart redis
```

### Backend won't start
```bash
# Check logs
npm run dev

# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev:full
```

### Port already in use
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>
```

## Full Stack Development

To start the **entire** SecureLens stack (Frontend + Backend):

### Terminal 1 - Backend
```bash
cd /home/stavan/SecureLens/apps/backend
npm run dev:full
```

### Terminal 2 - Frontend
```bash
cd /home/stavan/SecureLens/apps/frontend
npm run dev
```

Then open your browser to:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   SecureLens Stack                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend (Next.js)           Backend (NestJS)         │
│  http://localhost:3000        http://localhost:4000     │
│         │                             │                │
│         └─────────────────┬───────────┘                │
│                           │                             │
│                 ┌─────────┴──────────┐                 │
│                 │                    │                 │
│          PostgreSQL            Redis Queue              │
│          Port: 5433            Port: 6380              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Performance Tips

1. **First Run**: The first startup may take longer as Docker pulls images
2. **Database Migrations**: Prisma migrations are cached, subsequent runs are faster
3. **Hot Reload**: Changes to `.ts` files in `src/` reload automatically
4. **Memory**: Ensure at least 4GB RAM available for Docker containers

## Support

For issues or questions:
1. Check the logs: `npm run dev:full`
2. Review `.env` configuration
3. Ensure Docker is running properly
4. Check port availability (3000, 4000, 5433, 6380)
