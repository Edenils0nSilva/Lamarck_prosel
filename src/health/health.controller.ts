import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

/** Saúde do serviço (liveness/readiness). Sem versão no caminho: GET /health. */
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'doc-intelligence', timestamp: new Date().toISOString() };
  }
}
