# Fixa

Aplicativo estático de flashcards para organizar questões por pasta/coleção, estudar, fazer testes, acompanhar desempenho e usar recursos online via Supabase.

## Como o app carrega

- `index.html` é o carregador publicado no GitHub Pages.
- `index-base.html` contém a estrutura principal, estilos e o núcleo legado do app.
- `src/` contém módulos carregados pelo `index.html` em uma ordem definida.
- `supabase/` contém migrations e Edge Functions versionadas.
- `docs/` contém regras de manutenção e segurança de dados.
- `referencias/`, `assets/` e imagens soltas são recursos visuais usados pelo app ou por melhorias de interface.

O carregador deve apenas buscar arquivos e anexar scripts. Correções de comportamento devem ficar nos arquivos de origem dentro de `src/`, não em substituições de texto feitas em tempo de carregamento.

## Rodando localmente

Por ser um app estático, ele pode ser aberto pelo `index.html`. Para testar login, OAuth, Service Worker, Storage e recursos do navegador, prefira servir a pasta por HTTP local ou usar o GitHub Pages, porque alguns recursos não funcionam bem em `file://`.

## Supabase

O frontend usa uma chave publishable pública, como esperado para apps no navegador. Nunca coloque `service_role` ou chaves secretas no frontend.

Arquivos importantes:

- `supabase-schema.sql`: schema base para leitura manual.
- `supabase/migrations/`: histórico versionado para aplicar no projeto Supabase.
- `supabase/functions/fixa-push-worker/`: worker de notificações push.
- `docs/DATA_SAFETY.md`: regra permanente contra perda de dados de flashcards.
- `docs/SUPABASE_DEPENDENCIES.md`: lista de objetos Supabase usados pelo código.

Antes de mudanças em persistência, leia `docs/DATA_SAFETY.md`.

## Regra de ouro

Nenhuma alteração de layout, dashboard, login, carregamento ou renderização pode sobrescrever em massa os dados de `flashcard_data`. O estado vazio de inicialização nunca deve ser salvo por cima do estado online.

## Manutenção

- Evite adicionar novos arquivos `fix` quando a correção puder entrar no módulo responsável.
- Evite sobrescrever funções globais sem necessidade.
- Ao adicionar um novo RPC, tabela, bucket ou Edge Function, atualize as migrations e `docs/SUPABASE_DEPENDENCIES.md`.
- Depois de editar JS, rode uma checagem de sintaxe com Node quando possível.
