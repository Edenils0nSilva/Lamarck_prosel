/**
 * Configuração tipada da aplicação, montada a partir das variáveis de ambiente.
 * É registrada no ConfigModule e injetada via ConfigService.
 */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  confidenceThreshold: number;
  adapters: {
    persistence: 'memory' | 'postgres';
    queue: 'memory' | 'bullmq';
    storage: 'memory' | 'minio';
  };
  ai: {
    adapter: 'stub' | 'real';
    timeoutMs: number;
    maxAttempts: number;
  };
  ingestion: {
    maxFileSizeBytes: number;
    allowedMime: string[];
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  storage: {
    endpoint: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  confidenceThreshold: parseFloat(process.env.CONFIDENCE_THRESHOLD ?? '0.85'),
  adapters: {
    persistence: (process.env.PERSISTENCE as 'memory' | 'postgres') ?? 'memory',
    queue: (process.env.QUEUE as 'memory' | 'bullmq') ?? 'memory',
    storage: (process.env.STORAGE as 'memory' | 'minio') ?? 'memory',
  },
  ai: {
    adapter: (process.env.AI_ADAPTER as 'stub' | 'real') ?? 'stub',
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS ?? '40000', 10),
    maxAttempts: parseInt(process.env.AI_MAX_ATTEMPTS ?? '3', 10),
  },
  ingestion: {
    maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_MB ?? '15', 10) * 1024 * 1024,
    allowedMime: (process.env.ALLOWED_MIME ?? 'image/jpeg,image/png,application/pdf')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean),
  },
  database: {
    url: process.env.DATABASE_URL ?? 'postgres://doc:doc@localhost:5432/doc_intelligence',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT ?? 'http://localhost:9000',
    bucket: process.env.STORAGE_BUCKET ?? 'documents',
    accessKey: process.env.STORAGE_ACCESS_KEY ?? 'minioadmin',
    secretKey: process.env.STORAGE_SECRET_KEY ?? 'minioadmin',
  },
});
