# Architecture Decision Records (ADRs)

Um ADR registra **uma** decisão de arquitetura relevante: o contexto que a exigiu, a
decisão tomada, as alternativas consideradas e descartadas, e as consequências. O foco
está tanto no que foi feito quanto no que **não** foi feito e por quê.

Cada ADR é um arquivo numerado (`NNNN-titulo.md`). Use `0000-template.md` como base.

## Índice

| ADR | Decisão | Status |
|-----|---------|--------|
| [0001](0001-processamento-assincrono.md) | Processamento assíncrono via fila | Aceito |
| 0002 | Ports & Adapters isolando IA, banco, storage e fila | A escrever |
| 0003 | Deduplicação por hash de conteúdo + idempotência | A escrever |
| 0004 | Prompts externalizados e versionados | A escrever |
| 0005 | Limiar de confiança roteando para conferência humana | A escrever |
| 0006 | Object storage para binários; banco relacional só para metadados | A escrever |
