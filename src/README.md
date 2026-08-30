# src/

Código da **fatia vertical** (NestJS). Estrutura planejada (ver `docs/spec.md`, seção 14):

```
src/
├─ main.ts            → bootstrap da API
├─ worker.ts          → processo consumidor da fila
├─ ingestion/         → controller, service, validação, dedup
├─ processing/        → worker, orquestração da IA, retry
├─ review/            → fila de conferência (contrato)
├─ query/             → consulta e listagem
├─ domain/            → entidades, enums, invariantes
├─ ports/             → AiClassificationPort, DocumentRepositoryPort, ...
└─ adapters/          → stub-ai, postgres, storage (MinIO), queue (BullMQ)
```

> A ser adicionado no próximo ciclo de implementação.
