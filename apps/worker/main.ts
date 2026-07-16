import { Worker } from 'bullmq';
import { logger } from '@securelens/logger';

// Example worker setup – replace with actual job processors
const worker = new Worker('example-queue', async job => {
  logger.info({ jobId: job.id }, 'Processing job');
  // TODO: implement job handling logic
});

worker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Job failed');
});

logger.info('Worker started');
