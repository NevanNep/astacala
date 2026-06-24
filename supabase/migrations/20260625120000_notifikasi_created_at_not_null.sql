-- Ensure notifikasi.created_at is always populated.
--
-- Previously this column was nullable (`default now()` without `not null`),
-- so rows could end up with a null timestamp. The notifications page then
-- fabricated the current time for null values, making every such row display
-- as "1 Detik lalu" regardless of its real age.
--
-- Backfill any existing nulls, then enforce NOT NULL going forward.

update public.notifikasi
set created_at = now()
where created_at is null;

alter table public.notifikasi
  alter column created_at set default now();

alter table public.notifikasi
  alter column created_at set not null;
