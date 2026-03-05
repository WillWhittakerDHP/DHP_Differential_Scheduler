# Plan: task 6.8.2.2 — Availability pipeline allowedExceptions and override verification

## Contract
- **Tier:** task | **ID:** 6.8.2.2
- **Scope:** Wire allowedExceptions and override verification into computed-availability pipeline (server only)
- **Governance:** Clean — no violations detected

## Where we left off
Task 6.8.2.1 completed: relaxConstraintsForExceptions in shared utils; ComputedAvailabilityRequest has allowedExceptions.

## Goal
Extend the computed-availability pipeline to accept `allowedExceptions` and `reschedulingAppointmentId` (or `appointmentId`) from the request, verify every requested key against the appointment's stored ConstraintOverride, and apply `relaxConstraintsForExceptions()` before slot computation when valid; reject or skip relaxation when invalid.

## Files
- **Server:** `server/src/services/computedAvailabilityService.ts` (computeAvailabilityData: read request, load override, verify, relax constraints); `server/src/db/models/booking/constraint_override.ts` / ConstraintOverride (load by appointment id); `shared/utils/constraintUtils.js` (relaxConstraintsForExceptions).
- **Route:** `server/src/routes/internal/availabilityRouter.ts` or equivalent — ensure request body passes allowedExceptions and appointmentId/reschedulingAppointmentId to the service.

## Approach
1. In `computeAvailabilityData()`, read optional `allowedExceptions` and `appointmentId` (or `reschedulingAppointmentId`) from the request. 2. When both allowedExceptions and appointment id are present, load ConstraintOverride for that appointment (e.g. findOne where appointmentId). 3. Verify that every key in `allowedExceptions` is in the override's `overriddenViolations`; if any key is missing, treat as invalid (do not relax). 4. If valid, call `relaxConstraintsForExceptions(extractedConstraints, allowedExceptions)` and use the relaxed constraints for the rest of slot computation; if invalid, use unrelaxed constraints. 5. Optionally expose verification outcome in response metadata (e.g. allowedExceptionsApplied: boolean) for client.

## Checkpoint
- Availability pipeline accepts `allowedExceptions` and appointment id; when both present, server loads override and verifies keys; valid request uses relaxed constraints for slot computation; invalid request uses unrelaxed constraints (no relaxation).
- Response or metadata exposes verification outcome as needed for client.

## How we build the tierDown to achieve them
- **Session 6.8.2:** Constraint relaxation & availability pipeline
- **Task 6.8.2.1:** relaxConstraintsForExceptions and allowedExceptions types
- **Task 6.8.2.2:** Availability pipeline allowedExceptions and override verification

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.8.2-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.8.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
