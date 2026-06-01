create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text,
  nim text,
  no_hp text,
  role text not null default 'relawan',
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists nama text;
alter table public.profiles add column if not exists nim text;
alter table public.profiles add column if not exists no_hp text;
alter table public.profiles add column if not exists role text not null default 'relawan';
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles alter column role set default 'relawan';
update public.profiles set role = 'relawan' where role is null;
alter table public.profiles alter column role set not null;

create table if not exists public.laporan (
  id text primary key,
  user_id uuid not null constraint laporan_user_id_profiles_fkey references public.profiles(id) on delete cascade,
  judul text,
  latitude float8 not null,
  longitude float8 not null,
  alamat text not null,
  detail text,
  jenis_bencana text not null,
  keparahan text not null,
  deskripsi text not null,
  kebutuhan text[] default '{}',
  status text default 'Pending',
  alasan_penolakan text,
  verified_at timestamptz,
  created_at timestamptz default now()
);

alter table public.laporan add column if not exists user_id uuid;
alter table public.laporan add column if not exists judul text;
alter table public.laporan add column if not exists latitude float8;
alter table public.laporan add column if not exists longitude float8;
alter table public.laporan add column if not exists alamat text;
alter table public.laporan add column if not exists detail text;
alter table public.laporan add column if not exists jenis_bencana text;
alter table public.laporan add column if not exists keparahan text;
alter table public.laporan add column if not exists deskripsi text;
alter table public.laporan add column if not exists kebutuhan text[] default '{}';
alter table public.laporan add column if not exists status text default 'Pending';
alter table public.laporan add column if not exists alasan_penolakan text;
alter table public.laporan add column if not exists verified_at timestamptz;
alter table public.laporan add column if not exists created_at timestamptz default now();
alter table public.laporan alter column kebutuhan set default '{}';
alter table public.laporan alter column status set default 'Pending';
alter table public.laporan alter column created_at set default now();

create table if not exists public.laporan_media (
  id uuid primary key default gen_random_uuid(),
  laporan_id text not null constraint laporan_media_laporan_id_fkey references public.laporan(id) on delete cascade,
  storage_path text not null,
  type text not null,
  created_at timestamptz default now()
);

alter table public.laporan_media add column if not exists laporan_id text;
alter table public.laporan_media add column if not exists storage_path text;
alter table public.laporan_media add column if not exists type text;
alter table public.laporan_media add column if not exists created_at timestamptz default now();
alter table public.laporan_media alter column created_at set default now();

create table if not exists public.misi (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  lokasi text not null,
  latitude float8,
  longitude float8,
  deskripsi text not null,
  persyaratan text[] default '{}',
  jenis text,
  koordinator text,
  tanggal_mulai date,
  tanggal_selesai date,
  kuota int,
  status text default 'Terbuka',
  created_by uuid constraint misi_created_by_profiles_fkey references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.misi add column if not exists judul text;
alter table public.misi add column if not exists lokasi text;
alter table public.misi add column if not exists latitude float8;
alter table public.misi add column if not exists longitude float8;
alter table public.misi add column if not exists deskripsi text;
alter table public.misi add column if not exists persyaratan text[] default '{}';
alter table public.misi add column if not exists jenis text;
alter table public.misi add column if not exists koordinator text;
alter table public.misi add column if not exists tanggal_mulai date;
alter table public.misi add column if not exists tanggal_selesai date;
alter table public.misi add column if not exists kuota int;
alter table public.misi add column if not exists status text default 'Terbuka';
alter table public.misi add column if not exists created_by uuid;
alter table public.misi add column if not exists created_at timestamptz default now();
alter table public.misi alter column persyaratan set default '{}';
alter table public.misi alter column status set default 'Terbuka';
alter table public.misi alter column created_at set default now();

create table if not exists public.misi_relawan (
  id uuid primary key default gen_random_uuid(),
  misi_id uuid not null constraint misi_relawan_misi_id_fkey references public.misi(id) on delete cascade,
  user_id uuid not null default auth.uid() constraint misi_relawan_user_id_profiles_fkey references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  constraint misi_relawan_misi_id_user_id_key unique (misi_id, user_id)
);

alter table public.misi_relawan add column if not exists misi_id uuid;
alter table public.misi_relawan add column if not exists user_id uuid default auth.uid();
alter table public.misi_relawan add column if not exists created_at timestamptz default now();
alter table public.misi_relawan alter column user_id set default auth.uid();
alter table public.misi_relawan alter column created_at set default now();

create table if not exists public.berita (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  konten text not null,
  kategori text,
  lokasi text,
  latitude float8,
  longitude float8,
  terverifikasi boolean default false,
  image_url text,
  laporan_id text constraint berita_laporan_id_fkey references public.laporan(id),
  created_by uuid constraint berita_created_by_profiles_fkey references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.berita add column if not exists judul text;
alter table public.berita add column if not exists konten text;
alter table public.berita add column if not exists kategori text;
alter table public.berita add column if not exists lokasi text;
alter table public.berita add column if not exists latitude float8;
alter table public.berita add column if not exists longitude float8;
alter table public.berita add column if not exists terverifikasi boolean default false;
alter table public.berita add column if not exists image_url text;
alter table public.berita add column if not exists laporan_id text;
alter table public.berita add column if not exists created_by uuid;
alter table public.berita add column if not exists created_at timestamptz default now();
alter table public.berita add column if not exists updated_at timestamptz default now();
alter table public.berita alter column terverifikasi set default false;
alter table public.berita alter column created_at set default now();
alter table public.berita alter column updated_at set default now();

create table if not exists public.notifikasi (
  id uuid primary key default gen_random_uuid(),
  user_id uuid constraint notifikasi_user_id_profiles_fkey references public.profiles(id) on delete cascade,
  type text not null,
  judul text not null,
  pesan text not null,
  laporan_id text constraint notifikasi_laporan_id_fkey references public.laporan(id) on delete cascade,
  misi_id uuid constraint notifikasi_misi_id_fkey references public.misi(id) on delete cascade,
  dibaca boolean default false,
  created_at timestamptz default now()
);

alter table public.notifikasi add column if not exists user_id uuid;
alter table public.notifikasi add column if not exists type text;
alter table public.notifikasi add column if not exists judul text;
alter table public.notifikasi add column if not exists pesan text;
alter table public.notifikasi add column if not exists laporan_id text;
alter table public.notifikasi add column if not exists misi_id uuid;
alter table public.notifikasi add column if not exists dibaca boolean default false;
alter table public.notifikasi add column if not exists created_at timestamptz default now();
alter table public.notifikasi alter column dibaca set default false;
alter table public.notifikasi alter column created_at set default now();

insert into public.profiles (id, nama, role)
select distinct users.id, coalesce(users.raw_user_meta_data ->> 'nama', ''), 'relawan'
from auth.users
join public.laporan on laporan.user_id = users.id
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.laporan'::regclass
      and conname = 'laporan_user_id_profiles_fkey'
  ) then
    alter table public.laporan
      add constraint laporan_user_id_profiles_fkey
      foreign key (user_id) references public.profiles(id) on delete cascade
      not valid;
  end if;

  if not exists (
    select 1
    from public.laporan
    left join public.profiles on profiles.id = laporan.user_id
    where laporan.user_id is not null
      and profiles.id is null
  ) then
    alter table public.laporan validate constraint laporan_user_id_profiles_fkey;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.laporan_media'::regclass
      and conname = 'laporan_media_laporan_id_fkey'
  ) then
    alter table public.laporan_media
      add constraint laporan_media_laporan_id_fkey
      foreign key (laporan_id) references public.laporan(id) on delete cascade
      not valid;
  end if;

  if not exists (
    select 1
    from public.laporan_media
    left join public.laporan on laporan.id = laporan_media.laporan_id
    where laporan_media.laporan_id is not null
      and laporan.id is null
  ) then
    alter table public.laporan_media validate constraint laporan_media_laporan_id_fkey;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.misi'::regclass
      and conname = 'misi_created_by_profiles_fkey'
  ) then
    alter table public.misi
      add constraint misi_created_by_profiles_fkey
      foreign key (created_by) references public.profiles(id)
      not valid;
  end if;

  if not exists (
    select 1
    from public.misi
    left join public.profiles on profiles.id = misi.created_by
    where misi.created_by is not null
      and profiles.id is null
  ) then
    alter table public.misi validate constraint misi_created_by_profiles_fkey;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.misi_relawan'::regclass
      and conname = 'misi_relawan_user_id_profiles_fkey'
  ) then
    alter table public.misi_relawan
      add constraint misi_relawan_user_id_profiles_fkey
      foreign key (user_id) references public.profiles(id) on delete cascade
      not valid;
  end if;

  if not exists (
    select 1
    from public.misi_relawan
    left join public.profiles on profiles.id = misi_relawan.user_id
    where misi_relawan.user_id is not null
      and profiles.id is null
  ) then
    alter table public.misi_relawan validate constraint misi_relawan_user_id_profiles_fkey;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.misi_relawan'::regclass
      and conname = 'misi_relawan_misi_id_fkey'
  ) then
    alter table public.misi_relawan
      add constraint misi_relawan_misi_id_fkey
      foreign key (misi_id) references public.misi(id) on delete cascade
      not valid;
  end if;

  if not exists (
    select 1
    from public.misi_relawan
    left join public.misi on misi.id = misi_relawan.misi_id
    where misi_relawan.misi_id is not null
      and misi.id is null
  ) then
    alter table public.misi_relawan validate constraint misi_relawan_misi_id_fkey;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.berita'::regclass
      and conname = 'berita_created_by_profiles_fkey'
  ) then
    alter table public.berita
      add constraint berita_created_by_profiles_fkey
      foreign key (created_by) references public.profiles(id)
      not valid;
  end if;

  if not exists (
    select 1
    from public.berita
    left join public.profiles on profiles.id = berita.created_by
    where berita.created_by is not null
      and profiles.id is null
  ) then
    alter table public.berita validate constraint berita_created_by_profiles_fkey;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.berita'::regclass
      and conname = 'berita_laporan_id_fkey'
  ) then
    alter table public.berita
      add constraint berita_laporan_id_fkey
      foreign key (laporan_id) references public.laporan(id)
      not valid;
  end if;

  if not exists (
    select 1
    from public.berita
    left join public.laporan on laporan.id = berita.laporan_id
    where berita.laporan_id is not null
      and laporan.id is null
  ) then
    alter table public.berita validate constraint berita_laporan_id_fkey;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.notifikasi'::regclass
      and conname = 'notifikasi_user_id_profiles_fkey'
  ) then
    alter table public.notifikasi
      add constraint notifikasi_user_id_profiles_fkey
      foreign key (user_id) references public.profiles(id) on delete cascade
      not valid;
  end if;

  if not exists (
    select 1
    from public.notifikasi
    left join public.profiles on profiles.id = notifikasi.user_id
    where notifikasi.user_id is not null
      and profiles.id is null
  ) then
    alter table public.notifikasi validate constraint notifikasi_user_id_profiles_fkey;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.notifikasi'::regclass
      and conname = 'notifikasi_laporan_id_fkey'
  ) then
    alter table public.notifikasi
      add constraint notifikasi_laporan_id_fkey
      foreign key (laporan_id) references public.laporan(id) on delete cascade
      not valid;
  end if;

  if not exists (
    select 1
    from public.notifikasi
    left join public.laporan on laporan.id = notifikasi.laporan_id
    where notifikasi.laporan_id is not null
      and laporan.id is null
  ) then
    alter table public.notifikasi validate constraint notifikasi_laporan_id_fkey;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.notifikasi'::regclass
      and conname = 'notifikasi_misi_id_fkey'
  ) then
    alter table public.notifikasi
      add constraint notifikasi_misi_id_fkey
      foreign key (misi_id) references public.misi(id) on delete cascade
      not valid;
  end if;

  if not exists (
    select 1
    from public.notifikasi
    left join public.misi on misi.id = notifikasi.misi_id
    where notifikasi.misi_id is not null
      and misi.id is null
  ) then
    alter table public.notifikasi validate constraint notifikasi_misi_id_fkey;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.profiles'::regclass and conname = 'profiles_role_check') then
    alter table public.profiles add constraint profiles_role_check check (role in ('relawan', 'admin'));
  end if;

  if not exists (select 1 from pg_constraint where conrelid = 'public.laporan'::regclass and conname = 'laporan_jenis_bencana_check') then
    alter table public.laporan add constraint laporan_jenis_bencana_check check (jenis_bencana in ('Banjir', 'Gempa', 'Longsor', 'Kebakaran', 'Tsunami', 'Lainnya'));
  end if;

  if not exists (select 1 from pg_constraint where conrelid = 'public.laporan'::regclass and conname = 'laporan_keparahan_check') then
    alter table public.laporan add constraint laporan_keparahan_check check (keparahan in ('Ringan', 'Sedang', 'Parah', 'Kritis'));
  end if;

  if not exists (select 1 from pg_constraint where conrelid = 'public.laporan'::regclass and conname = 'laporan_status_check') then
    alter table public.laporan add constraint laporan_status_check check (status in ('Pending', 'Diterima', 'Ditolak'));
  end if;

  if not exists (select 1 from pg_constraint where conrelid = 'public.laporan_media'::regclass and conname = 'laporan_media_type_check') then
    alter table public.laporan_media add constraint laporan_media_type_check check (type in ('foto', 'video'));
  end if;

  if not exists (select 1 from pg_constraint where conrelid = 'public.misi'::regclass and conname = 'misi_status_check') then
    alter table public.misi add constraint misi_status_check check (status in ('Terbuka', 'Penuh', 'Selesai'));
  end if;

  if not exists (select 1 from pg_constraint where conrelid = 'public.notifikasi'::regclass and conname = 'notifikasi_type_check') then
    alter table public.notifikasi add constraint notifikasi_type_check check (type in ('laporan_diterima', 'laporan_ditolak', 'misi_baru', 'pengumuman'));
  end if;

  if not exists (select 1 from pg_constraint where conrelid = 'public.misi_relawan'::regclass and conname = 'misi_relawan_misi_id_user_id_key') then
    alter table public.misi_relawan add constraint misi_relawan_misi_id_user_id_key unique (misi_id, user_id);
  end if;
end $$;

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists laporan_user_created_at_idx on public.laporan (user_id, created_at desc);
create index if not exists laporan_status_idx on public.laporan (status);
create index if not exists laporan_media_laporan_id_idx on public.laporan_media (laporan_id);
create index if not exists misi_status_idx on public.misi (status);
create index if not exists misi_relawan_user_id_idx on public.misi_relawan (user_id);
create index if not exists misi_relawan_misi_id_idx on public.misi_relawan (misi_id);
create index if not exists berita_created_at_idx on public.berita (created_at desc);
create index if not exists notifikasi_user_created_at_idx on public.notifikasi (user_id, created_at desc);
create index if not exists notifikasi_user_dibaca_idx on public.notifikasi (user_id, dibaca);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nama, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nama', ''), 'relawan')
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger set_berita_updated_at
  before update on public.berita
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.laporan enable row level security;
alter table public.laporan_media enable row level security;
alter table public.misi enable row level security;
alter table public.misi_relawan enable row level security;
alter table public.berita enable row level security;
alter table public.notifikasi enable row level security;

drop policy if exists "select_own_profile" on public.profiles;
drop policy if exists "admin_select_profiles" on public.profiles;
drop policy if exists "insert_own_profile" on public.profiles;
drop policy if exists "update_own_profile" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "relawan_select_laporan" on public.laporan;
drop policy if exists "relawan_insert_laporan" on public.laporan;
drop policy if exists "relawan_update_laporan" on public.laporan;
drop policy if exists "admin_select_laporan" on public.laporan;
drop policy if exists "admin_update_laporan" on public.laporan;
drop policy if exists "relawan_select_own_laporan" on public.laporan;
drop policy if exists "relawan_insert_own_laporan" on public.laporan;
drop policy if exists "admin_update_laporan_status" on public.laporan;

create policy "relawan_select_laporan"
  on public.laporan
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "relawan_insert_laporan"
  on public.laporan
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "relawan_update_laporan"
  on public.laporan
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "admin_select_laporan"
  on public.laporan
  for select
  to authenticated
  using (public.is_admin());

create policy "admin_update_laporan"
  on public.laporan
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "relawan_select_media" on public.laporan_media;
drop policy if exists "relawan_insert_media" on public.laporan_media;
drop policy if exists "admin_select_media" on public.laporan_media;
drop policy if exists "insert_media" on public.laporan_media;
drop policy if exists "relawan_select_own_laporan_media" on public.laporan_media;
drop policy if exists "relawan_insert_own_laporan_media" on public.laporan_media;
drop policy if exists "admin_select_laporan_media" on public.laporan_media;

create policy "relawan_select_media"
  on public.laporan_media
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.laporan
      where laporan.id = laporan_media.laporan_id
        and laporan.user_id = auth.uid()
    )
  );

create policy "relawan_insert_media"
  on public.laporan_media
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.laporan
      where laporan.id = laporan_media.laporan_id
        and laporan.user_id = auth.uid()
    )
  );

create policy "admin_select_media"
  on public.laporan_media
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "select_misi" on public.misi;
drop policy if exists "admin_insert_misi" on public.misi;
drop policy if exists "admin_update_misi" on public.misi;
drop policy if exists "admin_delete_misi" on public.misi;
drop policy if exists "misi_select_authenticated" on public.misi;

create policy "misi_select_authenticated"
  on public.misi
  for select
  to authenticated
  using (true);

create policy "admin_insert_misi"
  on public.misi
  for insert
  to authenticated
  with check (public.is_admin());

create policy "admin_update_misi"
  on public.misi
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_delete_misi"
  on public.misi
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "select_own_misi_relawan" on public.misi_relawan;
drop policy if exists "admin_select_misi_relawan" on public.misi_relawan;
drop policy if exists "insert_misi_relawan" on public.misi_relawan;
drop policy if exists "delete_misi_relawan" on public.misi_relawan;
drop policy if exists "misi_relawan_select_own" on public.misi_relawan;
drop policy if exists "misi_relawan_select_admin" on public.misi_relawan;
drop policy if exists "misi_relawan_insert_own" on public.misi_relawan;
drop policy if exists "misi_relawan_delete_own" on public.misi_relawan;

create policy "misi_relawan_select_own"
  on public.misi_relawan
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "misi_relawan_select_admin"
  on public.misi_relawan
  for select
  to authenticated
  using (public.is_admin());

create policy "misi_relawan_insert_own"
  on public.misi_relawan
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "misi_relawan_delete_own"
  on public.misi_relawan
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "select_berita_public" on public.berita;
drop policy if exists "admin_insert_berita" on public.berita;
drop policy if exists "admin_update_berita" on public.berita;
drop policy if exists "admin_delete_berita" on public.berita;
drop policy if exists "berita_select_public" on public.berita;

create policy "berita_select_public"
  on public.berita
  for select
  to anon, authenticated
  using (true);

create policy "admin_insert_berita"
  on public.berita
  for insert
  to authenticated
  with check (public.is_admin());

create policy "admin_update_berita"
  on public.berita
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_delete_berita"
  on public.berita
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "select_own_notifikasi" on public.notifikasi;
drop policy if exists "update_own_notifikasi" on public.notifikasi;
drop policy if exists "delete_own_notifikasi" on public.notifikasi;
drop policy if exists "admin_insert_notifikasi" on public.notifikasi;
drop policy if exists "admin_select_notifikasi" on public.notifikasi;
drop policy if exists "notifikasi_select_own" on public.notifikasi;
drop policy if exists "notifikasi_update_own" on public.notifikasi;
drop policy if exists "notifikasi_delete_own" on public.notifikasi;

create policy "notifikasi_select_own"
  on public.notifikasi
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "notifikasi_update_own"
  on public.notifikasi
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notifikasi_delete_own"
  on public.notifikasi
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "admin_insert_notifikasi"
  on public.notifikasi
  for insert
  to authenticated
  with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.laporan to authenticated;
grant select, insert, update, delete on public.laporan_media to authenticated;
grant select, insert, update, delete on public.misi to authenticated;
grant select, insert, update, delete on public.misi_relawan to authenticated;
grant select on public.berita to anon;
grant select, insert, update, delete on public.berita to authenticated;
grant select, insert, update, delete on public.notifikasi to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'laporan-media',
  'laporan-media',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "laporan_media_public_read" on storage.objects;
drop policy if exists "laporan_media_authenticated_upload" on storage.objects;
drop policy if exists "authenticated_upload_laporan_media" on storage.objects;

create policy "laporan_media_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'laporan-media');

create policy "laporan_media_authenticated_upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'laporan-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'notifikasi'
    ) then
    alter publication supabase_realtime add table public.notifikasi;
  end if;
end $$;
