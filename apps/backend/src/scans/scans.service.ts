import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ScanExecutor, ExecutionLog } from './engines/scan-executor';
import { enginesForMode, isValidEngineId, validEngineIdsForMode } from './engines/catalog';
import { Severity } from '@prisma/client';

/**
 * Shape of a scan record shared between DB and file fallback.
 */
export interface ScanRecord {
  id: string;
  workspaceId: string;
  userId: string;
  type: 'WEBSITE' | 'GITHUB' | 'COMBINED';
  mode: string;
  status: 'QUEUED' | 'PENDING' | 'RUNNING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  target: string;
  engines: string[];
  riskScore: number | null;
  findingsCount: number;
  progress: number;
  errorMessage?: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Transient — only kept for in-flight scans
  _logs?: ExecutionLog[];
}

const DATA_DIR = process.env.NODE_ENV === 'production'
  ? '/tmp/securelens-data'
  : join(process.cwd(), '.securelens-data');
const SCANS_FILE = join(DATA_DIR, 'scans.json');

@Injectable()
export class ScansService {
  private readonly logger = new Logger(ScansService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly executor: ScanExecutor,
  ) {}

  // ─── engines ────────────────────────────────────────────────────────────────

  getEnginesForMode(mode: string) {
    return enginesForMode(mode);
  }

  getAvailableEngines() {
    return enginesForMode('combined');
  }

  getConstants() {
    return {
      website: enginesForMode('website'),
      github: enginesForMode('github'),
      combined: enginesForMode('combined'),
    };
  }

  // ─── queries ────────────────────────────────────────────────────────────────

  async findAll(userId: string) {
    if (this.prisma.connected) {
      try {
        return await this.prisma.scan.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 30,
        });
      } catch (err: any) {
        this.logger.warn(`DB scan findAll failed (${err.message}) → file fallback`);
      }
    }
    return this.fileStore().filter(s => s.userId === userId);
  }

  async findOne(id: string) {
    if (this.prisma.connected) {
      try {
        const scan = await this.prisma.scan.findUnique({ where: { id } });
        if (scan) return scan;
      } catch (err: any) {
        this.logger.warn(`DB scan findOne failed (${err.message}) → file fallback`);
      }
    }
    const rec = this.fileStore().find(s => s.id === id);
    if (!rec) throw new NotFoundException(`Scan not found: ${id}`);
    return rec;
  }

  async getScanStatus(scanId: string) {
    const scan = await this.findOne(scanId) as any;
    return {
      scanId: scan.id,
      status: scan.status,
      progress: scan.progress ?? 0,
      startedAt: scan.startedAt,
      completedAt: scan.completedAt,
      engines: scan.engines ?? [],
    };
  }

  async getScanResults(scanId: string) {
    const scan = await this.findOne(scanId) as any;
    let findings: any[] = [];
    if (this.prisma.connected) {
      try {
        findings = await this.prisma.finding.findMany({ where: { scanId }, orderBy: { createdAt: 'desc' } });
      } catch { /* ignore */ }
    }
    return {
      scanId: scan.id,
      status: scan.status,
      mode: scan.mode ?? scan.type?.toLowerCase() ?? 'website',
      targetUrl: scan.target,
      engines: scan.engines ?? [],
      findings,
      startedAt: scan.startedAt,
      completedAt: scan.completedAt,
    };
  }

  async getLogs(scanId: string): Promise<ExecutionLog[]> {
    const rec = this.fileStore().find(s => s.id === scanId);
    return rec?._logs ?? [];
  }

  async getWorkspaceScans(workspaceId: string) {
    if (this.prisma.connected) {
      try {
        return await this.prisma.scan.findMany({
          where: { workspaceId },
          orderBy: { createdAt: 'desc' },
          take: 30,
        });
      } catch (err: any) {
        this.logger.warn(`DB workspace scans failed (${err.message}) → file fallback`);
      }
    }
    return this.fileStore().filter(s => s.workspaceId === workspaceId);
  }

  async getStats(userId: string) {
    if (this.prisma.connected) {
      try {
        const [total, completed, failed] = await Promise.all([
          this.prisma.scan.count({ where: { userId } }),
          this.prisma.scan.count({ where: { userId, status: 'COMPLETED' } }),
          this.prisma.scan.count({ where: { userId, status: 'FAILED' } }),
        ]);
        return { total, completed, failed };
      } catch (err: any) {
        this.logger.warn(`DB scan stats failed (${err.message}) → file fallback`);
      }
    }
    const mine = this.fileStore().filter(s => s.userId === userId);
    return {
      total: mine.length,
      completed: mine.filter(s => s.status === 'COMPLETED').length,
      failed: mine.filter(s => s.status === 'FAILED').length,
    };
  }

  // ─── create + start ──────────────────────────────────────────────────────────

  async create(userId: string, data: { workspaceId: string; mode?: string; target: string; engines: string[] }) {
    const mode = (data.mode ?? 'website').toLowerCase();
    const validForMode = validEngineIdsForMode(mode);
    const engines = (data.engines ?? []).filter(e => isValidEngineId(e));

    if (engines.length === 0) {
      // default to all engines for the mode
      engines.push(...validForMode);
    }
    if (!data.workspaceId) throw new BadRequestException('workspaceId is required');
    if (!data.target) throw new BadRequestException('target is required');

    const type = mode.toUpperCase() as ScanRecord['type']; // WEBSITE | GITHUB | COMBINED

    const base = {
      workspaceId: data.workspaceId,
      userId,
      type,
      mode,
      target: data.target,
      engines,
      riskScore: null as number | null,
      findingsCount: 0,
      progress: 0,
      status: 'QUEUED' as ScanRecord['status'],
    };

    if (this.prisma.connected) {
      try {
        const created = await this.prisma.scan.create({
          data: { ...base, status: 'QUEUED' } as any,
        });
        this.logger.log(`Scan created (DB): ${created.id}`);
        return created;
      } catch (err: any) {
        this.logger.warn(`DB scan create failed (${err.message}) → file fallback`);
      }
    }

    const nowIso = new Date().toISOString();
    const record: ScanRecord = {
      ...base,
      id: randomUUID(),
      errorMessage: null,
      startedAt: null,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    const store = this.fileStore();
    store.unshift(record);
    this.writeFile(store);
    this.logger.log(`Scan created (file): ${record.id}`);
    return record;
  }

  /**
   * Starts (and, since there is no worker, immediately executes) a scan.
   * Execution runs asynchronously; progress is reflected via getScanStatus().
   */
  async startScan(scanId: string) {
    const scan = (await this.findOne(scanId)) as any;

    // Mark RUNNING
    await this.setStatus(scanId, 'RUNNING', { progress: 0, startedAt: new Date() as any });

    const userId = scan.userId;
    const workspaceId = scan.workspaceId;
    const target = scan.target;
    const engines: string[] = scan.engines ?? [];

    // Fire and forget — the live-scan page polls status.
    this.executor
      .execute(scanId, workspaceId, target, engines)
      .then(async (result) => {
        // Emit notifications
        try {
          if (result.findingsCreated > 0) {
            const critical = result.findings.filter(f => f.severity === 'CRITICAL').length;
            await this.notifications.create({
              userId,
              title: 'Scan Completed',
              body: `Scan of ${target} found ${result.findingsCreated} finding${result.findingsCreated === 1 ? '' : 's'} (risk score ${result.riskScore}/100).`,
              type: critical > 0 ? 'error' : 'success',
              category: 'scan',
              metadata: { scanId, workspaceId, findings: result.findingsCreated, riskScore: result.riskScore },
            });
            if (critical > 0) {
              await this.notifications.create({
                userId,
                title: `${critical} Critical Finding${critical === 1 ? '' : 's'}`,
                body: `Scan of ${target} reported ${critical} critical-severity issue${critical === 1 ? '' : 's'}. Review immediately.`,
                type: 'error',
                category: 'finding',
                metadata: { scanId },
              });
            }
          } else {
            await this.notifications.create({
              userId,
              title: 'Scan Completed',
              body: `Scan of ${target} completed with no findings. Nice work!`,
              type: 'success',
              category: 'scan',
              metadata: { scanId },
            });
          }
        } catch (e: any) {
          this.logger.warn(`Notification emit failed: ${e.message}`);
        }
      })
      .catch(async (err) => {
        await this.setStatus(scanId, 'FAILED', { errorMessage: err.message });
        try {
          await this.notifications.create({
            userId,
            title: 'Scan Failed',
            body: `Scan of ${target} failed: ${err.message}`,
            type: 'error',
            category: 'scan',
            metadata: { scanId },
          });
        } catch {}
      });

    return { id: scanId, status: 'RUNNING', message: 'Scan started' };
  }

  async cancelScan(scanId: string) {
    return this.setStatus(scanId, 'CANCELLED');
  }

  // ─── helpers ─────────────────────────────────────────────────────────────────

  private async setStatus(
    scanId: string,
    status: ScanRecord['status'],
    extra: Partial<ScanRecord> = {},
  ) {
    if (this.prisma.connected) {
      try {
        await this.prisma.scan.update({ where: { id: scanId }, data: { status, ...extra } as any });
        return;
      } catch (err: any) {
        this.logger.warn(`DB setStatus failed (${err.message}) → file fallback`);
      }
    }
    const store = this.fileStore();
    const idx = store.findIndex(s => s.id === scanId);
    if (idx !== -1) {
      store[idx] = { ...store[idx], ...extra, status, updatedAt: new Date().toISOString() };
      this.writeFile(store);
    }
  }

  private fileStore(): ScanRecord[] {
    try {
      if (!existsSync(SCANS_FILE)) {
        mkdirSync(dirname(SCANS_FILE), { recursive: true });
        this.writeFile([]);
        return [];
      }
      const raw = readFileSync(SCANS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err: any) {
      this.logger.error(`Scans file read failed: ${err.message}`);
      return [];
    }
  }
  private writeFile(store: ScanRecord[]) {
    try {
      mkdirSync(dirname(SCANS_FILE), { recursive: true });
      writeFileSync(SCANS_FILE, JSON.stringify(store, null, 2));
    } catch (err: any) {
      this.logger.error(`Scans file write failed: ${err.message}`);
    }
  }
}
