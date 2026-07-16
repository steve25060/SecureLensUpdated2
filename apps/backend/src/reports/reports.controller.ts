import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

interface AuthRequest { user?: { userId?: string } }

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.reportsService.findAll(req.user?.userId ?? 'demo');
  }

  @Get('stats')
  getStats() {
    return this.reportsService.getStats();
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() body: any) {
    return this.reportsService.create(req.user?.userId ?? 'demo', body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }
}
