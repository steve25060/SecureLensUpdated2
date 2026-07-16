import { Controller, Get, Post, Body, Param, UseGuards, Req, Delete, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ScansService } from './scans.service';

interface AuthRequest { user?: { id?: string; userId?: string } }

// Available engines per mode (display names only, no actual tool names exposed)
const AVAILABLE_ENGINES = {
  website: [
    { id: 'asset_discovery', name: 'Asset Discovery', description: 'Discover external attack surface', category: 'Reconnaissance' },
    { id: 'vulnerability_detection', name: 'Vulnerability Scanner', description: 'Detect known vulnerabilities and CVEs', category: 'Vulnerability' },
    { id: 'runtime_security', name: 'Runtime Security', description: 'Test runtime security issues', category: 'Dynamic' },
    { id: 'ssl_tls_analysis', name: 'SSL/TLS Analysis', description: 'Analyze SSL/TLS configuration', category: 'Infrastructure' },
    { id: 'tech_detection', name: 'Technology Detection', description: 'Identify web technologies', category: 'Reconnaissance' },
  ],
  github: [
    { id: 'code_security', name: 'Code Security', description: 'Scan source code for issues', category: 'SAST' },
    { id: 'secret_detection', name: 'Secret Detection', description: 'Detect exposed secrets', category: 'Secret' },
    { id: 'dependency_analysis', name: 'Dependency Analysis', description: 'Analyze dependencies for vulns', category: 'SCA' },
  ],
  combined: [
    { id: 'asset_discovery', name: 'Asset Discovery', description: 'Discover external attack surface', category: 'Reconnaissance' },
    { id: 'vulnerability_detection', name: 'Vulnerability Scanner', description: 'Detect known vulnerabilities', category: 'Vulnerability' },
    { id: 'code_security', name: 'Code Security', description: 'Scan source code for issues', category: 'SAST' },
    { id: 'secret_detection', name: 'Secret Detection', description: 'Detect exposed secrets', category: 'Secret' },
  ],
};

@Controller('scans')
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  // ===== PUBLIC ENDPOINTS (No Auth Required) =====

  // Get available engines for a mode
  @Get('engines/mode/:mode')
  getEnginesForMode(@Param('mode') mode: string) {
    return AVAILABLE_ENGINES[mode as keyof typeof AVAILABLE_ENGINES] || [];
  }

  // Get all available engines
  @Get('engines/available')
  getAvailableEngines() {
    const allEngines: any[] = [];
    Object.values(AVAILABLE_ENGINES).forEach(engines => {
      allEngines.push(...engines);
    });
    // Deduplicate by id
    const seen = new Set();
    return allEngines.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }

  // Get constants
  @Get('constants')
  getConstants() {
    return AVAILABLE_ENGINES;
  }

  // ===== SEMI-PUBLIC ENDPOINTS (Can work without strict auth) =====

  // Get scan status
  @Get(':id/status')
  async getScanStatus(@Param('id') id: string) {
    return this.scansService.getScanStatus(id);
  }

  // Get scan results
  @Get(':id/results')
  async getScanResults(@Param('id') id: string) {
    return this.scansService.getScanResults(id);
  }

  // Get scan logs
  @Get(':id/logs')
  getLogs(@Param('id') id: string) {
    return this.scansService.getLogs(id);
  }

  // Get single scan
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scansService.findOne(id);
  }

  // ===== AUTHENTICATED ENDPOINTS =====

  // Create scan
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async create(@Req() req: AuthRequest, @Body() body: any) {
    const userId = req.user?.id || req.user?.userId || 'demo';
    return this.scansService.create(userId, body);
  }

  // Start scan
  @Post(':id/start')
  @UseGuards(AuthGuard('jwt'))
  async startScan(@Param('id') id: string) {
    return this.scansService.startScan(id);
  }

  // Cancel scan
  @Delete(':id/cancel')
  @UseGuards(AuthGuard('jwt'))
  async cancelScan(@Param('id') id: string) {
    return this.scansService.cancelScan(id);
  }

  // Get workspace scans
  @Get('workspace/:workspaceId')
  @UseGuards(AuthGuard('jwt'))
  async getWorkspaceScans(@Param('workspaceId') workspaceId: string) {
    return this.scansService.getWorkspaceScans(workspaceId);
  }

  // Get stats
  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  getStats(@Req() req: AuthRequest) {
    const userId = req.user?.id || req.user?.userId || 'demo';
    return this.scansService.getStats(userId);
  }

  // Get all scans
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Req() req: AuthRequest) {
    const userId = req.user?.id || req.user?.userId || 'demo';
    return this.scansService.findAll(userId);
  }
}
