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

**Reschedule flow:** When rescheduling an appointment that has an override, client passes `allowedExceptions` to availability; server relaxes matching constraints for that request so the rescheduled slot is not blocked by the same constraints the original override allowed; new override record created for the rescheduled appointment.

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

## Phase Objectives

- Create `constraint_overrides` database table and Sequelize model
- Implement `computeViolationsForSlot()` for full violation collection without short-circuit
- Create `POST /api/v1/internal/appointments/force-create` route with auth and role checks
- Create `relaxConstraintsForExceptions()` for reschedule constraint relaxation
- Extend availability pipeline to accept `allowedExceptions` for override-aware rescheduling
- Build admin UI: force-create confirmation dialog, violation preview, "Force Schedule" button
- Integrate reschedule flow with override records

---

## Sessions Breakdown

- [ ] ### Session 6.8.1: Database & Server Infrastructure
**Description:** Create the `constraint_overrides` migration and model, implement `computeViolationsForSlot()` in the slot computation service, and create the force-create route with validation.
**Tasks:**
- Create `constraint_overrides` migration (columns per data model above, index on appointment_id)
- Create `ConstraintOverride` Sequelize model; associations to Appointment and User (as authorizedBy)
- Create `computeViolationsForSlot()` in slotComputationService — re-use checkRange/Overlap/Capacity, collect all violations, return `ForceCreateViolationReport`
- Create `POST /api/v1/internal/appointments/force-create` route (requireAuth, requireRole('admin')); call computeViolationsForSlot, create appointment + ConstraintOverride
- Create force-create validator (forceSlot times, reason max 500 chars, normal appointment fields)
- Mount force-create router in appointmentRouter

**Learning Goals:**
- Understand how to collect all violations without short-circuiting (contrast with normal slot filtering)
- Practice migration design with array columns (TEXT[])
- Learn route-level auth and role gating patterns

- [ ] ### Session 6.8.2: Reschedule Constraint Relaxation
**Description:** Create the constraint relaxation utility for reschedule flows and extend the availability pipeline to accept override exceptions.
**Tasks:**
- Create `relaxConstraintsForExceptions()` utility (pure function, clone constraints with enforcement 'off')
- Extend computeAvailabilityData() and availabilityRouter to accept optional `allowedExceptions` when appointmentId provided
- Server-side auth: verify appointmentId exists, has ConstraintOverride, requested allowedExceptions ⊆ overridden_violations

**Learning Goals:**
- Understand pure function constraint transformation (clone with modified enforcement)
- Practice server-side authorization verification (subset checking)
- Learn how to extend existing service contracts without breaking callers

- [ ] ### Session 6.8.3: Admin UI — Force-Create
**Description:** Build the client-side composable and dialog for the force-create flow, plus the admin UI integration.
**Tasks:**
- Create useForceCreateAppointment composable (violation preview, confirmation, reason)
- Create force-create confirmation dialog (violations by category, human-readable labels, explicit confirm, optional reason)
- Add "Force Schedule" button to admin appointments UI (admin-only; blocked slots selectable in distinct color)

**Learning Goals:**
- Understand confirmation dialog UX patterns for destructive/override actions
- Practice composable design for multi-step admin workflows
- Learn how to present violation data in a user-friendly format

- [ ] ### Session 6.8.4: Reschedule UI & Documentation
**Description:** Wire the reschedule flow to use override records, showing override-allowed slots with distinct indicators, and create new override records for rescheduled appointments.
**Tasks:**
- Reschedule flow: fetch override for appointment, pass allowedExceptions to availability; show override-allowed slots with distinct indicator
- On reschedule complete, create new ConstraintOverride record for the new slot
- Update phase documentation and feature handoff

**Learning Goals:**
- Understand how override context flows from stored data through availability to UI
- Practice visual differentiation for special-case slots
- Learn end-to-end data flow across stored records, API parameters, and UI rendering

---

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
- BETA_LAUNCH_CHECKLIST: Phase 8A (force-create detail)
- Slot Computation Service: `server/src/services/slotComputationService.ts`
- Computed Availability Service: `server/src/services/computedAvailabilityService.ts`
- Appointment CRUD Router: `server/src/routes/internal/appointments/appointmentCrudRouter.ts`
