# Session 6.10.6 Guide: Settings Architecture Cleanup — Three-Table Separation

**Phase:** 6.10 — Fee Preview & Coupon Visibility  
**Session:** 6.10.6 — Settings Architecture Cleanup (Three-Table Separation)  
**Status:** Complete  
**Branch:** TBD

**Depends on:** Session 6.10.5 (Wizard sub-tab and consolidated wizard settings). This session refactors the backend and client so settings live in three singleton tables with clean CRUD and independent tab load/save.

---

## Quick Start

**Session 6.10.6** splits the monolithic availability/business settings into three tables: **availability_settings** (business_settings row), **calendar_settings**, **wizard_settings**. Each has a singleton GET/PUT CRUD router and dedicated client composable. The availability_setting_entries table and repository are removed. Run tasks in order: 6.10.6.1 → 6.10.6.7.

---

## Session Workflow

Work tasks in order (6.10.6.1 through 6.10.6.7). After the last task, run session-end (verification, lint, app start).

---

## Session Overview

- **Problem:** One blob held availability, calendar, and wizard settings; availability_setting_entries fragmented data with no benefit; CRUD router was a 300+ line multi-branch router.
- **Target:** Three singleton tables; each table has one row, GET / and PUT /; ~30-line routers; client configs and composables per concern.
- **Data ownership:** availability_settings = businessHours, minuteIncrement, rangeConstraints, buffers, capacity, durationRounding, defaultLocation, timezone, differentialPerspectives (majorAttendees, minorAttendees only). calendar_settings = enabled, provider, calendars, holdDuration*, adminEntryTimeout, autoConfirmEnabled. wizard_settings = showApplyCoupon, useBrandColors, all display labels (majorLabel, minorLabel, subStepLabels, etc.).

---

## Key Context

- **Singleton CRUD:** GET / returns the single row’s JSONB; PUT / upserts (no POST/DELETE). Mount at `/calendar-settings` and `/wizard-settings`; business_settings remains for availability_settings key only.
- **useDifferentialPerspectives:** In Admin, pass `wizardFormData` so label fields read/write wizard_settings; attendee arrays stay in availability formData.
- **Save buttons:** Constraints tab uses `constraintsSaveButtonProps` (availability); Calendar tab uses `saveButtonProps` / `calendarSaveButtonProps`; Wizard tab uses `wizardSaveButtonProps`. Each tab’s Save triggers that tab’s save handler.
- **calendarSettings export:** `useCalendarHoldFormState` imports from `@/configs/calendarSettings`; that config must export `isValidCalendarEmail` (add in `calendarSettings/validation.ts` and re-export from index).

---

## Tasks

### Task 6.10.6.1: Server — New tables, models, CRUD
Create CalendarSettings and WizardSettings models and migrations; create calendar_settings and wizard_settings tables; migration to split existing blob and drop availability_setting_entries; singleton CRUD routers for calendar-settings and wizard-settings; simplify businessSettingsCrudRouter to availability row only.

### Task 6.10.6.2: Server — Update consumers and model fixes
computedAvailabilityService and appointmentHelpers read from new tables; fix business_settings model (updatedAt, strip calendar/wizard fields from AvailabilitySettingsData); calendarSettingsRepository if needed.

### Task 6.10.6.3: Server — Remove old code
Delete availabilitySettingsRepository, availability_setting_entry model, related migrations; remove AvailabilitySettingEntry from model registry.

### Task 6.10.6.4: Client — New configs and composables
Create calendarSettings and wizardSettings configs (types, api, validation); useAdminCalendarSettings and useAdminWizardSettings; strip moved fields from availability configs; export isValidCalendarEmail from calendarSettings.

### Task 6.10.6.5: Client — Tab and form state; wizard/differential wiring
useWizardSettings reads from wizard_settings API; BusinessControlsTab loads availability, calendar, wizard independently; useCalendarHoldFormState and useBusinessControlsFormState use calendar/wizard formData; useDifferentialPerspectives accepts wizardFormData; WizardConfigPanel uses wizardSaveButtonProps; Constraints section uses constraintsSaveButtonProps.

### Task 6.10.6.6: Bug fixes
TimeBasisButtonGrid (startTimeType, minorLabel); useTimeSlotCalculations syntax; BookingWizard duplicate computed/template; useBookingWizardSetup useDhpBrandColors.

### Task 6.10.6.7: Verify
App start (npm run start:dev); client and server lint; smoke-test admin Constraints/Calendar/Wizard load and save, and booking wizard.

---

## Success Criteria

- [x] Three tables with singleton CRUD; no availability_setting_entries.
- [x] Admin Constraints/Calendar/Wizard tabs load and save independently.
- [x] Booking wizard reads availability + wizard_settings; useWizardSettings from getWizardSettings().
- [x] Lint and app start pass.
- [x] Post-session fix: isValidCalendarEmail exported from calendarSettings (fixes Admin Business tab async component loader error).

---

## Related Documents

- Phase 6.10 guide: `phases/phase-6.10-guide.md`
- Session 6.10.5 guide: `session-6.10.5-guide.md`
- Plan: `session-6.10.6-planning.md`
- Handoff: `session-6.10.6-handoff.md`
- Log: `session-6.10.6-log.md`
