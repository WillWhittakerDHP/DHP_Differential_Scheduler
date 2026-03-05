## Phase intent (goals and context)

# Phase 6.8 Guide: Admin Force-Create & Constraint Overrides

**Purpose:** Phase-level guide for planning and tracking the admin force-create and constraint override workflow

**Tier:** Phase (Tier 1 - High-Level)

## Quick Start

- **Scope:** Reschedule flow and override records — pass `allowedExceptions` and `appointmentId` to availability when rescheduling an overridden appointment; show a distinct slot indicator for override-allowed slots; create a new ConstraintOverride for the new slot on reschedule confirm.
- **Server:** Computed availability accepts `allowedExceptions` and verifies against stored override (Session 6.8.2). On PATCH appointment (reschedule), if the appointment had an existing ConstraintOverride and the slot changed, a new ConstraintOverride is created for the new slot.
- **Client:** Reschedule availability request includes `allowedExceptions` and `appointmentId` when the appointment has an override (Task 6.8.4.1). Reschedule submit is standard PATCH with new slot; server derives new override from existing override.

## Tasks

- **Task 6.8.4.1:** Reschedule availability — pass `allowedExceptions` and `appointmentId`; distinct slot indicator in UI.
- **Task 6.8.4.2:** New override on reschedule — server creates ConstraintOverride for new slot in `afterUpdate`; client uses existing PATCH with new slot.

## Session Workflow

1. Load reschedule context (appointment with override if any).
2. Fetch computed availability with `allowedExceptions` and `appointmentId` when appointment has an override.
3. User selects new slot; UI may show distinct indicator for override-allowed slots.
4. On confirm, client PATCHes appointment with new `selectedDate` / `selectedTimeSlots`.
5. Server updates appointment; `createConstraintOverrideOnRescheduleIfNeeded(record)` creates a new ConstraintOverride for the new slot when one existed and slot changed.

## Session intent from phase guide

- [ ] ### Session 6.8.4: ** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule

**Description:** ** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule

**Tasks:**
1. Add `constraint_overrides` table and model; implement `computeViolationsForSlot()` and force-create route with auth/role checks. 2. Add `relaxConstraintsForExceptions()` and extend availability pipeline with `allowedExceptions` and server-side override verification. 3. Build client composable and dialog (violation preview, reason, confirm); add admin-only Force Schedule entry point. 4. Wire reschedule flow to pass override violations to availability and create new override records on reschedule.

- [x] #### Task 6.8.4.1: ** ** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule

**Goal:** ** ** Reschedule flow and override records — pass allowedExceptions, distinct slot indicator, new override on reschedule

**Files:**
(See tierUp guide and context above.)

**Approach:** See tierUp scope above.

**Checkpoint:** Verify per tierUp success criteria. [Fill in]
**Files:**
- [Files to work with]
**Approach:** [Fill in]
**Checkpoint:** [What needs to be verified]

- [x] #### Task 6.8.4.2: New override on reschedule — server creates ConstraintOverride for new slot; client wires reschedule submit

**Goal:** When reschedule moves an appointment that has an override to a new slot, create a new ConstraintOverride record for the new slot (same overriddenViolations or from request). Client wires reschedule submit so server has the data it needs.

**Files:** Server: reschedule endpoint or update flow (e.g. `server/src/routes/internal/appointments/`). Client: reschedule submit/API call.

**Approach:** Server: on reschedule of an overridden appointment, create new ConstraintOverride for the new slot. Client: ensure reschedule API is called with any data needed for the server to create the new override.

**Checkpoint:** On reschedule confirm of an overridden appointment, a new override record is created for the new slot; audit trail preserved.

<!-- end excerpt session -->