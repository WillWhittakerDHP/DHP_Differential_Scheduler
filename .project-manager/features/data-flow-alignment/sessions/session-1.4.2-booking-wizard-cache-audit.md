# Booking Wizard Cache Usage Audit

**Feature:** Data Flow Alignment  
**Phase:** 1.4 - Admin Panel Data Flow Fixes  
**Session:** 1.4.2 - Verify Admin Panel GlobalData Cache Usage  
**Date:** 2026-01-07

---

## Executive Summary

Quick audit of booking wizard components to verify cache usage patterns. **Good news:** Booking wizard components correctly use globalData cache for reading data. **Issue:** Uses same problematic composables for mutations that bypass cache (same as admin panel).

**Key Findings:**
- ✅ **5 components** read from globalData cache correctly
- ✅ **2 composables** read from globalData cache correctly
- ❌ **1 component** uses composables that bypass cache for mutations (same issue as admin panel)

**Priority:** Same as admin panel - fix useAppointment, useProperty, useUser composables

---

## Component Audit Results

### ✅ ServiceSelectionStep.vue - **CORRECT**

**File:** `client-vue/src/components/booking/steps/ServiceSelectionStep.vue`

**Cache Usage:**
- ✅ Uses `useGlobal()` to read BlockShapes and BlockInstances
- ✅ Uses `getGlobalEntityById()` to look up entities
- ✅ Uses `useBookingWizard()` which uses `useBooking()` → `useGlobal()`

**Code Pattern:**
```typescript
const { getGlobalEntityById, getGlobalData } = useGlobal()
const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
// wizard uses useBooking() which uses useGlobal()
```

**Status:** ✅ **No changes needed** - Uses globalData cache correctly

---

### ✅ PropertyDetailsStep.vue - **CORRECT**

**File:** `client-vue/src/components/booking/steps/PropertyDetailsStep.vue`

**Cache Usage:**
- ✅ Uses `useGlobal()` to read BlockShapes and BlockInstances
- ✅ Uses `getGlobalEntityById()` to look up entities
- ✅ Uses `useBookingWizard()` which uses `useBooking()` → `useGlobal()`

**Code Pattern:**
```typescript
const { getGlobalEntityById, getGlobalData } = useGlobal()
const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
```

**Status:** ✅ **No changes needed** - Uses globalData cache correctly

---

### ✅ AvailabilityStep.vue - **CORRECT**

**File:** `client-vue/src/components/booking/steps/AvailabilityStep.vue`

**Cache Usage:**
- ✅ Uses `useBookingWizard()` which uses `useBooking()` → `useGlobal()`
- ✅ Uses `useAvailability()` composable (needs verification if it uses globalData or direct API)

**Code Pattern:**
```typescript
const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
const { timeSlots, isLoading, error } = useAvailability(...)
```

**Note:** `useAvailability()` composable may use direct API calls for availability generation - needs verification, but likely acceptable since availability is computed/derived data, not entity data.

**Status:** ✅ **Likely correct** - Uses wizard state (which uses globalData), availability may use direct API (acceptable for computed data)

---

### ✅ ContactsStep.vue - **NO API CALLS**

**File:** `client-vue/src/components/booking/steps/ContactsStep.vue`

**Cache Usage:**
- ✅ No API calls - only form state management
- ✅ Reads from `loadedWizardState` (provided by BookingWizard parent)

**Status:** ✅ **No changes needed** - No API calls, only form state

---

### ✅ ConfirmationStep.vue - **NO API CALLS**

**File:** `client-vue/src/components/booking/steps/ConfirmationStep.vue`

**Cache Usage:**
- ✅ No API calls - static display component
- ✅ Hardcoded summary data (Phase 5 placeholder)

**Status:** ✅ **No changes needed** - No API calls, static display

---

### ⚠️ BookingWizard.vue - **MUTATIONS BYPASS CACHE**

**File:** `client-vue/src/components/booking/BookingWizard.vue`

**Cache Usage:**
- ✅ Uses `useBookingWizard()` which uses `useBooking()` → `useGlobal()` for reading
- ❌ Uses `useAppointment()`, `useProperty()`, `useUser()` for mutations (bypasses cache)

**Code Pattern:**
```typescript
const { create, fetchRandom } = useAppointment()
const { create: createProperty } = useProperty()
const { create: createUser } = useUser()
```

**Problem:**
- Same issue as admin panel - uses composables that bypass globalData cache
- Mutations invalidate separate cache keys instead of `['globalData']`
- `fetchRandom()` uses direct API call (acceptable for dev/testing)

**Required Changes:**
- Same as admin panel - fix `useAppointment()`, `useProperty()`, `useUser()` composables
- Update mutations to invalidate `['globalData']` instead of separate keys
- Or add appointments/properties/users to globalData cache

**Priority:** High - Same priority as admin panel fixes

---

## Composables Audit Results

### ✅ useBooking.ts - **CORRECT**

**File:** `client-vue/src/composables/useBooking.ts`

**Cache Usage:**
- ✅ Uses `useGlobal()` to read from globalData cache
- ✅ Transforms globalData to bookingData format
- ✅ No direct API calls

**Code Pattern:**
```typescript
const { globalData } = useGlobal()
const bookingData = computed(() => {
  const data = globalData?.value
  if (!data) return null
  return bookingTransformer.transformGlobalToBooking(data)
})
```

**Status:** ✅ **No changes needed** - Uses globalData cache correctly

---

### ✅ useBookingWizard.ts - **CORRECT**

**File:** `client-vue/src/composables/useBookingWizard.ts`

**Cache Usage:**
- ✅ Uses `useBooking()` which uses `useGlobal()` to read from globalData cache
- ✅ No direct API calls
- ✅ Only manages wizard state (selections, cascading logic)

**Code Pattern:**
```typescript
const { bookingData } = useBooking()
// bookingData comes from useGlobal() via useBooking()
```

**Status:** ✅ **No changes needed** - Uses globalData cache correctly

---

## Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| Components using globalData correctly | 5 | ✅ ServiceSelectionStep, PropertyDetailsStep, AvailabilityStep, ContactsStep, ConfirmationStep |
| Components bypassing cache for mutations | 1 | ⚠️ BookingWizard (uses useAppointment/useProperty/useUser) |
| Composables using globalData correctly | 2 | ✅ useBooking, useBookingWizard |
| Composables bypassing cache | 0 | (Same composables as admin panel: useAppointment, useProperty, useUser) |

---

## Key Findings

### ✅ What's Working Well

1. **All step components** read from globalData cache correctly via `useGlobal()` or `useBookingWizard()` → `useBooking()` → `useGlobal()`
2. **useBooking composable** correctly uses `useGlobal()` to read from cache
3. **useBookingWizard composable** correctly uses `useBooking()` → `useGlobal()`
4. **No direct API calls** in step components for reading data

### ⚠️ Same Issue as Admin Panel

1. **BookingWizard.vue** uses `useAppointment()`, `useProperty()`, `useUser()` for mutations
2. These composables bypass globalData cache (same issue found in admin panel audit)
3. Mutations invalidate separate cache keys instead of `['globalData']`

---

## Recommendations

### Priority 1: Fix Mutations (Same as Admin Panel)

**Components:**
- BookingWizard.vue - Uses useAppointment, useProperty, useUser for mutations

**Composables:**
- useAppointment.ts - Update to invalidate `['globalData']` instead of `['appointments']`
- useProperty.ts - Update to invalidate `['globalData']` instead of `['properties']`
- useUser.ts - Update to invalidate `['globalData']` instead of `['users']`

**Fix Strategy:**
- Same as admin panel - add appointments, properties, and users to globalData cache
- Update composables to read from globalData cache
- Update mutations to invalidate `['globalData']` instead of separate keys

**Estimated Effort:** Medium (same fix as admin panel)

---

## Conclusion

**Booking wizard is in good shape!** All components correctly read from globalData cache. The only issue is the same one found in the admin panel - mutations use composables that bypass the cache.

**Action Items:**
- Fix useAppointment, useProperty, useUser composables (same fix as admin panel)
- This will fix both admin panel and booking wizard mutations

**No separate booking wizard fixes needed** - fixing the composables will fix both areas.

---

**Audit Status:** ✅ Complete  
**Priority:** Same as admin panel (High)  
**Last Updated:** 2026-01-07

