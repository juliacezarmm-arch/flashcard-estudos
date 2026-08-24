# Competição

Esta pasta concentra os módulos da área de competição do Fixa.

Os arquivos ainda são carregados pelo `index.html`, na ordem definida em `appScripts`. Como muitos módulos nasceram como incrementos versionados (`v1`, `v3`, `v7`, `v9`), este README serve como mapa para manutenção.

## Ordem principal no loader

1. `competition-update-v3.js`: base da tela de competição e API global `FixaCompetitionV3`.
2. `competition-secondary-tabs-placement.js`: navegação secundária e integração com convites/gerenciador.
3. `competition-polish-v6.js`: polimento visual e recarregamento de detalhe.
4. `competition-active-flow-v1.js`: fluxo de competições ativas.
5. `competition-manager-v7.js`: tela "Minhas competições" e API `FixaCompetitionManagerV7`.
6. `competition-position-card-v1.js`: cartão "Minha posição".
7. `competition-layout-balance-v1.js`: equilíbrio visual dos cartões.
8. `competition-invitations-v9.js`: convites e badge de pendências.
9. `competition-scoring-rules-v1.js`: regras de pontuação e bônus de objetivos.
10. `competition-rules-modal-v1.js`: modal de regras acessado pela navegação secundária.
11. `competition-signal-skip-v1.js`: sinalização de questões puladas/ignoradas.
12. `competition-owner-freeze-sync-v1.js`: sincronização de congelamento pelo dono.
13. `competition-flag-review-v1.js`: revisão de sinalizações.
14. `competition-owner-freeze-notice-v1.js`: avisos relacionados a congelamento.
15. `competition-weekly-history-v1.js`: histórico semanal da competição.
16. `competition-participant-export-guard-v1.js`: proteção de exportação para participante.
17. `competition-xp-home-v4.js`: resumo de XP usado pela Home.

## Observações

- A ordem importa: vários módulos chamam `window.FixaCompetitionV3`, `window.FixaCompetitionManagerV7` ou `window.FixaCompetitionInvitationsV9`.
- Evite adicionar novos carregamentos dinâmicos com `document.createElement('script')`; prefira registrar o módulo no `index.html`.
- Quando um módulo deixar de ser experimental, vale renomear/remover o sufixo versionado em uma rodada separada e bem testada.
