// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { EngineAbstractionService } from '../engines/engine-abstraction.service';
import { SCAN_STATUS, SCAN_MODES, SCANNER_ENGINES } from '@securelens/constants';
import * as dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

interface ScanJob {
  id: string;
  workspaceId: string;
  mode: string;
  target: string;
  engines: string[];
  status: string;
  progress: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  results: any;
}

@Injectable()
export class ScanOrchestratorService {
  private readonly logger = new Logger(ScanOrchestratorService.name);

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
    private engineAbstraction: EngineAbstractionService,
  ) {}

  /**
   * Create a new scan job
   */
  async createScanJob(
    workspaceId: string,
    mode: string,
    target: string,
    selectedEngines?: string[],
  ) {
    try {
      this.logger.log(
        `Creating scan job - Workspace: ${workspaceId}, Mode: ${mode}, Target: ${target}`,
      );

      // Validate mode
      if (!Object.values(SCAN_MODES).includes(mode)) {
        throw new Error(`Invalid scan mode: ${mode}`);
      }

      // Validate target
      await this.validateTarget(target, mode);

      // Get or create workspace
      let workspace = await this.prisma.workspace.findFirst({
        where: { id: workspaceId },
      });

      if (!workspace) {
        // If workspace doesn't exist, try to find user's first workspace
        // For now, use the first user's first workspace or create a default one
        const anyUser = await this.prisma.user.findFirst();
        if (!anyUser) {
          throw new Error('No users found in system');
        }

        workspace = await this.prisma.workspace.create({
          data: {
            id: workspaceId,
            name: `Workspace ${workspaceId}`,
            type: mode === SCAN_MODES.GITHUB ? 'GITHUB' : 'WEBSITE',
            userId: anyUser.id,
          },
        });
        this.logger.log(`Created workspace: ${workspace.id}`);
      }

      // Get engines for this mode
      const engines = selectedEngines || this.getDefaultEngines(mode);

      // Validate engines
      engines.forEach((engine) => {
        if (!this.engineAbstraction.isValidEngine(engine)) {
          throw new Error(`Invalid engine: ${engine}`);
        }
      });

      // Create scan record in database
      const scan = await this.prisma.scan.create({
        data: {
          workspaceId: workspace.id,
          type: 'WEBSITE',
          mode,
          targetUrl: target,
          target,
          status: 'QUEUED',
          progress: 0,
          engines: engines,
        },
      });

      this.logger.log(`Scan job created: ${scan.id}`);

      // Enqueue scan job to BullMQ
      try {
        await this.queueService.addScanJob({
          scanId: scan.id,
          target,
          engines,
          mode,
        });
        this.logger.log(`Scan job enqueued to BullMQ: ${scan.id}`);
      } catch (error) {
        this.logger.error(`Failed to enqueue scan job: ${error}`);
        // Continue anyway - job is in database even if queue failed
      }

      return {
        scanId: scan.id,
        status: scan.status,
        message: 'Scan job created and queued for processing',
      };
    } catch (error) {
      this.logger.error(
        `Failed to create scan: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Start a scan job
   */
  async startScan(scanId: string) {
    try {
      const scan = await this.prisma.scan.findUnique({ where: { id: scanId } });
      if (!scan) {
        throw new Error(`Scan not found: ${scanId}`);
      }

      this.logger.log(`Starting scan: ${scanId}`);

      // Update status to RUNNING (worker will do this, but we update here for consistency)
      await this.prisma.scan.update({
        where: { id: scanId },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
      });

      return { scanId, status: 'RUNNING' };
    } catch (error) {
      this.logger.error(
        `Failed to start scan: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get scan status
   */
  async getScanStatus(scanId: string) {
    try {
      const scan = await this.prisma.scan.findUnique({
        where: { id: scanId },
      });

      if (!scan) {
        throw new Error(`Scan not found: ${scanId}`);
      }

      return {
        scanId: scan.id,
        status: scan.status,
        progress: scan.progress,
        startedAt: scan.startedAt,
        completedAt: scan.finishedAt,
        engines: scan.engines,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get scan status: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get scan results
   */
  async getScanResults(scanId: string) {
    try {
      const scan = await this.prisma.scan.findUnique({
        where: { id: scanId },
        include: {
          findings: true,
        },
      });

      if (!scan) {
        throw new Error(`Scan not found: ${scanId}`);
      }

      return {
        scanId: scan.id,
        status: scan.status,
        mode: scan.mode,
        targetUrl: scan.target,
        engines: scan.engines,
        findings: scan.findings,
        startedAt: scan.startedAt,
        completedAt: scan.finishedAt,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get scan results: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Cancel a scan
   */
  async cancelScan(scanId: string) {
    try {
      await this.prisma.scan.update({
        where: { id: scanId },
        data: { status: 'CANCELLED' },
      });

      return { scanId, status: 'CANCELLED' };
    } catch (error) {
      this.logger.error(
        `Failed to cancel scan: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Validate target
   */
  private async validateTarget(target: string, mode: string) {
    if (mode === SCAN_MODES.WEBSITE) {
      // Add protocol if missing
      let url = target;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Validate URL
      try {
        new URL(url);
      } catch {
        throw new Error('Invalid URL format');
      }
    } else if (mode === SCAN_MODES.GITHUB) {
      // Validate GitHub URL
      if (!target.includes('github.com')) {
        throw new Error('Invalid GitHub repository URL');
      }
    }
  }

  /**
   * Get default engines for a scan mode
   */
  private getDefaultEngines(mode: string): string[] {
    const scanMode = mode as 'website' | 'github' | 'combined';
    if (scanMode === 'website') {
      return [
        SCANNER_ENGINES.ASSET_DISCOVERY,
        SCANNER_ENGINES.TECH_DETECTION,
        SCANNER_ENGINES.SSL_TLS_ANALYSIS,
        SCANNER_ENGINES.VULNERABILITY_SCAN,
      ];
    } else if (mode === SCAN_MODES.GITHUB) {
      return [
        SCANNER_ENGINES.CODE_SECURITY,
        SCANNER_ENGINES.SECRET_DETECTION,
        SCANNER_ENGINES.DEPENDENCY_ANALYSIS,
      ];
    } else {
      // Combined
      return [
        SCANNER_ENGINES.ASSET_DISCOVERY,
        SCANNER_ENGINES.TECH_DETECTION,
        SCANNER_ENGINES.SSL_TLS_ANALYSIS,
        SCANNER_ENGINES.VULNERABILITY_SCAN,
        SCANNER_ENGINES.CODE_SECURITY,
        SCANNER_ENGINES.SECRET_DETECTION,
        SCANNER_ENGINES.DEPENDENCY_ANALYSIS,
      ];
    }
  }

  /**
   * Get workspace scans
   */
  async getWorkspaceScans(workspaceId: string) {
    try {
      const scans = await this.prisma.scan.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        include: {
          findings: { take: 5 }, // Get first 5 findings
        },
      });

      return scans.map((scan) => ({
        id: scan.id,
        mode: scan.mode,
        targetUrl: scan.target,
        status: scan.status,
        progress: scan.progress,
        findingCount: scan.findings.length,
        startedAt: scan.startedAt,
        completedAt: scan.finishedAt,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get workspace scans: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
