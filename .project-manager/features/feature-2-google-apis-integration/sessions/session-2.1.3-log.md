# Session 2.1.3 Log: Appointment Attendees & Calendar Integration

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.1 - Google Calendar API Integration  
**Session:** 2.1.3 - Appointment Attendees Architecture & Calendar Integration  
**Date:** 2026-02-01  
**Status:** ✅ Complete

---

## Session Summary

Implemented the `appointment_attendees` architecture to replace hardcoded `clientId`/`agentId` fields, integrated Google Calendar event creation with appointment submission, fixed critical time slot bugs, and added OAuth token persistence for development convenience.

---

## Completed Tasks

### Task 1: Appointment Attendees Architecture ✅
- Created `appointment_attendees` junction table with migrations
- Replaced hardcoded `clientId`/`agentId` with flexible N-attendee system
- Implemented `AppointmentAttendee` Sequelize model with relationships
- Created data migration to transfer legacy data
- Removed deprecated columns (`clientId`, `agentId`, `additionalContacts`)

### Task 2: Calendar Event Creation Integration ✅
- Created `server/src/services/appointmentCalendarService.ts`
- `createCalendarEventForAppointment()` - Creates Google Calendar events with attendees
- Integrated into `appointmentRouter.ts` POST handler
- Events created when appointment status is 'submitted' or 'confirmed'
- Updates `AppointmentAttendee` records with `googleEventId` and `invitationStatus`

### Task 3: Fixed Time Slot Bug (Critical) ✅
- **Problem:** Hardcoded `'Major'`/`'Minor'` event names didn't match actual event shapes (`'OnSite'`/`'ClientPresent'`)
- **Result:** Calendar events were created with wrong times (defaulting to 09:00)
- **Solution:** Implemented dynamic event name lookup using `availabilitySettings.differentialPerspectives`
- Updated `client/src/utils/booking/availabilityStepData.ts`:
  - Now uses `getMajorEventShape()` and `getMinorEventShape()` with attendee-based lookup
  - Falls back to `totalTimeRange` when no settings available
- Updated `client/src/composables/booking/useAvailabilityStepData.ts` to pass settings

### Task 4: Removed Legacy Fallbacks ✅
- **Philosophy:** Explicit failure over silent fallback
- Removed legacy time format fallback in `appointmentCalendarService.ts`
- Now throws explicit errors when time slot data is missing:
  - `"Appointment {id} has no selectedTimeSlots - cannot create calendar event"`
  - `"Appointment {id} time slot missing required fields. Expected RFC3339 format"`
- Updated `TimeSlot` interface to require `startTime` and `endTime`

### Task 5: Type Consolidation ✅
- Fixed duplicate `AvailabilityStepData` interface definitions
- Consolidated to single canonical source: `client/src/utils/booking/availabilityStepData.ts`
- Updated re-exports in:
  - `client/src/composables/booking/useAppointmentDataCollection.ts`
  - `client/src/types/wizardStepData.ts`

### Task 6: OAuth Token Persistence ✅
- Added file-based token storage for development convenience
- Created `saveTokensToFile()` and `loadTokensFromFile()` in `googleOAuth.ts`
- Tokens automatically loaded on server startup
- Tokens saved after OAuth callback
- Added `.google-tokens.json` to `.gitignore`
- No more re-authentication needed after server restarts

---

## Key Files

### New Files Created
- `server/src/services/appointmentCalendarService.ts` - Calendar event creation service
- `server/src/db/migrations/20260204_000019_migrate_appointments_to_attendees.mjs`
- `server/src/db/migrations/20260204_000020_remove_legacy_attendee_columns.mjs`
- `server/src/db/migrations/20260204_000021_remove_email_unique_constraint_in_dev.mjs`

### Files Modified
- `server/src/config/googleOAuth.ts` - Added token persistence
- `server/src/app.ts` - Load tokens on startup, save on callback
- `server/src/routes/external/googleOauthRoutes.ts` - Save tokens on callback
- `server/src/routes/internal/appointments/appointmentRouter.ts` - Calendar integration
- `client/src/utils/booking/availabilityStepData.ts` - Dynamic event name lookup
- `client/src/composables/booking/useAvailabilityStepData.ts` - Pass availability settings
- `client/src/composables/booking/useAppointmentDataCollection.ts` - Re-export types
- `client/src/types/wizardStepData.ts` - Re-export types
- `client/src/types/appointment.ts` - Updated selectedTimeSlots type

---

## Architecture Notes

### Attendee-Based Event Name Lookup
The booking system uses configurable event shapes (e.g., `'OnSite'`, `'ClientPresent'`) rather than hardcoded names. The lookup flow:
1. Get `majorAttendees`/`minorAttendees` from `availabilitySettings.differentialPerspectives`
2. Use `getMajorEventShape()` to find event shape matching major attendees
3. Use event shape's `name` property to look up time range from `eventTimeRanges`

### Token Persistence
For development convenience, OAuth tokens are saved to `.google-tokens.json`:
- Loaded automatically on server startup
- Refresh token enables auto-renewal of expired access tokens
- File is gitignored (contains sensitive credentials)

---

## Bugs Fixed

1. **Calendar times wrong (09:00 instead of selected time)**
   - Root cause: Hardcoded `'Major'`/`'Minor'` didn't match actual event names
   - Fix: Dynamic lookup using attendee-based event shape matching

2. **OAuth tokens lost on restart**
   - Root cause: Tokens only stored in memory
   - Fix: File-based persistence with auto-load on startup

3. **Silent fallbacks hiding errors**
   - Root cause: Legacy format fallback masked data issues
   - Fix: Explicit errors when time data is malformed

---

## Success Criteria

- ✅ Appointment attendees stored in junction table (not hardcoded fields)
- ✅ Google Calendar events created on appointment submission
- ✅ Calendar invitations sent to attendees
- ✅ Selected time correctly reflected in calendar event
- ✅ OAuth tokens persist across server restarts
- ✅ Explicit error messages when time data is invalid
- ✅ No silent fallbacks that hide problems

---

**Session Status:** ✅ Complete  
**Last Updated:** 2026-02-01
