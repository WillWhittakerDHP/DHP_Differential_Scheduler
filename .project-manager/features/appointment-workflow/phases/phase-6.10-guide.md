# Phase 6.10 Guide: Fee Preview & Coupon Visibility

**Purpose:** Phase-level guide for the fee preview bar on the Availability step and admin-controlled visibility of the apply-coupon UI in the wizard, plus restoring the add new block shapes button on the admin Shapes tab.

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.10
**Phase Name:** Fee Preview & Coupon Visibility
**Description:** (0) Restore the add new block shapes button on the admin Shapes tab (it used to exist and is no longer there). If the original can't be recovered, adapt the same add-new button pattern used on the other shapes sub-tabs (Part, Annotation, Event). (1) Add a bar at the top of the Appointment Availability (step 3) wizard that shows total fee as a preview; on hover, show fee details in a popover (same structure as the Confirmation step: Bag Total, optional Coupon row and Apply Coupon button, Order Total, line items, Total — no submit buttons). (2) Add an admin toggle in Business Controls → Calendar → Confirmation & Holds to show or hide the apply-coupon line and button in the wizard; persist the setting with availability/business settings; wizard (Confirmation step and availability-step popover) respects the toggle.

**Duration:** 3 sessions
**Status:** Not Started

---

## Context: What Already Exists

**Confirmation step (step 5):** Displays total fee and Price Details (Bag Total, Coupon Discount row with Apply Coupon button, Order Total, line items, Total). Uses `useConfirmationStepData` → `buildConfirmationPriceData` with wizard selections and `propertyDetailsStepData` (squareFootage, additionalUnits). See `client/src/components/booking/steps/ConfirmationStep.vue` (lines 136–228).

**Availability step (step 3):** Has access to `wizard` and `propertyDetailsStepData` via inject; does not currently show fee. Fee can be computed with the same `buildConfirmationPriceData` from `@/utils/booking/confirmationStepData`.

**Business Controls:** Calendar tab → Confirmation & Holds subtab (`AppointmentConfirmationPanel.vue`) already has hold duration and auto-confirm; same panel is the right place for "Show apply coupon in wizard". Settings are loaded/saved via `useAdminAvailabilitySettings` and `buildAvailabilityPayload` in `client/src/configs/availabilitySettings/`; `autoConfirmEnabled` is passed separately to the payload — a similar pattern can be used for `showApplyCouponInWizard`.

**Shapes tab:** Part, Annotation, and Event shapes have "Create" flows; the Block Shapes sub-tab used to have an add-new button but it is missing. Restore it or adapt the same add-new pattern as the other sub-tabs.

**Coupon today:** Coupon discount is a placeholder (0) in `confirmationStepData.ts`; the Apply Coupon button exists in the UI but is not wired. This phase only adds the **visibility** toggle (show/hide the row and button); actual coupon logic can remain placeholder.

**Coupon list and Coupons block shape:** When we show or wire the list of coupons (e.g. in Apply Coupon dropdown or future cascade), we **connect to the "Coupons" block shape** and reuse the same **block-shape-filtered instances** strategy used for service, property, and option in the wizard. For those, the app identifies the block shape by type (`getBlockShapeIdByType(bookingData, BLOCK_SHAPE_TYPES.SERVICE)` etc. in `client/src/utils/blockInstanceUtils.ts`), then filters `bookingData.blockInstances` by `blockShapeRef === shapeId`. For Coupons, the shape is user-created (e.g. named "Coupons", type `user`), so we identify it by **name** (e.g. `bookingData.blockShapes.find(bs => bs.name === 'Coupons')` or a small helper like `getBlockShapeIdByName(bookingData, 'Coupons')`), then filter instances the same way. Reference: `useWizardFilteredOptions`, `cascadeShapePipeline` / `filterByShape` in `client/src/utils/booking/cascadeFilterPipeline.ts`, and `getBlockShapeIdByType` in `client/src/utils/blockInstanceUtils.ts`.

---

## Phase Objectives

- **Shapes tab:** Restore the add new block shapes button on the admin Shapes tab (it used to be there and is missing). If needed, adapt the same add-new button pattern used on the other shapes sub-tabs (Part, Annotation, Event).
- **Admin:** Add a switch "Show apply coupon in wizard" in Business Controls → Calendar → Confirmation & Holds. Persist as part of availability/business settings (e.g. `showApplyCouponInWizard`); wizard reads it (e.g. from `useAvailabilitySettings().settings` or the same API).
- **Availability step:** Add a compact fee preview bar at the top (e.g. "Fee preview: $X.XX"); show only when price is meaningful (e.g. at least one service selected). On hover, show a popover with fee details (Bag Total, optional Coupon row when setting is on, Order Total, line items, Total); optionally include Apply Coupon button in the popover when enabled.
- **Confirmation step:** Wrap the Coupon Discount row (and Apply Coupon button) in a conditional so it is only visible when `showApplyCouponInWizard` is true.
- **Coupon list:** When implementing or displaying the list of coupons (Apply Coupon options), use the block-shape-filtered strategy: resolve the "Coupons" block shape (by name), then use its id to filter `bookingData.blockInstances` by `blockShapeRef`, same pattern as service/property/option.

---

## Sessions Breakdown

- [ ] ### Session 6.10.1: Add New Block Shapes Button and Apply Coupon Dropdown on Step 5
**Description:** Restore the add new block shapes button on the admin Shapes tab (it used to exist and is no longer there). If the original can't be recovered, adapt the same add-new button pattern used on the other shapes sub-tabs. Ensure create flow and API work end-to-end. Then on wizard step 5 (Confirmation), at the "Apply coupon" UI, show a filtered list of coupon blockShape blockInstances in a dropdown, using the same logic as property block instances on step 2 (name-based shape lookup, then filter instances; WizardSelect).
**See:** `sessions/session-6.10.1-guide.md`

- [ ] ### Session 6.10.2: Admin Toggle and Settings for Apply Coupon Visibility
**Description:** Add `showApplyCouponInWizard` to availability/business settings (types, API response mapping, payload for save). Add the switch in AppointmentConfirmationPanel; wire form state and save. Ensure wizard can read the setting (e.g. via `getAvailabilitySettings()` / `useAvailabilitySettings()`).
**See:** `sessions/session-6.10.2-guide.md`

- [ ] ### Session 6.10.3: Availability-Step Fee Preview Bar and Popover
**Description:** In AvailabilityStep.vue, compute `priceData` with `buildConfirmationPriceData` (wizard + propertyDetailsStepData). Add a compact bar at the top showing total fee; add hover popover with fee details; show coupon row in popover only when `showApplyCouponInWizard`. Update ConfirmationStep.vue to show the coupon row only when the setting is true.
**See:** `sessions/session-6.10.3-guide.md`

---

## Dependencies

**Prerequisites:**
- Feature 6 phases 6.1–6.3 (workflow and confirmation routine) — Complete.
- Existing `buildConfirmationPriceData`, Confirmation step fee UI, and availability settings API.

**Downstream Impact:**
- Improves booking UX (fee visible earlier) and gives admins control over coupon visibility; no change to fee calculation logic.

---

## Success Criteria

- [ ] Shapes tab: Add new block shapes button restored (or same add-new pattern as other sub-tabs); create flow works.
- [ ] Step 5 (Confirmation): "Apply coupon" area shows dropdown of coupon blockShape blockInstances (same pattern as property types on step 2).
- [ ] Admin: "Show apply coupon in wizard" switch in Confirmation & Holds; setting is saved and loaded with availability settings.
- [ ] Wizard: Confirmation step shows Coupon Discount row and Apply Coupon button only when the toggle is on.
- [ ] Availability step: "Fee preview: $X.XX" bar at top when fee is meaningful; hover shows popover with Bag Total, optional Coupon row (+ Apply Coupon when enabled), Order Total, line items, Total (no submit).
- [ ] Lint and app start pass.

---

## Related Documents

- PROJECT_PLAN.md — Feature 6 Phase 6.10
- feature-appointment-workflow-guide.md — Phase 6.10 summary
- sessions/session-6.10.1-guide.md — Add new block shapes button
- sessions/session-6.10.2-guide.md — Admin toggle and settings
- sessions/session-6.10.3-guide.md — Fee bar and popover
