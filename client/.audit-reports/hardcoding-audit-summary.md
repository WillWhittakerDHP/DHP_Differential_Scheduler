**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Hardcoding Audit Summary (Generated)

Generated from `client/.audit-reports/hardcoding-audit.json`.

## Context

- Entity keys: (none detected)

## Top 27 files (ranked)

| File | Priority | score | switch(entityKey) | entityKey strings | case | field===string | omitFields | headers | label maps |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `client/src/utils/booking/appointmentDataBuilders.ts` | P1 | 15 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/scripts/importCalendarData.ts` | P2 | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `client/src/composables/booking/useTimeSlotCalculations.ts` | P2 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/utils/booking/perspectiveResolver.ts` | P2 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/utils/differentialScheduling.ts` | P2 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/services/invites/inviteOrchestrationService.ts` | P2 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/booking/SelectionCard.vue` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/composables/admin/useInstanceBulkEdit.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/composables/booking/useKeyboardToggle.ts` | P2 | 3 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| `client/src/composables/layout/useNavSearch.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/configs/availabilitySettings.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/utils/booking/availabilityStepData.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/utils/booking/partFinalizer.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/utils/logger.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/utils/transformers/globalToAdminTransformer.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/views/admin/tabs/components/FeeCalibrationPanel.vue` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/routes/internal/beta-feedback/betaFeedbackCrudRouter.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/routes/internal/businessSettings/businessSettingsCrudRouter.ts` | P2 | 3 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| `server/src/scripts/helpers/calendarImportHelpers.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/services/appointmentCalendarService.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/services/rateLimiter.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/services/slotComputationService.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/utils/logger.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/db/models/booking/event_instance.ts` | P2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `client/src/composables/admin/useBusinessRuleForm.ts` | P2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/routes/internal/properties/propertyValidators.ts` | P2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/services/propertyFeatureMatcher.ts` | P2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## Notes

- This is a *signal* index. Use the full report: `client/.audit-reports/hardcoding-audit.md`.
