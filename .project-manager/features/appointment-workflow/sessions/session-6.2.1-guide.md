# Session 6.2.1 Guide: Held Status Stub

**Phase:** 6.2 — Held & Override Stubs
**Session:** 6.2.1 — Held Status Stub
**Status:** Complete
**Branch:** `appointment-workflow-phase-6.2-session-6.2.1`

---

## Session Overview

Create the server-side route and logic for transitioning appointments to `held` status with a stub auth check, plus the client-side "Hold Slot" button (disabled until auth). The held flow: agent selects a slot, hits "Hold", server sets status to `held` with `held_by` and `held_until` fields, slot is temporarily reserved.

**Key Context:**
- The `held` status already exists in the appointment status ENUM (added in Phase 6.1)
- Security stub pattern (`csrfProtection`, `checkOwnership`) already exists in `server/src/middlewares/security.ts`
- The `_requireAuth` stub exists but is unexported — we'll create a new exported `requireAuth` stub for these routes

---

## Tasks

### Task 6.2.1.1: Database Migration — Add held_by and held_until columns

**Status:** Not Started

**Description:** Create a Sequelize migration to add `held_by` (FK → users, nullable) and `held_until` (TIMESTAMPTZ, nullable) columns to the appointments table. Update the Appointment model to include these fields.

**Files to modify/create:**
- `server/src/db/migrations/YYYYMMDD_HHMMSS_add_held_columns_to_appointments.mjs` (new)
- `server/src/db/models/booking/appointment.ts` (modify — add held_by, held_until fields)

**Acceptance criteria:**
- Migration creates both columns with correct types and FK constraint
- Migration `down` removes the columns
- Appointment model includes `heldBy` and `heldUntil` fields with correct types
- `heldBy` has FK association to User model

---

### Task 6.2.1.2: Server Hold Logic — PATCH-based status transitions

**Status:** Complete ✅

**Description:** Add hold/release logic to the existing appointment CRUD router via `sanitizeInput`. When a PATCH sets `status: 'held'`, the server computes `heldUntil` from an optional `holdDurationMinutes` field (default 15 min, max 60 min). When status transitions away from `'held'`, hold metadata (`heldBy`, `heldUntil`) is automatically cleared. Also exported `requireAuth` stub from security middleware for Feature 7 enactment.

**Architectural decision:** Hold/release uses the existing `PATCH /appointments/:id` endpoint rather than dedicated `POST /hold` and `POST /release` routes. Rationale: `held` is just another appointment status (like `confirmed`, `quoted`, etc.), so it belongs in the same CRUD flow. The server-computed `heldUntil` field is handled in `sanitizeInput`, which strips the non-column `holdDurationMinutes` and injects the computed `heldUntil` timestamp before the DB update.

**Files modified:**
- `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (modify — hold logic in `sanitizeInput`)
- `server/src/middlewares/security.ts` (modify — export `requireAuth` stub with ENACTMENT markers)

**Acceptance criteria:**
- `PATCH /api/v1/internal/appointments/:id` with `{ status: 'held', holdDurationMinutes: 15 }` — sets status, computes `heldUntil`, sets `heldBy`
- `PATCH /api/v1/internal/appointments/:id` with `{ status: 'started' }` — clears `heldBy` and `heldUntil` automatically
- `holdDurationMinutes` validated (1–60 range, default 15) and stripped from DB payload
- `requireAuth` stub exported with ENACTMENT(Feature 7) markers
- No separate hold router needed — hold is a status transition, not a distinct resource

---

### Task 6.2.1.3: Client UI — Hold Slot Button (disabled)

**Status:** Not Started

**Description:** Add a "Hold Slot" button to the availability step or appointment management UI. The button is visually present but disabled with a tooltip explaining that authentication is required. This establishes the UI placement for Feature 7 enactment.

**Files to modify/create:**
- Client availability/appointment component (modify — add Hold button)
- Client API service (modify — add hold helper that PATCHes `{ status: 'held', holdDurationMinutes }` and release helper that PATCHes `{ status: 'started' }`)

**Acceptance criteria:**
- "Hold Slot" button visible in the appropriate UI location
- Button is disabled with tooltip "Hold requires authentication (Feature 7)"
- API service functions for hold/release use existing PATCH endpoint (no dedicated hold routes)
- Hold helper sends `{ status: 'held', holdDurationMinutes }`, release sends `{ status: 'started' }`

---

### Task 6.2.1.4: Documentation — Enactment requirements for Feature 7

**Status:** Not Started

**Description:** Document what Feature 7 must enact for the held status feature. Update SECURITY_STUBS.md and the feature handoff with clear enactment requirements.

**Files to modify/create:**
- `server/docs/SECURITY_STUBS.md` (modify — add held status stub documentation)
- `.project-manager/features/appointment-workflow/feature-appointment-workflow-handoff.md` (modify — add enactment notes)

**Acceptance criteria:**
- SECURITY_STUBS.md documents the `requireAuth` stub and its planned behavior
- Handoff doc lists exact enactment steps for Feature 7
- Clear mapping: stub → real implementation for each auth check

---

---

## Dependencies

- Phase 6.1 complete (appointment status ENUM includes `held`)
- Existing security stub pattern in `server/src/middlewares/security.ts`
- Existing appointment model and routes

---

## Success Criteria

- [ ] All 4 tasks completed
- [ ] Migration runs successfully (up and down)
- [ ] Hold/release routes work via API (e.g. Thunder Client or curl)
- [ ] Client button exists and is properly disabled
- [ ] Enactment documentation complete
- [ ] Linting passes
- [ ] App starts without errors
