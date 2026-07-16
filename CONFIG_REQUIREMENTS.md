# SecureLens Project - Complete Configuration & Requirements Guide

## 📋 PROJECT OVERVIEW
- **Project Name**: SecureLens
- **Type**: AI-Powered Security Intelligence Platform
- **Architecture**: Monorepo (Apps + Packages)
- **Tech Stack**: Next.js, NestJS, PostgreSQL, Redis, Docker, Kubernetes (future)

---

## 🏗️ PROJECT STRUCTURE

```
/home/stavan/SecureLens/
├── apps/
│   ├── frontend/          # Next.js 14 React app (Port 3000)
│   ├── backend/           # NestJS API server (Port 4000)
│   └── worker/            # BullMQ job queue worker (Background)
├── packages/
│   ├── ui/                # Shared UI components
│   ├── validation/        # Zod schemas
│   ├── logger/            # Pino logging
│   ├── shared-types/      # TypeScript types
│   ├── shared-utils/      # Utility functions
│   ├── findings-schema/   # Finding data models
│   └── constants/         # Constants
├── scanner-images/        # Docker images for scanners (11 engines)
├── docker-compose.yml     # Dev environment orchestration
├── pnpm-workspace.yaml    # Monorepo workspace config
└── .env                   # Root environment file
```

---

## 🔐 ENVIRONMENT VARIABLES & SECRETS

### Location: `/home/stavan/SecureLens/.env`

### DATABASE CONFIGURATION
```
DATABASE_URL=sqlite:///file:./dev.db
  (Production: postgresql://user:password@host:5432/dbname)

PRISMA_PROVIDER=sqlite
  (Production: postgresql)
```

### REDIS CONFIGURATION
```
REDIS_URL=redis://localhost:6379
  (Production: redis://username:password@host:6379/db)
```

### JWT AUTHENTICATION
```
JWT_SECRET=securelens-super-secret-jwt-key-change-in-production
  ⚠️ MUST change in production - use: openssl rand -base64 32

JWT_EXPIRES_IN=7d
  (Configurable: 1h, 24h, 30d, etc.)
```

### OAUTH INTEGRATIONS

#### GitHub OAuth
```
GITHUB_CLIENT_ID=[Get from: https://github.com/settings/developers]
GITHUB_CLIENT_SECRET=[OAuth App Secret]
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback
  (Production: https://yourdomain.com/auth/github/callback)
```

#### Google OAuth
```
GOOGLE_CLIENT_ID=[Get from: https://console.cloud.google.com/]
GOOGLE_CLIENT_SECRET=[OAuth App Secret]
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
  (Production: https://yourdomain.com/auth/google/callback)
```

### FRONTEND CONFIGURATION
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
  (Production: https://api.yourdomain.com)

NEXT_PUBLIC_API_URL=http://localhost:4000/api

FRONTEND_ORIGIN=http://localhost:3000
  (Production: https://yourdomain.com)
```

### BACKEND CONFIGURATION
```
PORT=4000
NODE_ENV=development
  (Production: production)
```

---

## 🗄️ DATABASE SETUP

### PostgreSQL (Production)
```
HOST: localhost (or cloud provider RDS endpoint)
PORT: 5432
USERNAME: securelens
PASSWORD: [Set secure password]
DATABASE_NAME: securelens
DEFAULT_SCHEMA: public

Connection String:
postgresql://securelens:password@localhost:5432/securelens
```

### SQLite (Development - Current)
```
Location: /home/stavan/SecureLens/apps/backend/prisma/dev.db
Auto-created by Prisma
```

### Database Initialization
```bash
# Run migrations
cd /home/stavan/SecureLens/apps/backend
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# View data (GUI)
npx prisma studio
```

### Key Tables
1. **users** - User accounts (email, name, oauth IDs)
2. **workspaces** - Security workspaces (WEBSITE, GITHUB, COMBINED types)
3. **scans** - Security scans (status, findings count, risk score)
4. **findings** - Discovered vulnerabilities (severity, status, remediation)
5. **reports** - Generated security reports
6. **notifications** - User notifications
7. **api_keys** - API key management
8. **correlation_rules** - Finding correlation logic

---

## 🔴 REDIS CONFIGURATION

### Development
```
HOST: localhost
PORT: 6379
DATABASE: 0 (default)
URL: redis://localhost:6379
Authentication: None (dev)
```

### Production
```
HOST: [Cloud Redis provider - AWS ElastiCache, Azure Cache, etc.]
PORT: 6379 (or custom)
DATABASE: 0
URL: redis://username:password@host:6379/0
Authentication: Required
SSL/TLS: Enabled
```

### Usage in SecureLens
- **Job Queue**: BullMQ for scan jobs
- **Session Storage**: User sessions
- **Caching**: Findings, reports
- **Real-time Updates**: WebSocket support

---

## 📦 CONTAINER SERVICES (Docker Compose)

### Services Running
1. **PostgreSQL 16** (Port 5432)
   - Username: `securelens`
   - Password: `securelens`
   - Database: `securelens`

2. **Redis 7** (Port 6379)
   - No authentication (dev)

3. **NestJS Backend** (Port 4000)
   - Depends on: PostgreSQL, Redis

4. **Next.js Frontend** (Port 3000)
   - Depends on: Backend

5. **BullMQ Worker** (Background)
   - Depends on: Backend, Redis

### Scanner Services (Docker)
11 scanning engines as Docker images:
- **Nuclei** - Vulnerability scanner (HTTP protocols)
- **OWASP ZAP** - Web app security testing
- **Nmap** - Network reconnaissance
- **Trivy** - Container/dependency vulnerability scanning
- **Semgrep** - SAST (code analysis)
- **GitLeaks** - Secret detection
- **Checkov** - IaC security scanning
- **TestSSL** - SSL/TLS certificate analysis
- **WhatWeb** - Web technology fingerprinting
- **DNSX** - DNS enumeration
- **HTTPX** - HTTP probing

---

## 🚀 DEPLOYMENT INFRASTRUCTURE REQUIREMENTS

### Cloud Providers (Choose One)

#### AWS Deployment
```
Region: [Your choice]
Services:
- RDS PostgreSQL 16: db.t4g.medium (Production)
- ElastiCache Redis: cache.t4g.micro
- ECS/ECR: Docker container registry
- ALB: Application Load Balancer
- CloudFront: CDN
- Route53: DNS
- IAM: Access management
- Secrets Manager: Store credentials
- CloudWatch: Logging & monitoring
```

#### Azure Deployment
```
Resource Group: [Create one]
Services:
- Azure Database for PostgreSQL: B_Gen5_2
- Azure Cache for Redis: Basic tier
- Container Registry: ACR
- App Service: Docker container
- Application Gateway: Load balancer
- Azure DNS: Domain routing
- Key Vault: Secrets
- Monitor: Logging
```

#### Google Cloud
```
Project ID: [Your GCP project]
Services:
- Cloud SQL (PostgreSQL): db-f1-micro
- Memorystore (Redis): 1GB basic
- Artifact Registry: Docker images
- Cloud Run: Containerized apps
- Cloud Load Balancing: Traffic routing
- Cloud DNS: Domain management
- Secret Manager: Credentials
- Cloud Logging: Monitoring
```

---

## 🔑 API KEYS & CREDENTIALS REQUIRED

### Third-Party Services

#### GitHub OAuth App
- **Scope**: 
  - `user:email` - Read email
  - `public_repo` - Public repo access
  - `repo` - Full repo access (optional)
- **Callback URL**: `http://localhost:4000/auth/github/callback`
- **Website**: `http://localhost:3000`

#### Google OAuth App
- **Scopes**:
  - `openid`
  - `email`
  - `profile`
- **Authorized Redirect URIs**: `http://localhost:4000/auth/google/callback`

#### Optional: AI/LLM Integration
```
OpenAI API Key: [For AI Copilot features]
  (if integrating GPT-4 for vulnerability analysis)

Anthropic Claude API: [Alternative]
```

#### Optional: Email Service
```
SendGrid API Key: [For email notifications]
SMTP Server: smtp.sendgrid.net
Port: 587
```

#### Optional: Monitoring
```
Sentry DSN: [Error tracking]
Datadog API Key: [Performance monitoring]
NewRelic License Key: [APM]
```

---

## 🛠️ DEVELOPMENT SETUP CHECKLIST

### Prerequisites
- [ ] Node.js 18+ (LTS)
- [ ] npm/pnpm package manager
- [ ] PostgreSQL 14+ (for production testing)
- [ ] Redis 6+ (for production testing)
- [ ] Docker & Docker Compose
- [ ] Git

### Local Development Steps
```bash
# 1. Clone repository
git clone <repo-url>
cd /home/stavan/SecureLens

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 4. Start services
docker-compose up -d

# 5. Run migrations
cd apps/backend
npx prisma migrate dev

# 6. Start dev servers
pnpm dev

# Services will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# Docs/Swagger: http://localhost:4000/api/docs
```

---

## 📊 FRONTEND CONFIGURATION

### Port: 3000

### Environment Variables
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Build & Deployment
```bash
# Production build
pnpm build

# Start production server
pnpm start

# Generate static export
pnpm export
```

### Dependencies (Key)
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **TanStack Query** - Data fetching
- **TanStack Table** - Advanced tables
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons
- **Zod** - Form validation
- **React Hook Form** - Form handling
- **Zustand** - State management
- **React Markdown** - Markdown rendering

---

## 🔌 BACKEND API CONFIGURATION

### Port: 4000

### Base URL
```
Development: http://localhost:4000
Production: https://api.yourdomain.com
```

### API Endpoints Structure
```
/api/auth
  POST /register
  POST /login
  POST /refresh-token
  POST /logout
  POST /oauth/github/callback
  POST /oauth/google/callback

/api/dashboard
  GET /overview
  GET /security-scores
  GET /risk-overview
  GET /findings-timeline

/api/workspaces
  GET / (list all)
  POST / (create)
  GET /:id (get one)
  PUT /:id (update)
  DELETE /:id (delete)

/api/scans
  GET / (list)
  POST / (start scan)
  GET /:id (details)
  PUT /:id/cancel
  DELETE /:id

/api/findings
  GET / (list)
  GET /:id (details)
  PUT /:id (update)
  PUT /:id/status (change status)
  POST /:id/remediate

/api/reports
  GET / (list)
  POST / (generate)
  GET /:id (download)
  POST /:id/send (email)

/api/analytics
  GET /overview
  GET /trends
  GET /risk-score
  GET /vulnerability-categories
```

### Swagger/OpenAPI Docs
```
URL: http://localhost:4000/api/docs
Format: OpenAPI 3.0
Auto-generated from NestJS decorators
```

---

## 📦 PACKAGE MANAGEMENT

### Monorepo Tool: pnpm

### Package Structure
```
@securelens/ui              - Shared components
@securelens/validation      - Zod schemas
@securelens/logger          - Logging utility
@securelens/shared-types    - TypeScript interfaces
@securelens/shared-utils    - Helper functions
@securelens/findings-schema - Data models
@securelens/constants       - App constants
```

### Common Commands
```bash
# Install all dependencies
pnpm install

# Add package to specific app
pnpm add package-name -F @securelens/frontend

# Run scripts
pnpm dev              # Start all dev servers
pnpm build            # Build all apps
pnpm lint             # Lint all code
pnpm type-check       # TypeScript check
```

---

## 🔐 SECURITY BEST PRACTICES

### Production Environment
```
✓ Use environment variables for ALL secrets
✓ Enable HTTPS/TLS for all communications
✓ Use strong JWT secret (min 32 chars)
✓ Enable CORS selectively
✓ Rate limit API endpoints
✓ Use API keys for service-to-service calls
✓ Enable database encryption at rest
✓ Use Redis with password authentication
✓ Implement API authentication (JWT)
✓ Add request logging and monitoring
```

### Secrets Management Tools
- **AWS Secrets Manager** (AWS)
- **Azure Key Vault** (Azure)
- **Google Secret Manager** (GCP)
- **HashiCorp Vault** (Self-hosted)

---

## 📝 CONFIGURATION SUMMARY TABLE

| Component | Dev Value | Production | Notes |
|-----------|-----------|-----------|-------|
| Database | SQLite | PostgreSQL | Use RDS/Cloud SQL |
| Redis | localhost:6379 | Cloud Redis | ElastiCache/Memorystore |
| Frontend Port | 3000 | 443 | Behind load balancer |
| Backend Port | 4000 | 443 | Behind load balancer |
| JWT Secret | dev-key | [SECURE] | Must be 32+ chars |
| Node Env | development | production | Controls logs/caching |
| CORS Origin | localhost:3000 | yourdomain.com | Whitelist frontend |
| Database URL | file:dev.db | postgresql://... | Connection string |
| API Key Length | N/A | 32+ chars | Generate securely |

---

## 🚨 CRITICAL TO-DO BEFORE PRODUCTION

- [ ] Generate strong JWT secret
- [ ] Set up PostgreSQL RDS/Cloud SQL
- [ ] Set up Redis cluster
- [ ] Create GitHub OAuth App
- [ ] Create Google OAuth App
- [ ] Configure SSL/TLS certificates
- [ ] Set up CI/CD pipeline
- [ ] Configure monitoring & logging
- [ ] Set up automated backups
- [ ] Create disaster recovery plan
- [ ] Run security audit
- [ ] Load testing
- [ ] Database connection pooling
- [ ] API rate limiting
- [ ] DDoS protection
- [ ] WAF (Web Application Firewall)

---

## 📞 SUPPORT & DOCUMENTATION

- Backend Docs: `http://localhost:4000/api/docs`
- Frontend: Next.js 14 documentation
- Database: Prisma Studio `npx prisma studio`
- Docker: `docker-compose ps`
- Logs: Check stdout/stderr or use logging service

---

## 🎯 PROJECT STATUS

- ✅ Frontend: 4 premium dashboard pages built (Analytics, AI Copilot, Reports, Settings)
- ✅ TypeScript: All types validated
- ✅ Build: Production-ready
- ✅ Docker: Compose file ready
- ⏳ Backend APIs: Partial implementation
- ⏳ Authentication: OAuth setup needed
- ⏳ Database: Migrations ready
- ⏳ Deployment: Infrastructure setup needed
