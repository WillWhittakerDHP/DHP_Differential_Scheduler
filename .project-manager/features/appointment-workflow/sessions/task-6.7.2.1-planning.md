# Plan: task 6.7.2.1 — Display scheduled_by in appointment details

## Contract
- **Tier:** task | **ID:** 6.7.2.1
- **Scope:** Display scheduled_by in admin appointment details
- **Governance:** Clean — no violations detected

## Where we left off
Session 6.7.2 started; first task.

## Goal
Show who scheduled the appointment in admin appointment details (scheduled_by id and/or display name).

## Files
- Admin appointment details view/component
- API or transformer if needed for scheduler name
- Client types if new fields

## Approach
- Use existing or new API shape to expose scheduled_by (and optional display name)
- Add display in admin appointment details following existing detail patterns

## Checkpoint
Admin can see who scheduled each appointment in the details view.

## How we build the tierDown to achieve them
- **Task 6.7.2.1:** Display scheduled_by in appointment details

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.7.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
