**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Hardcoding Audit Summary (Generated)

Generated from `client/.audit-reports/hardcoding-audit.json`.

## Context

- Entity keys: (none detected)

## Top 30 files (ranked)

| File | Priority | score | switch(entityKey) | entityKey strings | case | field===string | omitFields | headers | label maps |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `client/src/utils/booking/appointmentDataBuilders.ts` | P1 | 15 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/utils/booking/durationRounding.ts` | P1 | 12 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |
| `server/src/services/propertyFeatureMatcher.ts` | P1 | 12 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |
| `server/src/utils/availabilities/availabiltiesDbUtils.ts` | P1 | 12 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |
| `server/src/services/computedAvailabilityService.ts` | P2 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/services/google/maps/placesApiService.ts` | P2 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/scripts/importCalendarData.ts` | P2 | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `client/src/components/admin/generic/EntityCard.vue` | P2 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/admin/generic/StatusButton.vue` | P2 | 6 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |
| `client/src/components/booking/SelectionCard.vue` | P2 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/composables/admin/useFieldKeyboardGuard.ts` | P2 | 6 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |
| `client/src/composables/booking/useAvailabilityOrchestrator.ts` | P2 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/views/admin/tabs/components/FeeCalibrationPanel.vue` | P2 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/routes/internal/beta-feedback/betaFeedbackCrudRouter.ts` | P2 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/scripts/helpers/calendarParsingHelpers.ts` | P2 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/services/google/maps/mapsHelpers.ts` | P2 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/services/google/maps/routesApiService.ts` | P2 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `server/src/scripts/helpers/calendarImportHelpers.ts` | P2 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `client/src/components/admin/dev/ApiDevPanelComputedTab.vue` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/booking/dev/DevPanelToggle.vue` | P2 | 3 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| `client/src/components/booking/IndependentSelectCard.vue` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/composables/admin/useSelectConfig.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/composables/booking/useAppointmentShape.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/composables/booking/useComputedAvailability.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/composables/booking/useDateRangeDecider.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/layouts/components/NavSearchBar.vue` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/services/mapsApiService.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/services/propertyEnrichmentApiService.ts` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/utils/appointmentFieldFormatters.ts` | P2 | 3 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |


## Notes

- This is a *signal* index. Use the full report: `client/.audit-reports/hardcoding-audit.md`.
