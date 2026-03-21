# Plan: session 6.10.3 — Availability-Step Fee Preview Bar and Popover

## Contract
- **Tier:** session | **ID:** 6.10.3
- **Scope:** Availability-Step Fee Preview Bar and Popover
- **Governance:** 4 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Session 6.10.2 complete: admin toggle and settings for apply-coupon visibility; wizard reads `showApplyCouponInWizard`; Confirmation step coupon row is conditional.

## Goal
Add a fee preview bar at the top of the Availability step (step 3) showing total fee (e.g. "Fee preview: $X.XX"); on hover, show a popover with fee details (Bag Total, optional Coupon row when `showApplyCouponInWizard`, Order Total, line items, Total). Reuse `buildConfirmationPriceData` and Confirmation-step fee structure; no submit in popover.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — fee bar, priceData computed, popover
- `client/src/utils/booking/confirmationStepData.ts` — `buildConfirmationPriceData` (reuse)
- `client/src/composables/booking/useAvailabilitySettings.ts` — `showApplyCouponInWizard` for popover coupon row
- Session guide: `sessions/session-6.10.3-guide.md` (task checkpoints)

## Approach
- In AvailabilityStep, add computed that calls `buildConfirmationPriceData` with wizard selections and `propertyDetailsStepData` (same inputs as useConfirmationStepData). Add a compact bar at top; show only when fee is meaningful (e.g. at least one service selected). Wrap bar in VMenu/VPopover; popover content mirrors Confirmation step Price Details (Bag Total, conditional Coupon row + Apply Coupon when `useAvailabilitySettings().settings?.showApplyCouponInWizard`, Order Total, line items, Total). Keep components thin; no new composable unless needed.

## Checkpoint
- Fee bar visible when at least one service selected; amount matches Confirmation step.
- Hover shows popover with fee details; coupon row in popover only when admin toggle is on.
- Lint and app start pass.

## How we build the tierDown to achieve them
- **Task 6.10.3.1:** Fee preview bar and priceData in AvailabilityStep
- **Task 6.10.3.2:** Hover popover with fee details
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.10-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.10.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
