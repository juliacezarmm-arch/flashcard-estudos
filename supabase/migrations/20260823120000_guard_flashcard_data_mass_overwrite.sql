-- Protect flashcard_data from accidental destructive overwrites.
-- Emergency administrative bypass, only inside a trusted SQL session:
--   set local fixa.allow_mass_flashcard_rewrite = 'on';

create or replace function public.guard_flashcard_data_mass_overwrite()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  old_subjects integer := 0;
  old_cards integer := 0;
  new_subjects integer := 0;
  new_cards integer := 0;
begin
  if coalesce(current_setting('fixa.allow_mass_flashcard_rewrite', true), '') = 'on' then
    return new;
  end if;

  if new.data is not distinct from old.data then
    return new;
  end if;

  select count(*)::integer,
         coalesce(sum(
           case
             when jsonb_typeof(subject.value->'cards') = 'array'
               then jsonb_array_length(subject.value->'cards')
             else 0
           end
         ), 0)::integer
    into old_subjects, old_cards
  from jsonb_array_elements(
    case when jsonb_typeof(old.data->'subjects') = 'array'
      then old.data->'subjects'
      else '[]'::jsonb
    end
  ) as subject(value);

  select count(*)::integer,
         coalesce(sum(
           case
             when jsonb_typeof(subject.value->'cards') = 'array'
               then jsonb_array_length(subject.value->'cards')
             else 0
           end
         ), 0)::integer
    into new_subjects, new_cards
  from jsonb_array_elements(
    case when jsonb_typeof(new.data->'subjects') = 'array'
      then new.data->'subjects'
      else '[]'::jsonb
    end
  ) as subject(value);

  if old_cards >= 20 and new_cards = 0 then
    raise exception 'Fixa data safety: blocked write that would remove all cards (% -> %).', old_cards, new_cards
      using errcode = '23514';
  end if;

  if old_subjects >= 5 and new_subjects = 0 then
    raise exception 'Fixa data safety: blocked write that would remove all subjects (% -> %).', old_subjects, new_subjects
      using errcode = '23514';
  end if;

  if old_cards >= 50 and new_cards < floor(old_cards * 0.50) then
    raise exception 'Fixa data safety: blocked massive card reduction (% -> %).', old_cards, new_cards
      using errcode = '23514';
  end if;

  if old_subjects >= 10 and new_subjects < floor(old_subjects * 0.50) then
    raise exception 'Fixa data safety: blocked massive subject reduction (% -> %).', old_subjects, new_subjects
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke execute on function public.guard_flashcard_data_mass_overwrite() from public, anon, authenticated;

drop trigger if exists guard_flashcard_data_mass_overwrite on public.flashcard_data;
create trigger guard_flashcard_data_mass_overwrite
before update of data on public.flashcard_data
for each row
execute function public.guard_flashcard_data_mass_overwrite();
