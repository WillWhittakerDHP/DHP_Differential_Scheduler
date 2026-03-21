# Plan: session 6.8.2 — ** ** Constraint relaxation & availability pipeline — relaxConstraintsForExceptions, allowedExceptions, override verification

## Contract
- **Tier:** session | **ID:** 6.8.2
- **Scope:** ** ** Constraint relaxation & availability pipeline — relaxConstraintsForExceptions, allowedExceptions, override verification
- **Governance:** 4 governance highlights — read reports before filling slots

## Where we left off
Completed Task - Begin Session 6.8.2

## Goal
Add constraint relaxation for override-aware rescheduling: implement `relaxConstraintsForExceptions()` to clone constraints with matching violation keys as `enforcement: 'off'`, extend the computed-availability pipeline to accept optional `allowedExceptions`, and verify requested exception keys against the rescheduling appointment’s stored `constraint_override` so only authorized violations are relaxed.

## Files
- **Server:** `server/src/services/slotComputationService.ts` (or shared constraint utils) for `relaxConstraintsForExceptions`; `server/src/services/computedAvailabilityService.ts` to accept `allowedExceptions` and apply relaxation; availability route/request types; `server/src/db/models/booking/constraint_override.ts` / ConstraintOverride for loading override by appointment.
- **Shared/types:** Request/response types for `allowedExceptions` (e.g. in availability request).
- **Docs:** Phase 6.8 guide, session handoff.

## Approach
1. Add `relaxConstraintsForExceptions(constraints, allowedExceptions)` that returns a copy of constraints with any matching violation keys set to `enforcement: 'off'`. 2. Extend computed-availability request type to include optional `allowedExceptions: string[]` and optional `reschedulingAppointmentId`. 3. In `computeAvailabilityData()`, when `allowedExceptions` and `reschedulingAppointmentId` are present, load the appointment’s ConstraintOverride and verify every key in `allowedExceptions` is in the override’s `overriddenViolations`; if valid, apply `relaxConstraintsForExceptions` before slot computation. 4. Ensure availability response exposes any verification failure or relaxed state as needed for client.

## Checkpoint
- `relaxConstraintsForExceptions()` relaxes only constraints whose violation keys are in `allowedExceptions`.
- Availability pipeline accepts `allowedExceptions` and `reschedulingAppointmentId`; when both present, server verifies keys against stored override and relaxes constraints only when valid.
- Reschedule request with valid `allowedExceptions` produces slots with those constraints relaxed.

## How we build the tierDown to achieve them
- **Task 6.8.2.1:** relaxConstraintsForExceptions and allowedExceptions types
- **Task 6.8.2.2:** Availability pipeline allowedExceptions and override verification
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.8-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.8.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
