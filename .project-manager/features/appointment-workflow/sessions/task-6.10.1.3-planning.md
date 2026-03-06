# Plan: task 6.10.1.3 — 6.10.1.3

## Contract
- **Tier:** task | **ID:** 6.10.1.3
- **Scope:** 6.10.1.3
- **Governance:** Clean — no violations detected

## Where we left off
No prior handoff for this task.

## Goal
Follow component/composable governance for the Shapes tab block-shape work: thin component (logic in composable); no new Tier1 hotspots; explicit return types and flat contract; lint and app start pass.

## Files
- `client/src/views/admin/tabs/ShapesTab.vue` — Keep template thin; all create flow logic delegated to composables.
- `client/src/composables/admin/useShapesTabCreation.ts` — Explicit return types; flat public contract; mutation via explicit actions (e.g. handleBlockShapeCreated).
- `client/src/composables/admin/useShapesTab.ts` — Explicit return types if extended; pass-through for refetchBlockShapes.

## Approach
- Reuse from inventory: existing ShapesTab, useShapesTab, useShapesTabCreation; no new components or composables.
- Review: Ensure ShapesTab.vue does not contain create-flow logic (delegate to useShapesTabCreation); ensure composables have explicit return types and bounded prop/emit per playbooks.
- Run client lint and app start; confirm no new component-logic or composable-health regressions (check component-health-audit, composable-health-audit, function-complexity before/after).

## Checkpoint
- Lint passes (`cd client && npm run lint`).
- App starts (`npm run start:dev` or equivalent).
- No new component-logic or composable-health regressions (baseline comparison at task-end).

## How we build the tierDown
- **Task 6.10.1.1:** Restore "Add new block shape" entry point
- **Task 6.10.1.2:** Block shape create flow and API
- **Task 6.10.1.3:** Governance and polish
- **Task 6.10.1.4:** Apply Coupon dropdown — coupon blockShape blockInstances on step 5

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.1-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.10.1.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
