# Instruções do agente — DOC Intelligence

Este arquivo orienta o agente de IA que trabalha neste repositório. Faz parte da
entrega: o uso de IA é livre, mas o registro é obrigatório.

## Contexto do projeto

Serviço back-end (Trilha A) que recebe documentos, classifica, extrai campos, propõe
nome padronizado e retém para conferência humana quando a confiança é baixa. Ver
`docs/spec.md` para a especificação completa e `docs/adr/` para as decisões de arquitetura.

## Stack e convenções

- Node + NestJS (TypeScript).
- Arquitetura **Ports & Adapters (hexagonal)**: o domínio depende de portas (interfaces
  em `src/ports/`); os detalhes de infraestrutura ficam em adaptadores (`src/adapters/`)
  escolhidos por variável de ambiente (`PERSISTENCE`, `QUEUE`, `STORAGE`, `AI_ADAPTER`).
- Adaptadores disponíveis:
  - Persistência: `memory` (padrão) | `postgres` (TypeORM).
  - Fila: `memory` (padrão) | `bullmq` (Redis).
  - Storage: `memory` (padrão) | `minio` (S3).
  - IA: `stub` (dublê determinístico) | `real` (ainda não implementado).
- O modelo de IA é acessado **somente** via `AiClassificationPort`. Nunca chamar um
  provedor real a partir do domínio.
- Nada de dados reais de cliente, de pessoa física ou do escritório. Usar apenas
  documentos fictícios gerados para teste.

## Regras de trabalho com o agente

1. Toda decisão de arquitetura relevante vira um ADR em `docs/adr/`.
2. Todo prompt usado é salvo, na íntegra e em ordem, em `ai/prompts/`.
3. Quando o agente erra, registrar em `ai/ai-usage.md`: onde errou, como foi percebido
   e o que foi feito.
4. Antes de commitar um ciclo: rodar `npm run build` e `npm test`; validar o
   comportamento de fato (não só compilar).
5. Commits pequenos e honestos, com mensagens que contam a história do que foi feito.
