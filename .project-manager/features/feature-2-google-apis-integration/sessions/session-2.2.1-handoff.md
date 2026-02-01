# Session 2.2.1 Handoff: Address Autocomplete (Places API)

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Session:** 2.2.1 - Address Autocomplete (Places API)  
**Status:** ⏳ Not Started  
**Created:** 2026-02-01

---

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
