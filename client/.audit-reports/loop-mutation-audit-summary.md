# Loop Mutation Audit Summary (Generated)

Generated from `.audit-reports/loop-mutation-audit.json`.

## Top 30 files (ranked)

| File | Priority | score | forEach | for-loops | mutators | assigns | forEach→mutation hits |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `server/src/services/constraintExtractor.ts` | P0 | 53 | 2 | 1 | 5 | 8 | 3 |
| `client/src/utils/booking/overlapConstraintChecker.ts` | P0 | 44 | 0 | 8 | 6 | 12 | 0 |
| `server/src/config/app.js` | P0 | 35 | 0 | 4 | 5 | 14 | 0 |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | P0 | 34 | 0 | 0 | 1 | 16 | 0 |
| `client/src/utils/transformers/relationshipTransformers.ts` | P0 | 34 | 0 | 0 | 0 | 17 | 0 |
| `server/src/services/computedAvailabilityService.ts` | P0 | 34 | 0 | 8 | 5 | 8 | 0 |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | P0 | 32 | 0 | 4 | 4 | 10 | 0 |
| `client/src/utils/booking/partFinalizer.ts` | P0 | 28 | 2 | 2 | 1 | 3 | 2 |
| `client/src/types/admin/AdminEntity.ts` | P0 | 26 | 0 | 0 | 0 | 13 | 0 |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | P0 | 24 | 0 | 0 | 0 | 12 | 0 |
| `server/src/services/google/maps/placesApiService.ts` | P0 | 22 | 0 | 0 | 0 | 11 | 0 |
| `client/src/utils/booking/appointmentSlotBuilder.ts` | P0 | 20 | 0 | 0 | 0 | 10 | 0 |
| `client/src/utils/forms/fieldSectionCategorization.ts` | P0 | 20 | 0 | 0 | 2 | 8 | 0 |
| `client/src/utils/transformers/annotationTransformers.ts` | P0 | 18 | 0 | 0 | 1 | 8 | 0 |
| `client/src/utils/transformers/componentAggregator.ts` | P0 | 18 | 0 | 0 | 0 | 9 | 0 |
| `client/src/composables/booking/useStepValidation.ts` | P0 | 16 | 0 | 12 | 0 | 4 | 0 |
| `server/src/services/calendarErrorHandler.ts` | P0 | 15 | 0 | 1 | 0 | 7 | 0 |
| `client/src/components/admin/generic/EntityCardSubPanels.vue` | P0 | 14 | 0 | 0 | 7 | 10 | 0 |
| `client/src/utils/entityDefaults.ts` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `server/src/db/models/admin/block_shape.js` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `server/src/db/models/admin/business_settings.js` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `server/src/db/models/admin/part_shape.js` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `server/src/db/models/admin/valid_cascade.js` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `server/src/db/models/booking/active_annotation.js` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `server/src/db/models/booking/address.js` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `server/src/db/models/booking/annotation_instance.js` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `server/src/db/models/booking/annotation_shape.js` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `server/src/db/models/booking/appointment.js` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `server/src/db/models/booking/block_instance.js` | P0 | 14 | 0 | 0 | 0 | 7 | 0 |
| `server/src/services/google/maps/mapsHelpers.ts` | P0 | 14 | 0 | 2 | 0 | 6 | 0 |

*...and 179 more files. See full report for details.*

## Notes

- This is a *signal* index. Use the full report for line-level matches and hit lists: `client/.audit/loop-mutation-audit.md`.
