# ADR-0002 — Arquitetura Ports & Adapters (hexagonal)

- **Status:** Aceito
- **Data:** 2026-08-31

## Contexto

Dois fatos do ambiente impõem que partes do sistema sejam trocáveis: o modelo de IA
de terceiro será trocado de versão e os prompts mudarão mais de uma vez no primeiro ano
(fato f); e a fatia vertical precisa rodar sem infraestrutura real, com a IA representada
por um dublê (requisito da entrega). Se o domínio chamasse diretamente as bibliotecas de
IA, banco, storage e fila, cada troca dessas exigiria alterar regra de negócio, e testar
sem infra seria inviável.

## Decisão

Adotar **Ports & Adapters (hexagonal)**. O núcleo de aplicação depende apenas de
**portas** (interfaces TypeScript em `src/ports/`): `AiClassificationPort`,
`DocumentRepositoryPort`, `FileStoragePort`, `QueuePort` e `PromptProviderPort`. Os
detalhes de infraestrutura vivem em **adaptadores** (`src/adapters/`) que implementam
essas portas. O `InfrastructureModule.forRoot()` amarra cada porta a um adaptador
**escolhido por variável de ambiente** (`PERSISTENCE`, `QUEUE`, `STORAGE`, `AI_ADAPTER`),
usando os tokens de injeção do NestJS.

## Alternativas consideradas

- **Arquitetura em camadas com acesso direto às libs (services chamando TypeORM/SDKs
  diretamente)** — descartada: acopla o domínio à infraestrutura, torna a troca de
  modelo/banco uma mudança invasiva e impede rodar/testar sem infra real.
- **Abstrair só a IA e deixar banco/fila/storage concretos** — descartada: resolveria o
  fato (f), mas não permitiria a fatia vertical rodar em memória nem testes
  determinísticos do repositório e da fila.

## Consequências

- **Ganhos:** trocar memória → Postgres, dublê → IA real, ou Redis → outra fila é mudar
  o `.env` (ou um provider), sem tocar no domínio; testes usam adaptadores em memória e
  ficam rápidos e determinísticos; as fronteiras entre módulos ficam explícitas.
- **Custos/atenção:** mais indireção (interfaces + tokens + mapeamento entidade↔domínio),
  o que adiciona alguma cerimônia; exige disciplina para não vazar tipos de
  infraestrutura para dentro do domínio.
