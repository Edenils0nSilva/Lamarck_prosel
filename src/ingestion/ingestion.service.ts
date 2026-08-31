import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'node:crypto';
import {
  DOCUMENT_REPOSITORY_PORT,
  DocumentRepositoryPort,
  FILE_STORAGE_PORT,
  FileStoragePort,
  QUEUE_PORT,
  QueuePort,
} from '../ports';
import { Document, DocumentSource, DocumentStatus } from '../domain';
import { UploadResponseDto } from './dto/upload-response.dto';

export interface IncomingFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * Ingestão (RF01–RF04): valida a entrada sem confiar no cliente (fato b),
 * deduplica por hash (RF03/fato c), armazena o binário, cria o Document e
 * enfileira para processamento assíncrono (ADR-0001).
 */
@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(DOCUMENT_REPOSITORY_PORT) private readonly repo: DocumentRepositoryPort,
    @Inject(FILE_STORAGE_PORT) private readonly storage: FileStoragePort,
    @Inject(QUEUE_PORT) private readonly queue: QueuePort,
  ) {}

  async ingest(file: IncomingFile, source = DocumentSource.DESCONHECIDO): Promise<UploadResponseDto> {
    if (!file) throw new BadRequestException('Arquivo ausente.');
    this.validate(file);

    const contentHash = createHash('sha256').update(file.buffer).digest('hex');

    // Dedup (RF03): reenvio retorna o registro existente, sem reprocessar.
    const existing = await this.repo.findByHash(contentHash);
    if (existing) {
      this.logger.log(`Documento duplicado (hash já visto): ${existing.id}`);
      return { id: existing.id, status: existing.status, duplicated: true };
    }

    const storageKey = await this.storage.put(file.buffer, file.mimetype);
    const now = new Date();
    const document: Document = {
      id: randomUUID(),
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      contentHash,
      source,
      status: DocumentStatus.RECEBIDO,
      storageKey,
      createdAt: now,
      updatedAt: now,
    };
    await this.repo.save(document);

    // Enfileira e marca NA_FILA (ADR-0001).
    document.status = DocumentStatus.NA_FILA;
    document.updatedAt = new Date();
    await this.repo.update(document);
    await this.queue.enqueue({ documentId: document.id });

    return { id: document.id, status: document.status, duplicated: false };
  }

  private validate(file: IncomingFile): void {
    const allowed = this.config.get<string[]>('ingestion.allowedMime') ?? [];
    const maxBytes = this.config.get<number>('ingestion.maxFileSizeBytes') ?? 0;
    if (allowed.length && !allowed.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException(`Tipo não suportado: ${file.mimetype}`);
    }
    if (maxBytes && file.size > maxBytes) {
      throw new PayloadTooLargeException('Arquivo excede o tamanho máximo permitido.');
    }
  }
}
