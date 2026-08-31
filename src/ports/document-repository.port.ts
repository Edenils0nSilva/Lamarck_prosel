import { Document, DocumentStatus, DocumentType, ExtractionResult } from '../domain';

/** Filtros para listagem de documentos processados (RF11). */
export interface DocumentListFilter {
  status?: DocumentStatus;
  type?: DocumentType;
  page?: number;
  pageSize?: number;
}

export interface DocumentListResult {
  items: Document[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Porta de persistência de documentos e seus resultados. Abstrai o banco (Postgres),
 * permitindo trocar a implementação e testar com um repositório em memória.
 */
export interface DocumentRepositoryPort {
  save(document: Document): Promise<Document>;
  update(document: Document): Promise<Document>;
  findById(id: string): Promise<Document | null>;
  /** Sustenta a deduplicação (RF03): busca por hash de conteúdo. */
  findByHash(contentHash: string): Promise<Document | null>;
  list(filter: DocumentListFilter): Promise<DocumentListResult>;
  saveResult(result: ExtractionResult): Promise<ExtractionResult>;
  findResultByDocumentId(documentId: string): Promise<ExtractionResult | null>;
}
