# Feature 2: Google APIs Integration

**Feature:** Google APIs Integration  
**Status:** Planning  
**Created:** 2025-02-01  
**Last Updated:** 2025-01-07  
**Branch:** `feature/google-apis-integration`

---

## Overview

Integrate Google Calendar API (availability fetching, event creation), Google Maps API (address autocomplete, drive time), and MLS API (property data - deferrable). This feature provides the external API integration layer for the scheduling application.

**Target:** Functional API clients for Google Calendar, Google Maps, and MLS APIs with proper error handling and fallback strategies.

---

## Phase 2.0: Calendar Configuration UI (Prerequisite)

**Status:** Planning  
**Description:** Build admin interface for configuring which calendars to check for free-busy calculations. This phase establishes the configuration foundation before API integration.

### Objectives

- Extend AvailabilitySettings interface with calendar configuration
- Create calendar management UI in Business Controls tab with labeled calendar fields
- Match calendar structure to existing mock data (`primary`, `work`, `personal`)
- Prepare plugin architecture for multiple calendar providers
- Document integration points for OAuth flow (future)

### Key Files

- `client/src/configs/availabilitySettings.ts` (extend interface)
- `client/src/views/admin/tabs/BusinessControlsTab.vue` (add calendar section)
- `client/src/utils/timeSlotCalculations.ts` (update to read from settings)
- `server/src/routes/internal/businessSettings/` (settings storage)

### Sessions

**Session 2.0.1: Calendar Configuration Data Structure**
- Extend AvailabilitySettings interface with CalendarConfig
- Define CalendarConfig type with labeled calendar fields matching mock structure:
  ```typescript
  interface CalendarConfig {
    enabled: boolean
    provider: 'google' | 'outlook' | 'none'
    calendars: {
      primary: string    // e.g., "will@districthomepro.com"
      work: string       // Optional, empty if not used
      personal: string   // Optional, empty if not used
    }
  }
  ```
- Add calendarConfig to default settings
- Update API types for settings persistence
- Add validation for calendar email format

**Session 2.0.2: Calendar Management UI**
- Add calendar configuration section to BusinessControlsTab
- Implement three labeled email input fields:
  - **Primary Calendar:** (auto-filled from OAuth user email when connected)
  - **Work Calendar:** (optional)
  - **Personal Calendar:** (optional)
- Add provider selection dropdown (Google, Outlook, None)
- Add enable/disable toggle for calendar integration
- Add informational alert for upcoming OAuth feature
- Email validation on blur

**Session 2.0.3: Integration Preparation**
- Update getCalendarAvailability to read calendar emails from settings
- Create helper to extract non-empty calendar emails as array
- Add logging for calendar configuration usage
- Document integration points for Session 2.1.2

### Success Criteria

- [ ] CalendarConfig type defined with provider, enabled, calendars (primary/work/personal)
- [ ] AvailabilitySettings interface extended with calendarConfig
- [ ] Default settings include empty calendar configuration
- [ ] Admin can configure calendar emails via labeled fields
- [ ] Settings persist to database via business-settings API
- [ ] Settings load correctly on page load
- [ ] Email validation working (format check)
- [ ] Provider dropdown functional (Google, Outlook, None)
- [ ] Enable/disable toggle functional
- [ ] Calendar field labels match mock data IDs for consistency
- [ ] Structure ready for OAuth integration in Phase 2.1

### Architecture Notes

**Calendar Config Structure (matches mock data IDs):**
```
CalendarConfig
├── provider: 'google' | 'outlook' | 'none'
├── enabled: boolean
└── calendars:
    ├── primary: string   // Maps to 'primary' in mock
    ├── work: string      // Maps to 'work' in mock
    └── personal: string  // Maps to 'personal' in mock

Future Plugin Interface:
├── CalendarProvider (abstract)
│   ├── authenticate()
│   ├── getFreeBusy(emails, dateRange)
│   └── createEvent(eventData)
├── GoogleCalendarProvider (implements CalendarProvider)
└── OutlookCalendarProvider (implements CalendarProvider)
```

**Data Flow:**
```
BusinessControlsTab → API (PUT /business-settings) → Database
                                    ↓
getAvailabilitySettings() → CalendarConfig → getCalendarAvailability()
                                    ↓
            (Future) CalendarProvider.getFreeBusy() → busyTimes
```

### Dependencies

- Availability settings infrastructure exists (Phase complete in Data Flow Alignment)
- Business Controls tab exists (implemented)

### Questions to Resolve

1. Should calendar emails be validated against actual calendar accounts? (Defer to OAuth phase)
2. How should we handle calendar access permissions? (Defer to OAuth phase)
3. Should we support calendar groups/teams? (Future enhancement)
4. What's the fallback behavior when calendar API fails? (Document in Phase 2.1)

---

## Phase 2.1: Google Calendar API Integration

**Status:** In Progress  
**Description:** Integrate Google Calendar API for fetching availability and creating events. This phase incorporates the detailed Google Calendar Free-Busy API Setup plan.

**Detailed Plan Reference:** `/Users/districthomepro/.cursor/plans/google_calendar_free-busy_api_setup_cbbaba01.plan.md`

### Objectives

- Set up Google Calendar API client
- Implement calendar availability fetching (free-busy API)
- Implement event creation with invitations
- Handle error cases and fallbacks
- **CRITICAL**: Implement rate limiting and caching infrastructure

### Key Files

- `client/src/scheduler/externalAPI/calendarCalls.ts` (React - reference)
- `server/src/config/googleOAuth.ts` (OAuth configuration)
- `server/src/services/rateLimiter.ts` (**CRITICAL**)
- `server/src/services/freeBusyCache.ts` (**CRITICAL**)
- `server/src/services/googleCalendarService.ts` (Calendar service)
- `server/src/services/calendarEventsCache.ts` (Events cache - Session 2.1.4)
- `server/src/routes/external/calendarRoutes.ts` (Calendar routes)
- `server/src/routes/external/googleOauthRoutes.ts` (OAuth routes)
- `client/src/components/admin/dev/ApiDevPanel.vue` (Admin dev panel - Session 2.1.6)

### Implementation Phases (from detailed plan)

**Phase 1: Google Cloud Console Setup (Verify/Complete)**
- Verify Google Cloud Project exists and is active (Project ID: `stone-passage-382818`)
- Enable Google Calendar API
- Verify OAuth Consent Screen configured with required scopes:
  - `https://www.googleapis.com/auth/calendar.readonly`
  - `https://www.googleapis.com/auth/calendar.freebusy`
- Verify OAuth 2.0 Credentials match `.env.development`
- Check authorized redirect URIs include: `http://localhost:3001/auth/callback` or `/api/v1/external/oauth/callback`

**Phase 2: Environment Configuration**
- Add `GOOGLE_SCOPES` environment variable to `server/.env.development`:
  ```env
  GOOGLE_SCOPES=https://www.googleapis.com/auth/calendar.readonly,https://www.googleapis.com/auth/calendar.freebusy
  GOOGLE_CALENDAR_RATE_LIMIT_PER_MINUTE=60
  GOOGLE_CALENDAR_CACHE_TTL_MINUTES=5
  ```
- Update `server/src/config/app.ts` to validate Google Calendar env vars (optional)

**Phase 3: OAuth Client Setup**
- Create `server/src/config/googleOAuth.ts`:
  - Initialize OAuth2Client from `googleapis`
  - Export `getAuthUrl()` - Generate authorization URL
  - Export `getTokens(code)` - Exchange authorization code for tokens
  - Export `refreshAccessToken(refreshToken)` - Refresh expired tokens
  - Export `getAuthenticatedClient(accessToken)` - Get authenticated calendar client
- Token storage strategy: Start with session storage (Option B), migrate to database later

**Phase 4: Rate Limiting and Caching Infrastructure** ⚠️ **CRITICAL - Must be done before API calls**
- **Why Critical**: Google Calendar API enforces per-minute quotas (sliding window). Exceeding quotas returns 403/429 errors.
- Create `server/src/services/rateLimiter.ts`:
  - Per-API rate limit tracking (Google Calendar, Google Maps, etc.)
  - Sliding window rate limiting (matches Google's quota system)
  - Request queuing for when rate limit is reached
  - Configurable limits per API endpoint
- Create `server/src/services/freeBusyCache.ts`:
  - TTL-based caching (5 min for near-term dates, 15 min for future dates)
  - Cache key: `calendarEmails:timeMin:timeMax` (normalized)
  - Automatic cache invalidation on TTL expiry
  - Memory-efficient (LRU cache or similar)
- Integrate rate limiter and cache into calendar service

**Phase 5: Basic Free-Busy API Endpoint**
- Create `server/src/services/googleCalendarService.ts`:
  - Function: `getFreeBusy(calendarEmails: string[], timeMin: Date, timeMax: Date)`
  - Uses `calendar.freebusy.query()` from googleapis
  - **Integrates rate limiter and cache**:
    - Check cache first
    - Check rate limiter
    - Make API call if needed
    - Cache response
    - Handle rate limit errors gracefully
- Update `server/src/routes/external/calendarRoutes.ts`:
  - Uncomment and update existing route structure
  - Add route: `POST /api/v1/external/calendar/freebusy`
  - Accepts: `{ calendarEmails: string[], timeMin: string, timeMax: string }`
  - Returns: `{ calendars: { [email]: { busy: Array<{start, end}> } } }`
  - Add authentication middleware (check for valid OAuth token)
- Update `server/src/routes/external/googleOauthRoutes.ts`:
  - Uncomment and update OAuth routes
  - Route: `GET /api/v1/external/oauth` - Redirects to Google auth
  - Route: `GET /api/v1/external/oauth/callback` - Handles OAuth callback
  - Store tokens in session/database after successful auth
- Update `server/src/routes/external/index.ts`:
  - Uncomment calendar router import
  - Mount calendar routes: `router.use('/calendar', CalendarRouter)`
  - Mount OAuth routes: `router.use('/oauth', GoogleOAuthRouter)`

**Phase 6: Integration Points**
- Connect to existing availability system:
  - Current: `server/src/routes/internal/availabilityRouter.ts` handles capacity checking
  - Future: Add calendar free-busy checking alongside capacity checks
  - Integration point: `client/src/utils/booking/timeAvailabilityManager.ts` (applyCapacityFilters function)
- Calendar emails will come from:
  - Business Settings (when Phase 2.0 complete): `AvailabilitySettings.calendarConfig.calendarEmails`
  - Or hardcoded for initial testing

### Sessions

**Session 2.1.1: Infrastructure Setup & Free-Busy API**
- **Prerequisite:** Phase 2.0 complete (calendar configuration available) - Can be done in parallel
- Verify Google Cloud Console setup (Phase 1)
- Add environment variables (Phase 2)
- Create OAuth configuration module (Phase 3)
- **CRITICAL**: Create rate limiting service (Phase 4.1)
- **CRITICAL**: Create free-busy cache service (Phase 4.2)
- Create calendar service with getFreeBusy function (Phase 5.1)
- Implement calendar and OAuth routes (Phase 5.2-5.4)
- Enable routes in external router (Phase 5.3)
- Test OAuth flow and free-busy endpoint (Phase 6)

**Session 2.1.2: Calendar Availability Integration**
- **Prerequisite:** Phase 2.0 complete (calendar configuration available)
- Create client-side calendar API service (`client/src/services/calendarApiService.ts`)
- Add data source toggle to booking dev panel (Real API / Mock Data / Both / None)
- Modify `getCalendarAvailability()` to support multiple data sources
- Read calendar emails from `AvailabilitySettings.calendarConfig.calendars`
- Transform server response to `BusyTimeRange[]` format
- Handle OAuth authentication state (check before API calls)
- Implement explicit error handling (no silent fallbacks)
- Update `useBusyTimes` composable with loading/error states
- Rely on server-side caching (no client cache needed)
- Add "Force Refresh" button in dev panel to bypass server cache

**Session 2.1.3: Event Creation, Invitations & Cache Invalidation**
- Create event creation function
- Map appointment data to calendar event format
- Add participant emails
- Set event titles based on service type
- Configure event permissions
- Send calendar invitations
- Handle multiple user types (Buyer, Agent, Owner, Inspector)
- **CRITICAL: Cache Invalidation on Booking**
  - When appointment is created, invalidate free-busy cache for affected calendar(s)
  - Call `invalidateCache()` from `freeBusyCache.ts` with relevant time range
  - Ensures next availability check fetches fresh data from Google

**Session 2.1.4: Full Event Fetching & Location Cache**
- Fetch full calendar events using `calendar.events.list()` (not just free-busy)
- Extract event locations for drive time calculations
- Create `calendarEventsCache.ts` service following `freeBusyCache.ts` pattern
- Add `getCalendarEvents()` function to `googleCalendarService.ts`
- Add `GET /api/v1/external/calendar/events` endpoint
- Cache events with TTL (5 min near-term, 15 min future)
- Integrate rate limiting and caching
- **CRITICAL**: Provides location data needed for Phase 2.2 (Google Maps API)

**Session 2.1.5: Error Handling & Fallbacks**
- Handle API authentication errors (401/403)
- Handle rate limiting (429/403 errors) with exponential backoff
- Handle network errors
- Return cached data if available during errors
- Implement fallback strategies for when Google API is unavailable

**Session 2.1.6: Admin API Dev Panel**
- Create admin dev panel component (`ApiDevPanel.vue`)
- Display OAuth status (authenticated, token expiry, scopes)
- Display free-busy cache contents and statistics
- Display events cache contents with locations
- Display rate limiter statistics
- Add debug endpoints for cache inspection (dev mode only)
- Integrate into admin panel (visible when `isDevModeEnabled()`)
- **WHY**: Provides visibility into API state for debugging and validation

### Success Criteria

**Session 2.1.1 (Complete):**
- ✅ Google Cloud Console setup verified
- ✅ Environment variables configured
- ✅ OAuth client configured and functional
- ✅ Rate limiting service implemented (prevents quota exhaustion)
- ✅ Free-busy cache service implemented (reduces API calls)
- ✅ Calendar service created with getFreeBusy function
- ✅ Calendar and OAuth routes implemented and enabled
- ✅ OAuth flow functional (auth and callback)
- ✅ Free-busy endpoint returns correct data

**Session 2.1.2:**
- [ ] Client-side calendar API service created
- [ ] Data source toggle in dev panel (Real/Mock/Both/None)
- [ ] `getCalendarAvailability()` supports all data source modes
- [ ] Calendar emails read from settings
- [ ] Explicit error handling (no silent fallbacks)
- [ ] useBusyTimes exposes error/loading states

**Session 2.1.3+:**
- [ ] Events created correctly with invitations
- [ ] Cache invalidation on booking working
- ✅ Full events fetched with locations (Session 2.1.4)
- ✅ Events cache implemented and working (Session 2.1.4)
- ✅ Admin dev panel functional (Session 2.1.6)
- ✅ Error handling working with fallbacks
- ✅ Rate limit errors handled gracefully
- ✅ Performance: API response times <2s
- ✅ Cache reduces API calls significantly

---

## Phase 2.2: Google Maps API Integration

**Status:** Not Started  
**Description:** Integrate Google Maps API for address autocomplete and drive time calculations.

### Objectives

- Set up Google Maps API client
- Implement address autocomplete
- Implement drive time calculations
- Handle error cases and fallbacks

### Key Files

- `client-vue/src/api/external/googleMaps.ts` (new)
- `client-vue/src/composables/useGoogleMaps.ts` (new)

### Sessions

**Session 2.2.1: Address Autocomplete**
- Set up Google Maps Places API client
- Implement address autocomplete input
- Handle autocomplete suggestions
- Extract address components
- Handle address selection
- Validate address completeness

**Session 2.2.2: Drive Time Calculations**
- Set up Google Maps Distance Matrix API client
- Calculate drive time FROM appointment address to busy event locations
- Calculate drive time TO appointment address FROM home
- Calculate drive time TO appointment address FROM previous appointment
- Calculate drive time TO next appointment FROM appointment address
- Calculate total drive time for day
- Integrate drive times into availability calculations

**Session 2.2.3: Error Handling & Fallbacks**
- Handle API errors gracefully
- Implement base drive time fallback
- Handle address autocomplete failures (manual entry)
- Log errors for debugging
- Display user-friendly error messages

### Drive-Time Buffer Plan Reference

- `/.cursor/plans/drive_time_buffer_implementation_d7bfd3a0.plan.md` (detailed implementation plan)

### Success Criteria

- Address autocomplete working correctly
- Drive times calculated correctly
- Drive times integrated into availability calculations
- Error handling working with fallbacks
- Performance: API response times <2s

---

## Phase 2.3: MLS API Integration

**Status:** Not Started (Deferrable)  
**Description:** Integrate MLS API to retrieve property data and auto-populate property details form.

**Prerequisites:**
- ✅ Property and Address table separation migration (Session 1.3.8) - Database structure must support versioned property details before MLS API integration. See: `../data-flow-alignment/sessions/session-1.3.8-guide.md`

### Objectives

- Research MLS API provider and documentation
- Set up MLS API client
- Implement property data retrieval
- Map MLS data to application data model (using PropertyDetails table)
- Implement versioning logic for property details
- Auto-populate property details form
- Handle error cases and fallbacks

### Key Files

- `client-vue/src/api/external/mls.ts` (new)
- `client-vue/src/composables/useMLS.ts` (new)
- `server/src/services/propertyVersionService.ts` (new - version selection logic)
- `server/src/services/propertyDetailsService.ts` (new - version management)

### Sessions

**Session 2.3.0: Database Migration (Prerequisite)**
- Complete Property and Address table separation migration
- See: `../data-flow-alignment/sessions/session-1.3.8-guide.md`
- Migrate existing Property data to Address + PropertyVersion + PropertyDetails structure
- Update API endpoints and frontend components
- Verify all relationships working correctly

**Session 2.3.1: MLS API Client Setup**
- Research MLS API provider and documentation
- Set up API client
- Implement authentication
- Create API request/response types
- Test API connection

**Session 2.3.2: Property Data Retrieval & Versioning**
- Create property lookup function (by address)
- Map MLS dwelling type to application property type
- Extract total square footage (above + below grade)
- Extract foundation type
- Extract ADU information (presence and number)
- Implement versioning logic (create new PropertyDetails version when API data changes)
- Implement version selection logic (select active PropertyDetails)
- Auto-populate property details form
- Handle partial data scenarios

**Session 2.3.3: Error Handling & Fallbacks**
- Handle API errors gracefully
- Handle property not found scenarios
- Prompt user to input required information manually
- Handle version conflicts (API vs manual data)
- Log errors for debugging
- Display user-friendly error messages

### Success Criteria

- Database migration completed successfully (Session 2.3.0)
- MLS API client functional
- Property data retrieved and mapped correctly
- Versioning logic implemented and working
- Version selection logic working correctly
- Property details form auto-populated
- Error handling working with fallbacks
- User prompted for manual input on failure
- Version conflicts handled gracefully

### Note

This phase is **deferrable** - MLS API integration can be deferred with manual entry fallback. It's not critical for MVP.

---

## Reference Documents

- **Google Calendar Free-Busy Setup Plan**: `/Users/districthomepro/.cursor/plans/google_calendar_free-busy_api_setup_cbbaba01.plan.md` ⭐ **DETAILED IMPLEMENTATION GUIDE**
- **Old Project Plan**: `project-manager/archive/project-plan.md.old` (Feature 4: API Integration Layer)
- **React Calendar Calls**: `client/src/scheduler/externalAPI/calendarCalls.ts` (reference)
- **USER_STORY.md**: Address autocomplete and MLS auto-population requirements
- **Google Calendar API Documentation**: [Free-Busy API](https://developers.google.com/calendar/api/v3/reference/freebusy/query)
- **Google OAuth 2.0 Setup Guide**: [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

---

## Dependencies

- Feature 0: Vue.js Migration (Core Complete)
- Feature 1: Data Flow Alignment (recommended, provides availability settings infrastructure)

### Internal Phase Dependencies

- Phase 2.0 → Phase 2.1 (Calendar config required before API integration)
- Phase 2.1 Session 2.1.4 → Phase 2.2 (**CRITICAL**: Event locations needed for drive time calculations)
- Phase 2.0 → Phase 2.2 (Calendar config may inform Maps integration)
- Phase 2.1 → Phase 2.3 (Calendar integration before MLS, though MLS is independent)

---

## Success Metrics

- Google Calendar API integrated and working
- Google Maps API integrated and working
- MLS API integrated (if implemented)
- Error handling working with fallbacks
- API response times <2s
- Fallback mechanisms working correctly

---

## Fallback Plans

- **Google Calendar API fails** → Manual availability entry mode
- **Google Maps API fails** → Manual address entry (no autocomplete)
- **MLS API fails** → Manual property details entry
- All fallbacks documented and implemented

---

**Last Updated:** 2026-01-31  
**Status:** In Progress - Feature Started, Phase 2.1 Ready for Implementation

**Note:** Phase 2.1 incorporates detailed Google Calendar Free-Busy API Setup plan. Rate limiting and caching infrastructure (Phase 4) is **CRITICAL** and must be implemented before making API calls to prevent quota exhaustion.

