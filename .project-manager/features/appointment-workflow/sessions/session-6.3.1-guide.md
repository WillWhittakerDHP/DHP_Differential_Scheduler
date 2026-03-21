# Session 6.3.1 Guide: Confirmation Data Model & Transition Guards

**Phase:** 6.3 — Confirmation Routine
**Session:** 6.3.1 — Confirmation Data Model & Transition Guards
**Status:** Complete
**Branch:** `appointment-workflow-phase-6.3-session-6.3.1`

---

## Session Overview

Add confirmation timestamp and actor columns to the appointments table, update the Sequelize model and client types, and implement status transition validation in `sanitizeInput`. After this session, status changes are guarded (only valid transitions allowed) and confirmation metadata is automatically populated.

**Key Context:**
- The 8-status appointment ENUM already exists (`started`, `held`, `rescheduling`, `quoted`, `submitted`, `confirmed`, `cancelled`, `deleted`)
- `sanitizeInput` in the CRUD router already handles `held` status transitions (computes `heldUntil`)
- No transition validation exists — any status can be set to any other status
- No `submitted_at`, `confirmed_at`, or `confirmed_by` fields exist on the appointment model
- `confirmed_by` will be `null` until Feature 7 auth provides `req.user` (same stub pattern as `held_by`)

---

## Tasks

### Task 6.3.1.1: Database Migration — Add confirmation columns

**Status:** Complete

**Description:** Create a Sequelize migration to add `submitted_at` (TIMESTAMPTZ, nullable), `confirmed_at` (TIMESTAMPTZ, nullable), and `confirmed_by` (UUID FK → users, nullable) columns to the appointments table.

**Files to modify/create:**
- `server/src/db/migrations/YYYYMMDD_HHMMSS_add_confirmation_columns_to_appointments.mjs` (new)

**Approach:**
- Follow the migration pattern from Phase 6.2 (`add_held_columns_to_appointments`)
- `submitted_at` — TIMESTAMPTZ, nullable, no default (populated by `sanitizeInput` on status transition)
- `confirmed_at` — TIMESTAMPTZ, nullable, no default (populated by `sanitizeInput` on status transition)
- `confirmed_by` — UUID, nullable, FK → users(id) ON DELETE SET NULL (who confirmed — populated by auth in Feature 7)
- Migration `down` removes all three columns

**Checkpoint:**
- Migration runs successfully (`npm run migrate` in server/)
- Migration undo works (`npm run migrate:undo`)
- Columns visible in database

---

### Task 6.3.1.2: Update Appointment Model — New fields and associations

**Status:** Complete

**Description:** Add `submittedAt`, `confirmedAt`, and `confirmedBy` fields to the Appointment Sequelize model. Add the `confirmedBy` → User association.

**Files to modify:**
- `server/src/db/models/booking/appointment.ts` (modify — add fields and association)

**Approach:**
- Add `submittedAt` field: `DataTypes.DATE`, `allowNull: true`, `field: 'submitted_at'`
- Add `confirmedAt` field: `DataTypes.DATE`, `allowNull: true`, `field: 'confirmed_at'`
- Add `confirmedBy` field: `DataTypes.UUID`, `allowNull: true`, `field: 'confirmed_by'`, references users(id)
- Add association: `Appointment.belongsTo(User, { as: 'confirmer', foreignKey: 'confirmedBy' })` — mirrors the `heldBy` pattern
- Follow the existing `heldBy`/`heldUntil` pattern for field definitions

**Checkpoint:**
- Model compiles without type errors
- Server starts successfully
- New fields accessible via API responses

---

### Task 6.3.1.3: Define VALID_STATUS_TRANSITIONS map

**Status:** Complete

**Description:** Create a `VALID_STATUS_TRANSITIONS` constant in `appointmentConstants.ts` that defines which status transitions are allowed. This is a state machine map — each status maps to an array of valid next-statuses.

**Files to modify:**
- `server/src/routes/internal/appointments/appointmentConstants.ts` (modify — add transitions map)

**Approach:**
- Define `VALID_STATUS_TRANSITIONS` as `Record<AppointmentStatus, AppointmentStatus[]>`
- Reference the transition table from the phase guide:
  - `started` → `quoted`, `submitted`, `cancelled`, `deleted`
  - `held` → `started`, `submitted`, `cancelled`
  - `rescheduling` → `submitted`, `cancelled`
  - `quoted` → `submitted`, `cancelled`, `deleted`
  - `submitted` → `confirmed`, `rescheduling`, `cancelled`
  - `confirmed` → `rescheduling`, `cancelled`
  - `cancelled` → `deleted`
  - `deleted` → (empty array — terminal state)
- Export a helper function `isValidTransition(fromStatus, toStatus): boolean`
- Import the status type from `client/src/types/appointmentStatus.ts` or define locally

**Checkpoint:**
- Constants compile without errors
- `isValidTransition` returns correct results for valid and invalid transitions

---

### Task 6.3.1.4: Add transition validation in sanitizeInput

**Status:** Complete

**Description:** Modify `sanitizeInput` in the appointment CRUD router to validate status transitions. When a PATCH includes a status change, check the current appointment's status against `VALID_STATUS_TRANSITIONS`. Reject invalid transitions with a descriptive 400 error. Also auto-populate `submitted_at` and `confirmed_at` timestamps on their respective transitions.

**Files to modify:**
- `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (modify — transition validation + timestamp auto-population)

**Approach:**
- In `sanitizeInput`, when `status` is present in the body:
  1. Fetch the current appointment to get its current status (the CRUD router's `beforeUpdate` already provides the existing record)
  2. Use `isValidTransition(currentStatus, newStatus)` to validate
  3. If invalid, throw/return a 400 error: `"Invalid status transition: ${currentStatus} → ${newStatus}"`
  4. If transitioning to `submitted`, set `appointmentFields.submittedAt = new Date()`
  5. If transitioning to `confirmed`, set `appointmentFields.confirmedAt = new Date()`
  6. If transitioning to `confirmed`, set `appointmentFields.confirmedBy = null` (populated by Feature 7 when auth exists)
- Preserve existing `held` logic in `sanitizeInput`

**Checkpoint:**
- Invalid transitions return 400 error (e.g., PATCH `cancelled` → `confirmed`)
- Valid transitions succeed (e.g., PATCH `submitted` → `confirmed`)
- `submitted_at` auto-populated when status becomes `submitted`
- `confirmed_at` auto-populated when status becomes `confirmed`
- Existing `held` logic still works

---

### Task 6.3.1.5: Update client-side types

**Status:** Complete

**Description:** Update the client-side appointment types to include the new fields and export the valid transitions map for client-side use (e.g., filtering admin status dropdowns in Session 6.3.2).

**Files to modify:**
- `client/src/types/appointment.ts` (modify — add new fields)
- `client/src/types/appointmentStatus.ts` (modify — add transitions map if shared)

**Approach:**
- Add `submittedAt?: string | null`, `confirmedAt?: string | null`, `confirmedBy?: string | null` to the appointment interface
- Add `VALID_STATUS_TRANSITIONS` constant to `appointmentStatus.ts` (mirrors server constant — single source of truth on server, replicated on client for UI filtering)
- Add `getValidNextStatuses(currentStatus: AppointmentStatus): AppointmentStatus[]` helper

**Checkpoint:**
- Client types compile without errors
- New fields accessible in appointment objects
- `getValidNextStatuses` returns correct values

---

### Task 6.3.1.6: Display confirmation metadata in admin table

**Status:** Complete

**Description:** Update the admin appointments table to show `confirmed_at` and `submitted_at` timestamps. These columns give admins visibility into when appointments were submitted and confirmed.

**Files to modify:**
- `client/src/views/admin/tabs/components/AppointmentsTable.vue` (modify — add columns)

**Approach:**
- Add `Submitted` column showing `submittedAt` formatted as readable date/time
- Add `Confirmed` column showing `confirmedAt` formatted as readable date/time
- Use existing date formatting patterns in the admin table
- Show "—" or empty for null values
- Consider making these columns toggleable or initially hidden if table is already wide

**Checkpoint:**
- Admin table shows submitted/confirmed timestamps
- Null values display gracefully
- Table remains usable (not too wide)

---

---

## Dependencies

- Phase 6.1 complete (appointment status ENUM, model, routes)
- Phase 6.2 complete (held/override stubs — shows the migration and sanitizeInput patterns)
- Existing `appointmentCrudRouter.ts` sanitizeInput function
- Existing `appointmentConstants.ts` for constants
- Existing `appointment.ts` model for field definitions

---

## Success Criteria

- [x] All 6 tasks completed
- [x] Migration runs and reverts cleanly
- [x] Status transition validation rejects invalid transitions (400 error)
- [x] Valid transitions succeed with auto-populated timestamps
- [x] Client types include new fields
- [x] Admin table displays confirmation timestamps
- [x] Linting passes (pre-existing issues only)
- [x] App starts without errors
