# Plan: task 6.10.1.1 — 6.10.1.1

## Contract
- **Tier:** task | **ID:** 6.10.1.1
- **Scope:** 6.10.1.1
- **Governance:** 1 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this task.

## Goal
Restore the add new block shapes button on the admin Shapes tab so admins can create block shapes from the UI. If the original can't be recovered, adapt the same add-new button and flow used on the other shapes sub-tabs. Deliver via three tasks: entry point, create flow + API, governance and polish.

## Files
- `client/src/views/admin/tabs/ShapesTab.vue` — Block Shapes section: restore or add entry point (button/card) for create flow.
- `client/src/composables/admin/useShapesTab.ts`, `useShapesTabCreation.ts` — Add createBlockShape, handleBlockShapeCreated; wire to block shape entity create mutation and list refresh.
- Block shape entity config and API — ensure create endpoint and payload (name, type, ref or equivalent) are available.

## Approach
- Task 6.10.1.1: Restore or add "Add new block shape" entry point in ShapesTab and composables; same UX as Part/Annotation/Event.
- Task 6.10.1.2: Implement create flow (form/modal, API call, list refresh); confirm entity/API support.
- Task 6.10.1.3: Keep component thin, composable with explicit return types and flat contract; run lint and app start.

## Checkpoint
- After 6.10.1.1: Entry point visible; clicking it starts create flow.
- After 6.10.1.2: Submitting create adds a block shape; list updates.
- After 6.10.1.3: Lint and app start pass; no new governance regressions.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.1-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
