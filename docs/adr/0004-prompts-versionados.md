# ADR-0004 — Prompts externalizados e versionados

- **Status:** Aceito
- **Data:** 2026-08-31

## Contexto

O modelo do fornecedor será trocado de versão em algum momento, e os prompts vão mudar
mais de uma vez ao longo do primeiro ano (fato f). Se os prompts estivessem embutidos no
código do domínio, cada ajuste exigiria alterar e reimplantar regra de negócio, e seria
impossível saber, olhando um resultado antigo, com qual prompt e qual versão de modelo
ele foi produzido.

## Decisão

Externalizar os prompts atrás de uma porta, `PromptProviderPort`
(`getClassificationPrompt`, `getExtractionPrompt`), com um número de **versão** por
template. Cada `ExtractionResult` grava a `modelVersion` e a `promptVersion` que o
produziram (RF18), tornando cada resultado rastreável. No projeto, os prompts vivem
versionados em `ai/prompts/`; o adaptador `StaticPromptProvider` os fornece.

## Alternativas consideradas

- **Prompts como constantes no código do serviço** — descartada: mistura conteúdo que
  muda com frequência (prompt) com código estável (domínio); perde rastreabilidade.
- **Prompts em banco, editáveis em runtime** — descartada por ora: útil no futuro, mas
  adiciona superfície de mudança sem revisão e versionamento por commit; registrado como
  evolução possível.

## Consequências

- **Ganhos:** trocar um prompt ou a versão do modelo não toca no domínio; é possível
  auditar qual versão gerou cada resultado e comparar desempenho entre versões; o
  histórico de prompts fica no Git.
- **Custos/atenção:** exige disciplina de versionar (bumping) a cada mudança de prompt;
  resultados antigos permanecem atados a versões que podem não existir mais no provedor.
