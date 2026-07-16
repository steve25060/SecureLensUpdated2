import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FindingsService {
  private readonly logger = new Logger(FindingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { workspaceId?: string; severity?: string; status?: string; source?: string; search?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 10, ...filters } = query;
    try {
      const where: any = {};
      if (filters.workspaceId) where.workspaceId = filters.workspaceId;
      if (filters.severity) where.severity = filters.severity;
      if (filters.status) where.status = filters.status;
      if (filters.source) where.source = filters.source;
      if (filters.search) where.title = { contains: filters.search, mode: 'insensitive' };

      const [items, total] = await Promise.all([
        this.prisma.finding.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { firstSeen: 'desc' },
        }),
        this.prisma.finding.count({ where }),
      ]);

      return { items, total, page, limit, pages: Math.ceil(total / limit) };
    } catch (error) {
      this.logger.error(`Failed to fetch findings:`, error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const finding = await this.prisma.finding.findUnique({ where: { id } });
      if (!finding) {
        throw new Error(`Finding not found: ${id}`);
      }
      return finding;
    } catch (error) {
      this.logger.error(`Failed to fetch finding ${id}:`, error);
      throw error;
    }
  }

  async updateStatus(id: string, status: string) {
    try {
      const finding = await this.prisma.finding.update({
        where: { id },
        data: { status: status as any },
      });
      this.logger.log(`Finding ${id} status updated to ${status}`);
      return finding;
    } catch (error) {
      this.logger.error(`Failed to update finding ${id}:`, error);
      throw error;
    }
  }

  async getStats() {
    try {
      const total = await this.prisma.finding.count();
      const critical = await this.prisma.finding.count({ where: { severity: 'CRITICAL' } });
      const high = await this.prisma.finding.count({ where: { severity: 'HIGH' } });
      const medium = await this.prisma.finding.count({ where: { severity: 'MEDIUM' } });
      const low = await this.prisma.finding.count({ where: { severity: 'LOW' } });
      const info = await this.prisma.finding.count({ where: { severity: 'INFO' } });

      return {
        total,
        bySeverity: { critical, high, medium, low, info },
        bySource: {},
        byCategory: {},
      };
    } catch (error) {
      this.logger.error(`Failed to get findings stats:`, error);
      throw error;
    }
  }

  async create(data: {
    scanId: string;
    workspaceId: string;
    title: string;
    description: string;
    severity: string;
    source: string;
    target: string;
    url?: string;
    parameter?: string;
    category?: string;
    cvss?: number;
    cwe?: string;
    owasp?: string;
  }) {
    try {
      const finding = await this.prisma.finding.create({
        data: {
          ...data,
          severity: data.severity as any,
          status: 'NEW',
        },
      });
      this.logger.log(`Finding created: ${finding.id}`);
      return finding;
    } catch (error) {
      this.logger.error(`Failed to create finding:`, error);
      throw error;
    }
  }
}
