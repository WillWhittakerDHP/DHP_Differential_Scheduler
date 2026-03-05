# Session 6.8.2 Guide: Constraint relaxation & availability pipeline — relaxConstraintsForExceptions, allowedExceptions, override verification

**Purpose:** Session-level guide with task breakdown for override-aware rescheduling (server-side relaxation and verification).

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

**Session ID:** 6.8.2  
**Session Name:** Constraint relaxation & availability pipeline — relaxConstraintsForExceptions, allowedExceptions, override verification  
**Description:** Add `relaxConstraintsForExceptions()`, extend availability request with `allowedExceptions` and `reschedulingAppointmentId`, and verify requested exception keys against the appointment's stored ConstraintOverride before relaxing constraints for slot computation.

**Status:** In Progress

---

## Tasks

- [x] #### Task 6.8.2.1: relaxConstraintsForExceptions and allowedExceptions types

**Goal:** Add `relaxConstraintsForExceptions(constraints, allowedExceptions)` and shared types for `allowedExceptions` so the availability pipeline can accept exception keys and relax matching constraints for reschedule.

**Files:**
- **Server:** `server/src/services/slotComputationService.ts` (or shared constraint utils); constraint types in `shared/types/availabilityTypes.ts` if needed.
- **Shared/types:** Availability request type (e.g. in shared or server) to include optional `allowedExceptions: string[]`.

**Approach:**
1. Implement `relaxConstraintsForExceptions(constraints, allowedExceptions)` that returns a copy of constraints with any constraint whose violation key is in `allowedExceptions` set to `enforcement: 'off'`.
2. Add or extend the computed-availability request type to include optional `allowedExceptions: string[]` (and optional `reschedulingAppointmentId` if not already present).

**Checkpoint:**
- `relaxConstraintsForExceptions()` exists and relaxes only constraints whose violation keys are in `allowedExceptions`.
- Availability request type includes optional `allowedExceptions`.

---

- [x] #### Task 6.8.2.2: Availability pipeline allowedExceptions and override verification

**Goal:** Extend the computed-availability pipeline to accept `allowedExceptions` and `reschedulingAppointmentId`, verify requested keys against the appointment's stored ConstraintOverride, and apply constraint relaxation before slot computation.

**Files:**
- **Server:** `server/src/services/computedAvailabilityService.ts`; availability route/request handling (e.g. `server/src/routes/internal/availabilityRouter.ts`); `server/src/db/models/booking/constraint_override.ts` / ConstraintOverride for loading override by appointment.

**Approach:**
1. In `computeAvailabilityData()`, accept optional `allowedExceptions` and `reschedulingAppointmentId` from the request.
2. When both are present, load the ConstraintOverride for that appointment (by appointment id); verify that every key in `allowedExceptions` is in the override's `overriddenViolations`.
3. If valid, call `relaxConstraintsForExceptions()` on the extracted constraints and use the relaxed constraints for slot computation; if invalid, return an error or exclude relaxation.
4. Ensure response or errors expose verification outcome as needed for client.

**Checkpoint:**
- Availability pipeline accepts `allowedExceptions` and `reschedulingAppointmentId`.
- Server verifies keys against stored override; valid request produces slots with those constraints relaxed; invalid keys are rejected or handled explicitly.

---

## Reference

- **Phase guide:** `.project-manager/features/appointment-workflow/phases/phase-6.8-guide.md`
- **Session planning:** `.project-manager/features/appointment-workflow/sessions/session-6.8.2-planning.md`