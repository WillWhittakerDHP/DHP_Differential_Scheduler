# Plan: task 6.10.6.2 — Server: Update consumers and model fixes

## Contract
- **Tier:** task | **ID:** 6.10.6.2
- **Scope:** Server — computedAvailabilityService and appointmentHelpers read from new tables; fix business_settings model
- **Governance:** 1 governance highlight

## Where we left off
Task 6.10.6.1 complete; new tables and CRUD exist.

## Goal
computedAvailabilityService: read calendar from CalendarSettings (or calendarSettingsRepository); getReadFromCalendars uses calendar data; fetchAvailabilitySettings returns availability-only. appointmentHelpers: hold duration, admin entry timeout, auto-confirm, write-to calendar all from CalendarSettings. business_settings model: fix updatedAt mapping; remove autoConfirmEnabled; strip calendarConfig, showApplyCoupon, useBrandColors, display labels from AvailabilitySettingsData. constraintExtractor: update if AvailabilitySettingsData changed.

## Files
- `server/src/services/computedAvailabilityService.ts`
- `server/src/routes/internal/appointments/appointmentHelpers.ts`
- `server/src/db/models/admin/business_settings.ts`
- `server/src/services/constraintExtractor.ts` (if needed)
- `server/src/repositories/calendarSettingsRepository.ts` (if added)

## Checkpoint
- Availability and calendar concerns separated server-side; business_settings type and model correct.

---
## Reference
- TierUp guide: `sessions/session-6.10.6-guide.md`
