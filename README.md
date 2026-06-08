# Astacala Rescue

Astacala Rescue adalah aplikasi web pelaporan dan koordinasi relawan bencana. Aplikasi ini menyediakan dua alur utama:

- **Relawan**: registrasi/login, membuat laporan bencana berbasis lokasi, melihat riwayat laporan, mengikuti misi, membaca berita, dan menerima notifikasi.
- **Pusat Kendali/Admin**: memantau dashboard, memverifikasi laporan, mengelola misi, mengirim notifikasi misi, mengelola berita, dan melihat data relawan.

## Tech Stack

- **Framework**: Next.js 16 App Router
- **UI**: React 19, Tailwind CSS 4
- **Backend**: Next.js Route Handlers
- **Database/Auth/Storage**: Supabase
- **Map**: Leaflet, React Leaflet, OpenStreetMap
- **State**: Zustand
- **Language**: TypeScript

## Fitur Utama

- Autentikasi relawan dan admin menggunakan Supabase Auth.
- Role admin berbasis data profil pengguna.
- Form laporan bencana multi-step dengan lokasi peta, alamat, detail kejadian, tingkat keparahan, kebutuhan, dan media.
- Penyimpanan draft laporan.
- Riwayat dan detail laporan relawan.
- Verifikasi atau penolakan laporan oleh admin.
- CRUD misi dan pendaftaran relawan ke misi.
- Broadcast notifikasi misi baru.
- CRUD berita dan upload gambar berita.
- Notifikasi pengguna, termasuk mark as read dan read all.
- Statistik publik dan statistik dashboard admin.

## Struktur Project

```text
src/
  app/
    api/                 Route handler backend
    admin/               Halaman dashboard pusat kendali
    report/              Alur pembuatan dan riwayat laporan
    misi/                Halaman daftar/detail misi
  components/            Komponen UI reusable
  lib/                   Service layer dan helper auth/backend
  utils/supabase/        Supabase client, server client, dan admin client
supabase/
  migrations/            Migration SQL Supabase
prisma/                  Artefak legacy/local database
```

Dokumen pendukung:

- `BACKEND_SPEC.md`: spesifikasi backend.
- `UI_SYSTEM.md`: sistem desain.
- `SCREEN_SPECS.md`: spesifikasi layar.
- `COMPONENT_MAP.md`: peta komponen.

## Prasyarat

- Node.js versi modern yang kompatibel dengan Next.js 16.
- npm.
- Project Supabase dengan Auth, Database, Storage, dan migration yang sesuai.

## Setup

1. Install dependency:

```bash
npm install
```

2. Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
```

3. Jalankan migration Supabase dari folder `supabase/migrations` melalui Supabase CLI atau SQL editor sesuai workflow project.

4. Jalankan development server:

```bash
npm run dev
```

5. Buka aplikasi di browser:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev      # menjalankan development server
npm run build    # build production
npm run start    # menjalankan hasil build
npm run lint     # menjalankan ESLint
```

## Environment Variables

| Variable                               | Keterangan                                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL project Supabase.                                                                              |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable/anon key Supabase untuk client dan server client.                                      |
| `NEXT_PUBLIC_SITE_URL`                 | Base URL aplikasi, dipakai untuk flow seperti reset password.                                      |
| `SUPABASE_SERVICE_ROLE_KEY`            | Service role key untuk operasi server-side yang membutuhkan akses admin. Jangan expose ke browser. |

## Catatan

- Route backend utama berada di `src/app/api/**/route.ts`.
- Service backend reusable berada di `src/lib`.
- Helper Supabase berada di `src/utils/supabase`.
- Jangan commit file `.env.local` atau secret Supabase.
- Untuk path App Router yang memakai folder dinamis seperti `[id]`, gunakan route params dari Next.js.

## Deployment

Project ini dapat dideploy ke Vercel atau platform lain yang mendukung Next.js. Pastikan semua environment variable sudah tersedia di environment production.
