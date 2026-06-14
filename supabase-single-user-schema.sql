create table if not exists public.flashcard_single_data (
  id text primary key,
  data jsonb not null default '{"selected":"","subjects":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.flashcard_single_data enable row level security;

drop policy if exists "Public can read flashcard single data" on public.flashcard_single_data;
create policy "Public can read flashcard single data"
on public.flashcard_single_data
for select
to anon
using (id = 'main');

drop policy if exists "Public can insert flashcard single data" on public.flashcard_single_data;
create policy "Public can insert flashcard single data"
on public.flashcard_single_data
for insert
to anon
with check (id = 'main');

drop policy if exists "Public can update flashcard single data" on public.flashcard_single_data;
create policy "Public can update flashcard single data"
on public.flashcard_single_data
for update
to anon
using (id = 'main')
with check (id = 'main');

insert into public.flashcard_single_data (id, data)
values ('main', '{"selected":"","subjects":[]}'::jsonb)
on conflict (id) do nothing;
