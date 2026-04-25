# UI_SYSTEM.md

# Astacala Rescue — Mobile Web Design System

# Version 1.0 | Computing Project 2026

---

## RESPONSIVE RULE (IMPORTANT)

- The application is mobile-first, but must work naturally on desktop
- DO NOT simulate mobile device UI (no fake status bar, no phone frame)
- DO NOT display system elements like time, signal, or battery
- Layout should scale naturally using an INNER max-width container (NOT on root layout)
- Desktop view should be clean, not mimic a phone screen

## SPACING SYSTEM (IMPORTANT)

The UI must prioritize readability and breathing space.

### Global Rules

- Avoid cramped layouts
- Ensure sufficient whitespace between elements
- Do not use overly tight spacing (no `p-2`, `gap-2`, or `space-y-2` for main layout)

### Section Spacing

- Minimum spacing between sections: 24px (space-y-6)
- Preferred spacing: 32px (space-y-8)

### Container Padding

- Mobile: px-4 minimum, px-6 preferred
- Tablet/Desktop: px-8 to px-16

### Card & Component Spacing

- Card padding: minimum 16px (p-4), preferred 20px (p-5)
- Gap between list items: minimum 12px (space-y-3), preferred 16px (space-y-4)

### Layout Density

- The design should feel spacious and readable
- Prioritize clarity over compactness
- Avoid stacking elements too tightly

### Desktop Enhancement

- Increase spacing on larger screens using responsive utilities
- Example: px-4 md:px-8 lg:px-12

## RESPONSIVE CONTAINER RULE

- Use fluid width layout
- Avoid fixed max-width like 390px for entire page
- Use breakpoints:
  - sm: full width
  - md: max-w-[768px]
  - lg: max-w-[1024px]
  - xl: max-w-[1200px]
- Content should scale proportionally

## ROOT LAYOUT RULE (CRITICAL)

The root layout MUST follow this structure:

Use an inner container div (NOT Tailwind default `.container` class)

Example:

<main class="w-full">
  <div class="w-full px-4 md:px-8 lg:px-12 max-w-[1200px] mx-auto">
    page content
  </div>
</main>

### Rules:

- NEVER apply max-width on <main>
- NEVER center <main> using mx-auto
- NEVER constrain root layout width

### Container rules:

- Use container inside main for content alignment
- Mobile: px-4
- Tablet: md:px-8
- Desktop: lg:px-12 or lg:px-16

- Max width only applied to inner container:
  - md: max-w-[768px]
  - lg: max-w-[1200px]

### Important:

- Background spans full width (main)
- Content is centered (inner container)
- Layout must feel like a real website, NOT a mobile frame

## 1. COLOR SYSTEM

### Primary Palette

| Token                   | Hex       | Usage                                                                                             |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `color-primary`         | `#C62828` | Navbar status bar bg, hero section bg, CTA buttons, alert banners, active states, badge "Ditolak" |
| `color-primary-dark`    | `#B71C1C` | Hover/pressed state of primary buttons                                                            |
| `color-primary-light`   | `#FFEBEE` | Badge backgrounds for "Ditolak", error highlights, button outline hover fill                      |
| `color-secondary`       | `#1A237E` | Footer background, weather widget accent, mission hero banner                                     |
| `color-secondary-light` | `#E3F2FD` | Info badge background, weather widget background, notification dot (mission)                      |

### Semantic Palette

| Token                 | Hex       | Usage                                                                                   |
| --------------------- | --------- | --------------------------------------------------------------------------------------- |
| `color-success`       | `#2E7D32` | Badge "Diterima", badge "Terverifikasi", status dot (accepted), stepper completed step  |
| `color-success-light` | `#E8F5E9` | Background for success badges, success notification items                               |
| `color-warning`       | `#F9A825` | Alert strip SIAGA, badge "Pending", notification dot (new mission), status bar dot bell |
| `color-warning-light` | `#FFF8E1` | Background for pending badges, warning banners                                          |
| `color-danger`        | `#C62828` | Same as `color-primary`. Used for "Ditolak" state, error text, rejection notes          |
| `color-danger-light`  | `#FFEBEE` | Background for danger/rejection badges                                                  |

### Neutral Palette

| Token                  | Hex       | Usage                                          |
| ---------------------- | --------- | ---------------------------------------------- |
| `color-text-primary`   | `#212121` | Heading, card title, body text                 |
| `color-text-secondary` | `#757575` | Labels, metadata, descriptions, subtitles      |
| `color-text-tertiary`  | `#AAAAAA` | Timestamps, hints, placeholders, disabled text |
| `color-text-inverse`   | `#FFFFFF` | Text on colored backgrounds (hero, nav, badge) |
| `color-bg-page`        | `#F5F5F5` | Page background, section dividers              |
| `color-bg-card`        | `#FFFFFF` | Card backgrounds, section backgrounds          |
| `color-bg-muted`       | `#F9F9F9` | Info boxes, read-only inputs, muted areas      |
| `color-border`         | `#EEEEEE` | Card borders, dividers, input borders default  |
| `color-border-focus`   | `#C62828` | Input border on focus/active state             |

---

## 2. TYPOGRAPHY

### Font Family

- **Primary Font**: `Plus Jakarta Sans` (Google Fonts)
- **Fallback**: `Inter`, `sans-serif`
- **Monospace** (for IDs, codes): `monospace` system font

### Type Scale

| Token             | Size | Weight | Line Height | Usage                                       |
| ----------------- | ---- | ------ | ----------- | ------------------------------------------- |
| `text-hero`       | 16px | 500    | 1.3         | Hero section title                          |
| `text-title`      | 14px | 500    | 1.4         | Page title, card featured title             |
| `text-heading`    | 13px | 500    | 1.4         | Section heading, card title large           |
| `text-subheading` | 12px | 500    | 1.4         | Sub-section heading, modal title            |
| `text-body`       | 10px | 400    | 1.6         | Body text, descriptions, article content    |
| `text-label`      | 9px  | 500    | 1.4         | Navbar title, section title, button text    |
| `text-caption`    | 8px  | 400    | 1.5         | Card meta, timestamps, input labels         |
| `text-micro`      | 7px  | 400    | 1.4         | Badge text, hint text, secondary meta       |
| `text-nano`       | 6px  | 400    | 1.4         | Footer links, version text, tertiary labels |

### Typography Rules

- Navbar title: `text-label`, weight 500, color `color-text-primary`
- Section titles: `text-label`, weight 500, color `color-text-primary`
- Card titles: `text-caption`, weight 500, color `color-text-primary`
- Badge text: `text-nano` or `text-micro`, weight 500
- Button text: `text-label`, weight 500, color depends on button variant
- Input placeholder: `text-caption`, color `color-text-tertiary`
- Input value: `text-caption`, color `color-text-primary`

---

## 3. SPACING SYSTEM

### Base Unit: 4px

All spacing values are multiples of 4px.

| Token     | Value | Usage                                          |
| --------- | ----- | ---------------------------------------------- |
| `space-1` | 4px   | Inline gap between icon and text, tiny padding |
| `space-2` | 8px   | Inner card padding, gap between items          |
| `space-3` | 12px  | Standard section padding horizontal            |
| `space-4` | 16px  | Hero section padding, large card padding       |
| `space-5` | 20px  | Auth page centered content padding             |
| `space-6` | 24px  | Success/empty state padding top                |

### Layout Spacing Rules

- **Navbar padding**: 7px top/bottom, 12px left/right
- **Section padding**: 8px top, 12px left/right, 0 bottom
- **Card padding**: 7px–9px top/bottom, 9px–12px left/right
- **Section divider height**: 5–6px, background `color-bg-page`, border-top/bottom 0.5px `color-border`
- **Button padding**: 8px–10px vertical, full-width horizontal
- **Input padding**: 6px vertical, 8px horizontal
- **Badge padding**: 2px vertical, 5px–8px horizontal
- **Form group margin-bottom**: 8px between fields

---

## 4. BORDER RADIUS

| Token         | Value | Usage                                               |
| ------------- | ----- | --------------------------------------------------- |
| `radius-sm`   | 4px   | Badge, tag chip, small image                        |
| `radius-md`   | 6px   | Input field, small button, info grid item           |
| `radius-lg`   | 8px   | Card, search box, filter chip, stat strip           |
| `radius-xl`   | 10px  | Featured news card, mission featured card           |
| `radius-full` | 50%   | Avatar, notification dot, step indicator, bell icon |

---

## 5. SHADOW & ELEVATION

| Token             | Value                             | Usage                                            |
| ----------------- | --------------------------------- | ------------------------------------------------ |
| `shadow-card`     | `0 0.5px 0 #EEEEEE` (border only) | Standard card elevation (use border, not shadow) |
| `shadow-dropdown` | `0 4px 16px rgba(0,0,0,0.12)`     | Notification dropdown, modal                     |

> Rule: Cards use visible borders (`0.5px solid #EEEEEE`) instead of box-shadow for flat mobile web aesthetic.

---

## 6. COMPONENT PATTERNS

---

### 6.1 STATUS BAR

- Height: 18–20px
- Background: `color-primary` (`#C62828`)
- Contains: time (left, `text-nano`, white), signal icons (right, `text-nano`, white)
- Fixed at top of every authenticated screen

---

### 6.2 NAVBAR (Navigation Bar)

- Background: `#FFFFFF`
- Height: 40px (padding 6–7px top/bottom, 10–12px left/right)
- Border-bottom: 1px solid `color-border`
- Position: sticky, top:0, z-index:10
- Fixed during scroll (use Figma "Fix position when scrolling")

**Left slot — variants:**

- Logo row: logo circle (26px diameter, gradient `#1A237E` to `#2E7D32`, split diagonal 50/50) + brand name text (`text-label`, color `color-primary`)
- Back navigation: back arrow (‹, 13px, color `color-primary`) + page title (`text-label`, color `color-text-primary`)

**Right slot — variants:**

- Home/main: bell icon (20–22px circle, bg `#F5F5F5`, radius-full) + badge (10px circle, bg `color-primary`, text white `text-nano`) + hamburger (3 lines, 14px wide, 1.5px height, `color-text-primary`)
- Detail pages: hamburger only OR action text link (e.g., "Bagikan ↗", `text-micro`, color `color-primary`)
- Step pages: step counter text ("1 / 4", `text-nano`, color `color-text-tertiary`)
- Auth pages: nothing in right slot

**Hamburger icon spec:**

- 3 horizontal lines
- Line 1: full width (14–15px)
- Line 2: 70% width (10px)
- Line 3: full width (14–15px)
- Gap between lines: 2.5px
- Height per line: 1.5px
- Color: `color-text-primary`

---

### 6.3 HERO SECTION

- Background: `color-primary` (`#C62828`)
- Padding: 10–14px top/bottom, 12–14px left/right
- Contains: greeting text + user name + CTA button card

**Greeting text:**

- "Selamat pagi/siang/sore," — `text-nano`, color `rgba(255,255,255,0.75)`
- User name — `text-subheading`, weight 500, color white

**CTA Button Card (inside hero):**

- Background: white
- Border-radius: `radius-lg`
- Padding: 8–10px vertical, 10–12px horizontal
- Layout: flex row, gap 8px, align items center
- Left: icon box (26px, `radius-md`, bg `color-primary`, contains + symbol, color white, 13px)
- Center: title (`text-label`, weight 500, color `color-primary`) + subtitle (`text-nano`, color `color-text-tertiary`)
- Right: arrow › (12px, color `color-primary`)

---

### 6.4 ALERT BANNER

- Background: `#1B5E20` (dark green for SIAGA) OR `color-warning-light` with border for warnings
- Padding: 6–7px vertical, 12–14px horizontal
- Layout: flex row, gap 6px, align center

**SIAGA variant (dark green):**

- Left dot: 5px circle, bg `color-warning` (`#F9A825`)
- Text: `text-nano`, color white
- Right link: `text-nano`, color `color-warning`, font-weight 500

**Warning variant (yellow):**

- Background: `#FFF8E1`, border-top/bottom 0.5px `#FFE082`
- Left icon: ⚠ (10px)
- Text: `text-micro`, color `#E65100`

---

### 6.5 CARD

**Standard Card:**

- Border: 0.5px solid `color-border`
- Border-radius: `radius-lg` (8px)
- Background: `color-bg-card`
- Overflow: hidden
- Margin-bottom: 5–6px

**Card with Left Status Bar:**

- Left bar: 3px wide, full height
- Color: green (`#2E7D32`) = open/accepted, red (`#C62828`) = rejected/registered, yellow (`#F9A825`) = full/pending, grey (`#90A4AE`) = done
- Inner content padding: 7–9px vertical, 9–10px horizontal

**Featured Card (e.g., news hero, mission featured):**

- Border-radius: `radius-xl` (10px)
- Contains: image area (top) + footer (bottom)
- Image area: gradient placeholder, min-height 75–100px, position relative
- Overlay on image: `linear-gradient(transparent, rgba(0,0,0,0.75))`, bottom 0
- Category badge inside overlay: `text-nano`, bg `color-primary`, color white, `radius-sm`, padding 1px 4px
- Title inside overlay: `text-micro`, weight 500, color white, line-height 1.3
- Footer: white background, padding 5–6px 8–10px, flex row space-between
- Footer text: `text-nano`, color `color-text-tertiary`

**Info Grid Card (2 columns):**

- Grid: 2 columns, gap 5–6px
- Each cell: bg `color-bg-muted`, `radius-md`, padding 5–7px 7–8px
- Label: `text-nano`, color `color-text-tertiary`
- Value: `text-micro`, weight 500, color `color-text-primary`

---

### 6.6 BADGE / CHIP

**Status Badge:**
| State | Background | Text Color | Text |
|----------|---------------------|-------------|--------------------------|
| Diterima | `#E8F5E9` | `#2E7D32` | "✓ Diterima" |
| Pending | `#FFF8E1` | `#E65100` | "⏳ Pending" |
| Ditolak | `#FFEBEE` | `#C62828` | "✗ Ditolak" |
| Terbuka | `#E8F5E9` | `#2E7D32` | "Terbuka" |
| Penuh | `#FFF8E1` | `#E65100` | "Penuh" |
| Selesai | `#ECEFF1` | `#546E7A` | "Selesai" |
| Verified | `#E8F5E9` | `#2E7D32` | "✓ Terverifikasi" |
| Terdaftar| `#FFEBEE` | `#C62828` | "Terdaftar" |
| Info | `#E3F2FD` | `#1565C0` | varies |

- Padding: 2px vertical, 5–7px horizontal
- Border-radius: `radius-full` (10px)
- Font: `text-nano`, weight 500
- No border (background-only)

**Filter Chip:**

- Active: bg `color-primary`, color white
- Default: bg `#F5F5F5`, color `#666666`, border 0.5px `color-border`
- Font: `text-micro`, weight 500
- Padding: 3px vertical, 8–10px horizontal
- Border-radius: `radius-full`
- Overflow: horizontal scroll when chips exceed width; hide scrollbar

---

### 6.7 BUTTON

**Primary Button:**

- Background: `color-primary` (`#C62828`)
- Color: white
- Font: `text-label`, weight 500
- Padding: 8–10px vertical, full width
- Border-radius: `radius-lg` (7–8px)
- Hover/Active: bg `color-primary-dark` (`#B71C1C`)
- Margin-bottom: 6px when stacked

**Outline Button:**

- Background: transparent
- Border: 1px solid `color-border`
- Color: `color-text-secondary`
- Same padding and radius as primary
- Use for: secondary action (e.g., "Kembali", "Batalkan")

**Ghost/Link Button:**

- Background: none
- Color: `color-primary`
- Font: `text-caption`, weight 500
- Underline: none
- Padding: 4px vertical, 0 horizontal
- Use for: "Lupa Password?", "Kembali ke Login"

**Disabled Button:**

- Background: `#CCCCCC`
- Color: white
- Same padding and radius
- Cursor: not-allowed

---

### 6.8 INPUT FIELD

- Border: 1px solid `color-border`
- Border-radius: `radius-md` (6px)
- Padding: 6px vertical, 8px horizontal
- Background: `color-bg-card`
- Font: `text-caption`
- Color (value): `color-text-primary`
- Color (placeholder): `color-text-tertiary`
- Height: auto (content-driven)

**States:**

- Default: border `color-border`
- Focus/Active: border `color-primary` (`#C62828`), 1px or 1.5px
- Error: border `color-primary`, + error text below in `color-primary`, `text-micro`
- Filled + valid: border `color-primary`, right icon ✓ in `color-primary`

**Hint text below input:**

- Font: `text-nano`, color `color-text-tertiary`
- Margin-top: 2px, margin-bottom: 8px

**Textarea:**

- Same as input
- Min-height: 48–54px
- Resize: none

**Select/Dropdown:**

- Same as input field
- Right icon: ▾ (9px, color `color-text-tertiary`)
- Display: flex, justify-content space-between

---

### 6.9 STEPPER

- Layout: flex row, align items center
- Between steps: flex:1 line (height 1.5px)

**Step dot (18–20px circle):**

- Todo: bg `#F0F0F0`, border 1px `color-border`, text `color-text-tertiary`
- Active: bg `color-primary`, text white
- Done: bg `color-success`, text white, content "✓"

**Connector line:**

- Done: `color-success` (`#2E7D32`)
- Todo: `#E0E0E0`

**Labels row (below dots):**

- Font: `text-nano`
- Done: `color-success`
- Active: `color-primary`, weight 500
- Todo: `color-text-tertiary`

---

### 6.10 STAT STRIP

- Layout: flex row, no gaps, equal width columns
- Each column border-right: 0.5px `color-border` (last child: none)
- Padding per cell: 7–8px vertical, 4px horizontal, text-align center
- Number: `text-heading` (14px), weight 500, color `color-text-primary`
- Label: `text-nano`, color `color-text-tertiary`
- Badge below label: optional status badge (as per 6.6)

---

### 6.11 PROGRESS BAR

- Container height: 4–5px, bg `#F0F0F0`, `radius-full`
- Fill: bg `color-primary`, `radius-full`, width = (current/total \* 100%)
- Label row above: flex space-between, `text-micro`, left label `color-text-tertiary`, right value `color-primary` weight 500
- Sub-text below: `text-nano`, color `color-text-tertiary`

---

### 6.12 TIMELINE

- Layout: vertical list of items
- Each item: flex row, gap 7px

**Left column:**

- Dot: 10px circle
- Vertical line below dot: 1px width, color `#EEEEEE`, connects to next dot
- Last item: no line

**Right column:**

- Title: `text-micro`, weight 500, color matches step type
- Time: `text-nano`, color `color-text-tertiary`
- Note (optional): `text-nano`, color `color-text-secondary`

**Dot colors:**

- Accepted: `color-success`
- Pending: `color-warning`
- Submitted: `color-secondary`
- Rejected: `color-primary`

---

### 6.13 SEARCH BOX

- Layout: flex row, gap 5px, align center
- Background: `#F5F5F5`
- Border-radius: `radius-lg` (6–7px)
- Padding: 5–6px vertical, 8–10px horizontal
- Left: 🔍 icon (9–10px, `color-text-tertiary`)
- Input text area: flex:1, `text-caption`, color `color-text-tertiary` (placeholder)
- No border by default

---

### 6.14 MAP PREVIEW

- Height: 60–80px
- Background: gradient green (`#C8E6C9` to `#A5D6A7`) as placeholder
- Border-radius: `radius-lg`
- Border: 0.5px `color-border`
- Center pin: 8–10px circle, bg `color-primary`, border 2px white, position absolute center
- Bottom-right label: `text-nano`, `color-success`, font-weight 500 ("Peta Interaktif")
- Footer below map: `text-nano`, color `color-text-tertiary`

---

### 6.15 NOTIFICATION ITEM

- Layout: flex row, gap 7–8px, align flex-start
- Padding: 7–8px vertical, 10–12px horizontal
- Border-bottom: 0.5px `#F5F5F5` (last child: none)

**Unread state:**

- Background: `#FFFDE7` (light yellow)
- Right dot: 6px circle, bg `color-primary`

**Read state:**

- Background: `color-bg-card`
- No right dot

**Left icon (28px circle):**

- Accepted: bg `#E8F5E9`, icon ✅
- Rejected: bg `#FFEBEE`, icon ❌
- Mission: bg `#E3F2FD`, icon 📢
- Announcement: bg `#FFF8E1`, icon ⚠️
- System: bg `#F5F5F5`, icon 🔔

**Content:**

- Title: `text-micro`, weight 500, color `color-text-primary`
- Description: `text-nano`, color `color-text-secondary`, line-height 1.4
- Timestamp: `text-nano`, color `color-text-tertiary`

---

### 6.16 MENU ITEM (Profile/Settings)

- Layout: flex row, gap 8px, align center
- Padding: 9px vertical, 10px horizontal
- Border-bottom: 0.5px `#F5F5F5`
- Background: `color-bg-card`

**Left icon box (26px):**

- Border-radius: `radius-md`
- Background: varies per category (see Profil screen spec)

**Content:**

- Title: `text-label`, weight 500, color `color-text-primary`
- Subtitle: `text-nano`, color `color-text-tertiary`

**Right:**

- Arrow ›: 10px, color `#CCCCCC`
- OR badge: small number badge (bg `#FFEBEE`, color `color-primary`, `text-nano`)

---

### 6.17 SECTION DIVIDER

- Height: 5–6px
- Background: `color-bg-page` (`#F5F5F5`)
- Border-top: 0.5px `color-border`
- Border-bottom: 0.5px `color-border`
- Purpose: visual separator between sections inside scrollable page

---

### 6.18 FOOTER

- Background: `color-secondary` (`#1A237E`)
- Padding: 8–12px vertical, 12–14px horizontal
- Contains:
  - Logo row: circle (22px, gradient) + brand name (`text-caption`, weight 500, white)
  - Description (optional): `text-nano`, `rgba(255,255,255,0.6)`, line-height 1.5
  - Links row: flex wrap, gap 8px, `text-nano`, `rgba(255,255,255,0.6)`
  - Divider: 0.5px `#333333`
  - Copyright: `text-nano`, `rgba(255,255,255,0.35)`

---

### 6.19 OTP INPUT

- 6 individual boxes, flex row, gap 6px, justify center
- Each box: 32px wide, 38px tall, border-radius `radius-md`, border 1.5px
- Filled: border `color-primary`, text `color-primary`, `text-heading` (14px), weight 500
- Active (cursor): border `color-primary`, border-width 2px, empty
- Empty: border `color-border`, bg white, empty
- Margin: 12px top/bottom

---

### 6.20 PASSWORD STRENGTH BAR

- Container: flex row, gap 3px, 4 equal segments
- Each segment: flex:1, height 3px, `radius-full`
- Strength levels:
  - Weak (1 segment): `color-primary` + 3x `#EEEEEE`
  - Fair (2 segments): `color-warning` + `color-warning` + 2x `#EEEEEE`
  - Strong (3 segments): `color-success` x3 + 1x `#EEEEEE`
  - Very Strong (4 segments): `color-success` x4
- Label below: `text-nano`, color matches strength level

---

## 7. INTERACTION RULES

### Navigation

- Back navigation: always "‹" arrow + page title in navbar left slot
- Landing → Login: click "Masuk sebagai Relawan" button
- Login → Main Page: successful login
- Any authenticated page → Hamburger Drawer: click hamburger icon
- Any page → Previous: click back arrow in navbar

### Hamburger Drawer

- Slides in from right
- Width: ~150px (65% of frame width)
- Background: white with dim overlay (rgba(0,0,0,0.30)) on left
- Header: colored background (`color-primary`) with logo + tagline
- Close: ✕ icon top-left of drawer
- Menu items: same as 6.16
- Active item: text color `color-primary`, left dot `color-primary`
- CTA button inside drawer: full-width, bg `color-primary`, color white

### Scroll Behavior

- All authenticated pages: vertical scroll
- Navbar: fixed (does not scroll)
- Alert banner: scrolls with content (not fixed)
- Form step pages: CTA buttons at bottom fixed in some screens (e.g., Detail Misi)

### Button States

- Default: as specified per variant
- Hover (desktop): background darkens by one shade
- Active/Pressed: 10% darker than hover
- Disabled: bg `#CCCCCC`, text white, cursor not-allowed
- Loading: show spinner inside button, text hidden

### Form Validation

- Validate on blur (when field loses focus)
- Required field label: asterisk (\*) in `color-primary` after label text
- Error state: border turns `color-primary`, error message below in `text-nano`, `color-primary`
- Valid state: border `color-primary`, ✓ icon right side of input

### Unread Notification

- Bell badge: visible when count > 0, number shown, max display "9+"
- Notification item background: `#FFFDE7` for unread
- Unread dot: 6px circle, `color-primary`, right side
- On "Tandai semua dibaca": all items background → white, dots removed, bell badge → hidden

---

## 8. PAGE FRAME SPEC

- 390px is DESIGN REFERENCE ONLY (Figma)
- MUST NOT be used in actual implementation
- DO NOT constrain layout to 390px
- Real implementation must be responsive (see Responsive Container Rule)

---

## 9. LOGO SPEC

**Astacala Logo Circle:**

- Shape: circle
- Diameter: varies (22–56px depending on context)
- Background: diagonal gradient, left `#1A237E` (50%), right `#2E7D32` (50%)
- Split: 135° diagonal (top-left blue, bottom-right green)

**Brand Name Text:**

- Content: "Astacala Rescue"
- Color: `color-primary` on white backgrounds, white on colored backgrounds
- Font: `text-label`, weight 500

---

## 10. IMAGE PLACEHOLDER SPEC

When real images are unavailable, use CSS gradients:
| Category | Gradient |
|----------|----------------------------------------------------|
| Gempa | `linear-gradient(135deg, #78909C, #546E7A)` |
| Banjir | `linear-gradient(135deg, #90A4AE, #607D8B)` |
| Longsor | `linear-gradient(135deg, #A5D6A7, #66BB6A)` |
| Kebakaran| `linear-gradient(135deg, #FFCC80, #FFA726)` |
| Gempa 2 | `linear-gradient(135deg, #EF9A9A, #E57373)` |
| Mission | `linear-gradient(135deg, #1A237E, #283593)` |
| Map | `linear-gradient(135deg, #C8E6C9, #A5D6A7)` |
