import { Controller, Get, Post, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

interface AuthRequest { user?: { userId?: string } }

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.notificationsService.findAll(req.user?.userId ?? 'demo-user-1');
  }

  @Post(':id/read')
  markRead(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notificationsService.markRead(id, req.user?.userId ?? 'demo-user-1');
  }

  @Post('read-all')
  markAllRead(@Req() req: AuthRequest) {
    return this.notificationsService.markAllRead(req.user?.userId ?? 'demo-user-1');
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notificationsService.remove(id, req.user?.userId ?? 'demo-user-1');
  }
}
