import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import {
  AI_CLASSIFICATION_PORT,
  AiClassificationPort,
  DOCUMENT_REPOSITORY_PORT,
  DocumentRepositoryPort,
  FILE_STORAGE_PORT,
  FileStoragePort,
  ProcessingJob,
  QUEUE_PORT,
  QueuePort,
} from '../ports';
import { DocumentStatus, ExtractionResult } from '../domain';
import { buildStandardizedName } from './naming';

/**
 * Processamento assíncrono (RF05–RF09, RF15). Consome a fila, chama a IA via porta
 * com novas tentativas (fato a), grava o resultado, propõe o nome padronizado e
 * aplica o limiar de confiança (ADR-0005): PROCESSADO ou PENDENTE_CONFERENCIA.
 */
@Injectable()
export class ProcessingService implements OnModuleInit {
  private readonly logger = new Logger(ProcessingService.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(QUEUE_PORT) private readonly queue: QueuePort,
    @Inject(AI_CLASSIFICATION_PORT) private readonly ai: AiClassificationPort,
    @Inject(DOCUMENT_REPOSITORY_PORT) private readonly repo: DocumentRepositoryPort,
    @Inject(FILE_STORAGE_PORT) private readonly storage: FileStoragePort,
  ) {}

  onModuleInit(): void {
    // Registra este serviço como consumidor da fila.
    this.queue.process((job) => this.handle(job));
    this.logger.log('Consumidor da fila registrado.');
  }

  async handle(job: ProcessingJob): Promise<void> {
    const document = await this.repo.findById(job.documentId);
    if (!document) {
      this.logger.warn(`Documento não encontrado: ${job.documentId}`);
      return;
    }

    document.status = DocumentStatus.PROCESSANDO;
    document.updatedAt = new Date();
    await this.repo.update(document);

    const maxAttempts = this.config.get<number>('ai.maxAttempts') ?? 3;
    const content = await this.storage.get(document.storageKey);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await this.ai.classify({ content, mimeType: document.mimeType });

        const extraction: ExtractionResult = {
          id: randomUUID(),
          documentId: document.id,
          type: result.type,
          confidence: result.confidence,
          fields: result.fields,
          modelVersion: result.modelVersion,
          promptVersion: result.promptVersion,
          createdAt: new Date(),
        };
        await this.repo.saveResult(extraction);

        const threshold = this.config.get<number>('confidenceThreshold') ?? 0.85;
        document.standardizedName = buildStandardizedName(
          result.type,
          result.fields,
          document.mimeType,
        );
        document.status =
          result.confidence >= threshold
            ? DocumentStatus.PROCESSADO
            : DocumentStatus.PENDENTE_CONFERENCIA;
        document.updatedAt = new Date();
        await this.repo.update(document);

        this.logger.log(
          `Documento ${document.id} → ${document.status} (confiança ${result.confidence}).`,
        );
        return;
      } catch (err) {
        this.logger.warn(`Tentativa ${attempt}/${maxAttempts} falhou: ${err}`);
        if (attempt < maxAttempts) {
          await this.backoff(attempt);
          continue;
        }
        document.status = DocumentStatus.FALHA;
        document.updatedAt = new Date();
        await this.repo.update(document);
        this.logger.error(`Documento ${document.id} → FALHA após ${maxAttempts} tentativas.`);
      }
    }
  }

  private backoff(attempt: number): Promise<void> {
    const ms = Math.min(2 ** attempt * 100, 5000);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
