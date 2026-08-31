import { Injectable } from '@nestjs/common';
import {
  AiClassificationInput,
  AiClassificationPort,
  AiClassificationResult,
} from '../../ports';
import { DocumentType } from '../../domain';

/**
 * Dublê determinístico da IA (fatia vertical). Devolve sempre a mesma resposta,
 * permitindo exercitar todo o fluxo sem chamar um provedor real nem depender de rede.
 * A confiança fixa (0.92) fica acima do limiar padrão, levando a PROCESSADO — basta
 * baixá-la para exercitar o roteamento para conferência.
 */
@Injectable()
export class StubAiAdapter implements AiClassificationPort {
  async classify(_input: AiClassificationInput): Promise<AiClassificationResult> {
    return {
      type: DocumentType.IDENTIDADE,
      confidence: 0.92,
      fields: [
        { name: 'nome', value: 'FULANO DE TAL', confidence: 0.95 },
        { name: 'filiacao', value: 'CICLANA DE TAL', confidence: 0.9 },
        { name: 'dataNascimento', value: '1990-01-01', confidence: 0.93 },
        { name: 'numero', value: '00.000.000-0', confidence: 0.9 },
        { name: 'orgaoEmissor', value: 'SSP-RN', confidence: 0.88 },
      ],
      modelVersion: 'stub-1.0',
      promptVersion: 'stub-1.0',
    };
  }
}
