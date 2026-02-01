# Phase 2.2 Handoff: Google Maps API Integration

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Status:** ⏳ In Progress  
**Started:** 2026-02-01  
**Last Updated:** 2026-02-01

---

## Phase Overview

**Phase Number:** 2.2  
**Phase Name:** Google Maps API Integration  
**Description:** Integrate Google Maps API for address autocomplete (Places API) and drive time calculations (Distance Matrix API). This phase provides dynamic drive time calculations to replace static buffer values.

**Current Status:** ⏳ In Progress - Session 2.2.1 Next  
**Prerequisites Completed:**
- ✅ Phase 2.1 (Google Calendar API Integration) - Provides event locations for drive time calculations
- ✅ Drive Time Buffer Refactor - Provides `driveTimeTo`/`driveTimeFrom` architecture with `applyTo` rules

---

## Objectives

- Set up Google Maps Places API for address autocomplete
- Set up Google Maps Distance Matrix API for drive time calculations
- Calculate drive times between appointment locations
- Calculate drive times from/to default location (home/office)
- Integrate calculated drive times with the new buffer architecture
- Handle error cases with fallback to static buffer values

---

## Sessions Overview

| Session | Name | Status |
|---------|------|--------|
| 2.2.1 | Address Autocomplete (Places API) | ✅ Complete |
| 2.2.2 | Drive Time Calculations (Distance Matrix API) | ⏳ Not Started |
| 2.2.3 | Error Handling & Fallbacks | ⏳ Not Started |

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

### Session 2.2.2: Drive Time Calculations (Distance Matrix API)

**Status:** ⏳ Not Started

**Objectives:**
- Set up Google Maps Distance Matrix API client
- Calculate drive times between locations
- Integrate with event locations from Phase 2.1
- Populate drive time values based on `applyTo` rules

**Key Tasks:**
1. **Server-Side Service**
   - Create `server/src/services/googleMapsService.ts`
   - Implement `calculateDriveTime(origin, destination)` function
   - Add caching for drive time results (TTL: 24 hours - routes don't change often)
   - Add rate limiting (Google Maps has lower quotas than Calendar)

2. **Distance Matrix API Integration**
   - Create `GET /api/v1/external/maps/distance` endpoint
   - Accept origin/destination as coordinates or addresses
   - Return drive time in minutes
   - Handle traffic considerations (optional: departure_time param)

3. **Drive Time Calculation Logic**
   - **driveTimeTo (first_only)**: From `defaultLocation` → first appointment
   - **driveTimeTo (all)**: From previous appointment → current appointment
   - **driveTimeFrom (last_only)**: From last appointment → `defaultLocation`
   - **driveTimeFrom (all)**: From current appointment → next appointment

4. **Client-Side Integration**
   - Create `client/src/services/mapsApiService.ts`
   - Update availability calculations to request drive times
   - Use event locations from cached calendar events

**Architecture:**
```
Slot Generation
    ↓
Determine slot position (first/last of day)
    ↓
Apply driveTimeTo constraint?
├── first_only + isFirstOfDay → Calculate from defaultLocation
├── all → Calculate from previous appointment location
└── none → Skip
    ↓
Apply driveTimeFrom constraint?
├── last_only + isLastOfDay → Calculate to defaultLocation
├── all → Calculate to next appointment location
└── none → Skip
    ↓
Use calculated drive time OR fallback to static minutes
```

**Success Criteria:**
- [ ] Distance Matrix API endpoint working
- [ ] Drive times calculated correctly between locations
- [ ] Drive times integrate with buffer architecture
- [ ] Caching reduces API calls for same routes

---

### Session 2.2.3: Error Handling & Fallbacks

**Status:** ⏳ Not Started

**Objectives:**
- Handle API errors gracefully
- Implement fallback to static drive time values
- Handle missing coordinates
- Display user-friendly error messages

**Key Tasks:**
1. **Error Classification**
   - Create `MapsApiError` typed error class
   - Handle: auth errors, rate limits, invalid requests, network errors

2. **Fallback Strategy**
   - API fails → Use static `minutes` from `driveTimeTo`/`driveTimeFrom` config
   - Missing coordinates → Skip drive time calculation, use static value
   - Rate limit → Queue request, return cached or static value

3. **User Feedback**
   - Show "Calculating drive time..." indicator
   - Show "Using estimated drive time" when using fallback
   - Log detailed errors for debugging

**Success Criteria:**
- [ ] API errors handled gracefully
- [ ] Fallback to static values works correctly
- [ ] User informed when using estimated values
- [ ] Errors logged for debugging

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
- Consider server-side proxy to hide API key from client
- Set up billing alerts in Google Cloud Console

### Caching Strategy
- Drive times between same locations don't change often
- Cache key: `origin_coords:destination_coords`
- TTL: 24 hours (routes rarely change)
- Invalidation: Manual refresh option in dev panel

### Rate Limiting
- Google Maps has lower quotas than Calendar API
- Default: 50 requests/second for Distance Matrix
- Batch requests when possible (Distance Matrix supports multiple origins/destinations)

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

// DefaultLocation (from availabilitySettings.ts)
interface DefaultLocation {
  address: string
  label?: string
  coordinates?: {
    lat: number
    lng: number
  }
}
```

Phase 2.2 will:
1. Use `defaultLocation.coordinates` as origin/destination for first/last appointments
2. Use event locations (from Phase 2.1 calendar events) for intermediate calculations
3. Replace static `minutes` with calculated drive time when API succeeds
4. Fall back to static `minutes` when API fails or coordinates unavailable

---

## Success Criteria

### Session 2.2.1:
- [ ] Google Maps Places API configured
- [ ] Address autocomplete component working
- [ ] Coordinates extracted and stored
- [ ] Integration with default location field

### Session 2.2.2:
- [ ] Google Maps Distance Matrix API configured
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
- **Google Maps Distance Matrix API**: [developers.google.com/maps/documentation/distance-matrix](https://developers.google.com/maps/documentation/distance-matrix/overview)

---

**Phase Status:** ⏳ In Progress  
**Current Session:** Session 2.2.1 - Address Autocomplete  
**Last Updated:** 2026-02-01
