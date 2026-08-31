import { Injectable } from '@nestjs/common';
import {
  DocumentListFilter,
  DocumentListResult,
  DocumentRepositoryPort,
} from '../../ports';
import { Document, ExtractionResult } from '../../domain';

/**
 * Repositório em memória (esqueleto). Mantém o serviço funcional sem Postgres.
 * Será substituído por PostgresRepository sem tocar no domínio (mesma porta).
 */
@Injectable()
export class InMemoryDocumentRepository implements DocumentRepositoryPort {
  private readonly documents = new Map<string, Document>();
  private readonly hashIndex = new Map<string, string>(); // contentHash -> documentId
  private readonly results = new Map<string, ExtractionResult>(); // documentId -> result

  async save(document: Document): Promise<Document> {
    this.documents.set(document.id, document);
    this.hashIndex.set(document.contentHash, document.id);
    return document;
  }

  async update(document: Document): Promise<Document> {
    this.documents.set(document.id, document);
    return document;
  }

  async findById(id: string): Promise<Document | null> {
    return this.documents.get(id) ?? null;
  }

  async findByHash(contentHash: string): Promise<Document | null> {
    const id = this.hashIndex.get(contentHash);
    return id ? (this.documents.get(id) ?? null) : null;
  }

  async list(filter: DocumentListFilter): Promise<DocumentListResult> {
    const page = filter.page && filter.page > 0 ? filter.page : 1;
    const pageSize = filter.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;
    let items = Array.from(this.documents.values());
    if (filter.status) items = items.filter((d) => d.status === filter.status);
    const total = items.length;
    items = items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * pageSize, page * pageSize);
    return { items, total, page, pageSize };
  }

  async saveResult(result: ExtractionResult): Promise<ExtractionResult> {
    this.results.set(result.documentId, result);
    return result;
  }

  async findResultByDocumentId(documentId: string): Promise<ExtractionResult | null> {
    return this.results.get(documentId) ?? null;
  }
}
