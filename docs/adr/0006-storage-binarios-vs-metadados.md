# ADR-0006 — Object storage para binários; banco relacional só para metadados

- **Status:** Aceito
- **Data:** 2026-08-31

## Contexto

O serviço recebe imagens e PDFs — fotos cruas de câmera, muitas vezes grandes — a um
volume de 150 documentos/dia com picos de 800 (fato e). Ao mesmo tempo, precisa consultar
e listar resultados de forma eficiente (RF10, RF11) e sustentar a deduplicação por hash
com integridade (ADR-0003). Binário e metadado têm naturezas de acesso muito diferentes.

## Decisão

Separar as responsabilidades por porta: o **binário** do documento vai para um **object
storage** (`FileStoragePort` → MinIO/S3), que devolve uma `storageKey`; os **metadados e
resultados** (nome original, hash, status, tipo, campos, confiança, versões) ficam no
**banco relacional** (`DocumentRepositoryPort` → Postgres), guardando apenas a
`storageKey` que referencia o binário. Os campos extraídos são gravados como `jsonb`.

## Alternativas consideradas

- **Guardar o binário no banco (BYTEA/BLOB)** — descartada: incha o banco, degrada
  backups e consultas, e encarece o storage transacional para um dado que é só lido
  inteiro; não é o que um banco relacional faz bem.
- **Guardar metadados em arquivos junto do binário** — descartada: perde consultas,
  filtros, paginação e a integridade do índice único de deduplicação.

## Consequências

- **Ganhos:** cada tecnologia faz o que faz bem — object storage escala barato para
  binários grandes; o relacional dá consulta, filtro, paginação e a restrição de
  unicidade do hash; backups do banco ficam leves.
- **Custos/atenção:** passam a existir dois lugares que precisam ficar consistentes
  (um metadado sem binário, ou vice-versa) — limpeza/reconciliação e política de retenção
  (LGPD, fato d) ficam registradas como trabalho a fazer; uma operação de escrita envolve
  storage + banco, exigindo cuidado com falhas parciais.
