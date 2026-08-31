import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';
import { randomUUID } from 'node:crypto';
import { FileStoragePort } from '../../ports';

/** Storage real do binário sobre MinIO/S3 (ADR-0006). Mesma porta do in-memory. */
@Injectable()
export class MinioFileStorage implements FileStoragePort, OnModuleInit {
  private readonly logger = new Logger(MinioFileStorage.name);
  private readonly client: MinioClient;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    const url = new URL(config.get<string>('storage.endpoint') ?? 'http://localhost:9000');
    this.bucket = config.get<string>('storage.bucket') ?? 'documents';
    this.client = new MinioClient({
      endPoint: url.hostname,
      port: Number(url.port || (url.protocol === 'https:' ? 443 : 80)),
      useSSL: url.protocol === 'https:',
      accessKey: config.get<string>('storage.accessKey') ?? 'minioadmin',
      secretKey: config.get<string>('storage.secretKey') ?? 'minioadmin',
    });
  }

  async onModuleInit(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket).catch(() => false);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      this.logger.log(`Bucket criado: ${this.bucket}`);
    }
  }

  async put(content: Buffer, mimeType: string): Promise<string> {
    const key = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}`;
    await this.client.putObject(this.bucket, key, content, content.length, {
      'Content-Type': mimeType,
    });
    return key;
  }

  async get(storageKey: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, storageKey);
    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
      stream.on('data', (c: Buffer) => chunks.push(c));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
