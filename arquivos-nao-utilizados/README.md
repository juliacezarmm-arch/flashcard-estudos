# Arquivos não utilizados / versões antigas

Esta pasta reúne código que não participa do carregamento atual do Fixa.

Os arquivos guardados aqui não devem ser importados, carregados por `<script>` nem usados como base para novas correções sem uma revisão explícita. A intenção é manter o histórico acessível sem deixar versões antigas misturadas ao código ativo.

## Regra de organização

- Código ativo permanece em `src/`.
- Versões antigas, módulos substituídos, compatibilidades vazias e arquivos sem nenhuma referência ativa ficam em `arquivos-nao-utilizados/`.
- A estrutura original de pastas é preservada dentro desta pasta para facilitar a identificação da origem.
- Antes de criar um novo `v1`, `v2`, `v3` etc., deve-se verificar se a alteração pode ser incorporada ao módulo ativo existente.
- Não manter simultaneamente várias versões ativas controlando a mesma região da interface.

## Arquivos antigos já retirados anteriormente

- `competition-ui.js` — primeira implementação antiga da Competição.
- `competition-ui-v2.js` — segunda implementação antiga completa da Competição; substituída por módulos posteriores.
- `collections-overlay-outside-close.js` — substituído por `collections-overlay-outside-click.js`.
- `home-remove-study-summary-art.js` — correção antiga da Home.
- `mobile-home-reference-style.js` — compatibilidade antiga neutralizada.

Esses arquivos antigos continuam recuperáveis pelo histórico do Git.

## Movidos para esta pasta em 23/08/2026

### Competição

- `src/competition/competition-colors-invite-v8.js` → `arquivos-nao-utilizados/src/competition/competition-colors-invite-v8.js`
  - Arquivo incompleto/truncado, sem referência ativa e já substituído pelos módulos atuais da Competição.

### Home / correções antigas

- `src/fixes/home-empty-state-illustrations.js` → `arquivos-nao-utilizados/src/fixes/home-empty-state-illustrations.js`
  - Módulo antigo já marcado no próprio código como desativado e substituído por `home-empty-state-art.js`.
- `src/fixes/home-greeting-right-v1.js` → `arquivos-nao-utilizados/src/fixes/home-greeting-right-v1.js`
  - Implementação antiga de cabeçalho/Home, sem carregamento ou referência ativa.
- `src/fixes/home-readable-layout-v1.js` → `arquivos-nao-utilizados/src/fixes/home-readable-layout-v1.js`
  - Layout antigo da Home, sem carregamento ou referência ativa.
- `src/fixes/home-study-insights-v1.js` → `arquivos-nao-utilizados/src/fixes/home-study-insights-v1.js`
  - Implementação antiga de insights/Home, sem carregamento ou referência ativa.
- `src/fixes/home-today-period-v1.js` → `arquivos-nao-utilizados/src/fixes/home-today-period-v1.js`
  - Arquivo de compatibilidade vazio; a lógica já está consolidada em módulos atuais.
- `src/fixes/home-unified-dashboard-v1.js` → `arquivos-nao-utilizados/src/fixes/home-unified-dashboard-v1.js`
  - Versão anterior substituída pelo `home-unified-dashboard-v2.js`.
- `src/fixes/load-home-goals-streak-v1.js` → `arquivos-nao-utilizados/src/fixes/load-home-goals-streak-v1.js`
  - Loader redundante; o módulo alvo já é carregado diretamente pelo `index.html`.
- `src/fixes/progress-objectives-summary-fix.js` → `arquivos-nao-utilizados/src/fixes/progress-objectives-summary-fix.js`
  - Correção antiga do painel de progresso que não é carregada nem referenciada pelo Fixa atual.

### Notificações

- `src/notifications/web-push-v1.js` → `arquivos-nao-utilizados/src/notifications/web-push-v1.js`
  - Implementação de Web Push sem carregamento ou referência ativa no aplicativo atual.
  - Como era o único arquivo de `src/notifications/`, essa pasta deixa de existir no código ativo.

## Ferramentas separadas

Os arquivos de diagnóstico permanecem em `ferramentas-diagnostico/`, pois são páginas manuais e não fazem parte do carregamento normal do Fixa.

## Arquivos de referência que permanecem fora desta pasta

- `referencias/`: imagens, ícones e desenhos usados pela interface. Não é código obsoleto.
- `docs/`: documentação do projeto.
- `supabase/` e `supabase-schema.sql`: banco de dados e funções do Supabase; não são código visual da Home.
