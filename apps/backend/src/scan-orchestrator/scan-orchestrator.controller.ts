import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScanOrchestratorService } from './scan-orchestrator.service';
import { EngineAbstractionService } from '../engines/engine-abstraction.service';

@Controller('api/scans')
@UseGuards(JwtAuthGuard)
export class ScanOrchestratorController {
  constructor(
    private scanOrchestrator: ScanOrchestratorService,
    private engineAbstraction: EngineAbstractionService,
  ) {}

  /**
   * Create a new scan
   */
  @Post('create')
  @HttpCode(201)
  async createScan(
    @Body()
    body: {
      workspaceId?: string;
      mode: string;
      target: string;
      engines?: string[];
    },
  ) {
    // If no workspaceId provided, use a default one
    const workspaceId = body.workspaceId || 'default-workspace';
    
    return this.scanOrchestrator.createScanJob(
      workspaceId,
      body.mode,
      body.target,
      body.engines,
    );
  }

  /**
   * Start a scan
   */
  @Post(':scanId/start')
  async startScan(@Param('scanId') scanId: string) {
    return this.scanOrchestrator.startScan(scanId);
  }

  /**
   * Get scan status
   */
  @Get(':scanId/status')
  async getScanStatus(@Param('scanId') scanId: string) {
    return this.scanOrchestrator.getScanStatus(scanId);
  }

  /**
   * Get scan results
   */
  @Get(':scanId/results')
  async getScanResults(@Param('scanId') scanId: string) {
    return this.scanOrchestrator.getScanResults(scanId);
  }

  /**
   * Cancel a scan
   */
  @Delete(':scanId/cancel')
  async cancelScan(@Param('scanId') scanId: string) {
    return this.scanOrchestrator.cancelScan(scanId);
  }

  /**
   * Get workspace scans
   */
  @Get('workspace/:workspaceId')
  async getWorkspaceScans(@Param('workspaceId') workspaceId: string) {
    return this.scanOrchestrator.getWorkspaceScans(workspaceId);
  }

  /**
   * Get available engines (safe for frontend - no tool names exposed)
   */
  @Get('engines/available')
  async getAvailableEngines() {
    return this.engineAbstraction.getAvailableEngines();
  }

  /**
   * Get engines for a scan mode
   */
  @Get('engines/mode/:mode')
  async getEnginesForMode(@Param('mode') mode: string) {
    return this.engineAbstraction.getEnginesForScanMode(
      mode as 'website' | 'github' | 'combined',
    );
  }

  /**
   * Get all constants for frontend
   */
  @Get('constants')
  async getConstants() {
    return this.engineAbstraction.getConstantsForFrontend();
  }
}
