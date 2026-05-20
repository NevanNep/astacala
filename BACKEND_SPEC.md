# BACKEND_SPEC.md
# Astacala Rescue — Full System Backend Specification

---

## B01 — OVERVIEW

**Stack:**
- Database, Auth, Storage, Realtime: Supabase (PostgreSQL)
- Frontend + Backend: Next.js (App Router)
- Hosting: Vercel
- Map: Leaflet.js + OpenStreetMap (frontend only, no backend)

**Two Platforms:**
- Relawan Web App — field volunteers (mobile web)
- Pusat Kendali Dashboard — admin command center (desktop web)

**Architecture principle:**
Supabase JS client is called directly from both platforms for most data operations.
Row Level Security (RLS) separates relawan and admin data access at the database level.
Admin role is identified via `app_metadata.role = 'pusat_kendali'` set in Supabase Auth.
Custom Next.js API routes exist only where server-side logic is unavoidable.

**Custom API routes (only 3):**
1. `POST /api/laporan` — server-side report ID generation
2. `PATCH /api/admin/laporan/[id]` — verify/reject report + trigger notification
3. `POST /api/admin/misi/notify` — broadcast misi_baru notification to all relawan

Everything else: direct Supabase client calls.

---

## B02 — DATABASE SCHEMA

RLS is ENABLED on all tables.

---

### TABLE: profiles

Extends Supabase `auth.users`. Auto-created on first login via database trigger.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, references auth.users.id |
| nama | text | Full name |
| nim | text | Student ID |
| no_hp | text | Nullable |
| created_at | timestamptz | Auto |

---

### TABLE: laporan

| Column | Type | Notes |
|--------|------|-------|
| id | text | PK, format: LPR-YYYY-XXX |
| user_id | uuid | references auth.users.id |
| latitude | float8 | Required |
| longitude | float8 | Required |
| alamat | text | Required |
| detail | text | Nullable |
| jenis_bencana | text | Enum: Banjir \| Gempa \| Longsor \| Kebakaran \| Tsunami \| Lainnya |
| keparahan | text | Enum: Ringan \| Sedang \| Parah \| Kritis |
| deskripsi | text | Min 30 chars |
| kebutuhan | text[] | Nullable |
| status | text | Enum: Pending \| Diterima \| Ditolak — default: Pending |
| alasan_penolakan | text | Nullable — filled by admin on Ditolak |
| verified_at | timestamptz | Nullable — filled when status changes from Pending |
| created_at | timestamptz | Auto |

---

### TABLE: laporan_media

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| laporan_id | text | references laporan.id |
| storage_path | text | Supabase Storage path |
| type | text | Enum: foto \| video |
| created_at | timestamptz | Auto |

---

### TABLE: misi

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| judul | text | |
| lokasi | text | |
| latitude | float8 | Nullable |
| longitude | float8 | Nullable |
| deskripsi | text | |
| persyaratan | text[] | List of requirement strings |
| jenis | text | |
| koordinator | text | |
| tanggal_mulai | date | |
| tanggal_selesai | date | |
| kuota | int | Max volunteer slots |
| status | text | Enum: Terbuka \| Penuh \| Selesai — default: Terbuka |
| created_at | timestamptz | Auto |

---

### TABLE: misi_relawan

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| misi_id | uuid | references misi.id |
| user_id | uuid | references auth.users.id |
| created_at | timestamptz | Auto |

Unique constraint: `(misi_id, user_id)` — one registration per relawan per mission.

---

### TABLE: berita

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| judul | text | |
| konten | text | |
| kategori | text | Enum: Banjir \| Gempa \| Longsor \| Kebakaran \| Lainnya |
| lokasi | text | |
| latitude | float8 | Nullable |
| longitude | float8 | Nullable |
| terverifikasi | boolean | default: false |
| image_url | text | Nullable — Supabase Storage URL |
| created_by | uuid | references auth.users.id (admin) |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

---

### TABLE: notifikasi

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | references auth.users.id |
| type | text | Enum: laporan_diterima \| laporan_ditolak \| misi_baru \| pengumuman |
| judul | text | |
| pesan | text | |
| laporan_id | text | Nullable — reference for laporan_diterima/ditolak |
| misi_id | uuid | Nullable — reference for misi_baru |
| dibaca | boolean | default: false |
| created_at | timestamptz | Auto |

---

## B03 — ROW LEVEL SECURITY (RLS)

### Helper function — checks admin role

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'pusat_kendali'
$$ LANGUAGE sql SECURITY DEFINER;
```

Use `is_admin()` in all admin RLS policies.

---

### laporan

```sql
-- Relawan sees only their own reports
CREATE POLICY "relawan_select_laporan" ON laporan
FOR SELECT USING (auth.uid() = user_id AND NOT is_admin());

-- Admin sees all reports
CREATE POLICY "admin_select_laporan" ON laporan
FOR SELECT USING (is_admin());

-- Relawan inserts only for themselves (handled via /api/laporan server route)
CREATE POLICY "relawan_insert_laporan" ON laporan
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin updates status (handled via /api/admin/laporan/[id] server route)
-- No direct client UPDATE allowed
```

---

### laporan_media

```sql
-- Relawan sees media for their own reports
CREATE POLICY "relawan_select_media" ON laporan_media
FOR SELECT USING (
  laporan_id IN (SELECT id FROM laporan WHERE user_id = auth.uid())
);

-- Admin sees all media
CREATE POLICY "admin_select_media" ON laporan_media
FOR SELECT USING (is_admin());

-- Authenticated users can insert media
CREATE POLICY "insert_media" ON laporan_media
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

### misi

```sql
-- All authenticated users can view missions
CREATE POLICY "select_misi" ON misi
FOR SELECT USING (auth.role() = 'authenticated');

-- Admin can insert, update, delete
CREATE POLICY "admin_insert_misi" ON misi
FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "admin_update_misi" ON misi
FOR UPDATE USING (is_admin());

CREATE POLICY "admin_delete_misi" ON misi
FOR DELETE USING (is_admin());
```

---

### misi_relawan

```sql
-- Relawan sees their own registrations
CREATE POLICY "select_own_misi_relawan" ON misi_relawan
FOR SELECT USING (auth.uid() = user_id);

-- Admin sees all registrations
CREATE POLICY "admin_select_misi_relawan" ON misi_relawan
FOR SELECT USING (is_admin());

-- Relawan registers themselves
CREATE POLICY "insert_misi_relawan" ON misi_relawan
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Relawan cancels own registration
CREATE POLICY "delete_misi_relawan" ON misi_relawan
FOR DELETE USING (auth.uid() = user_id);
```

---

### berita

```sql
-- Public read (landing page S01 has no auth)
CREATE POLICY "select_berita_public" ON berita
FOR SELECT USING (true);

-- Admin full CRUD
CREATE POLICY "admin_insert_berita" ON berita
FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "admin_update_berita" ON berita
FOR UPDATE USING (is_admin());

CREATE POLICY "admin_delete_berita" ON berita
FOR DELETE USING (is_admin());
```

---

### notifikasi

```sql
-- User sees only their own notifications
CREATE POLICY "select_own_notifikasi" ON notifikasi
FOR SELECT USING (auth.uid() = user_id);

-- User can update (mark as read)
CREATE POLICY "update_own_notifikasi" ON notifikasi
FOR UPDATE USING (auth.uid() = user_id);

-- Admin sees all (for dashboard overview)
CREATE POLICY "admin_select_notifikasi" ON notifikasi
FOR SELECT USING (is_admin());

-- INSERT is handled server-side only (service role key in /api/admin/laporan/[id])
-- No direct client INSERT allowed
```

---

### profiles

```sql
-- User sees their own profile
CREATE POLICY "select_own_profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Admin sees all profiles
CREATE POLICY "admin_select_profiles" ON profiles
FOR SELECT USING (is_admin());

-- User updates their own profile
CREATE POLICY "update_own_profile" ON profiles
FOR UPDATE USING (auth.uid() = id);
```

---

## B04 — SUPABASE STORAGE

### Bucket: `laporan-media`

- Access: authenticated upload, public URL for display
- Path: `{user_id}/{laporan_id}/{filename}`
- Types: JPG, PNG (foto), MP4 (video)
- Max size: 5MB per file
- Max photos per report: 5

**Upload (called at S11 submit, before /api/laporan):**
```js
const path = `${userId}/${laporanId}/${file.name}`
const { data, error } = await supabase.storage
  .from('laporan-media')
  .upload(path, file, { contentType: file.type, upsert: false })
```

**Get public URL:**
```js
const { data } = supabase.storage
  .from('laporan-media')
  .getPublicUrl(storagePath)
// → data.publicUrl
```

### Bucket: `berita-images`

- Access: authenticated upload (admin only), public read
- Path: `{berita_id}/{filename}`
- Used by admin when publishing berita

---

## B05 — SUPABASE AUTH

### Relawan Login (S02)

```js
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
})
// data.user.app_metadata.role is undefined → relawan
```

### Admin Login (Pusat Kendali)

Same `signInWithPassword` call. Role is distinguished by `app_metadata`:
```js
const role = data.user.app_metadata?.role // 'pusat_kendali' or undefined
// Redirect: role === 'pusat_kendali' → /admin/dashboard
// Otherwise → /dashboard (relawan)
```

Admin accounts are created via Supabase dashboard with `app_metadata: { role: 'pusat_kendali' }`.
Self-registration is not implemented for either role.

### Session management

```js
// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Listen for auth changes (layout level)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') redirect('/login')
})
```

### Logout (S18 relawan / admin)

```js
await supabase.auth.signOut()
// Redirect to /login
```

### Password reset (S03–S06)

```js
// S03 — send reset email
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
})

// S05 — submit new password
await supabase.auth.updateUser({ password: newPassword })
```

---

## B06 — SUPABASE REALTIME

Used for live in-app notification updates on S07 (Dashboard) and S17 (Notifikasi page).

```js
// Subscribe on mount
const channel = supabase
  .channel('notifikasi-live')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifikasi',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Prepend payload.new to local notification list
      // Increment unread badge count
    }
  )
  .subscribe()

// Unsubscribe on unmount
return () => supabase.removeChannel(channel)
```

---

## B07 — RELAWAN CLIENT OPERATIONS

Direct Supabase client calls for all relawan screens.

---

### AUTH
```js
supabase.auth.signInWithPassword({ email, password })  // S02
supabase.auth.resetPasswordForEmail(email)              // S03
supabase.auth.updateUser({ password })                  // S05
supabase.auth.signOut()                                 // S18
```

---

### LAPORAN

**List (S13 — Riwayat):**
```js
const { data } = await supabase
  .from('laporan')
  .select('*')
  .order('created_at', { ascending: false })
// RLS returns only current user's reports
```

**Detail with media (S14):**
```js
const { data } = await supabase
  .from('laporan')
  .select('*, laporan_media(*)')
  .eq('id', laporanId)
  .single()
```

**Submit (S11):**
- Step 1: Upload photos to Storage (see B04)
- Step 2: `POST /api/laporan` (see B09)

---

### MISI

**List (S15):**
```js
const { data } = await supabase
  .from('misi')
  .select(`
    *,
    misi_relawan(count),
    misi_relawan!inner(user_id)
  `)
  .order('created_at', { ascending: false })
```

Note: use a second query for current user's registrations if join gets complex.

**Detail (S16):**
```js
const { data: misi } = await supabase
  .from('misi')
  .select('*')
  .eq('id', misiId)
  .single()

// Check if current user is registered
const { data: reg } = await supabase
  .from('misi_relawan')
  .select('id')
  .eq('misi_id', misiId)
  .maybeSingle()
// reg !== null → user is registered
```

**Register (S16 — "Daftar Misi"):**
```js
const { error } = await supabase
  .from('misi_relawan')
  .insert({ misi_id: misiId })
// user_id auto-set by auth.uid() via RLS
```

**Cancel (S16 — "Batalkan Pendaftaran"):**
```js
const { error } = await supabase
  .from('misi_relawan')
  .delete()
  .eq('misi_id', misiId)
```

---

### BERITA

**List — public (S01 + S19):**
```js
const { data } = await supabase
  .from('berita')
  .select('*')
  .order('created_at', { ascending: false })
```

**Filter by category (S19):**
```js
const { data } = await supabase
  .from('berita')
  .select('*')
  .eq('kategori', selectedKategori)
  .order('created_at', { ascending: false })
```

**Detail (S20):**
```js
const { data } = await supabase
  .from('berita')
  .select('*')
  .eq('id', beritaId)
  .single()
```

---

### NOTIFIKASI

**List (S17):**
```js
const { data } = await supabase
  .from('notifikasi')
  .select('*')
  .order('created_at', { ascending: false })
```

**Mark single as read:**
```js
await supabase
  .from('notifikasi')
  .update({ dibaca: true })
  .eq('id', notifikasiId)
```

**Mark all as read:**
```js
await supabase
  .from('notifikasi')
  .update({ dibaca: true })
  .eq('dibaca', false)
// RLS scopes this to current user automatically
```

**Delete all:**
```js
await supabase
  .from('notifikasi')
  .delete()
  .eq('dibaca', true) // or no filter for all — RLS scopes to current user
```

---

### PROFIL

**Get (S18):**
```js
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

**Update:**
```js
await supabase
  .from('profiles')
  .update({ nama, nim, no_hp })
  .eq('id', userId)
```

---

## B08 — ADMIN (PUSAT KENDALI) CLIENT OPERATIONS

Admin uses same Supabase client. RLS allows full access based on `is_admin()`.

---

### DASHBOARD STATS

```js
// Report counts by status
const { data } = await supabase
  .from('laporan')
  .select('status')

// Count: total, pending, diterima, ditolak (computed client-side from data)

// Active missions
const { count: misiAktif } = await supabase
  .from('misi')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'Terbuka')

// Total relawan
const { count: totalRelawan } = await supabase
  .from('profiles')
  .select('*', { count: 'exact', head: true })
```

---

### LAPORAN MANAGEMENT (Admin)

**List all laporan:**
```js
const { data } = await supabase
  .from('laporan')
  .select('*, profiles(nama, nim)')
  .order('created_at', { ascending: false })
```

**Filter by status:**
```js
const { data } = await supabase
  .from('laporan')
  .select('*, profiles(nama, nim)')
  .eq('status', selectedStatus)
  .order('created_at', { ascending: false })
```

**Detail:**
```js
const { data } = await supabase
  .from('laporan')
  .select('*, laporan_media(*), profiles(nama, nim)')
  .eq('id', laporanId)
  .single()
```

**Verify or reject → use server route (see B09)**

---

### MISI MANAGEMENT (Admin)

**List all:**
```js
const { data } = await supabase
  .from('misi')
  .select('*, misi_relawan(count)')
  .order('created_at', { ascending: false })
```

**Create:**
```js
const { data, error } = await supabase
  .from('misi')
  .insert({
    judul, lokasi, latitude, longitude,
    deskripsi, persyaratan, jenis,
    koordinator, tanggal_mulai, tanggal_selesai,
    kuota, status: 'Terbuka'
  })
  .select()
  .single()
```

**Update:**
```js
await supabase
  .from('misi')
  .update({ ...fields })
  .eq('id', misiId)
```

**Update status only:**
```js
await supabase
  .from('misi')
  .update({ status: 'Selesai' })
  .eq('id', misiId)
```

**Delete:**
```js
await supabase
  .from('misi')
  .delete()
  .eq('id', misiId)
```

**After creating a misi → send misi_baru notification to all relawan:**
```js
// Call server route (uses service role to bypass RLS for notification insert)
await fetch('/api/admin/misi/notify', {
  method: 'POST',
  body: JSON.stringify({ misi_id: newMisi.id, judul: newMisi.judul })
})
```

---

### BERITA MANAGEMENT (Admin)

**List all:**
```js
const { data } = await supabase
  .from('berita')
  .select('*')
  .order('created_at', { ascending: false })
```

**Create:**
```js
// 1. Upload image to berita-images bucket (if any)
const { data: upload } = await supabase.storage
  .from('berita-images')
  .upload(`${beritaId}/${file.name}`, file)

const imageUrl = supabase.storage
  .from('berita-images')
  .getPublicUrl(upload.path).data.publicUrl

// 2. Insert berita
await supabase
  .from('berita')
  .insert({ judul, konten, kategori, lokasi, latitude, longitude,
            terverifikasi: true, image_url: imageUrl, created_by: userId })
```

**Update:**
```js
await supabase
  .from('berita')
  .update({ ...fields, updated_at: new Date().toISOString() })
  .eq('id', beritaId)
```

**Delete:**
```js
await supabase.from('berita').delete().eq('id', beritaId)
```

---

### RELAWAN MANAGEMENT (Admin)

**List all:**
```js
const { data } = await supabase
  .from('profiles')
  .select('*')
  .order('created_at', { ascending: false })
```

**With report count per relawan:**
```js
const { data } = await supabase
  .from('profiles')
  .select('*, laporan(count)')
```

---

## B09 — CUSTOM API ROUTES

### 1. POST /api/laporan

**Purpose:** Generate LPR-YYYY-XXX ID server-side, insert report and media records.

**Auth:** Extract and validate Supabase JWT from `Authorization: Bearer {token}` header.

**Request:**
```json
{
  "latitude": "number",
  "longitude": "number",
  "alamat": "string",
  "detail": "string | null",
  "jenis_bencana": "string",
  "keparahan": "string",
  "deskripsi": "string",
  "kebutuhan": "string[]",
  "media_paths": "string[]"
}
```

**Server logic:**
```js
// 1. Validate JWT
const { data: { user } } = await supabaseAdmin.auth.getUser(token)
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

// 2. Generate sequential ID
const year = new Date().getFullYear()
const { count } = await supabaseAdmin
  .from('laporan')
  .select('*', { count: 'exact', head: true })
  .like('id', `LPR-${year}-%`)
const seq = String((count ?? 0) + 1).padStart(3, '0')
const laporanId = `LPR-${year}-${seq}`

// 3. Insert laporan
await supabaseAdmin.from('laporan').insert({
  id: laporanId, user_id: user.id,
  ...fields, status: 'Pending'
})

// 4. Insert media records
if (media_paths.length > 0) {
  await supabaseAdmin.from('laporan_media').insert(
    media_paths.map(path => ({
      laporan_id: laporanId, storage_path: path, type: 'foto'
    }))
  )
}
```

`supabaseAdmin` uses `SUPABASE_SERVICE_ROLE_KEY` (env var, server only).

**Response (201):**
```json
{ "id": "LPR-2026-001", "status": "Pending" }
```

---

### 2. PATCH /api/admin/laporan/[id]

**Purpose:** Admin verifies or rejects a report. Updates status, sets verified_at, inserts notification for the relawan.

**Auth:** Validate JWT + confirm `app_metadata.role === 'pusat_kendali'`.

**Request:**
```json
{
  "status": "Diterima | Ditolak",
  "alasan_penolakan": "string | null"
}
```

**Server logic:**
```js
// 1. Validate admin JWT
const user = await validateAdminToken(token)
if (!user) return 401

// 2. Get the laporan to find relawan user_id
const { data: laporan } = await supabaseAdmin
  .from('laporan').select('user_id').eq('id', id).single()

// 3. Update laporan status
await supabaseAdmin.from('laporan').update({
  status,
  alasan_penolakan: status === 'Ditolak' ? alasan_penolakan : null,
  verified_at: new Date().toISOString()
}).eq('id', id)

// 4. Insert notification for the relawan
const notifType = status === 'Diterima' ? 'laporan_diterima' : 'laporan_ditolak'
await supabaseAdmin.from('notifikasi').insert({
  user_id: laporan.user_id,
  type: notifType,
  judul: status === 'Diterima' ? 'Laporan Diterima' : 'Laporan Ditolak',
  pesan: status === 'Diterima'
    ? `Laporan ${id} telah diverifikasi dan diterima.`
    : `Laporan ${id} ditolak. Alasan: ${alasan_penolakan}`,
  laporan_id: id
})
```

**Response (200):**
```json
{ "id": "LPR-2026-001", "status": "Diterima" }
```

---

### 3. POST /api/admin/misi/notify

**Purpose:** After admin creates a new mission, broadcast misi_baru notification to all relawan.

**Auth:** Validate JWT + confirm admin role.

**Request:**
```json
{ "misi_id": "uuid", "judul": "string" }
```

**Server logic:**
```js
// Get all relawan user IDs
const { data: profiles } = await supabaseAdmin
  .from('profiles').select('id')

// Bulk insert notifications
await supabaseAdmin.from('notifikasi').insert(
  profiles.map(p => ({
    user_id: p.id,
    type: 'misi_baru',
    judul: 'Misi Baru Tersedia',
    pesan: `Misi "${judul}" telah dibuka. Segera daftarkan diri kamu.`,
    misi_id
  }))
)
```

**Response (200):**
```json
{ "sent": 42 }
```

---

### ERROR RESPONSES (all routes)

```json
{ "error": "string", "field": "string (optional)" }
```

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Authenticated but wrong role |
| 404 | Not found |
| 500 | Server error |

**Frontend handling:**
- 401 → clear session → redirect to `/login`
- 403 → redirect to appropriate home page
- 400 with `field` → show inline field error
- 400/500 without `field` → show error banner "Gagal. Coba lagi."

---

## B10 — DRAFT STATE (MULTI-STEP FORM)

No server calls between S08 → S09 → S10. All draft data is held client-side.

**State manager:** Zustand store with localStorage persistence.

**Draft shape:**
```ts
type ReportDraft = {
  step1: {
    latitude: number
    longitude: number
    alamat: string
    detail?: string
  } | null
  step2: {
    jenis_bencana: string
    keparahan: string
    deskripsi: string
    kebutuhan: string[]
  } | null
  step3: {
    foto: File[]
    video: File | null
  } | null
}
```

**Lifecycle:**
- S08 "Lanjut" → save step1 to store → navigate S09
- S09 "Lanjut" → save step2 → navigate S10
- S10 "Lanjut" → save step3 (Files staged, not yet uploaded) → navigate S11
- S11 "Kirim" → upload photos to Storage → POST /api/laporan → clear draft → navigate S12
- S11 "Edit >" Lokasi → navigate S08, draft intact
- S08 "Batal" → confirm dialog → clear draft → navigate S07

---

## B11 — ENVIRONMENT VARIABLES

```env
# Public — safe to expose to browser
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=

# Server only — NEVER expose to browser
SUPABASE_SERVICE_ROLE_KEY=
```

---

## B12 — SCREEN → OPERATION MAPPING

### Relawan Platform

| Screen | Action | Operation |
|--------|--------|-----------|
| S01 Landing | Load berita | `supabase.from('berita').select()` |
| S02 Login | Submit | `supabase.auth.signInWithPassword()` |
| S03 Lupa Password | Submit email | `supabase.auth.resetPasswordForEmail()` |
| S05 Reset Password | Submit | `supabase.auth.updateUser()` |
| S07 Dashboard | Load | `notifikasi` + `misi` + `berita` queries |
| S07 Dashboard | Live updates | Supabase Realtime on `notifikasi` |
| S08–S10 Form | Navigate steps | Zustand draft store only |
| S10 Media | Select photos | Stage in draft store |
| S11 Review | Click "Kirim" | Storage upload + `POST /api/laporan` |
| S13 Riwayat | Load | `supabase.from('laporan').select()` |
| S14 Detail | Load | `supabase.from('laporan').select('*, laporan_media(*)')` |
| S15 Misi | Load | `supabase.from('misi').select()` |
| S16 Detail Misi | Load | `supabase.from('misi').select()` + registration check |
| S16 Daftar | Click | `supabase.from('misi_relawan').insert()` |
| S16 Batalkan | Click | `supabase.from('misi_relawan').delete()` |
| S17 Notifikasi | Load | `supabase.from('notifikasi').select()` |
| S17 Notifikasi | Mark read | `supabase.from('notifikasi').update()` |
| S18 Profil | Load | `supabase.from('profiles').select()` |
| S18 Logout | Click | `supabase.auth.signOut()` |
| S19 Berita | Load | `supabase.from('berita').select()` |
| S20 Detail Berita | Load | `supabase.from('berita').select().eq('id')` |

### Pusat Kendali (Admin) Platform

| Screen | Action | Operation |
|--------|--------|-----------|
| Admin Login | Submit | `supabase.auth.signInWithPassword()` + role check |
| Admin Dashboard | Load stats | `laporan` + `misi` + `profiles` count queries |
| Daftar Laporan | Load | `supabase.from('laporan').select('*, profiles(nama)')` |
| Detail Laporan | Load | `supabase.from('laporan').select('*, laporan_media(*), profiles(*)')` |
| Verifikasi Laporan | Diterima/Ditolak | `PATCH /api/admin/laporan/[id]` |
| Daftar Misi | Load | `supabase.from('misi').select('*, misi_relawan(count)')` |
| Buat Misi | Submit | `supabase.from('misi').insert()` + `POST /api/admin/misi/notify` |
| Edit Misi | Submit | `supabase.from('misi').update()` |
| Hapus Misi | Confirm | `supabase.from('misi').delete()` |
| Daftar Berita | Load | `supabase.from('berita').select()` |
| Tulis Berita | Submit | Storage upload + `supabase.from('berita').insert()` |
| Edit Berita | Submit | `supabase.from('berita').update()` |
| Hapus Berita | Confirm | `supabase.from('berita').delete()` |
| Daftar Relawan | Load | `supabase.from('profiles').select('*, laporan(count)')` |

---

## B13 — OUT OF SCOPE

Only one feature is genuinely excluded due to implementation complexity:

- **FCM Push Notifications** — requires service worker registration, Firebase project setup, device token management per user, and background message handling. Supabase Realtime covers in-app notifications while the browser tab is open, which is sufficient for the use cases in scope.

---

## B14 — SOURCE OF TRUTH

This document is the single source of truth for all backend implementation.
All implementations across both platforms must follow this specification.
When conflict exists between this document and any other file, this document takes precedence.