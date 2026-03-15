# Phase 6.10 Guide: Fee Preview & Coupon Visibility

**Purpose:** Phase-level guide for the fee preview bar on the Availability step and admin-controlled visibility of the apply-coupon UI in the wizard.

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.10
**Phase Name:** Fee Preview & Coupon Visibility
**Description:** (0) Restore the add new block shapes button on the admin Shapes tab (it used to exist and is no longer there). If the original can’t be recovered, adapt the same add-new button pattern used on the other shapes sub-tabs (Part, Annotation, Event). (1) Add a bar at the top of the Appointment Availability (step 3) wizard that shows total fee as a preview; on hover, show fee details in a popover (same structure as the Confirmation step: Bag Total, optional Coupon row and Apply Coupon button, Order Total, line items, Total — no submit buttons). (2) Add an admin toggle in Business Controls → Calendar → Confirmation & Holds to show or hide the apply-coupon line and button in the wizard; persist the setting with availability/business settings; wizard (Confirmation step and availability-step popover) respects the toggle.

**Duration:** 4 sessions
**Status:** Not Started

---

## Context: What Already Exists

**Confirmation step (step 5):** Displays total fee and Price Details (Bag Total, Coupon Discount row with Apply Coupon button, Order Total, line items, Total). Uses `useConfirmationStepData` → `buildConfirmationPriceData` with wizard selections and `propertyDetailsStepData` (squareFootage, additionalUnits). See `client/src/components/booking/steps/ConfirmationStep.vue` (lines 136–228).

**Availability step (step 3):** Has access to `wizard` and `propertyDetailsStepData` via inject; does not currently show fee. Fee can be computed with the same `buildConfirmationPriceData` from `@/utils/booking/confirmationStepData`.

**Business Controls:** Calendar tab → Confirmation & Holds subtab (`AppointmentConfirmationPanel.vue`) already has hold duration and auto-confirm; same panel is the right place for "Show apply coupon in wizard". Settings are loaded/saved via `useAdminAvailabilitySettings` and `buildAvailabilityPayload` in `client/src/configs/availabilitySettings/`; `autoConfirmEnabled` is passed separately to the payload — a similar pattern can be used for `showApplyCouponInWizard`.

**Coupon today:** Coupon discount is a placeholder (0) in `confirmationStepData.ts`; the Apply Coupon button exists in the UI but is not wired. This phase only adds the **visibility** toggle (show/hide the row and button); actual coupon logic can remain placeholder.

---

## Phase Objectives

- **Shapes tab:** Restore the add new block shapes button on the admin Shapes tab (it used to be there and is missing). If needed, adapt the same add-new button pattern used on the other shapes sub-tabs (Part, Annotation, Event).
- **Admin:** Add a switch "Show apply coupon in wizard" in Business Controls → Calendar → Confirmation & Holds. Persist as part of availability/business settings (e.g. `showApplyCouponInWizard`); wizard reads it (e.g. from `useAvailabilitySettings().settings` or the same API).
- **Availability step:** Add a compact fee preview bar at the top (e.g. "Fee preview: $X.XX"); show only when price is meaningful (e.g. at least one service selected). On hover, show a popover with fee details (Bag Total, optional Coupon row when setting is on, Order Total, line items, Total); optionally include Apply Coupon button in the popover when enabled.
- **Confirmation step:** Wrap the Coupon Discount row (and Apply Coupon button) in a conditional so it is only visible when `showApplyCouponInWizard` is true.

---

## Sessions Breakdown

- [ ] ### Session 6.10.1: Add New Block Shapes Button on Admin Shapes Tab
**Description:** Restore the add new block shapes button on the admin Shapes tab (it used to exist and is no longer there). If the original can’t be recovered, adapt the same add-new button pattern used on the other shapes sub-tabs. Ensure create flow and API work end-to-end.
**See:** `sessions/session-6.10.1-guide.md`

- [x] ### Session 6.10.2: Admin Toggle and Settings for Apply Coupon Visibility
**Description:** Add `showApplyCouponInWizard` to availability/business settings (types, API response mapping, payload for save). Add the switch in AppointmentConfirmationPanel; wire form state and save. Ensure wizard can read the setting (e.g. via `getAvailabilitySettings()` / `useAvailabilitySettings()`).
**See:** `sessions/session-6.10.2-guide.md`

- [ ] ### Session 6.10.3: Availability-Step Fee Preview Bar and Popover
**Description:** In AvailabilityStep.vue, compute `priceData` with `buildConfirmationPriceData` (wizard + propertyDetailsStepData). Add a compact bar at the top showing total fee; add hover popover with fee details; show coupon row in popover only when `showApplyCouponInWizard`. Update ConfirmationStep.vue to show the coupon row only when the setting is true.
**See:** `sessions/session-6.10.3-guide.md`

- [ ] ### Session 6.10.4: Coupon fee calculation — add percentage column to part instance, adjust Part/Block Finals for percentage off (e.g. 10% off) and negative base fee
**Description:** Coupon fee calculation — add percentage column to part instance, adjust Part/Block Finals for percentage off (e.g. 10% off) and negative base fee
**Tasks:** [To be planned]
**Focus:**
- [To be identified during planning]

---

## Dependencies

**Prerequisites:**
- Feature 6 phases 6.1–6.3 (workflow and confirmation routine) — Complete.
- Existing `buildConfirmationPriceData`, Confirmation step fee UI, and availability settings API.

**Downstream Impact:**
- Improves booking UX (fee visible earlier) and gives admins control over coupon visibility; no change to fee calculation logic.

---

## Success Criteria

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
- sessions/session-6.10.4-guide.md — Coupon fee calculation
