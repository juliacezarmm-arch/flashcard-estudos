# Dependências Supabase

Este arquivo lista os objetos Supabase que o código do Fixa chama diretamente. Ele serve como mapa de manutenção: se um item está aqui, precisa existir no banco/projeto Supabase de produção ou o recurso correspondente pode falhar.

## Tabelas acessadas pelo frontend

- `flashcard_data`
- `user_xp_events`

## Storage

- Bucket `questoes-imagens`

O app grava imagens em caminhos prefixados pelo `currentUser.id` e resolve leitura por signed URL. As políticas do bucket precisam garantir que cada usuário acesse apenas seus próprios objetos.

## RPCs usados pelo frontend

- `accept_competition_invitation`
- `award_competition_xp`
- `cancel_competition_invitation`
- `competition_is_owner`
- `create_competition_v4`
- `decline_competition_invitation`
- `delete_competition`
- `end_competition`
- `flag_competition_question`
- `get_competition_dashboard`
- `get_competition_folder`
- `get_competition_folder_meta`
- `get_competition_weekly_history`
- `invite_competition_by_email`
- `join_competition_by_code`
- `leave_competition`
- `list_competition_question_flags`
- `list_my_competition_invitations`
- `list_my_competitions`
- `list_sent_competition_invitations`
- `lookup_competition_invitee_by_email`
- `record_user_xp`
- `resolve_competition_question_flag`
- `sync_competition_folder`

## Edge Function `fixa-push-worker`

RPCs usados:

- `get_push_worker_config`
- `sync_push_notification_sources`

Tabelas acessadas:

- `user_notifications`
- `user_push_deliveries`
- `user_push_preferences`
- `user_push_subscriptions`
- `user_streak_protected_days`
- `user_xp_events`

## Lacuna conhecida

As migrations versionadas neste repositório ainda não parecem recriar todo o schema usado por competição, XP, convites, notificações e push. Antes de recriar o projeto Supabase do zero, é preciso exportar/versionar o restante do schema real.
