# Plan: task 6.6.1.2 — Admin UI (soft delete and hard delete)

## Contract
- **Tier:** task | **ID:** 6.6.1.2
- **Scope:** Admin UI — soft delete and hard delete actions
- **Governance:** Clean — no violations detected

## Where we left off
Task 6.6.1.1 (Policy and documentation) complete. Policy and retention rules documented in phase guide or linked doc.

## Goal
Add admin UI actions for soft delete and hard delete where appropriate; thin components and composables per governance.

## Files
Admin appointment UI (detail view or table actions); appointment CRUD/PATCH or status-handling composables; any new composable for delete actions.

## Approach
1. Add soft delete and hard delete actions to admin appointment surfaces (e.g. detail view or table actions).
2. Wire to existing PATCH or delete endpoints; keep components thin, logic in composables.

## Checkpoint
Admin can perform soft delete and hard delete; actions respect governance; session/phase guide updated.

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.6.1-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.6.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
