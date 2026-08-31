import { ProcessingService } from '../src/processing/processing.service';
import { InMemoryDocumentRepository } from '../src/adapters/persistence/in-memory-document.repository';
import { InMemoryFileStorage } from '../src/adapters/storage/in-memory-file-storage.adapter';
import {
  AiClassificationPort,
  AiClassificationResult,
  QueuePort,
} from '../src/ports';
import { Document, DocumentSource, DocumentStatus, DocumentType } from '../src/domain';

/**
 * Caminho crítico: o limiar de confiança (ADR-0005) decide o destino do documento.
 * Confiança ≥ limiar → PROCESSADO; abaixo → PENDENTE_CONFERENCIA (RF09).
 *
 * Testado no ProcessingService diretamente (unit), com portas falsas — determinístico,
 * sem fila nem rede.
 */

const THRESHOLD = 0.85;

function fakeConfig(): any {
  const values: Record<string, unknown> = {
    'ai.maxAttempts': 3,
    confidenceThreshold: THRESHOLD,
  };
  return { get: (key: string) => values[key] };
}

function fakeQueue(): QueuePort {
  return { enqueue: async () => undefined, process: () => undefined };
}

function aiWithConfidence(confidence: number): AiClassificationPort {
  return {
    classify: async (): Promise<AiClassificationResult> => ({
      type: DocumentType.IDENTIDADE,
      confidence,
      fields: [{ name: 'nome', value: 'FULANO DE TAL' }],
      modelVersion: 'test',
      promptVersion: 'test',
    }),
  };
}

async function seedDocument(
  repo: InMemoryDocumentRepository,
  storage: InMemoryFileStorage,
): Promise<Document> {
  const storageKey = await storage.put(Buffer.from('conteudo'), 'application/pdf');
  const now = new Date();
  const doc: Document = {
    id: 'doc-1',
    originalFilename: 'scan.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 8,
    contentHash: 'hash-1',
    source: DocumentSource.DESCONHECIDO,
    status: DocumentStatus.NA_FILA,
    storageKey,
    createdAt: now,
    updatedAt: now,
  };
  return repo.save(doc);
}

describe('ProcessingService — roteamento por confiança', () => {
  it('confiança acima do limiar → PROCESSADO', async () => {
    const repo = new InMemoryDocumentRepository();
    const storage = new InMemoryFileStorage();
    const doc = await seedDocument(repo, storage);

    const service = new ProcessingService(
      fakeConfig(),
      fakeQueue(),
      aiWithConfidence(0.95),
      repo,
      storage,
    );
    await service.handle({ documentId: doc.id });

    const updated = await repo.findById(doc.id);
    expect(updated?.status).toBe(DocumentStatus.PROCESSADO);
    expect(updated?.standardizedName).toContain('IDENTIDADE');
  });

  it('confiança abaixo do limiar → PENDENTE_CONFERENCIA', async () => {
    const repo = new InMemoryDocumentRepository();
    const storage = new InMemoryFileStorage();
    const doc = await seedDocument(repo, storage);

    const service = new ProcessingService(
      fakeConfig(),
      fakeQueue(),
      aiWithConfidence(0.5),
      repo,
      storage,
    );
    await service.handle({ documentId: doc.id });

    const updated = await repo.findById(doc.id);
    expect(updated?.status).toBe(DocumentStatus.PENDENTE_CONFERENCIA);
  });
});
