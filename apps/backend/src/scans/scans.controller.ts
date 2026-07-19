import { Controller, Get, Post, Body, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ScansService } from './scans.service';

interface AuthRequest { user?: { id?: string; userId?: string } }

/**
 * Scan endpoints. Engine listing is PUBLIC (the live-scan page loads engines
 * before the user is fully authenticated); create/start require JWT.
 *
 * Engine names returned here are the friendly ones ("Port Scanner", etc.)
 * defined in engines/catalog.ts.
 */
@Controller('scans')
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  // ===== PUBLIC (no auth) =====

  @Get('engines/mode/:mode')
  getEnginesForMode(@Param('mode') mode: string) {
    return this.scansService.getEnginesForMode(mode);
  }

  @Get('engines/available')
  getAvailableEngines() {
    return this.scansService.getAvailableEngines();
  }

  @Get('constants')
  getConstants() {
    return this.scansService.getConstants();
  }

  @Get(':id/status')
  getScanStatus(@Param('id') id: string) {
    return this.scansService.getScanStatus(id);
  }

  @Get(':id/results')
  getScanResults(@Param('id') id: string) {
    return this.scansService.getScanResults(id);
  }

  @Get(':id/logs')
  getLogs(@Param('id') id: string) {
    return this.scansService.getLogs(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scansService.findOne(id);
  }

  // ===== AUTHENTICATED =====

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  create(@Req() req: AuthRequest, @Body() body: any) {
    const userId = req.user?.id || req.user?.userId || 'demo-user-1';
    return this.scansService.create(userId, body);
  }

  @Post(':id/start')
  @UseGuards(AuthGuard('jwt'))
  startScan(@Param('id') id: string) {
    return this.scansService.startScan(id);
  }

  @Delete(':id/cancel')
  @UseGuards(AuthGuard('jwt'))
  cancelScan(@Param('id') id: string) {
    return this.scansService.cancelScan(id);
  }

  @Get('workspace/:workspaceId')
  @UseGuards(AuthGuard('jwt'))
  getWorkspaceScans(@Param('workspaceId') workspaceId: string) {
    return this.scansService.getWorkspaceScans(workspaceId);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  getStats(@Req() req: AuthRequest) {
    const userId = req.user?.id || req.user?.userId || 'demo-user-1';
    return this.scansService.getStats(userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Req() req: AuthRequest) {
    const userId = req.user?.id || req.user?.userId || 'demo-user-1';
    return this.scansService.findAll(userId);
  }
}
