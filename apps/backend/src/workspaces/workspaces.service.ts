import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    try {
      return await this.prisma.workspace.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch workspaces for user ${userId}:`, error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const workspace = await this.prisma.workspace.findUnique({ where: { id } });
      if (!workspace) {
        throw new Error(`Workspace not found: ${id}`);
      }
      return workspace;
    } catch (error) {
      this.logger.error(`Failed to fetch workspace ${id}:`, error);
      throw error;
    }
  }

  async create(userId: string, dto: CreateWorkspaceDto) {
    try {
      const workspace = await this.prisma.workspace.create({
        data: {
          ...dto,
          userId,
        },
      });
      this.logger.log(`Workspace created: ${workspace.id} for user ${userId}`);
      return workspace;
    } catch (error) {
      this.logger.error(`Failed to create workspace for user ${userId}:`, error);
      throw error;
    }
  }

  async update(id: string, dto: Partial<CreateWorkspaceDto>) {
    try {
      const workspace = await this.prisma.workspace.update({
        where: { id },
        data: dto,
      });
      this.logger.log(`Workspace updated: ${id}`);
      return workspace;
    } catch (error) {
      this.logger.error(`Failed to update workspace ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.workspace.delete({ where: { id } });
      this.logger.log(`Workspace deleted: ${id}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete workspace ${id}:`, error);
      throw error;
    }
  }

  async getStats(userId: string) {
    try {
      const total = await this.prisma.workspace.count({ where: { userId } });
      return { total };
    } catch (error) {
      this.logger.error(`Failed to get workspace stats for user ${userId}:`, error);
      throw error;
    }
  }
}
