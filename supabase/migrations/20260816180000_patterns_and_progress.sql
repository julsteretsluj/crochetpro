-- Run this in the Supabase SQL Editor (Project → SQL → New query).
-- Enables email/password accounts + cloud pattern + progress storage.

create table if not exists public.patterns (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create table if not exists public.pattern_progress (
  pattern_id uuid not null references public.patterns (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  completed_ids jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (pattern_id, user_id)
);

alter table public.patterns enable row level security;
alter table public.pattern_progress enable row level security;

drop policy if exists "patterns_select_own" on public.patterns;
create policy "patterns_select_own"
  on public.patterns for select
  using (auth.uid() = user_id);

drop policy if exists "patterns_insert_own" on public.patterns;
create policy "patterns_insert_own"
  on public.patterns for insert
  with check (auth.uid() = user_id);

drop policy if exists "patterns_update_own" on public.patterns;
create policy "patterns_update_own"
  on public.patterns for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "patterns_delete_own" on public.patterns;
create policy "patterns_delete_own"
  on public.patterns for delete
  using (auth.uid() = user_id);

drop policy if exists "progress_select_own" on public.pattern_progress;
create policy "progress_select_own"
  on public.pattern_progress for select
  using (auth.uid() = user_id);

drop policy if exists "progress_insert_own" on public.pattern_progress;
create policy "progress_insert_own"
  on public.pattern_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.pattern_progress;
create policy "progress_update_own"
  on public.pattern_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "progress_delete_own" on public.pattern_progress;
create policy "progress_delete_own"
  on public.pattern_progress for delete
  using (auth.uid() = user_id);
