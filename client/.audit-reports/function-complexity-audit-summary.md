**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Function Complexity Audit Summary (Generated)

Generated from `client/.audit-reports/function-complexity-audit.json`.

- Files with complex functions: **247**

## Top 30 files

| File | Priority | Score | Complex Fns | Worst Nesting | Worst Length |
| --- | --- | ---: | ---: | ---: | ---: |
| `server/src/routes/helpers/crudRouteHandlers.ts` | P0 | 27 | 4 | 8 | 67 |
| `server/src/services/invites/inviteOrchestrationService.ts` | P0 | 19 | 3 | 7 | 83 |
| `server/src/services/google/maps/placesApiService.ts` | P0 | 18 | 3 | 8 | 43 |
| `server/src/services/google/maps/routesApiService.ts` | P0 | 18 | 2 | 12 | 92 |
| `client/src/composables/useRelationship.ts` | P0 | 17 | 2 | 11 | 116 |
| `server/src/services/slotComputationService.ts` | P0 | 17 | 3 | 5 | 81 |
| `client/src/composables/admin/useCalendarEntries.ts` | P0 | 15 | 2 | 25 | 143 |
| `client/src/utils/admin/selectTypeResolver.ts` | P0 | 15 | 3 | 9 | 26 |
| `client/src/utils/forms/fieldLocationDispatcher.ts` | P0 | 15 | 3 | 15 | 75 |
| `server/src/routes/internal/appointments/appointmentCrudRouter.ts` | P0 | 15 | 3 | 6 | 19 |
| `server/src/services/appointmentCalendarService.ts` | P0 | 15 | 2 | 10 | 80 |
| `server/src/services/brightMls/brightMlsApiClient.ts` | P0 | 15 | 2 | 13 | 81 |
| `client/src/composables/admin/useFormElementPatching.ts` | P0 | 13 | 2 | 13 | 42 |
| `server/src/routes/internal/appointments/appointmentHelpers.ts` | P0 | 13 | 2 | 7 | 50 |
| `server/src/services/propertyFeatureMatcher.ts` | P0 | 13 | 2 | 9 | 34 |
| `client/src/composables/booking/useContactsStepData.ts` | P0 | 12 | 2 | 12 | 57 |
| `client/src/utils/booking/cascadeFilterPipeline.ts` | P0 | 12 | 3 | 6 | 53 |
| `client/src/components/booking/plugins/wizardStatePlugin.ts` | P1 | 10 | 1 | 18 | 93 |
| `client/src/composables/admin/tables/useAppointmentsTableModel.ts` | P1 | 10 | 1 | 8 | 106 |
| `client/src/composables/admin/useAdminAvailabilitySettings.ts` | P1 | 10 | 1 | 13 | 117 |
| `client/src/composables/admin/useBufferSettings.ts` | P1 | 10 | 2 | 5 | 28 |
| `client/src/composables/admin/useBusinessControlsFormState.ts` | P1 | 10 | 1 | 8 | 111 |
| `client/src/composables/admin/useBusinessRuleForm.ts` | P1 | 10 | 1 | 10 | 159 |
| `client/src/composables/admin/useBusinessRulesTab.ts` | P1 | 10 | 1 | 8 | 133 |
| `client/src/composables/admin/useCalendarHoldFormState.ts` | P1 | 10 | 1 | 16 | 135 |
| `client/src/composables/admin/useCapacitySettings.ts` | P1 | 10 | 2 | 6 | 31 |
| `client/src/composables/admin/useDragAndDropHelpers.ts` | P1 | 10 | 2 | 6 | 26 |
| `client/src/composables/admin/useEntityCardActions.ts` | P1 | 10 | 1 | 8 | 127 |
| `client/src/composables/admin/useEntityCardStoreSync.ts` | P1 | 10 | 1 | 16 | 78 |
| `client/src/composables/admin/useEntityCardSubPanels.ts` | P1 | 10 | 1 | 27 | 128 |

