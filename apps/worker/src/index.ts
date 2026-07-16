import { Logger } from '@nestjs/common';
import { ScanProcessor } from './processors/scan.processor';
import { ParserProcessor } from './processors/parser.processor';
import { CorrelationProcessor } from './processors/correlation.processor';
import { ScoringProcessor } from './processors/scoring.processor';

/**
 * Worker Entry Point
 * Starts all BullMQ job processors
 */
class SecureLensWorker {
  private readonly logger = new Logger(SecureLensWorker.name);
  private processors: any[] = [];

  async start() {
    try {
      this.logger.log('Starting SecureLens Worker...');

      // Initialize processors
      const scanProcessor = new ScanProcessor();
      const parserProcessor = new ParserProcessor();
      const correlationProcessor = new CorrelationProcessor();
      const scoringProcessor = new ScoringProcessor();

      this.processors = [
        scanProcessor,
        parserProcessor,
        correlationProcessor,
        scoringProcessor,
      ];

      // Start all processors
      for (const processor of this.processors) {
        try {
          await processor.start();
          this.logger.log(
            `✓ ${processor.getProcessorName()} started (queue: ${processor.getQueueName()})`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to start ${processor.getProcessorName()}: ${error}`,
          );
          throw error;
        }
      }

      this.logger.log('✓ All workers started successfully');
      this.logger.log('Worker is ready to process jobs');

      // Handle graceful shutdown
      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());
    } catch (error) {
      this.logger.error(`Failed to start worker: ${error}`);
      process.exit(1);
    }
  }

  async shutdown() {
    this.logger.log('Shutting down worker...');

    try {
      for (const processor of this.processors) {
        try {
          await processor.stop();
          this.logger.log(`✓ ${processor.getProcessorName()} stopped`);
        } catch (error) {
          this.logger.error(
            `Error stopping ${processor.getProcessorName()}: ${error}`,
          );
        }
      }

      this.logger.log('✓ Worker shutdown complete');
      process.exit(0);
    } catch (error) {
      this.logger.error(`Error during shutdown: ${error}`);
      process.exit(1);
    }
  }
}

// Start the worker
const worker = new SecureLensWorker();
worker.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
