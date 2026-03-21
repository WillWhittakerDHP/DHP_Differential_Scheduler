# Plan: task 6.8.1.2 — 6.8.1.2

## Contract
- **Tier:** task | **ID:** 6.8.1.2
- **Scope:** 6.8.1.2
- **Governance:** Clean — no violations detected

## Where we left off
No prior handoff for this task.

## Goal
Implement computeViolationsForSlot in the slot computation service and the POST force-create route with auth, validation, and transaction (appointment + ConstraintOverride).

## Files
- `server/src/services/slotComputationService.ts` — add computeViolationsForSlot().
- New force-create route and validator under `server/src/routes/internal/appointments/`.
- Appointment router (mount force-create).

## Approach
1. Add computeViolationsForSlot() in slotComputationService: reuse checkRange, checkOverlap, checkCapacity without short-circuiting; return ForceCreateViolationReport (all violation keys for the slot). 2. Add POST /api/v1/internal/appointments/force-create with requireAuth, requireRole('admin'). 3. Request validator: slot times (start/end), reason max 500 chars, normal appointment fields. 4. Handler: call computeViolationsForSlot for the requested slot; create appointment and ConstraintOverride in a single transaction. 5. Mount the force-create router in the appointments router.

## Checkpoint
Force-create endpoint creates appointment and override record in one transaction; invalid payloads (bad slot, oversized reason, invalid fields) rejected by validator.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.8.1-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.8.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
