import { Module } from '@nestjs/common';
import { ScanOrchestratorService } from './scan-orchestrator.service';
import { ScanOrchestratorController } from './scan-orchestrator.controller';
import { EngineAbstractionService } from '../engines/engine-abstraction.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [ScanOrchestratorService, EngineAbstractionService, PrismaService],
  controllers: [ScanOrchestratorController],
  exports: [ScanOrchestratorService, EngineAbstractionService],
})
export class ScanOrchestratorModule {}
