alter table public.competition_question_flags
  add column if not exists note text;

create or replace function public.flag_competition_question_v2(
  p_competition_id uuid,
  p_subject_source_id text,
  p_question_key text,
  p_question_code text default null,
  p_note text default null
) returns jsonb
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $function$
declare
  v_user uuid := auth.uid();
  v_flag public.competition_question_flags%rowtype;
  v_exists boolean := false;
begin
  if v_user is null then raise exception 'Usuário não autenticado.'; end if;
  if not public.competition_is_member(p_competition_id, v_user) then
    raise exception 'Você não participa desta competição.';
  end if;
  if trim(coalesce(p_subject_source_id,'')) = '' or trim(coalesce(p_question_key,'')) = '' then
    raise exception 'Questão inválida.';
  end if;

  select exists(
    select 1
    from public.competition_shared_folders f
    cross join lateral jsonb_array_elements(coalesce(f.content->'subjects','[]'::jsonb)) s(value)
    cross join lateral jsonb_array_elements(coalesce(s.value->'cards','[]'::jsonb)) c(value)
    where f.competition_id = p_competition_id
      and s.value->>'id' = p_subject_source_id
      and coalesce(nullif(c.value->>'questionCode',''), nullif(c.value->>'id',''), coalesce(c.value->>'q','') || '|' || coalesce(c.value->>'correctAnswerText', c.value->>'a', '')) = p_question_key
  ) into v_exists;

  if not v_exists then
    raise exception 'A questão não pertence à pasta compartilhada desta competição.';
  end if;

  insert into public.competition_question_flags(competition_id, subject_source_id, question_key, question_code, reported_by, note, status, created_at, updated_at, resolved_at, resolved_by)
  values (p_competition_id, trim(p_subject_source_id), left(trim(p_question_key),500), nullif(trim(coalesce(p_question_code,'')),''), v_user, nullif(left(trim(coalesce(p_note,'')),1200),''), 'open', now(), now(), null, null)
  on conflict (competition_id, subject_source_id, question_key, reported_by)
  do update set question_code = coalesce(excluded.question_code, public.competition_question_flags.question_code), note = coalesce(excluded.note, public.competition_question_flags.note), status = 'open', updated_at = now(), resolved_at = null, resolved_by = null
  returning * into v_flag;

  return jsonb_build_object('id', v_flag.id, 'competition_id', v_flag.competition_id, 'subject_source_id', v_flag.subject_source_id, 'question_key', v_flag.question_key, 'question_code', v_flag.question_code, 'note', v_flag.note, 'status', v_flag.status, 'reported_by_me', true);
end;
$function$;

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
      )), '[]'::jsonb) else '[]'::jsonb end,
      'notes', coalesce(jsonb_agg(jsonb_build_object(
        'user_id', case when v_owner then q.reported_by else null end,
        'name', case when v_owner then coalesce(nullif(trim(p.name),''), split_part(p.email,'@',1), 'Participante') else 'Participante' end,
        'note', q.note,
        'created_at', q.created_at
      )) filter (where nullif(trim(coalesce(q.note,'')),'') is not null), '[]'::jsonb)
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

revoke all on function public.flag_competition_question_v2(uuid,text,text,text,text) from public, anon;
revoke all on function public.list_competition_question_flags(uuid) from public, anon;
grant execute on function public.flag_competition_question_v2(uuid,text,text,text,text) to authenticated;
grant execute on function public.list_competition_question_flags(uuid) to authenticated;
