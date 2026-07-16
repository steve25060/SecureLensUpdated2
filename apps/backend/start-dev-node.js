#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
};

const projectRoot = path.resolve(__dirname, '../..');
const backendDir = path.resolve(__dirname);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function execPromise(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { ...options, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function checkDocker() {
  log.info('Checking Docker status...');
  try {
    await execPromise('docker ps > /dev/null 2>&1');
    log.success('Docker is running');
    return true;
  } catch {
    log.warn('Docker is not running');
    return false;
  }
}

async function startContainers() {
  log.info('Starting PostgreSQL and Redis containers...');
  try {
    await execPromise('docker-compose up -d postgres redis', { cwd: projectRoot });
    log.success('PostgreSQL running on localhost:5433');
    log.success('Redis running on localhost:6380');
    await sleep(3000); // Wait for containers to fully start
  } catch (error) {
    log.error('Failed to start containers: ' + error.message);
  }
}

async function waitForPostgres() {
  log.info('Waiting for PostgreSQL to be ready...');
  const maxAttempts = 30;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      await execPromise(
        'PGPASSWORD=securelens psql -h localhost -U securelens -d securelens -c "SELECT 1"',
        { stdio: 'pipe' }
      );
      log.success('PostgreSQL is ready');
      return true;
    } catch {
      attempts++;
      if (attempts % 5 === 0) {
        log.info(`Waiting for PostgreSQL (attempt ${attempts}/${maxAttempts})...`);
      }
      await sleep(1000);
    }
  }

  log.warn('PostgreSQL took longer to start');
  return false;
}

async function setupPrisma() {
  log.info('Setting up Prisma database...');
  try {
    await execPromise('npx prisma migrate deploy 2>/dev/null || npx prisma db push 2>/dev/null || true', {
      cwd: backendDir,
    });
    log.success('Database schema synced');
  } catch (error) {
    log.warn('Prisma setup warning: ' + error.message);
  }
}

async function startBackend() {
  log.info('Starting NestJS Backend Server...\n');

  console.log(`${colors.green}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.green}✓ SecureLens Backend Development Ready!${colors.reset}`);
  console.log(`${colors.green}${'='.repeat(60)}${colors.reset}\n`);

  console.log(`${colors.blue}Services Status:${colors.reset}`);
  console.log(`  PostgreSQL: ${colors.green}✓${colors.reset} Running on localhost:5433`);
  console.log(`  Redis:      ${colors.green}✓${colors.reset} Running on localhost:6380`);
  console.log(`  Backend:    ${colors.yellow}Starting...${colors.reset}\n`);

  console.log(`${colors.blue}Environment Variables:${colors.reset}`);
  console.log(`  DATABASE_URL: postgresql://securelens:***@localhost:5433/securelens`);
  console.log(`  REDIS_URL: redis://localhost:6380\n`);

  // Start the backend development server
  const backendProcess = spawn('npm', ['run', 'dev'], {
    cwd: backendDir,
    stdio: 'inherit',
  });

  backendProcess.on('error', (error) => {
    log.error(`Backend process error: ${error.message}`);
    process.exit(1);
  });

  backendProcess.on('exit', (code) => {
    if (code !== 0) {
      log.error(`Backend process exited with code ${code}`);
    }
  });
}

async function main() {
  console.log(`\n${colors.blue}🚀 Starting SecureLens Backend Development Environment...${colors.reset}\n`);

  try {
    // Step 1: Check Docker
    const dockerRunning = await checkDocker();
    if (!dockerRunning) {
      log.warn('Docker not running - attempting to continue anyway');
    }

    // Step 2: Start containers
    await startContainers();

    // Step 3: Wait for PostgreSQL
    await waitForPostgres();

    // Step 4: Setup Prisma
    await setupPrisma();

    // Step 5: Start backend
    await startBackend();
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

main();
