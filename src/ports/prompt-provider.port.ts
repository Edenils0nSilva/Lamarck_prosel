import { DocumentType } from '../domain';

export interface PromptTemplate {
  version: string;
  template: string;
}

/**
 * Porta que fornece os prompts usados pela IA, externalizados e versionados
 * (ADR-0004, fato f). Trocar um prompt não toca no código do domínio.
 */
export interface PromptProviderPort {
  /** Prompt de classificação (descobrir o tipo do documento). */
  getClassificationPrompt(): PromptTemplate;
  /** Prompt de extração de campos para um tipo específico. */
  getExtractionPrompt(type: DocumentType): PromptTemplate;
}
