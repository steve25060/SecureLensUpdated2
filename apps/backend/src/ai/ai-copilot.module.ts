import { Module } from '@nestjs/common';
import { AICopilotService } from './ai-copilot.service';
import { AICopilotController } from './ai-copilot.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [AICopilotService, PrismaService],
  controllers: [AICopilotController],
  exports: [AICopilotService],
})
export class AICopilotModule {}
