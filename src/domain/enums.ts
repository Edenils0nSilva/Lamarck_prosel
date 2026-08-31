/** Ciclo de vida do documento no serviço. */
export enum DocumentStatus {
  RECEBIDO = 'RECEBIDO',
  NA_FILA = 'NA_FILA',
  PROCESSANDO = 'PROCESSANDO',
  PROCESSADO = 'PROCESSADO',
  PENDENTE_CONFERENCIA = 'PENDENTE_CONFERENCIA',
  FALHA = 'FALHA',
  REVISADO = 'REVISADO',
}

/** Tipos de documento que o serviço sabe classificar. */
export enum DocumentType {
  IDENTIDADE = 'IDENTIDADE',
  COMPROVANTE_RESIDENCIA = 'COMPROVANTE_RESIDENCIA',
  CONTRACHEQUE = 'CONTRACHEQUE',
  CTPS = 'CTPS',
  LAUDO = 'LAUDO',
  PROCURACAO = 'PROCURACAO',
  CONTRATO = 'CONTRATO',
  DESCONHECIDO = 'DESCONHECIDO',
}

/** Canal por onde o documento chegou ao atendimento. */
export enum DocumentSource {
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  BALCAO = 'BALCAO',
  DESCONHECIDO = 'DESCONHECIDO',
}

/** Desfecho de uma tentativa de processamento pela IA. */
export enum AttemptOutcome {
  SUCESSO = 'SUCESSO',
  TIMEOUT = 'TIMEOUT',
  ERRO = 'ERRO',
}
