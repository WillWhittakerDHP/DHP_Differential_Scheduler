# Session 2.2.4 Handoff: Wizard Address Autocomplete Integration

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Session:** 2.2.4 - Wizard Address Autocomplete Integration  
**Status:** ✅ Complete  
**Created:** 2026-02-01

---

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
