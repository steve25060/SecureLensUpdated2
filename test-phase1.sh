#!/bin/bash

# Test script for Phase 1 Foundation Pipeline

echo "================================================"
echo "Phase 1: Foundation Pipeline - Validation Tests"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counters
PASSED=0
FAILED=0

# Test function
test_step() {
    local description=$1
    local command=$2
    
    echo -n "Testing: $description... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
        return 1
    fi
}

echo "=== SUBTASK 1: Database Persistence Layer ==="
echo ""

# Check if backend compiles
test_step "Backend TypeScript compilation" \
    "cd /home/stavan/SecureLens/apps/backend && npm run build"

# Check if services no longer have mock data
test_step "WorkspacesService removed mock data" \
    "! grep -q 'SEED_WORKSPACES' /home/stavan/SecureLens/apps/backend/src/workspaces/workspaces.service.ts"

test_step "ScansService removed mock data" \
    "! grep -q 'SEED_SCANS' /home/stavan/SecureLens/apps/backend/src/scans/scans.service.ts"

test_step "FindingsService removed mock data" \
    "! grep -q 'SEED_FINDINGS' /home/stavan/SecureLens/apps/backend/src/findings/findings.service.ts"

test_step "ReportsService removed mock data" \
    "! grep -q 'SEED_REPORTS' /home/stavan/SecureLens/apps/backend/src/reports/reports.service.ts"

# Check if services use Prisma
test_step "WorkspacesService uses Prisma" \
    "grep -q 'this.prisma' /home/stavan/SecureLens/apps/backend/src/workspaces/workspaces.service.ts"

test_step "ScansService uses Prisma" \
    "grep -q 'this.prisma' /home/stavan/SecureLens/apps/backend/src/scans/scans.service.ts"

test_step "FindingsService uses Prisma" \
    "grep -q 'this.prisma' /home/stavan/SecureLens/apps/backend/src/findings/findings.service.ts"

test_step "ReportsService uses Prisma" \
    "grep -q 'this.prisma' /home/stavan/SecureLens/apps/backend/src/reports/reports.service.ts"

echo ""
echo "=== SUBTASK 2: Worker Architecture & BullMQ ==="
echo ""

# Check worker processor files
test_step "Base processor exists" \
    "test -f /home/stavan/SecureLens/apps/worker/src/processors/base.processor.ts"

test_step "Scan processor exists" \
    "test -f /home/stavan/SecureLens/apps/worker/src/processors/scan.processor.ts"

test_step "Parser processor exists" \
    "test -f /home/stavan/SecureLens/apps/worker/src/processors/parser.processor.ts"

test_step "Correlation processor exists" \
    "test -f /home/stavan/SecureLens/apps/worker/src/processors/correlation.processor.ts"

test_step "Scoring processor exists" \
    "test -f /home/stavan/SecureLens/apps/worker/src/processors/scoring.processor.ts"

# Check worker entry point
test_step "Worker entry point exists" \
    "test -f /home/stavan/SecureLens/apps/worker/src/index.ts"

# Check for BullMQ usage
test_step "Base processor imports BullMQ" \
    "grep -q \"from 'bullmq'\" /home/stavan/SecureLens/apps/worker/src/processors/base.processor.ts"

test_step "Worker entry point imports processors" \
    "grep -q 'ScanProcessor\|ParserProcessor' /home/stavan/SecureLens/apps/worker/src/index.ts"

# Check scan orchestrator uses queue service
test_step "ScanOrchestratorService imports QueueService" \
    "grep -q 'QueueService' /home/stavan/SecureLens/apps/backend/src/scan-orchestrator/scan-orchestrator.service.ts"

test_step "ScanOrchestratorService enqueues jobs" \
    "grep -q 'this.queueService.addScanJob' /home/stavan/SecureLens/apps/backend/src/scan-orchestrator/scan-orchestrator.service.ts"

echo ""
echo "=== SUBTASK 3: Gitleaks Scanner - End-to-End ==="
echo ""

# Check Dockerfile
test_step "Gitleaks Dockerfile created" \
    "test -f /home/stavan/SecureLens/scanner-images/gitleaks/Dockerfile"

test_step "Dockerfile uses gitleaks image" \
    "grep -q 'gitleaks' /home/stavan/SecureLens/scanner-images/gitleaks/Dockerfile"

# Check scanner executor
test_step "Gitleaks scanner executor exists" \
    "test -f /home/stavan/SecureLens/apps/worker/src/scanners/gitleaks.scanner.ts"

test_step "Gitleaks scanner has scanRepository method" \
    "grep -q 'scanRepository' /home/stavan/SecureLens/apps/worker/src/scanners/gitleaks.scanner.ts"

test_step "Gitleaks scanner has parseGitleaksResults method" \
    "grep -q 'parseGitleaksResults' /home/stavan/SecureLens/apps/worker/src/scanners/gitleaks.scanner.ts"

# Check result parser
test_step "GitleaksParser in result parser" \
    "grep -q 'GitleaksParser' /home/stavan/SecureLens/apps/backend/src/parsers/result-parser.service.ts"

test_step "GitleaksParser implements IScannerParser" \
    "grep -q 'implements IScannerParser' /home/stavan/SecureLens/apps/backend/src/parsers/result-parser.service.ts && grep -q 'class GitleaksParser' /home/stavan/SecureLens/apps/backend/src/parsers/result-parser.service.ts"

test_step "GitleaksParser canHandle method" \
    "grep -A 3 'class GitleaksParser' /home/stavan/SecureLens/apps/backend/src/parsers/result-parser.service.ts | grep -q 'canHandle'"

test_step "GitleaksParser parse method" \
    "grep -A 20 'class GitleaksParser' /home/stavan/SecureLens/apps/backend/src/parsers/result-parser.service.ts | grep -q 'parse'"

# Check scan orchestrator updated
test_step "ScanOrchestratorService enqueues instead of mock" \
    "grep -q 'addScanJob' /home/stavan/SecureLens/apps/backend/src/scan-orchestrator/scan-orchestrator.service.ts && ! grep -q 'activeScanJobs.set' /home/stavan/SecureLens/apps/backend/src/scan-orchestrator/scan-orchestrator.service.ts"

echo ""
echo "=== SUBTASK 4: Integration Checks ==="
echo ""

# Check findings can be created
test_step "FindingsService has create method" \
    "grep -q 'async create' /home/stavan/SecureLens/apps/backend/src/findings/findings.service.ts"

# Check processors handle database operations
test_step "ParserProcessor creates findings in DB" \
    "grep -q 'prisma.finding.create' /home/stavan/SecureLens/apps/worker/src/processors/parser.processor.ts"

test_step "ScoringProcessor updates scan riskScore" \
    "grep -q 'riskScore' /home/stavan/SecureLens/apps/worker/src/processors/scoring.processor.ts"

echo ""
echo "================================================"
echo "Test Results:"
echo "================================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
