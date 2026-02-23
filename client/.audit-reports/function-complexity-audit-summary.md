**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Function Complexity Audit Summary (Generated)

Generated from `client/.audit-reports/function-complexity-audit.json`.

- Files with complex functions: **256**

## Top 30 files

| File | Priority | Score | Complex Fns | Worst Nesting | Worst Length |
| --- | --- | ---: | ---: | ---: | ---: |
| `server/src/routes/helpers/crudRouteHandlers.ts` | P0 | 30 | 4 | 11 | 57 |
| `client/src/components/common/AddressAutocomplete.vue` | P0 | 18 | 3 | 9 | 39 |
| `server/src/services/google/maps/placesApiService.ts` | P0 | 18 | 3 | 8 | 43 |
| `server/src/services/google/maps/routesApiService.ts` | P0 | 18 | 2 | 12 | 97 |
| `server/src/services/propertyFeatureMatcher.ts` | P0 | 18 | 3 | 9 | 34 |
| `server/src/services/slotComputationService.ts` | P0 | 17 | 3 | 5 | 81 |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | P0 | 15 | 2 | 15 | 164 |
| `client/src/utils/booking/constraintColors.ts` | P0 | 15 | 2 | 10 | 61 |
| `client/src/utils/forms/fieldLocationDispatcher.ts` | P0 | 15 | 3 | 15 | 82 |
| `server/src/routes/internal/appointments/appointmentHelpers.ts` | P0 | 15 | 2 | 8 | 55 |
| `server/src/routes/internal/properties/propertyValidators.ts` | P0 | 15 | 2 | 12 | 71 |
| `server/src/services/appointmentCalendarService.ts` | P0 | 15 | 2 | 11 | 86 |
| `server/src/services/brightMls/brightMlsApiClient.ts` | P0 | 15 | 2 | 14 | 82 |
| `client/src/components/admin/generic/EntityCardSubPanels.vue` | P0 | 13 | 2 | 7 | 18 |
| `client/src/services/mapsApiService.ts` | P0 | 13 | 2 | 10 | 49 |
| `client/src/utils/booking/partFinalizer.ts` | P0 | 13 | 2 | 11 | 42 |
| `client/src/utils/booking/timeSlotMatching.ts` | P0 | 13 | 2 | 9 | 29 |
| `client/src/composables/booking/useContactsStepData.ts` | P0 | 12 | 2 | 12 | 57 |
| `client/src/main.ts` | P0 | 12 | 2 | 7 | 52 |
| `client/src/utils/booking/cascadeFilterPipeline.ts` | P0 | 12 | 3 | 6 | 53 |
| `client/src/components/admin/generic/EntityCard.vue` | P1 | 10 | 2 | 6 | 47 |
| `client/src/components/admin/generic/fields/BooleanInput.vue` | P1 | 10 | 1 | 19 | 63 |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | P1 | 10 | 2 | 9 | 29 |
| `client/src/components/booking/plugins/wizardStatePlugin.ts` | P1 | 10 | 1 | 18 | 92 |
| `client/src/composables/admin/tables/useAppointmentsTableModel.ts` | P1 | 10 | 1 | 9 | 111 |
| `client/src/composables/admin/useAttendeeQuickSelect.ts` | P1 | 10 | 1 | 10 | 116 |
| `client/src/composables/admin/useAvailabilitySettings.ts` | P1 | 10 | 1 | 50 | 299 |
| `client/src/composables/admin/useBufferSettings.ts` | P1 | 10 | 2 | 5 | 28 |
| `client/src/composables/admin/useBusinessRuleForm.ts` | P1 | 10 | 1 | 10 | 159 |
| `client/src/composables/admin/useBusinessRules.ts` | P1 | 10 | 1 | 14 | 182 |

