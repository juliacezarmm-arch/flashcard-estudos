create or replace function public.update_owned_competition(
  p_competition_id uuid,
  p_name text,
  p_starts_at date,
  p_ends_at date,
  p_daily_xp_limit integer,
  p_weekly_ranking_enabled boolean,
  p_visibility text
) returns jsonb
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $function$
declare
  v_user uuid := auth.uid();
  v_competition public.competitions%rowtype;
  v_name text := trim(coalesce(p_name, ''));
begin
  if v_user is null then raise exception 'Usuário não autenticado.'; end if;

  select * into v_competition
  from public.competitions
  where id = p_competition_id
  for update;

  if not found then raise exception 'Competição não encontrada.'; end if;
  if v_competition.owner_id <> v_user then raise exception 'Somente o proprietário pode editar esta competição.'; end if;
  if v_competition.status = 'completed' or v_competition.ended_at is not null then
    raise exception 'Uma competição encerrada não pode ser editada.';
  end if;
  if char_length(v_name) < 3 or char_length(v_name) > 60 then
    raise exception 'O nome deve ter entre 3 e 60 caracteres.';
  end if;
  if p_starts_at is null then raise exception 'Informe a data de início.'; end if;
  if v_competition.starts_at <= current_date and p_starts_at <> v_competition.starts_at then
    raise exception 'A data de início não pode ser alterada depois que a competição começa.';
  end if;
  if v_competition.starts_at > current_date and p_starts_at < current_date then
    raise exception 'A data de início não pode estar no passado.';
  end if;
  if p_ends_at is not null and p_ends_at < p_starts_at then
    raise exception 'A data final deve ser posterior à inicial.';
  end if;
  if p_ends_at is not null and p_ends_at < current_date then
    raise exception 'A data final não pode estar no passado.';
  end if;
  if p_daily_xp_limit is null then raise exception 'Informe o limite diário de XP.'; end if;
  if p_daily_xp_limit < 50 or p_daily_xp_limit > 2000 or mod(p_daily_xp_limit, 50) <> 0 then
    raise exception 'O limite diário deve estar entre 50 e 2000 XP, em intervalos de 50.';
  end if;
  if p_visibility is null or p_visibility not in ('private', 'public') then raise exception 'Visibilidade inválida.'; end if;

  update public.competitions
  set name = v_name,
      starts_at = p_starts_at,
      ends_at = p_ends_at,
      daily_xp_limit = p_daily_xp_limit,
      weekly_ranking_enabled = coalesce(p_weekly_ranking_enabled, false),
      visibility = p_visibility
  where id = p_competition_id;

  return jsonb_build_object(
    'id', p_competition_id,
    'name', v_name,
    'starts_at', p_starts_at,
    'ends_at', p_ends_at,
    'daily_xp_limit', p_daily_xp_limit,
    'weekly_ranking_enabled', coalesce(p_weekly_ranking_enabled, false),
    'visibility', p_visibility
  );
end;
$function$;

revoke all on function public.update_owned_competition(uuid,text,date,date,integer,boolean,text) from public, anon;
grant execute on function public.update_owned_competition(uuid,text,date,date,integer,boolean,text) to authenticated;
