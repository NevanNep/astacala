# SCREEN_SPECS.md

# Astacala Rescue — Mobile Web Screen Specifications

# Version 1.0 | Computing Project 2026

# Reference: UI_SYSTEM.md for all tokens and component patterns

---

# AI EXECUTION LAYER (MANDATORY)

This document is optimized for AI code generation (Antigravity).

---

## AI EXECUTION RULES

- Do NOT invent new layouts outside this specification
- Do NOT create new components unless absolutely necessary
- Always reuse components defined in UI_SYSTEM.md
- Follow screen structure strictly (top → bottom)
- Do NOT add extra styling beyond defined tokens
- If ambiguity exists → choose the simplest implementation
- If conflict occurs → UI_SYSTEM.md takes priority

---

## SIMPLIFICATION RULE

- All pixel values (px) are approximate, NOT strict
- Maintain layout proportion, NOT pixel-perfect accuracy
- Simplify micro-details (icons, spacing, minor sizes)
- Avoid over-engineering UI elements

---

## COMPONENT REUSE (STRICT)

Always use these components:

- Navbar
- Card
- Button
- Badge
- NotificationItem
- Input
- Section Header

DO NOT recreate similar components with slight variations.

---

## IMPLEMENTATION PRIORITY

1. Layout structure (MOST IMPORTANT)
2. Component usage
3. Interaction behavior
4. Visual styling (LEAST IMPORTANT)

---

## LAYOUT ENGINE RULE

- Use flex + gap (avoid margin-heavy layout)
- Use vertical stacking (mobile-first)
- Avoid absolute positioning unless required (dropdown, overlay)
  _Target Platform_

- Mobile-first layout, but NOT restricted to mobile width
- The UI MUST adapt naturally across screen sizes

## Responsive Container Rules (MANDATORY)

- Mobile: full width (100%)
- Tablet (md): max-w-[768px], centered
- Desktop (lg+): max-w-[1200px], centered

## Layout Behavior

- Layout MUST expand on larger screens (no fixed small container)
- NEVER lock layout to mobile width (e.g., 390px)
- Desktop view MUST feel like a normal website (not a phone frame)
- DO NOT simulate mobile device UI (no status bar, no phone frame)

## Spacing Scaling

- Increase padding and spacing on larger screens
- Example:
  - px-4 (mobile)
  - md:px-8
  - lg:px-12
- All sections follow consistent spacing rhythm

---

## STATE HANDLING RULE

Every interactive component MUST support:

- Default
- Loading
- Empty (if applicable)
- Error (if API-based)

---

## NAVIGATION RULE

- Use consistent routing based on Screen ID (S01–S21)
- Never create undefined navigation paths
- Always match behavior section in spec

---

## SCREEN INDEX

| ID  | Screen                               | Auth Required | Scroll |
| --- | ------------------------------------ | ------------- | ------ |
| S01 | Landing Page                         | No            | Yes    |
| S02 | Login Page                           | No            | No     |
| S03 | Lupa Password — Step 1 Email         | No            | No     |
| S04 | Lupa Password — Step 2 OTP           | No            | No     |
| S05 | Lupa Password — Step 3 Password Baru | No            | No     |
| S06 | Lupa Password — Success              | No            | No     |
| S07 | Main Page / Dashboard                | Yes           | Yes    |
| S08 | Form Laporan — Step 1 Lokasi         | Yes           | Yes    |
| S09 | Form Laporan — Step 2 Kondisi        | Yes           | Yes    |
| S10 | Form Laporan — Step 3 Media          | Yes           | Yes    |
| S11 | Form Laporan — Step 4 Review         | Yes           | Yes    |
| S12 | Laporan Terkirim (Success)           | Yes           | No     |
| S13 | Riwayat Laporan                      | Yes           | Yes    |
| S14 | Detail Laporan                       | Yes           | Yes    |
| S15 | Daftar Misi                          | Yes           | Yes    |
| S16 | Detail Misi                          | Yes           | Yes    |
| S17 | Notifikasi                           | Yes           | Yes    |
| S18 | Profil Relawan                       | Yes           | Yes    |
| S19 | Daftar Berita                        | Yes           | Yes    |
| S20 | Detail Berita                        | Yes           | Yes    |
| S21 | Tentang Kami                         | Yes           | Yes    |

---

## DISPLAY RULE

- Do NOT include mobile device chrome (status bar, signal, battery)
- Only render application UI

## S01 — LANDING PAGE

**Purpose:** Public-facing page for general users. Shows verified news. No login required.

### Layout Structure (top to bottom):

1. Status Bar (`color-primary`)
2. Navbar — Logo + Hamburger (no bell icon)
3. Hero Section
4. Alert Strip (SIAGA)
5. Stats Bar (3 stats)
6. Section Divider
7. Berita Bencana Terkini section
8. Section Divider
9. CTA Relawan Section
10. Footer

### Component Details:

**Hero Section:**

- Background: `color-primary`
- Logo circle: 50px diameter
- Org label: "ASTACALA RESCUE — TELKOM UNIVERSITY", `text-nano`, uppercase, letter-spacing 0.05em, color `rgba(255,255,255,0.75)`
- Title: "Informasi Bencana Terpercaya & Terverifikasi", `text-hero`, weight 500, white, text-align center
- Subtitle: `text-nano`, `rgba(255,255,255,0.8)`, text-align center
- CTA button: "Masuk sebagai Relawan", Primary Button variant, width auto, display inline-block

**Alert Strip:**

- Component: Alert Banner — SIAGA variant (dark green)
- Text: "SIAGA — Potensi banjir di Kota Bandung"
- Right link: "Info ›"

**Stats Bar:**

- 3 equal-width columns, background white, border-bottom 0.5px `color-border`
- Column 1: number "128", label "Laporan Terverifikasi"
- Column 2: number "34", label "Misi Selesai"
- Column 3: number "210", label "Relawan Aktif"
- Number font: `text-heading` (13–14px), weight 500, color `color-primary`
- Label font: `text-nano`, color `color-text-tertiary`

**Berita Bencana Terkini Section:**

- Section header: title "Berita Bencana Terkini" + link "Lihat semua ›"
- Featured Card (S19 pattern) with `nf-verified` badge "✓ Terverifikasi" (bg `color-success`, top-right overlay)
- News list: 3–4 small news items (news-card-sm pattern), each with "✓ Verified" label in `color-success`

**CTA Relawan Section:**

- Background: `color-bg-muted`
- Border-top + border-bottom: 0.5px `color-border`
- Eyebrow: "BERGABUNG DENGAN KAMI", `text-nano`, uppercase, color `color-text-tertiary`
- Title: "Kamu Relawan Astacala? Masuk dan Mulai Melapor", `text-subheading`, weight 500, text-align center
- Subtitle: `text-nano`, color `color-text-tertiary`, line-height 1.6
- CTA Button: "Masuk sebagai Relawan →", Primary Button, full-width
- Sub-link: "Belum punya akun? Hubungi admin Astacala", `text-micro`, `color-text-tertiary`, span "Hubungi admin Astacala" in `color-primary`

**Hamburger Drawer (S01 — Public variant):**

- Header bg: `color-primary`, logo + tagline
- Menu items: Beranda (active), Berita Bencana, Tentang Kami, Kontak
- No bell icon in navbar
- Bottom CTA in drawer: "Masuk sebagai Relawan", `color-primary` btn

**Behaviors:**

- Click "Masuk sebagai Relawan" → Navigate to S02 (Login)
- Click "Lihat semua ›" in berita → Navigate to S19 (Daftar Berita — public version)
- Click news card → Navigate to S20 (Detail Berita — no auth required)
- Click "Info ›" in alert strip → show detail info modal or navigate to news

---

## S02 — LOGIN PAGE

Purpose: Authenticate relawan to access dashboard.

### Layout Structure:

1. Full Background Layout

- Use full-screen background image (rescuer/disaster context)
- Background MUST cover entire viewport (w-full h-screen)
- Image should use object-cover
- Apply dark overlay (e.g. bg-black/40 to bg-black/60) for readability
- Background is decorative only (non-interactive)

2. Centered Login Card

- Place login form in the center of the screen (both vertically and horizontally)
- Use flex layout: items-center justify-center

- Card style:
  - Background: white
  - Border radius: radius-xl or radius-2xl
  - Shadow: shadow-lg or shadow-xl
  - Padding: 24px–32px (p-6 md:p-8)
  - Width: full width with max-w-[400px] to max-w-[480px]

---

### Content Details:

- Title: "Sign in"
  - Use text-heading from UI_SYSTEM
  - Weight: 600
  - Clear visual hierarchy

- Underline accent below title (color-primary)

---

### Form:

- Email input
- Password input with visibility toggle icon

- Row:
  - Left: Remember Me checkbox
  - Right: Forgot Password link

- Primary button:
  - Text: "Login"
  - Full width
  - Margin-top: 24px

---

### Bottom Note:

- "Don’t have an account? Sign up"
- Centered text
- Use text-nano or text-caption

---

### Visual Style:

- Modern, clean, and spacious layout
- Strong contrast between background and form
- Form must remain the main focus
- Avoid clutter and visual noise

---

### Responsive Behavior:

- Desktop:
  - Full background image
  - Centered login card

- Mobile:
  - Keep centered layout
  - Ensure readability with stronger overlay if needed
  - Maintain comfortable spacing

---

### Behavior:

- Login success → S07 (Main Page)
- Forgot password → S03

---

## S02.2 — REGISTER PAGE

Purpose: Allow new relawan to create an account.

### Layout Structure:

- EXACTLY same as S02 (Login Page):
  - Full background image
  - Centered floating card
  - Same spacing, typography, and styling

---

### Content Differences:

- Title: "Sign up"

### Form:

- Name input
- Email input
- Password input
- Confirm Password input

- Primary button:
  - Text: "Create Account"

---

### Bottom Note:

- "Already have an account? Sign in"
- Link to /login

---

### Rules:

- MUST reuse same layout and components from S02
- MUST NOT change layout structure
- MUST NOT introduce new visual styles

## S03 — LUPA PASSWORD (STEP 1)

Purpose: User enters registered email to receive OTP.

### Layout Structure:

- EXACTLY same as S02 (Login Page):
  - Full background image (rescuer context)
  - Dark overlay
  - Centered floating card
  - Same spacing, typography, and styling

---

### Content:

- Step indicator:
  - "Step 1 of 3"
  - text-nano, color-text-tertiary, text-align center

- Title:
  - "Lupa Password?"
  - text-heading, weight 600, text-align center

- Subtitle:
  - "Masukkan email terdaftar untuk menerima kode OTP"
  - text-nano, color-text-tertiary, text-align center

---

### Form:

- Email input
  - placeholder: "email@astacala.id"

- Primary button:
  - "Kirim Kode OTP →"
  - full width
  - mt-6

---

### Bottom Note:

- "Kembali ke Login"
- Link → /login
- text-nano, centered

---

### Behavior:

- Valid email → navigate to S04
- Back → S02

---

## S04 — LUPA PASSWORD (CHECK EMAIL)

Purpose: Inform user that a password reset link has been sent to their email.

### Layout Structure:

- EXACTLY same as S02 (Login Page):
  - Full background image
  - Dark overlay
  - Centered floating card
  - Same spacing, typography, and styling

---

### Content:

- Title:
  - "Cek Email Kamu"

- Subtitle:
  - "Kami telah mengirimkan link untuk reset password ke email kamu."
  - text-nano, color-text-tertiary, text-align center

- Email display:
  - "user@email.com"
  - text-nano, color-primary, text-align center

---

### Action:

- Primary button:
  - "Buka Email"
  - full width
  - mt-6
  - (optional: opens mail client)

---

### Secondary Actions:

- "Kirim ulang email"
  - text-nano, centered
  - color-primary

- "Kembali ke Login"
  - text-nano, centered
  - link to /login

---

### Behavior:

- After email sent → navigate to S04
- User clicks reset link in email → navigate to S05 (Reset Password Page)
- Resend → triggers sending email again

---

## S05 — LUPA PASSWORD (STEP 3)

Purpose: User creates a new password.

### Layout Structure:

- EXACTLY same as S02

---

### Content:

- Step indicator:
  - "Step 3 of 3"

- Title:
  - "Buat Password Baru"

- Subtitle:
  - "Masukkan password baru untuk akun kamu"

---

### Form:

- Password input
- Confirm password input

---

### Validation:

- Show error if mismatch:
  - "Password tidak cocok"

---

### Password Rules:

- Min 8 karakter
- Huruf besar
- Angka
- Simbol

---

### Button:

- "Simpan Password Baru"
- full width
- mt-6

---

### Behavior:

- Valid → S06

---

## S06 — PASSWORD RESET SUCCESS

Purpose: Confirmation page after password reset.

### Layout Structure:

- EXACTLY same as S02
- Centered content inside card

---

### Content:

- Icon:
  - Success check (✓)

- Title:
  - "Password Berhasil Diubah!"

- Subtitle:
  - "Silakan login menggunakan password baru kamu"

---

### Button:

- "Login Sekarang →"
- full width

---

### Behavior:

- Click → S02 (Login)

---

## S07 — MAIN PAGE / DASHBOARD

Purpose: Primary authenticated screen. Shows overview of key features for relawan.

---

### Layout Structure (top to bottom, scrollable):

1. Status Bar (`color-primary`)
2. Navbar — Logo + Hamburger
3. Hero Section (greeting + CTA)
4. Alert Banner (SIAGA)
5. Notifikasi Terbaru section
6. Section Divider
7. Misi Aktif section
8. Section Divider
9. Berita Bencana section
10. Footer

---

## 🔴 REMOVED (not in current design)

- ❌ Cuaca & Lingkungan section
- ❌ Laporan Saya (stat strip)
- ❌ Bell dropdown (tidak ada icon bell di UI)

---

## 🧩 Component Details

---

### Navbar

- Left: Logo + text "ASTACALA"
- Right: Hamburger icon
- Background: white
- Sticky top

---

### Hero Section

- Background: `color-primary`

**Top Row:**

- Left:
  - "Selamat pagi," (`text-nano`, white 75%)
  - Username (`text-subheading`, white)
- Right:
  - Avatar circle (28–32px)
  - Background: white
  - Text: initials

---

**CTA Card:**

- Background: white
- Border radius: `radius-lg`
- Layout: flex row

Inside:

- Left: icon box (rounded, red)
- Middle:
  - Title: "Buat Laporan Bencana"
  - Subtitle: "Laporkan kondisi darurat dari lapangan"
- Right: arrow

---

### Alert Banner (SIAGA)

- Background: green
- Left: dot indicator
- Text: "Potensi Banjir di Bandung"
- Right: "Info ›"

---

### Notifikasi Terbaru

- Header:
  - Title: "Notifikasi Terbaru"
  - Right: "Semua"

- List:
  - 3 notification items

Each item:

- Left: colored circle
- Middle:
  - Title
  - Time (small text)
- Divider between items

---

### Misi Aktif

- Header:
  - Title: "Misi Aktif"
  - Right: "Semua"

- Show 2 cards

**Mission Card:**

- Background: white
- Border radius: `radius-lg`
- Border: subtle

Content:

- Title: "Operasi Banjir"
- Subtitle: location

- Right badge:
  - "Terbuka" (green)
  - "Penuh" (red/grey)

Bottom row:

- Left:
  - "Mulai: date"
  - "Relawan: 12/15"
- Right:
  - Button:
    - "Daftar" (primary)
    - "Penuh" (disabled)

---

### Berita Bencana

**Header:**

- Title: "Berita Bencana Terkini"

---

**Featured Card (carousel style):**

- Image full width
- Overlay gradient (dark bottom)

Content overlay:

- Title (white)
- Description (white)
- Navigation dots

---

**News List Card:**

- Container: white card

Each item:

- Left: image placeholder
- Right:
  - Title
  - Description

---

### Footer

- Background: dark
- Logo + "ASTACALA"
- Subtitle text
- Social icons
- Menu links

---

## 🧠 Behavior

- CTA Card → S08 (Form Laporan)
- "Semua" (Notifikasi) → future notification page
- "Semua" (Misi) → S15
- Mission card → S16
- News card → S20
- Hamburger → open drawer menu

---

## 🎯 Visual Style

- Clean, spacious layout
- Strong red primary color
- Card-based UI
- Minimal clutter
- No over-stacking components

---

## S08 — FORM LAPORAN: STEP 1 LOKASI

Layout Structure:
Status Bar
Navbar
Left: "‹ Buat Laporan"
Right: Step counter "1 / 4"
Stepper (4 steps: Lokasi | Kondisi | Media | Kirim)
Scrollable Form Content
Button Row (FIXED at bottom)
Stepper
4 steps with horizontal connector
Circle size: ~32px
Active step:
background: color-primary
text: white
Inactive steps:
background: gray
text: white
Labels below each circle
Form Content
Section
Title: "Lokasi Kejadian"
Map Preview
Height: 120px–160px
Width: full
Border radius: radius-lg
Background: placeholder (map area)
Map Footer
Layout: flex space-between
Left:
"Kec. X, Kota Y"
Right:
"↺ Refresh GPS"
color: color-primary
clickable text
Form Fields

1. Alamat Lengkap \*
   Type: textarea
   Min height: 80px
   Resize: disabled
   Placeholder: "Jl...."
   Hint:
   "Isi jika koordinat GPS kurang akurat"
   Style: text-nano, color-text-tertiary
2. Kelurahan / Kecamatan \*
   Type: input
   Pre-filled from GPS
   Active border state
   Right icon: ✓
3. Kabupaten / Kota \*
   Type: input
   Pre-filled from GPS
   Active border state
   Right icon: ✓
   Spacing Rules
   Section padding: px-4 py-6
   Between fields: space-y-4
   Between sections: consistent vertical rhythm
   Button Row (IMPORTANT)
   Position: fixed bottom
   Full width
   Padding: px-4 py-4
   Background: white
   Border top: subtle
   Layout:
   Flex row
   Gap: 8px
   Buttons:

Left:

"Batal"
Variant: outline
flex: 1

Right:

"Lanjut"
Variant: primary
flex: 2
Behaviors
"Lanjut":
Validate required fields
Navigate to S09
"Batal":
Show confirmation dialog
Navigate to S07

Stepper State
3 steps total
Step 1: done ✓
Step 2: active
Step 3: todo
Layout Structure
Navbar — "‹ Buat Laporan" + step counter "2 / 3"
Stepper (Lokasi | Kondisi | Kirim)
Scrollable form content
Fixed bottom button row
Form Content
Section
Title: "Kondisi Bencana" (text-subheading)

1. Jenis Bencana \*
   Type: Select / Dropdown
   Options: Banjir, Gempa, Longsor, Kebakaran, Tsunami, Lainnya
2. Tingkat Keparahan \*
   4 chips: Ringan | Sedang | Parah | Kritis
   Layout: flex row, gap-2

Selected:

bg: color-primary
text: white
no border

Unselected:

bg: gray / muted
text: white or dark (ikut UI_SYSTEM)
no border
Radius: radius-full (pill)
Padding: px-3 py-1.5
Text: text-nano, center 3. Deskripsi Kondisi \*
Type: textarea
min-h-[100px]
Placeholder: contoh deskripsi

Hint:

"Min. 30 karakter · Jelaskan kondisi sejelas mungkin"
text-nano, color-text-tertiary 4. Kebutuhan Mendesak
Container:
bg-white
border
rounded-lg
p-4
Chips (multi-select):
Perahu, Logistik, Obat, Tenda, Medis, Alat Berat
Layout: flex flex-wrap gap-2

Selected:

bg: color-primary
text: white
no border

Unselected:

bg: gray / muted
text: white / dark
no border
Radius: pill
Padding: px-3 py-1.5
(Optional but matches Figma scroll) 5. Foto Kejadian
Grid: 2–3 columns
Gap: 12px
Each item:
aspect-square
border: 2px solid
rounded-lg
centered "+" icon
Warning Box (Below Photo Section)
Background: soft yellow
Rounded: md
Padding: p-4
Icon: ⚠️
Text:
"Pastikan foto menunjukkan kondisi nyata di lapangan. Laporan dengan bukti yang jelas akan lebih cepat diverifikasi."
Spacing Rules
Section padding: px-4 py-6
Between elements: space-y-4
Button Row (FIXED)
Position: fixed bottom-0 left-0 w-full
Background: white
Border top
Padding: px-4 py-4
Layout:
Flex row, gap-2

Left:

"← Kembali"
Outline
flex-1

Right:

"Lanjut"
Primary
flex-2
Behaviors
Lanjut
Validate required fields
Navigate → Step 3
Kembali
Navigate → Step 1
❌ Removed (IMPORTANT)
❌ Step ke-4 (tidak ada di Figma)
❌ Estimasi korban terdampak
❌ Border-based chip styling (diganti solid)
❌ Textarea kecil (54px)

---

## S10 — FORM LAPORAN: STEP 3 MEDIA

### Stepper State: Steps 1–2 done ✓, Step 3 active, Step 4 todo

**Form Content:**

**Foto section:**

- Title: "Foto Kejadian \*"
- Photo grid: 3 columns, aspect-ratio 1:1, gap 5px
- Filled slot: gradient placeholder bg, `radius-md`, remove button (12px circle, `color-primary`, ✕ white, top-right corner, position absolute, margin -4px)
- Add slot: bg `color-bg-muted`, border 1.5px dashed `color-border`, `radius-md`, center content: "+" (16px, `color-primary` weight 300) + "Tambah" (`text-nano`, color `color-text-tertiary`)
- Empty add slot (beyond first): same but "+" color `#DDDDDD`
- Counter below grid: "X / 5 foto · Min. 1 foto wajib diupload", `text-nano`, color `color-text-tertiary`
- Format note: "Format: JPG, PNG · Max 5MB", `text-nano`, color `color-primary`

**Video section:**

- Title: "Video Kondisi" + "(Opsional)" label right-aligned, `text-caption`, `color-text-tertiary`
- Upload area: border 1.5px dashed `color-border`, `radius-lg`, padding 10px, text-align center, bg `color-bg-muted`
- Content: emoji 🎥 (18px) + "Tambahkan video kondisi lapangan" (`text-caption`, `color-text-tertiary`) + format note (`text-nano`, `color-text-tertiary`)

**Warning Box:**

- Background: `color-warning-light`, `radius-md`, padding 6px 8px
- Layout: flex, gap 5px, align flex-start
- Icon: ⚠ (10px, `#E65100`)
- Text: `text-nano`, `#E65100`, line-height 1.5

**Button Row:** "← Kembali" (Outline) + "Lanjut — Review →" (Primary)

---

## S11 — FORM LAPORAN: STEP 4 REVIEW & KIRIM

Stepper State:
Step 1: done ✓
Step 2: done ✓
Step 3: active
Layout Structure:
Navbar — "‹ Buat Laporan" + step counter "3 / 3"
Stepper (Lokasi | Kondisi | Kirim)
Sub-header (info strip)
Review cards (3 sections)
Disclaimer box
Fixed bottom button row
Sub-header:
Background: color-bg-muted
Border bottom: border
Padding: py-2
Text:
"Periksa kembali sebelum mengirim laporan"
text-nano
center
color-text-tertiary
Review Sections (3 Cards)
Card Style:
bg: white
border
rounded-lg
overflow-hidden
margin-bottom: mb-4
Card Header:
flex justify-between items-center
padding: px-4 py-2
bg: color-bg-muted

Left:

Title (text-sm, weight 500)

Right:

"Edit >"
text-xs
color-primary
Card Body:
padding: px-4 py-3
layout: space-y-2

Each row:

flex justify-between gap-2
align items-start

Label:

text-xs
color-text-tertiary

Value:

text-sm
color-text-primary
truncate if long
Section 1 — Lokasi Kejadian

Rows:

Koordinat
Kecamatan
Alamat (truncate)
Section 2 — Kondisi Bencana

Rows:

Jenis
Keparahan
Terdampak → "±X jiwa · Y korban luka"
Kebutuhan → comma separated
Deskripsi (truncate)
Section 3 — Media Bukti

Rows:

Foto:
Thumbnails:
size: w-10 h-10
rounded-md
bg placeholder / image
Count badge:
"2 Foto"
bg muted
text-xs
rounded

❌ REMOVE:

Video row (tidak ada di Figma)
Disclaimer Box
Background: color-success-light
Rounded: rounded-lg
Padding: p-4
Text:
text-sm
color-success
line-height relaxed

Text:

"Dengan mengirim laporan ini, saya menyatakan bahwa informasi yang diberikan adalah benar dan dapat dipertanggungjawabkan."

Button Row (FIXED)
Position: fixed bottom-0 left-0 w-full
Background: white
Border top
Padding: px-4 py-4

Layout:

flex gap-2

Left Button:

"Kembali"
Outline
flex-1

Right Button:

"Kirim"
Primary
flex-2
Behaviors
Click "Edit >"
Lokasi → S08
Kondisi → S09
Media → S09
Click "Kirim"
Submit API
Navigate → Success Page

---

## S12 — LAPORAN TERKIRIM (SUCCESS)

Layout:
Full screen
Centered vertically & horizontally
No scroll
Content
Success Icon
w-16 h-16
bg: color-success
rounded-full
center icon
Icon: ✓ (white)
Title
"Laporan Terkirim"
text-heading
font-medium
text-center
Subtitle
text-caption
color-text-tertiary
text-center
leading-relaxed
Info Card
bg-white
border
rounded-lg
p-4
w-full

Rows:

flex justify-between
py-2
border-b (last no border)

Label:

text-xs
color-text-tertiary

Value:

text-sm
font-medium
color-primary
Info Note
bg: soft blue / purple
rounded-lg
p-4

Text:

text-sm
color-secondary
Button
"Kembali ke Beranda"
Primary
full-width
Behavior
Click button → Dashboard (S07)

---

## S13 — RIWAYAT LAPORAN

### Layout Structure:

1. Status Bar
2. Navbar — "‹ Riwayat Laporan" + Hamburger
3. Search Bar
4. Filter Chips
5. Scrollable Laporan Card List

---

### Search Bar:

- Full width
- Placeholder: "Cari Laporan..."
- Border 1px color-border
- Rounded-full
- Padding horizontal 12px

---

### Filter Chips:

- Semua (active)
- Terbuka
- Terdaftar
- Tutup

---

### Laporan Card:

- Border 1px (color based on status)
- Rounded-lg
- Padding 12px

Status colors:
- Diterima → green
- Pending → yellow
- Ditolak → red

---

Top Row:
- Title: "Operasi Banjir"
- Subtitle: Kecamatan

- Right: Status Badge

---

Meta Row (4 items):
- Dikirim
- Keparahan
- Durasi
- Jenis

---

Bottom Row:
- Left: "#LPR-2026-XXX"
- Right: "Lihat Detail ›"

---

### States:

- Empty:
  "Belum ada laporan yang dikirim"

- Filtered Empty:
  "Tidak ada laporan dengan status ini"

---

### Behaviors:

- Click card → S14
- Filter → filter list
- Search → filter keyword
---

## S14 — DETAIL LAPORAN

### Layout Structure:

1. Status Bar
2. Navbar — "‹ Detail Laporan" + Hamburger
3. Scrollable content
4. Footer

**Hero Section:**

- Background: `color-primary`
- Padding: 10px 12px
- Report number: `text-nano`, monospace, `rgba(255,255,255,0.7)`
- Title: "Bencana Type — Kecamatan", `text-heading`, weight 500, white
- Location: `text-nano`, `rgba(255,255,255,0.75)`
- Status chip (inline, not full-width): border 1px + bg at 25% opacity + text, variants:
  - Diterima: border + bg `rgba(46,125,50,0.25)`, text `#A5D6A7`
  - Pending: border + bg `rgba(249,168,37,0.25)`, text `#F9A825`
  - Ditolak: border + bg `rgba(255,255,255,0.15)`, text white

**Informasi Laporan Section:**

- Info Grid (2 col, 6 cells): Jenis | Keparahan | Terdampak | Korban Luka | Dikirim | Diverifikasi
- Kebutuhan Mendesak sub-box: bg `color-bg-muted`, `radius-md`, label + flex wrap tag chips

**Deskripsi Kondisi Section:** paragraph text `text-caption`, color `#555555`

**Lokasi Kejadian Section:** Map Preview + coordinate label below

**Foto Bukti Section:**

- Header: title + count ("X foto") sub-text right
- Horizontal scroll strip of photo thumbnails (55x50px each, `radius-md`, gradient bg)
- Link below: "Ketuk foto untuk perbesar ›", `text-nano`, `color-primary`

**Riwayat Status Section:** Timeline component (3 items: Terkirim → Diverifikasi → Diterima/Ditolak)

**Rejection Note (Ditolak only):**

- Between hero and info sections
- Background: `color-primary-light`, `radius-md`, padding 8px 10px
- Icon: ⚠ + text "Alasan penolakan: [reason]", `text-nano`, `color-primary`

**Behaviors:**

- No action buttons (read-only screen)
- Photo tap → open photo viewer / lightbox

---

## S15 — DAFTAR MISI

### Layout Structure:

1. Status Bar
2. Navbar — "‹ Misi Bencana" + Bell + Hamburger
3. Page Hero (stats)
4. Search + Filter
5. Featured Mission Section
6. Section Divider
7. All Missions Section (list)
8. Footer

**Page Hero:**

- Background: `color-primary`
- Title: "Misi Tanggap Bencana", `text-title`, weight 500, white
- Subtitle: `text-nano`, `rgba(255,255,255,0.75)`
- Stats row: 3 stat chips (bg `rgba(255,255,255,0.15)`, `radius-md`, padding 5px 8px, flex:1 each)
  - Chip content: number (`text-subheading`, weight 500, white) + label (`text-nano`, `rgba(255,255,255,0.75)`)
  - Stats: Misi Aktif | Kamu Terdaftar | Misi Selesai

**Filter Chips:** Semua (active) | Terbuka | Terdaftar | Penuh | Selesai

**Featured Mission Section (Misi Mendesak):**

- Header: "Misi Mendesak" + "Perlu relawan!" right (color `color-primary`, weight 500)
- Featured Card with navy/blue gradient banner
- Banner: category text + title + location
- Status badge: top-right (e.g., "Terbuka" in `color-success-light`)
- Body: info row (3 cells) + progress bar + footer (deadline text + CTA button)

**All Missions Section:**

- "Semua Misi" title + "X misi ditemukan" count
- List of mission cards with left color bar

**Mission Card States:**

- Terbuka (green bar): "Daftar" Primary button
- Terdaftar (red bar): "Batalkan" Outline button, border `color-primary`
- Penuh (yellow bar): "Penuh" Disabled button
- Selesai (grey bar): "Lihat Laporan" ghost/outline button, card opacity 0.75

**Volunteer count display (bottom-left of card):**

- Stacked avatar dots: 3 circles (12x12px, `color-primary`, border 1.5px white, overlap -4px each) + count text
- Count text: `text-nano`, color `color-text-tertiary`

**Behaviors:**

- Click any mission card → Navigate to S16 (Detail Misi)
- Filter chip → filter list
- Search → filter by mission name/location

---

## S16 — DETAIL MISI

### Layout Structure:

1. Status Bar
2. Navbar — "‹ Detail Misi" + Hamburger
3. Mission Hero Banner
4. Progress Bar section
5. Scrollable content sections
6. Fixed CTA section at bottom

**Mission Hero Banner:**

- Background: `linear-gradient(135deg, #1A237E, #283593)`
- Category + type: `text-nano`, `rgba(255,255,255,0.65)`
- Title: `text-heading`, weight 500, white, line-height 1.3, padding-right to avoid badge overlap
- Location: `text-nano`, `rgba(255,255,255,0.75)`
- Badges row: flex gap 5px
  - Status badge: "Terbuka" = `color-success-light` bg + `color-success` text
  - Registration badge (if registered): "✓ Kamu Terdaftar" = `rgba(255,255,255,0.2)` bg, border `rgba(255,255,255,0.4)`, text white

**Progress Bar Section:**

- Background white, border-bottom 0.5px `color-border`
- Label row + bar + sub-text (Component 6.11)

**Sections:**

- Informasi Misi: Info Grid (2 col, 4 cells): Tanggal Mulai | Tanggal Selesai | Jenis Misi | Koordinator
- Lokasi Misi: Map Preview (70px height)
- Deskripsi Misi: paragraph + "Baca selengkapnya ›"
- Persyaratan: list items with `color-success` 5px dot + `text-caption` text
- Relawan Terdaftar: header + stacked avatar circles + "X dari Y relawan sudah mendaftar"

**Fixed CTA Section:**

- Background white, border-top 0.5px `color-border`, padding 8px 10px
- Variants:
  - Not registered: Primary "Daftar Misi Ini" + note below "X tempat tersisa · Tutup DD MMM"
  - Registered: Outline "Batalkan Pendaftaran" (border `color-primary`, text `color-primary`) + note "Kamu sudah terdaftar · DD MMM"
  - Full: Disabled "Kuota Penuh" + note "Daftar tunggu belum tersedia"
  - Done: ghost "Lihat Laporan Misi" + note "Misi ini telah selesai"

**Behaviors:**

- "Daftar Misi Ini" → API call → badge in hero updates to "✓ Kamu Terdaftar", CTA updates to "Batalkan Pendaftaran"
- "Batalkan Pendaftaran" → confirm dialog → update state

---

## S17 — NOTIFIKASI

### Layout Structure:

1. Status Bar
2. Navbar — "‹ Notifikasi" + "Tandai semua dibaca" action
3. Header bar (count + delete all)
4. Grouped notification list by date
5. "Lihat notifikasi lebih lama ›" link
6. Footer

**Header Bar:**

- Background white, border-bottom 0.5px `color-border`
- Left: "X belum dibaca", `text-caption`, color `color-text-tertiary`
- Right: "Hapus semua ›", `text-nano`, color `color-primary`

**Date Group Label:**

- Background: `color-bg-page`
- Padding: 4px 10px
- Text: `text-nano`, weight 500, color `color-text-tertiary` (e.g., "Hari ini", "Kemarin", "2 hari lalu")
- Border-bottom: 0.5px `color-border`

**Notification Item:** (see Component 6.15 for full spec)

- 4 types: Laporan Diterima | Laporan Ditolak | Misi Baru | Pengumuman/Sistem
- Unread: bg `#FFFDE7`, right dot visible
- Read: bg white, no dot

**Empty State:**

- Icon + "Belum ada notifikasi", `text-caption`, color `color-text-tertiary`, text-align center, padding 40px

**Behaviors:**

- Click "Tandai semua dibaca" → all items turn read state, bell badge removed
- Click "Hapus semua ›" → confirm dialog → clear all
- Click individual notification → navigate to relevant screen (e.g., laporan → S14, misi → S16)
- Tap individual notification → mark as read (bg changes white, dot disappears)

---

## S18 — PROFIL RELAWAN

### Layout Structure:

1. Status Bar
2. Navbar — "Profil Saya" (no back) + Hamburger
3. Profile Hero
4. Stat Row
5. Menu Groups
6. Logout Button
7. Footer

**Profile Hero:**

- Background: `color-primary`
- Edit link: top-right "Edit ✎", `text-nano`, `rgba(255,255,255,0.8)`
- Avatar: 56px circle, border 3px `rgba(255,255,255,0.4)`, inner 44px circle bg `color-secondary`, initials white 16px weight 500
- Name: `text-heading`, weight 500, white, text-align center
- Role: "Relawan Astacala · NIM XXXXXXXXXXX", `text-nano`, `rgba(255,255,255,0.75)`, text-align center
- Badges row: 2 badges centered
  - "Relawan Aktif": bg `rgba(255,255,255,0.2)`, border `rgba(255,255,255,0.4)`, text white
  - "✓ Terverifikasi": bg `color-success-light`, text `color-success`

**Stat Row:**

- 3 cells: total laporan | diterima | misi selesai
- Number: `text-heading` weight 500, color `color-primary`
- Label: `text-nano`, color `color-text-tertiary`

**Menu Groups:**
Each group:

- Group label: "AKUN" / "AKTIVITAS" / "LAINNYA" — `text-nano`, weight 500, uppercase, `color-text-tertiary`, padding 6px 10px 3px
- Menu items (Component 6.16)

Group 1 — Akun:

- "Data Diri" → icon bg `color-primary-light`
- "Ubah Password" → icon bg `color-secondary-light`
- "Notifikasi" → icon bg `color-success-light`

Group 2 — Aktivitas:

- "Riwayat Laporan" → icon bg `color-primary-light` → badge with count
- "Misi Saya" → icon bg `color-secondary-light`

Group 3 — Lainnya:

- "Tentang Astacala" → icon bg `color-bg-muted`
- "Bantuan" → icon bg `color-bg-muted`

**Logout Button:**

- Margin: 8px horizontal, 8px top
- Border: 1px `color-primary-light`
- Background: white
- Text: "Keluar dari Akun", `text-label`, color `color-primary`, text-align center
- Border-radius: `radius-lg`
- Padding: 8px

**Behaviors:**

- "Data Diri" → edit profile form
- "Ubah Password" → navigate to S03 (Lupa Password flow variant)
- "Riwayat Laporan" → S13
- "Misi Saya" → S15 (filtered to registered)
- "Tentang Astacala" → S21
- "Keluar dari Akun" → confirm dialog → clear session → navigate to S01

---

## S19 — DAFTAR BERITA

### Layout Structure:

1. Status Bar
2. Navbar — "‹ Berita Bencana" + Hamburger
3. Search + Category Filter
4. Berita Terkini section
5. Footer

**Category Filter Chips:** Semua | Banjir | Gempa | Longsor | Kebakaran | Lainnya

**Berita Terkini Section:**

- Header: "Berita Terkini" + count "X berita" right
- Featured Card: news hero with "✓ Terverifikasi" badge (top-right, bg `color-success`)
- News List Wrap: `radius-lg`, border 0.5px `color-border`, padding 2px 9px, bg white
- Each list item: news-card-sm pattern with "✓ Verified" (`text-nano`, `color-success`) shown top-right of body

**News Card Small (news-card-sm) spec:**

- Layout: flex row, gap 7–8px, align flex-start
- Image: 44–52px × 38–44px, `radius-md`, gradient bg
- Body: flex:1
  - Category: `text-nano`, color `color-primary`
  - Verified: `text-nano`, color `color-success`, weight 500 (right-aligned via flex space-between with category)
  - Title: `text-micro`, weight 500, color `color-text-primary`, line-height 1.3
  - Meta row: location (`text-nano`, `color-text-tertiary`) | time (`text-nano`, `color-text-tertiary`)

**Empty/Filtered Empty State:**

- "Tidak ada berita untuk kategori ini", text-align center, `color-text-tertiary`

**Behaviors:**

- Click category chip → filter list
- Click search → filter by keyword
- Click any news card → Navigate to S20

---

## S20 — DETAIL BERITA

### Layout Structure:

1. Status Bar
2. Navbar — "‹ Detail Berita" + "Bagikan ↗" action (right, `text-nano`, `color-primary`)
3. Hero image area
4. Scrollable content
5. Footer

**Hero Image Area:**

- Height: 100px, gradient placeholder bg
- Top-left: category badge (bg `color-primary`, text white, `text-nano`, `radius-sm`)
- Top-right: "✓ Terverifikasi" badge (bg `color-success`, text white, `text-nano`, `radius-sm`)

**Article Content (white bg):**

- Padding: 10px 10px 0
- Title: `text-heading` (12–13px), weight 500, color `color-text-primary`, line-height 1.4, margin-bottom 5px
- Meta row: flex, gap 8px, align center, padding-bottom 8px, border-bottom 0.5px `color-border`
  - Location: "📍 City Name", `text-nano`, color `color-primary`, weight 500
  - Separator: "·", `text-nano`, color `color-border`
  - Date: "DD MMM YYYY · HH:MM", `text-nano`, color `color-text-tertiary`
- Article text: `text-caption`, color `#444444`, line-height 1.7, margin-bottom 8px
- Source note: "📸 Sumber foto: ...", `text-nano`, color `color-text-tertiary`, margin-bottom 6px
- Tags: flex wrap, gap 4px — each tag: bg `color-bg-muted`, border 0.5px `color-border`, `radius-full`, padding 2px 7px, `text-nano`, color `#666666`

**Lokasi Kejadian Section:** Map Preview (60px) + coordinate

**Berita Terkait Section:**

- Header: "Berita Terkait" + "Lihat semua ›"
- 2 news-card-sm items

**Behaviors:**

- "Bagikan ↗" → native share sheet / copy link
- Click berita terkait → navigate to S20 with new data

---

## S21 — TENTANG KAMI

### Layout Structure:

1. Status Bar
2. Navbar — "‹ Tentang Astacala" + Hamburger
3. About Hero
4. Stat Row
5. Section Divider
6. About sections (4 sections)
7. Version bar
8. Footer

**About Hero:**

- Background: `color-primary`
- Logo circle: 56px
- Name: "Astacala Rescue", `text-heading`, weight 500, white, text-align center
- Subtitle: 2 lines, `text-nano`, `rgba(255,255,255,0.75)`, text-align center, line-height 1.5

**Stat Row:**

- 3 cells: Relawan Aktif | Laporan Terverifikasi | Misi Selesai
- Number: `text-heading` (13px), weight 500, color `color-primary`
- Label: `text-nano`, color `color-text-tertiary`

**Section 1 — Tentang Kami:**

- Title: `text-label`, weight 500
- Body: `text-caption`, color `#555555`, line-height 1.7

**Section 2 — Fitur Sistem:**

- Title: `text-label`, weight 500
- Feature Grid: 2 columns, gap 6px
- Each cell: bg `color-bg-muted`, `radius-lg`, padding 8px, border 0.5px `color-border`
  - Icon: emoji, 16px, margin-bottom 4px
  - Title: `text-micro`, weight 500, color `color-text-primary`
  - Description: `text-nano`, color `color-text-tertiary`, line-height 1.4
- 6 features: Laporan Real-time | Terverifikasi | Peta Interaktif | Data Cuaca | Manajemen Misi | Notifikasi Push

**Section 3 — Tim Pengembang:**

- Title: `text-label`, weight 500
- Each team member: flex row, gap 8px, border-bottom 0.5px `#F5F5F5`
  - Avatar: 30px circle, unique bg color per member, initials white `text-nano` weight 500
  - Name: `text-label`, weight 500, color `color-text-primary`
  - Role + NIM: `text-nano`, color `color-text-tertiary`
- 5 members with their respective roles and NIMs

**Section 4 — Kontak & Sosial Media:**

- Title: `text-label`, weight 500
- 3 contact items (Menu Item pattern without submenu)
  - Email: icon bg `color-primary-light`, value email address
  - Instagram: icon bg `color-success-light`, value @handle
  - Website: icon bg `color-secondary-light`, value URL

**Version Bar:**

- Background: `color-bg-muted`
- Border-top: 0.5px `color-border`
- Text: "Astacala Rescue System v1.0.0 · Computing Project 2026", `text-nano`, `color-text-tertiary`, text-align center

**Behaviors:**

- Click email → open mail client
- Click Instagram → open Instagram profile
- Click website → open browser with URL

---

## SHARED PATTERNS

### Page that requires auth but session expired:

- Redirect to S02 (Login)
- After login → redirect back to original page

### Loading State (any list or content):

- Show skeleton loaders: grey rounded rectangles in place of text/cards
- Skeleton bg: `#EEEEEE`, animated pulse
- After data loads: fade in actual content

### Error State (API failure):

- Show error banner at top: "Gagal memuat data. Coba lagi.", bg `color-primary-light`, border `color-primary-light`, text `color-primary`
- "Coba lagi" is a tappable link

### Confirmation Dialog:

- Overlay: `rgba(0,0,0,0.4)`
- Card: white, `radius-xl`, padding 20px, width 280px, centered
- Title: `text-subheading`, weight 500
- Body: `text-caption`, `color-text-secondary`
- Buttons: flex row, "Batal" Outline + "Konfirmasi" Primary

### Pull-to-refresh:

- On scroll up beyond top of page
- Show spinner in `color-primary`
- Reload data

---

Spacing:

- Use spacious layout (space-y-6 to space-y-8)
- Avoid tight stacking

_End of SCREEN_SPECS.md_
_Document pair: UI_SYSTEM.md + SCREEN_SPECS.md_
_Target Platform_

- Mobile-first layout, but NOT restricted to mobile width
- The UI MUST adapt naturally across screen sizes
