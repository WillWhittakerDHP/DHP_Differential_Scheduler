# Phase 2.1 Handoff: Google Calendar API Integration

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.1 - Google Calendar API Integration  
**Status:** ✅ Complete  
**Started:** 2026-01-31  
**Completed:** 2026-02-01  
**Last Updated:** 2026-02-01

---

## Phase Overview

**Phase Number:** 2.1  
**Phase Name:** Google Calendar API Integration  
**Description:** Integrate Google Calendar API for fetching availability and creating events. This phase incorporates the detailed Google Calendar Free-Busy API Setup plan.

**Current Status:** ✅ Complete  
**Dependencies:** Phase 2.0 (Calendar Configuration UI) - Can be done in parallel or before

---

## Objectives

- Set up Google Calendar API client
- Implement calendar availability fetching (free-busy API)
- Implement event creation with invitations
- Handle error cases and fallbacks
- **CRITICAL**: Implement rate limiting and caching infrastructure

---

## Detailed Implementation Plan

This phase follows the detailed Google Calendar Free-Busy API Setup plan with 6 implementation phases:

### Phase 1: Google Cloud Console Setup (Verify/Complete)
**Status:** ⏳ Not Started

- Verify Google Cloud Project exists and is active (Project ID: `stone-passage-382818`)
- Enable Google Calendar API
- Verify OAuth Consent Screen configured with required scopes:
  - `https://www.googleapis.com/auth/calendar.readonly`
  - `https://www.googleapis.com/auth/calendar.freebusy`
- Verify OAuth 2.0 Credentials match `.env.development`
- Check authorized redirect URIs include: `http://localhost:3001/auth/callback` or `/api/v1/external/oauth/callback`

### Phase 2: Environment Configuration
**Status:** ⏳ Not Started

- Add `GOOGLE_SCOPES` environment variable to `server/.env.development`
- Add rate limiting configuration variables
- Update `server/src/config/app.ts` to validate Google Calendar env vars (optional)

### Phase 3: OAuth Client Setup
**Status:** ⏳ Not Started

- Create `server/src/config/googleOAuth.ts`
- Initialize OAuth2Client from `googleapis`
- Export functions: `getAuthUrl()`, `getTokens(code)`, `refreshAccessToken()`, `getAuthenticatedClient()`
- Token storage strategy: Start with session storage

### Phase 4: Rate Limiting and Caching Infrastructure ⚠️ **CRITICAL**
**Status:** ⏳ Not Started

**Why Critical**: Google Calendar API enforces per-minute quotas (sliding window). Exceeding quotas returns 403/429 errors. Must be implemented BEFORE making API calls.

- Create `server/src/services/rateLimiter.ts`:
  - Per-API rate limit tracking
  - Sliding window rate limiting (matches Google's quota system)
  - Request queuing for when rate limit is reached
  - Configurable limits per API endpoint
- Create `server/src/services/freeBusyCache.ts`:
  - TTL-based caching (5 min for near-term dates, 15 min for future dates)
  - Cache key: `calendarEmails:timeMin:timeMax` (normalized)
  - Automatic cache invalidation on TTL expiry
  - Memory-efficient (LRU cache or similar)
- Integrate rate limiter and cache into calendar service

### Phase 5: Basic Free-Busy API Endpoint
**Status:** ⏳ Not Started

- Create `server/src/services/googleCalendarService.ts`:
  - Function: `getFreeBusy(calendarEmails: string[], timeMin: Date, timeMax: Date)`
  - Uses `calendar.freebusy.query()` from googleapis
  - Integrates rate limiter and cache
- Update `server/src/routes/external/calendarRoutes.ts`:
  - Uncomment and update existing route structure
  - Add route: `POST /api/v1/external/calendar/freebusy`
- Update `server/src/routes/external/googleOauthRoutes.ts`:
  - Uncomment and update OAuth routes
  - Routes: `GET /api/v1/external/oauth` and `/api/v1/external/oauth/callback`
- Update `server/src/routes/external/index.ts`:
  - Enable calendar and OAuth routes

### Phase 6: Integration Points
**Status:** ⏳ Not Started

- Connect to existing availability system
- Read calendar emails from Business Settings (when Phase 2.0 complete)
- Integration point: `client/src/utils/booking/timeAvailabilityManager.ts`

---

## Sessions Overview

| Session | Name | Status |
|---------|------|--------|
| 2.1.1 | Infrastructure Setup & Free-Busy API | ✅ Complete |
| 2.1.2 | Calendar Availability Integration | ✅ Complete |
| 2.1.3 | Appointment Attendees & Calendar Integration | ✅ Complete |
| 2.1.4 | Full Event Fetching & Location Cache | ✅ Complete |
| 2.1.5 | Error Handling & Fallbacks | ✅ Complete |
| 2.1.6 | Admin API Dev Panel | ✅ Complete |

---

## Session Details

### Session 2.1.1: Infrastructure Setup & Free-Busy API ✅ Complete
- OAuth 2.0 client configuration
- Rate limiting service (sliding window algorithm)
- Free-busy cache service (TTL-based)
- Calendar service with getFreeBusy function
- OAuth and calendar routes
- Tested and verified with real calendar events

### Session 2.1.2: Calendar Availability Integration
- **Prerequisite:** Phase 2.0 complete (calendar configuration available)
- **Create client-side service:** `client/src/services/calendarApiService.ts`
  - `checkOAuthStatus()` - Verify authentication before API calls
  - `fetchFreeBusy()` - Call server endpoint, transform response
- **Add data source toggle to dev panel:**
  - Rename "Mocks" section to "Free/Busy"
  - Options: Real API, Mock Data, Both (merged), None
  - Add "Force Refresh" button (sends `?skipCache=true`)
- **Modify `getCalendarAvailability()`:**
  - Make async, accept `dataSource` parameter
  - Support all four data source modes
  - Read calendar emails from settings
- **Update `useBusyTimes` composable:**
  - Add `error` and `isLoading` states
  - Accept `dataSource` and `calendarEmails` params
- **Error handling (explicit, never silent):**
  - OAuth not authenticated → Show "Connect Google Calendar" prompt
  - API rate limit → Show "Too many requests" message
  - Network error → Show "Could not reach calendar service"
  - Invalid response → Log error, show "Calendar data unavailable"
- **Caching strategy:** Rely on server cache (no client-side cache needed)
- Integration point: `client/src/utils/timeSlotCalculations.ts`

### Session 2.1.3a: Event Creation API & Cache Invalidation ✅ Complete
- ✅ Updated OAuth scopes to include `calendar.events` for write permissions
- ✅ Implemented `createEvent()` function in googleCalendarService
  - Creates calendar events with summary, description, location
  - Supports attendees/invitations with email and displayName
  - Configurable `sendUpdates` option for invitation emails ('all', 'externalOnly', 'none')
  - Integrates rate limiting before API call
- ✅ Added `POST /api/v1/external/calendar/events` endpoint
  - Full request validation (required fields, date validation, attendee validation)
  - Comprehensive error handling (rate limit, auth, permission, not found)
  - Returns created event details including Google Calendar link
- ✅ **Cache Invalidation on Event Creation**
  - Invalidates free-busy cache for affected calendar
  - Invalidates events cache for affected calendar
  - Ensures subsequent availability checks get fresh data
- ✅ Verified compilation and server startup
- ✅ Tested with real Google Calendar (scheduling@districthomepro.com)

### Session 2.1.3b: Appointment Attendees Architecture & Integration ⏳ In Progress
**Goal:** Create proper data architecture for appointment attendees and integrate with calendar event creation on booking submission.

**Detailed Plan:** `~/.cursor/plans/appointment_attendees_architecture_64ca4ea1.plan.md`

**Problem Solved:**
- Current hardcoded `clientId`/`agentId` fields don't scale to multiple attendees
- No connection between EventShapeAttendee (config) and actual Users (with emails)
- Calendar invitations need proper attendee data flow

**Implementation Phases:**

**Phase 1: Database Schema**
- [ ] Create `appointment_attendees` junction table
  - Links appointments to Users with their roles (UserTypeBlock)
  - Tracks invitation status per attendee
  - Stores Google event ID for status tracking
- [ ] Deprecate `clientId`/`agentId` columns (keep for backward compat)

**Phase 2: Server Model & Relationships**
- [ ] Create `AppointmentAttendee` Sequelize model
- [ ] Add relationships in models/index.ts
- [ ] Create `userTypeMapping.ts` utility (bridge hardcoded roles to UserTypeBlocks)

**Phase 3: Server API Updates**
- [ ] Update `appointmentRouter.ts` POST endpoint to accept `attendees` array
- [ ] Create `appointmentCalendarService.ts` for calendar integration on submission
- [ ] Auto-create calendar events when appointment status is 'submitted' or 'confirmed'

**Phase 4: Client Updates**
- [ ] Update `AppointmentRequest` type with `attendees` array
- [ ] Modify `useAppointmentDataCollection.ts` to build attendees array
- [ ] Deprecate `clientId`/`agentId` in request

**Phase 5: Data Migration**
- [ ] Migrate existing appointments to `appointment_attendees` table

**Key Files to Create:**
- `server/src/db/migrations/YYYYMMDD_create_appointment_attendees.mjs`
- `server/src/db/models/booking/appointment_attendee.ts`
- `server/src/utils/userTypeMapping.ts`
- `server/src/services/appointmentCalendarService.ts`

**Key Files to Modify:**
- `server/src/db/models/index.ts`
- `server/src/routes/internal/appointments/appointmentRouter.ts`
- `client/src/types/appointment.ts`
- `client/src/composables/booking/useAppointmentDataCollection.ts`

### Session 2.1.4: Full Event Fetching & Location Cache ✅ Complete
- ✅ Fetch full calendar events using `calendar.events.list()` (not just free-busy)
- ✅ Extract event locations for drive time calculations
- ✅ `calendarEventsCache.ts` service created following `freeBusyCache.ts` pattern
  - `CachedCalendarEvent` interface with id, start, end, location, summary
  - TTL-based caching (5 min near-term, 15 min future)
  - Cache invalidation on calendar changes
  - Debug statistics for dev panel
- ✅ `getCalendarEvents()` function in `googleCalendarService.ts`
  - Uses `calendar.events.list()` with singleEvents and orderBy
  - Rate limiting integration
  - Cache check before API call
- ✅ `GET /api/v1/external/calendar/events` endpoint
  - Query params: calendarEmail, timeMin, timeMax
  - Full validation and error handling
- ✅ Debug endpoint: `GET /api/v1/external/calendar/debug/events-cache`
- ✅ **Verified**: Events with location data returned successfully
- **CRITICAL**: Provides location data needed for Phase 2.2 (Google Maps API)

### Session 2.1.5: Error Handling & Fallbacks ✅ Complete
- ✅ Created `calendarErrorHandler.ts` service with:
  - `CalendarApiError` typed error class (auth, permission, rateLimit, notFound, network, timeout, invalid, unknown)
  - `classifyError()` function to map Google API errors to typed errors
  - `withRetry()` utility for exponential backoff retry (configurable retries, delays, jitter)
  - `withFallback()` utility for graceful degradation (returns cached data on failure)
  - `FallbackResult` type indicates data source (fresh, cache, empty)
- ✅ Updated `getFreeBusy()` with retry and cache fallback
  - Returns `FreeBusyResponseWithMeta` with `_meta.source` indicator
  - Automatic retry (2 attempts) for transient errors
  - Falls back to cached data if all retries fail
- ✅ Updated `getCalendarEvents()` with retry and cache fallback
  - Returns `CalendarEventsResponseWithMeta` with `_meta.source` indicator
  - Same retry/fallback pattern as getFreeBusy
- ✅ Updated `createEvent()` with retry (no fallback - writes must succeed)
- ✅ Updated calendar routes with typed error handling
  - HTTP headers indicate data source (`X-Data-Source: cache-fallback`)
  - Consistent error response format with `type`, `message`, `retryable`
- ✅ Network error detection (ECONNREFUSED, ETIMEDOUT, ENOTFOUND)

### Session 2.1.6: Admin API Dev Panel ✅ Complete
- ✅ `ApiDevPanel.vue` component created with tabbed interface:
  - **OAuth Status Tab**: Authenticated status, token expiry, auth URL
  - **Free-Busy Cache Tab**: Cache stats, entries with expiry, data preview
  - **Events Cache Tab**: Event count, locations, cache entries
  - **Rate Limiter Tab**: Utilization %, requests remaining, visual progress
- ✅ Debug endpoints already implemented:
  - `GET /api/v1/external/oauth/status`
  - `GET /api/v1/external/calendar/debug/freebusy-cache`
  - `GET /api/v1/external/calendar/debug/events-cache`
  - `GET /api/v1/external/calendar/debug/rate-limit`
- ✅ Integrated into `AdminPanel.vue` with bug icon toggle
- ✅ Only visible when `isDevModeEnabled()` returns true
- **WHY**: Provides visibility into API state for debugging and validation

---

## Key Files

### Server Files (All Sessions Complete)
- ✅ `server/src/config/googleOAuth.ts` - OAuth client configuration (updated with calendar.events scope)
- ✅ `server/src/services/rateLimiter.ts` - Rate limiting service
- ✅ `server/src/services/freeBusyCache.ts` - Free-busy caching service (with invalidation)
- ✅ `server/src/services/calendarEventsCache.ts` - Events caching service (with invalidation, location support)
- ✅ `server/src/services/calendarErrorHandler.ts` - Error handling with retry and fallback utilities (Session 2.1.5)
- ✅ `server/src/services/googleCalendarService.ts` - Calendar API service (with retry, fallback, typed errors)
- ✅ `server/src/routes/external/calendarRoutes.ts` - Calendar endpoints (with typed error responses)
- ✅ `server/src/routes/external/googleOauthRoutes.ts` - OAuth endpoints
- ✅ `server/.env.development` - Environment config (updated scopes)

### Client Files (Session 2.1.6 - Complete)
- ✅ `client/src/components/admin/dev/ApiDevPanel.vue` - Admin dev panel with OAuth, cache, rate limiter tabs
- ✅ `client/src/views/admin/AdminPanel.vue` - Updated with FAB-style dev panel toggle
- ✅ `client/src/App.vue` - Hide global booking wizard dev panel on admin routes

### Client Files (Session 2.1.2 - Future Enhancement)
- `client/src/services/calendarApiService.ts` - Client-side calendar API service
- `client/src/composables/booking/useFreeBusyDataSource.ts` - Data source state management
- `client/src/utils/timeSlotCalculations.ts` - Update `getCalendarAvailability()`
- `client/src/composables/booking/useBusyTimes.ts` - Add error/loading states

---

## Error Handling Strategy

**Philosophy: Explicit errors, never silent**

| Scenario | Detection | User Message |
|----------|-----------|--------------|
| OAuth not authenticated | `checkOAuthStatus().authenticated === false` | Show "Connect Google Calendar" prompt |
| API rate limit | 429 status response | "Too many requests. Try again in a moment." |
| Network error | Axios network error | "Could not reach calendar service." |
| Invalid response | Response validation fails | "Calendar data unavailable." |
| Calendar not found | 404 or permission error | "Calendar [email] is not accessible." |

**Key principles:**
- Every error is surfaced to the user
- Errors are logged with full details
- No fallback that hides problems
- User always knows when something is wrong

---

## Current State

### Session 2.1.1 Complete
- ✅ `googleapis` package installed (v144.0.0)
- ✅ OAuth credentials configured in `.env.development`
- ✅ OAuth flow working (tested with real calendar)
- ✅ Rate limiting service implemented
- ✅ Free-busy cache service implemented
- ✅ Calendar and OAuth routes implemented
- ✅ Free-busy endpoint tested with real data

### Session 2.1.3a Complete
- ✅ OAuth scopes updated to include `calendar.events` for write permissions
- ✅ `createEvent()` function implemented with attendee/invitation support
- ✅ `POST /api/v1/external/calendar/events` endpoint added
- ✅ Cache invalidation integrated (both free-busy and events caches)
- ✅ Comprehensive error handling for event creation
- ✅ Server compilation and startup verified
- ✅ Tested with real Google Calendar

### Session 2.1.3 Complete
- ✅ Appointment attendees junction table created
- ✅ Legacy `clientId`/`agentId` columns removed (data migrated)
- ✅ `appointmentCalendarService.ts` creates calendar events on submission
- ✅ Fixed time slot bug (dynamic event name lookup)
- ✅ OAuth token persistence for development
- ✅ Explicit error handling (no silent fallbacks)

### Session 2.1.4 Complete
- ✅ `calendarEventsCache.ts` service created (TTL-based, following freeBusyCache pattern)
- ✅ `getCalendarEvents()` function with rate limiting and caching
- ✅ `GET /api/v1/external/calendar/events` endpoint
- ✅ Debug endpoint for events cache inspection
- ✅ Verified with real calendar - returns events with location data

### Session 2.1.5 Complete
- ✅ `calendarErrorHandler.ts` service with typed errors and retry utilities
- ✅ Exponential backoff with jitter for transient errors
- ✅ Graceful degradation - cached data returned on API failure
- ✅ Network error detection and classification
- ✅ Routes updated with typed error responses

### Session 2.1.6 Complete
- ✅ `ApiDevPanel.vue` with OAuth, cache, and rate limiter tabs
- ✅ Integrated into AdminPanel.vue with FAB toggle (dev mode only)
- ✅ All debug endpoints verified working
- ✅ Fixed dev panel visibility: booking wizard panel hidden on admin routes, admin API panel visible

### Phase 2.1 Complete! 🎉

All sessions in Phase 2.1 (Google Calendar API Integration) are now complete.

### Next Steps
1. **Drive Time Buffer Refactor** (Prerequisite for Phase 2.2)
   - Implement `driveTimeTo`/`driveTimeFrom` dual buffer architecture
   - Add `defaultLocation` field for home/office address
   - Add `applyTo` config for first/last appointment rules
   - **Plan:** `~/.cursor/plans/drive_time_buffer_refactor_f78512ee.plan.md`
2. **Phase 2.2:** Google Maps API Integration (uses new drive time architecture)

---

## Architecture Notes

### Data Source Modes (Session 2.1.2)

Dev panel toggle in "Free/Busy" section:

| Mode | Behavior | Use Case |
|------|----------|----------|
| `real` | Only fetch from Google Calendar API | Production, real testing |
| `mock` | Only use generated mock data | Offline development |
| `both` | Merge real API + mock data | Test edge cases |
| `none` | Return empty array | Test "no conflicts" scenario |

### Rate Limiting Strategy
- **CRITICAL**: Google Calendar API has per-minute quotas (sliding window)
- Rate limiting implemented on server side
- Default: 60 requests/minute (conservative, adjust based on quotas)
- Use sliding window calculation to match Google's quota system

### Caching Strategy
- **CRITICAL**: Cache free-busy responses to reduce API calls
- TTL-based caching: 5 min for near-term dates, 15 min for future dates
- Cache key: `calendarEmails:timeMin:timeMax` (normalized)
- **Server handles all caching** - client always calls server, server returns cached or fresh
- **Force Refresh**: Dev panel button sends `?skipCache=true`
- **Cache Invalidation on Booking** → Session 2.1.3
  - When appointment created, invalidate relevant cache entries
  - Uses `invalidateCache()` from `freeBusyCache.ts`
  - Ensures fresh data for subsequent availability checks

### OAuth Token Storage

**Current (Development):** In-memory storage
- Tokens stored in OAuth2Client instance
- Lost on server restart → requires re-authentication
- Simple, sufficient for development

**Production Requirements:**
- Access tokens expire after ~1 hour (auto-refresh works while server runs)
- Refresh tokens are long-lived but lost on restart
- **Recommended:** Database storage (User model or OAuthTokens table)
- **Alternative:** Encrypted file storage for small deployments

**Implementation Note (Future Session):**
1. Create `OAuthToken` table: `{ userId, accessToken, refreshToken, expiryDate, createdAt }`
2. On OAuth callback: Save tokens to database
3. On server start: Load tokens from database
4. On token refresh: Update database with new access token
5. Consider encryption for token storage

---

## Success Criteria

- ✅ Google Cloud Console setup verified
- ✅ Environment variables configured
- ✅ OAuth client configured and functional
- ✅ Rate limiting service implemented (prevents quota exhaustion)
- ✅ Free-busy cache service implemented (reduces API calls)
- ✅ Calendar service created with getFreeBusy function
- ✅ Calendar and OAuth routes implemented and enabled
- ✅ OAuth flow functional (auth and callback)
- ✅ Free-busy endpoint returns correct data
- ✅ Calendar availability fetched correctly
- ✅ Error handling working with fallbacks
- ✅ Rate limit errors handled gracefully
- ✅ Performance: API response times <2s
- ✅ Event creation endpoint implemented (POST /events)
- ✅ Attendee/invitation support added
- ✅ Cache invalidation on event creation (both free-busy and events caches)

---

## Reference Documents

- **Feature Guide**: `../feature-google-apis-integration-guide.md`
- **Appointment Attendees Architecture Plan**: `~/.cursor/plans/appointment_attendees_architecture_64ca4ea1.plan.md`
- **Google Calendar Free-Busy Setup Plan**: `/Users/districthomepro/.cursor/plans/google_calendar_free-busy_api_setup_cbbaba01.plan.md`
- **Drive Time Buffer Refactor Plan**: `~/.cursor/plans/drive_time_buffer_refactor_f78512ee.plan.md` ⭐ **NEXT IMPLEMENTATION** (prereq for Phase 2.2)
- **React Calendar Calls Reference**: `client/src/scheduler/externalAPI/calendarCalls.ts`
- **Google Calendar API Documentation**: [Free-Busy API](https://developers.google.com/calendar/api/v3/reference/freebusy/query)
- **Google OAuth 2.0 Setup Guide**: [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

---

**Phase Status:** ✅ Complete  
**Current Session:** All sessions complete - Phase 2.1 finished  
**Last Updated:** 2026-02-01

---

## Session Dependencies

**Critical Dependency Chain:**
```
Session 2.1.4 (Full Event Fetching) ✅ Complete
    ↓
    Events with locations cached on server
    ↓
Drive Time Buffer Refactor ⭐ NEXT
    ↓
    - driveTimeTo/driveTimeFrom dual buffer architecture
    - defaultLocation field for home/office address  
    - applyTo config (all, first_only, last_only, none)
    Plan: ~/.cursor/plans/drive_time_buffer_refactor_f78512ee.plan.md
    ↓
Phase 2.2 (Google Maps API)
    ↓
    - Address autocomplete
    - Drive time calculations using event locations + default location
    - Replace static buffer minutes with calculated drive times
```

**Implementation Order:**
1. **Drive Time Buffer Refactor** - Sets up the buffer architecture that Phase 2.2 will populate with real drive times
2. **Phase 2.2** - Calculates actual drive times using Google Maps Distance Matrix API

**Note:** The Drive Time Buffer Refactor should be completed before Phase 2.2 begins. This ensures the buffer architecture is in place to receive calculated drive times from the Google Maps API.
