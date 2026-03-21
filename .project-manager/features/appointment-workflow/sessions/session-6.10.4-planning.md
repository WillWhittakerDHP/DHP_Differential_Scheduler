# Plan: session 6.10.4 — Coupon fee calculation (percentage and negative base fee)

## Contract
- **Tier:** session | **ID:** 6.10.4
- **Scope:** Coupon fee calculation — add percentage column to part instance, adjust Part/Block Finals for percentage off and negative base fee
- **Governance:** Session-tier governance applies; check reports before filling slots.

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** types, function, composable
- **Decomposition mode:** moderate
- **Downstream advice:** Guide owns current-tier decomposition. Inherit phase intent; avoid over-specifying child execution detail.

## Where we left off
Session 6.10.3 complete: Availability-step fee bar and popover; Confirmation step conditional coupon row. Coupon discount is still a placeholder (0) in confirmation pricing. This session wires coupon percentage and negative base fee into the part/block final pipeline.

## Goal
Wire coupon fee calculation into the booking fee pipeline: (1) Add a percentage column (e.g. percentage off) to the part instance shape so coupon rules can express "10% off" or similar. (2) Adjust Part Finals and Block Finals so percentage-off is applied correctly (e.g. 10% off base) and negative base fee (e.g. fixed discount) is handled without breaking the existing total. Fee preview bar and Confirmation step will then show real coupon impact when a coupon is applied.

## Files
- **Types / part instance:** Extend part-instance or block-shape types (e.g. in `client/src/types/` or entity instance form types) to include an optional percentage field for coupon discount; ensure it flows through to the fee pipeline.
- **Part/Block Finals:** `client/src/utils/booking/` — `partsTotals`, `partFinalizer`, `BlockFinal`, `confirmationStepData.ts` — Apply percentage off to part/block totals; handle negative base fee in final sum so Bag Total / Order Total remain consistent.
- **Confirmation / fee display:** `confirmationStepData.ts` (and any composables that consume it) — Replace or augment placeholder coupon discount with value derived from part/block finals when coupon is applied; keep backward compatibility when no coupon.

## Approach
- **Task 6.10.4.1:** Add percentage column to part instance (types and any admin/API surface that creates or edits part instances); ensure the field is available where Part/Block Finals are computed.
- **Task 6.10.4.2:** In the Part/Block Final pipeline, apply percentage-off (e.g. 10% off) and support negative base fee; ensure Bag Total, Order Total, and line items in fee preview and Confirmation step reflect the adjusted totals. Integrate with existing `buildConfirmationPriceData` so the fee bar and Confirmation step show coupon impact.

## Checkpoint
- After 6.10.4: Part instance has optional percentage field; Part/Block Finals apply percentage off and handle negative base fee; fee preview and Confirmation step show correct totals when coupon is applied; lint and app start pass.

## How we build the tierDown to achieve them
- **Task 6.10.4.1:** Add percentage column to part instance and wire into fee pipeline inputs
- **Task 6.10.4.2:** Adjust Part/Block Finals for percentage off and negative base fee; integrate with confirmation pricing

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.10-guide.md`
- Handoff (transition context): `.project-manager/features/appointment-workflow/sessions/session-6.10.3` handoff or session-6.10.3-guide.md
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- Fee pipeline: `client/src/utils/booking/confirmationStepData.ts`, `partsTotals`, `BlockFinal`, `partFinalizer`
