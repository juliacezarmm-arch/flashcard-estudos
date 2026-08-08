# Arquivos não utilizados / versões antigas

Esta pasta registra arquivos removidos da raiz durante a limpeza de agosto/2026.

A exclusão da raiz não apaga o histórico do Git: qualquer arquivo pode ser recuperado pelo commit anterior à limpeza ou pelo SHA indicado abaixo.

## Removidos da raiz

- `competition-ui.js` — primeira implementação antiga da Competição; não é carregada pelo `index.html` atual. Blob anterior: `afb8921a0c4f4a63ff9e5856d99f805d9f7b26ef`.
- `competition-ui-v2.js` — segunda implementação antiga completa da Competição; era carregada e logo depois substituída por `competition-update-v3.js`. Removida para evitar trabalho duplicado no navegador. Blob anterior: `0ce4b86e928e410666e23f0a544dee7f9b7b7c0f`.
- `collections-overlay-outside-close.js` — implementação antiga do fechamento do menu; substituída por `collections-overlay-outside-click.js`. Blob anterior: `9e968a6393859dfc0df5f8e474092738d9dc9bde`.
- `home-remove-study-summary-art.js` — correção antiga da Home, não carregada pelo `index.html` atual. Blob anterior: `276b80aa1153c66bdb29bb9544050c91eecf9953`.
- `mobile-home-reference-style.js` — arquivo neutralizado de compatibilidade antiga, não carregado pelo `index.html`. Blob anterior: `e36097b2d71a5c87b0b064d66e9926ebead62dba`.

## Não carregado e pendente de exclusão manual

- `competition-colors-invite-v8.js` — arquivo incompleto/truncado e substituído pelos módulos atuais da Competição. Já foi retirado do `index.html`, portanto não roda no Fixa. Blob atual: `a20b566c1bb8e34e539ef99f231fe1366411d2bf`.

## Ferramentas separadas da raiz

Os arquivos abaixo foram movidos para `ferramentas-diagnostico/` porque são páginas manuais de diagnóstico e não fazem parte do carregamento normal do Fixa:

- `diagnostico-login.html`
- `diagnostico-storage-imagens.html`

## Arquivos mantidos na raiz por segurança

- `supabase-schema.sql`: referência de banco; não é carregada pelo navegador.

## Regra para próximas alterações

Antes de adicionar um novo arquivo de correção, verificar se a mudança pode ser incorporada a um módulo existente. Evitar manter várias versões ativas da mesma funcionalidade (`v1`, `v2`, `v3`...) ao mesmo tempo.
