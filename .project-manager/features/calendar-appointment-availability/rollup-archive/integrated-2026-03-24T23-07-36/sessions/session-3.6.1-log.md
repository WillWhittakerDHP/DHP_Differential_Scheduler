# Session 3.6.1: Type maintenance and remaining audit fixes

## Session end (2026-02-23)

**Accomplished:**
- Type-escape: Server `inviteOrchestrationService` — added `AppointmentWithRelations` and `toInviteAppointmentData()`; removed type casts. Client `wizardStatePlugin` — added `isBookingBlockInstance()` guard and logging.
- Type-import: Allowlisted 4 false positives in `audit-global-config.json`.
- Cross-boundary: Moved `useAdmin`, `useBookingWizard`, `useSelectionCard` to domain folders; updated all imports.
- Dep freshness: `npm update` in client/server; pre-typecheck 0 outdated.
- function-type: Replaced `Function` prop in `AppDateTimePicker.vue` with `Object as PropType<...>`.
- Type-similarity Wave 1: BRAND on 6 types (businessDataCollections, globalDataCollections); EXTEND in `usePropertyDetailsLogic` and `calendarApiService`.
- Type-similarity Wave 2: `availabilityStepData`/`timeSlotTypes` aligned to shared `SlotTimeBounds`/`BusyTimeRange`; `propertyFieldMapper` uses shared `PropertyDetailsBase`.
- Verification: `REMAINING_FIXES_DELTA.md` added; type-similarity 21→20 groups; pre-typecheck 70→69.

**Fix during session-end:** Server build was failing: `InviteAppointmentData` vs model `selectedTimeSlots`. Added `toInviteAppointmentData()` in `inviteOrchestrationService.ts` to normalize slots for `buildInviteContext`.

**Next:** Continue type-similarity backlog or start next session per phase guide.

