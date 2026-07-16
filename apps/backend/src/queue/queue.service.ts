import { Injectable, Logger } from '@nestjs/common';
import Queue, { Job } from 'bull';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private scanQueue: Queue.Queue;
  private parserQueue: Queue.Queue;
  private correlationQueue: Queue.Queue;
  private scoringQueue: Queue.Queue;

  constructor(private configService: ConfigService) {
    this.initializeQueues();
  }

  /**
   * Initialize all queues
   */
  private initializeQueues() {
    try {
      const redisUrl = this.configService.get('REDIS_URL', 'redis://localhost:6380');

      // Scan execution queue
      this.scanQueue = new Queue('scans', redisUrl);
      this.logger.log('Scan queue initialized');

      // Result parsing queue
      this.parserQueue = new Queue('parser', redisUrl);
      this.logger.log('Parser queue initialized');

      // Finding correlation queue
      this.correlationQueue = new Queue('correlation', redisUrl);
      this.logger.log('Correlation queue initialized');

      // Security scoring queue
      this.scoringQueue = new Queue('scoring', redisUrl);
      this.logger.log('Scoring queue initialized');

      // Setup event listeners
      this.setupQueueListeners();
    } catch (error) {
      this.logger.error(`Failed to initialize queues: ${error.message}`);
    }
  }

  /**
   * Setup event listeners for all queues
   */
  private setupQueueListeners() {
    this.scanQueue.on('completed', (job) => {
      this.logger.log(`Scan job ${job.id} completed`);
    });

    this.scanQueue.on('failed', (job, error) => {
      this.logger.error(`Scan job ${job.id} failed: ${error.message}`);
    });

    this.parserQueue.on('completed', (job) => {
      this.logger.log(`Parser job ${job.id} completed`);
    });

    this.correlationQueue.on('completed', (job) => {
      this.logger.log(`Correlation job ${job.id} completed`);
    });

    this.scoringQueue.on('completed', (job) => {
      this.logger.log(`Scoring job ${job.id} completed`);
    });
  }

  /**
   * Add a scan job to the queue
   */
  async addScanJob(data: {
    scanId: string;
    target: string;
    engines: string[];
    mode: string;
  }) {
    try {
      const job = await this.scanQueue.add(data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: false,
      });

      this.logger.log(`Scan job added to queue: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add scan job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add a parser job
   */
  async addParserJob(data: {
    scanId: string;
    engineId: string;
    rawResults: any;
  }) {
    try {
      const job = await this.parserQueue.add(data, {
        attempts: 2,
      });

      this.logger.log(`Parser job added to queue: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add parser job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add a correlation job
   */
  async addCorrelationJob(data: {
    scanId: string;
    findings: any[];
  }) {
    try {
      const job = await this.correlationQueue.add(data, {
        attempts: 2,
      });

      this.logger.log(`Correlation job added to queue: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add correlation job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add a scoring job
   */
  async addScoringJob(data: {
    scanId: string;
    findings: any[];
  }) {
    try {
      const job = await this.scoringQueue.add(data, {
        attempts: 2,
      });

      this.logger.log(`Scoring job added to queue: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add scoring job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get scan queue
   */
  getScanQueue() {
    return this.scanQueue;
  }

  /**
   * Get parser queue
   */
  getParserQueue() {
    return this.parserQueue;
  }

  /**
   * Get correlation queue
   */
  getCorrelationQueue() {
    return this.correlationQueue;
  }

  /**
   * Get scoring queue
   */
  getScoringQueue() {
    return this.scoringQueue;
  }

  /**
   * Get job status
   */
  async getJobStatus(queueType: string, jobId: number) {
    try {
      let queue;

      switch (queueType) {
        case 'scan':
          queue = this.scanQueue;
          break;
        case 'parser':
          queue = this.parserQueue;
          break;
        case 'correlation':
          queue = this.correlationQueue;
          break;
        case 'scoring':
          queue = this.scoringQueue;
          break;
        default:
          throw new Error(`Unknown queue type: ${queueType}`);
      }

      const job = await queue.getJob(jobId);
      if (!job) {
        return null;
      }

      const progress = job.progress();
      const state = await job.getState();
      const data = job.data;
      const result = job.returnvalue;

      return {
        id: job.id,
        state,
        progress,
        data,
        result,
        attempts: job.attemptsMade,
      };
    } catch (error) {
      this.logger.error(`Failed to get job status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear all queues
   */
  async clearQueues() {
    try {
      await this.scanQueue.clean(0, 'completed');
      await this.parserQueue.clean(0, 'completed');
      await this.correlationQueue.clean(0, 'completed');
      await this.scoringQueue.clean(0, 'completed');

      this.logger.log('All queues cleared');
    } catch (error) {
      this.logger.error(`Failed to clear queues: ${error.message}`);
    }
  }

  /**
   * Close queues
   */
  async closeQueues() {
    try {
      await this.scanQueue.close();
      await this.parserQueue.close();
      await this.correlationQueue.close();
      await this.scoringQueue.close();

      this.logger.log('All queues closed');
    } catch (error) {
      this.logger.error(`Failed to close queues: ${error.message}`);
    }
  }
}
