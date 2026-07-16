import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScansService {
  private readonly logger = new Logger(ScansService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    try {
      return await this.prisma.scan.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 20,
      });
    } catch (error) {
      this.logger.error(`Failed to fetch scans for user ${userId}:`, error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const scan = await this.prisma.scan.findUnique({ where: { id } });
      if (!scan) {
        throw new Error(`Scan not found: ${id}`);
      }
      return scan;
    } catch (error) {
      this.logger.error(`Failed to fetch scan ${id}:`, error);
      throw error;
    }
  }

  async getLogs(scanId: string) {
    try {
      return await this.prisma.scanLog.findMany({
        where: { scanId },
        orderBy: { timestamp: 'asc' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch logs for scan ${scanId}:`, error);
      throw error;
    }
  }

  async create(userId: string, data: { workspaceId: string; type: string; target: string; engines: string[] }) {
    try {
      return await this.prisma.scan.create({
        data: { ...data as any, userId, status: 'QUEUED' },
      });
    } catch (error) {
      this.logger.error(`Failed to create scan for user ${userId}:`, error);
      throw error;
    }
  }

  async getStats(userId: string) {
    try {
      const total = await this.prisma.scan.count({ where: { userId } });
      const completed = await this.prisma.scan.count({ where: { userId, status: 'COMPLETED' } });
      const failed = await this.prisma.scan.count({ where: { userId, status: 'FAILED' } });
      return { total, completed, failed };
    } catch (error) {
      this.logger.error(`Failed to get scan stats for user ${userId}:`, error);
      throw error;
    }
  }

  async startScan(scanId: string) {
    try {
      return await this.prisma.scan.update({
        where: { id: scanId },
        data: { status: 'RUNNING', startedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`Failed to start scan ${scanId}:`, error);
      throw error;
    }
  }

  async getScanStatus(scanId: string) {
    try {
      const scan = await this.prisma.scan.findUnique({ where: { id: scanId } });
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
      this.logger.error(`Failed to get scan status for ${scanId}:`, error);
      throw error;
    }
  }

  async getScanResults(scanId: string) {
    try {
      const scan = await this.prisma.scan.findUnique({
        where: { id: scanId },
        include: { findings: true },
      });
      if (!scan) {
        throw new Error(`Scan not found: ${scanId}`);
      }
      return {
        scanId: scan.id,
        status: scan.status,
        mode: scan.type?.toLowerCase() || 'website',
        targetUrl: scan.target,
        engines: scan.engines,
        findings: scan.findings,
        startedAt: scan.startedAt,
        completedAt: scan.finishedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to get scan results for ${scanId}:`, error);
      throw error;
    }
  }

  async cancelScan(scanId: string) {
    try {
      return await this.prisma.scan.update({
        where: { id: scanId },
        data: { status: 'CANCELLED' },
      });
    } catch (error) {
      this.logger.error(`Failed to cancel scan ${scanId}:`, error);
      throw error;
    }
  }

  async getWorkspaceScans(workspaceId: string) {
    try {
      return await this.prisma.scan.findMany({
        where: { workspaceId },
        orderBy: { startedAt: 'desc' },
        take: 20,
      });
    } catch (error) {
      this.logger.error(`Failed to fetch workspace scans for ${workspaceId}:`, error);
      throw error;
    }
  }
}
