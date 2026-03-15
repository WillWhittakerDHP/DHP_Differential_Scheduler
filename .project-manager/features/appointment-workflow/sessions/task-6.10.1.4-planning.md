# Plan: task 6.10.1.4 — 6.10.1.4

## Contract
- **Tier:** task | **ID:** 6.10.1.4
- **Scope:** 6.10.1.4
- **Governance:** 1 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this task.

## Goal
On wizard step 5 (Confirmation), at the "Apply coupon" UI, show a filtered list of coupon blockShape blockInstances in a dropdown. Use the **same routine** as the property type select on step 2: cascadeShapePipeline, selectedCouponBlocks in wizard state, toggleCouponBlock, availableCouponBlocks and couponCascadeError from useWizardFilteredOptions.

## Files
- `client/src/constants/blockShapeTypes.ts` — Add COUPON. Server: block_shape_type enum + BlockShape model.
- `client/src/composables/booking/useWizardFilteredOptions.ts` — availableCouponBlocks via cascadeShapePipeline(BLOCK_SHAPE_TYPES.COUPON, parentInstances: selectedServiceTypeBlocks, currentSelection: selectedCouponBlocks, relationshipName: 'coupons').
- `client/src/composables/booking/useBookingWizard.ts` — selectedCouponBlocks, toggleCouponBlock; clear on service/user change.
- `client/src/components/booking/steps/ConfirmationStep.vue` — WizardSelect bound to wizard.availableCouponBlocks and wizard.selectedCouponBlocks / toggleCouponBlock.

## Approach
Same as property type select on step 2: add BLOCK_SHAPE_TYPES.COUPON; use getBlockShapeIdByType(bookingData, BLOCK_SHAPE_TYPES.COUPON) inside cascadeShapePipeline; expose availableCouponBlocks and couponCascadeError; wizard state selectedCouponBlocks and toggleCouponBlock; ConfirmationStep binds WizardSelect to wizard. No name-based lookup; no new resolver APIs.

## Checkpoint
- Step 5 "Apply coupon" area shows a dropdown listing coupon block instances (cascade from selected services); list empty if no Coupon shape or no cascade. Selection in wizard.selectedCouponBlocks.

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
