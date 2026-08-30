# Instruções do agente — DOC Intelligence

Este arquivo orienta o agente de IA que trabalha neste repositório. Faz parte da
entrega: o uso de IA é livre, mas o registro é obrigatório.

## Contexto do projeto

Serviço back-end (Trilha A) que recebe documentos, classifica, extrai campos, propõe
nome padronizado e retém para conferência humana quando a confiança é baixa. Ver
`docs/spec.md` para a especificação completa e `docs/adr/` para as decisões de arquitetura.

## Stack e convenções

- Node + NestJS (TypeScript).
- Arquitetura **Ports & Adapters (hexagonal)**: o domínio depende de portas (interfaces);
  detalhes de infraestrutura ficam em adaptadores substituíveis.
- O modelo de IA é acessado **somente** via `AiClassificationPort`. Na fatia vertical,
  a implementação é um `StubAiAdapter` determinístico — nunca chamar um provedor real
  a partir do domínio.
- Nada de dados reais de cliente, de pessoa física ou do escritório. Usar apenas
  documentos fictícios gerados para teste.

## Regras de trabalho com o agente

1. Toda decisão de arquitetura relevante vira um ADR em `docs/adr/`.
2. Todo prompt usado é salvo, na íntegra e em ordem, em `ai/prompts/`.
3. Quando o agente erra, registrar em `ai/ai-usage.md`: onde errou, como foi percebido
   e o que foi feito.
4. Commits pequenos e honestos, com mensagens que contem a história do que foi feito.
