# Home

Esta pasta concentra os módulos da página inicial do Fixa.

Eles ainda são carregados pelo `index.html`, na ordem definida em `appScripts`, mas não ficam mais misturados com ajustes genéricos em `src/fixes`.

## Módulos

- `home-data-ready-refresh-v1.js`: atualiza a Home quando os dados reais terminam de carregar.
- `home-today-polish-no-scroll.js`: painel Hoje/Semana/Mês e estrutura principal da Home.
- `home-unified-dashboard-v2.js`: dashboard consolidado da Home.
- `home-goals-streak-protection-v1.js`: metas, XP e proteção de sequência.
- `home-reference-layout-v3.js`: layout visual de referência da Home.
- `home-art-and-competition-icon-fix.js`: arte, ícones e polimento visual.
- `home-empty-state-art.js`: estados vazios e artes auxiliares.
- `sequence-visual-fix.js`: sequência visual de dias estudados.

## Próxima consolidação

O ideal é, aos poucos, transformar os arquivos com sufixo `fix` em módulos definitivos ou incorporar partes estáveis em um módulo principal da Home.
