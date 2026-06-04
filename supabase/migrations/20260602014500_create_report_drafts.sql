create table if not exists public.report_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  latitude float8,
  longitude float8,
  alamat text,
  detail text,
  jenis_bencana text,
  keparahan text,
  deskripsi text,
  kebutuhan text[],
  media_paths text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.report_drafts add column if not exists user_id uuid;
alter table public.report_drafts add column if not exists latitude float8;
alter table public.report_drafts add column if not exists longitude float8;
alter table public.report_drafts add column if not exists alamat text;
alter table public.report_drafts add column if not exists detail text;
alter table public.report_drafts add column if not exists jenis_bencana text;
alter table public.report_drafts add column if not exists keparahan text;
alter table public.report_drafts add column if not exists deskripsi text;
alter table public.report_drafts add column if not exists kebutuhan text[];
alter table public.report_drafts add column if not exists media_paths text[];
alter table public.report_drafts add column if not exists created_at timestamptz not null default now();
alter table public.report_drafts add column if not exists updated_at timestamptz not null default now();
alter table public.report_drafts alter column created_at set default now();
alter table public.report_drafts alter column updated_at set default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.report_drafts'::regclass
      and conname = 'report_drafts_user_id_key'
  ) then
    alter table public.report_drafts add constraint report_drafts_user_id_key unique (user_id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.report_drafts'::regclass
      and conname = 'report_drafts_user_id_fkey'
  ) then
    alter table public.report_drafts
      add constraint report_drafts_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create index if not exists report_drafts_user_id_idx on public.report_drafts (user_id);

create or replace trigger set_report_drafts_updated_at
  before update on public.report_drafts
  for each row execute function public.set_updated_at();

alter table public.report_drafts enable row level security;

drop policy if exists "report_drafts_select_own" on public.report_drafts;
drop policy if exists "report_drafts_insert_own" on public.report_drafts;
drop policy if exists "report_drafts_update_own" on public.report_drafts;
drop policy if exists "report_drafts_delete_own" on public.report_drafts;

create policy "report_drafts_select_own"
  on public.report_drafts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "report_drafts_insert_own"
  on public.report_drafts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "report_drafts_update_own"
  on public.report_drafts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "report_drafts_delete_own"
  on public.report_drafts
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.report_drafts to authenticated;
