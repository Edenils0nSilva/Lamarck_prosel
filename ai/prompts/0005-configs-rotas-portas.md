# Prompt 0005 — Esqueleto NestJS: configs, rotas e portas

## Prompt (verbatim)

> agora que já montamos o esqueleto do repositorio e fizemos o commi, vamos construir agora o esqueleto do projeto, prepare a as configs rotas e portas.

## Intenção / raciocínio

Comecei pelas fronteiras de propósito: configuração, rotas (o contrato HTTP) e portas (as
interfaces do domínio), antes de qualquer implementação. A prioridade era fixar os
contratos primeiro, para que os detalhes de infraestrutura entrassem depois como
adaptadores intercambiáveis — o coração do padrão Ports & Adapters. Pedi também
adaptadores em memória como padrão, para que a fatia vertical rodasse e fosse testável sem
depender de banco, fila ou storage reais, e para que a troca por implementações reais
fosse só uma questão de configuração. A validação de ambiente (fail-fast) e o
versionamento de rota (`/v1`) entram aqui como um serviço que integra terceiros
instáveis.
