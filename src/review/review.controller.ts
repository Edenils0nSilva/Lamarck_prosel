import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

/**
 * Rotas da fila de conferência (RF12–RF14). Fazem parte do CONTRATO da API, mas a
 * implementação fica fora da fatia vertical (risco registrado, fato g). As rotas
 * existem e respondem 501 Not Implemented para deixar o limite explícito, não escondido.
 *
 *   GET   /v1/reviews            → lista a fila de pendentes (RF12)
 *   POST  /v1/reviews/:id/claim  → assume um item (lock/concorrência, RF14/fato g)
 *   PATCH /v1/reviews/:id        → envia correções e a decisão (RF13)
 */
@Controller({ path: 'reviews', version: '1' })
export class ReviewController {
  @Get()
  list(): never {
    throw new NotImplementedException('Fila de conferência fora da fatia vertical.');
  }

  @Post(':id/claim')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  claim(@Param('id') _id: string): never {
    throw new NotImplementedException('Claim de item fora da fatia vertical.');
  }

  @Patch(':id')
  correct(@Param('id') _id: string, @Body() _body: unknown): never {
    throw new NotImplementedException('Correção fora da fatia vertical.');
  }
}
