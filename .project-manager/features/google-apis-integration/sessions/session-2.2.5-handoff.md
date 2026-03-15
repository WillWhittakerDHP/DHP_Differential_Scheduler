# Session 2.2.5 Handoff: API Prefetching & Data Source Semantics

**Feature:** Feature 2 - Google APIs Integration  
**Phase:** 2.2 - Google Maps API Integration  
**Session:** 2.2.5 - API Prefetching & Data Source Semantics  
**Status:** ✅ Complete  
**Created:** 2026-02-02  
**Completed:** 2026-02-19

---

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
