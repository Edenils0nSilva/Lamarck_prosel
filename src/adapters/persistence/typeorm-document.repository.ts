import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import {
  DocumentListFilter,
  DocumentListResult,
  DocumentRepositoryPort,
} from '../../ports';
import { Document, ExtractionResult, DuplicateContentHashError } from '../../domain';
import { DocumentEntity } from './entities/document.entity';
import { ExtractionResultEntity } from './entities/extraction-result.entity';

/** Repositório real sobre Postgres (TypeORM). Implementa a mesma porta do in-memory. */
@Injectable()
export class TypeOrmDocumentRepository implements DocumentRepositoryPort {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly docs: Repository<DocumentEntity>,
    @InjectRepository(ExtractionResultEntity)
    private readonly results: Repository<ExtractionResultEntity>,
  ) {}

  private toDomain(e: DocumentEntity): Document {
    return {
      id: e.id,
      originalFilename: e.originalFilename,
      mimeType: e.mimeType,
      sizeBytes: Number(e.sizeBytes),
      contentHash: e.contentHash,
      source: e.source,
      status: e.status,
      standardizedName: e.standardizedName ?? undefined,
      storageKey: e.storageKey,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  async save(document: Document): Promise<Document> {
    try {
      const saved = await this.docs.save(this.docs.create(document));
      return this.toDomain(saved);
    } catch (err) {
      // 23505 = unique_violation no Postgres: dois envios idênticos simultâneos
      // (fato c). Deixa a constraint arbitrar e sinaliza a corrida ao serviço.
      const code = (err as { driverError?: { code?: string } }).driverError?.code;
      if (err instanceof QueryFailedError && code === '23505') {
        throw new DuplicateContentHashError(document.contentHash);
      }
      throw err;
    }
  }

  async update(document: Document): Promise<Document> {
    await this.docs.save(this.docs.create(document));
    return document;
  }

  async findById(id: string): Promise<Document | null> {
    const e = await this.docs.findOne({ where: { id } });
    return e ? this.toDomain(e) : null;
  }

  async findByHash(contentHash: string): Promise<Document | null> {
    const e = await this.docs.findOne({ where: { contentHash } });
    return e ? this.toDomain(e) : null;
  }

  async list(filter: DocumentListFilter): Promise<DocumentListResult> {
    const page = filter.page && filter.page > 0 ? filter.page : 1;
    const pageSize = filter.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;
    const where: Record<string, unknown> = {};
    if (filter.status) where.status = filter.status;
    const [items, total] = await this.docs.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items: items.map((e) => this.toDomain(e)), total, page, pageSize };
  }

  async saveResult(result: ExtractionResult): Promise<ExtractionResult> {
    await this.results.save(this.results.create(result));
    return result;
  }

  async findResultByDocumentId(documentId: string): Promise<ExtractionResult | null> {
    const e = await this.results.findOne({
      where: { documentId },
      order: { createdAt: 'DESC' },
    });
    if (!e) return null;
    return {
      id: e.id,
      documentId: e.documentId,
      type: e.type,
      confidence: e.confidence,
      fields: e.fields,
      modelVersion: e.modelVersion,
      promptVersion: e.promptVersion,
      createdAt: e.createdAt,
    };
  }
}
