-- Fixa: SQL completo para colar no Supabase SQL Editor.
-- A mesma estrutura tambem esta versionada em:
-- supabase/migrations/202607190001_init_fixa_auth_data.sql

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flashcard_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"selected":"","folders":[],"testHistory":[],"subjects":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set
    name = excluded.name,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_flashcard_data_updated_at on public.flashcard_data;
create trigger set_flashcard_data_updated_at
before update on public.flashcard_data
for each row
execute function public.set_updated_at();

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.flashcard_data enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can read own flashcard data" on public.flashcard_data;
create policy "Users can read own flashcard data"
on public.flashcard_data
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own flashcard data" on public.flashcard_data;
create policy "Users can insert own flashcard data"
on public.flashcard_data
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own flashcard data" on public.flashcard_data;
create policy "Users can update own flashcard data"
on public.flashcard_data
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own flashcard data" on public.flashcard_data;
create policy "Users can delete own flashcard data"
on public.flashcard_data
for delete
to authenticated
using ((select auth.uid()) = user_id);
