**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Function Complexity Audit Summary (Generated)

Generated from `client/.audit-reports/function-complexity-audit.json`.

- Files with complex functions: **244**

## Top 30 files

| File | Priority | Score | Complex Fns | Worst Nesting | Worst Length |
| --- | --- | ---: | ---: | ---: | ---: |
| `server/src/routes/helpers/crudRouteHandlers.ts` | P0 | 27 | 4 | 8 | 67 |
| `server/src/services/invites/inviteOrchestrationService.ts` | P0 | 19 | 3 | 7 | 83 |
| `server/src/services/google/maps/placesApiService.ts` | P0 | 18 | 3 | 8 | 43 |
| `server/src/services/google/maps/routesApiService.ts` | P0 | 18 | 2 | 12 | 92 |
| `client/src/composables/useRelationship.ts` | P0 | 17 | 2 | 11 | 116 |
| `server/src/services/slotComputationService.ts` | P0 | 17 | 3 | 5 | 81 |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | P0 | 15 | 2 | 17 | 159 |
| `client/src/utils/admin/selectTypeResolver.ts` | P0 | 15 | 3 | 9 | 26 |
| `client/src/utils/forms/fieldLocationDispatcher.ts` | P0 | 15 | 3 | 15 | 75 |
| `server/src/services/appointmentCalendarService.ts` | P0 | 15 | 2 | 10 | 81 |
| `server/src/services/brightMls/brightMlsApiClient.ts` | P0 | 15 | 2 | 13 | 81 |
| `client/src/components/admin/generic/EntityCardSubPanels.vue` | P0 | 13 | 2 | 7 | 18 |
| `client/src/utils/booking/perspectiveResolver.ts` | P0 | 13 | 2 | 9 | 39 |
| `client/src/utils/booking/timeSlotMatching.ts` | P0 | 13 | 2 | 9 | 29 |
| `client/src/utils/logger.ts` | P0 | 13 | 3 | 11 | 40 |
| `server/src/routes/internal/appointments/appointmentHelpers.ts` | P0 | 13 | 2 | 7 | 50 |
| `server/src/services/propertyFeatureMatcher.ts` | P0 | 13 | 2 | 9 | 35 |
| `server/src/utils/logger.ts` | P0 | 13 | 3 | 11 | 42 |
| `client/src/composables/booking/useContactsStepData.ts` | P0 | 12 | 2 | 12 | 57 |
| `client/src/utils/booking/cascadeFilterPipeline.ts` | P0 | 12 | 3 | 6 | 53 |
| `client/src/components/admin/generic/fields/BooleanInput.vue` | P1 | 10 | 1 | 19 | 63 |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | P1 | 10 | 2 | 9 | 29 |
| `client/src/components/booking/plugins/wizardStatePlugin.ts` | P1 | 10 | 1 | 18 | 93 |
| `client/src/components/common/AddressAutocomplete.vue` | P1 | 10 | 2 | 6 | 32 |
| `client/src/composables/admin/tables/useAppointmentsTableModel.ts` | P1 | 10 | 1 | 8 | 106 |
| `client/src/composables/admin/useAvailabilitySettings.ts` | P1 | 10 | 1 | 43 | 271 |
| `client/src/composables/admin/useBufferSettings.ts` | P1 | 10 | 2 | 5 | 28 |
| `client/src/composables/admin/useBusinessRuleForm.ts` | P1 | 10 | 1 | 10 | 161 |
| `client/src/composables/admin/useBusinessRules.ts` | P1 | 10 | 1 | 7 | 171 |
| `client/src/composables/admin/useCalendarEntries.ts` | P1 | 10 | 1 | 30 | 173 |

*...and 214 more. See full report.*
