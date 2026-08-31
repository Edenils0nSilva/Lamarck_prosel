import { DocumentStatus } from '../../domain';

/** Resposta do envio de um documento (RF01). */
export class UploadResponseDto {
  id!: string;
  status!: DocumentStatus;
  /** true quando o documento já existia (dedup, RF03) e nada foi reprocessado. */
  duplicated!: boolean;
}
