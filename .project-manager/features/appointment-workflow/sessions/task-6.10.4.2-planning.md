# Plan: task 6.10.4.2 — 6.10.4.2

## Contract
- **Tier:** task | **ID:** 6.10.4.2
- **Scope:** 6.10.4.2
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
Task 6.10.4.1 done: `BookingPartInstance` has optional `percentageOff`; it flows through the transformer and form types. This task applies that field in the fee pipeline so Bag Total / Order Total reflect percentage off and negative base fee.

## Goal
Apply percentage off (e.g. 10% off) and negative base fee in the Part/Block Final pipeline so that fee preview bar and Confirmation step show correct totals when any part has `percentageOff` or negative `baseFee`. Integrate with `buildConfirmationPriceData`; replace or augment the placeholder coupon discount with the derived discount from parts so the UI shows real coupon impact.

## Files
- **Part/Block Finals:** `client/src/utils/booking/PartFinal.ts` — In `createPartFinal`, when summing `baseFee` (and optionally rateOverBaseFee), apply per-part `percentageOff` (e.g. `baseFee * (1 - (percentageOff ?? 0) / 100)`) and allow negative `baseFee` as discount in the sum.
- **Parts totals:** `client/src/utils/booking/partsTotals.ts` — Either accept parts with `percentageOff` (extend `PartPricingFields` or input type) and apply percentage when summing, or keep PartFinal as the single place for adjustment so block totals use PartFinal values consistently. Prefer applying in PartFinal so one place owns the adjustment.
- **Confirmation pricing:** `client/src/utils/booking/confirmationStepData.ts` — Use block/part totals that already include percentage off. Replace `CONFIRMATION_PLACEHOLDER_COUPON_DISCOUNT` with a value derived from the same pipeline (e.g. sum of discounts from parts with percentage off or negative base fee) so the Coupon Discount row and Order Total are consistent; keep backward compatibility when no part has percentage off (0 discount).

## Approach
1. **PartFinal:** In `createPartFinal(partShape, parts)`, compute `baseFee` as sum over parts of `(p.baseFee ?? 0) * (1 - (p.percentageOff ?? 0) / 100)`. Allow negative `baseFee` (fixed discount). Optionally apply `percentageOff` to `rateOverBaseFee` the same way so overage is also discounted when applicable.
2. **BlockFinal:** Already aggregates PartFinal.baseFee into blockTotals; no change if PartFinal is adjusted.
3. **confirmationStepData:** In `calculateBlockInstanceFee` the code uses `calculatePartsTotals(nonZeroedParts)` where nonZeroedParts are raw part instances. Either switch to using blockFinal.blockTotals for the fee (so PartFinal adjustments flow through) or ensure the path that sums parts applies percentage off. Prefer using blockFinal.blockTotals for baseFee/rateOverBaseFee so PartFinal is the single source of adjusted values.
4. **Coupon discount:** Compute total discount (e.g. from parts with percentageOff or negative baseFee) and pass it into the price data so the Confirmation step and fee popover show "Coupon Discount" and correct Order Total instead of placeholder 0.

## Checkpoint
- Part/Block Finals apply percentage off and negative base fee; fee preview and Confirmation step show correct Bag Total, optional Coupon row, and Order Total when parts have percentageOff or negative baseFee; lint and app start pass.
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.10.4-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.10.4.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
