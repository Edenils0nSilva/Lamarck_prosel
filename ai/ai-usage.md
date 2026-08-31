# Registro de uso de IA

O uso de agentes de IA neste projeto é livre; o registro é obrigatório. Este arquivo é o
diário honesto disso: onde a IA ajudou, **onde errou**, como percebi e o que fiz a respeito.

## Ferramentas e configuração

- Agente: (preencher — ex.: Claude, via app/CLI).
- Instruções do agente versionadas em `../CLAUDE.md`.
- Prompts salvos, na íntegra e em ordem, em `prompts/`.

## Diário

### 2026-08-31 — Rota /health mapeada como /v1/health

- **O que pedi:** esqueleto NestJS com uma rota de health check em `/health`.
- **Onde o agente errou:** o versionamento global por URI (`defaultVersion: '1'`)
  aplicou o prefixo `/v1` também ao HealthController, que ficou em `/v1/health` em
  vez de `/health`.
- **Como percebi:** ao testar, `GET /health` retornou 404 "Cannot GET /health".
- **O que fiz a respeito:** marquei o controller como `VERSION_NEUTRAL`
  (`@Controller({ path: 'health', version: VERSION_NEUTRAL })`) para excluí-lo do
  versionamento; a rota voltou a responder em `/health`.

### 2026-08-31 — Import do supertest quebrou o teste e2e

- **O que pedi:** um teste e2e de deduplicação usando supertest.
- **Onde o agente errou:** usou `import * as request from 'supertest'`, incompatível
  com `esModuleInterop`; o TypeScript acusou "This expression is not callable".
- **Como percebi:** o `jest` falhou ao compilar a suíte e2e (o teste unitário passou).
- **O que fiz a respeito:** troquei para import default `import request from 'supertest'`;
  os 6 testes passaram.
### AAAA-MM-DD — (título curto)

- **O que pedi:**
- **Onde o agente errou / o que precisou de correção:**
- **Como percebi:**
- **O que fiz a respeito:**
