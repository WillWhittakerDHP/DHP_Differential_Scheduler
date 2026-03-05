# Phase 6.8 Guide: Admin Force-Create & Constraint Overrides

**Purpose:** Phase-level guide for planning and tracking the admin force-create and constraint override workflow

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.8
**Phase Name:** Admin Force-Create & Constraint Overrides
**Description:** Allow admins to force-create an appointment on any date/time — bypassing all availability blockers — and persist which constraints were overridden so the system can honor those exceptions during a future reschedule.

**Duration:** 3–4 sessions
**Status:** Not Started
**Dependency:** Feature 7 (Authentication) must be complete — force-create requires `req.user` to record who authorized the override.

---

## Context: What Already Exists

**Slot Computation Service:** `slotComputationService.ts` already produces violation keys (e.g. `range.leadTime`, `overlap.event.direct`, `capacity.daily`) when checking slot availability. The constraint checking functions (`checkRange`, `checkOverlap`, `checkCapacity`) are the building blocks for violation collection.

**Computed Availability Service:** `computedAvailabilityService.ts` orchestrates the full slot computation pipeline — fetching settings, extracting constraints, fetching calendar events, calculating drive times, pre-computing capacity, and generating slots.

**Appointment CRUD:** Full CRUD via `appointmentCrudRouter.ts` with status workflow (Phase 6.1), held/override stubs (Phase 6.2), and transition guards (Phase 6.3).

**Status Transition Validation:** `VALID_STATUS_TRANSITIONS` map (Phase 6.3) guards all status changes. Force-created appointments will use existing transitions.

**Auth Stubs:** `requireAuth` and role-based access stubs exist in `server/src/middlewares/security.ts`. Feature 7 will replace these with real implementations.

---

## Architecture

**Force-create flow:** Admin picks a blocked slot → client calls `POST /api/v1/internal/appointments/force-create` → server runs slot computation for that time, collects ALL violations (no short-circuit), creates appointment and a `constraint_override` record (appointment_id, overridden_violations, authorized_by_id, reason, slot_start, slot_end).

**Reschedule flow:** When rescheduling an appointment that has an override, client passes `allowedExceptions` to availability; server relaxes matching constraints for that request so the rescheduled slot is not blocked by the same constraints the original override allowed; new override record created for the rescheduled appointment. **Phase 6.5** adds `reschedulingAppointmentId` so the current appointment’s calendar event (and its drive buffers) are excluded from overlap during reschedule; Phase 6.8’s `allowedExceptions` then relaxes **constraint types** (e.g. capacity, business hours) for appointments that were force-created. Both are used together when rescheduling an appointment that has overrides.

---

## Relation to Phase 6.5 (Rescheduling Flow)

Phase 6.5 defines the **rescheduling availability behavior** that every reschedule uses:

- **`reschedulingAppointmentId`:** Client passes it in the computed-availability request; server excludes that appointment’s calendar event from the **overlap** list used in slot computation (so its time and drive buffers do not block slots), while still returning the event in `calendarEvents` so it stays visible on the calendar.

Phase 6.8 adds **override-aware** behavior on top:

- **`allowedExceptions`:** When the rescheduled appointment has a `constraint_override` record, the client passes the override’s violation keys; the server relaxes those **constraint types** (e.g. `capacity.daily`, `range.leadTime`) for that request so the new slot is not blocked by the same constraints the original force-create allowed.

**Implementation order:** Implement Phase 6.5 first (event exclusion via `reschedulingAppointmentId` and original-inspection slot UI). Then Phase 6.8 extends the availability pipeline with `allowedExceptions` and override verification; reschedule UI can show override-allowed slots with a distinct indicator (Session 6.8.4).

---
## Data Model

**Table:** `constraint_overrides`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| appointment_id | FK → appointments | ON DELETE CASCADE |
| overridden_violations | TEXT[] | Array of violation key strings |
| authorized_by_id | FK → users | Who authorized the override |
| reason | TEXT nullable | Optional admin-provided reason |
| slot_start | TIMESTAMPTZ | — |
| slot_end | TIMESTAMPTZ | — |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |

Index on `appointment_id`.

---

## Integration with Existing System

`slotComputationService.ts` already produces violation keys. New additions:

- **`computeViolationsForSlot()`** — Runs all constraint checks without short-circuiting and returns `ForceCreateViolationReport`
- **`relaxConstraintsForExceptions(constraints, allowedExceptions)`** — Clones matching constraints with `enforcement: 'off'` for reschedule
- **`computeAvailabilityData()` extension** — Accepts optional `allowedExceptions` and verifies against stored override

---

## Violation Key Reference

| Category | Keys |
|----------|------|
| Range | `range.leadTime`, `range.dateRange` |
| Overlap | `overlap.event.direct`, `overlap.outOfOffice.direct`, `overlap.driveToCandidate.buffer:N`, `overlap.driveFromCandidate.buffer:N` |
| Capacity | `capacity.daily`, `capacity.calendarWeek`, `capacity.rollingWeek` |

---

## Admin entry (step 0 / pre-wizard)

For admins only, before or as step 0 of the wizard:

- **Choices:** Start new inspection | Edit quote | Reschedule
- **Dropdown (Edit quote / Reschedule):** Non-completed inspections (exclude `cancelled`, `deleted`); optionally filter by status for Edit quote vs Reschedule
- **Time-out:** Admin-configurable X days/weeks — only appointments where scheduling began within last X, or quote in quote status for last X. Setting location: Business Controls → Calendar or Confirmation & Holds
- **Columns:** Address, Client name, Agent name
- **API:** List appointments filtered by status, time-out window; post–Feature 7 by permission
- **Selection:** Sets wizard mode and `loadedAppointmentId`; wizard proceeds to step 3

**Implementation:** Session 6.8.6.

---

## Phase Objectives

- Create `constraint_overrides` database table and Sequelize model
- Implement `computeViolationsForSlot()` for full violation collection without short-circuit
- Create `POST /api/v1/internal/appointments/force-create` route with auth and role checks
- Create `relaxConstraintsForExceptions()` for reschedule constraint relaxation
- Extend availability pipeline to accept `allowedExceptions` for override-aware rescheduling
- Build admin UI: force-create confirmation dialog, violation preview, "Force Schedule" button
- Integrate reschedule flow with override records
- Add `agent_permissions` to block_instances (Session 6.8.5)
- Admin entry: step 0 or pre-wizard (Session 6.8.6)

---

## Sessions Breakdown

- [x] ### Session 6.8.1: Database & Server Infrastructure

**Description:** ** Database & Server Infrastructure — migration, model, computeViolationsForSlot, force-create route

**Tasks:**
1. Add `constraint_overrides` table and model; implement `computeViolationsForSlot()` and force-create route with auth/role checks. 2. Add `relaxConstraintsForExceptions()` and extend availability pipeline with `allowedExceptions` and server-side override verification. 3. Build client composable and dialog (violation preview, reason, confirm); add admin-only Force Schedule entry point. 4. Wire reschedule flow to pass override violations to availability and create new override records on reschedule.

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Override storage | Separate `constraint_overrides` table | Keeps appointment model clean; supports multiple overrides per appointment over time |
| Violation recording | Exact violation key strings | Matches keys already produced by slot computation; enables precise constraint relaxation |
| Reschedule exceptions | Server-side verification | Prevents client from relaxing constraints the override didn't authorize |
| Constraint relaxation | Clone with `enforcement: 'off'` | Non-destructive; original constraints unchanged for other requests |
| Admin UI | Show all slots (blocked = distinct color) | Lets admin see what they're overriding; explicit confirmation required |
| Reason field | Optional | Useful for audit trail but shouldn't block the workflow |

---

## Dependencies

**Prerequisites:**
- Phase 6.1 (Status Workflow & UI Enhancements) — Complete
- Phase 6.2 (Held & Override Stubs) — Complete
- Phase 6.3 (Confirmation Routine) — transition guards needed for force-created appointment status flow
- Feature 7 (Authentication) — `req.user` needed for `authorized_by_id`

**Downstream Impact:**
- Reschedule flow (Phase 6.5) will integrate with constraint relaxation
- Override records provide audit trail for admin actions

---

## Success Criteria

- [ ] All sessions completed
- [ ] `constraint_overrides` table created with proper schema and indexes
- [ ] `computeViolationsForSlot()` collects all violations without short-circuiting
- [ ] Force-create route creates appointment + override record in a transaction
- [ ] `relaxConstraintsForExceptions()` correctly clones constraints with relaxed enforcement
- [ ] Availability pipeline accepts `allowedExceptions` and verifies against stored overrides
- [ ] Admin "Force Schedule" button visible for blocked slots
- [ ] Force-create dialog shows violations with human-readable labels
- [ ] Reschedule flow respects override exceptions
- [ ] Block instances have `agent_permissions`; Force Schedule and Override visibility respect (user role, block.agentPermissions) (Session 6.8.5)
- [ ] Admin entry: Start new | Edit quote | Reschedule + dropdown; time-out setting; API; selection sets wizard mode and loadedAppointmentId (Session 6.8.6)
- [ ] Code quality checks passing
- [ ] Documentation updated
- [ ] Ready for next phase

---

## End of Phase Workflow

**CRITICAL: Prompt before completing phase**

After completing all sessions in a phase, **prompt the user** before running `/phase-end`:

```
## Ready to Complete Phase?

All sessions complete. Ready to run phase-completion workflow?

**This will:**
- Mark phase complete (update checkboxes and status)
- Update phase log with completion summary
- Update main handoff document
- Git commit/push

**Proceed with /phase-end?** (yes/no)
```

---

## Notes

- **Force-create is an admin power tool.** It's intentionally behind auth + role checks. The confirmation dialog with explicit violation display ensures admins understand what they're overriding.
- **Override records are immutable.** On reschedule, a new override record is created rather than modifying the existing one. This preserves the audit trail.
- **`authorized_by_id` will be `null` until Feature 7.** Same pattern as `confirmed_by` (Phase 6.3) and `held_by` (Phase 6.2) — the column and FK exist, population requires `req.user`.

---

## Related Documents

- Feature Guide: `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Feature Log: `.project-manager/features/appointment-workflow/feature-appointment-workflow-log.md`
- PROJECT_PLAN: `.project-manager/PROJECT_PLAN.md` (Feature 6, Phase 6.8)
- Phase 6.3 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.3-guide.md`
- Phase 6.5 Guide: `.project-manager/features/appointment-workflow/phases/phase-6.5-guide.md` (Rescheduling flow, `reschedulingAppointmentId`, original-inspection UI)
- LAUNCH_CHECKLIST: Phase 8A (force-create detail)
- Slot Computation Service: `server/src/services/slotComputationService.ts`
- Computed Availability Service: `server/src/services/computedAvailabilityService.ts`
- Appointment CRUD Router: `server/src/routes/internal/appointments/appointmentCrudRouter.ts`

- [x] ### Session 6.8.2: ** Constraint relaxation & availability pipeline — relaxConstraintsForExceptions, allowedExceptions, override verification

**Description:** ** Constraint relaxation & availability pipeline — relaxConstraintsForExceptions, allowedExceptions, override verification

**Tasks:**
1. Add `constraint_overrides` table and model; implement `computeViolationsForSlot()` and force-create route with auth/role checks. 2. Add `relaxConstraintsForExceptions()` and extend availability pipeline with `allowedExceptions` and server-side override verification. 3. Build client composable and dialog (violation preview, reason, confirm); add admin-only Force Schedule entry point. 4. Wire reschedule flow to pass override violations to availability and create new override records on reschedule.

- [x] ### Session 6.8.3: ** Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button

**Description:** ** Force-create composable and admin UI — useForceCreateAppointment, dialog, Force Schedule button

**Tasks:**
1. Add `constraint_overrides` table and model; implement `computeViolationsForSlot()` and force-create route with auth/role checks. 2. Add `relaxConstraintsForExceptions()` and extend availability pipeline with `allowedExceptions` and server-side override verification. 3. Build client composable and dialog (violation preview, reason, confirm); add admin-only Force Schedule entry point. 4. Wire reschedule flow to pass override violations to availability and create new override records on reschedule.

- [ ] ### Session 6.8.4: ** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule

**Description:** ** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule

**Tasks:**
1. Add `constraint_overrides` table and model; implement `computeViolationsForSlot()` and force-create route with auth/role checks. 2. Add `relaxConstraintsForExceptions()` and extend availability pipeline with `allowedExceptions` and server-side override verification. 3. Build client composable and dialog (violation preview, reason, confirm); add admin-only Force Schedule entry point. 4. Wire reschedule flow to pass override violations to availability and create new override records on reschedule.

- [ ] ### Session 6.8.5: Block-level agentPermissions

**Description:** Add `agent_permissions` (TernaryBoolean: `'true'`, `'false'`, `'override'`) to `block_instances`, same pattern as `differential`. Full stack: migration, model, versioning (if used), client types, transformer. Effective permission: state = (user role, block.agentPermissions); admin always allowed; agent when `'true'` or `'override'`; client when `'false'` or `'override'`. Update Force Schedule and Override visibility (from 6.8.3/6.8.4) to respect agentPermissions when user role is available (Feature 7).

**Tasks:**
1. Migration: add `agent_permissions` column, default `'false'` (same `ternary_boolean` ENUM as `differential`). 2. Model: add to Sequelize BlockInstance; versioning: add to instanceVersioning if block instances are versioned. 3. Client types and transformer: add to BookingBlockInstance / globalToBookingTransformer. 4. Update Force Schedule and Override visibility logic to respect (user role, block.agentPermissions).

- [ ] ### Session 6.8.6: Admin entry (step 0 / pre-wizard)

**Description:** For admins only, before or as step 0 of the wizard: choices Start new inspection | Edit quote | Reschedule. When Edit quote or Reschedule, show dropdown of non-completed inspections (exclude cancelled, deleted); filter by admin-configurable time-out (X days/weeks); dropdown columns Address, Client name, Agent name. Selection sets wizard mode and `loadedAppointmentId`; wizard proceeds to step 3. API: list appointments filtered by status, time-out window; post–Feature 7 by permission.

**Tasks:**
1. Admin setting for time-out (X days/weeks) in Business Controls → Calendar or Confirmation & Holds. 2. API endpoint for list appointments (filtered by status, time-out). 3. Dropdown UI with columns Address, Client name, Agent name; selection sets wizard mode and loadedAppointmentId, navigates to step 3.

