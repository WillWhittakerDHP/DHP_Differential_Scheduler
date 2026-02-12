# Composables Logic Audit Summary (Generated)

Generated from `.audit-reports/composables-logic-audit.json`.

## Top 30 composable files (ranked by score)

| File | Priority | score | exports(use*) | vue-query | watch | computed | ref | async | await | DOM | console |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `src/composables/entityCrud/useEntityCrudMutations.ts` | P0 | 38 | 0 | 7 | 0 | 0 | 0 | 15 | 10 | 0 | 0 |
| `src/composables/fieldContext/useFieldContextSaveHelpers.ts` | P1 | 17 | 0 | 0 | 0 | 0 | 0 | 3 | 6 | 0 | 0 |
| `src/composables/dataCollections/useDataCollectionActions.ts` | P1 | 24 | 0 | 6 | 0 | 0 | 0 | 8 | 8 | 0 | 0 |
| `src/composables/admin/useBusinessRules.ts` | P1 | 21 | 1 | 0 | 0 | 0 | 5 | 6 | 10 | 0 | 0 |
| `src/composables/admin/useRelationshipCollectionData.ts` | P1 | 18 | 1 | 0 | 0 | 17 | 0 | 0 | 0 | 0 | 0 |
| `src/composables/admin/useInstanceGrouping.ts` | P2 | 14 | 1 | 0 | 1 | 6 | 0 | 0 | 0 | 0 | 0 |
| `src/composables/useRelationship.ts` | P2 | 19 | 0 | 5 | 0 | 1 | 0 | 6 | 7 | 0 | 0 |
| `src/composables/admin/useSelectHandlers.ts` | P2 | 12 | 1 | 0 | 0 | 1 | 1 | 3 | 3 | 0 | 0 |
| `src/composables/componentEntity/useComponentEntityActions.ts` | P2 | 20 | 1 | 6 | 0 | 0 | 0 | 4 | 6 | 0 | 0 |
| `src/composables/admin/useCalibrationChart.ts` | P2 | 14 | 1 | 0 | 0 | 5 | 3 | 0 | 0 | 0 | 0 |
| `src/composables/booking/dev/usePanelPosition.ts` | P2 | 11 | 1 | 0 | 1 | 0 | 2 | 1 | 1 | 6 | 0 |
| `src/composables/booking/useContactsValidation.ts` | P2 | 16 | 1 | 0 | 0 | 16 | 0 | 0 | 0 | 0 | 0 |
| `src/composables/admin/useSelectConfig.ts` | P2 | 14 | 1 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 |
| `src/composables/booking/useAppointmentDataCollection.ts` | P2 | 15 | 1 | 0 | 0 | 0 | 0 | 1 | 6 | 0 | 0 |
| `src/composables/booking/useAvailabilityOrchestrator.ts` | P2 | 15 | 1 | 0 | 5 | 9 | 0 | 0 | 0 | 0 | 0 |
| `src/composables/admin/useSelectFiltering.ts` | P2 | 7 | 1 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |
| `src/composables/booking/useWizardFilteredOptions.ts` | P2 | 14 | 1 | 0 | 0 | 14 | 0 | 0 | 0 | 0 | 0 |
| `src/composables/dev/useApiDevPanelData.ts` | P2 | 14 | 1 | 0 | 0 | 0 | 2 | 6 | 6 | 0 | 0 |
| `src/composables/useSelectOptions.ts` | P2 | 12 | 1 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |
| `src/composables/fieldContext/useFieldContextState.ts` | P2 | 15 | 0 | 3 | 0 | 8 | 3 | 0 | 0 | 0 | 0 |
| `src/composables/admin/useAvailabilitySettings.ts` | P2 | 12 | 1 | 0 | 1 | 0 | 2 | 2 | 2 | 0 | 0 |
| `src/composables/admin/useBlockInstanceForm.ts` | P2 | 9 | 1 | 0 | 0 | 3 | 1 | 2 | 2 | 0 | 0 |
| `src/composables/admin/usePartInstanceForm.ts` | P2 | 9 | 1 | 0 | 0 | 3 | 1 | 2 | 2 | 0 | 0 |
| `src/composables/booking/useMoveablePartsScheduling.ts` | P2 | 13 | 1 | 0 | 1 | 3 | 2 | 2 | 1 | 0 | 0 |
| `src/composables/admin/useInstanceDragAndDrop.ts` | P2 | 8 | 1 | 0 | 2 | 1 | 4 | 0 | 0 | 0 | 0 |
| `src/composables/admin/useSelectInputsAsync.ts` | P2 | 11 | 1 | 0 | 0 | 1 | 0 | 5 | 3 | 0 | 0 |
| `src/composables/booking/useAvailabilityLogic.ts` | P2 | 12 | 1 | 0 | 1 | 8 | 0 | 0 | 0 | 0 | 0 |
| `src/composables/booking/useElementDimensions.ts` | P2 | 8 | 1 | 0 | 0 | 0 | 0 | 1 | 1 | 6 | 0 |
| `src/composables/booking/useAppointmentLoader.ts` | P2 | 10 | 1 | 2 | 0 | 0 | 1 | 2 | 4 | 0 | 1 |
| `src/composables/admin/useDifferentialPerspectives.ts` | P2 | 10 | 1 | 0 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |

*...and 144 more files. See full report for details.*

## Notes

- This is a *signal* index; check the full report for suggestions and line-level matches.
- Full report: `client/.audit/composables-logic-audit.md`.
