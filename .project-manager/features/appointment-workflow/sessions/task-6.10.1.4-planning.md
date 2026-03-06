# Plan: task 6.10.1.4 — 6.10.1.4

## Contract
- **Tier:** task | **ID:** 6.10.1.4
- **Scope:** 6.10.1.4
- **Governance:** 1 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this task.

## Goal
On wizard step 5 (Confirmation), at the "Apply coupon" UI, show a filtered list of coupon blockShape blockInstances in a dropdown. Use the same logic as property block instances on step 2: identify the block shape by name "Coupons", filter `bookingData.blockInstances` by `blockShapeRef`; expose the list to the step and render with a select/dropdown (e.g. WizardSelect like Property Type on PropertyDetailsStep).

## Files
- `client/src/utils/blockInstanceUtils.ts` — Add `getBlockShapeIdByName(bookingData, name)` (or equivalent) to resolve the "Coupons" block shape by name; use it to derive coupon block instances (filter instances where `blockShapeRef === shapeId` and `active`).
- Wizard/booking composable (e.g. `useWizardFilteredOptions` or the composable that provides wizard state to Confirmation step) — Expose `availableCouponBlocks` (computed list of block instances for the Coupons shape), same pattern as `availablePropertyTypeBlocks` for step 2.
- `client/src/components/booking/steps/ConfirmationStep.vue` — In the Apply coupon area (Coupon Discount row), add a dropdown/select bound to `availableCouponBlocks`; use WizardSelect with `item-title="name"`, `item-value="id"` like PropertyDetailsSection. Optionally bind selected coupon to wizard state for discount application in a later task.

## Approach
- Add `getBlockShapeIdByName(bookingData, name)` in blockInstanceUtils (or equivalent) to resolve a block shape by name; use it to filter block instances by `blockShapeRef` and `active`.
- In the wizard/booking composable that feeds Confirmation step, expose `availableCouponBlocks` (computed from Coupons shape id + filtered blockInstances), mirroring `availablePropertyTypeBlocks` for step 2.
- In ConfirmationStep.vue Apply coupon area, add WizardSelect bound to `availableCouponBlocks` with `item-title="name"`, `item-value="id"`; keep step thin, no filtering logic in template.
- No cascade pipeline for coupons; name-based lookup only (Coupons shape is type `user`).

## Checkpoint
- Step 5 "Apply coupon" area shows a dropdown listing coupon block instances (from the "Coupons" block shape); list is empty if no Coupons shape or no instances. Selection can be wired to discount/state in a later task.

## How we build the tierDown
- **Task 6.10.1.1:** Restore "Add new block shape" entry point
- **Task 6.10.1.2:** Block shape create flow and API
- **Task 6.10.1.3:** Governance and polish
- **Task 6.10.1.4:** Apply Coupon dropdown — coupon blockShape blockInstances on step 5

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.1-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.10.1.3-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
