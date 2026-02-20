**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# File Cohesion Audit Summary (Generated)

Generated from `client/.audit-reports/file-cohesion-audit.json`.

- Files with violations: **159**

## Top 30 files

| File | Category | Priority | Score | Lines | Exports | Violations |
| --- | --- | --- | ---: | ---: | ---: | --- |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | components | P1 | 9 | 0 | 0 | oversized |
| `server/src/scripts/importCalendarData.ts` | general | P1 | 7 | 0 | 0 | oversized, no-exports |
| `client/src/configs/field/display/selectableDisplayConfig.ts` | general | P1 | 6 | 0 | 0 | oversized |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | utils | P1 | 6 | 0 | 0 | oversized |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | utils | P1 | 6 | 0 | 0 | oversized |
| `server/src/services/slotComputationService.ts` | services | P1 | 6 | 0 | 0 | oversized |
| `client/src/constants/apiStatus.ts` | general | P1 | 4 | 0 | 0 | high-exports |
| `client/src/constants/fieldMetadata.ts` | general | P1 | 4 | 0 | 0 | high-exports |
| `client/src/composables/admin/useSelectConfig.ts` | composables | P2 | 3 | 0 | 0 | oversized |
| `client/src/composables/admin/useSelectFiltering.ts` | composables | P2 | 3 | 0 | 0 | oversized |
| `client/src/composables/booking/useAvailabilityLogic.ts` | composables | P2 | 3 | 0 | 0 | oversized |
| `client/src/composables/entityCrud/useEntityCrudMutations.ts` | composables | P2 | 3 | 0 | 0 | oversized |
| `client/src/utils/booking/partFinalizer.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `client/src/utils/tablerIcons.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `client/src/utils/transformers/appointmentToWizardHelpers.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | components | P2 | 3 | 0 | 0 | oversized |
| `server/src/routes/helpers/crudRouteHandlers.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `server/src/scripts/helpers/calendarParsingHelpers.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `server/src/services/computedAvailabilityService.ts` | services | P2 | 3 | 0 | 0 | oversized |
| `server/src/utils/availabilities/availabiltiesDbUtils.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `client/src/composables/admin/useEntityCardReadiness.ts` | composables | P2 | 2 | 0 | 0 | no-exports, pureHelperInComposables |
| `client/src/composables/booking/useSelectionCard.ts` | composables | P2 | 2 | 0 | 0 | no-exports, pureHelperInComposables |
| `client/src/composables/booking/useSelectionCardComponent.ts` | composables | P2 | 2 | 0 | 0 | no-exports, pureHelperInComposables |
| `client/src/composables/booking/useSelectionCardConfig.ts` | composables | P2 | 2 | 0 | 0 | no-exports, pureHelperInComposables |
| `client/src/composables/booking/useSelectionCardGroupState.ts` | composables | P2 | 2 | 0 | 0 | no-exports, pureHelperInComposables |
| `client/src/composables/booking/useSelectionCardHandlers.ts` | composables | P2 | 2 | 0 | 0 | no-exports, pureHelperInComposables |
| `client/src/composables/booking/useSelectionCardState.ts` | composables | P2 | 2 | 0 | 0 | no-exports, pureHelperInComposables |
| `client/src/composables/booking/useSelectionCardStyles.ts` | composables | P2 | 2 | 0 | 0 | no-exports, pureHelperInComposables |
| `client/src/composables/useFormFields.ts` | composables | P2 | 2 | 0 | 0 | no-exports, pureHelperInComposables |

*...and 129 more. See full report.*
