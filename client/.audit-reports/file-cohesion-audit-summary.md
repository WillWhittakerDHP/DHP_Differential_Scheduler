**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# File Cohesion Audit Summary (Generated)

Generated from `client/.audit-reports/file-cohesion-audit.json`.

- Files with violations: **18**

## Top 18 files

| File | Category | Priority | Score | Lines | Exports | Violations |
| --- | --- | --- | ---: | ---: | ---: | --- |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | components | P1 | 9 | 0 | 0 | oversized |
| `client/src/configs/field/display/selectableDisplayConfig.ts` | general | P1 | 6 | 0 | 0 | oversized |
| `client/src/utils/booking/appointmentDataBuilders.ts` | utils | P1 | 6 | 0 | 0 | high-exports |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | utils | P1 | 6 | 0 | 0 | oversized |
| `server/src/services/invites/inviteOrchestrationService.ts` | services | P1 | 6 | 0 | 0 | oversized |
| `server/src/services/slotComputationService.ts` | services | P1 | 6 | 0 | 0 | oversized |
| `client/src/constants/apiStatus.ts` | general | P1 | 4 | 0 | 0 | high-exports |
| `client/src/constants/fieldMetadata.ts` | general | P1 | 4 | 0 | 0 | high-exports |
| `client/src/composables/admin/useSelectFiltering.ts` | composables | P2 | 3 | 0 | 0 | oversized |
| `client/src/utils/tablerIcons.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | components | P2 | 3 | 0 | 0 | oversized |
| `server/src/services/computedAvailabilityService.ts` | services | P2 | 3 | 0 | 0 | oversized |
| `server/src/utils/availabilities/availabiltiesDbUtils.ts` | utils | P2 | 3 | 0 | 0 | oversized |
| `client/src/configs/availabilitySettings.ts` | general | P2 | 2 | 0 | 0 | high-exports |
| `client/src/constants/entities.ts` | general | P2 | 2 | 0 | 0 | high-exports |
| `client/src/types/entities.ts` | general | P2 | 2 | 0 | 0 | high-exports |
| `client/src/utils/entities/entityTypeMapping.ts` | utils | P2 | 2 | 0 | 0 | high-exports |
