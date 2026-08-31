# ADR-0003 — Deduplicação por hash de conteúdo e idempotência

- **Status:** Aceito
- **Data:** 2026-08-31

## Contexto

O mesmo documento costuma chegar mais de uma vez: o cliente reenvia por insegurança e o
atendimento reenvia por precaução (fato c). Como cada processamento pela IA é cobrado por
documento (fato a), reprocessar duplicatas custa dinheiro e polui a base com registros
repetidos. Além disso, quem envia não valida nada e o nome do arquivo é arbitrário
(fato b), então o nome não serve como identidade.

## Decisão

Identificar cada documento pelo **hash SHA-256 do seu conteúdo binário**, calculado na
ingestão. Antes de armazenar, o serviço consulta o repositório por esse hash
(`findByHash`): se já existe, retorna o registro existente com `duplicated: true` e **não
reprocessa** (operação idempotente). No Postgres, um **índice único** sobre `contentHash`
garante a invariante mesmo sob concorrência.

## Alternativas consideradas

- **Deduplicar pelo nome do arquivo** — descartada: o nome é dado pela origem e não é
  confiável (fato b); o mesmo documento chega com nomes diferentes.
- **Não deduplicar e resolver depois na conferência** — descartada: desperdiça chamadas
  pagas de IA (fato a) e empurra trabalho manual para o atendimento.
- **Hash de metadados (tamanho + tipo)** — descartada: colisões prováveis; documentos
  diferentes com mesmo tamanho seriam tratados como iguais.

## Consequências

- **Ganhos:** reenvios não geram custo nem duplicidade; a idempotência simplifica o
  cliente (pode reenviar sem medo); o índice único é uma barreira de integridade no banco.
- **Custos/atenção:** duas fotos ligeiramente diferentes do mesmo papel (recorte/luz
  distintos) têm hashes diferentes e não são deduplicadas — dedup semântica/perceptual
  fica registrada como risco conhecido para depois; calcular o hash exige ler todo o
  binário em memória (aceitável para os limites de tamanho definidos).
