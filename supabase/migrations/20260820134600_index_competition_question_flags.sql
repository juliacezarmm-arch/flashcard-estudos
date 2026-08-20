create index if not exists competition_question_flags_reported_by_idx
  on public.competition_question_flags(reported_by);

create index if not exists competition_question_flags_resolved_by_idx
  on public.competition_question_flags(resolved_by)
  where resolved_by is not null;
