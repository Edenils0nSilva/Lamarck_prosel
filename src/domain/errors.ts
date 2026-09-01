/**
 * Lançado quando dois documentos de mesmo conteúdo (contentHash) tentam ser
 * inseridos ao mesmo tempo — a corrida de deduplicação (fato c, concentrada
 * no pico do fato e). O IngestionService trata devolvendo o registro
 * existente de forma idempotente, em vez de deixar vazar um erro 500.
 */
export class DuplicateContentHashError extends Error {
  constructor(public readonly contentHash: string) {
    super(`Documento com o mesmo conteúdo já existe (hash ${contentHash}).`);
    this.name = 'DuplicateContentHashError';
  }
}
