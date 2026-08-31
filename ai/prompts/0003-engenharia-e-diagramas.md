# Prompt 0003 — Levantamento de requisitos e modelagem UML

## Prompt (verbatim)

> então para começar a trabalhar vamos fazer todo o trabalho de engenharia de software,
> pura, levantando os requisitos, fazendo o fluxo do sistema, os requisitos funcionais
> desse sistema, os não funcionais:
>
> os diagramas de casos de uso
> diagrama de classe
> de componentes
>
> antes de botar as mãos no codigo listar toda a arquitetura projeto

## Intenção / raciocínio

Fiz questão de fazer engenharia antes de código (spec-first) porque é exatamente o que a
prova recompensa: ela quer ler o projeto e as decisões, não só ver features rodando.
Estruturei o levantamento separando requisitos funcionais (o que o sistema faz) dos não
funcionais (desempenho, resiliência, idempotência, LGPD, concorrência) e amarrei cada
requisito não funcional ao fato do ambiente que o motiva — para deixar explícito que
enxerguei os fatos, tratando-os ou registrando-os como risco. A modelagem em três vistas
foi proposital: casos de uso para os atores e o contorno do sistema, classes para o
modelo de domínio e suas invariantes, e componentes para mostrar a arquitetura
hexagonal. A definição de stack (NestJS/TypeScript) entra aqui já como decisão
justificada, porque a própria escolha é conteúdo de avaliação.
