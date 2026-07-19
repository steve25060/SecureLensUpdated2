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
    return this.reportsService.findAll(req.user?.userId ?? 'demo-user-1');
  }

  @Get('stats')
  getStats(@Req() req: AuthRequest) {
    return this.reportsService.getStats(req.user?.userId ?? 'demo-user-1');
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() body: any) {
    return this.reportsService.create(req.user?.userId ?? 'demo-user-1', body ?? {});
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
