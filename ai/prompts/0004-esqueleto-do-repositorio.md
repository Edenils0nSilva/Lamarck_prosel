# Prompt 0004 — Esqueleto do repositório (spec-first)

## Prompt (verbatim)

> pode me entregar a estrutura inicial o esqueleto do projeto, e já vou commitar, vamos fazer commits por ciclos de entrega

## Intenção / raciocínio

Quis que o primeiro commit já contasse uma história honesta: documentação e modelagem
antes de código. Por isso a estrutura separa claramente as três dimensões que a prova
avalia — o projeto (`docs/spec.md` + `docs/adr/`), o código (`src/`) e o rastro de uso de
IA (`ai/` com prompts e diário de erros). Começar o repositório pela spec, pelos diagramas
e pelo esqueleto de ADRs cria um histórico de commits que mostra intenção e progresso, em
vez de um único commit "initial" — que o enunciado diz explicitamente não querer.
