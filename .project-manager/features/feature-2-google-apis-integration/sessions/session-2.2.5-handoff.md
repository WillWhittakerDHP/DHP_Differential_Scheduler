# Session 2.2.5 Handoff: API Prefetching & Data Source Semantics

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Session:** 2.2.5 - API Prefetching & Data Source Semantics  
**Status:** ⏳ Not Started  
**Created:** 2026-02-02

---

## Session Overview

**Session Number:** 2.2.5  
**Session Name:** API Prefetching & Data Source Semantics  
**Description:** Optimize API call timing by prefetching calendar events and busy times when placeId becomes available (Step 2), and clarify that data source modes control which values are *used* rather than when APIs are *called*. This ensures Step 3 loads instantly with prefetched data and clarifies the architecture around mode semantics.

**Goal:** Prefetch calendar events and busy times on Step 2 (when placeId available) so Step 3 loads instantly. Clarify that mode controls usage, not fetching - APIs always called to populate cache regardless of mode.

**Architecture Decision:** API Orchestration Pattern
- Create orchestrator composable that watches placeId and dateRange
- Trigger sequential API chain (events → busy times) when placeId becomes available
- Composables consume prefetched data instead of fetching independently
- Mode semantics: Mode determines which value is *returned*, not whether API is *called*
- API calls always happen (if locations available) to populate cache for mode switching

---

## Objectives

1. Create `useApiOrchestrator` composable to orchestrate prefetch chain
2. Create `useDateRangeDecider` composable for shared date range calculation
3. Integrate orchestrator in BookingWizard (parent component)
4. Update AvailabilityStep to track displayed month and consume prefetched data
5. Update `useAvailableStartTimes` to consume prefetched calendar events
6. Update `useBusyTimes` to accept optional prefetched busy times
7. Clarify mode semantics in `driveTimeCalculator` - mode controls usage, not fetching
8. Update `useDriveTimeDataSource` documentation and default value
9. Update `useFreeBusyDataSource` documentation for consistency
10. Fix `constraintExtractors` validApplyTo array to use correct values

---

## Prerequisites

- ✅ Session 2.2.4 Complete (Wizard Address Autocomplete Integration - placeId available)
- ✅ Session 2.2.2 Complete (Routes API integration)
- ✅ Session 2.2.1 Complete (Places API integration)
- ✅ placeId available in property details step data

---

## Implementation Summary

### Part A: API Orchestration Architecture

#### 1. Create useDateRangeDecider Composable

**File:** `client/src/composables/booking/useDateRangeDecider.ts` (NEW)

- Calculates date range for displayed calendar month
- Accepts optional `displayedMonth` ref (year, month)
- Returns computed date range (start and end of month in UTC)
- Defaults to current month if no month provided
- Single source of truth for date range used by all API composables

#### 2. Create useApiOrchestrator Composable

**File:** `client/src/composables/booking/useApiOrchestrator.ts` (NEW)

- Watches `placeId` from property details step data
- Watches `dateRange` from date range decider
- Triggers sequential API chain when placeId becomes available OR month changes:
  1. Events API: Fetch calendar events for displayed month (triggers server-side Places API geocoding)
  2. BusyTimes: Fetch busy times for displayed month
- Returns prefetched `calendarEvents` and `busyTimes` refs
- Returns `isLoading` and `error` states
- Note: Routes API calculations happen later in driveTimeCalculator using prefetched calendar events

#### 3. Integrate Orchestrator in BookingWizard

**File:** `client/src/components/booking/BookingWizard.vue`

- Initialize `displayedMonth` ref (defaults to current month)
- Provide `displayedMonth` and `updateDisplayedMonth` via inject
- Create `dateRange` using `useDateRangeDecider(displayedMonth)`
- Create `apiOrchestrator` using `useApiOrchestrator({ propertyDetailsStepData, dateRange })`
- Provide orchestrator data (`calendarEvents`, `busyTimes`, `isLoading`, `error`) via inject

### Part B: Prefetched Data Consumption

#### 4. Update AvailabilityStep for Month Tracking

**File:** `client/src/components/booking/steps/AvailabilityStep.vue`

- Inject `displayedMonth` and `updateDisplayedMonth` from parent
- Track `vDatePickerDisplayDate` for VDatePicker display-date prop
- Watch `displayedMonth` and update VDatePicker display-date
- Watch VDatePicker display-date and update parent's `displayedMonth` (triggers orchestrator)
- Watch `selectedDate` and update `displayedMonth` to match selected date's month
- Inject `apiOrchestrator` from parent
- Create computed refs for prefetched data (`prefetchedBusyTimes`, `prefetchedCalendarEvents`)

#### 5. Update useBusyTimes Composable

**File:** `client/src/composables/booking/useBusyTimes.ts`

- Add optional `prefetchedBusyTimes` parameter to interface
- Watch prefetched data if provided, update local `busyTimes` ref
- Only set up fetch watch if prefetched data NOT provided
- Log when using prefetched data vs fetching

#### 6. Update useAvailableStartTimes Composable

**File:** `client/src/composables/booking/useAvailableStartTimes.ts`

- Remove direct calendar event fetching logic
- Accept optional `prefetchedCalendarEvents` parameter
- Use prefetched events if available, otherwise empty array
- Log when using prefetched data vs empty array

### Part C: Data Source Mode Semantics

#### 7. Clarify Drive Time Calculator Mode Semantics

**File:** `client/src/utils/booking/driveTimeCalculator.ts`

- Add guard: only calculate if `placeId` exists in `defaultLocation`
- **Key change:** Mode controls which value is *returned*, NOT whether API is called
- API always called to populate cache (regardless of mode)
- Mode-based return value selection:
  - `'default'`: Return static value (API still called, cache populated)
  - `'api'`: Return calculated value, fail if unavailable
  - `'both'`: Return calculated if available, fallback to static
- Update logging to show mode and cache population

#### 8. Update Drive Time Data Source Documentation

**File:** `client/src/composables/booking/useDriveTimeDataSource.ts`

- Update documentation: Mode controls usage, not fetching
- Change default from `'both'` to `'default'` (use static fallback values)
- Clarify that API calls always happen to populate cache

#### 9. Update Free Busy Data Source Documentation

**File:** `client/src/composables/booking/useFreeBusyDataSource.ts`

- Update documentation: Mode controls usage, not fetching
- Clarify that API calls always happen to populate cache

#### 10. Fix Constraint Extractors Validation

**File:** `client/src/utils/booking/constraintExtractors.ts`

- Update `validApplyTo` array to use correct values:
  - Change from: `['all', 'first_only', 'last_only', 'none']`
  - Change to: `['all', 'skipDayStart', 'skipDayEnd', 'none']`

---

## Files Modified

### Client (Frontend)

| File | Changes |
|------|---------|
| `client/src/composables/booking/useApiOrchestrator.ts` | NEW: Orchestrates sequential API chain when placeId available |
| `client/src/composables/booking/useDateRangeDecider.ts` | NEW: Calculates date range for displayed calendar month |
| `client/src/components/booking/BookingWizard.vue` | Orchestrator setup, displayedMonth tracking, provide/inject |
| `client/src/components/booking/steps/AvailabilityStep.vue` | Month tracking, consume prefetched data, VDatePicker integration |
| `client/src/composables/booking/useAvailableStartTimes.ts` | Consume prefetched calendar events instead of fetching |
| `client/src/composables/booking/useBusyTimes.ts` | Accept prefetched busy times, conditional fetch watch |
| `client/src/utils/booking/driveTimeCalculator.ts` | Mode semantics clarification, placeId guard, cache population |
| `client/src/composables/booking/useDriveTimeDataSource.ts` | Documentation update, default change to 'default' |
| `client/src/composables/booking/useFreeBusyDataSource.ts` | Documentation update for consistency |
| `client/src/utils/booking/constraintExtractors.ts` | Fix validApplyTo array values |

---

## Data Flow

```
BookingWizard (Parent)
    │
    ├─ Initialize displayedMonth ref
    ├─ Create dateRange via useDateRangeDecider
    ├─ Create apiOrchestrator via useApiOrchestrator
    └─ Provide orchestrator data via inject
    │
    ▼
useApiOrchestrator
    │
    ├─ Watch placeId (from propertyDetailsStepData)
    ├─ Watch dateRange
    │
    │ placeId available OR month changes
    ▼
    Sequential API Chain:
    1. Fetch calendar events (triggers server-side geocoding)
    2. Fetch busy times
    │
    ├─ calendarEvents ref (prefetched)
    └─ busyTimes ref (prefetched)
    │
    ▼
AvailabilityStep (Child)
    │
    ├─ Inject orchestrator data
    ├─ Track displayedMonth (updates parent when month changes)
    ├─ Pass prefetchedBusyTimes to useBusyTimes
    └─ Pass prefetchedCalendarEvents to useAvailableStartTimes
    │
    ▼
useBusyTimes / useAvailableStartTimes
    │
    └─ Consume prefetched data (no API calls needed)
```

---

## Testing Checklist

- [ ] Test orchestrator triggers when placeId becomes available on Step 2
- [ ] Test orchestrator re-runs when month changes in calendar widget
- [ ] Test prefetched data consumed by useBusyTimes (no duplicate API calls)
- [ ] Test prefetched data consumed by useAvailableStartTimes (no duplicate API calls)
- [ ] Test Step 3 loads instantly with prefetched data
- [ ] Test mode semantics: 'default' mode still calls API (cache populated)
- [ ] Test mode semantics: 'api' mode fails if no route found
- [ ] Test mode semantics: 'both' mode falls back to static on error
- [ ] Test constraintExtractors validation with correct applyTo values
- [ ] Test drive time calculator placeId guard (uses static fallback if no placeId)

---

## Success Criteria

**API Orchestration:**
- ✅ Orchestrator watches placeId and dateRange
- ✅ Sequential API chain triggers when placeId available or month changes
- ✅ Prefetched data available for Step 3 consumption
- ✅ Step 3 loads instantly (no waiting for API calls)

**Data Consumption:**
- ✅ Composables consume prefetched data instead of fetching independently
- ✅ No duplicate API calls (orchestrator fetches, composables consume)
- ✅ Fallback to fetching if prefetched data not available (edge cases)

**Mode Semantics:**
- ✅ Mode controls which value is *used*, not when API is *called*
- ✅ API always called (if locations available) to populate cache
- ✅ Mode switching uses cached data (no re-fetch needed)
- ✅ Documentation clearly explains mode behavior

**Code Quality:**
- ✅ All files compile without errors
- ✅ TypeScript types correct
- ✅ No linting errors
- ✅ Constraint validation uses correct applyTo values

---

## Next Session

**Session 2.2.6:** Constraint Attribution & Admin Performance
- Fix violation attribution (direct conflicts = appointment, drive times = buffer only)
- Display buffer minutes in constraint overlay tooltips
- Optimize admin settings loading (conditional load when tab active)

---

## Notes

- Orchestrator pattern allows prefetching data before it's needed, improving perceived performance
- Mode semantics clarification prevents confusion about when APIs are called vs when values are used
- Prefetched data pattern matches free-busy data source pattern (fetch always happens, mode controls usage)
- Month tracking ensures orchestrator re-runs when user navigates calendar, keeping data fresh
- Routes API calculations happen later in driveTimeCalculator using prefetched calendar events (not in orchestrator chain)

---

**Session Status:** ⏳ Not Started  
**Created:** 2026-02-02
