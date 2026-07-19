import { Module } from '@nestjs/common';
import { ScansController } from './scans.controller';
import { ScansService } from './scans.service';
import { ScanExecutor } from './engines/scan-executor';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  // NotificationsModule exports NotificationsService, which ScansService uses to
  // emit "scan completed / critical finding" notifications.
  imports: [NotificationsModule],
  controllers: [ScansController],
  providers: [ScansService, ScanExecutor],
  exports: [ScansService, ScanExecutor],
})
export class ScansModule {}
