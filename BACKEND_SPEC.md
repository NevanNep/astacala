# BACKEND_SPEC.md

## B01 — OVERVIEW

**Purpose:**
The backend is responsible for handling user authentication, storing disaster reports, and providing structured report history data. It acts as the bridge between the relawan web application and the system database.

**Scope:**
- Authentication (login)
- Report submission
- Report history retrieval
- Report status tracking (simulation)

---

## B02 — DATA MODELS

### User

Fields:
- id (number)
- email (string)
- password (string, hashed)

---

### Report

Fields:
- id (string, format: LPR-YYYY-XXX)
- user_id (number)
- lokasi (string)
- kondisi (string)
- deskripsi (string)
- status (enum: Pending | Diterima | Ditolak)
- created_at (datetime)

Rules:
- Default status = Pending
- ID must follow format: LPR-YYYY-XXX
- Each report must be associated with a user_id

---

## B03 — API ENDPOINTS

### AUTH

POST /api/login

Request:
```json
{
  "email": "string",
  "password": "string"
}

Response:

{
  "token": "string",
  "user": {
    "id": 1,
    "email": "user@email.com"
  }
}
CREATE REPORT

POST /api/reports

Request:

{
  "lokasi": "Kec. Dayeuhkolot",
  "kondisi": "Flood",
  "deskripsi": "Water level reached 1 meter, evacuation has started"
}

Rules:

user_id must be extracted from authentication token
status is automatically set to "Pending"

Response:

{
  "id": "LPR-2026-001",
  "status": "Pending"
}
GET REPORT HISTORY

GET /api/reports

Rules:

Only return reports belonging to the authenticated user

Response:

[
  {
    "id": "LPR-2026-001",
    "lokasi": "Kec. Dayeuhkolot",
    "kondisi": "Flood",
    "status": "Pending",
    "created_at": "2026-04-10T09:41:00Z"
  }
]
UPDATE REPORT STATUS (SIMULATION ONLY)

PATCH /api/reports/:id

Purpose:

Used to simulate report verification in MVP

Request:

{
  "status": "Diterima"
}

Rules:

No admin system required
Used only for demo/testing purposes
B04 — BUSINESS RULES
Every report must be associated with a user (user_id)
Default report status is "Pending"
No admin system exists in MVP
Report verification is not real (simulation only)
System supports one-way flow: user → system
B05 — NON-SCOPE

## Report Draft (Step-based Input)

Data structure:

{
  latitude: number
  longitude: number
  alamat: string
  detail?: string
}

Validation:
- latitude required
- longitude required
- alamat required

Notes:
- alamat may be:
  - entered manually by user, OR
  - auto-filled via reverse geocoding (frontend)

Storage:
- Stored temporarily as draft (NOT final report)
- Use session (cookie-based)

---

### Draft Flow

Reports are created in multi-step flow:

Step 1 → store location  
Step 2 → add condition  
Step 3 → review & submit → create final report  

Draft must persist between steps.

---

### Endpoint — Create Draft (Step 1)

POST /api/report/draft

Request:
{
  latitude: number
  longitude: number
  alamat: string
  detail?: string
}

Response:
{
  success: true
}

Error:
{
  error: string
}

The following features are NOT included in MVP:

Admin dashboard / control center
Real-time report verification
Role & permission system (RBAC)
Mission management
Notifications (push / real-time)
Interactive map integration
Weather API integration
B06 — IMPLEMENTATION NOTES
Backend can be implemented using Next.js API routes or Express
Database can use MySQL or a simple alternative for MVP
Authentication should use JWT
Passwords must be hashed (bcrypt)
Focus on clarity and consistency, not scalability
B07 — ALIGNMENT WITH SRS
The full system includes two platforms: relawan and control center
In MVP, only the relawan platform is implemented
Control center features (admin dashboard, verification, mission management) will be developed in future phases
B08 — SOURCE OF TRUTH

This document serves as the single source of truth for backend MVP implementation.

All backend implementations must strictly follow this specification.