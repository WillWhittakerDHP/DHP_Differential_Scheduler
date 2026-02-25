**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Test Audit Summary (Generated)

Generated from `client/.audit-reports/test-audit.json`.

## Quick Stats

- Coverage: **0%**
- Untested source files: **1057**
- Orphaned test files: **0**

## Top 20 untested files (with exports)

| File | Priority | Score | Reliability | ROI | Exports |
| --- | --- | ---: | ---: | ---: | ---: |
| `client/src/utils/transformers/appointmentToWizardHelpers.ts` | 9.1 | 9.1 | 10 | 10 | 6 |
| `client/src/utils/transformers/fieldClassification.ts` | 8.9 | 8.9 | 10 | 10 | 2 |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | 8.4 | 8.4 | 10 | 8 | 1 |
| `client/src/utils/transformers/transformerPrimitives.ts` | 8.4 | 8.4 | 8 | 10 | 9 |
| `client/src/composables/booking/useAvailabilityStepHandlers.ts` | 8.1 | 8.1 | 10 | 7 | 2 |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | 8.1 | 8.1 | 10 | 9 | 5 |
| `client/src/utils/transformers/relationshipTransformers.ts` | 8 | 8 | 10 | 10 | 5 |
| `client/src/composables/booking/useWizardValidationErrors.ts` | 7.8 | 7.8 | 9 | 7 | 2 |
| `client/src/utils/transformers/componentAggregator.ts` | 7.8 | 7.8 | 10 | 10 | 2 |
| `client/src/composables/booking/useAvailabilityEmptyState.ts` | 7.7 | 7.7 | 10 | 7 | 2 |
| `client/src/composables/booking/useWizardFilteredOptions.ts` | 7.7 | 7.7 | 10 | 7 | 2 |
| `client/src/composables/booking/useWizardStepValidation.ts` | 7.7 | 7.7 | 9 | 7 | 2 |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | 7.7 | 7.7 | 10 | 8 | 1 |
| `client/src/composables/booking/useAvailabilityLogic.ts` | 7.6 | 7.6 | 10 | 7 | 2 |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | 7.6 | 7.6 | 10 | 8 | 1 |
| `client/src/composables/booking/useAppointmentDataCollection.ts` | 7.5 | 7.5 | 9 | 7 | 2 |
| `client/src/composables/booking/useAvailabilityDefaults.ts` | 7.5 | 7.5 | 10 | 7 | 2 |
| `client/src/composables/booking/useDevPanelsComputed.ts` | 7.5 | 7.5 | 10 | 7 | 2 |
| `client/src/composables/booking/useTimeSlotCalculations.ts` | 7.5 | 7.5 | 10 | 7 | 2 |
| `client/src/composables/booking/useAvailabilityDevPanel.ts` | 7.4 | 7.4 | 9 | 8 | 4 |

Full report: `client/.audit-reports/test-audit.md`.
