# Architecture Decision Records - Booking Utilities

## ADR-001: Slot Generation Strategy (Generate All Then Filter)

**Date:** 2026-01-21  
**Status:** Accepted  
**Deciders:** Category 4 Performance Optimization

### Context

Two approaches exist for slot generation with availability checking:

1. **Generate All Then Filter** - Generate all possible slots, then mark availability
2. **Filter During Generation** - Only generate available slots

### Decision

We use **Generate All Then Filter** approach.

### Rationale

**Advantages:**
- **UI Flexibility:** Can show unavailable slots as grayed out
- **Consistency:** Generates same slots regardless of busy periods
- **Debuggability:** Can see all potential slots vs. filtered slots
- **Testability:** Can test generation and availability separately
- **Performance:** With Date object caching (Category 4), performance is equivalent

**Disadvantages of Alternative:**
- Tightly couples generation with availability logic
- Prevents UI from showing unavailable slots
- Harder to debug (can't see what was filtered out)
- No significant performance benefit

### Implementation

See:
- `generateAllTimeSlots()` in `slotGenerator.ts`
- `checkSlotAvailability()` in `overlapConstraintChecker.ts`
- `markSlotAvailability()` in `slotOverlapMarker.ts`

### Related Issues

- Issue #12 in `AVAILABILITY_REFACTOR_ANALYSIS.md`
- Category 4 Performance Optimizations

---

## ADR-002: earliestCompletion Tracks Available Slots Only

**Date:** 2026-01-21  
**Status:** Accepted  
**Deciders:** Category 5 Data Handling Concerns

### Context

Two approaches exist for tracking earliest completion time:

1. **Track All Slots** - Track earliest completion of all generated slots (including busy/unavailable)
2. **Track Available Slots Only** - Track earliest completion of available slots only

### Decision

We track **earliest completion of available slots only**.

### Rationale

**Advantages:**
- **UI Usefulness:** Shows when next appointment can actually be booked
- **User Expectations:** Aligns with user question "When is the earliest I can schedule?"
- **Consistency:** Both `computeSlotAvailability()` and `orchestrateSlotAvailability()` use same behavior
- **Correctness:** More accurate representation of when scheduling can begin

**Disadvantages of Alternative:**
- Includes busy slots that can't be booked
- Less useful for UI (shows unavailable times)
- Misleading to users (shows times that aren't actually available)

### Implementation

Both functions track earliest completion of available slots only:

- `computeSlotAvailability()` - Filters to available slots before finding earliest completion
- `orchestrateSlotAvailability()` - Filters to available slots before finding earliest completion

### Related Issues

- Issue #15 in `AVAILABILITY_REFACTOR_ANALYSIS.md`
- Category 5 Data Handling Concerns

---

## ADR-003: Busy Period Pre-processing (Validate, Sort, Merge)

**Date:** 2026-01-21  
**Status:** Accepted  
**Deciders:** Category 5 Data Handling Concerns

### Context

Busy periods from calendar APIs or user input may contain:
- Invalid periods (start >= end, invalid datetime strings)
- Unsorted periods (not in chronological order)
- Overlapping periods (redundant overlap checks)

### Decision

We pre-process busy periods before slot generation: **Validate → Sort → Merge**.

### Rationale

**Advantages:**
- **Correctness:** Filters invalid busy periods that could cause incorrect availability
- **Performance:** Merging overlapping periods reduces number of overlap checks
- **Efficiency:** Sorting enables efficient merging algorithm
- **Robustness:** Handles malformed input gracefully

**Performance Impact:**
- Merging `[10:00-11:00, 10:30-12:00]` → `[10:00-12:00]` reduces from 2 to 1 overlap check per slot
- With many overlapping periods, can reduce busy period count by 30-50%

### Implementation

`preprocessBusyPeriods()` function performs three steps:

1. **Validate:** Filter out invalid periods (start >= end, invalid datetimes)
2. **Sort:** Sort by start time for efficient merging
3. **Merge:** Merge overlapping and adjacent periods

Pre-processing happens before `parseBusyPeriods()`:
- Input: `BusyTimeRange[]` (raw from API/user)
- Output: `BusyTimeRange[]` (validated, sorted, merged)
- Then: Parse to `ParsedBusyTimeRange[]` for slot generation

### Related Issues

- Issue #17 in `AVAILABILITY_REFACTOR_ANALYSIS.md`
- Category 5 Data Handling Concerns
