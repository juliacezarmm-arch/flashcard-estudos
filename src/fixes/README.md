# Fixes e módulos de acabamento

Esta pasta ainda concentra ajustes incrementais que foram criados depois do `index-base.html`.
Eles continuam carregados pelo `index.html`, mas a ordem agora fica centralizada na lista `appScripts`.

## Grupos atuais

### Layout geral

- `topbar-home-alignment.js`: densidade visual, topbar e ajustes responsivos gerais.
- `secondary-tabs-layout-fix.js`: padrão global das abas secundárias.
- `secondary-content-spacing-v1.js`: espaçamento entre abas secundárias e conteúdo.
- `dex-bottom-scroll-fix.js`: rolagem em telas/ambientes DeX.

### Área Adicionar e Questões

- `add-spacing-fix.js`: espaçamento da área Adicionar.
- `add-buttons-style.js`: aparência e posição dos botões da área Adicionar.
- `questions-height-fix.js`: altura/rolagem da área de questões.

### Ajustes temporários da Home

- `hotfix-home-encoding.js`: correções de texto, rótulos e pequenas proteções herdadas da Home.

Os módulos principais da Home foram movidos para `src/home`.
Os módulos principais de competição ficam em `src/competition`.

## Próximas consolidações recomendadas

1. Incorporar ajustes estáveis da Home em módulos oficiais da Home.
2. Renomear ou remover arquivos que deixaram de ser apenas "fix", quando o comportamento já estiver consolidado.
