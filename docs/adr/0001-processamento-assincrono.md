# ADR-0001 — Processamento assíncrono via fila

- **Status:** Aceito
- **Data:** 2026-08-30

## Contexto

A classificação e a extração são feitas por um modelo de IA de terceiro. Cada chamada
leva entre 5 e 40 segundos e, de vez em quando, devolve erro ou não responde (fato a).
A média é de 150 documentos por dia, com picos acima de 800 concentrados entre 9h e 11h
(fato e). Segurar a requisição HTTP de envio aberta durante a chamada de IA acoplaria a
latência do cliente à do modelo e derrubaria o serviço no horário de pico.

## Decisão

O endpoint de envio (`POST /v1/documents`) apenas valida, deduplica, armazena o binário
e **enfileira** o documento, respondendo de imediato com `202 Accepted` e um
identificador. O processamento pela IA acontece de forma assíncrona em um **worker** que
consome a fila.

## Alternativas consideradas

- **Processamento síncrono na requisição** — descartada: a requisição ficaria aberta de
  5 a 40 s, timeouts do cliente seriam frequentes e o pico de 800 documentos esgotaria as
  conexões do servidor.
- **Processamento em background dentro do mesmo processo da API (sem fila)** — descartada:
  não sobrevive a reinício/crash (perde trabalho em andamento), não escala de forma
  independente e não dá visibilidade da profundidade da fila.

## Consequências

- **Ganhos:** resiliência a picos (a fila absorve a carga), escala horizontal dos workers
  independente da API, retry/backoff e dead-letter naturais para as falhas do fato (a).
- **Custos/atenção:** o resultado passa a ser eventualmente consistente (o cliente
  consulta depois); introduz infraestrutura de fila (Redis/BullMQ) e a necessidade de
  observabilidade sobre o tamanho da fila e o tempo de processamento.
