# COMPONENT_MAP.md

Astacala Rescue — Component System

---

## GLOBAL RULES

- Always reuse components defined here
- Do NOT create new components with similar structure
- Extend via props (variants), NOT duplication
- Follow UI_SYSTEM.md for styling
- Follow SCREEN_SPECS.md for placement

---

## NAMING CONVENTION

- Components → PascalCase (e.g., NotificationItem)
- Sections → [Feature]Section (e.g., HeroSection)
- Pages → S01LandingPage, S07DashboardPage
- Lists → [Item]List (e.g., NotificationList)

---

# CORE COMPONENTS

---

## Navbar

Purpose:

- Main navigation header

Structure:

- Left: back button OR title OR logo
- Right: optional icons (bell, menu)

Variants:

- public (no bell)
- authenticated (with bell + menu)

Used in:

- All pages

---

## Button

Variants:

- primary
- outline
- ghost
- disabled

Props:

- fullWidth (boolean)
- loading (boolean)

Usage:

- CTA actions
- form submission

---

## Card

Purpose:

- Container for grouped content

Variants:

- default
- clickable
- with-left-bar (status)

Used in:

- ReportCard
- MissionCard
- NewsCard
- ReviewSection

---

## Badge

Purpose:

- Status indicator

Variants:

- success
- warning
- danger
- neutral

Usage:

- report status
- verification label
- mission state

---

## Input

Variants:

- text
- password
- textarea

States:

- default
- focus
- error
- disabled

---

## SectionHeader

Structure:

- Title (left)
- Action link (right)

Used in:

- News section
- Notification section
- Mission section

---

# FEATURE COMPONENTS

---

## NotificationItem

Structure:

- icon
- title
- description
- timestamp
- unread indicator (dot)

States:

- unread (highlight + dot)
- read

Used in:

- S07 (Dashboard preview)
- S17 (Notification page)

---

## NotificationList

Structure:

- grouped by date
- list of NotificationItem

---

## ReportCard

Structure:

- left status bar
- title (type + location)
- meta (date, severity, photo count)
- status badge
- action link (detail)

States:

- pending
- accepted
- rejected

Used in:

- S13 (Riwayat)
- S07 (preview)

---

## MissionCard

Structure:

- left status bar
- title
- location
- badge
- meta info
- CTA button

States:

- open
- registered
- full
- done

Used in:

- S07
- S15

---

## NewsCard

Variants:

- featured (large)
- small (list item)

Structure:

- image
- category
- title
- meta (location + time)
- verification badge

Used in:

- S01
- S07
- S19

---

## ProfileHeader

Structure:

- avatar
- name
- role
- badges

Used in:

- S18

---

## StatCard / StatStrip

Structure:

- number
- label

Variants:

- 3-column
- 4-column

Used in:

- Dashboard
- Profile
- Landing

---

## MenuItem

Structure:

- icon
- label
- optional badge
- arrow (›)

Used in:

- Profile menu
- Drawer menu

---

## DrawerMenu

Structure:

- header (user info)
- menu list
- footer (logout)

Variants:

- public
- authenticated

---

## AlertBanner

Variants:

- siaga
- info
- warning

Structure:

- label
- message
- optional action link

---

## OTPInput

Structure:

- 6 input boxes

Behavior:

- auto focus next
- auto submit when filled

Used in:

- S04

---

## PasswordStrengthBar

Structure:

- progress bar
- label

Used in:

- S05

---

## MapPreview

Structure:

- static map preview
- coordinate label

Used in:

- S08
- S14
- S16
- S20

---

## PhotoGrid

Structure:

- 3-column grid
- upload slot
- preview slot
- remove button

Used in:

- S10

---

## VideoUploadBox

Structure:

- dashed container
- icon + label

Used in:

- S10

---

## ReviewSection

Structure:

- header (title + edit)
- body (info rows)

Used in:

- S11

---

## InfoGrid

Structure:

- 2-column grid
- label + value pairs

Used in:

- S14
- S16

---

## Timeline

Structure:

- vertical steps
- status progression

Used in:

- S14

---

## ProgressBar

Structure:

- filled bar
- label

Used in:

- S16

---

## WeatherBox

Structure:

- top info
- temperature
- 3 data cells

Used in:

- S07

---

## ConfirmationDialog

Structure:

- overlay
- title
- message
- actions (cancel + confirm)

---

## EmptyState

Structure:

- icon
- message

Used in:

- empty lists

---

## LoadingSkeleton

Structure:

- placeholder blocks

Used in:

- loading states

---

# COMPONENT RELATIONSHIP RULE

- Page → Section → Component → UI_SYSTEM tokens
- Never skip layers

---

# REUSE PRIORITY (IMPORTANT)

Always reuse in this order:

1. Core Components
2. Feature Components
3. Create new (ONLY if not exists)

---

# FINAL RULE

If a component already exists:
→ USE IT  
→ DO NOT recreate it
