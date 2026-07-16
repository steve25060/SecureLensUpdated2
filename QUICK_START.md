# SecureLens - Quick Start Guide

## 🚀 One Command to Start Everything

### Backend (All services: PostgreSQL, Redis, Prisma, NestJS)
```bash
cd /home/stavan/SecureLens/apps/backend
npm run dev:full
```

### Frontend (Next.js - in another terminal)
```bash
cd /home/stavan/SecureLens/apps/frontend
npm run dev
```

---

## 📍 Access Points

Once everything is running, access the application at:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | SecureLens Dashboard |
| **Backend API** | http://localhost:4000 | REST API |
| **Swagger Docs** | http://localhost:4000/api | API Documentation |
| **PostgreSQL** | localhost:5433 | Database |
| **Redis** | localhost:6380 | Cache & Queue |

---

## 🔧 What Starts Automatically

When you run `npm run dev:full`, the following services start:

```
✓ PostgreSQL (Port 5433)
  └─ User: securelens
  └─ Database: securelens
  └─ Auto-migrations applied

✓ Redis (Port 6380)
  └─ For caching and queue management

✓ Prisma Database Setup
  └─ Schema synced automatically

✓ NestJS Backend Server (Port 4000)
  └─ Hot-reloading development mode
  └─ Swagger API docs included
```

---

## 📦 Default Credentials

| Service | User | Password | Host |
|---------|------|----------|------|
| PostgreSQL | securelens | securelens | localhost:5433 |

---

## 🛑 Stop Everything

```bash
# Stop backend (Ctrl+C in terminal)
# Stop frontend (Ctrl+C in terminal)

# Stop Docker containers
cd /home/stavan/SecureLens
docker-compose down
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
cd /home/stavan/SecureLens/apps/backend
npm install
npm run dev:full
```

### Port already in use
```bash
# Kill process on port 4000
lsof -i :4000
kill -9 <PID>
```

### Database connection issues
```bash
# Check Docker containers
docker ps

# Restart services
docker-compose restart postgres redis
```

---

## 📚 Full Documentation

- **Backend Setup**: See `BACKEND_SETUP.md`
- **Homepage Design**: See `HOMEPAGE_DESIGN.md`
- **Project Structure**: See README.md in root

---

## ✨ Features Available

✅ Full Stack Development
✅ Hot Module Reloading (Frontend & Backend)
✅ PostgreSQL with Prisma ORM
✅ Redis for Caching & Queues
✅ JWT Authentication
✅ OAuth (GitHub, Google)
✅ Swagger API Documentation
✅ Type-safe with TypeScript

---

**Happy Developing! 🎉**
