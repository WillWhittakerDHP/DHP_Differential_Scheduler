# Loop Mutation Audit Summary (Generated)

Generated from `.audit-reports/loop-mutation-audit.json`.

## Top 30 files (ranked)

| File | Priority | score | forEach | for-loops | mutators | assigns | forEach→mutation hits |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `server/src/services/slotComputationService.ts` | P0 | 38 | 0 | 4 | 3 | 14 | 0 |
| `client/src/utils/transformers/relationshipTransformers.ts` | P0 | 32 | 0 | 0 | 0 | 16 | 0 |
| `client/src/types/admin/AdminEntity.ts` | P0 | 26 | 0 | 0 | 0 | 13 | 0 |
| `client/src/utils/forms/fieldSectionCategorization.ts` | P0 | 20 | 0 | 0 | 2 | 8 | 0 |
| `client/src/utils/booking/partFinalizer.ts` | P0 | 18 | 2 | 2 | 1 | 2 | 1 |
| `client/src/utils/transformers/componentAggregator.ts` | P0 | 18 | 0 | 0 | 0 | 9 | 0 |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | P0 | 18 | 0 | 0 | 0 | 9 | 0 |
| `server/src/services/calendarErrorHandler.ts` | P0 | 16 | 0 | 0 | 0 | 8 | 0 |
| `client/src/components/admin/generic/EntityCardSubPanels.vue` | P0 | 14 | 0 | 0 | 7 | 10 | 0 |
| `client/src/utils/booking/cascadeFilterPipeline.ts` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `client/src/utils/entityDefaults.ts` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `client/src/utils/transformers/fieldClassification.ts` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `server/src/services/google/maps/mapsHelpers.ts` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `client/src/composables/booking/useComputedAvailability.ts` | P0 | 13 | 1 | 2 | 0 | 23 | 1 |
| `client/src/utils/forms/formElementPatching.ts` | P0 | 13 | 1 | 4 | 0 | 4 | 0 |
| `client/src/components/booking/modals/PropertyConfirmationModal.vue` | P0 | 12 | 0 | 0 | 6 | 0 | 0 |
| `client/src/composables/admin/useAdminPrimitiveMetadataMutations.ts` | P0 | 12 | 0 | 0 | 0 | 6 | 0 |
| `client/src/composables/admin/useAdminRelationshipMetadataMutations.ts` | P0 | 12 | 0 | 0 | 0 | 6 | 0 |
| `client/src/utils/appointmentFieldFormatters.ts` | P0 | 12 | 0 | 0 | 0 | 6 | 0 |
| `client/src/utils/blockInstanceUtils.ts` | P0 | 12 | 0 | 1 | 0 | 6 | 0 |
| `client/src/utils/booking/constraintColors.ts` | P0 | 12 | 0 | 0 | 0 | 6 | 0 |
| `client/src/utils/differentialScheduling.ts` | P0 | 12 | 0 | 0 | 0 | 6 | 0 |
| `client/src/utils/eventAttendeeUtils.ts` | P0 | 12 | 0 | 0 | 0 | 6 | 0 |
| `client/src/utils/transformers/appointmentToWizardHelpers.ts` | P0 | 12 | 0 | 0 | 0 | 6 | 0 |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | P0 | 12 | 0 | 0 | 0 | 6 | 0 |
| `client/src/utils/transformers/composePropertyValue.ts` | P0 | 12 | 0 | 0 | 0 | 6 | 0 |
| `server/src/services/computedAvailabilityService.ts` | P0 | 12 | 0 | 0 | 0 | 6 | 0 |
| `server/src/services/instanceVersioning.ts` | P0 | 12 | 0 | 0 | 0 | 6 | 0 |
| `client/src/main.ts` | P1 | 11 | 1 | 2 | 0 | 4 | 0 |
| `client/src/components/admin/dev/ApiDevPanelComputedTab.vue` | P1 | 10 | 0 | 6 | 1 | 8 | 0 |

*...and 166 more files. See full report for details.*

## Notes

- This is a *signal* index. Use the full report for line-level matches and hit lists: `client/.audit/loop-mutation-audit.md`.
