import { Injectable } from '@nestjs/common';
import { PromptProviderPort, PromptTemplate } from '../../ports';
import { DocumentType } from '../../domain';

/**
 * Provedor de prompts estático (esqueleto). No projeto real, lê os prompts
 * versionados de arquivos (ai/prompts/); aqui devolve versões fixas.
 */
@Injectable()
export class StaticPromptProvider implements PromptProviderPort {
  getClassificationPrompt(): PromptTemplate {
    return {
      version: 'stub-1.0',
      template: 'Classifique o tipo do documento entre os tipos conhecidos.',
    };
  }

  getExtractionPrompt(type: DocumentType): PromptTemplate {
    return {
      version: 'stub-1.0',
      template: `Extraia os campos de interesse de um documento do tipo ${type}.`,
    };
  }
}
