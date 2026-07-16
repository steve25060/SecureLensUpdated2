import { Logger } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import Redis from 'ioredis';

/**
 * Base Processor Abstract Class
 * Provides common functionality for all job processors
 */
export abstract class BaseProcessor {
  protected readonly logger: Logger;
  protected redis: Redis;
  protected worker: Worker;

  constructor(
    protected queueName: string,
    protected processFunction: (job: Job) => Promise<any>,
  ) {
    this.logger = new Logger(this.constructor.name);
    this.setupRedis();
  }

  /**
   * Setup Redis connection
   */
  private setupRedis() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
    this.redis = new Redis(redisUrl);

    this.redis.on('error', (err) => {
      this.logger.error(`Redis error: ${err.message}`);
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected');
    });
  }

  /**
   * Start the processor
   */
  async start() {
    try {
      this.logger.log(`Starting processor for queue: ${this.queueName}`);

      this.worker = new Worker(this.queueName, this.processFunction, {
        connection: this.redis,
        concurrency: this.getConcurrency(),
      });

      // Setup event listeners
      this.setupEventListeners();

      this.logger.log(
        `Processor started successfully for queue: ${this.queueName}`,
      );
    } catch (error) {
      this.logger.error(`Failed to start processor: ${error}`);
      throw error;
    }
  }

  /**
   * Setup event listeners for the worker
   */
  protected setupEventListeners() {
    this.worker.on('completed', (job) => {
      this.logger.log(
        `Job ${job.id} completed successfully for queue ${this.queueName}`,
      );
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `Job ${job?.id} failed for queue ${this.queueName}: ${err.message}`,
      );
    });

    this.worker.on('error', (err) => {
      this.logger.error(`Worker error for queue ${this.queueName}: ${err}`);
    });

    this.worker.on('stalled', (jobId) => {
      this.logger.warn(`Job ${jobId} stalled for queue ${this.queueName}`);
    });
  }

  /**
   * Get concurrency level for this processor
   */
  protected getConcurrency(): number {
    return 3;
  }

  /**
   * Stop the processor
   */
  async stop() {
    try {
      if (this.worker) {
        await this.worker.close();
        this.logger.log(
          `Worker stopped for queue: ${this.queueName}`,
        );
      }
      if (this.redis) {
        await this.redis.quit();
        this.logger.log('Redis connection closed');
      }
    } catch (error) {
      this.logger.error(`Failed to stop processor: ${error}`);
      throw error;
    }
  }

  /**
   * Get processor name
   */
  getProcessorName(): string {
    return this.constructor.name;
  }

  /**
   * Get queue name
   */
  getQueueName(): string {
    return this.queueName;
  }
}
