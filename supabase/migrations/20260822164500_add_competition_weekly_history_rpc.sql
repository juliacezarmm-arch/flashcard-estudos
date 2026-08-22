create or replace function public.get_competition_weekly_history(p_competition_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public','pg_temp'
as $function$
declare
  v_user uuid := auth.uid();
  v_result jsonb := '[]'::jsonb;
begin
  if v_user is null then raise exception 'Usuário não autenticado.'; end if;
  if not public.competition_is_member(p_competition_id, v_user) then
    raise exception 'Você não participa desta competição.';
  end if;

  with comp as (
    select c.*,
      case
        when c.status = 'completed' then coalesce(c.ended_at::date, c.ends_at, current_date)
        when c.ends_at is not null and current_date > c.ends_at then c.ends_at
        else null
      end as completed_on
    from public.competitions c
    where c.id = p_competition_id
  ), weeks as (
    select
      gs::date as calendar_week_start,
      greatest(gs::date, c.starts_at) as period_start,
      least((gs::date + 6), coalesce(c.completed_on, gs::date + 6)) as period_end,
      row_number() over(order by gs)::integer as week_number
    from comp c
    cross join lateral generate_series(
      date_trunc('week', c.starts_at::timestamp)::date,
      date_trunc('week', coalesce(c.completed_on, current_date)::timestamp)::date,
      interval '7 days'
    ) gs
    where
      (gs::date + 6) < current_date
      or (c.completed_on is not null and c.completed_on <= (gs::date + 6))
  ), member_stats as (
    select
      w.week_number,
      w.period_start,
      w.period_end,
      m.user_id,
      coalesce(nullif(trim(p.name),''), split_part(p.email,'@',1), 'Participante') as name,
      p.avatar_url,
      m.joined_at,
      coalesce(sum(x.points),0)::integer as total_xp,
      count(distinct x.occurred_on)::integer as study_days,
      count(*) filter(where x.event_type='test_completed')::integer as tests_completed,
      coalesce(round(avg(case
        when x.metadata ? 'accuracy' and coalesce(x.metadata->>'accuracy','') ~ '^\d+(\.\d+)?$'
          then (x.metadata->>'accuracy')::numeric
      end),1),0) as average_accuracy,
      min(x.created_at) filter(where x.points>0) as first_score_at
    from weeks w
    join public.competition_members m on m.competition_id = p_competition_id
    left join public.profiles p on p.id = m.user_id
    left join public.competition_xp_events x
      on x.competition_id = p_competition_id
     and x.user_id = m.user_id
     and x.occurred_on between w.period_start and w.period_end
    group by w.week_number,w.period_start,w.period_end,m.user_id,p.name,p.email,p.avatar_url,m.joined_at
  ), ranked as (
    select
      s.*,
      row_number() over(
        partition by s.week_number
        order by s.total_xp desc,
                 s.study_days desc,
                 s.tests_completed desc,
                 s.average_accuracy desc,
                 s.first_score_at asc nulls last,
                 s.joined_at asc
      )::integer as position
    from member_stats s
  ), winners as (
    select * from ranked where position = 1
  )
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'week_number', w.week_number,
      'starts_at', w.period_start,
      'ends_at', w.period_end,
      'winner_user_id', case when coalesce(r.total_xp,0) > 0 then r.user_id else null end,
      'winner_name', case when coalesce(r.total_xp,0) > 0 then r.name else null end,
      'winner_avatar_url', case when coalesce(r.total_xp,0) > 0 then r.avatar_url else null end,
      'winner_xp', coalesce(r.total_xp,0)
    ) order by w.week_number
  ), '[]'::jsonb)
  into v_result
  from weeks w
  left join winners r on r.week_number = w.week_number;

  return v_result;
end;
$function$;

revoke all on function public.get_competition_weekly_history(uuid) from public, anon;
grant execute on function public.get_competition_weekly_history(uuid) to authenticated;
