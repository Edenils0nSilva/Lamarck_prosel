# Architecture Decision Records (ADRs)

Um ADR registra **uma** decisão de arquitetura relevante: o contexto que a exigiu, a
decisão tomada, as alternativas consideradas e descartadas, e as consequências. O foco
está tanto no que foi feito quanto no que **não** foi feito e por quê.

Cada ADR é um arquivo numerado (`NNNN-titulo.md`). Use `0000-template.md` como base.

## Índice

| ADR | Decisão | Status |
|-----|---------|--------|
| [0001](0001-processamento-assincrono.md) | Processamento assíncrono via fila | Aceito |
| [0002](0002-ports-and-adapters.md) | Arquitetura Ports & Adapters (hexagonal) | Aceito |
| [0003](0003-deduplicacao-idempotencia.md) | Deduplicação por hash de conteúdo e idempotência | Aceito |
| [0004](0004-prompts-versionados.md) | Prompts externalizados e versionados | Aceito |
| [0005](0005-limiar-de-confianca.md) | Limiar de confiança roteando para conferência | Aceito |
| [0006](0006-storage-binarios-vs-metadados.md) | Object storage para binários; banco só para metadados | Aceito |
