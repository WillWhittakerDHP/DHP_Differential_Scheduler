# Phase 2.2 Handoff: Google Maps API Integration

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Status:** ⏳ In Progress  
**Started:** 2026-02-01  
**Last Updated:** 2026-02-02

---

## Phase Overview

**Phase Number:** 2.2  
**Phase Name:** Google Maps API Integration  
**Description:** Integrate Google Maps API for address autocomplete (Places API) and drive time calculations (Routes API). This phase provides dynamic drive time calculations to replace static buffer values.

**Current Status:** ⏳ In Progress - Session 2.2.4 Complete, Session 2.2.5 Next  
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
| 2.2.5 | API Prefetching & Data Source Semantics | ⏳ Not Started |
| 2.2.6 | Error Handling & Fallbacks | ⏳ Not Started |

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

- **Feature Plan**: `../feature-plan.md`
- **Phase 2.1 Handoff**: `phase-2.1-handoff.md`
- **Drive Time Buffer Refactor Plan**: `~/.cursor/plans/drive_time_buffer_refactor_f78512ee.plan.md` ✅ Complete
- **Google Maps Places API**: [developers.google.com/maps/documentation/places](https://developers.google.com/maps/documentation/places/web-service/overview)
- **Google Maps Routes API**: [developers.google.com/maps/documentation/routes](https://developers.google.com/maps/documentation/routes) (replaces legacy Distance Matrix)
- **Routes API - Compute Route Matrix**: [developers.google.com/maps/documentation/routes/compute_route_matrix](https://developers.google.com/maps/documentation/routes/compute_route_matrix)
- **Routes API - Specify Locations**: [developers.google.com/maps/documentation/routes/specify_location-rm](https://developers.google.com/maps/documentation/routes/specify_location-rm)
- **Legacy Distance Matrix API** (deprecated): [developers.google.com/maps/documentation/distance-matrix](https://developers.google.com/maps/documentation/distance-matrix/overview)

---

**Phase Status:** ⏳ In Progress  
**Last Completed Session:** Session 2.2.4 - Wizard Address Autocomplete Integration  
**Current Session:** Session 2.2.5 - API Prefetching & Data Source Semantics  
**Last Updated:** 2026-02-19
