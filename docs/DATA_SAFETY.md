# Fixa — Regra de segurança dos dados

Esta regra é permanente no projeto Fixa.

## Princípio

Alterações de código, layout, carregamento, autenticação, imagens ou dashboard **não podem substituir em massa os dados já gravados em `flashcard_data`**.

O estado da interface nunca é autoridade suficiente para apagar ou reduzir drasticamente o estado persistido no Supabase.

## Regras obrigatórias

1. **Renderização não salva dados.** Funções de `render`/`refresh` apenas desenham a interface.
2. **Nenhum write antes da hidratação online.** A aplicação precisa terminar a leitura do Supabase antes de poder gravar `flashcard_data`.
3. **Mudanças normais devem ser pontuais.** Adicionar questões, editar uma questão, mover coleções ou substituir conteúdo específico não deve regravar/destruir dados não relacionados.
4. **Reduções massivas são bloqueadas.** Quedas bruscas de matérias/cartões são tratadas como falha de software, não como intenção do usuário.
5. **Mudança destrutiva intencional exige procedimento administrativo explícito.** Deve haver backup imediatamente anterior, revisão do impacto e bypass controlado no banco. O frontend comum nunca recebe bypass.
6. **Antes de alterações que envolvam persistência**, confirmar backup e validar depois: matérias, cartões, testes/histórico e demais dados críticos.
7. **Nunca usar um estado vazio de inicialização/login como fonte para sobrescrever o servidor.**

## Proteções implementadas

- Guard no frontend para bloquear writes durante renderização, antes da hidratação e em reduções massivas.
- Trigger no Supabase `guard_flashcard_data_mass_overwrite` para rejeitar reduções destrutivas mesmo se um cliente antigo ou defeituoso tentar gravá-las.
- O bypass de emergência é exclusivamente administrativo via configuração de sessão SQL `fixa.allow_mass_flashcard_rewrite = 'on'` e não deve ser exposto ao cliente.
