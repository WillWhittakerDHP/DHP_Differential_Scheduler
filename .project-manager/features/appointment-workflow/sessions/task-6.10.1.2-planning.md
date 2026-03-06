# Plan: task 6.10.1.2 — 6.10.1.2

## Contract
- **Tier:** task | **ID:** 6.10.1.2
- **Scope:** 6.10.1.2
- **Governance:** 1 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this task.

## Goal
Create flow collects required fields, calls API, and refreshes the list; new block shape appears in the tab. Task 6.10.1.1 already added the entry point and ShapeCreationForm for blockShape; this task verifies and completes the create flow (API wiring, list refresh, and any missing invalidation).

## Files
- `client/src/composables/admin/useShapesTabCreation.ts` — Already has createBlockShape, handleBlockShapeCreated; confirm no extra refetch needed (entity CRUD create mutation invalidates globalData/schedulerAdmin for blockShape).
- `client/src/views/admin/tabs/ShapesTab.vue` — ShapeCreationForm for blockShape already wired with @saved → handleBlockShapeCreated; confirm blockShapesList source is refreshed after create (useEntityFiltering/globalData).
- Entity config and API — Confirm block shape create endpoint and payload (name, type, allowMultipleBlocks, etc.); entityDefaults and server model already updated in 6.10.1.1.

## Approach
- Reuse from inventory: useShapesTabCreation (block shape state/actions), ShapeCreationForm + EntityCard (form and create mutation via useEntityCrud('blockShape')).
- Verify: On save, EntityCard/useEntityCrud create runs; usePrimitiveMutation onSuccess invalidates globalData and schedulerAdmin for blockShape, so blockShapesList (from useEntityFiltering/globalData) updates.
- If list does not refresh after create, ensure handleBlockShapeCreated runs after mutation success and/or trigger refetch/invalidate in composable.
- No new composable or component; thin verification and any small wiring fix.

## Checkpoint
- Submitting the create form creates a block shape via API; list updates and shows the new shape.
- Manual test: Create Block Shape → fill name (e.g. "Test"), save → new shape appears in Block Shapes list.

## How we build the tierDown
- **Task 6.10.1.1:** Restore "Add new block shape" entry point
- **Task 6.10.1.2:** Block shape create flow and API
- **Task 6.10.1.3:** Governance and polish
- **Task 6.10.1.4:** Apply Coupon dropdown — coupon blockShape blockInstances on step 5

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.1-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.10.1.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
