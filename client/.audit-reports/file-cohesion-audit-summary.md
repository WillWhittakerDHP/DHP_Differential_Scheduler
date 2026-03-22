**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# File Cohesion Audit Summary (Generated)

Generated from `client/.audit-reports/file-cohesion-audit.json`.

- Files with violations: **15**

## Top 15 files

| File | Category | Priority | Score | Lines | Exports | Violations |
| --- | --- | --- | ---: | ---: | ---: | --- |
| `client/src/composables/booking/injectionKeys.ts` | composables | P0 | 28 | 0 | 0 | high-exports, pureHelperInComposables |
| `server/src/routes/internal/appointments/appointmentHelpers.ts` | routes | P1 | 8 | 0 | 0 | high-exports |
| `client/src/configs/field/display/selectableDisplayConfig.ts` | general | P1 | 6 | 0 | 0 | oversized |
| `client/src/constants/apiStatus.ts` | general | P1 | 4 | 0 | 0 | high-exports |
| `client/src/constants/fieldMetadata.ts` | general | P1 | 4 | 0 | 0 | high-exports |
| `client/src/utils/entities/entityTypeMapping.ts` | utils | P1 | 4 | 0 | 0 | high-exports |
| `client/src/utils/booking/confirmationStepData.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `client/src/utils/tablerIcons.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `client/src/views/admin/tabs/ShapesTab.vue` | components | P2 | 3 | 0 | 0 | oversized |
| `server/src/services/computedAvailabilityService.ts` | services | P2 | 3 | 0 | 0 | oversized |
| `server/src/utils/availabilities/availabiltiesDbUtils.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `client/src/components/admin/generic/entityCardConstants.ts` | components | P2 | 2 | 0 | 0 | high-exports |
| `client/src/constants/entities.ts` | general | P2 | 2 | 0 | 0 | high-exports |
| `client/src/types/wizard.ts` | general | P2 | 2 | 0 | 0 | high-exports |
