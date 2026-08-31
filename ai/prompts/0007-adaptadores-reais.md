# Prompt 0007 — Adaptadores reais

## Prompt (verbatim)

> vamos adiante, qual é o proximo passo na logica? vamos para os adaptadores? se sim, meu docker já esta configurado para seguirmos

## Intenção / raciocínio

Este passo era a prova prática da arquitetura: substituir os adaptadores em memória por
Postgres (TypeORM), Redis/BullMQ e MinIO **sem tocar no domínio**, apenas selecionando a
implementação por variável de ambiente. Se os Ports & Adapters estivessem bem desenhados,
a troca seria de configuração — e foi. Pedi também um `docker-compose` para tornar a infra
reprodutível, e fiz questão de validar de verdade (subir o banco e a fila e confirmar que
o dado foi persistido e o job processado), em vez de apenas compilar.