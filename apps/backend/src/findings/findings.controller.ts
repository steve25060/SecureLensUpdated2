import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FindingsService } from './findings.service';

@Controller('findings')
@UseGuards(AuthGuard('jwt'))
export class FindingsController {
  constructor(private readonly findingsService: FindingsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.findingsService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.findingsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findingsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.findingsService.updateStatus(id, body.status);
  }
}
