# Plan: task 6.10.3.2 — 6.10.3.2

## Contract
- **Tier:** task | **ID:** 6.10.3.2
- **Scope:** 6.10.3.2
- **Governance:** 1 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Task 6.10.3.1 complete: fee bar and availabilityStepPriceData in AvailabilityStep. This task adds the hover popover only.

## Goal
On hover (or click) over the existing fee bar, show a popover with the same structure as Confirmation step Price Details: Bag Total, then (when `showApplyCouponInWizard`) Coupon Discount row and Apply Coupon button, then Order Total, line items, Total (finalTotal). Same labels/layout as ConfirmationStep; no submit buttons in popover.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — wrap fee bar in VMenu/VPopover; add popover slot content (fee details markup)
- `client/src/composables/booking/useAvailabilitySettings.ts` — already used; read `showApplyCouponInWizard` for conditional coupon row in popover
- ConfirmationStep.vue — reference for Price Details markup (Bag Total, Coupon row, Order Total, line items, Total)

## Approach
- In AvailabilityStep.vue: wrap the fee bar div in VMenu (activator = fee bar; content = fee details). Popover content: repeat the same structure as ConfirmationStep Price Details (Bag Total, optional Coupon row + Apply Coupon when `useAvailabilitySettings().settings?.showApplyCouponInWizard ?? false`, Order Total, line items, Total) using `availabilityStepPriceData`. Use Vuetify VMenu with close-on-content-click or hover; keep template readable, no new composable.

## Checkpoint
- Hover (or click) on fee bar shows popover; content matches Confirmation step fee details.
- Coupon row in popover only when admin toggle is on.
- Lint and app start pass.

## How we build the tierDown to achieve them
- **Task 6.10.3.2:** Hover popover with fee details (this task)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.3-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.10.3.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
