import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  DOCUMENT_REPOSITORY_PORT,
  DocumentListFilter,
  DocumentListResult,
  DocumentRepositoryPort,
} from '../ports';
import { Document, ExtractionResult } from '../domain';

/** Consulta e listagem (RF10, RF11). */
@Injectable()
export class QueryService {
  constructor(
    @Inject(DOCUMENT_REPOSITORY_PORT) private readonly repo: DocumentRepositoryPort,
  ) {}

  async getById(id: string): Promise<{ document: Document; result: ExtractionResult | null }> {
    const document = await this.repo.findById(id);
    if (!document) throw new NotFoundException(`Documento não encontrado: ${id}`);
    const result = await this.repo.findResultByDocumentId(id);
    return { document, result };
  }

  async list(filter: DocumentListFilter): Promise<DocumentListResult> {
    return this.repo.list(filter);
  }
}
