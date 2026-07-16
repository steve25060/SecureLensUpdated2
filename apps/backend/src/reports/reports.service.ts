import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    try {
      return await this.prisma.report.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch reports for user ${userId}:`, error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const report = await this.prisma.report.findUnique({ where: { id } });
      if (!report) {
        throw new Error(`Report not found: ${id}`);
      }
      return report;
    } catch (error) {
      this.logger.error(`Failed to fetch report ${id}:`, error);
      throw error;
    }
  }

  async create(userId: string, data: any) {
    try {
      const report = await this.prisma.report.create({
        data: { ...data, userId, status: 'PENDING' },
      });
      this.logger.log(`Report created: ${report.id}`);
      return report;
    } catch (error) {
      this.logger.error(`Failed to create report:`, error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.report.delete({ where: { id } });
      this.logger.log(`Report deleted: ${id}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete report ${id}:`, error);
      throw error;
    }
  }

  getStats() {
    return {
      reportsGenerated: 28,
      criticalFindings: 54,
      resolvedFindings: 96,
      avgRiskScore: 72,
    };
  }
}
