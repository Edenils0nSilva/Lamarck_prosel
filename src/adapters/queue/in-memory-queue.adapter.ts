import { Injectable, Logger } from '@nestjs/common';
import { ProcessingHandler, ProcessingJob, QueuePort } from '../../ports';

/**
 * Fila em memória (esqueleto). Entrega o job ao handler de forma assíncrona
 * (fora do ciclo da requisição), preservando o desacoplamento do ADR-0001.
 * Será substituída por QueueAdapter (BullMQ/Redis) pela mesma porta.
 */
@Injectable()
export class InMemoryQueue implements QueuePort {
  private readonly logger = new Logger(InMemoryQueue.name);
  private handler?: ProcessingHandler;

  async enqueue(job: ProcessingJob): Promise<void> {
    if (!this.handler) {
      this.logger.warn('Nenhum handler registrado; job descartado.');
      return;
    }
    const handler = this.handler;
    // Dispara sem bloquear a requisição (simula o worker consumindo a fila).
    setImmediate(() => {
      handler(job).catch((err) =>
        this.logger.error(`Falha ao processar job ${job.documentId}: ${err}`),
      );
    });
  }

  process(handler: ProcessingHandler): void {
    this.handler = handler;
  }
}
