# ADR-0005 — Limiar de confiança roteando para conferência humana

- **Status:** Aceito
- **Data:** 2026-08-31

## Contexto

Quando a máquina não tem confiança no que produziu, o documento não pode entrar como
pronto: ele deve ficar para conferência humana, e a pessoa conferente corrige o que a
máquina errou (comportamento 4 do produto). Os documentos são dados pessoais e sensíveis
(fato d), então um campo extraído errado que passe como correto tem consequência real.

## Decisão

Definir um **limiar de confiança** configurável (`CONFIDENCE_THRESHOLD`, padrão 0.85).
Após a extração, o `ProcessingService` compara a confiança devolvida pela IA com o
limiar: se **≥ limiar**, o documento vai para `PROCESSADO`; se **abaixo**, vai para
`PENDENTE_CONFERENCIA` (RF09) e não é exposto como pronto. É uma invariante de domínio: só
há transição para `PROCESSADO` quando existe um `ExtractionResult` com confiança
suficiente.

## Alternativas consideradas

- **Aceitar tudo que a IA devolve** — descartada: contraria o comportamento 4 e deixa
  erros silenciosos entrarem como verdade em dados sensíveis.
- **Enviar todo documento para conferência** — descartada: anula o ganho de automação;
  a triagem manual é justamente o que se quer reduzir.
- **Limiar fixo no código** — descartada: o valor certo depende de calibração com dados
  reais; deixá-lo em configuração permite ajustar sem redeploy.

## Consequências

- **Ganhos:** equilíbrio explícito entre automação e segurança; o ponto de corte é um
  botão de configuração, ajustável conforme se observa a qualidade real; a fila de
  conferência recebe só o que precisa de olho humano.
- **Custos/atenção:** um único limiar global ignora que alguns campos/tipos são mais
  críticos que outros — limiar por tipo ou por campo fica registrado como evolução; a
  calibração do valor depende de dados que ainda não temos.
