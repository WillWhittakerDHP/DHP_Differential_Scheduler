# Plan: task 6.10.3.1 — 6.10.3.1

## Contract
- **Tier:** task | **ID:** 6.10.3.1
- **Scope:** 6.10.3.1
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
Session 6.10.3 started; first task is fee bar + priceData only (popover in 6.10.3.2).

## Goal
Compute priceData in AvailabilityStep using `buildConfirmationPriceData` (same inputs as Confirmation step) and show a compact fee preview bar at the top of the step (e.g. "Fee preview: $X.XX"). Bar visible only when fee is meaningful (e.g. at least one service selected). No popover in this task.

## Files
- `client/src/components/booking/steps/AvailabilityStep.vue` — add computed for priceData, add fee bar at top
- `client/src/utils/booking/confirmationStepData.ts` — `buildConfirmationPriceData` (reuse; no changes)
- `client/src/composables/booking/useConfirmationStepData.ts` — reference for wizard/propertyDetails inputs (no changes)

## Approach
- In AvailabilityStep.vue: inject `propertyDetailsStepData` if not already; add computed `availabilityStepPriceData` that calls `buildConfirmationPriceData` with `wizard.selectedServiceTypeBlocks`, `selectedPropertyTypeBlocks`, `selectedOptionTypeBlocks`, `selectedLineItemBlocks`, and from `propertyDetailsStepData?.value`: `squareFootage ?? propertySize`, `additionalUnits` (match useConfirmationStepData pattern). Add a compact bar (e.g. above or beside step heading) displaying `priceData.finalTotal` and `priceData.currency`; show bar only when `wizard.selectedServiceTypeBlocks.value.length > 0` and `priceData.finalTotal >= 0` (or equivalent). Keep component thin; no new composable.

## Checkpoint
- Bar appears when at least one service is selected; amount matches Confirmation step logic.
- Lint and app start pass.

## How we build the tierDown to achieve them
- **Task 6.10.3.1:** Fee preview bar and priceData in AvailabilityStep (this task)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.3-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
