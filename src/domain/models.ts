import { AttemptOutcome, DocumentSource, DocumentStatus, DocumentType } from './enums';

/** Um campo extraído de um documento (ex.: nome, filiação, número). */
export interface ExtractedField {
  name: string;
  value: string;
  confidence?: number;
}

/** Resultado bem-sucedido da classificação + extração de um documento. */
export interface ExtractionResult {
  id: string;
  documentId: string;
  type: DocumentType;
  confidence: number;
  fields: ExtractedField[];
  modelVersion: string;
  promptVersion: string;
  createdAt: Date;
}

/** Registro de uma tentativa de processamento (rastreabilidade e custo). */
export interface ProcessingAttempt {
  id: string;
  documentId: string;
  attemptNumber: number;
  outcome: AttemptOutcome;
  latencyMs: number;
  costUnits?: number;
  errorMessage?: string;
  startedAt: Date;
  finishedAt: Date;
}

/** Entidade central: o documento e seu estado ao longo do ciclo de vida. */
export interface Document {
  id: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  contentHash: string;
  source: DocumentSource;
  status: DocumentStatus;
  standardizedName?: string;
  storageKey: string;
  createdAt: Date;
  updatedAt: Date;
}
