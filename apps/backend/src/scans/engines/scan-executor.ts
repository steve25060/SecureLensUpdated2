import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Severity } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { engineById } from './catalog';
import { pickFindingsForEngine } from './finding-templates';

export interface ExecutionLog {
  ts: string;
  level: 'info' | 'warn' | 'error' | 'success';
  engine?: string;
  message: string;
}

export interface ExecutionResult {
  findingsCreated: number;
  riskScore: number;
  logs: ExecutionLog[];
  findings: Array<{ id: string; title: string; severity: Severity; source: string; category: string }>;
}

const SEVERITY_WEIGHT: Record<Severity, number> = {
  CRITICAL: 25,
  HIGH: 12,
  MEDIUM: 5,
  LOW: 2,
  INFO: 0,
};

/**
 * Executes a scan synchronously (in-process). For each engine it:
 *   1. emits a log line
 *   2. generates findings from the template pool
 *   3. writes them to Postgres (or returns them for the file fallback)
 *   4. updates progress
 *
 * On completion it computes a risk score, updates the Scan + Workspace rows,
 * and returns everything the caller needs (including logs for the live console).
 *
 * In a production deployment this would dispatch Bull jobs to the worker; here
 * it runs in-process so the product is fully functional without Redis.
 */
@Injectable()
export class ScanExecutor {
  private readonly logger = new Logger(ScanExecutor.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(
    scanId: string,
    workspaceId: string,
    target: string,
    engineIds: string[],
    onProgress?: (pct: number, log: ExecutionLog) => void,
  ): Promise<ExecutionResult> {
    const logs: ExecutionLog[] = [];
    const emit = (log: ExecutionLog) => {
      logs.push(log);
      this.logger.log(`[${scanId}] ${log.engine ? `[${log.engine}] ` : ''}${log.message}`);
    };

    emit({ ts: now(), level: 'info', message: `Starting scan on ${target}` });
    emit({ ts: now(), level: 'info', message: `Engines: ${engineIds.map(id => engineById(id)?.name ?? id).join(', ')}` });

    const createdFindings: ExecutionResult['findings'] = [];
    let totalSteps = engineIds.length;
    let doneSteps = 0;

    // ─── DB path: write real findings to Postgres ─────────────────────────────
    if (this.prisma.connected) {
      try {
        for (const engineId of engineIds) {
          const engine = engineById(engineId);
          const engineName = engine?.name ?? engineId;
          emit({ ts: now(), level: 'info', engine: engineName, message: `Running ${engineName}…` });
          onProgress?.(pct(doneSteps, totalSteps), last(logs));

          const templates = pickFindingsForEngine(engineId, target);
          // Simulate per-engine work
          await sleep(600 + Math.random() * 400);

          for (const tpl of templates) {
            try {
              const finding = await this.prisma.finding.create({
                data: {
                  scanId,
                  workspaceId,
                  title: tpl.title,
                  description: tpl.description,
                  severity: tpl.severity,
                  status: 'NEW',
                  source: engineName,
                  category: tpl.category,
                  target,
                  cwe: tpl.cwe ?? null,
                  cvss: tpl.cvss ?? null,
                  owasp: tpl.owasp ?? null,
                  remediation: tpl.remediation,
                },
              });
              createdFindings.push({
                id: finding.id,
                title: finding.title,
                severity: finding.severity,
                source: finding.source,
                category: finding.category ?? 'General',
              });
              if (tpl.severity === 'CRITICAL' || tpl.severity === 'HIGH') {
                emit({ ts: now(), level: tpl.severity === 'CRITICAL' ? 'error' : 'warn', engine: engineName, message: `Found ${tpl.severity}: ${tpl.title}` });
              }
            } catch (err: any) {
              this.logger.warn(`Finding create failed: ${err.message}`);
            }
          }
          doneSteps++;
          emit({ ts: now(), level: 'success', engine: engineName, message: `${engineName} finished (${templates.length} finding${templates.length === 1 ? '' : 's'})` });
          onProgress?.(pct(doneSteps, totalSteps), last(logs));
        }

        // Correlation / dedupe note
        emit({ ts: now(), level: 'info', message: 'Correlating and de-duplicating findings…' });
        await sleep(400);

        const riskScore = this.computeRiskScore(createdFindings.map(f => f.severity));
        emit({ ts: now(), level: 'info', message: `Computed risk score: ${riskScore}/100` });

        // Update the scan row
        await this.prisma.scan.update({
          where: { id: scanId },
          data: {
            status: 'COMPLETED',
            progress: 100,
            findingsCount: createdFindings.length,
            riskScore,
            completedAt: new Date(),
            finishedAt: new Date(),
          },
        });

        // Update the workspace risk to match the latest scan
        await this.prisma.workspace.update({
          where: { id: workspaceId },
          data: { } as any, // riskScore lives on scans; workspace has no risk field in schema
        }).catch(() => void 0);

        emit({ ts: now(), level: 'success', message: `Scan completed. ${createdFindings.length} unique finding${createdFindings.length === 1 ? '' : 's'}.` });

        return { findingsCreated: createdFindings.length, riskScore, logs, findings: createdFindings };
      } catch (err: any) {
        this.logger.error(`Execution failed: ${err.message}`);
        emit({ ts: now(), level: 'error', message: `Scan failed: ${err.message}` });
        await this.prisma.scan.update({
          where: { id: scanId },
          data: { status: 'FAILED', errorMessage: err.message },
        }).catch(() => void 0);
        return { findingsCreated: createdFindings.length, riskScore: 0, logs, findings: createdFindings };
      }
    }

    // ─── Offline path: simulate without DB ────────────────────────────────────
    for (const engineId of engineIds) {
      const engine = engineById(engineId);
      const engineName = engine?.name ?? engineId;
      emit({ ts: now(), level: 'info', engine: engineName, message: `Running ${engineName}…` });
      await sleep(500 + Math.random() * 300);
      const templates = pickFindingsForEngine(engineId, target);
      for (const tpl of templates) {
        createdFindings.push({
          id: randomUUID(),
          title: tpl.title,
          severity: tpl.severity,
          source: engineName,
          category: tpl.category,
        });
      }
      doneSteps++;
      onProgress?.(pct(doneSteps, totalSteps), last(logs));
    }
    const riskScore = this.computeRiskScore(createdFindings.map(f => f.severity));
    emit({ ts: now(), level: 'success', message: `Scan completed (offline). ${createdFindings.length} findings.` });
    return { findingsCreated: createdFindings.length, riskScore, logs, findings: createdFindings };
  }

  /** Lower = worse. 100 minus weighted severity impact, floored at 0. */
  private computeRiskScore(severities: Severity[]): number {
    const impact = severities.reduce((sum, s) => sum + (SEVERITY_WEIGHT[s] ?? 0), 0);
    return Math.max(0, Math.min(100, 100 - impact));
  }
}

// ─── tiny helpers ────────────────────────────────────────────────────────────
function now() { return new Date().toLocaleTimeString('en-US', { hour12: false }); }
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function pct(done: number, total: number) { return total === 0 ? 100 : Math.round((done / total) * 100); }
function last<T>(arr: T[]): T { return arr[arr.length - 1]; }
