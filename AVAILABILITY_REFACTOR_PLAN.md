# Availability Suite Refactor Plan

**Created:** 2026-01-21  
**Source:** AVAILABILITY_REFACTOR_ANALYSIS.md (comprehensive codebase review)  
**Purpose:** Organized, consolidated, and prioritized action items for availability system refactoring

---

## Table of Contents

1. [Critical Priority (P0) - Fix First](#1-critical-priority-p0---fix-first)
2. [High Priority (P1) - Address Soon](#2-high-priority-p1---address-soon)
3. [Medium Priority (P2) - Planned Work](#3-medium-priority-p2---planned-work)
4. [Low Priority (P3) - Nice to Have](#4-low-priority-p3---nice-to-have)
5. [Resolved Items](#5-resolved-items)
6. [Testing Considerations](#6-testing-considerations)
7. [Architecture Notes](#7-architecture-notes)

---

## 1. Critical Priority (P0) - Fix First

These issues cause incorrect behavior or data corruption in production.

### P0-1: Race Condition in Async Watch ✅ COMPLETED
**Original Issue:** #33  
**Severity:** Critical  
**Impact:** Data corruption - stale results may overwrite fresh ones

**Location:** `client/src/composables/useAvailability.ts:58-126`

**Problem:** If dependencies change rapidly, multiple async operations run concurrently. The last to complete (not necessarily most recent) sets the value.

```typescript
// Current code (lines 58-126)
watch(
  [blockInstancesValue, dateRangeValue, propertyDetailsValue],
  async () => {
    // ... async operations with no cancellation
    timeSlots.value = result.slots  // May be from stale request
  },
  { immediate: true }
)
```

**Refactor:**
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

**Files to Update:**
- `client/src/composables/useAvailability.ts`

---

### P0-2: Timezone Inconsistency Between Client and Server ✅ COMPLETED
**Original Issue:** #26  
**Severity:** Critical  
**Impact:** Potential timezone mismatch causing slot time discrepancies

**Locations:**
- `client/src/utils/booking/timeAvailabilityManager.ts:417-419`
- `server/src/utils/availabilities/makeAvailabilties.ts:95-101`

**Problem:** Client creates slots in LOCAL timezone and converts to UTC via `toISOString()`. Server uses explicit timezone conversion with `normalizeToZone()`. This causes slot time discrepancies.

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

**Refactor:**
1. Standardize on explicit timezone passing - include user timezone in all requests
2. Document the timezone strategy (client-local vs UTC vs explicit timezone)
3. Add timezone to `TimeSlot` interface for clarity
4. Add comprehensive timezone documentation at `timeAvailabilityManager.ts:14`

**Files to Update:**
- `client/src/utils/booking/timeAvailabilityManager.ts`
- `server/src/utils/availabilities/makeAvailabilties.ts`
- `client/src/types/appointment.ts` (TimeSlot interface)

---

### P0-3: Placeholder Work Hours Function Always Returns Zero ✅ COMPLETED
**Original Issue:** #35, also mentioned in lines 40-49  
**Severity:** Critical  
**Impact:** Work hour limits are never enforced

**Location:** `server/src/utils/availabilities/availabilityFilters.ts:62-87`

**Problem:** `sumWorkHoursForDay()` always returns 0, making work hours filter ineffective.

```typescript
// Lines 62-87
export function sumWorkHoursForDay(dayIndex: number): number {
  console.log(`Summing work hours for dayIndex: ${dayIndex}`);
  return 0; // Example: No work hours for now
}
...
const totalWorkHours = sumWorkHoursForDay(dayIndex);
return totalWorkHours <= workHoursLimit;
```

**Refactor Options:**
1. **Implement properly:** Query scheduled appointments for the day
2. **Remove feature:** Remove the filter to avoid false confidence
3. **Disable with documentation:** Add TODO with ticket reference

**Files to Update:**
- `server/src/utils/availabilities/availabilityFilters.ts`
- `server/src/utils/availabilities/availabiltiesDbUtils.ts` (duplicate stub exists)

---

### P0-4: Permissible Start Mapping Hard-Coded ✅ COMPLETED
**Original Issue:** Lines 4-14  
**Severity:** Critical  
**Impact:** Router emits `every :60` (or future increments), mapping returns empty and no slots produced

**Location:** `server/src/utils/availabilities/freeTimesToValidAvailabilities.ts:23-30`

```typescript
export function mapPermissibleStarts(rule: string): number[] {
  const mapping: Record<string, number[]> = {
    "every :00": [0],
    "every :15": [0, 15, 30, 45],
    "every :30": [0, 30],
  };
  return mapping[rule] || [];  // Returns empty for unknown rules
}
```

**Refactor:**
1. Add rule generation (derive offsets from `minuteIncrement`)
2. Default to `[0]` when unknown instead of empty array
3. Ensure rule generation and mapping share a single utility (lines 59-64)

**Files to Update:**
- `server/src/utils/availabilities/freeTimesToValidAvailabilities.ts`
- `server/src/utils/availabilities/makeAvailabilties.ts:25-99`

---

### P0-5: Hard-Coded Available Days (Mon-Fri) ✅ COMPLETED
**Original Issue:** Lines 51-57  
**Severity:** Critical  
**Impact:** Weekend/holiday availability ignored, per-service settings not respected

**Location:** `server/src/utils/availabilities/availabiltiesDbUtils.ts:1-13`

```typescript
export async function fetchAvailableDays(serviceId: string): Promise<number[]> {
  console.log(`Fetching available days for serviceId: ${serviceId}`);
  return [1, 2, 3, 4, 5];  // Hard-coded to Mon-Fri
}
```

**Refactor:**
Replace stub with real query keyed by serviceId or inject from upstream to respect weekend/holiday availability.

**Files to Update:**
- `server/src/utils/availabilities/availabiltiesDbUtils.ts`

---

## 2. High Priority (P1) - Address Soon

These issues cause type safety gaps, validation failures, or poor error handling.

### P1-1: Server-Side Type Weakness - `any` Type ✅ COMPLETED
**Original Issues:** Section 1.3 (lines 151-181), #29  
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

**Refactor:** Define proper interface:
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

**Files to Update:**
- `server/src/utils/availabilities/makeAvailabilties.ts:25-26`

---

### P1-2: PropertyDetails Uses Weak Type ✅ COMPLETED
**Original Issue:** Section 1.2 (lines 118-148)  
**Severity:** High  
**Impact:** Loss of type safety, potential runtime errors

**Location:** `client/src/composables/useAvailability.ts:39`

```typescript
propertyDetails?: Record<string, unknown> | null | Ref<Record<string, unknown> | null> | ComputedRef<Record<string, unknown> | null>
```

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

**Refactor:**
1. Extract `PropertyDetails` to `client/src/types/availability.ts` (shared types)
2. Update `useAvailability.ts:39` to use `PropertyDetails`
3. Update all callers

**Files to Update:**
- Create: `client/src/types/availability.ts`
- `client/src/composables/useAvailability.ts:39`
- `client/src/composables/booking/useAvailabilityLogic.ts:20-26` (remove, import from shared)

---

### P1-3: Missing Error State Exposure ✅ COMPLETED
**Original Issues:** Section 6.1 (lines 639-677), #34  
**Severity:** High  
**Impact:** User sees no slots without explanation, silent failures

**Location:** `client/src/composables/useAvailability.ts:117-123`

```typescript
try {
  // ... calculation
} catch (error) {
  logger.error('Error generating time slots:', error)
  timeSlots.value = []  // ⚠️ Silent failure - returns empty array
}
```

**Refactor:**
```typescript
const error = ref<Error | null>(null)
const isLoading = ref(false)

try {
  isLoading.value = true
  // ...
  error.value = null
} catch (err) {
  logger.error('Error generating time slots:', err)
  error.value = err instanceof Error ? err : new Error('Unknown error')
  timeSlots.value = []
} finally {
  isLoading.value = false
}

return {
  timeSlots: computed(() => timeSlots.value),
  error: computed(() => error.value),
  hasError: computed(() => error.value !== null),
  isLoading: computed(() => isLoading.value)
}
```

**Files to Update:**
- `client/src/composables/useAvailability.ts:46` (add error ref)
- `client/src/composables/useAvailability.ts:117-123` (update catch block)
- `client/src/composables/useAvailability.ts:128-130` (update return)

---

### P1-4: Free-Hours Filter Discards Partial Overlaps ✅ COMPLETED
**Original Issue:** Lines 32-38  
**Severity:** High  
**Impact:** Partial overlaps become null, losing usable availability

**Location:** `server/src/utils/availabilities/availabilityFilters.ts:26-45`

```typescript
if (start >= freeStart && end <= freeEnd) {
  return { start, end };
}
return null;  // Discards partial overlaps
```

**Refactor:**
Replace with interval intersection to preserve usable sub-ranges instead of discarding.

**Files to Update:**
- `server/src/utils/availabilities/availabilityFilters.ts:26-45`

---

### P1-5: Free-Bit Splitting Drops Windows ✅ COMPLETED
**Original Issue:** Lines 16-30  
**Severity:** High  
**Impact:** Free window at 09:50 with :15 increments yields zero bits

**Location:** `server/src/utils/availabilities/freeTimesToValidAvailabilities.ts:38-62`

```typescript
const startMinutes = start.getUTCMinutes();
const alignedStarts = permissibleStarts.filter(
  (pStart) => pStart >= startMinutes
);
// ... drops windows whose start minute is later than max permissible start
```

**Refactor:**
Add carry-forward to subsequent hours or align to the next permissible start >= current start across the full window.

**Files to Update:**
- `server/src/utils/availabilities/freeTimesToValidAvailabilities.ts:38-62`

---

### P1-6: Busy Period Validation Not Applied Consistently ✅ COMPLETED
**Original Issue:** Section 2.3 (lines 280-313)  
**Severity:** High  
**Impact:** Invalid busy periods may cause incorrect availability

**Locations:**
- `client/src/composables/useAvailability.ts:82-85`
- `client/src/composables/booking/useAvailableStartTimes.ts` (receives busy periods from props)

```typescript
// useAvailability.ts:82-85
const busyTimes = getCalendarAvailability({
  start: dateRange.start,
  end: dateRange.end
})
// Not validated through preprocessBusyPeriods
```

**Refactor:**
```typescript
const rawBusyTimes = getCalendarAvailability({
  start: dateRange.start,
  end: dateRange.end
})
const busyTimes = preprocessBusyPeriods(rawBusyTimes) // ✅ Validate and merge
```

**Files to Update:**
- `client/src/composables/useAvailability.ts:13` (import preprocessBusyPeriods)
- `client/src/composables/useAvailability.ts:82-85` (wrap with preprocessBusyPeriods)

---

### P1-7: Unsafe Date String Parsing Without Validation ✅ COMPLETED
**Original Issue:** #27  
**Severity:** High  
**Impact:** Silent NaN values if input is malformed

**Location:** `client/src/composables/booking/useAvailabilityLogic.ts:127-129`

```typescript
const dateString = startValue.includes('T') ? startValue.split('T')[0] : startValue
const [year, month, day] = dateString.split('-').map(Number)
const startDate = new Date(year, month - 1, day) // May produce Invalid Date
```

**Refactor:**
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

**Files to Update:**
- `client/src/composables/booking/useAvailabilityLogic.ts:127-129`
- Consider: `client/src/utils/booking/dateRangeValidation.ts` (new shared utility)

---

## 3. Medium Priority (P2) - Planned Work

These issues affect performance, code quality, or maintainability.

### P2-1: Redundant Settings Fetching Across Composables ✅ COMPLETED
**Original Issue:** #23  
**Severity:** Medium  
**Impact:** Potentially 3 API calls for same data per wizard step

**Locations:**
- `client/src/composables/useAvailability.ts:90`
- `client/src/composables/booking/useAvailableStartTimes.ts:62-63`
- `client/src/composables/booking/useMoveablePartsScheduling.ts:131`

```typescript
// Each composable independently calls:
const settings = await getAvailabilitySettings()
```

**Refactor Options:**
1. Create a shared settings provider using Vue's provide/inject
2. Make settings a required dependency parameter rather than fetching internally
3. Singleton pattern with subscription for cache invalidation

**Files to Update:**
- `client/src/composables/useAvailability.ts:90`
- `client/src/composables/booking/useAvailableStartTimes.ts:62-63`
- `client/src/composables/booking/useMoveablePartsScheduling.ts:131`
- Consider: Create `client/src/composables/useAvailabilitySettings.ts`

---

### P2-2: Eager AppointmentSlot Calculation for All Slots
**Original Issue:** #24  
**Severity:** Medium  
**Impact:** Unnecessary computation for slots user will never select

**Location:** `client/src/composables/booking/useAvailabilityLogic.ts:297-320`

```typescript
// Lines 306-314 - calculates for EVERY slot position
slots.forEach((slot, index) => {
  const calculatedSlots = calculateAppointmentSlots(blockInstances, slot.startTime)
  // ...
})
```

**Refactor:**
1. Calculate `AppointmentSlots` lazily - only when a slot is actually selected
2. Move calculation to a computed that depends on `selectedSlot`
3. Remove preemptive calculation from watch

**Files to Update:**
- `client/src/composables/booking/useAvailabilityLogic.ts:297-320`

---

### P2-3: Date Range Validation Inconsistency ✅ COMPLETED
**Original Issue:** Section 2.2 (lines 214-277)  
**Severity:** Medium  
**Impact:** Hard to reason about edge cases, potential bugs

**Locations:**
- `client/src/composables/useAvailability.ts:68` (Pattern 1)
- `client/src/composables/booking/useAvailabilityLogic.ts:118` (Pattern 2)
- `client/src/utils/timeSlotCalculations.ts:137-152` (Pattern 3)

**Refactor:** Create shared validation utility:
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

**Files to Update:**
- Create: `client/src/utils/booking/dateRangeValidation.ts`
- `client/src/composables/useAvailability.ts:68`
- `client/src/composables/booking/useAvailabilityLogic.ts:118`
- `client/src/utils/timeSlotCalculations.ts:137-152`

---

### P2-4: Duplicate Business Hours Conversion Logic ✅ COMPLETED
**Original Issue:** Section 4.1 (lines 453-495)  
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
  // ... repeated 7 times
}
```

**Refactor:**
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

**Files to Update:**
- `client/src/configs/availabilitySettings.ts:183-213`

---

### P2-5: Duplicate Validation Logic in Slot Generation ✅ COMPLETED
**Original Issue:** #31  
**Severity:** Medium  
**Impact:** Maintainability - duplicate code

**Locations:**
- `client/src/utils/booking/timeSlotFitter.ts:308-371`
- `client/src/utils/booking/timeAvailabilityManager.ts:300-363`

**Refactor:** Extract to shared validation function:
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
    throw new Error(`duration must be greater than 0, got: ${params.duration}`)
  }
  if (!params.minuteIncrement || params.minuteIncrement <= 0) {
    throw new Error(`minuteIncrement must be greater than 0, got: ${params.minuteIncrement}`)
  }
  // ... remaining validation
}
```

**Files to Update:**
- Create: `client/src/utils/booking/slotGenerationValidation.ts`
- `client/src/utils/booking/timeSlotFitter.ts:308-371`
- `client/src/utils/booking/timeAvailabilityManager.ts:300-363`

---

### P2-6: Missing Duration Validation in Caller ✅ COMPLETED
**Original Issue:** Section 2.1 (lines 186-209)  
**Severity:** Medium  
**Impact:** Validation happens deep in call stack

**Location:** `client/src/composables/useAvailability.ts:77`

```typescript
const duration = calculateDurationFromBlockInstances(blockInstances)
// No validation that duration > 0 before passing to fitTimeSlotsWithAvailability
```

**Refactor:**
```typescript
const duration = calculateDurationFromBlockInstances(blockInstances)
if (duration <= 0) {
  logger.warn('Invalid duration calculated', { duration, blockInstances })
  timeSlots.value = []
  return
}
```

**Files to Update:**
- `client/src/composables/useAvailability.ts:77-78`

---

### P2-7: Server-Side Error Handling ✅ COMPLETED
**Original Issue:** Section 6.2 (lines 680-703)  
**Severity:** Medium  
**Impact:** Poor error logging, silent failures

**Location:** `server/src/utils/availabilities/makeAvailabilties.ts:103-106`

```typescript
} catch (error) {
  console.error("Error in makeAvailabilities:", error);
  return [];  // ⚠️ Silent failure
}
```

**Refactor:**
1. Use proper logger (if available) or create one
2. Consider returning error information to caller
3. Log error context (parameters that caused failure)

**Files to Update:**
- `server/src/utils/availabilities/makeAvailabilties.ts:103-106`

---

### P2-8: Date Parsing Duplication ✅ COMPLETED
**Original Issue:** Section 4.2 (lines 499-521)  
**Severity:** Medium  
**Impact:** Minor code duplication, existing utility not used

**Location:** `client/src/composables/booking/useAvailabilityLogic.ts:127-128`

**Existing Utility:** `client/src/utils/booking/timeSlotFitter.ts:112-133` - `parseLocalDate`

**Refactor:**
```typescript
// Import and use existing utility
import { parseLocalDate } from '@/utils/booking/timeSlotFitter'

const startDate = parseLocalDate(startValue)
```

**Files to Update:**
- `client/src/composables/booking/useAvailabilityLogic.ts:14` (add import)
- `client/src/composables/booking/useAvailabilityLogic.ts:127-128` (use parseLocalDate)

---

## 4. Low Priority (P3) - Nice to Have

These issues affect code clarity but don't cause functional problems.

### P3-1: Magic Number Default Duration
**Original Issues:** Section 4.3 (lines 522-555), #32  
**Severity:** Low  
**Impact:** Magic number `90` appears multiple times

**Locations:**
- `client/src/utils/timeSlotCalculations.ts:54-75`

```typescript
if (!blockInstances || blockInstances.length === 0) {
  return 90  // Default
}
// ...
return totalDuration > 0 ? totalDuration : 90  // Default again
```

**Refactor:**
```typescript
// client/src/constants/scheduling.ts
export const DEFAULT_APPOINTMENT_DURATION_MINUTES = 90
export const DEFAULT_MINUTE_INCREMENT = 15
export const DEFAULT_LEAD_TIME_MINUTES = 60
```

**Files to Update:**
- Create: `client/src/constants/scheduling.ts`
- `client/src/utils/timeSlotCalculations.ts:23, 57, 74`

---

### P3-2: Magic Numbers Throughout Codebase ✅ COMPLETED
**Original Issue:** Section 4.4 (lines 558-596)  
**Severity:** Low  
**Impact:** Reduced code clarity

**Locations:**
- `client/src/configs/availabilitySettings.ts:115` (5 * 60 * 1000)
- `client/src/utils/booking/timeAvailabilityManager.ts:321` (60)

**Refactor:**
```typescript
// availabilitySettings.ts
const DEFAULT_CACHE_TTL_MINUTES = 5
const CACHE_TTL_MS = import.meta.env.VITE_AVAILABILITY_CACHE_TTL 
  ? Number(import.meta.env.VITE_AVAILABILITY_CACHE_TTL) 
  : DEFAULT_CACHE_TTL_MINUTES * 60 * 1000

// timeAvailabilityManager.ts
const MAX_RECOMMENDED_MINUTE_INCREMENT = 60
if (minuteIncrement > MAX_RECOMMENDED_MINUTE_INCREMENT) {
  logger.warn('Large minuteIncrement may result in few slots', { minuteIncrement })
}
```

**Files to Update:**
- `client/src/configs/availabilitySettings.ts:112-115`
- `client/src/utils/booking/timeAvailabilityManager.ts:320-321`

---

### P3-3: Redundant TimeSlotWithAvailability Interface
**Original Issue:** #28  
**Severity:** Low  
**Impact:** Code clarity - redundant type

**Location:** `client/src/utils/booking/timeAvailabilityManager.ts:35-37`

```typescript
export interface TimeSlotWithAvailability extends TimeSlot {
  isAvailable: boolean  // Redundant - already required in TimeSlot
}
```

**Refactor:**
Remove `TimeSlotWithAvailability` and use `TimeSlot` directly.

**Files to Update:**
- `client/src/utils/booking/timeAvailabilityManager.ts:35-37`
- Update imports in consuming files

---

### P3-4: Missing DayOfWeek Branded Type ✅ COMPLETED
**Original Issue:** #30  
**Severity:** Low  
**Impact:** Type safety - relies on runtime casting

**Location:** `client/src/utils/booking/timeSlotFitter.ts:65, 390`

```typescript
export type BusinessHoursMap = Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, DayBusinessHours>>
// ...
const dayOfWeek = tempDate.getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6  // Casting required
```

**Refactor:**
```typescript
// client/src/types/datetime.ts
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

**Files to Update:**
- `client/src/types/datetime.ts`
- `client/src/utils/booking/timeSlotFitter.ts:65, 390`

---

### P3-5: Date Object Creation in Hot Path
**Original Issues:** Section 3.2 (lines 379-405), #25  
**Severity:** Low  
**Impact:** Minor performance (only optimize if profiling shows bottleneck)

**Location:** `client/src/utils/booking/timeAvailabilityManager.ts:536-546`

```typescript
return slots.map(slot => {
  const slotStart = new Date(slot.startTime)  // Created for each slot
  const slotEnd = new Date(slot.endTime)      // Created for each slot
  // ...
})
```

**Refactor (only if profiling indicates):**
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

**Files to Update:**
- `client/src/utils/booking/timeAvailabilityManager.ts:536-546` (only if needed)

---

### P3-6: Function Naming Clarity
**Original Issue:** Section 5.2 (lines 615-634)  
**Severity:** Low  
**Impact:** Naming could be clearer

**Location:** `client/src/utils/booking/timeSlotFitter.ts:297, 423`

**Current:**
- `fitTimeSlots` (line 297) - returns only available slots
- `fitTimeSlotsWithAvailability` (line 423) - returns all slots with availability flags

**Suggested Rename:**
- `fitTimeSlots` → `fitAvailableTimeSlots`
- `fitTimeSlotsWithAvailability` → `fitAllTimeSlotsWithAvailability`

**Files to Update (optional):**
- `client/src/utils/booking/timeSlotFitter.ts:297, 423`
- All callers

---

### P3-7: Validation Error Messages Enhancement ✅ COMPLETED
**Original Issue:** Section 6.3 (lines 706-724)  
**Severity:** Low  
**Impact:** Error messages could include parameter values

**Status:** Already implemented in `slotGenerationValidation.ts` - all error messages include parameter values (e.g., `got: ${duration}`, `got: ${minuteIncrement}`)

**Location:** `client/src/utils/booking/timeAvailabilityManager.ts:303-344`

**Refactor:**
```typescript
throw new Error(`duration must be greater than 0, got: ${duration}`)
throw new Error(`minuteIncrement must be greater than 0, got: ${minuteIncrement}`)
throw new Error(`startBoundary must be valid, got: ${startBoundary}`)
throw new Error(`endBoundary must be valid, got: ${endBoundary}`)
```

**Files to Update:**
- `client/src/utils/booking/timeAvailabilityManager.ts:305, 314, 339, 343`

---

### P3-8: Settings Cache Invalidation Verification ✅ COMPLETED
**Original Issue:** Section 3.4 (lines 433-448)  
**Severity:** Low  
**Impact:** Cache may be stale after admin updates

**Location:** `client/src/configs/availabilitySettings.ts:147-154, 263-268`

**Status:** Verified - `useAvailabilitySettings.ts` calls `clearAvailabilitySettingsCache()` (which calls `invalidateAvailabilitySettingsCache()`) after successful save (line 211). Cache invalidation is properly implemented.

**Files Reviewed:**
- `client/src/composables/admin/useAvailabilitySettings.ts:211` - Calls `clearAvailabilitySettingsCache()` after save
- `client/src/configs/availabilitySettings.ts:265-270` - `invalidateAvailabilitySettingsCache()` function exists

---

### P3-9: Timezone Documentation ✅ COMPLETED
**Original Issue:** Section 2.4 (lines 317-365), Section 5.1 (lines 601-612)  
**Severity:** Low  
**Impact:** Hard to understand, maintain, and debug

**Status:** Completed as part of P0-2 - comprehensive timezone documentation added to `timeAvailabilityManager.ts`

**Location:** `client/src/utils/booking/timeAvailabilityManager.ts:1`

**Refactor:** Add comprehensive timezone documentation:
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

**Files to Update:**
- `client/src/utils/booking/timeAvailabilityManager.ts:14`

---

## 5. Resolved Items

These items were identified in the analysis but are already resolved.

### ✅ `isAvailable` Type Consistency
**Location:** `client/src/types/appointment.ts:109`  
**Status:** Already fixed - `isAvailable` is now required.

**Minor Action (Optional):** Update comment at `client/src/utils/booking/timeAvailabilityManager.ts:471` to clarify that `markSlotAvailability` updates the `isAvailable` value.

**Verification Needed:** Ensure all slot generation paths set `isAvailable` explicitly.

### ✅ Duplicate Slot Generation
**Location:** `client/src/composables/booking/useAvailableStartTimes.ts:76-231`  
**Status:** Already fixed - uses shared `slotGenerationResult` computed.

### ✅ Busy Period Overlap Check Efficiency
**Location:** `client/src/utils/booking/timeAvailabilityManager.ts:238-258`  
**Status:** Already good - uses `some()` for early exit, pre-parsed Date objects.

### ✅ Settings Cache Implementation
**Location:** `client/src/configs/availabilitySettings.ts:147-154`  
**Status:** Already good - TTL-based caching implemented.

### ✅ Separation of Concerns
**Status:** Excellent separation maintained across:
- `timeAvailabilityManager.ts` - Core availability logic (pure functions)
- `timeSlotFitter.ts` - Slot fitting utilities
- `useAvailability.ts` - Vue composable (reactive wrapper)
- `useAvailabilityLogic.ts` - Business logic extraction

### ✅ Function Purity
**Status:** Core functions are pure (no side effects):
- `generateSlotsWithAvailability`
- `checkSlotAvailability`
- `preprocessBusyPeriods`

### ✅ Single Source of Truth
**Status:** Good - `generateSlotsWithAvailability` is the single source for slot generation.

---

## 6. Testing Considerations

### Missing Test Coverage Areas

**Edge Cases:**
- DST transitions
- Invalid busy periods (start >= end)
- Empty business hours
- Very large date ranges

**Error Scenarios:**
- API failures in `getAvailabilitySettings`
- Invalid date ranges
- Negative durations

**Performance:**
- Large number of slots (> 1000)
- Large number of busy periods (> 100)

---

## 7. Architecture Notes

### Positive Patterns to Maintain

1. **Separation of Concerns:** Pure utility functions separate from Vue composables
2. **Single Source of Truth:** `generateSlotsWithAvailability` for slot generation
3. **Type Safety:** RFC3339DateTime branded type for timestamps
4. **Validation:** Centralized validation in `preprocessBusyPeriods`

### Recommended New Files

| File | Purpose |
|------|---------|
| `client/src/types/availability.ts` | Shared availability types (PropertyDetails, etc.) |
| `client/src/utils/booking/dateRangeValidation.ts` | Centralized date range validation |
| `client/src/utils/booking/slotGenerationValidation.ts` | Shared slot generation validation |
| `client/src/constants/scheduling.ts` | Scheduling constants (durations, increments) |

---

## Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0 (Critical) | 5 | ✅ All completed |
| P1 (High) | 7 | ✅ All completed |
| P2 (Medium) | 8 | ✅ All completed |
| P3 (Low) | 9 | ✅ 7 completed (P3-1, P3-2, P3-3, P3-4, P3-6, P3-7, P3-8, P3-9), 1 remaining (P3-5 - conditional, only if profiling indicates) |
| Resolved | 7 | Already fixed or good |

**Total Issues Consolidated:** 36 unique issues (some duplicates merged)

---

## Change Log

| Date | Change |
|------|--------|
| 2026-01-21 | Initial refactor plan created from analysis |
| 2026-01-21 | Completed: P0-1, P0-4, P1-1, P1-2, P1-3, P1-4, P1-5, P1-6, P1-7, P2-6, P2-7, P2-8 |
| 2026-01-21 | Completed: P0-2, P0-3, P0-5, P2-1, P2-2, P2-3, P2-4, P2-5, P2-7 (all remaining critical and medium priority tasks) |
| 2026-01-21 | Completed: P3-1, P3-2, P3-4, P3-7, P3-9 (low priority improvements) |
