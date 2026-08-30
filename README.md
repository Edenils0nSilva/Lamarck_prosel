# DOC Intelligence

Serviço de inteligência documental que recebe documentos de clientes (imagem/PDF),
descobre o tipo, extrai os campos de interesse, propõe um nome padronizado, permite
consultar/listar o que já foi processado e retém para conferência humana quando a
máquina não tem confiança. É consumido por sistemas internos, não por navegador anônimo.

> Resposta ao processo seletivo — vaga de Desenvolvedor / Engenharia de Software.
> **Trilha A (back-end)** · Stack: **Node + NestJS (TypeScript)**.

## Como este repositório está organizado

```
.
├─ README.md              → este arquivo
├─ CLAUDE.md              → instruções do agente de IA (versionadas)
├─ docs/
│  ├─ spec.md             → a especificação escrita ANTES de programar (spec-first)
│  ├─ adr/                → Architecture Decision Records (uma decisão por arquivo)
│  └─ diagrams/           → casos de uso, classes, componentes, fluxo (PNG + fonte .mmd)
├─ ai/
│  ├─ prompts/            → os prompts usados, na íntegra e em ordem
│  └─ ai-usage.md         → onde o agente errou, como percebi e o que fiz
└─ src/                   → código da fatia vertical (NestJS) — a ser adicionado
```

## Método

Este projeto foi recortado antes de começar: primeiro a especificação e a modelagem
(`docs/spec.md`), depois as decisões de arquitetura (`docs/adr/`), depois uma **fatia
vertical** implementada — um caminho completo de ponta a ponta, ainda que estreito, com
o modelo de IA representado por um dublê determinístico. O que não foi feito está
declarado como não feito, e não escondido.

## Como subir o projeto

> A seção será preenchida quando a fatia vertical for adicionada em `src/`.
> Planejado: `docker-compose up` (api, worker, postgres, redis, minio) + `npm run start`.

## Estado atual

- [x] Especificação (requisitos, fluxo, UML) — `docs/spec.md`
- [ ] ADRs detalhados — `docs/adr/`
- [ ] Fatia vertical (ingestão → dublê → consulta) — `src/`
- [ ] Registro de uso de IA — `ai/`
- [ ] Carta de fechamento (PDF, enviada por e-mail)
