import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'bullmq';
import { ProcessingHandler, ProcessingJob, QueuePort } from '../../ports';

const QUEUE_NAME = 'document-processing';

/**
 * Fila real sobre Redis (BullMQ). Implementa a mesma porta do in-memory (ADR-0001).
 * A API usa enqueue(); o worker registra o consumidor via process().
 */
@Injectable()
export class BullMqQueue implements QueuePort, OnModuleDestroy {
  private readonly logger = new Logger(BullMqQueue.name);
  private readonly connection: { host: string; port: number };
  private readonly queue: Queue;
  private worker?: Worker;

  constructor(config: ConfigService) {
    const url = new URL(config.get<string>('redis.url') ?? 'redis://localhost:6379');
    this.connection = { host: url.hostname, port: Number(url.port || 6379) };
    this.queue = new Queue(QUEUE_NAME, { connection: this.connection });
  }

  async enqueue(job: ProcessingJob): Promise<void> {
    await this.queue.add('process', job, {
      attempts: 1, // as tentativas de IA são tratadas no ProcessingService
      removeOnComplete: 1000,
      removeOnFail: 5000,
    });
  }

  process(handler: ProcessingHandler): void {
    if (this.worker) return;
    this.worker = new Worker<ProcessingJob>(
      QUEUE_NAME,
      async (job) => {
        await handler(job.data);
      },
      { connection: this.connection },
    );
    this.worker.on('failed', (job, err) =>
      this.logger.error(`Job ${job?.id} falhou: ${err?.message}`),
    );
    this.logger.log('Worker BullMQ registrado.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.queue.close();
  }
}
