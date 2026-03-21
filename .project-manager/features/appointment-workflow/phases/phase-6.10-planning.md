# Plan: phase 6.10 — 6.10

## Contract
- **Tier:** phase | **ID:** 6.10
- **Scope:** 6.10
- **Governance:** 2 governance highlights — read reports before filling slots

## Where we left off
- **Phase 6.9** (previous) is complete or in handoff; Phase 6.10 starts from feature guide and phase-6.10-guide.md. Prerequisites: phases 6.1–6.3 (workflow and confirmation routine) complete; existing `buildConfirmationPriceData`, Confirmation step fee UI, and availability settings API.

## Goal
(0) **Shapes tab:** Restore the add new block shapes button on the admin Shapes tab (it used to exist and is missing). If needed, adapt the same add-new button pattern used on the other shapes sub-tabs. (1) **Fee preview on Availability step:** Add a bar at the top of step 3 showing total fee; on hover, show fee details in a popover (Bag Total, optional Coupon row and Apply Coupon button when enabled, Order Total, line items, Total — no submit). (2) **Admin-controlled coupon visibility:** Add "Show apply coupon in wizard" in Business Controls → Calendar → Confirmation & Holds; persist as `showApplyCouponInWizard` with availability/business settings; Confirmation step and availability-step popover show the coupon row and button only when the toggle is on.

## Files
- **Shapes tab:** `ShapesTab.vue`, `useShapesTab.ts`, `useShapesTabCreation.ts` — add or fix add new block shape button and create flow; block shape entity/API.
- **Settings & API:** `client/src/configs/availabilitySettings/` (types, `buildAvailabilityPayload`, API response mapping); add `showApplyCouponInWizard` to types and payload.
- **Admin UI:** `AppointmentConfirmationPanel.vue` (Confirmation & Holds) — add switch, wire form state and save; use `useAdminAvailabilitySettings`.
- **Wizard:** `AvailabilityStep.vue` — compute `priceData` via `buildConfirmationPriceData` (wizard + propertyDetailsStepData); fee preview bar and hover popover. `ConfirmationStep.vue` — wrap Coupon Discount row and Apply Coupon button in conditional on `showApplyCouponInWizard`.
- **Shared:** `@/utils/booking/confirmationStepData.ts` (`buildConfirmationPriceData`); wizard reads setting via `useAvailabilitySettings().settings` or getAvailabilitySettings().

## Approach
- **Session 6.10.1 first:** Restore add new block shapes button on admin Shapes tab (or adapt same add-new pattern as other shapes sub-tabs); create flow and API end-to-end.
- **Session 6.10.2 second:** Add `showApplyCouponInWizard` to availability settings (types, API, payload); add switch in AppointmentConfirmationPanel; ensure wizard can read the setting. No fee bar yet.
- **Session 6.10.3 third:** In AvailabilityStep, compute priceData with `buildConfirmationPriceData`, add fee preview bar and hover popover; show coupon row in popover only when setting is on; in ConfirmationStep, conditionally show coupon row and Apply Coupon button. Follow governance (session order, audits).

## Checkpoint
- After 6.10.1: Add new block shapes button works on Shapes tab; create flow and list refresh work.
- After 6.10.2: Admin switch in Confirmation & Holds; setting saved and loaded; wizard can read it.
- After 6.10.3: Fee preview bar on Availability step when fee is meaningful; popover with fee details and optional coupon row; Confirmation step coupon row conditional; lint and app start pass.

## How we build the tierDown to achieve them
- **Session 6.10.1:** Add New Block Shapes Button on Admin Shapes Tab
- **Session 6.10.2:** Admin Toggle and Settings for Apply Coupon Visibility
- **Session 6.10.3:** Availability-Step Fee Preview Bar and Popover
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.9-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
