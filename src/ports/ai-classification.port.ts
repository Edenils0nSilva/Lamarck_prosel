import { DocumentType, ExtractedField } from '../domain';

/** Entrada para a IA: o binário do documento e seu tipo MIME. */
export interface AiClassificationInput {
  content: Buffer;
  mimeType: string;
}

/** Saída da IA: tipo detectado, campos extraídos, confiança e versões usadas. */
export interface AiClassificationResult {
  type: DocumentType;
  confidence: number;
  fields: ExtractedField[];
  modelVersion: string;
  promptVersion: string;
}

/**
 * Porta de classificação/extração. É a única forma de o domínio falar com a IA.
 * Implementações: StubAiAdapter (dublê determinístico) e, futuramente, o modelo real.
 */
export interface AiClassificationPort {
  classify(input: AiClassificationInput): Promise<AiClassificationResult>;
}
