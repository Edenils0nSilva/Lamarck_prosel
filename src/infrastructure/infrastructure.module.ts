import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AI_CLASSIFICATION_PORT,
  DOCUMENT_REPOSITORY_PORT,
  FILE_STORAGE_PORT,
  PROMPT_PROVIDER_PORT,
  QUEUE_PORT,
} from '../ports';
import { StubAiAdapter } from '../adapters/ai/stub-ai.adapter';
import { InMemoryDocumentRepository } from '../adapters/persistence/in-memory-document.repository';
import { InMemoryFileStorage } from '../adapters/storage/in-memory-file-storage.adapter';
import { InMemoryQueue } from '../adapters/queue/in-memory-queue.adapter';
import { StaticPromptProvider } from '../adapters/prompt/static-prompt.provider';

/**
 * Wiring das portas para os adaptadores concretos, num único lugar. Trocar uma
 * implementação (ex.: memória → Postgres, dublê → IA real) é mudar aqui, sem tocar
 * no domínio. @Global para que os módulos de negócio injetem as portas por token.
 */
@Global()
@Module({
  providers: [
    { provide: DOCUMENT_REPOSITORY_PORT, useClass: InMemoryDocumentRepository },
    { provide: FILE_STORAGE_PORT, useClass: InMemoryFileStorage },
    { provide: QUEUE_PORT, useClass: InMemoryQueue },
    { provide: PROMPT_PROVIDER_PORT, useClass: StaticPromptProvider },
    {
      // Seleciona o adaptador de IA por configuração (AI_ADAPTER). Hoje só o dublê.
      provide: AI_CLASSIFICATION_PORT,
      useFactory: (config: ConfigService) => {
        const adapter = config.get<string>('ai.adapter');
        // TODO: quando existir, retornar RealAiAdapter para adapter === 'real'.
        if (adapter === 'real') {
          throw new Error('Adaptador de IA real ainda não implementado. Use AI_ADAPTER=stub.');
        }
        return new StubAiAdapter();
      },
      inject: [ConfigService],
    },
  ],
  exports: [
    DOCUMENT_REPOSITORY_PORT,
    FILE_STORAGE_PORT,
    QUEUE_PORT,
    PROMPT_PROVIDER_PORT,
    AI_CLASSIFICATION_PORT,
  ],
})
export class InfrastructureModule {}
