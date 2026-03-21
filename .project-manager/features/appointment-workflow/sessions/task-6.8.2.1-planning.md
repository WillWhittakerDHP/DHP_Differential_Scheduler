# Plan: task 6.8.2.1 — relaxConstraintsForExceptions and allowedExceptions types

## Contract
- **Tier:** task | **ID:** 6.8.2.1
- **Scope:** relaxConstraintsForExceptions and allowedExceptions types (server + shared types only)
- **Governance:** Clean — no violations detected

## Where we left off
No prior handoff for this task. Session 6.8.1 completed (migration, model, force-create route).

## Goal
Add `relaxConstraintsForExceptions(constraints, allowedExceptions)` and shared types for `allowedExceptions` so the availability pipeline can accept exception keys and relax matching constraints for reschedule. This task does not wire relaxation into the pipeline (that is 6.8.2.2).

## Files
- **Server:** `server/src/services/slotComputationService.ts` (or shared constraint utils) for `relaxConstraintsForExceptions`; constraint types in `shared/types/availabilityTypes.ts` if needed.
- **Shared/types:** Availability request type (e.g. `shared/types/availabilityTypes.ts` or where `ComputedAvailabilityRequest` lives) to include optional `allowedExceptions: string[]` and optional `reschedulingAppointmentId` if not already present.

## Approach
1. Implement `relaxConstraintsForExceptions(constraints, allowedExceptions)` that returns a copy of constraints with any constraint whose violation key is in `allowedExceptions` set to `enforcement: 'off'`. Use the same violation-key shape as slot constraint checkers (e.g. `range.leadTime`, `capacity.daily`). 2. Add or extend the computed-availability request type to include optional `allowedExceptions: string[]` and optional `reschedulingAppointmentId` (if not already in the request type from Phase 6.5 or elsewhere).

## Checkpoint
- `relaxConstraintsForExceptions()` exists and relaxes only constraints whose violation keys are in `allowedExceptions`.
- Availability request type includes optional `allowedExceptions` (and `reschedulingAppointmentId` if added here).

## How we build the tierDown to achieve them
- **Session 6.8.2:** Constraint relaxation & availability pipeline
- **Task 6.8.2.1:** relaxConstraintsForExceptions and allowedExceptions types
- **Task 6.8.2.2:** Availability pipeline allowedExceptions and override verification

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.8.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
