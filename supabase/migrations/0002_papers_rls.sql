-- Lighthouse of Article MVP paper access policies
-- Migration: 0002_papers_rls

-- The MVP does not require authentication, so the server's anon client needs
-- policies for the paper operations exposed by the application.
alter table public.papers enable row level security;

drop policy if exists "MVP paper select" on public.papers;
create policy "MVP paper select"
  on public.papers
  for select
  to anon, authenticated
  using (true);

drop policy if exists "MVP paper insert" on public.papers;
create policy "MVP paper insert"
  on public.papers
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "MVP paper delete" on public.papers;
create policy "MVP paper delete"
  on public.papers
  for delete
  to anon, authenticated
  using (true);
