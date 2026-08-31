/**
 * Porta de armazenamento do binário do documento. Abstrai o object storage
 * (S3/MinIO); os metadados ficam no banco, o binário fica aqui (ADR-0006).
 */
export interface FileStoragePort {
  /** Grava o binário e devolve a chave (storageKey) para recuperá-lo depois. */
  put(content: Buffer, mimeType: string): Promise<string>;
  get(storageKey: string): Promise<Buffer>;
}
