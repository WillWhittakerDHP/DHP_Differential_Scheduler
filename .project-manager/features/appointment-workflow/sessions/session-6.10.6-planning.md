# Plan: session 6.10.6 — Settings Architecture Cleanup: Three-Table Separation

## Contract
- **Tier:** session | **ID:** 6.10.6
- **Scope:** Settings Architecture Cleanup: Three-Table Separation
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
Session 6.10.5 complete: Wizard sub-tab and consolidated wizard settings (useWizardSettings, WizardConfigPanel, showApplyCoupon, differential labels, brand colors). Settings were still backed by a single availability/business blob and an ill-fated availability_setting_entries table. Need to separate concerns into three singleton tables and align CRUD with existing patterns.

## Goal
Split the monolithic availability/business settings blob into three dedicated tables: **availability_settings** (repurposed from business_settings row), **calendar_settings**, **wizard_settings**. Each table has its own model, singleton CRUD router (~30 lines), and dedicated client composable. Remove the availability_setting_entries table, model, repository, and migrations. Fix business_settings model bugs and all consumer wiring so Constraints tab, Calendar tab, and Wizard tab load/save independently. Booking wizard reads availability + wizard_settings only.

## Files
- **Server:** `server/src/db/models/admin/` (calendar_settings, wizard_settings; fix business_settings); `server/src/db/migrations/` (create calendar_settings, wizard_settings, split data, drop availability_setting_entries); `server/src/routes/internal/` (calendarSettings, wizardSettings CRUD; simplify businessSettingsCrudRouter); `server/src/repositories/` (remove availabilitySettingsRepository; add/use calendarSettingsRepository as needed); `server/src/services/computedAvailabilityService.ts`; `server/src/routes/internal/appointments/appointmentHelpers.ts`.
- **Client:** `client/src/configs/` (calendarSettings, wizardSettings; strip availabilitySettings); `client/src/composables/admin/` (useAdminCalendarSettings, useAdminWizardSettings, useWizardSettings from wizard_settings API; useCalendarHoldFormState, useBusinessControlsFormState; useDifferentialPerspectives with wizardFormData); `client/src/views/admin/tabs/BusinessControlsTab.vue`; WizardConfigPanel, GridConfigPanel, BusinessControlsConstraintsSection (save-button props per tab).

## Approach
- **Task 6.10.6.1:** Server — Create CalendarSettings and WizardSettings models, migrations (create tables, split data, drop availability_setting_entries), singleton CRUD routers; simplify businessSettings router.
- **Task 6.10.6.2:** Server — Update computedAvailabilityService and appointmentHelpers to read from new tables; fix business_settings model; update AvailabilitySettingsData type.
- **Task 6.10.6.3:** Server — Remove availability_setting_entries model, repository, migrations; remove from model registry.
- **Task 6.10.6.4:** Client — Create calendarSettings and wizardSettings API configs and types; useAdminCalendarSettings and useAdminWizardSettings; strip moved fields from availability configs; add isValidCalendarEmail to calendarSettings.
- **Task 6.10.6.5:** Client — useWizardSettings from wizard_settings API; BusinessControlsTab independent tab loading; useCalendarHoldFormState and useBusinessControlsFormState; useDifferentialPerspectives with wizardFormData; WizardConfigPanel/Constraints save-button wiring.
- **Task 6.10.6.6:** Bug fixes — TimeBasisButtonGrid (prop/label), useTimeSlotCalculations syntax, BookingWizard duplicate computed/template, useBookingWizardSetup useDhpBrandColors.
- **Task 6.10.6.7:** Verify — App start, client and server lint, smoke-test admin tabs and booking wizard.

## Checkpoint
- Three tables: availability_settings (business_settings row), calendar_settings, wizard_settings; each with GET/PUT singleton CRUD.
- Admin Constraints/Calendar/Wizard tabs load and save independently; booking wizard reads availability + wizard_settings.
- availability_setting_entries and availabilitySettingsRepository removed; lint and app start pass.

## How we build the tierDown to achieve them
- **Task 6.10.6.1:** Server — New tables, models, CRUD
- **Task 6.10.6.2:** Server — Update consumers and model fixes
- **Task 6.10.6.3:** Server — Remove old availability_setting_entries path
- **Task 6.10.6.4:** Client — New configs and composables
- **Task 6.10.6.5:** Client — Tab and form state; wizard/differential wiring
- **Task 6.10.6.6:** Bug fixes
- **Task 6.10.6.7:** Verify

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.10-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.10.5-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
