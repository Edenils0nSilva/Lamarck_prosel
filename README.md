# DOC Intelligence

Serviço de inteligência documental que recebe documentos de clientes (imagem/PDF),
descobre o tipo, extrai os campos de interesse, propõe um nome padronizado, permite
consultar/listar o que já foi processado e retém para conferência humana quando a
máquina não tem confiança. É consumido por sistemas internos, não por navegador anônimo.

> Resposta ao processo seletivo — vaga de Desenvolvedor / Engenharia de Software.
> **Trilha A (back-end)** · Stack: **Node + NestJS (TypeScript)**.

## Organização do repositório

```
.
├─ README.md              → este arquivo
├─ CLAUDE.md              → instruções do agente de IA (versionadas)
├─ docker-compose.yml     → postgres + redis + minio (modo real, opcional)
├─ .env.example           → variáveis de ambiente e seleção de adaptadores
├─ docs/
│  ├─ spec.md             → a especificação escrita ANTES de programar (spec-first)
│  ├─ adr/                → Architecture Decision Records (0001–0006)
│  └─ diagrams/           → casos de uso, classes, componentes, fluxo (PNG + fonte .mmd)
├─ ai/
│  ├─ prompts/            → os prompts usados, na íntegra e em ordem
│  └─ ai-usage.md         → onde o agente errou, como percebi e o que fiz
├─ src/                   → código da fatia vertical (NestJS)
└─ test/                  → testes do caminho crítico
```

## Arquitetura em uma frase

**Ports & Adapters (hexagonal):** o domínio depende de portas (interfaces em `src/ports/`)
e a infraestrutura vive em adaptadores (`src/adapters/`) escolhidos por variável de
ambiente. Por isso o mesmo código roda **sem infra** (adaptadores em memória, padrão) ou
com **Postgres + Redis/BullMQ + MinIO** — trocando apenas o `.env`. Ver `docs/spec.md` e
`docs/adr/` para o raciocínio completo.

## Requisitos

- Node.js 20+ e npm.
- (Opcional, só para o modo real) Docker + Docker Compose.

## Como subir — modo simples (sem infra)

Roda com adaptadores em memória. Ótimo para avaliação rápida; os dados existem enquanto o
processo estiver de pé.

```bash
npm install
npm run start        # sobe em http://localhost:3000
```

Exercitando as rotas (em outro terminal):

```bash
curl http://localhost:3000/health

# envio de um documento fictício (o modelo de IA é um dublê determinístico)
echo "conteudo-ficticio" > doc.pdf
curl -X POST http://localhost:3000/v1/documents -F "file=@doc.pdf;type=application/pdf"

# reenvio idêntico -> duplicated:true (deduplicação por hash)
curl -X POST http://localhost:3000/v1/documents -F "file=@doc.pdf;type=application/pdf"

# consulta e listagem
curl http://localhost:3000/v1/documents
```

> No Windows PowerShell, use `curl.exe` (o curl real) em vez de `curl`.

## Como subir — modo real (Postgres + Redis + MinIO)

```bash
docker compose up -d          # sobe postgres, redis e minio

cp .env.example .env          # e ajuste as linhas de seleção:
#   PERSISTENCE=postgres
#   QUEUE=bullmq
#   STORAGE=minio

npm install
npm run start
```

O schema do banco é criado automaticamente na subida (TypeORM `synchronize`, adequado
para dev — ver ADR e a nota em `ai/ai-usage.md`). Console do MinIO em http://localhost:9001
(usuário/senha `minioadmin`).

## Endpoints

| Método e rota | Descrição |
|---|---|
| `POST /v1/documents` | Envia um documento (multipart). Responde 202 com id. Idempotente por hash. |
| `GET /v1/documents/:id` | Resultado de um documento. |
| `GET /v1/documents` | Lista processados (filtros: status, tipo; paginação). |
| `GET /v1/reviews`, `POST /v1/reviews/:id/claim`, `PATCH /v1/reviews/:id` | Fila de conferência — **contrato**, responde 501 (fora da fatia). |
| `GET /health` | Saúde do serviço. |

## Testes

```bash
npm test
```

### O que foi testado e por quê

Escolhi cobrir as **duas regras que mais quebram o produto em uso real**, não as mais
fáceis de testar:

- **Deduplicação (e2e, `test/dedup.e2e-spec.ts`)** — garante que reenviar o mesmo
  documento não gera reprocessamento nem duplicidade (o 2º envio volta `duplicated:true` e
  a lista permanece com 1 item), e que tipo inválido é barrado com 415. É o comportamento
  que protege contra o custo por documento (IA cobrada) e contra a base suja — os fatos
  (a), (b) e (c) do enunciado.
- **Roteamento por confiança (unit, `test/confidence-routing.spec.ts`)** — garante que
  confiança abaixo do limiar manda o documento para `PENDENTE_CONFERENCIA` em vez de
  `PROCESSADO`. É o comportamento 4 do produto (não deixar entrar como pronto o que a
  máquina não tem certeza), crítico porque o conteúdo é dado pessoal e sensível (fato d).

Preferi um teste e2e no caminho HTTP real e um teste unitário isolando a regra de negócio
(determinístico, sem fila nem rede) a muitos testes rasos — uma fatia estreita e honesta.

## Escopo desta entrega

Entregue: o projeto do sistema (spec + ADRs) e uma fatia vertical rodando, com a IA
representada por um dublê. **Fora da fatia, registrado e não escondido:** interface
gráfica; autenticação real (o guard fica como contrato); operação completa da fila de
conferência com concorrência; múltiplos tipos de documento; reprocesso em massa; e
migrations de banco (usamos `synchronize` no lugar). Ver `docs/spec.md` (seção 13) e a
carta de fechamento.
