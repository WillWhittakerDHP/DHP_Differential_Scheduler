
## Findings – 2026-01-21

- Permissible start mapping is hard-coded to :00/:15/:30. When router emits `every :60` (or future increments), mapping returns empty and no slots are produced. Add rule generation (derive offsets from `minuteIncrement`) and default to `[0]` when unknown.  
```23:30:server/src/utils/availabilities/freeTimesToValidAvailabilities.ts
export function mapPermissibleStarts(rule: string): number[] {
  const mapping: Record<string, number[]> = {
    "every :00": [0],
    "every :15": [0, 15, 30, 45],
    "every :30": [0, 30],
  };
  return mapping[rule] || [];
}
```

- Free-bit splitting drops windows whose start minute is later than the max permissible start in that hour (e.g., free window at 09:50 with :15 increments yields zero bits). Add carry-forward to subsequent hours or align to the next permissible start >= current start across the full window.  
```38:62:server/src/utils/availabilities/freeTimesToValidAvailabilities.ts
const startMinutes = start.getUTCMinutes();
const alignedStarts = permissibleStarts.filter(
  (pStart) => pStart >= startMinutes
);
...
while (isBefore(currentStart, end)) {
  const currentEnd = addMinutes(currentStart, minuteIncrement);
  if (isBefore(currentEnd, end) || currentEnd.getTime() === end.getTime()) {
    freeBits.push(new TimeSlot(minuteIncrement, currentStart, currentEnd));
  }
  currentStart = addMinutes(currentStart, minuteIncrement);
}
```

- Free-hours filter discards any window that is not fully inside the configured hours instead of clipping to overlap; partial overlaps become null. Replace with interval intersection to preserve usable sub-ranges.  
```26:45:server/src/utils/availabilities/availabilityFilters.ts
if (start >= freeStart && end <= freeEnd) {
  return { start, end };
}
return null;
```

- Work-hours cap is ineffective: `sumWorkHoursForDay` stub returns 0, so filter never constrains availability. Implement actual aggregation (appointments per day) and ensure a single source (this stub duplicates the one in `availabiltiesDbUtils`).  
```62:87:server/src/utils/availabilities/availabilityFilters.ts
export function sumWorkHoursForDay(dayIndex: number): number {
  console.log(`Summing work hours for dayIndex: ${dayIndex}`);
  return 0;
}
...
const totalWorkHours = sumWorkHoursForDay(dayIndex);
return totalWorkHours <= workHoursLimit;
```

- Available-days are hard-coded to Mon–Fri, ignoring per-service settings. Replace stub with real query keyed by serviceId or inject from upstream to respect weekend/holiday availability.  
```1:13:server/src/utils/availabilities/availabiltiesDbUtils.ts
export async function fetchAvailableDays(serviceId: string): Promise<number[]> {
  console.log(`Fetching available days for serviceId: ${serviceId}`);
  return [1, 2, 3, 4, 5];
}
```

- Permissible-start rule passed from router (`permissibleStartRule: \`every :${minuteIncrement}\``) can diverge from map; ensure rule generation and mapping share a single utility to avoid mismatches.  
```25:99:server/src/utils/availabilities/makeAvailabilties.ts
const permissibleStarts = mapPermissibleStarts(adminSettings.permissibleStartRule);
...
splitFreeTimesToFreeBits(freeTimes, adminSettings.minuteIncrement, permissibleStarts)
```
# Availability Suite Analysis & Recommendations

**Date:** 2025-01-XX  
**Purpose:** Comprehensive analysis of the availability suite for inefficiencies, data handling flaws, type tightening opportunities, and improvements for clarity, DRY principles, and reliability.

---

## Executive Summary

This analysis examines the availability calculation system across client and server codebases. The system handles:
- Time slot generation based on business hours and increments
- Calendar busy period processing and overlap detection
- Availability filtering and marking
- Timezone normalization and date handling

**Key Findings:**
- ✅ **Good:** Well-structured with clear separation of concerns
- ⚠️ **Areas for Improvement:** Type consistency, data validation, performance optimizations, and code duplication

**Total Issues Identified:** 20+ issues across type safety, data handling, performance, code quality, and reliability

---

## 1. Type Safety & Consistency Issues

### 1.1 ✅ RESOLVED: `isAvailable` Type Consistency
**Status:** Already fixed in `appointment.ts` line 109 - `isAvailable` is now required.

**Location:** `client/src/types/appointment.ts:109`

**Current State:** 
```typescript
export interface TimeSlot extends TimeRange {
  onSite: boolean
  clientPresent: boolean
  moveable: boolean
  isAvailable: boolean  // ✅ Required (not optional)
}
```

**Verification Needed:** Ensure all slot generation paths set `isAvailable` explicitly.

**Location:** `client/src/utils/booking/timeAvailabilityManager.ts:471`
```typescript
const slot: TimeSlot = {
  // ...
  isAvailable: false  // ✅ Set explicitly, but comment says "Will be updated by markSlotAvailability"
}
```
**Action:** Update comment to clarify that `markSlotAvailability` updates this value.

---

### 1.2 Type Narrowing: `propertyDetails` Uses Weak Type
**Severity:** Medium  
**Impact:** Loss of type safety, potential runtime errors

**Location:** `client/src/composables/useAvailability.ts:39`
```typescript
propertyDetails?: Record<string, unknown> | null | Ref<Record<string, unknown> | null> | ComputedRef<Record<string, unknown> | null>
```

**Problem:** `Record<string, unknown>` loses type safety and makes refactoring risky.

**Existing Interface:** `client/src/composables/booking/useAvailabilityLogic.ts:20-26`
```typescript
export interface PropertyDetails {
  squareFootage?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null
  additionalUnits?: number | null
}
```

**Recommendation:**
1. Extract `PropertyDetails` to `client/src/types/availability.ts` (shared types)
2. Update `useAvailability.ts:39` to use `PropertyDetails` instead of `Record<string, unknown>`
3. Update all callers to use the typed interface

**Files to Update:**
- `client/src/composables/useAvailability.ts:39`
- `client/src/composables/booking/useAvailabilityLogic.ts:20-26` (extract to shared)

---

### 1.3 Server-Side Type Weakness: `any` Type
**Severity:** High  
**Impact:** Loss of type safety, refactoring risk

**Location:** `server/src/utils/availabilities/makeAvailabilties.ts:26`
```typescript
export async function makeAvailabilities(
  freeBusyResponse: any,  // ⚠️ Using 'any'
  timeMin: string,
  timeMax: string,
  // ...
)
```

**Problem:** `any` type loses type safety and makes refactoring risky.

**Recommendation:** Define proper interface:
```typescript
interface GoogleFreeBusyResponse {
  calendars?: {
    [calendarId: string]: {
      busy?: Array<{ start: string; end: string }>
    }
  }
}
```

**Action:**
1. Create interface in `server/src/utils/availabilities/makeAvailabilties.ts:25` (before function)
2. Update function signature at line 26 to use `GoogleFreeBusyResponse` instead of `any`

---

## 2. Data Handling & Validation Issues

### 2.1 Missing Duration Validation in Caller
**Severity:** Medium  
**Impact:** Potential runtime errors, invalid slot generation

**Location:** `client/src/composables/useAvailability.ts:77`
```typescript
const duration = calculateDurationFromBlockInstances(blockInstances)
// No validation that duration > 0 before passing to fitTimeSlotsWithAvailability
```

**Current State:** ✅ `timeAvailabilityManager.ts:303-309` validates duration, but validation happens deep in call stack.

**Recommendation:** Add validation guard early:
```typescript
const duration = calculateDurationFromBlockInstances(blockInstances)
if (duration <= 0) {
  logger.warn('Invalid duration calculated', { duration, blockInstances })
  timeSlots.value = []
  return
}
```

**Action:** Add validation at `client/src/composables/useAvailability.ts:78` (after line 77)

---

### 2.2 Date Range Validation Inconsistency
**Severity:** Medium  
**Impact:** Hard to reason about edge cases, potential bugs

**Pattern 1:** `client/src/composables/useAvailability.ts:68`
```typescript
if (!dateRange?.start || !dateRange?.end) {
  timeSlots.value = []
  return
}
```

**Pattern 2:** `client/src/composables/booking/useAvailabilityLogic.ts:118`
```typescript
if (!selectedDate.value.start) return null
// Then later converts to RFC3339
```

**Pattern 3:** `client/src/utils/timeSlotCalculations.ts:137-152`
```typescript
if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
  logger.warn('Invalid date range (NaN):', dateRange)
  return []
}
if (startDate >= endDate) {
  logger.warn('start must be before end:', { start, end, dateRange })
  return []
}
```

**Problem:** Inconsistent validation patterns make it hard to reason about edge cases.

**Recommendation:** Create shared validation utility:
```typescript
// client/src/utils/booking/dateRangeValidation.ts
export function validateDateRange(
  dateRange: { start: string | null; end: string | null } | null
): { start: RFC3339DateTime; end: RFC3339DateTime } | null {
  if (!dateRange?.start || !dateRange?.end) return null
  
  const start = new Date(dateRange.start)
  const end = new Date(dateRange.end)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    logger.warn('Invalid date range (NaN)', { dateRange })
    return null
  }
  
  if (start >= end) {
    logger.warn('start must be before end', { start, end })
    return null
  }
  
  return {
    start: start.toISOString() as RFC3339DateTime,
    end: end.toISOString() as RFC3339DateTime
  }
}
```

**Action:**
1. Create `client/src/utils/booking/dateRangeValidation.ts` with above function
2. Update `useAvailability.ts:68` to use `validateDateRange`
3. Update `useAvailabilityLogic.ts:118` to use `validateDateRange`
4. Update `timeSlotCalculations.ts:137` to use `validateDateRange`

---

### 2.3 Busy Period Validation Not Applied Consistently
**Severity:** Medium  
**Impact:** Invalid busy periods may cause incorrect availability

**Location:** `client/src/utils/booking/timeAvailabilityManager.ts:60-81` - `validateBusyPeriod`

**Current State:** ✅ Good validation exists, but it's only called in `preprocessBusyPeriods` (line 159).

**Issue:** Not all code paths use `preprocessBusyPeriods`. Check:
- `client/src/composables/useAvailability.ts:82-85` - calls `getCalendarAvailability` which may return invalid periods
- `client/src/composables/booking/useAvailableStartTimes.ts` - receives busy periods from props, may not be validated

**Location:** `client/src/composables/useAvailability.ts:82-85`
```typescript
const busyTimes = getCalendarAvailability({
  start: dateRange.start,
  end: dateRange.end
})
```

**Recommendation:** Ensure all busy period inputs go through `preprocessBusyPeriods`:
```typescript
// In useAvailability.ts:82-85
const rawBusyTimes = getCalendarAvailability({
  start: dateRange.start,
  end: dateRange.end
})
const busyTimes = preprocessBusyPeriods(rawBusyTimes) // ✅ Validate and merge
```

**Action:**
1. Import `preprocessBusyPeriods` at `client/src/composables/useAvailability.ts:13`
2. Update line 82-85 to wrap `getCalendarAvailability` result with `preprocessBusyPeriods`

---

### 2.4 Timezone Handling Inconsistencies
**Severity:** Medium  
**Impact:** Potential bugs around DST transitions, timezone confusion

**Pattern 1:** Client-side uses UTC for slot generation
**Location:** `client/src/utils/booking/timeAvailabilityManager.ts:371-376`
```typescript
// Uses UTC methods for date iteration
const startDateOnly = new Date(startBoundaryDate)
startDateOnly.setUTCHours(0, 0, 0, 0)
```

**Pattern 2:** But business hours are interpreted as local time
**Location:** `client/src/utils/booking/timeAvailabilityManager.ts:418`
```typescript
// Creates slot start time in local timezone
const slotStartLocal = new Date(localYear, localMonth, localDay, ...)
```

**Pattern 3:** Server-side uses timezone normalization
**Location:** `server/src/utils/availabilities/timeNormalization.ts:9-14`

**Problem:** This mixing can cause subtle bugs, especially around DST transitions.

**Recommendation:** Document timezone strategy clearly:
1. **Storage:** Always RFC3339 (UTC) for timestamps
2. **Business Hours:** Stored as RFC3339 with reference date (2000-01-01) but interpreted as local time-of-day
3. **Slot Generation:** Generate in local timezone, convert to UTC for storage
4. **Busy Periods:** Always UTC (from Google Calendar API)

**Action:** Add comprehensive timezone documentation comment at top of `timeAvailabilityManager.ts:1` (after existing header comments):
```typescript
/**
 * TIMEZONE STRATEGY:
 * 
 * 1. Boundaries (startBoundary, endBoundary): RFC3339 UTC strings
 * 2. Business Hours: RFC3339 with reference date (2000-01-01), interpreted as local time-of-day
 * 3. Slot Generation:
 *    - Iterate days using UTC date components (to handle DST correctly)
 *    - Create slot times in LOCAL timezone (business hours are local)
 *    - Convert to UTC via toISOString() for storage
 * 4. Busy Periods: Always UTC (from Google Calendar API)
 * 
 * This ensures:
 * - Business hours work correctly regardless of timezone
 * - Slots align with local business hours
 * - Busy periods (UTC) can be compared with slots (UTC) correctly
 */
```

---

## 3. Performance & Efficiency Issues

### 3.1 ✅ RESOLVED: Duplicate Slot Generation
**Status:** Already fixed in `useAvailableStartTimes.ts` - uses shared `slotGenerationResult` computed.

**Location:** `client/src/composables/booking/useAvailableStartTimes.ts:76-231`

**Current State:** ✅ Single computation in `slotGenerationResult`, derived values in `availableStartTimes` (line 236) and `slotAvailability` (line 243).

---

### 3.2 Redundant Date Object Creation
**Severity:** Low  
**Impact:** Minor performance impact (acceptable unless profiling shows bottleneck)

**Location:** `client/src/utils/booking/timeAvailabilityManager.ts:536-546` - `markSlotAvailability`
```typescript
return slots.map(slot => {
  const slotStart = new Date(slot.startTime)  // ⚠️ Creates Date for every slot
  const slotEnd = new Date(slot.endTime)      // ⚠️ Creates Date for every slot
  
  const isAvailable = checkSlotAvailability(slotStart, slotEnd, parsedBusyTimes)
  // ...
})
```

**Problem:** Creates Date objects for every slot even though `slot.startTime` and `slot.endTime` are already RFC3339 strings that were parsed during generation.

**Optimization Opportunity:** Since slots are generated from Date objects in `generateAllTimeSlots`, we could:
1. Store Date objects temporarily during generation
2. Convert to RFC3339 only at the end
3. Reuse Date objects for availability checking

**However:** This would require significant refactoring. Current approach is acceptable for clarity.

**Recommendation:** Keep current approach unless profiling shows this is a bottleneck (unlikely for typical slot counts < 1000).

**Action:** None required unless performance profiling indicates issue.

---

### 3.3 Busy Period Overlap Check Efficiency
**Severity:** Low  
**Impact:** Minor performance impact (acceptable for typical busy period counts)

**Location:** `client/src/utils/booking/timeAvailabilityManager.ts:238-258` - `checkSlotAvailability`
```typescript
const overlapsBusy = parsedBusyTimes.some(busy => {
  return timeRangesOverlap(
    { start: slotStart, end: slotEnd },
    { start: busy.start, end: busy.end }
  )
})
```

**Current State:** ✅ Good - uses `some()` for early exit, pre-parsed Date objects.

**Potential Optimization:** If busy periods are sorted (which they are after merging), we could use binary search or early exit when slot is before first busy period or after last busy period.

**Recommendation:** Only optimize if profiling shows this is a bottleneck. Current O(n) approach is acceptable for typical busy period counts (< 50).

**Action:** None required unless performance profiling indicates issue.

---

### 3.4 Settings Cache Efficiency
**Severity:** Low  
**Impact:** Cache may be stale after admin updates

**Location:** `client/src/configs/availabilitySettings.ts:147-154`

**Current State:** ✅ Good TTL-based caching.

**Potential Issue:** Cache invalidation is manual only. If admin updates settings, cache won't refresh until TTL expires.

**Location:** `client/src/configs/availabilitySettings.ts:263-268` - `invalidateAvailabilitySettingsCache` exists

**Recommendation:** Ensure cache invalidation is called after settings updates in admin UI.

**Action:** Verify admin settings save handler calls `invalidateAvailabilitySettingsCache()` after successful save.

---

## 4. Code Quality & DRY Violations

### 4.1 Duplicate Business Hours Conversion Logic
**Severity:** Medium  
**Impact:** Code duplication, maintenance burden

**Location:** `client/src/configs/availabilitySettings.ts:184-213`
```typescript
businessHours: {
  0: {
    start: businessHoursTimeToRfc3339(rawSettings.businessHours['0']?.start || '09:00'),
    end: businessHoursTimeToRfc3339(rawSettings.businessHours['0']?.end || '19:00')
  },
  1: { /* same pattern */ },
  2: { /* same pattern */ },
  3: { /* same pattern */ },
  4: { /* same pattern */ },
  5: { /* same pattern */ },
  6: { /* same pattern */ }
}
```

**Problem:** Repetitive conversion of business hours from API format (HH:mm) to RFC3339, repeated 7 times.

**Recommendation:** Extract to helper:
```typescript
function convertBusinessHoursFromApi(
  apiHours: Record<string, { start: string; end: string }>
): AvailabilitySettings['businessHours'] {
  const days: (0 | 1 | 2 | 3 | 4 | 5 | 6)[] = [0, 1, 2, 3, 4, 5, 6]
  
  return days.reduce((acc, day) => {
    acc[day] = {
      start: businessHoursTimeToRfc3339(apiHours[String(day)]?.start || '09:00'),
      end: businessHoursTimeToRfc3339(apiHours[String(day)]?.end || '19:00')
    }
    return acc
  }, {} as AvailabilitySettings['businessHours'])
}
```

**Action:**
1. Add helper function at `client/src/configs/availabilitySettings.ts:183` (before line 184)
2. Replace lines 184-213 with: `businessHours: convertBusinessHoursFromApi(rawSettings.businessHours)`

---

### 4.2 Date Parsing Duplication
**Severity:** Low  
**Impact:** Minor code duplication

**Location:** `client/src/composables/booking/useAvailabilityLogic.ts:127-128`
```typescript
const dateString = startValue.includes('T') ? startValue.split('T')[0] : startValue
const [year, month, day] = dateString.split('-').map(Number)
const startDate = new Date(year, month - 1, day) // Local timezone, midnight
```

**Existing Utility:** `client/src/utils/booking/timeSlotFitter.ts:112-133` - `parseLocalDate`

**Current State:** ✅ `parseLocalDate` exists and is reused in `timeSlotCalculations.ts:207`.

**Issue:** `useAvailabilityLogic.ts` has its own parsing logic instead of using `parseLocalDate`.

**Recommendation:** Use shared `parseLocalDate` in `useAvailabilityLogic.ts:127-128`.

**Action:**
1. Import `parseLocalDate` at `client/src/composables/booking/useAvailabilityLogic.ts:14`
2. Replace lines 127-128 with: `const startDate = parseLocalDate(startValue)`

---

### 4.3 Default Duration Logic Duplication
**Severity:** Low  
**Impact:** Magic number duplication

**Location:** `client/src/utils/timeSlotCalculations.ts:54-75` - `calculateDurationFromBlockInstances`
```typescript
if (!blockInstances || blockInstances.length === 0) {
  return 90  // Default
}
// ...
return totalDuration > 0 ? totalDuration : 90  // Default again
```

**Issue:** Magic number `90` appears twice.

**Recommendation:** Extract constant:
```typescript
const DEFAULT_APPOINTMENT_DURATION_MINUTES = 90

export function calculateDurationFromBlockInstances(...) {
  if (!blockInstances || blockInstances.length === 0) {
    return DEFAULT_APPOINTMENT_DURATION_MINUTES
  }
  // ...
  return totalDuration > 0 ? totalDuration : DEFAULT_APPOINTMENT_DURATION_MINUTES
}
```

**Action:**
1. Add constant at `client/src/utils/timeSlotCalculations.ts:23` (after logger)
2. Replace `90` at line 57 with `DEFAULT_APPOINTMENT_DURATION_MINUTES`
3. Replace `90` at line 74 with `DEFAULT_APPOINTMENT_DURATION_MINUTES`

---

### 4.4 Magic Numbers Throughout Codebase
**Severity:** Low  
**Impact:** Reduced code clarity

**Location 1:** `client/src/configs/availabilitySettings.ts:115`
```typescript
const CACHE_TTL_MS = import.meta.env.VITE_AVAILABILITY_CACHE_TTL 
  ? Number(import.meta.env.VITE_AVAILABILITY_CACHE_TTL) 
  : 5 * 60 * 1000  // Default: 5 minutes
```

**Location 2:** `client/src/utils/booking/timeAvailabilityManager.ts:321`
```typescript
if (minuteIncrement > 60) {
  logger.warn('Large minuteIncrement may result in few slots', { minuteIncrement })
}
```

**Recommendation:** Extract to named constants with comments explaining rationale:
```typescript
// client/src/configs/availabilitySettings.ts
const DEFAULT_CACHE_TTL_MINUTES = 5
const CACHE_TTL_MS = import.meta.env.VITE_AVAILABILITY_CACHE_TTL 
  ? Number(import.meta.env.VITE_AVAILABILITY_CACHE_TTL) 
  : DEFAULT_CACHE_TTL_MINUTES * 60 * 1000

// client/src/utils/booking/timeAvailabilityManager.ts
const MAX_RECOMMENDED_MINUTE_INCREMENT = 60
if (minuteIncrement > MAX_RECOMMENDED_MINUTE_INCREMENT) {
  logger.warn('Large minuteIncrement may result in few slots', { minuteIncrement })
}
```

**Action:**
1. Add constant at `availabilitySettings.ts:112` (before CACHE_TTL_MS)
2. Update line 115 to use constant
3. Add constant at `timeAvailabilityManager.ts:320` (before validation)
4. Update line 321 to use constant

---

## 5. Clarity & Documentation Issues

### 5.1 Complex Timezone Logic Needs Documentation
**Severity:** Medium  
**Impact:** Hard to understand, maintain, and debug

**Location:** `client/src/utils/booking/timeAvailabilityManager.ts:368-424` - Slot generation loop

**Issue:** Complex mixing of UTC and local timezone operations with minimal inline comments.

**Recommendation:** Add comprehensive comment block explaining timezone strategy (see section 2.4 for full comment).

**Action:** Add timezone documentation comment at `timeAvailabilityManager.ts:14` (after existing header comments).

---

### 5.2 Function Purpose Clarity
**Severity:** Low  
**Impact:** Naming could be clearer

**Location:** `client/src/utils/booking/timeSlotFitter.ts:297` and `423`

**Functions:**
- `fitTimeSlots` (line 297) - returns only available slots
- `fitTimeSlotsWithAvailability` (line 423) - returns all slots with availability flags

**Current State:** ✅ Well documented, but naming could be clearer.

**Recommendation:** Consider renaming for clarity:
- `fitTimeSlots` → `fitAvailableTimeSlots` (makes "available only" explicit)
- `fitTimeSlotsWithAvailability` → `fitAllTimeSlotsWithAvailability` (makes "all slots" explicit)

**Verdict:** Current names are acceptable, but renaming would improve clarity. Low priority.

**Action:** Optional - consider renaming if doing broader refactoring.

---

## 6. Reliability & Error Handling

### 6.1 Silent Failures in `useAvailability`
**Severity:** High  
**Impact:** User sees no slots without explanation

**Location:** `client/src/composables/useAvailability.ts:117-123`
```typescript
try {
  // ... calculation
} catch (error) {
  logger.error('Error generating time slots:', error)
  timeSlots.value = []  // ⚠️ Silent failure - returns empty array
}
```

**Issue:** Errors are logged but user sees no slots without explanation.

**Recommendation:** Add error state:
```typescript
const error = ref<string | null>(null)

try {
  // ...
} catch (err) {
  logger.error('Error generating time slots:', err)
  error.value = 'Failed to load available time slots. Please try again.'
  timeSlots.value = []
}

return {
  timeSlots: computed(() => timeSlots.value),
  error: computed(() => error.value)  // ✅ Expose error state
}
```

**Action:**
1. Add `error` ref at `client/src/composables/useAvailability.ts:46` (after `timeSlots` ref)
2. Update catch block at line 121 to set `error.value`
3. Update return statement at line 128-130 to include `error` computed

---

### 6.2 Server-Side Error Handling
**Severity:** Medium  
**Impact:** Poor error logging, silent failures

**Location:** `server/src/utils/availabilities/makeAvailabilties.ts:103-106`
```typescript
} catch (error) {
  console.error("Error in makeAvailabilities:", error);
  return [];  // ⚠️ Silent failure
}
```

**Issue:** Uses `console.error` instead of proper logger, returns empty array.

**Recommendation:** 
1. Use proper logger (if available) or create one
2. Consider returning error information to caller
3. Log error context (parameters that caused failure)

**Action:**
1. Check if logger exists in server codebase
2. Replace `console.error` with proper logger
3. Add error context logging (log parameters that caused failure)

---

### 6.3 Validation Error Messages
**Severity:** Low  
**Impact:** Error messages could be more informative

**Location:** `client/src/utils/booking/timeAvailabilityManager.ts:303-344` - Validation errors

**Current State:** ✅ Good - throws errors with descriptive messages.

**Enhancement:** Consider including parameter values in error messages:
```typescript
throw new Error(`duration must be greater than 0, got: ${duration}`)
```

**Action:** Update error messages at:
- Line 305: Include `duration` value
- Line 314: Include `minuteIncrement` value
- Line 339: Include `startBoundary` value
- Line 343: Include `endBoundary` value

---

## 7. Architecture & Design Patterns

### 7.1 Separation of Concerns ✅
**Status:** Excellent

**Current State:** ✅ Excellent separation:
- `timeAvailabilityManager.ts` - Core availability logic (pure functions)
- `timeSlotFitter.ts` - Slot fitting utilities
- `useAvailability.ts` - Vue composable (reactive wrapper)
- `useAvailabilityLogic.ts` - Business logic extraction

**Recommendation:** Maintain this separation.

---

### 7.2 Function Purity ✅
**Status:** Excellent

**Current State:** ✅ Core functions are pure (no side effects):
- `generateSlotsWithAvailability`
- `checkSlotAvailability`
- `preprocessBusyPeriods`

**Recommendation:** Continue this pattern.

---

### 7.3 Single Source of Truth ✅
**Status:** Excellent

**Current State:** ✅ Good - `generateSlotsWithAvailability` is the single source for slot generation.

**Note:** `fitTimeSlots` delegates to `generateSlotsWithAvailability`, maintaining single source.

---

## 8. Recommendations Summary

### High Priority (Address First)

1. **Fix server-side type safety** (`makeAvailabilties.ts:26`)
   - Replace `any` with `GoogleFreeBusyResponse` interface

2. **Extract PropertyDetails interface** (`useAvailability.ts:39`)
   - Share between `useAvailability` and `useAvailabilityLogic`
   - Extract to `client/src/types/availability.ts`

3. **Add error state to useAvailability** (`useAvailability.ts:117-123`)
   - Don't silently fail, expose error state to UI

4. **Add date range validation utility** (Multiple locations)
   - Create `client/src/utils/booking/dateRangeValidation.ts`
   - Replace inconsistent validation patterns

5. **Ensure busy period validation** (`useAvailability.ts:82-85`)
   - Wrap `getCalendarAvailability` result with `preprocessBusyPeriods`

### Medium Priority (Address Next)

6. **Extract business hours conversion helper** (`availabilitySettings.ts:184-213`)
   - Reduce 7x duplication

7. **Add duration validation** (`useAvailability.ts:77`)
   - Validate duration > 0 before slot generation

8. **Add timezone strategy documentation** (`timeAvailabilityManager.ts:1`)
   - Document complex timezone logic

9. **Use parseLocalDate consistently** (`useAvailabilityLogic.ts:127-128`)
   - Remove duplicate parsing logic

10. **Extract magic numbers** (Multiple locations)
    - Use named constants

### Low Priority (Nice to Have)

11. **Improve server-side error handling** (`makeAvailabilties.ts:103-106`)
    - Use proper logger, add error context

12. **Enhance validation error messages** (`timeAvailabilityManager.ts:303-344`)
    - Include parameter values in error messages

13. **Consider function renaming** (`timeSlotFitter.ts:297, 423`)
    - Make "available only" vs "all slots" explicit

14. **Optimize Date object creation** (`timeAvailabilityManager.ts:536-546`)
    - Only if profiling shows bottleneck

---

## 9. Testing Considerations

### Missing Test Coverage Areas

1. **Edge Cases:**
   - DST transitions
   - Invalid busy periods (start >= end)
   - Empty business hours
   - Very large date ranges

2. **Error Scenarios:**
   - API failures in `getAvailabilitySettings`
   - Invalid date ranges
   - Negative durations

3. **Performance:**
   - Large number of slots (> 1000)
   - Large number of busy periods (> 100)

---

## Conclusion

The availability suite is **well-architected** with good separation of concerns and clear patterns. The main areas for improvement are:

1. **Type safety** - Tighten types, especially server-side
2. **Validation** - Centralize and standardize validation logic
3. **Error handling** - Don't silently fail, expose error states
4. **Code duplication** - Extract helpers for repeated patterns
5. **Documentation** - Document complex timezone logic

Most issues are **low-to-medium severity** and can be addressed incrementally without major refactoring.

**Total Issues:** 20+ issues identified
**High Priority:** 5 issues
**Medium Priority:** 5 issues
**Low Priority:** 4+ issues

---

## 10. Additional Findings (January 2026 Analysis)

This section documents additional issues discovered during a comprehensive codebase review.

---

### Category 6: Inefficiencies

#### Issue #23: Redundant Settings Fetching Across Composables
**Location:** Multiple composables  
**Files:**
- `client/src/composables/useAvailability.ts` (line 90)
- `client/src/composables/booking/useAvailableStartTimes.ts` (lines 62-63)
- `client/src/composables/booking/useMoveablePartsScheduling.ts` (line 131)

**Severity:** Medium  
**Impact:** Performance - potentially 3 API calls for same data per wizard step

**Description:**
Each composable independently calls `getAvailabilitySettings()`. When a single wizard step loads, this can trigger multiple redundant API calls for identical data.

**Current Code Pattern:**
```typescript
// useAvailability.ts line 90
const settings = await getAvailabilitySettings()

// useAvailableStartTimes.ts lines 62-63
const settings = await getAvailabilitySettings()

// useMoveablePartsScheduling.ts line 131
const settings = await getAvailabilitySettings()
```

**Refactor Approach:**
1. Create a shared settings provider using Vue's provide/inject
2. Or make settings a required dependency parameter rather than fetching internally
3. Consider a singleton pattern with subscription for cache invalidation

---

#### Issue #24: Eager AppointmentSlot Calculation for All Slots
**Location:** `client/src/composables/booking/useAvailabilityLogic.ts`  
**Lines:** 297-320  
**Severity:** Medium  
**Impact:** Performance - unnecessary computation

**Description:**
The watch at lines 259-321 calls `calculateAppointmentSlots()` for every slot position, even though the user will only select one slot.

**Current Code:**
```typescript
// Lines 306-314
slots.forEach((slot, index) => {
  const calculatedSlots = calculateAppointmentSlots(blockInstances, slot.startTime)
  // Calculates AppointmentSlots for EVERY available slot position
  const normalized = normalizeAppointmentSlotsByOrderIndex(calculatedSlots.map(calculatedSlot => ({
    ...calculatedSlot,
    orderIndex: index
  })))
  appointmentSlotsForDate.push(...normalized)
})
```

**Refactor Approach:**
1. Calculate `AppointmentSlots` lazily - only when a slot is actually selected
2. Move calculation to a computed that depends on `selectedSlot`
3. Remove preemptive calculation from watch

---

#### Issue #25: Date Object Creation in markSlotAvailability Hot Path
**Location:** `client/src/utils/booking/timeAvailabilityManager.ts`  
**Lines:** 536-546  
**Severity:** Low  
**Impact:** Performance - Date parsing for every slot

**Description:**
While busy periods are pre-parsed (good optimization), the `markSlotAvailability` function still creates new Date objects for every slot in the map loop.

**Current Code:**
```typescript
// Lines 536-546
return slots.map(slot => {
  const slotStart = new Date(slot.startTime)  // Created for each slot
  const slotEnd = new Date(slot.endTime)      // Created for each slot
  
  const isAvailable = checkSlotAvailability(slotStart, slotEnd, parsedBusyTimes)
  // ...
})
```

**Refactor Approach:**
Pre-parse slot times once before the map operation, similar to `parseBusyPeriods()`:
```typescript
interface ParsedSlot {
  original: TimeSlot
  start: Date
  end: Date
}

const parsedSlots = slots.map(slot => ({
  original: slot,
  start: new Date(slot.startTime),
  end: new Date(slot.endTime)
}))

return parsedSlots.map(({ original, start, end }) => ({
  ...original,
  isAvailable: checkSlotAvailability(start, end, parsedBusyTimes)
}))
```

---

### Category 7: Data Handling Flaws

#### Issue #26: Timezone Inconsistency Between Client and Server
**Location:** Client and server slot generation  
**Files:**
- `client/src/utils/booking/timeAvailabilityManager.ts` (lines 417-419)
- `server/src/utils/availabilities/makeAvailabilties.ts` (lines 95-101)

**Severity:** High  
**Impact:** Potential timezone mismatch in production

**Description:**
Client creates slots in LOCAL timezone and converts to UTC via `toISOString()`. Server uses explicit timezone conversion with `normalizeToZone()`. This could cause slot time discrepancies.

**Client Code (lines 417-419):**
```typescript
const slotStartLocal = new Date(localYear, localMonth, localDay, Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0)
const slotStart = slotStartLocal // Will be converted to UTC via toISOString()
```

**Server Code (lines 95-101):**
```typescript
return new TimeSlot(
  slot.duration,
  normalizeToZone(slot.slotStart, adminSettings.timezone),
  normalizeToZone(slot.slotEnd, adminSettings.timezone)
);
```

**Refactor Approach:**
1. Standardize on explicit timezone passing - include user timezone in all requests
2. Document the timezone strategy (client-local vs UTC vs explicit timezone)
3. Add timezone to `TimeSlot` interface for clarity

---

#### Issue #27: Unsafe Date String Parsing Without Validation
**Location:** `client/src/composables/booking/useAvailabilityLogic.ts`  
**Lines:** 127-129  
**Severity:** Medium  
**Impact:** Silent NaN values if input is malformed

**Description:**
Date strings are parsed without validation. Malformed input produces NaN silently.

**Current Code:**
```typescript
// Lines 127-129
const dateString = startValue.includes('T') ? startValue.split('T')[0] : startValue
const [year, month, day] = dateString.split('-').map(Number)
const startDate = new Date(year, month - 1, day) // May produce Invalid Date
```

**Refactor Approach:**
Add validation before parsing:
```typescript
import { isRFC3339DateTime } from '@/types/datetime'

function parseISODate(value: string): Date | null {
  const dateString = value.includes('T') ? value.split('T')[0] : value
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null
  
  const [year, month, day] = dateString.split('-').map(Number)
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null
  
  const date = new Date(year, month - 1, day)
  return isNaN(date.getTime()) ? null : date
}
```

---

### Category 8: Type Tightening Opportunities

#### Issue #28: Redundant TimeSlotWithAvailability Interface
**Location:** `client/src/utils/booking/timeAvailabilityManager.ts`  
**Lines:** 35-37  
**Severity:** Low  
**Impact:** Code clarity - redundant type

**Description:**
`TimeSlotWithAvailability` extends `TimeSlot` and redeclares `isAvailable` as required, but `TimeSlot` already has `isAvailable: boolean` (required).

**Current Code:**
```typescript
// Lines 35-37
export interface TimeSlotWithAvailability extends TimeSlot {
  isAvailable: boolean  // Redundant - already required in TimeSlot
}
```

**Refactor Approach:**
Remove `TimeSlotWithAvailability` and use `TimeSlot` directly. Update imports in consuming files.

---

#### Issue #29: Untyped Server FreeBusy Response
**Location:** `server/src/utils/availabilities/makeAvailabilties.ts`  
**Line:** 26  
**Severity:** High  
**Impact:** Type safety gap on server

**Description:**
The main availability function accepts `any` for the calendar response.

**Current Code:**
```typescript
// Line 26
export async function makeAvailabilities(
  freeBusyResponse: any,  // Untyped
```

**Refactor Approach:**
Create proper type for Google Calendar FreeBusy response:
```typescript
interface CalendarBusyPeriod {
  start: string  // RFC3339
  end: string    // RFC3339
}

interface CalendarBusy {
  busy: CalendarBusyPeriod[]
  errors?: Array<{ domain: string; reason: string }>
}

interface FreeBusyResponse {
  kind?: 'calendar#freeBusy'
  timeMin?: string
  timeMax?: string
  calendars: Record<string, CalendarBusy>
}
```

---

#### Issue #30: Missing DayOfWeek Branded Type
**Location:** `client/src/utils/booking/timeSlotFitter.ts`  
**Lines:** 65, 390  
**Severity:** Low  
**Impact:** Type safety - relies on runtime casting

**Description:**
Day-of-week values require casting when accessing `BusinessHoursMap`.

**Current Code:**
```typescript
// Line 65
export type BusinessHoursMap = Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, DayBusinessHours>>

// Line 390
const dayOfWeek = tempDate.getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6  // Casting required
```

**Refactor Approach:**
Create branded DayOfWeek type in `datetime.ts`:
```typescript
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export function toDayOfWeek(n: number): DayOfWeek {
  if (!Number.isInteger(n) || n < 0 || n > 6) {
    throw new Error(`Invalid day of week: ${n}`)
  }
  return n as DayOfWeek
}

export function getDayOfWeek(date: Date): DayOfWeek {
  return date.getDay() as DayOfWeek  // getDay() always returns 0-6
}
```

---

### Category 9: DRY Violations

#### Issue #31: Duplicate Validation Logic in Slot Generation
**Location:** `client/src/utils/booking/timeSlotFitter.ts`  
**Files:**
- `fitTimeSlots` (lines 308-371)
- `generateAllTimeSlots` in `timeAvailabilityManager.ts` (lines 300-363)

**Severity:** Medium  
**Impact:** Maintainability - duplicate code

**Description:**
Both functions have nearly identical validation blocks for duration, minuteIncrement, boundaries, and businessHours.

**Refactor Approach:**
Extract to shared validation function:
```typescript
// In a new file: slotGenerationValidation.ts
interface SlotGenerationParams {
  duration: number
  minuteIncrement: number
  startBoundary: RFC3339DateTime
  endBoundary: RFC3339DateTime
  businessHours: BusinessHoursMap
}

export function validateSlotGenerationParams(params: SlotGenerationParams): void {
  if (!params.duration || params.duration <= 0) {
    throw new Error('duration must be greater than 0')
  }
  if (!params.minuteIncrement || params.minuteIncrement <= 0) {
    throw new Error('minuteIncrement must be greater than 0')
  }
  // ... remaining validation
}
```

---

#### Issue #32: Magic Number Default Duration
**Location:** Multiple files  
**Files:**
- `client/src/utils/timeSlotCalculations.ts` (lines 56, 74)

**Severity:** Low  
**Impact:** Maintainability - scattered magic number

**Description:**
The default duration of 90 minutes appears as a magic number.

**Current Code:**
```typescript
// Line 56
return 90  // Default fallback

// Line 74
return totalDuration > 0 ? totalDuration : 90  // Another fallback
```

**Refactor Approach:**
Create constants file:
```typescript
// client/src/constants/scheduling.ts
export const DEFAULT_APPOINTMENT_DURATION_MINUTES = 90
export const DEFAULT_MINUTE_INCREMENT = 15
export const DEFAULT_LEAD_TIME_MINUTES = 60
```

---

### Category 10: Reliability Issues

#### Issue #33: Race Condition in Async Watch
**Location:** `client/src/composables/useAvailability.ts`  
**Lines:** 58-126  
**Severity:** High  
**Impact:** Data corruption - stale results may overwrite fresh ones

**Description:**
If dependencies change rapidly, multiple async operations run concurrently. The last to complete (not necessarily most recent) sets the value.

**Current Code:**
```typescript
// Lines 58-126
watch(
  [blockInstancesValue, dateRangeValue, propertyDetailsValue],
  async () => {
    // ... async operations with no cancellation
    timeSlots.value = result.slots  // May be from stale request
  },
  { immediate: true }
)
```

**Refactor Approach:**
Add cancellation token pattern:
```typescript
let abortController: AbortController | null = null

watch(
  dependencies,
  async () => {
    // Cancel previous request
    abortController?.abort()
    abortController = new AbortController()
    const { signal } = abortController
    
    try {
      const settings = await getAvailabilitySettings()
      if (signal.aborted) return
      
      const result = fitTimeSlotsWithAvailability(...)
      if (signal.aborted) return
      
      timeSlots.value = result.slots
    } catch (e) {
      if (signal.aborted) return
      logger.error('Error:', e)
      timeSlots.value = []
    }
  }
)
```

---

#### Issue #34: Missing Error State Exposure
**Location:** `client/src/composables/useAvailability.ts`  
**Lines:** 117-123  
**Severity:** Medium  
**Impact:** Poor UX - errors are logged but not exposed to UI

**Description:**
Errors are caught and logged but the composable only returns an empty array, giving the UI no way to show error states.

**Current Code:**
```typescript
// Lines 117-123
} catch (error) {
  logger.error('Error generating time slots:', error)
  timeSlots.value = []  // UI can't distinguish "no slots" from "error"
}
```

**Refactor Approach:**
Add error state:
```typescript
const error = ref<Error | null>(null)

// In catch block
error.value = error instanceof Error ? error : new Error('Unknown error')
timeSlots.value = []

// Return
return {
  timeSlots: computed(() => timeSlots.value),
  error: computed(() => error.value),
  hasError: computed(() => error.value !== null),
  isLoading: computed(() => isLoading.value)  // Also add loading state
}
```

---

#### Issue #35: Placeholder Function Always Returns Zero
**Location:** `server/src/utils/availabilities/availabilityFilters.ts`  
**Lines:** 63-69  
**Severity:** Medium  
**Impact:** Work hour limits never enforced

**Description:**
`sumWorkHoursForDay()` is a placeholder that always returns 0, meaning the work hours filter does nothing.

**Current Code:**
```typescript
// Lines 63-69
export function sumWorkHoursForDay(dayIndex: number): number {
  console.log(`Summing work hours for dayIndex: ${dayIndex}`);
  return 0; // Example: No work hours for now
}
```

**Refactor Approach:**
1. Implement properly by querying scheduled appointments for the day
2. Or remove the feature entirely to avoid false confidence
3. Add TODO with ticket reference for implementation

---

### Summary: New Issues Identified

| Issue # | Title | Severity | Category |
|---------|-------|----------|----------|
| #23 | Redundant Settings Fetching | Medium | Performance |
| #24 | Eager AppointmentSlot Calculation | Medium | Performance |
| #25 | Date Creation in Hot Path | Low | Performance |
| #26 | Timezone Inconsistency Client/Server | High | Data Handling |
| #27 | Unsafe Date String Parsing | Medium | Data Handling |
| #28 | Redundant TimeSlotWithAvailability | Low | Types |
| #29 | Untyped Server FreeBusy Response | High | Types |
| #30 | Missing DayOfWeek Branded Type | Low | Types |
| #31 | Duplicate Validation Logic | Medium | DRY |
| #32 | Magic Number Default Duration | Low | DRY |
| #33 | Race Condition in Async Watch | High | Reliability |
| #34 | Missing Error State Exposure | Medium | Reliability |
| #35 | Placeholder Function Returns Zero | Medium | Reliability |

**Updated Totals:**
- **Total Issues:** 35 issues identified
- **High Priority:** 8 issues (#26, #29, #33 added)
- **Medium Priority:** 10 issues (#23, #24, #27, #31, #34, #35 added)
- **Low Priority:** 7+ issues (#25, #28, #30, #32 added)
