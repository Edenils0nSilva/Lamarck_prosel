import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { QueryService } from './query.service';
import { DocumentStatus, DocumentType } from '../domain';

/**
 * Rotas de consulta.
 *   GET /v1/documents/:id → resultado de um documento (RF10)
 *   GET /v1/documents     → lista de processados, com filtros e paginação (RF11)
 *
 * Divide o mesmo prefixo /v1/documents com IngestionController (POST): o envio e a
 * consulta ficam em controllers separados, sem colisão de rotas.
 */
@Controller({ path: 'documents', version: '1' })
export class QueryController {
  constructor(private readonly query: QueryService) {}

  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.query.getById(id);
  }

  @Get()
  list(
    @Query('status') status?: DocumentStatus,
    @Query('type') type?: DocumentType,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.query.list({
      status,
      type,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }
}
