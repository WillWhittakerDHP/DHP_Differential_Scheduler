# Plan: session 6.8.1 — ** ** Database & Server Infrastructure — migration, model, computeViolationsForSlot, force-create route

## Contract
- **Tier:** session | **ID:** 6.8.1
- **Scope:** ** ** Database & Server Infrastructure — migration, model, computeViolationsForSlot, force-create route
- **Governance:** 4 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this session.

## Goal
Create the constraint_overrides persistence layer and force-create API so admins can create an appointment on a blocked slot with stored override metadata (migration, model, computeViolationsForSlot, POST force-create route with auth/role and validation).

## Files
- **Server:** Migration for `constraint_overrides` table; `server/src/models/` (ConstraintOverride, associations to Appointment and User); `server/src/services/slotComputationService.ts`; `server/src/routes/internal/appointments/` (force-create route, validator); appointment router mount.

## Approach
1. Add migration with columns per phase guide Data Model (id, appointment_id, overridden_violations, authorized_by_id, reason, slot_start, slot_end, timestamps; index on appointment_id). 2. Create ConstraintOverride Sequelize model and associations (Appointment, User as authorizedBy). 3. Add `computeViolationsForSlot()` in slotComputationService reusing checkRange/checkOverlap/checkCapacity, returning ForceCreateViolationReport (no short-circuit). 4. Add POST `/api/v1/internal/appointments/force-create` with requireAuth, requireRole('admin'); validator for slot times, reason max 500 chars, appointment fields; call computeViolationsForSlot, create appointment + ConstraintOverride in a transaction. 5. Mount force-create router in appointment router.

## Checkpoint
- Migration applied; ConstraintOverride model and associations load.
- Force-create route creates appointment and override record in one transaction; invalid payloads rejected by validator.

## How we build the tierDown to achieve them
- **Task 6.8.1.1:** Migration and model — constraint_overrides table, ConstraintOverride model and associations
- **Task 6.8.1.2:** Force-create API — computeViolationsForSlot, POST route, validator, mount
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.8-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
