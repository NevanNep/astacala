create extension if not exists pgcrypto;

create table if not exists public.laporan (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  judul text not null check (char_length(trim(judul)) > 0),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  alamat text not null check (char_length(trim(alamat)) > 0),
  detail text,
  jenis_bencana text not null check (
    jenis_bencana in ('Banjir', 'Gempa', 'Longsor', 'Kebakaran', 'Tsunami', 'Lainnya')
  ),
  keparahan text not null check (
    keparahan in ('Ringan', 'Sedang', 'Parah', 'Kritis')
  ),
  deskripsi text not null check (char_length(trim(deskripsi)) >= 30),
  kebutuhan text[] not null default '{}',
  status text not null default 'Pending' check (
    status in ('Pending', 'Diterima', 'Ditolak')
  ),
  alasan_penolakan text,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.laporan_media (
  id uuid primary key default gen_random_uuid(),
  laporan_id text not null references public.laporan(id) on delete cascade,
  storage_path text not null,
  type text not null check (type in ('foto', 'video')),
  created_at timestamptz not null default now()
);

create index if not exists laporan_user_created_at_idx
  on public.laporan (user_id, created_at desc);

create index if not exists laporan_status_idx
  on public.laporan (status);

create index if not exists laporan_media_laporan_id_idx
  on public.laporan_media (laporan_id);

alter table public.laporan enable row level security;
alter table public.laporan_media enable row level security;

drop policy if exists "relawan_select_own_laporan" on public.laporan;
create policy "relawan_select_own_laporan"
  on public.laporan
  for select
  using (auth.uid() = user_id);

drop policy if exists "relawan_insert_own_laporan" on public.laporan;
create policy "relawan_insert_own_laporan"
  on public.laporan
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "admin_select_laporan" on public.laporan;
create policy "admin_select_laporan"
  on public.laporan
  for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin_update_laporan_status" on public.laporan;
create policy "admin_update_laporan_status"
  on public.laporan
  for update
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "relawan_select_own_laporan_media" on public.laporan_media;
create policy "relawan_select_own_laporan_media"
  on public.laporan_media
  for select
  using (
    exists (
      select 1
      from public.laporan
      where laporan.id = laporan_media.laporan_id
        and laporan.user_id = auth.uid()
    )
  );

drop policy if exists "relawan_insert_own_laporan_media" on public.laporan_media;
create policy "relawan_insert_own_laporan_media"
  on public.laporan_media
  for insert
  with check (
    exists (
      select 1
      from public.laporan
      where laporan.id = laporan_media.laporan_id
        and laporan.user_id = auth.uid()
    )
  );

drop policy if exists "admin_select_laporan_media" on public.laporan_media;
create policy "admin_select_laporan_media"
  on public.laporan_media
  for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'laporan-media',
  'laporan-media',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do nothing;
