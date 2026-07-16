import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

interface AuthRequest { user?: { userId?: string; username?: string } }

@Controller('workspaces')
@UseGuards(AuthGuard('jwt'))
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.workspacesService.findAll(req.user?.userId ?? 'demo');
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(req.user?.userId ?? 'demo', dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workspacesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateWorkspaceDto>) {
    return this.workspacesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workspacesService.remove(id);
  }
}
