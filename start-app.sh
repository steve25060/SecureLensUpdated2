#!/bin/bash

# SecureLens Quick Start Script
# This script starts all services needed for SecureLens development

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting SecureLens Application..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Docker
echo -e "${BLUE}📦 Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Please install Docker first.${NC}"
    exit 1
fi

# Step 2: Start Docker services
echo -e "${BLUE}📦 Starting Docker services (PostgreSQL & Redis)...${NC}"
cd "$REPO_ROOT"
docker-compose up -d postgres redis 2>/dev/null

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Step 3: Check if dependencies are installed
echo -e "${BLUE}📦 Checking dependencies...${NC}"
if [ ! -d "$REPO_ROOT/node_modules" ]; then
    echo -e "${BLUE}📥 Installing dependencies...${NC}"
    cd "$REPO_ROOT"
    pnpm install --ignore-scripts 2>&1 | tail -5
fi

# Step 4: Start backend
echo -e "${GREEN}✓${NC} Docker services ready"
echo ""
echo -e "${BLUE}🔧 Backend Setup${NC}"
echo "Run in Terminal 1:"
echo ""
echo -e "${YELLOW}  cd $REPO_ROOT/apps/backend${NC}"
echo -e "${YELLOW}  npm run dev:full${NC}"
echo ""
echo "---"
echo ""
echo -e "${BLUE}🎨 Frontend Setup${NC}"
echo "Run in Terminal 2:"
echo ""
echo -e "${YELLOW}  cd $REPO_ROOT/apps/frontend${NC}"
echo -e "${YELLOW}  npm run dev${NC}"
echo ""
echo "---"
echo ""
echo -e "${GREEN}✓ Application will be available at: http://localhost:3000${NC}"
echo ""
echo "Services Status:"
echo "  PostgreSQL: localhost:5433"
echo "  Redis:      localhost:6380"
echo "  Backend:    localhost:4000"
echo "  Frontend:   localhost:3000"
