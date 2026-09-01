# Divergências entre a especificação e a implementação

O enunciado pede: *"Se a implementação divergiu da especificação, entregue a especificação como estava e diga onde divergiu."*

Por isso `docs/spec.md` e os ADRs **não foram editados** para esconder nada — ficaram como estavam quando foram escritos, antes do código. Este documento lista as divergências, dizendo em cada uma se foi **corrigida no código** (a spec estava certa) ou se **permanece** (foi decisão de escopo, registrada como risco conhecido).

---

## D-01 — Rota de health sob o versionamento global *(corrigido)*

**Spec/contrato** descreve o health check em `GET /health`.
**Estava**: o versionamento global por URI (`defaultVersion: '1'`) aplicou o prefixo `/v1` também ao HealthController, e a rota respondia em `/v1/health`.
**Corrigido**: o controller foi marcado como `VERSION_NEUTRAL`, e a rota voltou a `GET /health`. Registrado também em `ai/ai-usage.md`.

## D-02 — Corrida de deduplicação resultava em 500 *(corrigido)*

**Spec** define o reenvio como idempotente: mesmo hash devolve o registro existente, sem reprocessar.
**Estava**: idempotente só no reenvio sequencial. O `IngestionService` consulta o hash e insere se não achar, e nada entre as duas operações é atômico — dois envios idênticos simultâneos (fato c, concentrados no pico do fato e) ambos consultam, não acham, e inserem; a constraint única arbitra e o perdedor estourava um **500**.
**Corrigido**: `save` sinaliza a colisão (`DuplicateContentHashError` — no Postgres a partir do código `23505`, no in-memory pelo índice de hash), e o serviço reage relendo o vencedor e devolvendo a resposta idempotente. Regressão em `test/dedup-race.e2e-spec.ts`.

## D-03 — `synchronize: true` no lugar de migrations *(permanece — dívida consciente)*

O adaptador Postgres usa `synchronize: true`, que cria/atualiza o schema automaticamente na subida. É adequado à velocidade da fatia, mas inseguro em produção (pode alterar/destruir schema). O desenho correto é versionar o banco com **migrations**. É a decisão que a carta de fechamento aponta como a que eu menos defenderia hoje.

## D-04 — Fila de conferência é contrato, não implementação *(permanece — fora da fatia)*

**Spec** descreve o fluxo de conferência humana (RF12–RF14, fato g): listar pendentes, assumir com lock e corrigir.
**Na prática** as rotas existem (`GET /v1/reviews`, `POST /:id/claim`, `PATCH /:id`) e respondem **501 Not Implemented**, de propósito, para deixar o limite explícito e não escondido. O roteamento que alimenta a fila (baixa confiança → `PENDENTE_CONFERENCIA`) está implementado; a operação da fila com concorrência ficou fora da fatia vertical.

## D-05 — Worker no mesmo processo da API *(permanece — registrado)*

**ADR-0001** descreve um worker consumindo a fila.
**Na prática** o `ProcessingService` registra o consumidor no mesmo processo da API (via `onModuleInit`), o que é conveniente para a fatia com fila em memória. Em produção, com Redis/BullMQ, o consumidor viveria em um processo próprio (`src/worker.ts` já é o ponto de entrada para isso).

## D-06 — Extrator de IA é um dublê *(permanece — autorizado)*

**Spec** descreve classificação e extração por um modelo multimodal de terceiro.
**Na prática** o `StubAiAdapter` devolve uma resposta determinística — o que o enunciado autoriza explicitamente. É exatamente a peça que a porta `AiClassificationPort` existe para tornar substituível; trocar o dublê pelo modelo real é trocar o adaptador, sem tocar no domínio.

## D-07 — Templates de prompt versionados não existem como estrutura *(permanece)*

**ADR-0004** fala em prompts externalizados e versionados.
**Na prática** o que está implementado é a metade que importa para auditoria — `modelVersion` e `promptVersion` gravados em cada resultado (fato f). O diretório de templates de prompt em si só ganha conteúdo quando existir um extrator real, e por isso não foi criado vazio.

## D-08 — Proteções de LGPD ficam no projeto, não na fatia *(permanece — risco conhecido)*

**ADR-0006/spec** tratam o conteúdo como dado pessoal e sensível (fato d).
**Na prática** a fatia não loga campos extraídos e usa apenas dados fictícios (o dublê nunca vê PII real), mas criptografia em repouso, política de retenção/expurgo e trilha de auditoria de leitura ficaram fora. Registrado como risco a tratar antes de qualquer dado real entrar.

---

## Resumo

| Item | Assunto | Situação |
|---|---|---|
| D-01 | Health sob versionamento global | Corrigido |
| D-02 | Corrida de deduplicação → 500 | Corrigido |
| D-03 | `synchronize` no lugar de migrations | Permanece (dívida) |
| D-04 | Fila de conferência é contrato (501) | Permanece (fora da fatia) |
| D-05 | Worker no mesmo processo da API | Permanece (registrado) |
| D-06 | Extrator é dublê | Permanece (autorizado) |
| D-07 | Templates de prompt não existem | Permanece |
| D-08 | Proteções de LGPD fora da fatia | Permanece (risco) |
