# Deprecation & Legacy Accommodation Audit Summary (Generated)

Generated from `.audit-reports/deprecation-audit.json`.

- Files with findings: **154**
- Requiring review: **394**
- Allowed exceptions: 3

- Annotated deprecations: **35**
- Runtime legacy accommodation: **359**

## Top 30 files (ranked by score)

| File | Priority | Score | Annotations | Legacy/Compat |
| --- | --- | ---: | ---: | ---: |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | P0 | 40 | 0 | 21 |
| `client/src/composables/booking/useContactsStepData.ts` | P0 | 30 | 0 | 15 |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | P0 | 25 | 1 | 12 |
| `server/src/scripts/helpers/calendarParsingHelpers.ts` | P0 | 21 | 0 | 12 |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | P0 | 17 | 1 | 8 |
| `client/src/composables/booking/useTimeSlotCalculations.ts` | P0 | 15 | 1 | 9 |
| `client/src/composables/entityCrud/useEntityCrudMutations.ts` | P0 | 14 | 0 | 7 |
| `client/src/utils/differentialScheduling.ts` | P0 | 13 | 1 | 8 |
| `client/src/utils/blockInstanceUtils.ts` | P0 | 12 | 0 | 6 |
| `client/src/composables/booking/usePropertyDetailsLogic.ts` | P0 | 10 | 0 | 5 |
| `client/src/composables/booking/useWizardFilteredOptions.ts` | P0 | 10 | 0 | 6 |
| `client/src/types/admin/AdminEntity.ts` | P0 | 10 | 0 | 5 |
| `client/src/utils/transformers/relationshipTransformers.ts` | P0 | 10 | 0 | 5 |
| `client/src/components/admin/PartInstanceBulkEditModal.vue` | P1 | 8 | 0 | 4 |
| `client/src/composables/admin/useDifferentialPerspectives.ts` | P1 | 8 | 0 | 4 |
| `client/src/composables/dataCollections/useDataCollectionActions.ts` | P1 | 8 | 0 | 4 |
| `client/src/composables/formFields/useFormFieldsStandardLayout.ts` | P1 | 8 | 0 | 4 |
| `client/src/utils/booking/appointmentSlotBuilder.ts` | P1 | 8 | 0 | 4 |
| `client/src/utils/booking/partFinalizer.ts` | P1 | 8 | 0 | 4 |
| `client/src/utils/eventAttendeeUtils.ts` | P1 | 8 | 0 | 4 |
| `client/src/views/admin/tabs/BusinessRulesTab.vue` | P1 | 8 | 0 | 4 |
| `server/src/routes/internal/appointments/appointmentCrudRouter.ts` | P1 | 8 | 0 | 4 |
| `server/src/services/appointmentSnapshotLoader.ts` | P1 | 8 | 0 | 4 |
| `server/src/services/google/maps/mapsHelpers.ts` | P1 | 8 | 0 | 4 |
| `client/src/components/admin/generic/EntityFormContent.vue` | P1 | 7 | 1 | 3 |
| `client/src/composables/useBookingWizard.ts` | P1 | 7 | 1 | 3 |
| `client/src/utils/transformers/appointmentToWizardHelpers.ts` | P1 | 7 | 0 | 4 |
| `client/src/components/admin/generic/DynamicForm.vue` | P1 | 6 | 0 | 3 |
| `client/src/composables/admin/useDefaultLocation.ts` | P1 | 6 | 0 | 3 |
| `client/src/composables/booking/useAppointmentShape.ts` | P1 | 6 | 0 | 3 |

*...and 124 more files. See full report for details.*

## Notes

- **Annotations**: `@deprecated`, `// Deprecated`, `(deprecated)`, `// LEGACY:`, compat markers
- **Legacy/Compat**: Runtime keywords, `|| ''`, `?? ''`, default params, chaining fallbacks
- See full report: `client/.audit-reports/deprecation-audit.md`
