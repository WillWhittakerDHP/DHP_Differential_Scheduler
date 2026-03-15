# Session 6.10.2 Guide: Admin Toggle and Settings for Apply Coupon Visibility

**Phase:** 6.10 — Fee Preview & Coupon Visibility  
**Session:** 6.10.2 — Admin Toggle and Settings  
**Status:** In Progress  
**Branch:** TBD (e.g. `appointment-workflow-phase-6.10-session-6.10.2`)

---

## Session Overview

Add a business setting **showApplyCouponInWizard** (or equivalent name) so admins can turn the apply-coupon line and button on or off in the booking wizard. The toggle lives in **Business Controls → Calendar → Confirmation & Holds**. Persist the value with the same availability/business settings that hold hold duration and auto-confirm; ensure the wizard can read it (e.g. via `getAvailabilitySettings()` / `useAvailabilitySettings().settings`).

---

## Key Context

- **AppointmentConfirmationPanel.vue** — Already has hold duration and auto-confirm switch; add a second switch for "Show apply coupon in wizard". Panel receives props from `BusinessControlsCalendarSection` and emits updates; form state is provided by `useBusinessControlsFormState` / `useCalendarHoldFormState` and ultimately `formData` from `useAdminAvailabilitySettings`.
- **Availability settings API** — `client/src/configs/availabilitySettings/api.ts`: `getAvailabilitySettings()` reads from `/business-settings/availability_settings`; `buildAvailabilityPayload(formData, autoConfirmEnabled)` builds the save payload. Today `autoConfirmEnabled` is passed separately; you can add `showApplyCouponInWizard` either inside the `setting_value` blob or as a separate top-level key in the payload (match server contract).
- **Server:** If the backend does not yet store this key, add it to the business_settings availability payload (or equivalent) so the client can send and receive it.

---

## Tasks

### Task 6.10.2.1: Types and API — Add showApplyCouponInWizard to settings

**Goal:** Extend availability/business settings types and API so the setting can be read and written.

**Files:**
- `client/src/configs/availabilitySettings/types.ts` — Add `showApplyCouponInWizard?: boolean` to `AvailabilitySettings` and to `RawAvailabilitySettings` if the API returns it in the same blob.
- `client/src/configs/availabilitySettings/api.ts` — In the response mapping (where `convertedSettings` is built), set `showApplyCouponInWizard: rawSettings.showApplyCouponInWizard ?? false` (or read from the nested path the server uses). In `buildAvailabilityPayload`, include `showApplyCouponInWizard` in the payload (either inside `setting_value` or as a sibling to `auto_confirm_enabled` if the server expects it that way).

**Checkpoint:** Fetch and save round-trip; type-safe; default `false` when missing.

---

### Task 6.10.2.2: Admin UI — Switch in Confirmation & Holds panel

**Goal:** Add the toggle and wire it to form state and save.

**Files:**
- `client/src/views/admin/tabs/components/AppointmentConfirmationPanel.vue` — Add prop `showApplyCouponInWizard: boolean` and emit `update:showApplyCouponInWizard`. Add a `VSwitch` with label/hint (e.g. "Show apply coupon in wizard" / "When on, the Coupon Discount row and Apply Coupon button are visible in the booking summary and fee preview.").
- `client/src/configs/businessControlsTabStrings.ts` — Add strings for the new switch (e.g. under `calendar` or a new key) so labels and hints are consistent.
- `client/src/views/admin/tabs/BusinessControlsCalendarSection.vue` — Pass `showApplyCouponInWizard` into `AppointmentConfirmationPanel` from state and handle `@update:showApplyCouponInWizard`.
- `client/src/composables/admin/useBusinessControlsFormState.ts` and/or `useCalendarHoldFormState.ts` — Expose `showApplyCouponInWizard` from `formData` (or from the same source as `autoConfirmEnabled`) so the Calendar section can bind it. If the value is stored inside `formData.value.calendarConfig` or similar, ensure the form state mutates that when the switch changes.
- `client/src/composables/admin/useAdminAvailabilitySettings.ts` — When loading, map the new field from API response into `formData`. When saving, include it in the payload (via `buildAvailabilityPayload` or an extra argument).

**Checkpoint:** Toggle appears in Confirmation & Holds; changing it and saving persists the value; reloading the admin tab shows the correct state.

---

### Task 6.10.2.3: Wizard can read the setting

**Goal:** Wizard (and later the availability-step fee popover) can access the current value.

**Approach:** If `showApplyCouponInWizard` is part of `AvailabilitySettings` returned by `getAvailabilitySettings()`, then `useAvailabilitySettings()` (used in the wizard) already exposes `settings`; add the field to the type and the wizard can use `useAvailabilitySettings().settings?.showApplyCouponInWizard ?? false`. No new composable required unless you prefer a dedicated small helper.

**Checkpoint:** From a wizard or any component that uses `useAvailabilitySettings()`, the value is readable and reactive (e.g. for use in Session 6.10.3).

---

## Success Criteria

- [ ] Setting is defined in types and included in API get/save.
- [ ] Admin switch in Confirmation & Holds; save/load works.
- [ ] Wizard can read the setting via availability settings (e.g. `useAvailabilitySettings().settings?.showApplyCouponInWizard`).
- [ ] Lint passes; app starts.

---

## Related Documents

- Phase 6.10 guide: `phases/phase-6.10-guide.md`
- Session 6.10.3: `session-6.10.3-guide.md` (fee bar and popover; will use this setting)
