# Remaining Fixes Plan — Outcome Deltas

**Date:** 2026-02-23

## Before (baseline)
- **type-escape:** 49 findings (48 comment matches + 1 code: `AppDateTimePicker.vue` `counterValue: Function as PropType<...>`)
- **type-similarity:** 21 groups, 669 type definitions (BRAND=4, EXTEND=16, REVIEW=1)
- **pre-typecheck total:** 70 findings

## After
- **type-escape:** 49 findings (all 49 are comment-only matches; the single code-level `Function` was fixed in `AppDateTimePicker.vue` → `Object as PropType<(value: string) => number>`)
- **type-similarity:** 20 groups, 665 type definitions (BRAND=3, EXTEND=16, REVIEW=1). One group removed; 4 fewer duplicate/standalone definitions.
- **pre-typecheck total:** 69 findings

## Changes made
1. **Phase 1 (code-only Function):** Replaced `counterValue: Function as PropType<...>` with `Object as PropType<...>` in `AppDateTimePicker.vue`. No comment wording changed.
2. **Phase 2 (Wave 1):** BRAND added to 6 collection types (BusinessDataCollectionCrudConfig, BusinessDataCollectionCrudComposableReturn, GlobalDataCollectionCrudConfig, GlobalDataCollectionCrudComposableReturn, BusinessDataCollectionQueryOptions, GlobalDataCollectionQueryOptions). ComponentItem unified (usePropertyDetailsLogic extends selectionCardTypes). CalendarEvent unified (client re-exports shared).
3. **Phase 3 (Wave 2):** SelectedTimeSlot now extends shared SlotTimeBounds; BusyTimeRange re-exported from shared in client timeSlotTypes; PartialPropertyDetails (server) is now alias for shared PropertyDetailsBase.

## Intentionally left for follow-up
- **type-similarity:** 20 groups remain (e.g. PriceData/FeeEntryBase, SlotDisplayData/ComputedSlot, Props/DefaultLocation, capacity filters, FieldsByLocation, etc.). These can be tackled in future batches using the same EXTEND/BRAND/UNIFY pattern.
