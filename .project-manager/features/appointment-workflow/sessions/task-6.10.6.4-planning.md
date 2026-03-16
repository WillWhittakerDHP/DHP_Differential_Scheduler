# Plan: task 6.10.6.4 — Client: New configs and composables

## Contract
- **Tier:** task | **ID:** 6.10.6.4
- **Scope:** Client — calendarSettings and wizardSettings configs and types; useAdminCalendarSettings, useAdminWizardSettings; strip availability configs; isValidCalendarEmail in calendarSettings
- **Governance:** 1 governance highlight

## Where we left off
Task 6.10.6.3 complete; server uses three tables.

## Goal
Create client/src/configs/calendarSettings/ (types, api, validation with isValidCalendarEmail, index); client/src/configs/wizardSettings/ (types, api, index). Create useAdminCalendarSettings and useAdminWizardSettings (load/save). Strip calendarConfig, showApplyCoupon, useBrandColors, display labels from availabilitySettings types and api; remove second-argument from buildAvailabilityPayload. Ensure useCalendarHoldFormState can import isValidCalendarEmail from @/configs/calendarSettings.

## Files
- client/src/configs/calendarSettings/, wizardSettings/
- client/src/composables/admin/useAdminCalendarSettings.ts, useAdminWizardSettings.ts
- client/src/configs/availabilitySettings/types.ts, api.ts, index.ts
- client/src/composables/admin/useAdminAvailabilitySettings.ts
- client/src/composables/admin/useCalendarHoldFormState.ts (imports from calendarSettings)

## Checkpoint
- Calendar and wizard configs and admin composables exist; availability config no longer contains moved fields; Admin Business tab loads (isValidCalendarEmail exported).

---
## Reference
- TierUp guide: `sessions/session-6.10.6-guide.md`
