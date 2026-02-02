# Error Logging Audit Summary (Generated)

Generated from `.audit-reports/error-logging-audit.json`.

## Context

- **Status**: warning
- **Total Issues**: 148
- **Files with Issues**: 38
- **P0 (Silent Catches)**: 0
- **P1 (Console in Catches)**: 0
- **P2 (All Console)**: 148

## Full index (ranked by priority)

| File | Priority | Score | P0 Issues | P1 Issues | P2 Issues |
| --- | --- | ---: | ---: | ---: | ---: |
| `client/src/components/admin/generic/collections/RelationshipCollection.vue` | P2 | 1 | 0 | 0 | 1 |
| `client/src/components/admin/generic/fields/FieldRenderer.vue` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/admin/useFieldComponent.ts` | P2 | 3 | 0 | 0 | 3 |
| `client/src/composables/admin/usePartsTotals.ts` | P2 | 2 | 0 | 0 | 2 |
| `client/src/composables/admin/useStatusButtonValue.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/booking/useFreeBusyDataSource.ts` | P2 | 2 | 0 | 0 | 2 |
| `client/src/composables/booking/usePropertyDetailsLogic.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/booking/useWizardFilteredOptions.ts` | P2 | 4 | 0 | 0 | 4 |
| `client/src/composables/entityCrud/usePrimitiveMutation.ts` | P2 | 3 | 0 | 0 | 3 |
| `client/src/composables/fieldContext/useFieldContextState.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/composables/formFields/useFormFieldsContext.ts` | P2 | 4 | 0 | 0 | 4 |
| `client/src/composables/useRelationship.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/utils/blockInstanceUtils.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/utils/booking/mockGoogleCalendar.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/utils/booking/partFinalizer.ts` | P2 | 1 | 0 | 0 | 1 |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | P1 | 5 | 0 | 0 | 5 |
| `client/src/utils/transformers/componentAggregator.ts` | P2 | 1 | 0 | 0 | 1 |
| `server/src/app.ts` | P0 | 12 | 0 | 0 | 12 |
| `server/src/config/app.ts` | P1 | 6 | 0 | 0 | 6 |
| `server/src/config/entityRegistry.ts` | P2 | 2 | 0 | 0 | 2 |
| `server/src/config/googleOAuth.ts` | P1 | 9 | 0 | 0 | 9 |
| `server/src/index.ts` | P2 | 3 | 0 | 0 | 3 |
| `server/src/routes/external/googleFetchRoutes.ts` | P2 | 2 | 0 | 0 | 2 |
| `server/src/routes/external/googleOauthRoutes.ts` | P2 | 1 | 0 | 0 | 1 |
| `server/src/routes/helpers/dataController.ts` | P2 | 1 | 0 | 0 | 1 |
| `server/src/routes/internal/admin-metadata/adminMetadataRouter.ts` | P2 | 4 | 0 | 0 | 4 |
| `server/src/routes/internal/appointments/appointmentRouter.ts` | P1 | 9 | 0 | 0 | 9 |
| `server/src/routes/internal/entities/entityRouter.ts` | P2 | 2 | 0 | 0 | 2 |
| `server/src/routes/internal/properties/propertyRouter.ts` | P2 | 1 | 0 | 0 | 1 |
| `server/src/routes/internal/relationships/relationshipRouter.ts` | P2 | 4 | 0 | 0 | 4 |
| `server/src/services/appointmentCalendarService.ts` | P1 | 9 | 0 | 0 | 9 |
| `server/src/services/appointmentSnapshotLoader.ts` | P2 | 2 | 0 | 0 | 2 |
| `server/src/services/calendarErrorHandler.ts` | P2 | 4 | 0 | 0 | 4 |
| `server/src/services/driveTimeCache.ts` | P2 | 3 | 0 | 0 | 3 |
| `server/src/services/googleCalendarService.ts` | P0 | 13 | 0 | 0 | 13 |
| `server/src/services/googleMapsService.ts` | P0 | 23 | 0 | 0 | 23 |
| `server/src/test/setup/seedTestData.ts` | P2 | 1 | 0 | 0 | 1 |
| `server/src/utils/userTypeMapping.ts` | P2 | 4 | 0 | 0 | 4 |

## Notes

- **P0**: Silent/empty catch blocks - bugs hide here, must fix
- **P1**: Console usage in catch blocks - inconsistent error handling
- **P2**: All other console.* in production code - should use logger for control
- **P3**: Console in migrations/scripts/tests - acceptable, no action needed

- This is a *signal* index. Use the full report for line-level matches and suggestions: `client/.audit-reports/error-logging-audit.md`.
