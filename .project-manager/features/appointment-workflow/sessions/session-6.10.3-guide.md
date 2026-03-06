# Session 6.10.3 Guide: Availability-Step Fee Preview Bar and Popover

**Phase:** 6.10 — Fee Preview & Coupon Visibility  
**Session:** 6.10.3 — Fee Bar and Popover  
**Status:** Not Started  
**Branch:** TBD (e.g. `appointment-workflow-phase-6.10-session-6.10.3`)

**Depends on:** Session 6.10.2 (admin toggle and settings) so `showApplyCouponInWizard` is available to the wizard.

---

## Session Overview

Add a fee preview bar at the top of the Appointment Availability step (step 3) that shows the total fee (e.g. "Fee preview: $X.XX"). On hover, show a popover with the same fee details as the Confirmation step: Bag Total, optional Coupon Discount row and Apply Coupon button (only when `showApplyCouponInWizard` is true), Order Total, line items, Total. No submit buttons in the popover. Also update the Confirmation step so the Coupon Discount row and Apply Coupon button are only visible when `showApplyCouponInWizard` is true.

---

## Key Context

- **AvailabilityStep.vue** — Already injects `wizard`, `propertyDetailsStepData`. It does not currently use `buildConfirmationPriceData`; add a computed that calls it with `wizard.selectedServiceTypeBlocks.value`, `selectedPropertyTypeBlocks`, `selectedOptionTypeBlocks`, `selectedLineItemBlocks`, and from `propertyDetailsStepData?.value`: `squareFootage ?? propertySize`, `additionalUnits`. Reuse the same logic as `useConfirmationStepData` (see `client/src/composables/booking/useConfirmationStepData.ts` and `client/src/utils/booking/confirmationStepData.ts`).
- **Confirmation step fee UI** — `ConfirmationStep.vue` lines 136–228: Total Fee Display, then Price Details (Bag Total, Coupon Discount row with Apply Coupon, Order Total, line items, Total). Reuse this structure in the popover (without the main submit flow).
- **Setting:** Use `useAvailabilitySettings().settings?.showApplyCouponInWizard ?? false` to conditionally show the coupon row in both the popover and the Confirmation step.

---

## Tasks

### Task 6.10.3.1: Fee preview bar and priceData in AvailabilityStep

**Goal:** Compute priceData and show a compact bar at the top of the step.

**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — Import `buildConfirmationPriceData` from `@/utils/booking/confirmationStepData`. Add a computed `availabilityStepPriceData` that calls `buildConfirmationPriceData` with wizard selections and property details (squareFootage, aduCount). Add a bar at the top (e.g. above or beside the "Appointment Availability" heading): "Fee preview: $X.XX" using `priceData.finalTotal` and `priceData.currency`. Show the bar only when the fee is meaningful (e.g. `wizard.selectedServiceTypeBlocks.value.length > 0` and optionally when `priceData.finalTotal >= 0`).

**Checkpoint:** Bar appears when at least one service is selected; amount matches the logic used on the Confirmation step.

---

### Task 6.10.3.2: Hover popover with fee details

**Goal:** On hover (or click) over the fee bar, show a popover with the same structure as Confirmation step Price Details.

**Files:**
- `client/src/components/booking/steps/AvailabilityStep.vue` — Wrap the fee bar in a `VTooltip` or `VMenu`/`VPopover`. Popover content: Bag Total, then (when `showApplyCouponInWizard`) Coupon Discount row and Apply Coupon button, then Order Total, then line items, then Total (finalTotal). Use the same labels and layout as ConfirmationStep (no submit buttons). Read `showApplyCouponInWizard` from `useAvailabilitySettings().settings?.showApplyCouponInWizard ?? false`.

**Checkpoint:** Hover shows popover; content matches Confirmation step fee details; coupon row only when setting is on.

---

### Task 6.10.3.3: Confirmation step — conditional coupon row

**Goal:** Show the Coupon Discount row and Apply Coupon button only when the admin toggle is on.

**Files:**
- `client/src/components/booking/steps/ConfirmationStep.vue` — Use `useAvailabilitySettings().settings?.showApplyCouponInWizard ?? false`. Wrap the Coupon Discount row (the `div` that contains "Coupon Discount" and either the discount amount or the Apply Coupon button) in `v-if="showApplyCouponInWizard"`.

**Checkpoint:** With toggle off, Confirmation step has no coupon row; with toggle on, it appears as today.

---

## Success Criteria

- [ ] Availability step: Fee preview bar at top when fee is meaningful; hover shows popover with Bag Total, optional Coupon row (+ Apply Coupon when enabled), Order Total, line items, Total (no submit).
- [ ] Confirmation step: Coupon row visible only when `showApplyCouponInWizard` is true.
- [ ] Lint passes; app starts.

---

## Related Documents

- Phase 6.10 guide: `phases/phase-6.10-guide.md`
- Session 6.10.2: `session-6.10.2-guide.md` (admin toggle and settings)
- ConfirmationStep.vue (fee layout reference)
- confirmationStepData.ts (buildConfirmationPriceData)
