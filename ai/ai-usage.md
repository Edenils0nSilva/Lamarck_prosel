# Registro de uso de IA

O uso de agentes de IA neste projeto foi livre; o registro é obrigatório. Este arquivo é
o diário honesto disso: onde a IA ajudou, **onde errou**, como percebi e o que fiz a
respeito.

## Ferramentas e configuração

- Agente: Claude (Cowork), conduzido por prompts em português.
- Instruções do agente versionadas em [`../CLAUDE.md`](../CLAUDE.md).
- Prompts salvos, na íntegra e em ordem, em [`prompts/`](prompts/).

## Como o agente foi usado

O trabalho foi conduzido em ciclos: análise do enunciado → escolha de trilha e stack →
levantamento de requisitos e modelagem (spec + diagramas UML) → esqueleto NestJS
(configs, rotas, portas) → testes do caminho crítico → adaptadores reais (Postgres,
BullMQ, MinIO) → ADRs. Cada ciclo virou um commit. O controle sobre o agente incluiu:
revisar cada saída, rodar build/testes localmente antes de commitar, e exigir que ele
validasse o que afirmava (por exemplo, subir Postgres e Redis e provar que o dado foi
persistido, em vez de só compilar).

## Diário de erros e correções

### 2026-08-31 — Rota /health mapeada como /v1/health

- **O que pedi:** esqueleto NestJS com uma rota de health check em `/health`.
- **Onde o agente errou:** o versionamento global por URI (`defaultVersion: '1'`)
  aplicou o prefixo `/v1` também ao HealthController, que ficou em `/v1/health`.
- **Como percebi:** ao testar, `GET /health` retornou 404 "Cannot GET /health".
- **Correção:** marquei o controller como `VERSION_NEUTRAL`
  (`@Controller({ path: 'health', version: VERSION_NEUTRAL })`); a rota voltou a `/health`.

### 2026-08-31 — Import do supertest quebrou o teste e2e

- **O que pedi:** um teste e2e de deduplicação usando supertest.
- **Onde o agente errou:** usou `import * as request from 'supertest'`, incompatível com
  `esModuleInterop`; o TypeScript acusou "This expression is not callable".
- **Como percebi:** o `jest` falhou ao compilar a suíte e2e (o teste unitário passou).
- **Correção:** troquei para import default `import request from 'supertest'`;
  os 6 testes passaram.

### 2026-08-31 — `synchronize: true` do TypeORM (dívida assumida)

- **Contexto:** o adaptador Postgres usa `synchronize: true`, que cria/atualiza o schema
  automaticamente na subida.
- **Por que ficou assim:** acelera a fatia vertical e dispensa escrever migrations agora.
- **Risco reconhecido:** `synchronize` não é seguro em produção (pode alterar/destruir
  schema). Em produção, a decisão correta é usar **migrations** versionadas. Registrado
  como dívida técnica consciente — é candidato à pergunta "qual decisão você menos
  defenderia hoje" da carta de fechamento.
