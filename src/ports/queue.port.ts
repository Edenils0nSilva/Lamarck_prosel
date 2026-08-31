/** Mensagem que trafega na fila de processamento. */
export interface ProcessingJob {
  documentId: string;
}

/** Consumidor registrado para processar cada job da fila. */
export type ProcessingHandler = (job: ProcessingJob) => Promise<void>;

/**
 * Porta de fila. Desacopla o envio (rápido) do processamento pela IA (lento),
 * conforme ADR-0001. Abstrai a implementação (BullMQ/Redis).
 */
export interface QueuePort {
  enqueue(job: ProcessingJob): Promise<void>;
  /** Registra o handler que consome a fila (chamado pelo worker). */
  process(handler: ProcessingHandler): void;
}
