/**
 * Tokens de injeção para as portas (interfaces). Os módulos amarram cada token a
 * um adaptador concreto — trocar o adaptador é trocar o provider, sem tocar no domínio.
 */
export const AI_CLASSIFICATION_PORT = Symbol('AiClassificationPort');
export const DOCUMENT_REPOSITORY_PORT = Symbol('DocumentRepositoryPort');
export const FILE_STORAGE_PORT = Symbol('FileStoragePort');
export const QUEUE_PORT = Symbol('QueuePort');
export const PROMPT_PROVIDER_PORT = Symbol('PromptProviderPort');
