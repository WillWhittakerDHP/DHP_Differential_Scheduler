# Session 6.2.2 Guide: Admin Override Stub

**Phase:** 6.2 — Held & Override Stubs
**Session:** 6.2.2 — Admin Override Stub
**Status:** Complete
**Branch:** `appointment-workflow-phase-6.2-session-6.2.2`

---

## Session Overview

Admin constraint override logic via the existing appointment PATCH endpoint, plus client-side "Override" action in the admin panel. This session prepares the structure that Phase 6.8 will expand into the full force-create and constraint override system.

The override flow: admin selects an appointment → clicks "Override Constraints" → client PATCHes `{ overrideConstraints: { capacity: true, ... } }` → server validates constraint keys in `sanitizeInput` and stores in `override_constraints` JSONB column. This enables an admin to bypass specific slot computation constraints (capacity, buffer, blackout) when scheduling — once auth is enacted in Feature 7.

**Key Context:**
- Session 6.2.1 (Held Status Stub) established the PATCH-based stub pattern: `sanitizeInput` handles computed fields, non-column stripping, and status-driven metadata
- Security stubs (`requireAuth`, `csrfProtection`, `checkOwnership`) exist in `server/src/middlewares/security.ts`
- The `requireRole` stub follows the same pattern — functional middleware that calls `next()`, with ENACTMENT markers for Feature 7
- Phase 6.8 (Admin Force-Create & Constraint Overrides) builds the complete implementation on top of this stub foundation

---

## Tasks

### Task 6.2.2.1: Database Migration — Add override_constraints column

**Status:** Not Started

**Description:** Create a Sequelize migration to add `override_constraints` (JSONB, nullable) column to the appointments table. Update the Appointment model to include this field with its TypeScript type.

**Files to modify/create:**
- `server/src/db/migrations/YYYYMMDD_HHMMSS_add_override_constraints_to_appointments.mjs` (new)
- `server/src/db/models/booking/appointment.ts` (modify — add overrideConstraints field)

**Acceptance criteria:**
- Migration creates `override_constraints` JSONB column (nullable, default null)
- Migration `down` removes the column
- Appointment model includes `overrideConstraints` field with type `Record<string, boolean> | null`
- Column maps to `override_constraints` in the database (snake_case)

---

### Task 6.2.2.2: Server Override Logic — sanitizeInput constraint handling

**Status:** Not Started

**Description:** Add override logic to `sanitizeInput` in the existing appointment CRUD router. When `overrideConstraints` is present in the PATCH body, validate the constraint keys against an allowed set and store the validated object. Strip any unknown keys. The allowed constraint keys match what the slot computation service checks: `capacity`, `buffer`, `blackout`, `businessHours`.

**Files to modify/create:**
- `server/src/routes/internal/appointments/appointmentCrudRouter.ts` (modify — add override handling in `sanitizeInput`)
- `server/src/routes/internal/appointments/appointmentConstants.ts` (modify — add ALLOWED_OVERRIDE_CONSTRAINTS constant)

**Acceptance criteria:**
- `PATCH /api/v1/internal/appointments/:id` with `{ overrideConstraints: { capacity: true, buffer: true } }` stores validated JSONB
- Unknown constraint keys are stripped (only allowed keys pass through)
- `overrideConstraints: null` or `overrideConstraints: {}` clears the field
- Invalid values (non-boolean) are rejected or coerced
- `sanitizeInput` strips `overrideConstraints` from the spread and assigns the validated version to `appointmentFields.overrideConstraints`

---

### Task 6.2.2.3: Security Middleware — Export requireRole stub

**Status:** Not Started

**Description:** Export a `requireRole` stub from security middleware for Feature 7 enactment. The stub follows the existing pattern: functional middleware that calls `next()` but skips role verification. Includes ENACTMENT markers documenting what Feature 7 must implement.

**Files to modify:**
- `server/src/middlewares/security.ts` (modify — add `requireRole` stub)
- `server/src/types/express.d.ts` (modify — ensure `req.user` type includes `role` if not already)

**Acceptance criteria:**
- `requireRole(...roles)` exported from `security.ts`
- Stub calls `next()` without checking roles
- ENACTMENT(Feature 7) markers document planned behavior
- TypeScript types support role checking when auth is enacted
- Follows same pattern as `requireAuth` and `checkOwnership` stubs

---

### Task 6.2.2.4: Client UI — Override Constraints Button (disabled)

**Status:** Not Started

**Description:** Add an "Override Constraints" button to the admin appointment view. The button is visually present but disabled with a tooltip explaining that admin authentication is required. This establishes the UI placement for Feature 7 enactment.

**Files to modify/create:**
- Client admin appointment component (modify — add Override button)
- Client API service or composable (modify — add override helper that PATCHes `{ overrideConstraints }`)

**Acceptance criteria:**
- "Override Constraints" button visible in admin appointment management area
- Button is disabled with tooltip "Override requires admin authentication (Feature 7)"
- API service/composable function for applying overrides uses existing PATCH endpoint
- Override helper sends `{ overrideConstraints: { [key]: boolean } }` via PATCH

---

### Task 6.2.2.5: Documentation — Enactment requirements and Phase 6.8 relationship

**Status:** Not Started

**Description:** Document enactment requirements for Feature 7 and the relationship between this stub and Phase 6.8's full implementation. Update SECURITY_STUBS.md with the `requireRole` stub documentation and the override constraint mapping.

**Files to modify:**
- `server/docs/SECURITY_STUBS.md` (modify — add requireRole stub and override constraint docs)
- `.project-manager/features/appointment-workflow/feature-appointment-workflow-handoff.md` (modify — add override enactment notes)

**Acceptance criteria:**
- SECURITY_STUBS.md documents `requireRole` stub and its planned behavior
- SECURITY_STUBS.md includes override constraints in the stub → real mapping table
- Handoff doc lists enactment steps for Feature 7 (override-specific)
- Relationship between Phase 6.2 stub and Phase 6.8 full implementation is documented
- Clear mapping: stub → real implementation for each auth/role check

---

---

## Dependencies

- Session 6.2.1 complete (held status stub established the PATCH-based pattern)
- Existing security stub pattern in `server/src/middlewares/security.ts`
- Existing appointment model and CRUD routes
- Slot computation service constraint keys (capacity, buffer, blackout, businessHours)

---

## Success Criteria

- [ ] All 5 tasks completed
- [ ] Migration runs successfully (up and down)
- [ ] Override via PATCH works end-to-end (with stub auth)
- [ ] Client button exists and is properly disabled
- [ ] requireRole stub exported and documented
- [ ] Enactment documentation complete (SECURITY_STUBS.md + handoff)
- [ ] Linting passes
- [ ] App starts without errors
