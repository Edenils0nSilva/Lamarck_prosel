/**
 * Configuração tipada da aplicação, montada a partir das variáveis de ambiente.
 * É registrada no ConfigModule e injetada via ConfigService.
 */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  confidenceThreshold: number;
  ai: {
    adapter: 'stub' | 'real';
    timeoutMs: number;
    maxAttempts: number;
  };
  ingestion: {
    maxFileSizeBytes: number;
    allowedMime: string[];
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  confidenceThreshold: parseFloat(process.env.CONFIDENCE_THRESHOLD ?? '0.85'),
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
});
