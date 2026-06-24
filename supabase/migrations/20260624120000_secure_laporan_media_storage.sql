-- Secure the laporan-media bucket.
--
-- Raw disaster report media (field photos) may contain sensitive information and
-- must NOT be world-readable. A previous migration
-- (20260601172050_full_backend_schema_rls.sql) accidentally flipped this bucket
-- to public and granted an anon/authenticated read policy over the whole bucket.
--
-- This migration:
--   1. Makes the bucket private (public = false).
--   2. Removes the public/anon read policy.
--   3. Restricts reads to the owning relawan (folder prefix = their uid) or admins.
--   4. Re-affirms the owner-scoped upload policy.
--
-- After this runs, media is only reachable through short-lived signed URLs that
-- the application generates server-side once it has verified ownership/role.
-- The berita-images bucket is intentionally left public for published news.

update storage.buckets
set public = false
where id = 'laporan-media';

-- Drop every read/select policy that previously exposed laporan-media so we start clean.
drop policy if exists "laporan_media_public_read" on storage.objects;
drop policy if exists "laporan_media_owner_read" on storage.objects;
drop policy if exists "laporan_media_admin_read" on storage.objects;
drop policy if exists "laporan_media_authenticated_upload" on storage.objects;
drop policy if exists "authenticated_upload_laporan_media" on storage.objects;

-- Owner can read only the objects inside their own user-id folder.
-- Upload paths are "<auth.uid()>/..." (see report-service.ts / report/step3).
create policy "laporan_media_owner_read"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'laporan-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins (verified via profiles.role) can read any laporan-media object.
create policy "laporan_media_admin_read"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'laporan-media'
    and public.is_admin()
  );

-- Relawan may only upload into their own folder.
create policy "laporan_media_authenticated_upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'laporan-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
