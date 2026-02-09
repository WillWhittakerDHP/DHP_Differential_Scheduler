# Deprecation & Legacy Accommodation Audit Summary (Generated)

Generated from `.audit-reports/deprecation-audit.json`.

- Files with findings: **155**
- Requiring review: **433**
- Allowed exceptions: 0

- Annotated deprecations: **36**
- Runtime legacy accommodation: **397**

## Top 30 files (ranked by score)

| File | Priority | Score | Annotations | Legacy/Compat |
| --- | --- | ---: | ---: | ---: |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | P0 | 56 | 1 | 29 |
| `client/src/composables/booking/useContactsStepData.ts` | P0 | 30 | 0 | 15 |
| `client/src/views/admin/tabs/BusinessControlsTab.vue` | P0 | 23 | 0 | 13 |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | P0 | 21 | 1 | 10 |
| `server/src/services/googleCalendarService.ts` | P0 | 20 | 0 | 12 |
| `client/src/utils/booking/appointmentSlotBuilder.ts` | P0 | 18 | 2 | 8 |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | P0 | 18 | 2 | 8 |
| `client/src/composables/booking/useTimeSlotCalculations.ts` | P0 | 15 | 1 | 9 |
| `client/src/composables/entityCrud/useEntityCrudMutations.ts` | P0 | 14 | 0 | 7 |
| `client/src/utils/transformers/relationshipTransformers.ts` | P0 | 14 | 0 | 7 |
| `server/src/scripts/importCalendarData.ts` | P0 | 14 | 0 | 7 |
| `client/src/utils/differentialScheduling.ts` | P0 | 13 | 1 | 8 |
| `client/src/utils/blockInstanceUtils.ts` | P0 | 12 | 0 | 6 |
| `client/src/composables/booking/useAppointmentSlots.ts` | P0 | 11 | 0 | 6 |
| `client/src/composables/booking/usePropertyDetailsLogic.ts` | P0 | 10 | 0 | 5 |
| `client/src/composables/booking/useWizardFilteredOptions.ts` | P0 | 10 | 0 | 6 |
| `client/src/types/admin/AdminEntity.ts` | P0 | 10 | 0 | 5 |
| `client/src/utils/booking/timeAvailabilityManager.ts` | P0 | 10 | 0 | 5 |
| `client/src/composables/booking/useAvailableStartTimes.ts` | P1 | 9 | 2 | 4 |
| `server/src/routes/internal/appointments/appointmentRouter.ts` | P1 | 9 | 0 | 5 |
| `client/src/components/admin/PartInstanceBulkEditModal.vue` | P1 | 8 | 0 | 4 |
| `client/src/composables/dataCollections/useDataCollectionActions.ts` | P1 | 8 | 0 | 4 |
| `client/src/composables/formFields/useFormFieldsStandardLayout.ts` | P1 | 8 | 0 | 4 |
| `client/src/utils/booking/partFinalizer.ts` | P1 | 8 | 0 | 4 |
| `client/src/utils/eventAttendeeUtils.ts` | P1 | 8 | 0 | 4 |
| `client/src/views/admin/tabs/BusinessRulesTab.vue` | P1 | 8 | 0 | 4 |
| `server/src/services/appointmentSnapshotLoader.ts` | P1 | 8 | 0 | 4 |
| `server/src/services/googleMapsService.ts` | P1 | 8 | 0 | 5 |
| `client/src/components/admin/generic/EntityFormContent.vue` | P1 | 7 | 1 | 3 |
| `client/src/composables/useBookingWizard.ts` | P1 | 7 | 1 | 3 |

*...and 125 more files. See full report for details.*

## Notes

- **Annotations**: `@deprecated`, `// Deprecated`, `(deprecated)`, `// LEGACY:`, compat markers
- **Legacy/Compat**: Runtime keywords, `|| ''`, `?? ''`, default params, chaining fallbacks
- See full report: `client/.audit-reports/deprecation-audit.md`
