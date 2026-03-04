# Session 2.0.3 Handoff: Integration Preparation

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.0 - Calendar Configuration UI  
**Session:** 2.0.3 - Integration Preparation  
**Status:** In Progress  
**Started:** 2026-01-31  
**Last Updated:** 2026-01-31

---

## Session Overview

**Session Number:** 2.0.3  
**Session Name:** Integration Preparation  
**Description:** Prepare the existing availability code to read calendar emails from the new configuration, and document integration points for Session 2.1.2.

**Prerequisite:** Session 2.0.2 complete (Calendar Management UI)

---

## Objectives

- Update `getCalendarAvailability` to read calendar emails from settings
- Connect mock data generator to use configured calendars (instead of hardcoded)
- Add logging for calendar configuration usage
- Document integration points for Session 2.1.2

---

## Implementation Tasks

### Task 1: Find getCalendarAvailability Location
**Status:** ✅ Complete

- Located in `client/src/utils/timeSlotCalculations.ts`
- Uses `generateMockFreeBusyResponse` from `mockGoogleCalendar.ts`
- Currently synchronous, returns mock data

### Task 2: Update to Read Calendar Emails from Settings
**Status:** ✅ Complete

- Added import of `getCalendarEmailsArray` from availabilitySettings
- Function now reads `calendarConfig` from settings
- Falls back to `['primary', 'work', 'personal']` if no calendars configured

### Task 3: Update Mock Data Generator
**Status:** ✅ Complete (via Task 2)

- Mock generator now receives configured calendar emails via `calendarIds` parameter
- No changes needed to `mockGoogleCalendar.ts` - it already accepts `calendarIds`

### Task 4: Add Logging
**Status:** ✅ Complete

- Added `logger.debug` call showing:
  - Whether calendars are configured
  - Calendar IDs being used
  - Whether integration is enabled
  - Provider type

### Task 5: Document Integration Points
**Status:** ✅ Complete

See "Integration Points for Session 2.1.2" section below

---

## Key Files

### Files to Modify
- `client/src/utils/timeSlotCalculations.ts` - Update getCalendarAvailability
- Mock data generator file (TBD)

### Reference Files
- `client/src/configs/availabilitySettings.ts` - CalendarConfig and helpers

---

## Success Criteria

- [x] `getCalendarAvailability` reads from settings instead of hardcoded values
- [x] Mock data uses configured calendar emails
- [x] Console logs show calendar config being used
- [x] Integration points documented for Session 2.1.2

---

## Integration Points for Session 2.1.2

This section documents what Session 2.1.2 needs to change to connect real API data.

### Function Signature Changes

**`getCalendarAvailability`** in `client/src/utils/timeSlotCalculations.ts`
- **Current:** `function getCalendarAvailability(dateRange): Array<{start, end}>`
- **Session 2.1.2:** `async function getCalendarAvailability(dateRange, options): Promise<Array<{start, end}>>`
- **New parameter `options`:**
  ```typescript
  interface GetCalendarAvailabilityOptions {
    dataSource: 'real' | 'mock' | 'both' | 'none'
    forceRefresh?: boolean
  }
  ```

### New Files to Create

| File | Purpose |
|------|---------|
| `client/src/services/calendarApiService.ts` | Client-side service to call server API |

### Files to Modify

| File | Changes |
|------|---------|
| `client/src/utils/timeSlotCalculations.ts` | Make `getCalendarAvailability` async, add data source logic |
| `client/src/composables/booking/useBusyTimes.ts` | Add error/loading states, call async function |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | Add data source toggle UI |

### Data Flow (Session 2.1.2)

```
User selects date in booking wizard
    ↓
useBusyTimes composable calls getCalendarAvailability()
    ↓
getCalendarAvailability checks dataSource option:
    - 'real': Call calendarApiService.fetchFreeBusy()
    - 'mock': Call generateMockFreeBusyResponse()
    - 'both': Merge both results
    - 'none': Return empty array
    ↓
calendarApiService.fetchFreeBusy():
    1. Check OAuth status (calendarApiService.checkOAuthStatus())
    2. If not authenticated: return error with authUrl
    3. POST to /api/v1/external/calendar/freebusy
    4. Transform response to BusyTimeRange[] format
    ↓
Return busy times to useBusyTimes
    ↓
Time slots filtered based on busy times
```

### Server Endpoints Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/external/oauth/status` | GET | Check if authenticated |
| `/api/v1/external/oauth` | GET | Start OAuth flow |
| `/api/v1/external/calendar/freebusy` | POST | Get free/busy data |

### Settings Integration

Session 2.0.3 prepared the following:
- `getCalendarEmailsArray(calendarConfig)` - Extracts non-empty calendar emails
- `calendarConfig.enabled` - Whether calendar integration is on
- `calendarConfig.provider` - Which provider (google/outlook/none)

Session 2.1.2 should:
1. Check `calendarConfig.enabled` before calling API
2. Use `getCalendarEmailsArray()` to get calendar emails for API request
3. Show "Calendar integration disabled" if `enabled === false`

---

**Session Status:** Complete  
**Last Updated:** 2026-01-31
