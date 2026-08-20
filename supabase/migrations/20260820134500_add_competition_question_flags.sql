create table if not exists public.competition_question_flags (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  subject_source_id text not null,
  question_key text not null,
  question_code text,
  reported_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  unique (competition_id, subject_source_id, question_key, reported_by)
);

alter table public.competition_question_flags enable row level security;
revoke all on public.competition_question_flags from anon, authenticated;

create index if not exists competition_question_flags_open_idx
  on public.competition_question_flags (competition_id, status, subject_source_id, question_key);

create or replace function public.flag_competition_question(
  p_competition_id uuid,
  p_subject_source_id text,
  p_question_key text,
  p_question_code text default null
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
      and coalesce(
        nullif(c.value->>'questionCode',''),
        nullif(c.value->>'id',''),
        coalesce(c.value->>'q','') || '|' || coalesce(c.value->>'correctAnswerText', c.value->>'a', '')
      ) = p_question_key
  ) into v_exists;

  if not v_exists then
    raise exception 'A questão não pertence à pasta compartilhada desta competição.';
  end if;

  insert into public.competition_question_flags(
    competition_id, subject_source_id, question_key, question_code, reported_by,
    status, created_at, updated_at, resolved_at, resolved_by
  ) values (
    p_competition_id, trim(p_subject_source_id), left(trim(p_question_key),500),
    nullif(trim(coalesce(p_question_code,'')),''), v_user,
    'open', now(), now(), null, null
  )
  on conflict (competition_id, subject_source_id, question_key, reported_by)
  do update set
    question_code = coalesce(excluded.question_code, public.competition_question_flags.question_code),
    status = 'open',
    updated_at = now(),
    resolved_at = null,
    resolved_by = null
  returning * into v_flag;

  return jsonb_build_object(
    'id', v_flag.id,
    'competition_id', v_flag.competition_id,
    'subject_source_id', v_flag.subject_source_id,
    'question_key', v_flag.question_key,
    'question_code', v_flag.question_code,
    'status', v_flag.status,
    'reported_by_me', true
  );
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
  v_result jsonb := '[]'::jsonb;
begin
  if v_user is null then raise exception 'Usuário não autenticado.'; end if;
  if not public.competition_is_member(p_competition_id, v_user) then
    raise exception 'Você não participa desta competição.';
  end if;
  v_owner := public.competition_is_owner(p_competition_id, v_user);

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
      'first_reported_at', min(q.created_at),
      'reporters', case when v_owner then coalesce(jsonb_agg(distinct jsonb_build_object(
        'user_id', q.reported_by,
        'name', coalesce(nullif(trim(p.name),''), split_part(p.email,'@',1), 'Participante')
      )), '[]'::jsonb) else '[]'::jsonb end
    ) as item
    from public.competition_question_flags q
    left join public.profiles p on p.id=q.reported_by
    where q.competition_id=p_competition_id and q.status='open'
    group by q.competition_id,q.subject_source_id,q.question_key
  ) grouped;

  return v_result;
end;
$function$;

create or replace function public.resolve_competition_question_flag(
  p_competition_id uuid,
  p_subject_source_id text,
  p_question_key text
) returns integer
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $function$
declare
  v_user uuid := auth.uid();
  v_count integer := 0;
begin
  if v_user is null then raise exception 'Usuário não autenticado.'; end if;
  if not public.competition_is_owner(p_competition_id, v_user) then
    raise exception 'Somente o dono pode liberar uma questão sinalizada.';
  end if;

  update public.competition_question_flags
  set status='resolved', resolved_at=now(), resolved_by=v_user, updated_at=now()
  where competition_id=p_competition_id
    and subject_source_id=p_subject_source_id
    and question_key=p_question_key
    and status='open';
  get diagnostics v_count = row_count;
  return v_count;
end;
$function$;

revoke all on function public.flag_competition_question(uuid,text,text,text) from public, anon;
revoke all on function public.list_competition_question_flags(uuid) from public, anon;
revoke all on function public.resolve_competition_question_flag(uuid,text,text) from public, anon;
grant execute on function public.flag_competition_question(uuid,text,text,text) to authenticated;
grant execute on function public.list_competition_question_flags(uuid) to authenticated;
grant execute on function public.resolve_competition_question_flag(uuid,text,text) to authenticated;

create or replace function public.get_competition_folder_meta(p_competition_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public','pg_temp'
as $function$
declare
  v_user uuid := auth.uid();
  v_result jsonb;
begin
  if v_user is null then raise exception 'Usuário não autenticado.'; end if;
  if not public.competition_is_member(p_competition_id, v_user) then
    raise exception 'Você não participa desta competição.';
  end if;

  select jsonb_build_object(
    'competition_id', f.competition_id,
    'folder_name', f.folder_name,
    'version', f.version,
    'updated_at', f.updated_at,
    'collection_count', coalesce(jsonb_array_length(coalesce(f.content->'subjects','[]'::jsonb)),0),
    'question_count', coalesce((
      select sum(jsonb_array_length(coalesce(s.value->'cards','[]'::jsonb)))
      from jsonb_array_elements(coalesce(f.content->'subjects','[]'::jsonb)) s(value)
    ),0),
    'flagged_question_count', coalesce((
      select count(*) from (
        select distinct q.subject_source_id,q.question_key
        from public.competition_question_flags q
        where q.competition_id=f.competition_id and q.status='open'
      ) x
    ),0),
    'owner_name', coalesce(nullif(trim(p.name),''), split_part(p.email,'@',1), 'Dono')
  ) into v_result
  from public.competition_shared_folders f
  left join public.profiles p on p.id=f.owner_id
  where f.competition_id=p_competition_id;

  return coalesce(v_result, '{}'::jsonb);
end;
$function$;

revoke all on function public.get_competition_folder_meta(uuid) from public, anon;
grant execute on function public.get_competition_folder_meta(uuid) to authenticated;
