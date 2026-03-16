# Plan: task 6.10.6.5 — Client: Tab and form state; wizard/differential wiring

## Contract
- **Tier:** task | **ID:** 6.10.6.5
- **Scope:** Client — useWizardSettings from wizard_settings API; BusinessControlsTab independent loading; useDifferentialPerspectives wizardFormData; save-button wiring
- **Governance:** 1 governance highlight

## Where we left off
Task 6.10.6.4 complete; calendar and wizard configs and composables exist.

## Goal
useWizardSettings: read from getWizardSettings() when no bindings; with bindings (Admin) use wizard.formData for showApplyCoupon/useBrandColors; return useDhpBrandColors alias. BusinessControlsTab: use useAdminAvailabilitySettings, useAdminCalendarSettings, useAdminWizardSettings; pass their formData/saving/error into useBusinessControlsFormState; useDifferentialPerspectives with formData and wizardFormData; provide constraintsSaveButtonProps, calendarSaveButtonProps, wizardSaveButtonProps; handleSave dispatches by currentMainTab. useCalendarHoldFormState and useBusinessControlsFormState: accept calendar/wizard formData; no showApplyCoupon/useBrandColors in calendar form. WizardConfigPanel: use wizardSaveButtonProps and type submit. BusinessControlsConstraintsSection and CapacityConstraintsPanel: use constraintsSaveButtonProps for Save.

## Files
- client/src/composables/admin/useWizardSettings.ts
- client/src/views/admin/tabs/BusinessControlsTab.vue
- client/src/composables/admin/useBusinessControlsFormState.ts, useCalendarHoldFormState.ts
- client/src/composables/admin/useDifferentialPerspectives.ts (wizardFormData param)
- client/src/types/availabilitySettingsParams.ts (UseDifferentialPerspectivesParams with wizardFormData)
- client/src/views/admin/tabs/components/WizardConfigPanel.vue
- client/src/views/admin/tabs/BusinessControlsConstraintsSection.vue
- client/src/views/admin/tabs/components/CapacityConstraintsPanel.vue

## Checkpoint
- Each admin tab loads and saves its own settings; Wizard tab Save uses wizard endpoint; Constraints Save uses availability; differential labels read/write wizard formData in Admin.

---
## Reference
- TierUp guide: `sessions/session-6.10.6-guide.md`
