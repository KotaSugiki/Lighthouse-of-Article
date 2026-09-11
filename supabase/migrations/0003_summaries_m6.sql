-- Migration: 0003_summaries_m6
-- Store structured summaries and expose the MVP summary lifecycle to the anon client.

alter table public.summaries
  add column if not exists summary_json jsonb;

alter table public.summaries enable row level security;

drop policy if exists "MVP summary select" on public.summaries;
create policy "MVP summary select"
  on public.summaries
  for select
  to anon, authenticated
  using (true);

drop policy if exists "MVP summary insert" on public.summaries;
create policy "MVP summary insert"
  on public.summaries
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "MVP summary update" on public.summaries;
create policy "MVP summary update"
  on public.summaries
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "MVP summary delete" on public.summaries;
create policy "MVP summary delete"
  on public.summaries
  for delete
  to anon, authenticated
  using (true);
