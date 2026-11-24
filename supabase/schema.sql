-- Esquema inicial de Novelador. Ejecutar en Supabase SQL Editor.
create table if not exists public.novels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Mi novela',
  project_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.novels enable row level security;

create policy "Users can read their own novels" on public.novels
  for select using (auth.uid() = user_id);
create policy "Users can insert their own novels" on public.novels
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own novels" on public.novels
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own novels" on public.novels
  for delete using (auth.uid() = user_id);

create index if not exists novels_user_updated_idx on public.novels(user_id, updated_at desc);
