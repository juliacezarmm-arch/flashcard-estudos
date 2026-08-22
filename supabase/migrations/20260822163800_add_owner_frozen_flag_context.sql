create or replace function public.list_competition_question_flags(p_competition_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public','pg_temp'
as $function$
declare
  v_user uuid := auth.uid();
  v_owner boolean := false;
  v_owner_id uuid;
  v_result jsonb := '[]'::jsonb;
begin
  if v_user is null then raise exception 'Usuário não autenticado.'; end if;
  if not public.competition_is_member(p_competition_id, v_user) then
    raise exception 'Você não participa desta competição.';
  end if;

  v_owner := public.competition_is_owner(p_competition_id, v_user);
  select c.owner_id into v_owner_id
  from public.competitions c
  where c.id = p_competition_id;

  select coalesce(jsonb_agg(item order by item->>'first_reported_at'), '[]'::jsonb)
  into v_result
  from (
    select jsonb_build_object(
      'competition_id', q.competition_id,
      'subject_source_id', q.subject_source_id,
      'question_key', q.question_key,
      'question_code', max(q.question_code),
      'reporter_count', count(*)::integer,
      'reported_by_me', bool_or(q.reported_by = v_user),
      'owner_reported', bool_or(q.reported_by = v_owner_id),
      'first_reported_at', min(q.created_at),
      'reporters', case when v_owner then coalesce(jsonb_agg(distinct jsonb_build_object(
        'user_id', q.reported_by,
        'name', coalesce(nullif(trim(p.name),''), split_part(p.email,'@',1), 'Participante')
      )), '[]'::jsonb) else '[]'::jsonb end
    ) as item
    from public.competition_question_flags q
    left join public.profiles p on p.id = q.reported_by
    where q.competition_id = p_competition_id
      and q.status = 'open'
    group by q.competition_id, q.subject_source_id, q.question_key
  ) grouped;

  return v_result;
end;
$function$;

revoke all on function public.list_competition_question_flags(uuid) from public, anon;
grant execute on function public.list_competition_question_flags(uuid) to authenticated;
