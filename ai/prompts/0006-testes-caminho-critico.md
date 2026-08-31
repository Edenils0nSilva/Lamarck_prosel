# Prompt 0006 — Testes do caminho crítico

## Prompt (verbatim)

> os testes funcionaram sem erros, vamos commitar e avançamos para o proximo passo

Escolha, entre as opções apresentadas: **testes do caminho crítico**.

## Intenção / raciocínio

Como a prova não pede cobertura alta, decidi investir nos dois testes que protegem o que
de fato quebra o produto em uso real, e não nos mais fáceis de escrever. A deduplicação
(teste e2e, no caminho HTTP real) garante que um reenvio não gere reprocessamento nem
duplicidade — o que evita custo de IA e base suja. O roteamento por confiança (teste
unitário, isolando a regra de negócio de forma determinística, sem fila nem rede) garante
que um resultado de baixa confiança vá para conferência em vez de entrar como pronto —
crítico porque o conteúdo é dado pessoal e sensível. É a fatia estreita e honesta que a
prova valoriza.
