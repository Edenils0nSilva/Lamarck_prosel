import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IncomingFile, IngestionService } from './ingestion.service';
import { UploadResponseDto } from './dto/upload-response.dto';

/**
 * Rotas de ingestão de documentos.
 *   POST /v1/documents  → recebe um documento e responde 202 com o id para consulta.
 */
@Controller({ path: 'documents', version: '1' })
export class IngestionController {
  constructor(private readonly ingestion: IngestionService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: IncomingFile): Promise<UploadResponseDto> {
    return this.ingestion.ingest(file);
  }
}
