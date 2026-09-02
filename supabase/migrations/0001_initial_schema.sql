-- Lighthouse of Article MVP initial schema
-- Migration: 0001_initial_schema

create extension if not exists pgcrypto;

create table if not exists public.papers (
  id uuid primary key default gen_random_uuid(),
  arxiv_id text not null unique,
  title text not null,
  authors jsonb not null default '[]'::jsonb,
  abstract text not null,
  published_at timestamptz not null,
  categories text[] not null default '{}',
  arxiv_url text not null,
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists papers_saved_at_idx
  on public.papers (saved_at desc);

create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null unique references public.papers (id) on delete cascade,
  summary_text text,
  model text,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists summaries_paper_id_idx
  on public.summaries (paper_id);

comment on table public.papers is 'Saved arXiv papers for the MVP';
comment on table public.summaries is 'One generated abstract summary per saved paper';
