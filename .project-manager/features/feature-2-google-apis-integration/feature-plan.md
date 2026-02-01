# Feature 2: Google APIs Integration

**Feature:** Google APIs Integration  
**Status:** In Progress  
**Created:** 2025-02-01  
**Last Updated:** 2026-02-01  
**Branch:** `feature/google-apis-integration`

---

## Overview

Integrate Google Calendar API (availability fetching, event creation), Google Maps API (address autocomplete, drive time), and MLS API (Bright MLS - property data with feature detection). This feature provides the external API integration layer for the scheduling application.

**Target:** Functional API clients for Google Calendar, Google Maps, and Bright MLS APIs with proper error handling, caching, rate limiting, and fallback strategies.

**MLS Enhancement:** Phase 2.3 includes an advanced MLS feature detection system that can automatically suggest property block instances (Pool, Deck, ADU, etc.) based on MLS property features, with an admin interface for configuring feature-to-block mappings.

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
- Calculate drive time TO appointment address FROM default location (home/office)
- Calculate drive time TO appointment address FROM previous appointment
- Calculate drive time TO next appointment FROM appointment address
- Calculate total drive time for day
- Integrate drive times into availability calculations

**Session 2.2.3: Error Handling & Fallbacks**
- Handle API errors gracefully
- Implement base drive time fallback (uses configured driveTimeTo/driveTimeFrom minutes)
- Handle address autocomplete failures (manual entry)
- Log errors for debugging
- Display user-friendly error messages

### Drive-Time Buffer Architecture Reference

**Plan:** `~/.cursor/plans/drive_time_buffer_refactor_f78512ee.plan.md`

**Key Architecture Changes:**
The drive time buffer system has been redesigned with improved semantics:

| Old Structure | New Structure |
|--------------|---------------|
| Single `driveTime` buffer with `placement: 'before' \| 'after' \| 'both'` | Dual buffers: `driveTimeTo` (arrival) and `driveTimeFrom` (departure) |
| Ambiguous placement semantics | Placement is implicit in the buffer name |
| No application rules | `applyTo: 'all' \| 'first_only' \| 'last_only' \| 'none'` |
| No default location | `defaultLocation` field for home/office address |

**To implement:** Follow the detailed plan at the path above. The plan includes:
- Type definitions for client and server
- Constraint extraction logic updates
- Availability checking with slot position context
- Admin UI panels for configuration
- Database migration from legacy structure
- Test updates

### Success Criteria

- Address autocomplete working correctly
- Drive times calculated correctly
- Drive times integrated into availability calculations
- Error handling working with fallbacks
- Performance: API response times <2s

---

## Phase 2.3: MLS API Integration (Bright MLS)

**Status:** Not Started (Deferrable)  
**Description:** Integrate Bright MLS API (RESO Web API) to retrieve property data and auto-populate property details form, with optional auto-triggering of property block instances based on MLS features.

**MLS Provider:** Bright MLS (covers MD, DC, VA, DE, PA, NJ)  
**API Standard:** RESO Web API (OData 4.0)  
**Contact:** contentlicensing@brightmls.com  

**Prerequisites:**
- ✅ Property and Address table separation migration (Session 1.3.8) - Database structure must support versioned property details before MLS API integration. See: `../data-flow-alignment/sessions/session-1.3.8-guide.md`
- Bright MLS API access approved and credentials received

### Objectives

- Set up Bright MLS API client with OAuth 2.0 authentication
- Create MLS response types and field mapping configuration
- Implement data transformation layer (RESO → App data model)
- Map MLS data to PropertyDetails table
- Auto-populate property details form
- **NEW:** Create admin interface for MLS feature → Block Instance mapping
- **NEW:** Auto-suggest property block instances based on MLS features (Pool, Deck, ADU, etc.)
- Implement versioning logic for property details
- Handle error cases and fallbacks

### Key Files

**Server - Types & Config:**
- `server/src/types/mls.ts` (new - Bright MLS response types)
- `server/src/config/mlsFieldMapping.ts` (new - RESO → App field mapping config)
- `server/src/config/mlsFoundationMapping.ts` (new - Foundation type mapping)

**Server - Services:**
- `server/src/services/mlsApiClient.ts` (new - Bright MLS API client)
- `server/src/services/mlsTransformer.ts` (new - Data transformation logic)
- `server/src/services/mlsFeatureMatcher.ts` (new - Feature → Block Instance matching)
- `server/src/services/propertyVersionService.ts` (new - version selection logic)
- `server/src/services/propertyDetailsService.ts` (new - version management)
- `server/src/services/mlsCache.ts` (new - MLS response caching)

**Server - Database:**
- `server/src/db/models/admin/mls_feature_mapping.ts` (new - Feature mapping model)
- `server/src/db/migrations/XXXXXX-create-mls-feature-mappings.mjs` (new)

**Server - Routes:**
- `server/src/routes/external/mlsRoutes.ts` (new - MLS API endpoints)
- `server/src/routes/internal/admin/mlsFeatureMappingRouter.ts` (new - Admin endpoints)

**Client:**
- `client/src/api/external/mls.ts` (new - MLS API service)
- `client/src/composables/useMLS.ts` (new - MLS composable)
- `client/src/views/admin/MLSFeatureMappings.vue` (new - Admin interface)

### MLS Field Mapping Reference

**RESO → App Field Mapping:**

| RESO Field | App Field | Transformation |
|------------|-----------|----------------|
| `ListingId` or `ListingKey` | `mlsNumber` | Strip MLS prefix (e.g., "BRT123456" → "123456") |
| `LivingArea` | `squareFootage` | Direct |
| `AboveGradeFinishedArea` + `BelowGradeFinishedArea` | `squareFootage` | Sum (fallback if LivingArea missing) |
| `BedroomsTotal` | `bedrooms` | Direct |
| `BathroomsFull` + (`BathroomsHalf` × 0.5) | `bathrooms` | Calculate total |
| `FoundationDetails` | `foundationAccess` | Map via foundation mapping config |
| `UnitTypes` array length or ADU detection | `additionalUnits` | Count additional dwelling units |
| `PropertySubType` | → PropertyVersionType | Map to property block instance |

**Foundation Mapping (RESO → App):**

```typescript
// server/src/config/mlsFoundationMapping.ts
export const FOUNDATION_MAPPING: Record<string, 'basement' | 'crawlspace' | 'slab' | null> = {
  // Basement variants → 'basement'
  'Basement': 'basement',
  'Full Basement': 'basement',
  'Partial Basement': 'basement',
  'Walk-Out Basement': 'basement',
  'Finished Basement': 'basement',
  'Unfinished Basement': 'basement',
  'Daylight Basement': 'basement',
  'English Basement': 'basement',
  
  // Crawlspace variants → 'crawlspace'
  'Crawl Space': 'crawlspace',
  'Crawlspace': 'crawlspace',
  'Raised': 'crawlspace',
  
  // Slab variants → 'slab'
  'Slab': 'slab',
  'Concrete Perimeter': 'slab',
  'Post': 'slab',
  'Pier': 'slab',
  'Pillar/Post/Pier': 'slab',
  'Block': 'slab',
  
  // Unknown/Other → null (requires manual entry)
  'Other': null,
  'None': null,
};

// Helper to find first matching foundation type from array
export function mapFoundationType(foundationDetails: string[]): 'basement' | 'crawlspace' | 'slab' | null {
  for (const detail of foundationDetails) {
    const mapped = FOUNDATION_MAPPING[detail];
    if (mapped) return mapped;
  }
  return null; // Will prompt user for manual entry
}
```

**Property Type Mapping (RESO PropertySubType → Block Instance):**

| RESO PropertySubType | Block Instance Name | Notes |
|---------------------|---------------------|-------|
| `Single Family Residence` | Single-Family | Primary dwelling |
| `Townhouse` | Townhouse | |
| `Condominium` | Condo | |
| `Multi-Family` | Multi-Family | |
| `Manufactured Home` | Manufactured | |
| `Mobile Home` | Mobile Home | |
| (has ADU/guest house in OtherStructures) | ADU | Add as additional type |

### Sessions

**Session 2.3.0: Database Migration (Prerequisite) ✅**
- Complete Property and Address table separation migration
- See: `../data-flow-alignment/sessions/session-1.3.8-guide.md`
- Migrate existing Property data to Address + PropertyVersion + PropertyDetails structure
- Update API endpoints and frontend components
- Verify all relationships working correctly

**Session 2.3.1: MLS API Client Setup**
- Set up Bright MLS API client with OAuth 2.0 Bearer token authentication
- Add environment variables:
  ```env
  BRIGHT_MLS_API_URL=https://api.brightmls.com/v2
  BRIGHT_MLS_ACCESS_TOKEN=your_bearer_token
  BRIGHT_MLS_RATE_LIMIT_PER_SECOND=2
  BRIGHT_MLS_RATE_LIMIT_PER_DAY=40000
  BRIGHT_MLS_CACHE_TTL_MINUTES=60
  ```
- Create `server/src/services/mlsApiClient.ts`:
  - Initialize HTTP client with Bearer token auth
  - Export `searchPropertyByAddress(address, city, state, zip)`
  - Export `getPropertyByListingId(listingId)`
  - Integrate rate limiting (max 2 req/sec, 40,000/day)
  - Integrate caching (TTL 60 min - MLS data changes infrequently)
- Create MLS routes: `GET /api/v1/external/mls/search?address=...`
- Test API connection and response parsing

**Session 2.3.1a: MLS Response Types & Field Mapping Config**
- Create `server/src/types/mls.ts` with Bright MLS/RESO response types:
  ```typescript
  export interface BrightMLSPropertyResponse {
    ListingKey: string;
    ListingId: string;
    PropertyType: string;
    PropertySubType: string;
    LivingArea: number | null;
    AboveGradeFinishedArea: number | null;
    BelowGradeFinishedArea: number | null;
    BedroomsTotal: number | null;
    BathroomsFull: number | null;
    BathroomsHalf: number | null;
    BathroomsTotalInteger: number | null;
    FoundationDetails: string[];
    YearBuilt: number | null;
    // Address fields
    StreetNumber: string;
    StreetName: string;
    StreetSuffix: string;
    City: string;
    StateOrProvince: string;
    PostalCode: string;
    // Feature arrays for block instance triggering
    PoolFeatures: string[];
    SpaFeatures: string[];
    PatioAndPorchFeatures: string[];
    OtherStructures: string[];
    GarageSpaces: number | null;
    FireplaceFeatures: string[];
    WaterfrontFeatures: string[];
    GreenBuildingVerificationType: string[];
    // ... additional fields as needed
  }
  ```
- Create `server/src/config/mlsFieldMapping.ts` with field mapping configuration
- Create `server/src/config/mlsFoundationMapping.ts` with foundation type mapping
- Document all RESO fields we're interested in

**Session 2.3.2: MLS Transformer Service**
- Create `server/src/services/mlsTransformer.ts`:
  ```typescript
  export interface MLSTransformResult {
    propertyDetails: {
      mlsNumber: string;
      squareFootage: number | null;
      bedrooms: number | null;
      bathrooms: number | null;
      foundationAccess: 'basement' | 'crawlspace' | 'slab' | null;
      additionalUnits: number | null;
      source: 'api';
    };
    suggestedPropertyType: string | null; // Block instance name
    detectedFeatures: MLSDetectedFeature[]; // For block instance suggestions
    requiresManualInput: string[]; // Fields that couldn't be mapped
  }
  
  export interface MLSDetectedFeature {
    resoField: string;
    resoValue: string | string[];
    confidence: 'high' | 'medium' | 'low';
  }
  
  export function transformMLSResponse(response: BrightMLSPropertyResponse): MLSTransformResult;
  ```
- Implement square footage calculation (LivingArea OR Above + Below grade)
- Implement bathroom calculation (Full + Half × 0.5)
- Implement foundation mapping with fallback to null
- Detect ADU/additional units from OtherStructures array
- Extract detected features for block instance suggestions
- Return list of fields requiring manual input

**Session 2.3.3: Property Data Retrieval & Versioning**
- Create property lookup function (by address)
- Integrate MLS transformer into property lookup flow
- Implement versioning logic:
  - Check if PropertyDetails with source='api' exists for this address
  - Compare MLS data with existing data
  - Create new PropertyDetails version if data has changed
  - Track `mlsNumber` to detect same property returning different data
- Implement version selection logic (select most recent active PropertyDetails)
- Auto-populate property details form with transformed data
- Handle partial data scenarios (show what we have, prompt for rest)

**Session 2.3.4: MLS Feature Mapping Table & Admin Interface**

**Database Schema:**
```sql
CREATE TABLE mls_feature_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reso_field VARCHAR(100) NOT NULL,           -- e.g., "PoolFeatures", "GarageSpaces"
  match_type VARCHAR(20) NOT NULL,            -- 'exists', 'contains', 'equals', 'greater_than'
  match_value VARCHAR(255),                   -- null for 'exists', value for others
  block_instance_id UUID NOT NULL REFERENCES block_instances(id),
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,                 -- Higher priority = checked first
  notes VARCHAR(500),                         -- Admin notes about this mapping
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mls_feature_mappings_active ON mls_feature_mappings(active);
CREATE INDEX idx_mls_feature_mappings_reso_field ON mls_feature_mappings(reso_field);
```

**Match Types:**
- `exists` - Feature array is non-empty (match_value = null)
- `contains` - Feature array contains match_value
- `equals` - Field equals match_value exactly
- `greater_than` - Numeric field > match_value

**Example Seed Data:**
```sql
INSERT INTO mls_feature_mappings (reso_field, match_type, match_value, block_instance_id, notes) VALUES
('PoolFeatures', 'exists', NULL, 'pool-block-id', 'Any pool feature triggers Pool block'),
('PoolFeatures', 'contains', 'In Ground', 'inground-pool-block-id', 'In-ground pool specific'),
('GarageSpaces', 'greater_than', '0', 'garage-block-id', 'Any garage'),
('GarageSpaces', 'greater_than', '2', 'large-garage-block-id', '3+ car garage'),
('OtherStructures', 'contains', 'Guest House', 'adu-block-id', 'Guest house = ADU'),
('OtherStructures', 'contains', 'Accessory Dwelling Unit', 'adu-block-id', 'Explicit ADU'),
('PatioAndPorchFeatures', 'contains', 'Deck', 'deck-block-id', 'Has deck'),
('PatioAndPorchFeatures', 'contains', 'Screened Porch', 'porch-block-id', 'Has screened porch'),
('FireplaceFeatures', 'exists', NULL, 'fireplace-block-id', 'Any fireplace');
```

**Admin Interface:**
- Create `client/src/views/admin/MLSFeatureMappings.vue`:
  - Data table showing all mappings (active/inactive)
  - Add/Edit/Delete mappings
  - Dropdown for RESO field selection (from known fields list)
  - Dropdown for match type
  - Input for match value (conditional on match type)
  - Block instance selector (filtered to property-type blocks)
  - Priority input
  - Notes field
  - Active toggle
  - Test button: "Test with sample MLS data" to preview matches
- Create router for admin interface
- Add navigation link in admin panel

**Session 2.3.5: MLS Feature Matcher Service**
- Create `server/src/services/mlsFeatureMatcher.ts`:
  ```typescript
  export interface FeatureMatchResult {
    blockInstanceId: string;
    blockInstanceName: string;
    matchedFeature: {
      resoField: string;
      matchType: string;
      matchValue: string | null;
      actualValue: string | string[] | number;
    };
    confidence: 'high' | 'medium';
  }
  
  export async function matchMLSFeaturesToBlocks(
    mlsResponse: BrightMLSPropertyResponse
  ): Promise<FeatureMatchResult[]>;
  ```
- Load active mappings from database (cache with short TTL)
- Apply match logic based on match_type
- Return matched block instances with confidence scores
- Handle priority ordering (higher priority mappings override lower)
- Log matches for debugging

**Session 2.3.6: Auto-Population with Block Instance Suggestions**
- Update property details form to show MLS-suggested block instances:
  ```
  ┌─────────────────────────────────────────────────────────────┐
  │ MLS Data Found for 123 Main St                              │
  ├─────────────────────────────────────────────────────────────┤
  │ Property Details (auto-filled):                             │
  │   Square Footage: 2,400 sq ft                               │
  │   Bedrooms: 4                                               │
  │   Bathrooms: 3.5                                            │
  │   Foundation: Basement                                      │
  ├─────────────────────────────────────────────────────────────┤
  │ ⚠️ Requires Manual Input:                                   │
  │   [ ] Additional Units (not detected)                       │
  ├─────────────────────────────────────────────────────────────┤
  │ 🏠 Detected Property Features:                              │
  │   ☑️ Single-Family (from PropertySubType)                   │
  │   ☑️ In-Ground Pool (from PoolFeatures)                     │
  │   ☑️ Deck (from PatioAndPorchFeatures)                      │
  │   ☑️ 2-Car Garage (from GarageSpaces)                       │
  │   ☐ ADU (uncheck if not applicable)                         │
  │                                                             │
  │   [Confirm Selections]  [Edit Manually]                     │
  └─────────────────────────────────────────────────────────────┘
  ```
- Show detected features as pre-selected checkboxes
- Allow user to confirm, modify, or override selections
- On confirm:
  - Save PropertyDetails with source='api'
  - Create PropertyVersionType records for selected block instances
- Handle conflicts (existing manual data vs. new MLS data)

**Session 2.3.7: Error Handling & Fallbacks**
- Handle API authentication errors (401/403) - prompt to re-authenticate
- Handle rate limiting (429) - queue request, show "checking MLS..." status
- Handle property not found (404) - fall back to manual entry with message
- Handle network errors - show cached data if available, else manual entry
- Handle partial MLS data - populate what we have, prompt for rest
- Handle version conflicts (API vs manual data):
  - If user has manual data, show comparison dialog
  - "MLS shows 2,400 sq ft, you entered 2,200 sq ft. Which is correct?"
  - Allow user to choose or enter different value
- Log all errors for debugging
- Display user-friendly error messages

**Session 2.3.8: MLS Integration Testing & Documentation**
- Create integration tests for MLS transformer
- Create integration tests for feature matcher
- Test with sample Bright MLS responses
- Document MLS field usage and mapping rationale
- Update README with MLS integration instructions
- Add MLS status to admin dev panel (connection status, cache stats, rate limit status)

### Success Criteria

**Session 2.3.0 (Database Migration):**
- ✅ Property/Address table separation complete
- ✅ PropertyVersion + PropertyDetails structure working
- ✅ PropertyVersionType junction table working

**Session 2.3.1 (API Client):**
- [ ] Bright MLS API client functional
- [ ] OAuth authentication working
- [ ] Rate limiting implemented (2 req/sec, 40,000/day)
- [ ] Caching implemented (60 min TTL)
- [ ] API endpoint returns property data

**Session 2.3.1a (Types & Config):**
- [ ] BrightMLSPropertyResponse type defined
- [ ] Field mapping configuration complete
- [ ] Foundation mapping configuration complete

**Session 2.3.2 (Transformer):**
- [ ] MLS response transforms correctly to PropertyDetails
- [ ] Square footage calculation working (LivingArea OR Above+Below)
- [ ] Bathroom calculation working (Full + Half×0.5)
- [ ] Foundation mapping working with fallback
- [ ] Detected features extracted correctly
- [ ] Manual input requirements identified

**Session 2.3.3 (Versioning):**
- [ ] Property lookup by address working
- [ ] Versioning logic creates new version when data changes
- [ ] Version selection returns most recent active version
- [ ] Form auto-populated with transformed data

**Session 2.3.4 (Admin Interface):**
- [ ] mls_feature_mappings table created
- [ ] CRUD operations for feature mappings
- [ ] Admin UI functional
- [ ] Seed data loaded

**Session 2.3.5 (Feature Matcher):**
- [ ] Feature matcher loads mappings from database
- [ ] Match logic works for all match types
- [ ] Priority ordering respected
- [ ] Matched block instances returned correctly

**Session 2.3.6 (Auto-Population):**
- [ ] Property details form shows MLS data
- [ ] Detected features shown as suggestions
- [ ] User can confirm/modify selections
- [ ] PropertyVersionType records created on confirm

**Session 2.3.7 (Error Handling):**
- [ ] All error scenarios handled gracefully
- [ ] User prompted for manual input on failure
- [ ] Version conflicts handled with comparison dialog
- [ ] User-friendly error messages displayed

**Session 2.3.8 (Testing):**
- [ ] Integration tests passing
- [ ] Documentation complete
- [ ] Admin dev panel shows MLS status

### Architecture Notes

**Data Flow:**
```
User enters address
        ↓
Client calls: GET /api/v1/external/mls/search?address=...
        ↓
Server: mlsApiClient.searchPropertyByAddress()
        ↓ (rate limited, cached)
Bright MLS API: Property search
        ↓
Server: mlsTransformer.transformMLSResponse()
        ↓
Server: mlsFeatureMatcher.matchMLSFeaturesToBlocks()
        ↓
Response: { propertyDetails, suggestedBlockInstances, requiresManualInput }
        ↓
Client: Show pre-filled form with suggestions
        ↓
User confirms/modifies
        ↓
Client: POST /api/v1/internal/properties (with block instance IDs)
        ↓
Server: Create PropertyVersion + PropertyDetails + PropertyVersionTypes
```

**MLS Feature Mapping Logic:**
```
mls_feature_mappings table
        ↓
Load active mappings (cached 5 min)
        ↓
For each mapping:
  - Extract resoField value from MLS response
  - Apply match_type logic
  - If match, add block_instance_id to results
        ↓
Sort by priority (higher first)
        ↓
Return unique block instances
```

### Note

This phase is **deferrable** - MLS API integration can be deferred with manual entry fallback. It's not critical for MVP. However, the feature mapping system provides significant UX improvement for property data entry and can reduce errors in property type selection.

---

## Reference Documents

### Google APIs
- **Google Calendar Free-Busy Setup Plan**: `/Users/districthomepro/.cursor/plans/google_calendar_free-busy_api_setup_cbbaba01.plan.md` ⭐ **DETAILED IMPLEMENTATION GUIDE**
- **React Calendar Calls**: `client/src/scheduler/externalAPI/calendarCalls.ts` (reference)
- **Google Calendar API Documentation**: [Free-Busy API](https://developers.google.com/calendar/api/v3/reference/freebusy/query)
- **Google OAuth 2.0 Setup Guide**: [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

### MLS API (Bright MLS)
- **Bright MLS Developer Resources**: [brightmls.com/benefits/developers](https://www.brightmls.com/benefits/developers)
- **Bright MLS Support**: [support.brightmls.com](https://support.brightmls.com)
- **Bright MLS Content Licensing Contact**: contentlicensing@brightmls.com
- **RESO Web API Specification**: [reso.org/reso-web-api](https://www.reso.org/reso-web-api/)
- **RESO Data Dictionary 2.0**: [ddwiki.reso.org](https://ddwiki.reso.org/display/DDW20/Property+Resource)
- **RESO Data Dictionary Property Fields**: [Property Resource](https://ddwiki.reso.org/display/DDW20/Property+Resource)

### Project Documents
- **Old Project Plan**: `project-manager/archive/project-plan.md.old` (Feature 4: API Integration Layer)
- **USER_STORY.md**: Address autocomplete and MLS auto-population requirements

---

## Dependencies

- Feature 0: Vue.js Migration (Core Complete)
- Feature 1: Data Flow Alignment (recommended, provides availability settings infrastructure)

### Internal Phase Dependencies

- Phase 2.0 → Phase 2.1 (Calendar config required before API integration)
- Phase 2.1 Session 2.1.4 → **Drive Time Buffer Refactor** → Phase 2.2 (**CRITICAL** dependency chain)
  - Session 2.1.4 provides event locations
  - Drive Time Buffer Refactor sets up `driveTimeTo`/`driveTimeFrom` architecture with `applyTo` rules
  - Phase 2.2 calculates actual drive times to populate the buffer values
  - **Plan:** `~/.cursor/plans/drive_time_buffer_refactor_f78512ee.plan.md`
- Phase 2.0 → Phase 2.2 (Calendar config may inform Maps integration)
- Phase 2.1 → Phase 2.3 (Calendar integration before MLS, though MLS is independent)

---

## Success Metrics

### Google Calendar API
- OAuth authentication flow functional
- Free-busy endpoint returns correct data
- Event creation with invitations working
- Rate limiting prevents quota exhaustion
- Caching reduces API calls by >50%

### Google Maps API
- Address autocomplete working correctly
- Drive time calculations accurate within 5 minutes
- Drive times integrated into availability calculations

### MLS API (Bright MLS)
- Property search by address returns results
- Field mapping transforms data correctly
- Foundation type mapping covers >90% of cases
- Feature → Block Instance matching working
- Admin interface for feature mappings functional
- Auto-population reduces manual entry time by >70%

### General
- Error handling working with fallbacks for all APIs
- API response times <2s for all endpoints
- User-friendly error messages displayed
- Fallback mechanisms working correctly

---

## Fallback Plans

### Google Calendar API
- **OAuth fails** → Show "Connect Calendar" button, allow manual availability entry
- **Free-busy API fails** → Return cached data if available, else assume available
- **Rate limit exceeded** → Queue requests, show loading indicator, return cached data
- **Network error** → Return cached data if available, else show error with retry option

### Google Maps API
- **Autocomplete fails** → Fall back to manual address entry fields
- **Drive time API fails** → Use configurable default drive time (e.g., 30 minutes)
- **Address not found** → Allow manual coordinate entry or use zip code center

### MLS API (Bright MLS)
- **API not configured** → Show manual entry form (current behavior)
- **Property not found** → Show "Property not in MLS" message, use manual entry
- **Rate limit exceeded** → Queue request, show "Checking MLS..." with spinner
- **Partial data returned** → Auto-fill available fields, highlight missing fields for manual entry
- **Foundation type unknown** → Show dropdown with "Select foundation type" prompt
- **Feature matching fails** → Skip suggestions, allow manual block selection
- **Network error** → Show cached data if same address searched recently, else manual entry

### General Principles
- Never block user progress due to API failure
- Always provide manual entry as fallback
- Show clear status messages about what's happening
- Log errors for debugging but don't expose technical details to user
- Cache data aggressively to reduce API dependency

---

**Last Updated:** 2026-02-01  
**Status:** In Progress - Phase 2.1 Complete, Drive Time Buffer Refactor Next

**Notes:**
- Phase 2.1 incorporates detailed Google Calendar Free-Busy API Setup plan. Rate limiting and caching infrastructure is **CRITICAL** and must be implemented before making API calls to prevent quota exhaustion.
- **Drive Time Buffer Refactor** (`~/.cursor/plans/drive_time_buffer_refactor_f78512ee.plan.md`) should be implemented before Phase 2.2. This refactor:
  - Replaces single `driveTime` buffer with semantic `driveTimeTo`/`driveTimeFrom` buffers
  - Adds `applyTo` config for first/last appointment application rules
  - Adds `defaultLocation` field for admin-configurable home/office address
  - Provides the architecture that Phase 2.2 will populate with calculated drive times
- Phase 2.3 (MLS API) significantly expanded with Bright MLS integration details, field mapping configuration, feature-to-block-instance matching, and admin interface for mapping management. MLS integration is **deferrable** but provides significant UX improvement.
- Bright MLS API access requires contacting contentlicensing@brightmls.com with GCAAR affiliate credentials.

