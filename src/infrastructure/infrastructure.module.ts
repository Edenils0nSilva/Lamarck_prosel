import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AI_CLASSIFICATION_PORT,
  DOCUMENT_REPOSITORY_PORT,
  FILE_STORAGE_PORT,
  PROMPT_PROVIDER_PORT,
  QUEUE_PORT,
} from '../ports';
import { StubAiAdapter } from '../adapters/ai/stub-ai.adapter';
import { StaticPromptProvider } from '../adapters/prompt/static-prompt.provider';
import { InMemoryDocumentRepository } from '../adapters/persistence/in-memory-document.repository';
import { InMemoryFileStorage } from '../adapters/storage/in-memory-file-storage.adapter';
import { InMemoryQueue } from '../adapters/queue/in-memory-queue.adapter';
import { TypeOrmDocumentRepository } from '../adapters/persistence/typeorm-document.repository';
import { MinioFileStorage } from '../adapters/storage/minio-file-storage.adapter';
import { BullMqQueue } from '../adapters/queue/bullmq-queue.adapter';
import { DocumentEntity } from '../adapters/persistence/entities/document.entity';
import { ExtractionResultEntity } from '../adapters/persistence/entities/extraction-result.entity';

/**
 * Amarra as portas aos adaptadores, escolhendo cada implementação por variável de
 * ambiente (PERSISTENCE / QUEUE / STORAGE / AI_ADAPTER). Trocar de "memory" para o
 * adaptador real é mudar o .env — o domínio não muda. É o coração dos Ports & Adapters.
 *
 * A seleção lê process.env no momento da montagem; por isso `dotenv` é carregado
 * antes de importar o AppModule (ver main.ts/worker.ts).
 */
@Global()
@Module({})
export class InfrastructureModule {
  static forRoot(): DynamicModule {
    const persistence = process.env.PERSISTENCE ?? 'memory';
    const queue = process.env.QUEUE ?? 'memory';
    const storage = process.env.STORAGE ?? 'memory';

    const imports: DynamicModule['imports'] = [];
    const providers: Provider[] = [
      { provide: PROMPT_PROVIDER_PORT, useClass: StaticPromptProvider },
      {
        provide: AI_CLASSIFICATION_PORT,
        useFactory: (config: ConfigService) => {
          if (config.get<string>('ai.adapter') === 'real') {
            throw new Error('Adaptador de IA real ainda não implementado. Use AI_ADAPTER=stub.');
          }
          return new StubAiAdapter();
        },
        inject: [ConfigService],
      },
    ];

    // Persistência
    if (persistence === 'postgres') {
      imports.push(
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'postgres' as const,
            url: config.get<string>('database.url'),
            entities: [DocumentEntity, ExtractionResultEntity],
            synchronize: true, // dev: cria o schema automaticamente. Produção usaria migrations.
          }),
        }),
        TypeOrmModule.forFeature([DocumentEntity, ExtractionResultEntity]),
      );
      providers.push({ provide: DOCUMENT_REPOSITORY_PORT, useClass: TypeOrmDocumentRepository });
    } else {
      providers.push({ provide: DOCUMENT_REPOSITORY_PORT, useClass: InMemoryDocumentRepository });
    }

    // Storage
    providers.push(
      storage === 'minio'
        ? { provide: FILE_STORAGE_PORT, useClass: MinioFileStorage }
        : { provide: FILE_STORAGE_PORT, useClass: InMemoryFileStorage },
    );

    // Fila
    providers.push(
      queue === 'bullmq'
        ? { provide: QUEUE_PORT, useClass: BullMqQueue }
        : { provide: QUEUE_PORT, useClass: InMemoryQueue },
    );

    return {
      module: InfrastructureModule,
      imports,
      providers,
      exports: [
        PROMPT_PROVIDER_PORT,
        AI_CLASSIFICATION_PORT,
        DOCUMENT_REPOSITORY_PORT,
        FILE_STORAGE_PORT,
        QUEUE_PORT,
      ],
    };
  }
}
