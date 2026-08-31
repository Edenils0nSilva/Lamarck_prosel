import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

enum AiAdapter {
  Stub = 'stub',
  Real = 'real',
}

/**
 * Esquema de validação das variáveis de ambiente. Se algo estiver ausente ou
 * inválido, a aplicação falha ao subir (fail-fast) em vez de quebrar em runtime.
 */
class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV?: NodeEnv;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT?: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  CONFIDENCE_THRESHOLD?: number;

  @IsEnum(AiAdapter)
  @IsOptional()
  AI_ADAPTER?: AiAdapter;

  @IsInt()
  @Min(1000)
  @IsOptional()
  AI_TIMEOUT_MS?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  AI_MAX_ATTEMPTS?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  MAX_FILE_SIZE_MB?: number;

  @IsString()
  @IsOptional()
  ALLOWED_MIME?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: true });
  if (errors.length > 0) {
    throw new Error(`Variáveis de ambiente inválidas:\n${errors.toString()}`);
  }
  return validated;
}
