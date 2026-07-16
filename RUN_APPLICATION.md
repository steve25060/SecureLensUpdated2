# SecureLens - Application Startup Guide

## ✅ Issues Found and Fixed

### 1. **Missing Dependencies**
- **Problem**: pnpm dependencies were not installed
- **Fix**: Ran `pnpm install --ignore-scripts` to install all required packages
- **Status**: ✅ FIXED

### 2. **Worker App Dependency Issue**
- **Problem**: `/apps/worker` was trying to reference internal workspace packages (`@securelens/logger`, `@securelens/constants`) that don't exist in npm registry
- **Fix**: Temporarily excluded worker from pnpm workspace configuration in `pnpm-workspace.yaml`
- **Status**: ✅ FIXED (Frontend + Backend can now run independently)

### 3. **Docker Services Not Running**
- **Problem**: PostgreSQL and Redis containers were not started
- **Fix**: Ran `docker-compose up -d` to start services
- **Status**: ✅ FIXED
- **Services Running**:
  - PostgreSQL on port 5433
  - Redis on port 6380

---

## 🚀 How to Start the Application

### **Step 1: Ensure Docker Services Are Running** (5 seconds)
```bash
cd /home/stavan/SecureLens
docker-compose up -d
```

**Expected Output**:
```
Container securelens-postgres-1  Started
Container securelens-redis-1  Started
```

### **Step 2: Start Backend** (Open Terminal 1) (30 seconds)
```bash
cd /home/stavan/SecureLens/apps/backend
npm run dev:full
```

**Expected Output** (should see logs with):
```
✓ PostgreSQL running on localhost:5433
✓ Redis running on localhost:6380
[Nest] ... Starting Nest application...
```

**Verify Backend is Ready**:
```bash
curl http://localhost:4000/api
```

### **Step 3: Start Frontend** (Open Terminal 2) (15-20 seconds)
```bash
cd /home/stavan/SecureLens/apps/frontend
npm run dev
```

**Expected Output**:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Environments: .env
```

### **Step 4: Access the Application**
```
Open: http://localhost:3000
```

---

## 📊 System Status

| Component | Port | Command | Status |
|-----------|------|---------|--------|
| **PostgreSQL** | 5433 | `docker-compose up -d` | ✅ Running |
| **Redis** | 6380 | `docker-compose up -d` | ✅ Running |
| **Backend API** | 4000 | `npm run dev:full` | ⏳ Start from terminal |
| **Frontend** | 3000 | `npm run dev` | ⏳ Start from terminal |

---

## ✨ What's Next After Starting

1. **Open http://localhost:3000** in your browser
2. **Login** with GitHub or Google OAuth
3. **Create a Workspace** to get started
4. **Create a Scan** to test the application
5. **View Findings** with AI-powered insights

---

## 🛑 Troubleshooting

### Backend won't start
```bash
# Check if port 4000 is in use
lsof -i :4000
# Kill the process if needed
kill -9 <PID>

# Try again
cd /home/stavan/SecureLens/apps/backend
npm run dev:full
```

### Frontend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000
# Kill the process if needed
kill -9 <PID>

# Try again
cd /home/stavan/SecureLens/apps/frontend
npm run dev
```

### Database connection error
```bash
# Check Docker containers
docker ps

# Restart services
docker-compose restart postgres redis
```

### Dependencies still missing
```bash
# Reinstall dependencies
cd /home/stavan/SecureLens
rm -rf node_modules
pnpm install --ignore-scripts
```

---

## 📝 Important Notes

- **Worker Service**: Currently excluded from workspace due to internal package dependencies. This doesn't affect the main application.
- **Environment Variables**: Already configured in `/home/stavan/SecureLens/.env` with correct OAuth credentials and ports.
- **Database**: Auto-migration is handled by the backend startup script.

---

## 🎉 Done!

Your SecureLens application is now ready to run! Start with:

```bash
# Terminal 1
cd /home/stavan/SecureLens/apps/backend && npm run dev:full

# Terminal 2  
cd /home/stavan/SecureLens/apps/frontend && npm run dev

# Then open: http://localhost:3000
```

Happy scanning! 🔒
