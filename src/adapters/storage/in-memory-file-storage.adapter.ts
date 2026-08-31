import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FileStoragePort } from '../../ports';

/**
 * Armazenamento em memória (esqueleto). Guarda o binário associado a uma chave.
 * Será substituído por ObjectStorageAdapter (S3/MinIO) pela mesma porta.
 */
@Injectable()
export class InMemoryFileStorage implements FileStoragePort {
  private readonly store = new Map<string, Buffer>();

  async put(content: Buffer, _mimeType: string): Promise<string> {
    const key = `mem://${randomUUID()}`;
    this.store.set(key, content);
    return key;
  }

  async get(storageKey: string): Promise<Buffer> {
    const buf = this.store.get(storageKey);
    if (!buf) throw new Error(`Objeto não encontrado: ${storageKey}`);
    return buf;
  }
}
