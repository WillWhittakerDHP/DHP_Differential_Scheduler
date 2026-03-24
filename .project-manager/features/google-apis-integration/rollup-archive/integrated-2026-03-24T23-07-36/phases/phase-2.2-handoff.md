# Phase 2.2 Handoff: Google Maps API Integration

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Status:** ✅ Complete  
**Started:** 2026-02-01  
**Completed:** 2026-02-20  
**Last Updated:** 2026-02-20

---

## Phase Overview

**Phase Number:** 2.2  
**Phase Name:** Google Maps API Integration  
**Description:** Integrate Google Maps API for address autocomplete (Places API) and drive time calculations (Routes API). This phase provides dynamic drive time calculations to replace static buffer values.

**Current Status:** ✅ Complete - All 6 sessions finished  
**Prerequisites Completed:**
- ✅ Phase 2.1 (Google Calendar API Integration) - Provides event locations for drive time calculations
- ✅ Drive Time Buffer Refactor - Provides `driveTimeTo`/`driveTimeFrom` architecture with `applyTo` rules

---

## Objectives

- Set up Google Maps Places API for address autocomplete
- Set up Google Maps Routes API for drive time calculations (replaces legacy Distance Matrix API)
- Store Place IDs from autocomplete for accurate route calculations
- Calculate drive times between appointment locations
- Calculate drive times from/to default location (home/office)
- Integrate calculated drive times with the new buffer architecture
- Handle error cases with fallback to static buffer values

---

## Sessions Overview

| Session | Name | Status |
|---------|------|--------|
| 2.2.1 | Address Autocomplete (Places API) | ✅ Complete |
| 2.2.2 | Drive Time Calculations (Routes API) | ✅ Complete |
| 2.2.3 | Drive Time ApplyTo Logic Refactor | ✅ Complete |
| 2.2.4 | Wizard Address Autocomplete Integration | ✅ Complete |
| 2.2.5 | API Prefetching & Data Source Semantics | ✅ Complete |
| 2.2.6 | Constraint Attribution & Admin Performance | ✅ Complete |

---

## Session Details

### Session 2.2.1: Address Autocomplete (Places API)

**Status:** ✅ Code Complete - Pending API Configuration

**Objectives:**
- ✅ Set up Google Maps Places API client
- ✅ Implement address autocomplete input component
- ✅ Handle autocomplete suggestions
- ✅ Extract address components (street, city, state, zip)
- ✅ Extract coordinates (lat/lng) for distance calculations
- ✅ Store coordinates in `defaultLocation.coordinates`

**Completed Tasks:**
1. **Environment Setup**
   - ✅ Uses existing `GOOGLE_API_KEY` from `.env.development`
   - ⏳ **ACTION REQUIRED:** Enable Places API in Google Cloud Console

2. **Server-Side Proxy**
   - ✅ Created `server/src/services/googleMapsService.ts` - Maps API service
   - ✅ Created `server/src/routes/external/mapsRoutes.ts` - API endpoints
   - ✅ Integrated with existing rate limiter (uses `'google-maps'` API type)

3. **Client-Side Components**
   - ✅ Created `client/src/services/mapsApiService.ts` - Client API service
   - ✅ Created `client/src/components/common/AddressAutocomplete.vue` - Autocomplete component
   - ✅ Added `Coordinates` type to `availabilitySettings.ts`

4. **Integration Points**
   - ✅ Updated `BusinessControlsTab.vue` with AddressAutocomplete for default location
   - ✅ Coordinates display when address is selected

**Success Criteria:**
- ✅ Address autocomplete component created
- ⏳ Suggestions appear after typing 3+ characters (needs API enabled)
- ⏳ Selected address populates address + coordinates (needs API enabled)
- ✅ Coordinates stored for distance calculations (infrastructure complete)

**Action Required:**
Enable Places API in Google Cloud Console:
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select project `stone-passage-382818`
3. APIs & Services → Library → Search "Places API" → Enable

---

### Session 2.2.2: Drive Time Calculations (Routes API)

**Status:** ⏳ Not Started

**Objectives:**
- Set up Google Maps Routes API client (modern replacement for legacy Distance Matrix)
- Calculate drive times between locations using Place IDs when available
- Integrate with event locations from Phase 2.1
- Populate drive time values based on `applyTo` rules

**Why Routes API Instead of Distance Matrix?**
- **Distance Matrix API is now "Legacy"** - Google recommends Routes API for new development
- **Better accuracy** with Place IDs (identifies actual access points, not just nearest road)
- **Same pricing** as Distance Matrix ($5-10 per 1,000 elements depending on tier)
- **Real-time traffic** data along each route segment
- **Improved ETA accuracy** compared to legacy services
- **Future-proof** - actively maintained and improved

**Key Tasks:**
1. **Server-Side Service**
   - Extend `server/src/services/googleMapsService.ts` with Routes API client
   - Implement `calculateDriveTime(origin, destination)` function
   - Support multiple location formats with priority: **placeId > coordinates > address string**
   - Add caching for drive time results (TTL: 24 hours - routes don't change often)
   - Add rate limiting (3,000 elements per minute)

2. **Routes API Integration**
   - Create `POST /api/v1/external/maps/route-matrix` endpoint
   - Use `computeRouteMatrix` for multiple origin/destination pairs
   - Accept locations as: `{ placeId }`, `{ lat, lng }`, or `{ address }`
   - Return drive time in minutes and distance in meters
   - Handle traffic considerations with `routingPreference: 'TRAFFIC_AWARE'`

3. **Location Resolution Priority**
   ```
   When calculating drive time:
   1. If placeId available → Use directly (best accuracy, no geocoding)
   2. If coordinates available → Use lat/lng (good accuracy)
   3. If only address string → Pass to API (it geocodes internally)
   ```

4. **Drive Time Calculation Logic**
   - **driveTimeTo (first_only)**: From `defaultLocation` → first appointment
   - **driveTimeTo (all)**: From previous appointment → current appointment
   - **driveTimeFrom (last_only)**: From last appointment → `defaultLocation`
   - **driveTimeFrom (all)**: From current appointment → next appointment

5. **Client-Side Integration**
   - Extend `client/src/services/mapsApiService.ts` with route calculation
   - Update availability calculations to request drive times
   - Use event locations from cached calendar events

**Architecture:**
```
Slot Generation
    ↓
Determine slot position (first/last of day)
    ↓
Resolve location (placeId > coordinates > address)
    ↓
Apply driveTimeTo constraint?
├── first_only + isFirstOfDay → Calculate from defaultLocation (use placeId if stored)
├── all → Calculate from previous appointment location
└── none → Skip
    ↓
Apply driveTimeFrom constraint?
├── last_only + isLastOfDay → Calculate to defaultLocation (use placeId if stored)
├── all → Calculate to next appointment location
└── none → Skip
    ↓
Use calculated drive time OR fallback to static minutes
```

**Routes API Request Example:**
```typescript
// Using computeRouteMatrix endpoint
POST https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix

{
  "origins": [
    { "waypoint": { "placeId": "ChIJ..." } }  // Best: Place ID
  ],
  "destinations": [
    { "waypoint": { "location": { "latLng": { "latitude": 37.42, "longitude": -122.08 } } } }  // Good: Coordinates
  ],
  "travelMode": "DRIVE",
  "routingPreference": "TRAFFIC_AWARE"
}
```

**Success Criteria:**
- [ ] Routes API endpoint working
- [ ] Place IDs used when available for better accuracy
- [ ] Drive times calculated correctly between locations
- [ ] Drive times integrate with buffer architecture
- [ ] Caching reduces API calls for same routes
- [ ] Fallback to coordinates/address when placeId unavailable

---

### Session 2.2.3: Drive Time ApplyTo Logic Refactor

**Status:** ✅ Complete

**Objectives:**
- Refactor drive time `applyTo` logic from inclusionary to exclusionary semantics
- Prevent accidental blocking of early/late appointments
- Use business hours boundaries instead of appointment position detection

**Key Tasks Completed:**
1. **Type System Updates**
   - Changed `DriveTimeApplyTo` from `first_only`/`last_only` to `skipDayStart`/`skipDayEnd`
   - Updated `SlotPositionContext` to use business hours boundaries

2. **Core Logic Refactor**
   - Updated `shouldApplyDriveTimeConstraint` to check slot position relative to business hours
   - Added `extractBusinessHoursForDay()` helper to extract business hours from range constraints
   - Updated `markSlotAvailability` to pass business hours context

3. **Drive Time Calculator Simplification**
   - Removed `slotPosition` dependency from `DriveTimeCalculationContext`
   - Simplified calculation logic - filtering happens in `shouldApplyDriveTimeConstraint`

4. **UI Updates**
   - Updated option labels: "All Slots", "Skip Day Start", "Skip Day End"
   - Updated default values: `driveTimeTo.applyTo: 'skipDayStart'`, `driveTimeFrom.applyTo: 'skipDayEnd'`

5. **Test Updates**
   - Updated tests to use business hours boundaries
   - Tests verify constraints are skipped at boundaries and applied elsewhere

**Success Criteria:**
- [x] Exclusionary logic implemented (`skipDayStart`/`skipDayEnd`)
- [x] Business hours boundaries used instead of appointment position
- [x] Early/late slots not incorrectly blocked
- [x] UI updated with new labels and defaults
- [x] Tests updated and passing

---

## Key Files

### Server Files (To Create)
- `server/src/services/googleMapsService.ts` - Maps API service
- `server/src/services/driveTimeCache.ts` - Drive time caching
- `server/src/routes/external/mapsRoutes.ts` - Maps API endpoints

### Client Files (To Create)
- `client/src/services/mapsApiService.ts` - Client-side Maps API
- `client/src/components/common/AddressAutocomplete.vue` - Autocomplete component

### Existing Files (To Modify)
- `client/src/views/admin/tabs/BusinessControlsTab.vue` - Add autocomplete to default location
- `client/src/utils/booking/timeAvailabilityManager.ts` - Integrate calculated drive times
- `client/src/utils/booking/constraintExtractors.ts` - May need updates for dynamic values

---

## Architecture Notes

### API Key Security
- Google Maps API key should be restricted by HTTP referrer (client) or IP (server)
- Server-side proxy implemented to hide API key from client ✅
- Set up billing alerts in Google Cloud Console

### Location Identification Strategy (NEW)
**Priority order for identifying locations:**
1. **Place ID** (best) - Unique identifier from Places API, provides exact access point
2. **Coordinates** (good) - Lat/lng, may snap to nearest road
3. **Address string** (fallback) - Text address, requires geocoding

**Why Place IDs are preferred:**
- More accurate routing (identifies actual building entrances/access points)
- No geocoding needed (faster, cheaper)
- No ambiguity (exact location reference)
- Session 2.2.1 already returns Place IDs from autocomplete

### Caching Strategy
- Drive times between same locations don't change often
- Cache key: `origin_placeId:destination_placeId` (or coordinates if no placeId)
- TTL: 24 hours (routes rarely change)
- Invalidation: Manual refresh option in dev panel

### Rate Limiting
- Routes API: 3,000 elements per minute (EPM)
- Compute Route Matrix: Max 625 elements per request (origins × destinations)
- TRAFFIC_AWARE_OPTIMAL: Max 100 elements per request
- Batch requests when possible (Routes API supports multiple origins/destinations)

### Coordinate Precision
- Store coordinates with 6 decimal places (accuracy ~11cm)
- Round coordinates for cache key normalization

---

## Integration with Drive Time Buffer Architecture

The Drive Time Buffer Refactor (completed) provides:

```typescript
// DriveTimeConfig (from availabilitySettings.ts)
interface DriveTimeConfig {
  minutes: number           // Static fallback value
  enforcement: ConstraintEnforcement
  applyTo: DriveTimeApplyTo  // 'all' | 'first_only' | 'last_only' | 'none'
}

// DefaultLocation (from availabilitySettings.ts) - ENHANCED with placeId
interface DefaultLocation {
  address: string
  label?: string
  placeId?: string          // NEW: Place ID for accurate routing
  coordinates?: {
    lat: number
    lng: number
  }
}
```

**Data Flow for Location Resolution:**
```
Session 2.2.1 (Autocomplete)          Session 2.2.2 (Routes)
        ↓                                     ↓
User selects address            Calculate drive time
        ↓                                     ↓
Places API returns:             Check available identifiers:
- formattedAddress              1. placeId? → Use directly
- placeId ← STORE THIS          2. coordinates? → Use lat/lng
- coordinates                   3. address only? → Pass to API
        ↓                                     ↓
Store all three in              Routes API calculates
DefaultLocation                 accurate drive time
```

Phase 2.2 will:
1. **Store placeId** from autocomplete for accurate routing (Session 2.2.1 enhancement)
2. Use `defaultLocation.placeId` (preferred) or `.coordinates` as origin/destination for first/last appointments
3. Use event locations (from Phase 2.1 calendar events) for intermediate calculations
4. Replace static `minutes` with calculated drive time when API succeeds
5. Fall back to static `minutes` when API fails or location data unavailable

---

## Success Criteria

### Session 2.2.1:
- [ ] Google Maps Places API configured
- [ ] Address autocomplete component working
- [ ] Coordinates extracted and stored
- [ ] Integration with default location field

### Session 2.2.2:
- [ ] Google Maps Routes API configured (replaces legacy Distance Matrix)
- [ ] Place IDs used when available for better accuracy
- [ ] Drive times calculated between locations
- [ ] Integration with buffer architecture
- [ ] Caching working correctly

### Session 2.2.3:
- [ ] Error handling implemented
- [ ] Fallback to static values working
- [ ] User feedback for calculated vs estimated times
- [ ] Performance: API response times <2s

---

## Reference Documents

- **Feature Guide**: `../feature-google-apis-integration-guide.md`
- **Phase 2.1 Handoff**: `phase-2.1-handoff.md`
- **Drive Time Buffer Refactor Plan**: `~/.cursor/plans/drive_time_buffer_refactor_f78512ee.plan.md` ✅ Complete
- **Google Maps Places API**: [developers.google.com/maps/documentation/places](https://developers.google.com/maps/documentation/places/web-service/overview)
- **Google Maps Routes API**: [developers.google.com/maps/documentation/routes](https://developers.google.com/maps/documentation/routes) (replaces legacy Distance Matrix)
- **Routes API - Compute Route Matrix**: [developers.google.com/maps/documentation/routes/compute_route_matrix](https://developers.google.com/maps/documentation/routes/compute_route_matrix)
- **Routes API - Specify Locations**: [developers.google.com/maps/documentation/routes/specify_location-rm](https://developers.google.com/maps/documentation/routes/specify_location-rm)
- **Legacy Distance Matrix API** (deprecated): [developers.google.com/maps/documentation/distance-matrix](https://developers.google.com/maps/documentation/distance-matrix/overview)

---

**Phase Status:** ✅ Complete  
**All Sessions Complete:** 2.2.1 through 2.2.6  
**Phase Completed:** 2026-02-20  
**Last Updated:** 2026-02-20

---

## Session records (integrated)

### Session 2.2.1

# Session 2.2.1 Handoff: Address Autocomplete (Places API)

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Session:** 2.2.1 - Address Autocomplete (Places API)  
**Status:** ⏳ Not Started  
**Created:** 2026-02-01

---

### Session 2.2.2

# Session 2.2.2 Handoff: Drive Time Calculations (Routes API)

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Session:** 2.2.2 - Drive Time Calculations (Routes API)  
**Status:** ⏳ Not Started  
**Created:** 2026-02-01

---

### Session 2.2.4

# Session 2.2.4 Handoff: Wizard Address Autocomplete Integration

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Session:** 2.2.4 - Wizard Address Autocomplete Integration  
**Status:** ✅ Complete  
**Created:** 2026-02-01

---

### Session 2.2.5

# Session 2.2.5 Handoff: API Prefetching & Data Source Semantics

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Session:** 2.2.5 - API Prefetching & Data Source Semantics  
**Status:** ✅ Complete  
**Created:** 2026-02-02  
**Completed:** 2026-02-19

---

### Session 2.2.6

# Session 2.2.6 Handoff: Constraint Attribution & Admin Performance

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Session:** 2.2.6 - Constraint Attribution & Admin Performance  
**Status:** ✅ Complete  
**Created:** 2026-02-02  
**Completed:** 2026-02-19

---

## Current Status

**Last Completed:** Session 2.2.6 (documentation alignment + session-end workflow)
**Next Session:** Phase 2.2 complete — next action is /phase-end 2.2 or begin Phase 2.3 if defined
**Last Updated:** 2026-02-20

---

## Next Action

Start next session when ready (see Next Session below).

---

## Session Overview

**Session Number:** 2.2.6  
**Session Name:** Constraint Attribution & Admin Performance  
**Description:** Fix how violations are attributed and displayed in the constraint overlay, ensuring direct conflicts are always attributed to "appointment" (blue) and drive time constraints are always "buffer" violations. Also optimize admin panel performance by loading settings only when the Business Controls tab is active.

**Goal:** Fix violation attribution so constraint overlay displays correct colors and information, and optimize admin panel by preventing unnecessary API calls until user navigates to Business Controls tab.

**Architecture Decision:** Violation Attribution Rules
- Direct overlap conflicts are ALWAYS appointment conflicts (fundamental can't-double-book)
- Drive time constraints can ONLY be buffer violations (they can never be "direct" conflicts)
- Collect ALL violations with proper attribution for debugging overlay
- Include buffer minutes in violation string for tooltip display

---

## Objectives

1. Fix violation attribution in `timeAvailabilityManager` - direct conflicts = appointment, drive times = buffer only
2. Update violation collection to include ALL violations with proper attribution
3. Include buffer minutes in violation strings (e.g., `overlap.driveToCandidate.buffer:20`)
4. Update constraint display (AppointmentSlotGrid / constraintColors) to handle buffer:minutes format in violations
5. Display buffer minutes in tooltip text (e.g., "Drive To Appointment buffer (20 min)")
6. Add conditional loading to `useAvailabilitySettings` composable
7. Update `AdminPanel` to provide currentTab state via inject
8. Update `BusinessControlsTab` to inject tab state and load settings only when active

---

## Prerequisites

- ✅ Session 2.2.5 Complete (API Prefetching & Data Source Semantics)
- ✅ Session 2.2.3 Complete (Drive Time ApplyTo Logic Refactor)
- ✅ Constraint display in AppointmentSlotGrid with constraintColors displays violations

---

## Implementation Summary

### Part A: Violation Attribution Fix

#### 1. Fix Violation Attribution Logic

**File:** `client/src/utils/booking/timeAvailabilityManager.ts`

- **Key Change:** Direct overlap is ALWAYS an appointment conflict
- **Key Change:** Drive time constraints can ONLY be buffer violations
- Refactor `checkSlotAvailability` to:
  - Check direct overlap first (always appointment.direct)
  - Collect ALL violations (not just first hard failure)
  - For appointment constraint: record buffer if extends beyond direct overlap
  - For drive time constraints: only record buffer-only overlaps
  - Include buffer minutes in violation string: `overlap.{type}.buffer:{minutes}`
- Return ALL violations (not just first) for debugging overlay

#### 2. Update Violation String Format

**File:** `client/src/utils/booking/timeAvailabilityManager.ts`

- Include buffer minutes in violation strings:
  - Format: `overlap.driveToCandidate.buffer:20` (includes minutes)
  - Format: `overlap.event.direct` / `overlap.outOfOffice.direct` (no minutes for direct)
  - Format: `overlap.appointment.buffer:15` (includes minutes for buffer)

### Part B: Constraint Overlay Display

#### 3. Update Constraint Display for Buffer Minutes

**File:** `client/src/utils/booking/constraintColors.ts` (used by AppointmentSlotGrid.vue)

- `getColorForViolation` strips minutes suffix (e.g., `buffer:20` → `buffer`)
- `formatViolationTooltip` parses buffer minutes and displays e.g. "Drive To Appointment buffer (20 min)"
- Handles both old format (no minutes) and new format (with minutes)

### Part C: Admin Performance Optimization

#### 4. Add Conditional Loading to useAvailabilitySettings

**File:** `client/src/composables/admin/useAvailabilitySettings.ts`

- Add optional `enabled` parameter to `UseAvailabilitySettingsOptions` interface
- Watch `enabled` ref and only load settings when `enabled === true`
- Fallback: Load immediately if no `enabled` option provided (backward compatibility)
- Update `onMounted` logic to conditional loading based on `enabled` state

#### 5. Provide CurrentTab in AdminPanel

**File:** `client/src/views/admin/AdminPanel.vue`

- Provide `currentTab` ref via inject
- Allows child tabs to know if they're active

#### 6. Update BusinessControlsTab for Conditional Loading

**File:** `client/src/views/admin/tabs/BusinessControlsTab.vue`

- Inject `adminCurrentTab` from parent
- Compute `isTabActive` based on currentTab value
- Pass `enabled: isTabActive` to `useAvailabilitySettings`
- Settings only load when tab is active (prevents API call on initial page load)

---

## Files Modified

### Client (Frontend)

| File | Changes |
|------|---------|
| `client/src/utils/booking/timeAvailabilityManager.ts` | Fix violation attribution, collect ALL violations, include buffer minutes |
| `client/src/utils/booking/constraintColors.ts` / `AppointmentSlotGrid.vue` | Handle buffer:minutes format, display buffer value in tooltips |
| `client/src/composables/admin/useAvailabilitySettings.ts` | Add conditional loading based on enabled option |
| `client/src/views/admin/AdminPanel.vue` | Provide currentTab via inject |
| `client/src/views/admin/tabs/BusinessControlsTab.vue` | Inject tab state, load settings only when active |

---

## Violation Attribution Rules

```
Direct Overlap (event/out-of-office conflict)
    │
    ├─ Calendar event: 'overlap.event.direct' (blue)
    └─ Out of office: 'overlap.outOfOffice.direct' (blue)

Buffer-Only Overlap (due to buffer minutes)
    │
    ├─ Appointment buffer extends beyond direct overlap
    │   └─ Attributed to: 'overlap.appointment.buffer:{minutes}' (blue)
    │
    └─ Drive time buffer (no direct overlap)
        ├─ driveToCandidate: 'overlap.driveToCandidate.buffer:{minutes}' (orange)
        └─ driveFromCandidate: 'overlap.driveFromCandidate.buffer:{minutes}' (red)
```

---

## Testing Checklist

- [ ] Test violation attribution: direct conflicts show as event.direct or outOfOffice.direct (blue)
- [ ] Test violation attribution: drive times show as buffer violations only (orange/red)
- [ ] Test violation collection: ALL violations collected (not just first)
- [ ] Test buffer minutes display: tooltip shows "Drive To Appointment buffer (20 min)"
- [ ] Test constraint overlay: correct colors for each violation type
- [ ] Test admin performance: settings NOT loaded on initial page load
- [ ] Test admin performance: settings load when Business Controls tab becomes active
- [ ] Test backward compatibility: useAvailabilitySettings works without enabled option
- [ ] Test multiple violations: overlay shows all constraint types correctly

---

## Success Criteria

**Violation Attribution:**
- ✅ Direct conflicts always attributed to appointment (blue)
- ✅ Drive time constraints always buffer violations (orange/red)
- ✅ ALL violations collected (not just first hard failure)
- ✅ Buffer minutes included in violation strings

**Constraint Overlay:**
- ✅ Correct colors for each violation type
- ✅ Buffer minutes displayed in tooltips
- ✅ Handles both old format (no minutes) and new format (with minutes)

**Admin Performance:**
- ✅ Settings NOT loaded on initial page load
- ✅ Settings load when Business Controls tab becomes active
- ✅ Backward compatibility maintained (works without enabled option)
- ✅ No unnecessary API calls until tab is active

**Code Quality:**
- ✅ All files compile without errors
- ✅ TypeScript types correct
- ✅ No linting errors
- ✅ Violation attribution logic clear and maintainable

---

## Next Session

**Session TBD:** Error Handling & Fallbacks (if needed)
- Comprehensive error handling for Places API failures
- Retry logic for transient errors
- User-friendly error messages

---

## Notes

- Violation attribution fix ensures constraint overlay displays correct information for debugging
- Direct conflicts are fundamental (can't double-book), so they're always appointment type
- Drive times are always buffer-only because they represent travel time, not actual conflicts
- Admin performance optimization prevents unnecessary API calls on initial page load
- Conditional loading pattern can be reused for other admin tabs if needed

---

**Session Status:** ✅ Complete  
**Created:** 2026-02-02  
**Completed:** 2026-02-19

## Session Overview

**Session Number:** 2.2.5  
**Session Name:** API Prefetching & Data Source Semantics  
**Description:** Verified existing prefetching architecture, implemented server-side `dataSource` handling, fixed a month-change prefetch gap, and made `dataSource` configurable from the client.

**Goal:** Ensure API prefetching covers all calendar navigation scenarios and that the `dataSource` dev toggle is fully functional from client to server.

**Architecture Context:** The codebase uses server-side computed availability (single endpoint). The original session plan assumed client-side orchestration, but Tasks 2.2.5.1-4 were already implemented as part of the server-side refactor, and Tasks 2.2.5.5-6 are no longer applicable.

---

## Objectives

1. ✅ Verify `useDateRangeDecider` composable (already exists)
2. ✅ Verify BookingWizard provide/inject setup (already exists)
3. ✅ Verify AvailabilityStep month tracking (already exists)
4. ✅ Implement `dataSource` handling in server `computeAvailabilityData`
5. ✅ Fix month-change prefetch gap in `useComputedAvailability`
6. ✅ Make `dataSource` configurable from client composable
7. ✅ Update shared type documentation for `dataSource` semantics
8. ✅ Verify `applyTo` validation alignment (already correct)

---

## Implementation Summary

### Server-Side dataSource Handling

**File:** `server/src/services/computedAvailabilityService.ts`

The `dataSource` field in `ComputedAvailabilityRequest` now controls which external APIs the server calls:

| Mode | Settings/DB | Calendar Events API | Routes API | Slot Computation |
|------|-------------|--------------------| -----------|-----------------|
| `'real'` (default) | ✅ | ✅ | ✅ | ✅ Full |
| `'mock'` | ✅ | ❌ (empty events) | ❌ (empty drive times) | ✅ Settings-only |
| `'none'` | ✅ (metadata) | ❌ | ❌ | ❌ (empty slots) |

### Month-Wide Prefetch

**File:** `client/src/composables/booking/useComputedAvailability.ts`

Added third fetch strategy — **month-wide prefetch** — triggered when `dateRange` changes and the displayed month's end date is not in the slot cache. This ensures calendar months beyond the initial 14-day window have slot data for availability indicators.

Three-tier fetch strategy:
1. **14-day prefetch:** On mount and when placeId/duration changes
2. **Month-wide prefetch:** When displayed month navigates beyond cached range
3. **Per-day fallback:** When user selects a specific uncached date

### Configurable dataSource

**File:** `client/src/composables/booking/useComputedAvailability.ts`

Added optional `dataSource` parameter (`Ref<'real' | 'mock' | 'none'>`) to `UseComputedAvailabilityParams`. Defaults to `'real'` when not provided. BookingWizard can pass a reactive ref to toggle modes at runtime.

---

## Files Modified

### Server

| File | Changes |
|------|---------|
| `server/src/services/computedAvailabilityService.ts` | Added `dataSource` branching: `'real'` (full), `'mock'` (settings-only), `'none'` (empty) |

### Client

| File | Changes |
|------|---------|
| `client/src/composables/booking/useComputedAvailability.ts` | Added month-wide prefetch watcher, configurable `dataSource` parameter, updated docs |
| `client/src/services/calendarApiService.ts` | Updated `fetchComputedAvailabilityData` JSDoc for `dataSource` modes |

### Shared

| File | Changes |
|------|---------|
| `shared/types/availabilityTypes.ts` | Updated `ComputedAvailabilityRequest.dataSource` JSDoc with mode descriptions |

---

## Data Flow

```
BookingWizard (Parent)
    │
    ├─ Initialize displayedMonth ref (current month)
    ├─ Create dateRange via useDateRangeDecider(displayedMonth)
    ├─ Create useComputedAvailability({ dateRange, ... })
    │   │
    │   ├─ 14-day prefetch (immediate, on mount)
    │   ├─ Month-wide prefetch (when dateRange changes, end not in cache)
    │   └─ Per-day fallback (when selectedDate not in cache)
    │
    ├─ Provide: displayedMonth, updateDisplayedMonth, computedAvailability
    │
    ▼
AvailabilityStep (Child)
    │
    ├─ Inject: displayedMonth, updateDisplayedMonth, computedAvailability
    ├─ useAvailabilityOrchestrator syncs vDatePickerDisplayDate ↔ displayedMonth
    │   │
    │   └─ When VDatePicker month changes → updateDisplayedMonth → dateRange recomputes
    │       → month-wide prefetch triggers → slotsByDay updated → allowedDates recalculated
    │
    └─ Calendar shows slot availability indicators for the full displayed month
```

---

## Testing Checklist

- [x] Server compiles cleanly with `dataSource` handling
- [x] Client compiles without new errors
- [x] No linter errors in modified files
- [ ] Test `dataSource: 'real'` — full pipeline (existing behavior)
- [ ] Test `dataSource: 'mock'` — slots computed without Google API calls
- [ ] Test `dataSource: 'none'` — empty response returned
- [ ] Test month navigation beyond 14-day window triggers month-wide prefetch
- [ ] Test navigating back to a cached month does not trigger redundant fetch

---

## Success Criteria

**Server dataSource:**
- ✅ `'real'` mode: Full pipeline (unchanged behavior)
- ✅ `'mock'` mode: Skips Calendar Events API and Routes API
- ✅ `'none'` mode: Returns empty response with settings metadata

**Month Prefetch:**
- ✅ Month-wide prefetch triggers for uncached months
- ✅ Cache-check uses month end date to avoid redundant fetches
- ✅ All three fetch strategies merge into same Map cache

**Code Quality:**
- ✅ Server TypeScript compiles clean
- ✅ Client no new type errors
- ✅ No linting errors
- ✅ Documentation updated across shared types, client service, and composable

---

## Current Status

**Last Completed:** Session 2.2.5 (all tasks)
**Next Session:** Session 2.2.6
**Last Updated:** 2026-02-19

## Next Action

Start Session 2.2.6

## Transition Context

**Where we left off:**
Completed Session 2.2.5 — API Prefetching & Data Source Semantics. Server-side `dataSource` handling, month-wide prefetch, and configurable client parameter are implemented.

**What you need to start:**
- Begin Session 2.2.6: Constraint Attribution & Admin Performance

---

## Next Session

**Session 2.2.6:** Constraint Attribution & Admin Performance
- Fix violation attribution (direct conflicts = appointment, drive times = buffer only)
- Display buffer minutes in constraint overlay tooltips
- Optimize admin settings loading (conditional load when tab active)

---

## Notes

- The `dataSource` parameter controls external API usage, not settings/constraints — settings always come from the database
- Month-wide prefetch checks the end of the month to avoid fetching months that are partially covered by the 14-day window
- The `isLoading` ref may flicker if multiple fetch strategies run concurrently (14-day + month-wide). This is acceptable for now; a fetch queue could be added in a future session if it causes UX issues
- `'mock'` mode is particularly useful for development without Google API credentials — you still get slot computation from business hours/constraints

---

**Session Status:** ✅ Complete  
**Completed:** 2026-02-19  
**Last Updated:** 2026-02-19

## Session Overview

**Session Number:** 2.2.4  
**Session Name:** Wizard Address Autocomplete Integration  
**Description:** Integrate Google Places autocomplete into booking wizard Step 2 (Property Details) with progressive disclosure UI. Add placeId/coordinates columns to Address table and populate existing addresses.

**Goal:** Enable address autocomplete in the booking wizard, store location data (placeId/coordinates) for drive time calculations, and align database schema with Places API data.

**Architecture Decision:** Progressive disclosure UI pattern
- Start with autocomplete-only field for clean initial UI
- Expand to show editable fields after selection or when loading existing data
- Fallback to manual entry if autocomplete API fails
- Store placeId and coordinates for accurate drive time calculations

---

## Objectives

1. ✅ Add place_id, latitude, longitude columns to addresses table
2. ✅ Update Address Sequelize model with new fields
3. ✅ Create backfill script to populate existing addresses
4. ✅ Update property router to accept/store placeId/coordinates
5. ✅ Update client types (PropertyRequest, PropertyResponse, PropertyDetailsData)
6. ✅ Add placeId/coordinates to form state composable
7. ✅ Implement progressive disclosure UI in PropertyDetailsStep
8. ✅ Add place selection handler to extract address components
9. ✅ Include placeId/coordinates in appointment data collection
10. ✅ Update loading logic for existing appointments
11. ✅ Handle autocomplete errors with fallback

---

## Prerequisites

- ✅ Session 2.2.1 Complete (Address Autocomplete component)
- ✅ Session 2.2.2 Complete (Routes API integration)
- ✅ AddressAutocomplete component tested in admin panel

---

## Implementation Summary

### Part A: Database Alignment (Backend)

#### 1. Database Migration

**File:** `server/src/db/migrations/20260201_02_add_place_data_to_addresses.mjs`

- Added `place_id` (STRING, nullable) column
- Added `latitude` (DECIMAL(10, 8), nullable) column
- Added `longitude` (DECIMAL(11, 8), nullable) column
- Created index on `place_id` for lookups
- All columns nullable for backward compatibility

#### 2. Address Model Update

**File:** `server/src/db/models/booking/address.ts`

- Added `placeId`, `latitude`, `longitude` fields to Sequelize model
- Fields mapped to snake_case database columns

#### 3. Backfill Script

**File:** `server/src/scripts/backfillAddressPlaceData.ts` (removed after one-time use)

- ✅ One-time script executed successfully to populate existing addresses
- Fetched all addresses missing `place_id`
- Called Places API (autocomplete + place details) for each address
- Updated records with placeId, latitude, longitude
- Script removed after completion as it's no longer needed

#### 4. Property Router Update

**File:** `server/src/routes/internal/properties/propertyRouter.ts`

- Updated `findOrCreateAddress()` to accept `placeId`, `latitude`, `longitude`
- Updated POST `/api/properties` endpoint to extract and pass location data
- Updated property transformer to include new fields in response

**File:** `server/src/utils/propertyTransformers.ts`

- Added `PLACE_ID`, `LATITUDE`, `LONGITUDE` to field mappings
- Updated `transformPropertyVersion()` to include location data in response

### Part B: Client Type Updates

#### 5. Property Types

**File:** `client/src/types/property.ts`

- Added `placeId`, `latitude`, `longitude` to `PropertyRequest` interface
- Added `placeId`, `latitude`, `longitude` to `PropertyResponse` interface

**File:** `client/src/types/propertyForm.ts`

- Added `placeId`, `coordinates` to `PropertyDetailsData` interface
- Added `placeId`, `coordinates` refs to `PropertyFormData` interface

### Part C: Wizard UI Integration

#### 6. Form State Composable

**File:** `client/src/composables/booking/usePropertyFormState.ts`

- Added `placeId` and `coordinates` refs
- Added `isAddressExpanded` ref for progressive disclosure UI
- Updated return type to include `isAddressExpanded`

#### 7. Property Details Logic

**File:** `client/src/composables/booking/usePropertyDetailsLogic.ts`

- Added `handlePlaceSelected()` function to extract address components from Places API
- Added `handleAutocompleteError()` for fallback to manual entry
- Added `changeAddress()` to return to autocomplete-only mode
- Updated `stepData` computed to include placeId/coordinates
- Updated interface to accept `isAddressExpanded` ref

#### 8. Property Details Step Component

**File:** `client/src/components/booking/steps/PropertyDetailsStep.vue`

- Implemented progressive disclosure UI:
  - **Autocomplete-only mode**: Shows only `AddressAutocomplete` component
  - **Expanded mode**: Shows autocomplete + editable address fields + "Change Address" button
- Integrated `AddressAutocomplete` component with place-selected handler
- Added error handling with fallback to expanded fields
- Updated form watchers to pass `isAddressExpanded`

#### 9. Data Collection

**File:** `client/src/composables/booking/useAppointmentDataCollection.ts`

- Updated `PropertyRequest` to include `placeId`, `latitude`, `longitude`
- Extracts coordinates from `coordinates` object (lat/lng)

#### 10. Loading Logic

**File:** `client/src/composables/booking/usePropertyFormWatchers.ts`

- Updated to populate `placeId` and `coordinates` when loading existing appointments
- Sets `isAddressExpanded = true` when address exists (for existing appointments)
- Updated interface to accept `isAddressExpanded` ref

**File:** `client/src/utils/transformers/appointmentToWizardTransformer.ts`

- Updated `WizardStateData` interface to include `placeId` and `coordinates` in `propertyDetails`
- Extracts `placeId`, `latitude`, `longitude` from address object
- Constructs `coordinates` object from latitude/longitude

---

## Files Modified

### Backend (Server)

| File | Changes |
|------|---------|
| `server/src/db/migrations/20260201_02_add_place_data_to_addresses.mjs` | NEW: Migration for place_id, latitude, longitude columns |
| `server/src/db/models/booking/address.ts` | Added placeId, latitude, longitude fields |
| `server/src/scripts/backfillAddressPlaceData.ts` | ✅ One-time script (removed after use) |
| `server/src/routes/internal/properties/propertyRouter.ts` | Updated findOrCreateAddress, POST endpoint |
| `server/src/utils/propertyTransformers.ts` | Added location fields to transformer |

### Client (Frontend)

| File | Changes |
|------|---------|
| `client/src/types/property.ts` | Added placeId, latitude, longitude to PropertyRequest/Response |
| `client/src/types/propertyForm.ts` | Added placeId, coordinates to PropertyDetailsData/PropertyFormData |
| `client/src/composables/booking/usePropertyFormState.ts` | Added placeId, coordinates, isAddressExpanded refs |
| `client/src/composables/booking/usePropertyDetailsLogic.ts` | Added place selection handlers, updated stepData |
| `client/src/components/booking/steps/PropertyDetailsStep.vue` | Progressive disclosure UI with AddressAutocomplete |
| `client/src/composables/booking/useAppointmentDataCollection.ts` | Include placeId/coordinates in PropertyRequest |
| `client/src/composables/booking/usePropertyFormWatchers.ts` | Populate placeId/coordinates, set isAddressExpanded |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | Extract placeId/coordinates when loading |

---

## UI Flow (Progressive Disclosure)

```
┌─────────────────────────────────────┐
│  Page Loads                         │
│  ┌───────────────────────────────┐  │
│  │ AddressAutocomplete (only)    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           │
           │ User selects address
           │ OR
           │ Existing address loaded
           │ OR
           │ Autocomplete API fails
           ▼
┌─────────────────────────────────────┐
│  Expanded View                      │
│  ┌───────────────────────────────┐  │
│  │ AddressAutocomplete           │  │
│  ├───────────────────────────────┤  │
│  │ Street Address (editable)     │  │
│  │ Unit (editable, if required)  │  │
│  │ City (editable)               │  │
│  │ State (editable)              │  │
│  │ Zip Code (editable)           │  │
│  ├───────────────────────────────┤  │
│  │ [Change Address] button       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           │
           │ User clicks "Change Address"
           ▼
┌─────────────────────────────────────┐
│  Back to Autocomplete-only         │
└─────────────────────────────────────┘
```

---

## Data Flow

```
AddressAutocomplete
    │
    │ place-selected event
    ▼
handlePlaceSelected()
    │
    ├─ Extract address components
    ├─ Populate form fields (address, city, state, zipCode)
    ├─ Store placeId
    ├─ Store coordinates (lat, lng)
    └─ Set isAddressExpanded = true
    │
    ▼
PropertyDetailsStep
    │
    │ User submits form
    ▼
useAppointmentDataCollection
    │
    ├─ Extract placeId
    ├─ Extract latitude from coordinates.lat
    ├─ Extract longitude from coordinates.lng
    └─ Include in PropertyRequest
    │
    ▼
POST /api/properties
    │
    ├─ findOrCreateAddress() with location data
    └─ Store in addresses table
```

---

## Testing Checklist

- [x] Run migration: `npm run migrate` (or sequelize-cli)
- [x] Verify columns added to addresses table
- [x] Run backfill script (completed - script removed)
- [ ] Test new property creation with placeId/coordinates
- [ ] Test loading existing appointment with location data
- [ ] Test progressive disclosure UI:
  - [ ] Autocomplete-only mode on initial load
  - [ ] Expands after address selection
  - [ ] Expands when loading existing appointment
  - [ ] "Change Address" returns to autocomplete-only
  - [ ] Fallback to expanded fields on API error
- [ ] Verify placeId/coordinates stored in database
- [ ] Verify placeId/coordinates included in PropertyResponse

---

## Success Criteria

**Database:**
- ✅ Migration adds place_id, latitude, longitude columns
- ✅ Address model includes new fields
- ✅ Backfill script populates existing addresses
- ✅ Property creation stores placeId/coordinates when provided

**UI:**
- ✅ Address autocomplete appears as primary input on Step 2
- ✅ Selecting address expands to show editable fields pre-filled
- ✅ Fields are editable for corrections
- ✅ "Change Address" returns to autocomplete-only mode
- ✅ Fallback to expanded fields if autocomplete API fails

**Data Flow:**
- ✅ placeId and coordinates stored with new addresses
- ✅ Existing appointments load with coordinates if available
- ✅ Drive time calculations can use stored coordinates

---

## Next Session

**Session 2.2.5:** Error Handling & Fallbacks (if needed)
- Comprehensive error handling for Places API failures
- Retry logic for transient errors
- User-friendly error messages

---

## Notes

- Backfill script uses rate limiting (200ms delay) to avoid API quota issues
- Existing addresses without placeId remain unchanged (no automatic backfill on access)
- Progressive disclosure improves UX by reducing initial form complexity
- Location data enables accurate drive time calculations using Routes API (Session 2.2.2)

---

**Session Status:** ✅ Complete  
**Completed:** 2026-02-01

## Session Overview

**Session Number:** 2.2.2  
**Session Name:** Drive Time Calculations (Routes API)  
**Description:** Set up Google Maps Routes API for calculating drive times between appointment locations. Uses Place IDs when available for optimal accuracy.

**Goal:** Implement drive time calculation that integrates with the buffer architecture to dynamically adjust appointment spacing based on actual travel times.

**Architecture Decision:** Using Routes API instead of legacy Distance Matrix API
- Distance Matrix API is now marked as "Legacy" by Google
- Routes API is the modern replacement with same pricing
- Better accuracy when using Place IDs
- Real-time traffic data and improved ETAs

---

## Objectives

1. Enable Routes API in Google Cloud Console
2. Enhance Session 2.2.1 to store Place IDs (prerequisite enhancement)
3. Extend server-side Google Maps service with Routes API client
4. Create route matrix endpoint for drive time calculations
5. Implement location resolution priority (placeId > coordinates > address)
6. Add caching for drive time results
7. Integrate with buffer architecture for dynamic drive times

---

## Prerequisites

- ✅ Session 2.2.1 Complete (Address Autocomplete with Places API)
- ✅ Drive Time Buffer Refactor Complete (`driveTimeTo`/`driveTimeFrom` architecture)
- ✅ Google Cloud Project exists (`stone-passage-382818`)
- ✅ Places API enabled
- ⏳ Routes API needs to be enabled

---

## Implementation Tasks

### Task 0: Prerequisite Enhancement - Store Place IDs

**Why:** Routes API works best with Place IDs for accurate routing.

**Files to Modify:**

1. `client/src/configs/availabilitySettings.ts` - Add placeId to DefaultLocation:
```typescript
export interface DefaultLocation {
  address: string
  label?: string
  placeId?: string      // ← ADD THIS
  coordinates?: Coordinates
}
```

2. `client/src/components/common/AddressAutocomplete.vue` - Emit placeId:
```typescript
// Add to emits
emit('update:placeId', placeDetails.placeId)

// Or include in place-selected event (already has placeId)
```

3. `client/src/views/admin/tabs/BusinessControlsTab.vue` - Store placeId:
```typescript
const defaultLocationPlaceId = computed({
  get: () => formData.value?.defaultLocation?.placeId,
  set: (value) => {
    if (formData.value?.defaultLocation) {
      formData.value.defaultLocation.placeId = value
    }
  }
})
```

### Task 1: Google Cloud Console Setup

1. **Enable Routes API**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to APIs & Services → Library
   - Search for "Routes API" and enable it
   
2. **Verify API Key Access**
   - Ensure existing API key has access to Routes API
   - Or update API restrictions to include Routes API

### Task 2: Server-Side Routes API Client

**Extend `server/src/services/googleMapsService.ts`:**

```typescript
// Types for Routes API
export interface RouteMatrixOrigin {
  placeId?: string;
  coordinates?: Coordinates;
  address?: string;
}

export interface RouteMatrixDestination {
  placeId?: string;
  coordinates?: Coordinates;
  address?: string;
}

export interface RouteMatrixResult {
  originIndex: number;
  destinationIndex: number;
  durationSeconds: number;
  distanceMeters: number;
  status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS';
}

/**
 * Calculate drive times using Routes API computeRouteMatrix
 * 
 * Location priority: placeId > coordinates > address
 * 
 * @param origins - Array of origin locations
 * @param destinations - Array of destination locations
 * @param useTraffic - Whether to use real-time traffic (default: true)
 */
export async function calculateRouteMatrix(
  origins: RouteMatrixOrigin[],
  destinations: RouteMatrixDestination[],
  useTraffic: boolean = true
): Promise<RouteMatrixResult[]> {
  // Implementation
}

/**
 * Helper to convert our location format to Routes API waypoint
 */
function toWaypoint(location: RouteMatrixOrigin | RouteMatrixDestination): object {
  if (location.placeId) {
    return { placeId: location.placeId };
  }
  if (location.coordinates) {
    return { 
      location: { 
        latLng: { 
          latitude: location.coordinates.lat, 
          longitude: location.coordinates.lng 
        } 
      } 
    };
  }
  if (location.address) {
    return { address: location.address };
  }
  throw new MapsApiError('invalid', 'Location must have placeId, coordinates, or address');
}
```

### Task 3: Routes API Endpoint

**Add to `server/src/routes/external/mapsRoutes.ts`:**

```typescript
/**
 * POST /api/v1/external/maps/route-matrix
 * 
 * Calculate drive times between multiple origins and destinations
 * using Google Routes API computeRouteMatrix
 */
router.post('/route-matrix', async (req: Request, res: Response): Promise<void> => {
  try {
    const { origins, destinations, useTraffic = true } = req.body;
    
    // Validate input
    if (!origins?.length || !destinations?.length) {
      res.status(400).json({ 
        error: 'Missing required fields: origins and destinations arrays', 
        type: 'invalid' 
      });
      return;
    }
    
    // Check element limit (origins × destinations ≤ 625)
    const elementCount = origins.length * destinations.length;
    if (elementCount > 625) {
      res.status(400).json({ 
        error: `Element count ${elementCount} exceeds maximum 625`, 
        type: 'invalid' 
      });
      return;
    }
    
    const results = await calculateRouteMatrix(origins, destinations, useTraffic);
    res.json({ results });
    
  } catch (error) {
    // Error handling
  }
});

/**
 * GET /api/v1/external/maps/drive-time
 * 
 * Simple endpoint to get drive time between two locations
 * Returns time in minutes
 */
router.get('/drive-time', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      originPlaceId, originLat, originLng, originAddress,
      destPlaceId, destLat, destLng, destAddress,
      useTraffic = 'true'
    } = req.query;
    
    // Build origin
    const origin: RouteMatrixOrigin = {};
    if (originPlaceId) origin.placeId = originPlaceId as string;
    else if (originLat && originLng) origin.coordinates = { 
      lat: parseFloat(originLat as string), 
      lng: parseFloat(originLng as string) 
    };
    else if (originAddress) origin.address = originAddress as string;
    
    // Build destination (similar)
    
    const results = await calculateRouteMatrix([origin], [destination], useTraffic === 'true');
    
    if (results.length === 0 || results[0].status !== 'OK') {
      res.status(404).json({ error: 'Route not found', type: 'not_found' });
      return;
    }
    
    res.json({
      durationMinutes: Math.ceil(results[0].durationSeconds / 60),
      durationSeconds: results[0].durationSeconds,
      distanceMeters: results[0].distanceMeters,
      distanceMiles: Math.round(results[0].distanceMeters / 1609.34 * 10) / 10
    });
    
  } catch (error) {
    // Error handling
  }
});
```

### Task 4: Drive Time Caching

**Create `server/src/services/driveTimeCache.ts`:**

```typescript
/**
 * Drive Time Cache Service
 * 
 * LEARNING: Caches drive time calculations to reduce API calls
 * WHY: Same routes don't change often, TTL of 24 hours is reasonable
 */

interface DriveTimeCacheEntry {
  durationSeconds: number;
  distanceMeters: number;
  timestamp: number;
}

const cache = new Map<string, DriveTimeCacheEntry>();
const TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate cache key from locations
 * Priority: placeId > coordinates (rounded) > address hash
 */
function generateCacheKey(
  origin: RouteMatrixOrigin, 
  destination: RouteMatrixDestination
): string {
  const originKey = origin.placeId 
    || (origin.coordinates ? `${origin.coordinates.lat.toFixed(4)},${origin.coordinates.lng.toFixed(4)}` : null)
    || origin.address;
    
  const destKey = destination.placeId 
    || (destination.coordinates ? `${destination.coordinates.lat.toFixed(4)},${destination.coordinates.lng.toFixed(4)}` : null)
    || destination.address;
    
  return `${originKey}:${destKey}`;
}

export function getCachedDriveTime(
  origin: RouteMatrixOrigin, 
  destination: RouteMatrixDestination
): DriveTimeCacheEntry | null {
  const key = generateCacheKey(origin, destination);
  const entry = cache.get(key);
  
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(key);
    return null;
  }
  
  return entry;
}

export function cacheDriveTime(
  origin: RouteMatrixOrigin, 
  destination: RouteMatrixDestination,
  durationSeconds: number,
  distanceMeters: number
): void {
  const key = generateCacheKey(origin, destination);
  cache.set(key, { durationSeconds, distanceMeters, timestamp: Date.now() });
}
```

### Task 5: Client-Side Integration

**Extend `client/src/services/mapsApiService.ts`:**

```typescript
export interface DriveTimeResult {
  durationMinutes: number;
  durationSeconds: number;
  distanceMeters: number;
  distanceMiles: number;
}

export interface LocationInput {
  placeId?: string;
  coordinates?: Coordinates;
  address?: string;
}

/**
 * Calculate drive time between two locations
 * 
 * Location priority: placeId > coordinates > address
 */
export async function fetchDriveTime(
  origin: LocationInput,
  destination: LocationInput,
  useTraffic: boolean = true
): Promise<DriveTimeResult> {
  // Build query params based on available data
  const params = new URLSearchParams();
  
  if (origin.placeId) params.append('originPlaceId', origin.placeId);
  else if (origin.coordinates) {
    params.append('originLat', origin.coordinates.lat.toString());
    params.append('originLng', origin.coordinates.lng.toString());
  }
  else if (origin.address) params.append('originAddress', origin.address);
  
  // Similar for destination...
  
  params.append('useTraffic', useTraffic.toString());
  
  const response = await axios.get<DriveTimeResult>(
    `${API_BASE_URL}/api/v1/external/maps/drive-time?${params.toString()}`
  );
  
  return response.data;
}
```

---

## API Reference

### Google Routes API - Compute Route Matrix

**Endpoint:**
```
POST https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix
```

**Headers:**
```
Content-Type: application/json
X-Goog-Api-Key: YOUR_API_KEY
X-Goog-FieldMask: originIndex,destinationIndex,duration,distanceMeters,status,condition
```

**Request Body:**
```json
{
  "origins": [
    {
      "waypoint": { "placeId": "ChIJayOTViHY5okRRoq2kGnGg8o" },
      "routeModifiers": { "avoid_ferries": true }
    }
  ],
  "destinations": [
    {
      "waypoint": { 
        "location": { 
          "latLng": { "latitude": 37.420999, "longitude": -122.086894 } 
        } 
      }
    }
  ],
  "travelMode": "DRIVE",
  "routingPreference": "TRAFFIC_AWARE"
}
```

**Response:**
```json
[
  {
    "originIndex": 0,
    "destinationIndex": 0,
    "status": {},
    "distanceMeters": 822,
    "duration": "160s",
    "condition": "ROUTE_EXISTS"
  }
]
```

### Waypoint Location Formats

**1. Place ID (preferred):**
```json
{ "waypoint": { "placeId": "ChIJ..." } }
```

**2. Coordinates:**
```json
{ "waypoint": { "location": { "latLng": { "latitude": 37.42, "longitude": -122.08 } } } }
```

**3. Address string:**
```json
{ "waypoint": { "address": "1600 Amphitheatre Parkway, Mountain View, CA" } }
```

---

## Files to Create

| File | Description |
|------|-------------|
| `server/src/services/driveTimeCache.ts` | Drive time caching service |

## Files to Modify

| File | Change |
|------|--------|
| `server/src/services/googleMapsService.ts` | Add Routes API client functions |
| `server/src/routes/external/mapsRoutes.ts` | Add route-matrix and drive-time endpoints |
| `client/src/services/mapsApiService.ts` | Add fetchDriveTime function |
| `client/src/configs/availabilitySettings.ts` | Add placeId to DefaultLocation |
| `client/src/components/common/AddressAutocomplete.vue` | Emit placeId |
| `client/src/views/admin/tabs/BusinessControlsTab.vue` | Store placeId |

---

## Success Criteria

- [ ] Routes API enabled in Google Cloud Console
- [ ] Place IDs stored from address autocomplete (Task 0 enhancement)
- [ ] `calculateRouteMatrix` function working on server
- [ ] `/api/v1/external/maps/drive-time` endpoint returns correct times
- [ ] Drive time caching reduces API calls
- [ ] Place IDs used when available for better accuracy
- [ ] Falls back to coordinates/address when placeId unavailable

---

## Testing Plan

1. **API Testing:**
   ```bash
   # Test with placeId (best accuracy)
   curl "http://localhost:3001/api/v1/external/maps/drive-time?originPlaceId=ChIJ...&destPlaceId=ChIJ..."
   
   # Test with coordinates
   curl "http://localhost:3001/api/v1/external/maps/drive-time?originLat=38.8977&originLng=-77.0365&destLat=38.9072&destLng=-77.0369"
   
   # Test with address
   curl "http://localhost:3001/api/v1/external/maps/drive-time?originAddress=White%20House&destAddress=Capitol%20Building"
   ```

2. **Integration Testing:**
   - Set default location in admin panel (with autocomplete)
   - Verify placeId is stored alongside address and coordinates
   - Test drive time calculation from default location to a test address

3. **Edge Cases:**
   - No route available (water, different continents)
   - Rate limit exceeded
   - Invalid placeId
   - Missing location data

---

## Pricing Notes

- **Compute Route Matrix Essentials**: $5.00 per 1,000 elements (up to 100k/month)
- **Compute Route Matrix Pro** (with traffic): $10.00 per 1,000 elements
- **Free tier**: 10,000 elements/month (Essentials) or 5,000 (Pro)
- **Element count**: origins × destinations
- **Rate limit**: 3,000 elements per minute

---

## Reference Documents

- **Phase 2.2 Handoff**: `../phases/phase-2.2-handoff.md`
- **Session 2.2.1 Handoff**: `session-2.2.1-handoff.md`
- **Routes API Overview**: [developers.google.com/maps/documentation/routes](https://developers.google.com/maps/documentation/routes)
- **Compute Route Matrix**: [developers.google.com/maps/documentation/routes/compute_route_matrix](https://developers.google.com/maps/documentation/routes/compute_route_matrix)
- **Specify Locations**: [developers.google.com/maps/documentation/routes/specify_location-rm](https://developers.google.com/maps/documentation/routes/specify_location-rm)
- **Routes API Pricing**: [developers.google.com/maps/documentation/routes/usage-and-billing](https://developers.google.com/maps/documentation/routes/usage-and-billing)

---

**Session Status:** ✅ Complete  
**Created:** 2026-02-01  
**Completed:** 2026-02-01  
**Last Updated:** 2026-02-01

---

## Implementation Summary

### Completed Tasks

**Task 0: Prerequisite Enhancement - Store Place IDs**
- ✅ Added `placeId` to `DefaultLocation` interface in `availabilitySettings.ts`
- ✅ Updated `AddressAutocomplete.vue` to emit `update:placeId`
- ✅ Updated `BusinessControlsTab.vue` to store placeId with default location

**Task 2: Server-Side Routes API Client**
- ✅ Added `RouteLocation` interface for flexible location input
- ✅ Added `RouteMatrixResult` interface for route results
- ✅ Implemented `toRoutesWaypoint()` for location format conversion
- ✅ Implemented `calculateRouteMatrix()` for batch calculations
- ✅ Implemented `calculateDriveTime()` convenience function

**Task 3: Routes API Endpoints**
- ✅ Created `GET /api/v1/external/maps/drive-time` for point-to-point calculations
- ✅ Created `POST /api/v1/external/maps/route-matrix` for batch calculations
- ✅ Created debug endpoints for cache monitoring

**Task 4: Drive Time Caching**
- ✅ Created `driveTimeCache.ts` service
- ✅ Implemented cache key generation with location normalization
- ✅ 24-hour TTL with automatic expiration
- ✅ Cache stats endpoint for monitoring

**Task 5: Client-Side Integration**
- ✅ Added `RouteLocation` and `DriveTimeResult` types
- ✅ Implemented `fetchDriveTime()` for single route calculations
- ✅ Implemented `fetchRouteMatrix()` for batch calculations

### Files Created
| File | Description |
|------|-------------|
| `server/src/services/driveTimeCache.ts` | TTL-based drive time caching service |

### Files Modified
| File | Change |
|------|--------|
| `client/src/configs/availabilitySettings.ts` | Added `placeId` to `DefaultLocation` |
| `client/src/components/common/AddressAutocomplete.vue` | Added placeId prop and emit |
| `client/src/views/admin/tabs/BusinessControlsTab.vue` | Store and display placeId |
| `client/src/services/mapsApiService.ts` | Added Routes API client functions |
| `server/src/services/googleMapsService.ts` | Added Routes API integration |
| `server/src/routes/external/mapsRoutes.ts` | Added drive-time and route-matrix endpoints |

### Test Results
```bash
# Single route calculation (address)
curl "http://localhost:3001/api/v1/external/maps/drive-time?originAddress=White%20House&destAddress=Capitol%20Building"
# Result: 13 minutes, 2.1 miles

# Single route calculation (coordinates)
curl "http://localhost:3001/api/v1/external/maps/drive-time?originLat=38.8977&originLng=-77.0365&destLat=38.8899&destLng=-77.0091"
# Result: 11 minutes, 1.8 miles

# Caching works (second call returns source: "cache")
# Batch calculation (2x2 = 4 routes) works

# Cache stats: 5 entries after tests
```

### Next Session
Session 2.2.3: Error Handling & Fallbacks
- Handle API errors gracefully
- Implement fallback to static drive time values
- User feedback for calculated vs estimated times

## Session Overview

**Session Number:** 2.2.1  
**Session Name:** Address Autocomplete (Places API)  
**Description:** Set up Google Maps Places API for address autocomplete, enabling users to search and select addresses with automatic coordinate extraction.

**Goal:** Implement address autocomplete component that extracts both address text and coordinates for drive time calculations.

---

## Objectives

1. Configure Google Maps Places API in Google Cloud Console
2. Set up environment variables for Maps API key
3. Create server-side proxy for API key security (optional but recommended)
4. Create reusable `AddressAutocomplete.vue` component
5. Integrate autocomplete with default location field in Business Controls
6. Extract and store coordinates for distance calculations
7. **Enhancement (for 2.2.2):** Store Place IDs for accurate route calculations with Routes API

---

## Prerequisites

- ✅ Phase 2.1 Complete (Google Calendar API)
- ✅ Drive Time Buffer Refactor Complete (provides `DefaultLocation` with coordinates)
- Google Cloud Project exists (`stone-passage-382818`)
- Billing enabled on Google Cloud Project

---

## Implementation Tasks

### Task 1: Google Cloud Console Setup

1. **Enable Places API**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to APIs & Services → Library
   - Search for "Places API" and enable it
   - Search for "Distance Matrix API" and enable it (for Session 2.2.2)

2. **API Key Configuration**
   - Navigate to APIs & Services → Credentials
   - Use existing API key or create new one for Maps
   - Set restrictions:
     - HTTP referrers for client-side (if using directly)
     - IP addresses for server-side proxy
   - Set API restrictions to only Places API and Distance Matrix API

3. **Set Budget Alerts**
   - Navigate to Billing → Budgets & alerts
   - Create budget alert for Maps API usage

### Task 2: Environment Configuration

Add to `server/.env.development`:
```env
# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=your_api_key_here
GOOGLE_MAPS_RATE_LIMIT_PER_SECOND=50
```

Add to `client/.env.development` (if using client-side):
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Task 3: Server-Side Proxy (Recommended)

**Why Proxy?**
- Hides API key from client-side code
- Enables server-side rate limiting
- Better security for production

**Files to Create:**

`server/src/routes/external/mapsRoutes.ts`:
```typescript
import { Router } from 'express';

const router = Router();

// GET /api/v1/external/maps/autocomplete?input=...
router.get('/autocomplete', async (req, res) => {
  // Proxy to Google Places API
  // Rate limit check
  // Return suggestions
});

// GET /api/v1/external/maps/place-details?placeId=...
router.get('/place-details', async (req, res) => {
  // Get place details including coordinates
});

export default router;
```

**Update `server/src/routes/external/index.ts`:**
```typescript
import MapsRouter from './mapsRoutes';
// ...
router.use('/maps', MapsRouter);
```

### Task 4: Create AddressAutocomplete Component

`client/src/components/common/AddressAutocomplete.vue`:

**Features:**
- Text input with debounced search (300ms)
- Suggestions dropdown
- Keyboard navigation (up/down arrows, enter to select)
- Click outside to close
- Loading indicator
- Clear button

**Props:**
```typescript
interface Props {
  modelValue: string          // v-model for address text
  coordinates?: { lat: number; lng: number }  // Optional coordinates output
  placeholder?: string
  label?: string
  hint?: string
  rules?: ValidationRule[]
}
```

**Emits:**
```typescript
emit('update:modelValue', address: string)
emit('update:coordinates', coords: { lat: number; lng: number } | undefined)
emit('place-selected', place: PlaceDetails)
```

**PlaceDetails Interface:**
```typescript
interface PlaceDetails {
  placeId: string
  formattedAddress: string
  addressComponents: {
    streetNumber?: string
    streetName?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  coordinates: {
    lat: number
    lng: number
  }
}
```

### Task 5: Integration with Default Location

Update `BusinessControlsTab.vue` to use `AddressAutocomplete` for the default location field:

```vue
<!-- Current TextField -->
<VTextField
  v-model="defaultLocationAddress"
  :label="UI_STRINGS.labels.defaultLocationAddress"
  ...
/>

<!-- Replace with AddressAutocomplete -->
<AddressAutocomplete
  v-model="defaultLocationAddress"
  :coordinates="defaultLocationCoordinates"
  @update:coordinates="updateDefaultLocationCoordinates"
  :label="UI_STRINGS.labels.defaultLocationAddress"
  ...
/>
```

Add computed for coordinates:
```typescript
const defaultLocationCoordinates = computed({
  get: () => formData.value?.defaultLocation?.coordinates,
  set: (value) => {
    if (formData.value) {
      if (!formData.value.defaultLocation) {
        formData.value.defaultLocation = { address: '' }
      }
      formData.value.defaultLocation.coordinates = value
    }
  }
})
```

---

## API Reference

### Google Places Autocomplete API

**Request:**
```
GET https://maps.googleapis.com/maps/api/place/autocomplete/json
  ?input=123 Main
  &types=address
  &components=country:us
  &key=API_KEY
```

**Response:**
```json
{
  "predictions": [
    {
      "place_id": "ChIJ...",
      "description": "123 Main Street, City, State, USA",
      "structured_formatting": {
        "main_text": "123 Main Street",
        "secondary_text": "City, State, USA"
      }
    }
  ],
  "status": "OK"
}
```

### Google Place Details API

**Request:**
```
GET https://maps.googleapis.com/maps/api/place/details/json
  ?place_id=ChIJ...
  &fields=formatted_address,geometry,address_components
  &key=API_KEY
```

**Response:**
```json
{
  "result": {
    "formatted_address": "123 Main Street, City, State 12345, USA",
    "geometry": {
      "location": {
        "lat": 38.8977,
        "lng": -77.0365
      }
    },
    "address_components": [
      { "types": ["street_number"], "long_name": "123" },
      { "types": ["route"], "long_name": "Main Street" },
      { "types": ["locality"], "long_name": "City" },
      { "types": ["administrative_area_level_1"], "short_name": "ST" },
      { "types": ["postal_code"], "long_name": "12345" }
    ]
  },
  "status": "OK"
}
```

---

## Files to Create

| File | Description |
|------|-------------|
| `server/src/routes/external/mapsRoutes.ts` | Maps API proxy routes |
| `server/src/services/googleMapsService.ts` | Maps API service (basic for now) |
| `client/src/services/mapsApiService.ts` | Client-side Maps API service |
| `client/src/components/common/AddressAutocomplete.vue` | Autocomplete component |

## Files to Modify

| File | Change |
|------|--------|
| `server/src/routes/external/index.ts` | Mount maps routes |
| `server/.env.development` | Add Maps API key |
| `client/src/views/admin/tabs/BusinessControlsTab.vue` | Use AddressAutocomplete for default location |

---

## Success Criteria

- [ ] Places API enabled in Google Cloud Console
- [ ] API key configured with proper restrictions
- [ ] Server-side proxy working (if implemented)
- [ ] `AddressAutocomplete.vue` component created
- [ ] Suggestions appear when typing 3+ characters
- [ ] Place selection extracts coordinates
- [ ] Default location field uses autocomplete
- [ ] Coordinates saved with default location
- [ ] No API key exposed in client-side code (if using proxy)

---

## Testing Plan

1. **Manual Testing:**
   - Type partial address in default location field
   - Verify suggestions appear
   - Select suggestion
   - Verify address text populated
   - Verify coordinates stored (check formData)
   - Save settings and reload
   - Verify address and coordinates persist

2. **Edge Cases:**
   - Invalid/incomplete address
   - Network error during autocomplete
   - Rate limit exceeded
   - No results found

---

## Notes

- Consider using Places API "New" version which has different pricing
- The Places API charges per session (autocomplete + details = 1 session)
- Consider implementing session tokens for cost optimization
- Distance Matrix API setup will be done in Session 2.2.2

---

## Reference Documents

- **Phase 2.2 Handoff**: `../phases/phase-2.2-handoff.md`
- **Google Places API Docs**: [developers.google.com/maps/documentation/places](https://developers.google.com/maps/documentation/places/web-service/overview)
- **Places Autocomplete**: [developers.google.com/maps/documentation/places/web-service/autocomplete](https://developers.google.com/maps/documentation/places/web-service/autocomplete)

---

**Session Status:** ✅ Complete  
**Completed:** 2026-02-01  
**Last Updated:** 2026-02-01

---

## Implementation Summary

### Files Created
| File | Description |
|------|-------------|
| `server/src/services/googleMapsService.ts` | Maps API service with autocomplete and place details |
| `server/src/routes/external/mapsRoutes.ts` | Maps API endpoints (autocomplete, place-details, session-token) |
| `client/src/services/mapsApiService.ts` | Client-side Maps API service |
| `client/src/components/common/AddressAutocomplete.vue` | Reusable autocomplete component |

### Files Modified
| File | Change |
|------|--------|
| `server/src/routes/external/index.ts` | Mount maps routes |
| `server/src/routes/external/googleOauthRoutes.ts` | Fixed TypeScript error (pre-existing) |
| `client/src/configs/availabilitySettings.ts` | Added `Coordinates` type export |
| `client/src/views/admin/tabs/BusinessControlsTab.vue` | Integrated AddressAutocomplete |

### Action Required: Enable Places API

The code is complete but the Google Places API needs to be enabled:

1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Select project**: `stone-passage-382818`
3. **Navigate to**: APIs & Services → Library
4. **Enable**: "Places API" (search for it)
5. **Optional**: Enable "Distance Matrix API" (needed for Session 2.2.2)
6. **Verify API key**: APIs & Services → Credentials
   - Ensure the existing API key has access to Places API
   - Or remove API restrictions if testing locally

### Testing After API Enable

```bash
# Test session token endpoint
curl "http://localhost:3001/api/v1/external/maps/session-token"

# Test autocomplete endpoint
curl "http://localhost:3001/api/v1/external/maps/autocomplete?input=1600%20Pennsylvania%20Ave"

# Test place details endpoint (use placeId from autocomplete)
curl "http://localhost:3001/api/v1/external/maps/place-details?placeId=<PLACE_ID>"
```

### Enhancement Needed: Store Place IDs

**Why:** Routes API (Session 2.2.2) works best with Place IDs for accurate routing.

**Current State:** The autocomplete component extracts and stores:
- ✅ `address` (text string)
- ✅ `coordinates` (lat/lng)
- ⏳ `placeId` (not yet stored in DefaultLocation)

**Required Change:** Update `DefaultLocation` interface and `AddressAutocomplete` component to also store the Place ID:

```typescript
// client/src/configs/availabilitySettings.ts
interface DefaultLocation {
  address: string
  label?: string
  placeId?: string      // ← ADD THIS
  coordinates?: Coordinates
}
```

This can be done at the start of Session 2.2.2 since:
1. The placeId is already available in the Place Details response
2. Just needs to be emitted and stored
3. Enables better accuracy for drive time calculations

### Next Session
Session 2.2.2: Drive Time Calculations (Routes API)

**Note:** Session 2.2.2 will use the modern Routes API instead of the legacy Distance Matrix API.
- Routes API is Google's recommended replacement
- Same pricing, better accuracy with Place IDs
- See `phases/phase-2.2-handoff.md` for architecture details

