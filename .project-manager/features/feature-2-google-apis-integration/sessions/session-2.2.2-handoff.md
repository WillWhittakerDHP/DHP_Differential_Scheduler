# Session 2.2.2 Handoff: Drive Time Calculations (Routes API)

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Session:** 2.2.2 - Drive Time Calculations (Routes API)  
**Status:** ⏳ Not Started  
**Created:** 2026-02-01

---

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
