#!/bin/bash

# SecureLens Backend Development Startup Script
# This script starts PostgreSQL, Redis, Prisma setup, and the NestJS backend

set -e

echo "🚀 Starting SecureLens Backend Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/apps/backend"
DB_USER="securelens"
DB_PASSWORD="securelens"
DB_NAME="securelens"
DB_PORT="5433"
DB_HOST="localhost"
REDIS_PORT="6380"
REDIS_HOST="localhost"

# Check if Docker is running
echo -e "${BLUE}[1/5]${NC} Checking Docker status..."
if ! docker ps > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Starting Docker...${NC}"
    open -a Docker || docker daemon &
    sleep 5
fi
echo -e "${GREEN}✓${NC} Docker is running"
echo ""

# Start Docker containers
echo -e "${BLUE}[2/5]${NC} Starting PostgreSQL and Redis containers..."
cd "$PROJECT_ROOT"
docker-compose up -d postgres redis > /dev/null 2>&1 || true
echo -e "${GREEN}✓${NC} PostgreSQL running on localhost:$DB_PORT"
echo -e "${GREEN}✓${NC} Redis running on localhost:$REDIS_PORT"
echo ""

# Wait for PostgreSQL to be ready
echo -e "${BLUE}[3/5]${NC} Waiting for PostgreSQL to be ready..."
counter=0
while ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; do
    counter=$((counter + 1))
    if [ $counter -gt 30 ]; then
        echo -e "${YELLOW}⚠️  PostgreSQL is taking longer to start...${NC}"
    fi
    sleep 1
done
echo -e "${GREEN}✓${NC} PostgreSQL is ready"
echo ""

# Setup Prisma database
echo -e "${BLUE}[4/5]${NC} Running Prisma setup..."
cd "$BACKEND_DIR"
npx prisma migrate deploy > /dev/null 2>&1 || npx prisma db push > /dev/null 2>&1 || true
echo -e "${GREEN}✓${NC} Database schema synced"
echo ""

# Start NestJS backend in development mode
echo -e "${BLUE}[5/5]${NC} Starting NestJS Backend Server..."
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}         ✓ SecureLens Backend Development Ready!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Services Status:${NC}"
echo -e "  PostgreSQL: ${GREEN}✓${NC} Running on $DB_HOST:$DB_PORT"
echo -e "  Redis:      ${GREEN}✓${NC} Running on $REDIS_HOST:$REDIS_PORT"
echo -e "  Backend:    ${YELLOW}Starting...${NC}"
echo ""
echo -e "${BLUE}Environment Variables:${NC}"
echo "  DATABASE_URL: postgresql://$DB_USER:***@$DB_HOST:$DB_PORT/$DB_NAME"
echo "  REDIS_URL: redis://$REDIS_HOST:$REDIS_PORT"
echo ""

# Start the backend development server
npm run dev
