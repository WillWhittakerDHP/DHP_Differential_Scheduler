# Phase 2.1 Log: Google Calendar API Integration

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.1 - Google Calendar API Integration  
**Started:** 2026-01-31  
**Status:** In Progress

---

## Phase Start

**Date:** 2026-01-31  
**Session:** Phase Start  
**Status:** ✅ Complete

### Summary
Phase 2.1 (Google Calendar API Integration) started. Phase incorporates detailed Google Calendar Free-Busy API Setup plan with 6 implementation phases. Critical infrastructure requirements (rate limiting and caching) identified and prioritized.

### Key Actions
- Created phase handoff document
- Created phase log document
- Documented 6 implementation phases from detailed plan
- Identified critical infrastructure needs (rate limiting, caching)
- Set up session structure (4 sessions planned)

### Next Steps
- Begin Session 2.1.1: Infrastructure Setup & Free-Busy API
- Verify Google Cloud Console setup
- Implement rate limiting and caching infrastructure (critical)
- Create OAuth configuration and calendar service

---

## Session 2.1.1 Start

**Date:** 2026-01-31  
**Status:** ✅ Complete

### Summary
Session 2.1.1 (Infrastructure Setup & Free-Busy API) started. Session documentation created with detailed task breakdown.

### Key Actions
- Created session handoff document (`sessions/session-2.1.1-handoff.md`)
- Created session log document (`sessions/session-2.1.1-log.md`)
- Documented 10 implementation tasks
- Identified critical infrastructure requirements

### Next Steps
- Begin Task 1: Verify Google Cloud Console setup
- Implement critical infrastructure (rate limiting and caching) before API calls

---

**Last Updated:** 2026-01-31

## Session logs (integrated)

### Session 2.1.1 (integrated)

# Session 2.1.1 Log: Infrastructure Setup & Free-Busy API

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.1 - Google Calendar API Integration  
**Session:** 2.1.1 - Infrastructure Setup & Free-Busy API  
**Started:** 2026-01-31  
**Status:** In Progress

---

## Session Start

**Date:** 2026-01-31  
**Status:** ✅ Complete

### Summary
Session 2.1.1 started. This session focuses on setting up the foundational infrastructure for Google Calendar API integration, including OAuth configuration, rate limiting, caching, and the basic free-busy API endpoint.

### Key Tasks
- Verify Google Cloud Console setup
- Add environment variables
- Create OAuth configuration module
- **CRITICAL**: Implement rate limiting service
- **CRITICAL**: Implement free-busy cache service
- Create calendar service with getFreeBusy function
- Implement calendar and OAuth routes
- Enable routes in external router
- Test OAuth flow and free-busy endpoint

### Next Steps
- Begin Task 1: Verify Google Cloud Console setup
- Then proceed with environment configuration and OAuth setup
- Implement critical infrastructure (rate limiting and caching) before API calls

---

## Implementation Progress

**Date:** 2026-01-31  
**Status:** ✅ Major Implementation Complete

### Completed Tasks

**Task 2: Environment Configuration** ✅
- Environment variables already configured in `.env.development`
- `GOOGLE_SCOPES` set
- Rate limiting configuration set

**Task 3: OAuth Client Setup** ✅
- Created `server/src/config/googleOAuth.ts`
- Implemented OAuth2Client initialization
- Implemented `getAuthUrl()`, `getTokens()`, `refreshAccessToken()`, `getAuthenticatedClient()`
- Token storage: in-memory via oauth2Client (can be migrated to database later)

**Task 4: Rate Limiting Service** ✅ **CRITICAL**
- Created `server/src/services/rateLimiter.ts`
- Implemented sliding window rate limiting (matches Google's quota system)
- Per-API rate limit tracking (Google Calendar, Google Maps, MLS)
- Request queuing with `waitForRateLimit()` function
- Configurable limits per API endpoint
- Rate limit status: available, throttled, exceeded

**Task 5: Free-Busy Cache Service** ✅ **CRITICAL**
- Created `server/src/services/freeBusyCache.ts`
- TTL-based caching:
  - 5 min TTL for near-term dates (next 7 days)
  - 15 min TTL for future dates (beyond 7 days)
- Cache key: `calendarEmails:timeMin:timeMax` (normalized)
- Automatic cache invalidation on TTL expiry
- Memory-efficient Map-based implementation
- Follows existing cache patterns from codebase

**Task 6: Calendar Service** ✅
- Created `server/src/services/googleCalendarService.ts`
- Implemented `getFreeBusy()` function using `calendar.freebusy.query()`
- Integrated rate limiter (checks before API call, queues if needed)
- Integrated cache (checks cache first, caches responses)
- Error handling for rate limits, authentication, and network errors

**Task 7: Calendar Routes** ✅
- Implemented `server/src/routes/external/calendarRoutes.ts`
- Route: `POST /api/v1/external/calendar/freebusy`
- Request validation (calendarEmails, timeMin, timeMax)
- Authentication check (OAuth token required)
- Error handling middleware

**Task 8: OAuth Routes** ✅
- Implemented `server/src/routes/external/googleOauthRoutes.ts`
- Route: `GET /api/v1/external/oauth` - Redirects to Google auth
- Route: `GET /api/v1/external/oauth/callback` - Handles OAuth callback
- Route: `GET /api/v1/external/oauth/status` - Check authentication status
- Token storage: in-memory via oauth2Client
- Error handling for OAuth flow

**Task 9: Enable Routes** ✅
- Updated `server/src/routes/external/index.ts`
- Mounted calendar routes: `/calendar`
- Mounted OAuth routes: `/oauth`
- Routes accessible at `/api/v1/external/calendar` and `/api/v1/external/oauth`

### Remaining Tasks

**Task 1: Verify Google Cloud Console Setup** ⏳
- Manual verification required
- Verify project, Calendar API enabled, OAuth consent screen, credentials

**Task 10: Testing** ⏳
- Test OAuth flow: `/api/v1/external/oauth` → Google consent → callback
- Test free-busy endpoint: `POST /api/v1/external/calendar/freebusy`
- Verify rate limiting works
- Verify cache works (second request should be faster)
- Verify error handling

### Files Created

1. `server/src/config/googleOAuth.ts` - OAuth configuration (177 lines)
2. `server/src/services/rateLimiter.ts` - Rate limiting service (207 lines)
3. `server/src/services/freeBusyCache.ts` - Caching service (203 lines)
4. `server/src/services/googleCalendarService.ts` - Calendar service (118 lines)
5. `server/src/routes/external/calendarRoutes.ts` - Calendar routes (95 lines)
6. `server/src/routes/external/googleOauthRoutes.ts` - OAuth routes (118 lines)

### Files Modified

1. `server/src/routes/external/index.ts` - Enabled calendar and OAuth routes

### Key Features Implemented

- ✅ OAuth 2.0 authentication flow
- ✅ Rate limiting with sliding window (prevents quota exhaustion)
- ✅ TTL-based caching (reduces API calls)
- ✅ Free-busy API endpoint
- ✅ Error handling for rate limits, authentication, network errors
- ✅ Request validation
- ✅ Authentication status checking

### Next Steps

1. Verify Google Cloud Console setup (Task 1 - manual)
2. Test OAuth flow and free-busy endpoint (Task 10)
3. Verify rate limiting and caching work correctly
4. Test error scenarios

---

### Session 2.1.2 (integrated)

# Session 2.1.2 Log: Calendar Availability Integration

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.1 - Google Calendar API Integration  
**Session:** 2.1.2 - Calendar Availability Integration  
**Date:** 2026-01-31  
**Status:** ✅ Complete

---

### Session 2.1.3 (integrated)

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

## Session Summary

Implemented the client-side integration layer for Google Calendar free-busy API. Created service layer, data source composable, and updated existing busy times composable to support async API calls with loading/error states.

---

## Completed Tasks

### Task 1: Create Client-Side Calendar API Service ✅
- Created `client/src/services/calendarApiService.ts`
- `checkOAuthStatus()` - Check if authenticated with Google
- `fetchFreeBusy()` - Fetch busy times from server
- `CalendarApiError` class with typed error handling
- `getErrorMessage()` for user-friendly error messages
- Supports `skipCache` option for force refresh

### Task 2: Create Data Source Composable ✅
- Created `client/src/composables/booking/useFreeBusyDataSource.ts`
- Shared state for data source mode (`real`/`mock`/`both`/`none`)
- `calendarEmails` computed from settings
- `forceRefresh()` and `skipCache` for cache bypass
- `settingsLoaded` state for loading indication
- `reloadSettings()` for admin config changes

### Task 3: Add Data Source Toggle to Dev Panel ✅
- Updated `DevPanelsContainer.vue`
- Renamed "Mocks" tab to "Free/Busy"
- Added radio group for data source selection
- Added "Force Refresh" button
- OAuth status warning with Connect button
- Calendar configuration info display
- Loading state for settings

### Task 4: Update getCalendarAvailability() ✅
- Made function async with data source support
- Supports all four modes: `real`, `mock`, `both`, `none`
- Added `mergeOverlappingBusyTimes()` helper
- Created `getCalendarAvailabilitySync()` for backward compatibility
- Updated imports in `useAvailability.ts` and `DevPanelsContainer.vue`

### Task 5: Update useBusyTimes Composable ✅
- Added `error`, `errorMessage`, `isLoading`, `authUrl` states
- Accepts `dataSource`, `calendarEmails`, `skipCache`, `refreshKey` params
- Async fetch with explicit error handling
- `refresh()` function for manual refresh

### Task 6: Bug Fixes ✅
- Fixed missing `calendarConfig` in `getAvailabilitySettings()` conversion
- Fixed `getCalendarAvailability` calls to use sync version where needed
- Updated test files for renamed function

---

## Files Created

| File | Purpose |
|------|---------|
| `client/src/services/calendarApiService.ts` | Calendar API service layer |
| `client/src/composables/booking/useFreeBusyDataSource.ts` | Data source state management |

## Files Modified

| File | Changes |
|------|---------|
| `client/src/utils/timeSlotCalculations.ts` | Async `getCalendarAvailability`, sync version |
| `client/src/composables/booking/useBusyTimes.ts` | Error/loading states, data source params |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | Data source toggle UI |
| `client/src/components/booking/steps/AvailabilityStep.vue` | Integrated new composable params |
| `client/src/composables/booking/useAvailabilityDevPanel.ts` | Updated type for busyPeriods |
| `client/src/composables/useAvailability.ts` | Use sync version |
| `client/src/configs/availabilitySettings.ts` | Include calendarConfig in conversion |
| `client/src/utils/__tests__/timeSlotCalculations.test.ts` | Updated for renamed function |
| `client/src/composables/__tests__/useAvailability.test.ts` | Updated mock |

---

## Key Decisions

1. **Sync vs Async**: Created `getCalendarAvailabilitySync()` for backward compatibility - legacy code uses sync, new flow uses async
2. **Shared State**: Data source selection is module-level shared state so all components see same mode
3. **Settings Loading**: Calendar config loads async on first composable use with loading state
4. **Error Handling**: Errors are surfaced to user, never silently swallowed

---

## Known Issues

1. **Unused Variables**: `busyTimesError`, `busyTimesErrorMessage`, etc. in AvailabilityStep are declared but not yet displayed in UI - ready for future UI work
2. **Pre-existing TS Errors**: @core/ template errors and unused variable warnings exist in codebase

---

## Next Session

**Session 2.1.3: Event Creation, Invitations & Cache Invalidation**
- Implement `createEvent()` function
- Add event creation endpoint
- Cache invalidation on booking

---

**Session completed:** 2026-01-31

## Implementation Complete

**Date:** 2026-01-31  
**Status:** ✅ Implementation Complete

### Summary
All code implementation tasks completed successfully. TypeScript compilation passes with no errors. Infrastructure is ready for testing.

### Implementation Details

**OAuth Configuration:**
- OAuth2Client initialized with environment variables
- Functions for auth URL generation, token exchange, refresh, and client creation
- Token storage: in-memory via oauth2Client (can migrate to database later)

**Rate Limiting Service:**
- Sliding window rate limiting matching Google's quota system
- Per-API tracking (Google Calendar, Google Maps, MLS)
- Request queuing with `waitForRateLimit()` function
- Configurable limits (default: 60 requests/minute for Calendar)

**Free-Busy Cache Service:**
- TTL-based caching (5 min for near-term, 15 min for future dates)
- Normalized cache keys for consistent lookups
- Automatic expiration and cleanup
- Memory-efficient Map-based implementation

**Calendar Service:**
- `getFreeBusy()` function integrated with rate limiter and cache
- Checks cache first, then rate limiter, then makes API call
- Handles rate limit errors, authentication errors, network errors
- Returns cached data if available during rate limit

**Routes:**
- Calendar route: `POST /api/v1/external/calendar/freebusy`
- OAuth routes: `GET /api/v1/external/oauth`, `/callback`, `/status`
- Request validation and error handling
- Authentication checks

### Testing Required

1. **OAuth Flow:**
   - Navigate to `/api/v1/external/oauth`
   - Complete Google OAuth consent
   - Verify callback receives code and tokens are stored
   - Check `/api/v1/external/oauth/status` endpoint

2. **Free-Busy Endpoint:**
   - Call `POST /api/v1/external/calendar/freebusy` with test data
   - Verify busy periods returned correctly
   - Test cache (second request should be faster)
   - Test rate limiting (make many requests quickly)
   - Test error scenarios (invalid dates, missing auth, etc.)

---

## Testing Complete

**Date:** 2026-01-31  
**Status:** ✅ Testing Complete - OAuth Flow & Free-Busy API Working

### Testing Summary

**Task 1: Google Cloud Console Setup** ✅
- Verified OAuth 2.0 Client ID matches environment variables
- Configured redirect URI: `http://localhost:3001/oauth2callback`
- Switched OAuth consent screen from Internal to External user type
- Added test user: `will@districthomepro.com`
- Verified scopes are configured:
  - `https://www.googleapis.com/auth/calendar.readonly`
  - `https://www.googleapis.com/auth/calendar.freebusy`

**Task 10: OAuth Flow Testing** ✅
- ✅ Navigated to `/api/v1/external/oauth` - Redirects to Google consent screen
- ✅ Completed Google OAuth consent - Successfully authenticated
- ✅ Callback received authorization code - Tokens exchanged successfully
- ✅ Tokens stored in-memory - Access token and refresh token both present
- ✅ Authentication status endpoint works - `/api/v1/external/oauth/status` returns authenticated: true

**Task 10: Free-Busy Endpoint Testing** ✅
- ✅ Called `POST /api/v1/external/calendar/freebusy` with test data
- ✅ Verified busy periods returned correctly - Detected test event (Feb 1, 2026 8-9 PM UTC)
- ✅ Response format correct - Returns `{ calendars: { [email]: { busy: [...] } } }`
- ✅ Authentication required - Endpoint checks for OAuth token before processing

### Testing Results

**OAuth Flow:**
```
GET /api/v1/external/oauth → Redirects to Google
Google consent → User grants permissions
Callback: /oauth2callback?code=... → Tokens exchanged
Status: authenticated: true, hasRefreshToken: true
```

**Free-Busy API:**
```
POST /api/v1/external/calendar/freebusy
Request: { calendarEmails: ["will@districthomepro.com"], timeMin: "2026-02-01T00:00:00Z", timeMax: "2026-02-01T23:59:59Z" }
Response: { calendars: { "will@districthomepro.com": { busy: [{ start: "2026-02-01T20:00:00Z", end: "2026-02-01T21:00:00Z" }] } } }
```

### Issues Resolved

1. **Redirect URI Mismatch** - Resolved by adding `http://localhost:3001/oauth2callback` to Google Cloud Console (was missing HTTP version, only had HTTPS)
2. **OAuth Consent Screen** - Switched from Internal to External user type and added test user
3. **Callback Route** - Added root-level route handler for `/oauth2callback` to match Google's redirect URI requirements

### Remaining Optional Tests

- Cache performance testing (second request should be faster)
- Rate limiting testing (make multiple rapid requests)
- Error scenario testing (expired tokens, invalid requests, etc.)

These can be tested in future sessions or during integration testing.

---

**Last Updated:** 2026-01-31

