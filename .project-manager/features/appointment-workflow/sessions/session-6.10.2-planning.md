# Plan: session 6.10.2 — Admin Toggle and Settings for Apply Coupon Visibility

## Contract
- **Tier:** session | **ID:** 6.10.2
- **Scope:** Admin Toggle and Settings for Apply Coupon Visibility
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
Completed Task - Begin Session 6.10.2

## Goal
Add business setting **showApplyCouponInWizard** so admins can turn the apply-coupon line and button on or off in the booking wizard. Toggle lives in **Business Controls → Calendar → Confirmation & Holds**. Persist with availability/business settings (same as hold duration and auto-confirm); ensure the wizard can read it (e.g. via `getAvailabilitySettings()` / `useAvailabilitySettings().settings`). No fee preview bar in this session — that is Session 6.10.3.

## Files
- **Types & API:** `client/src/configs/availabilitySettings/types.ts`, `api.ts` — Add `showApplyCouponInWizard` to types and RawAvailabilitySettings; response mapping and `buildAvailabilityPayload` include the field; server contract for get/save if needed.
- **Admin UI:** `AppointmentConfirmationPanel.vue`, `BusinessControlsCalendarSection.vue`, `businessControlsTabStrings.ts` — Switch in Confirmation & Holds; labels/hints; pass-through and emit.
- **Form state:** `useAdminAvailabilitySettings.ts`, `useBusinessControlsFormState.ts` / `useCalendarHoldFormState.ts` — Load/save new field in formData; include in payload.
- **Wizard:** Wizard reads setting via `useAvailabilitySettings().settings?.showApplyCouponInWizard` (no new composable; type and API already expose it after Task 6.10.2.1).

## Approach
- **Task 6.10.2.1:** Extend availability/business settings types and API (read/write, default false); type-safe round-trip.
- **Task 6.10.2.2:** Add VSwitch in AppointmentConfirmationPanel; wire to form state and save; strings and parent binding.
- **Task 6.10.2.3:** Ensure wizard can read the value from `useAvailabilitySettings().settings`; no fee bar or Confirmation step conditional in this session (6.10.3).

## Checkpoint
- After 6.10.2: Setting in types and API; admin switch in Confirmation & Holds with save/load; wizard can read `showApplyCouponInWizard`; lint and app start pass.

## How we build the tierDown to achieve them
- **Task 6.10.2.1:** Types and API — Add showApplyCouponInWizard to settings
- **Task 6.10.2.2:** Admin UI — Switch in Confirmation & Holds panel
- **Task 6.10.2.3:** Wizard can read the setting
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.10-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.10.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
