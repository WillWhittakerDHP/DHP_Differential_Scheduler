**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# TODO Aging Audit Summary (Generated)

Generated from `client/.audit-reports/todo-aging-audit.json`.

- Total markers: **27**
- Ancient: **25** | Stale: **0** | Aging: **0** | Fresh: **2** | Orphaned: **27**

## Top 15 files

| File | Priority | Score | Total | Ancient | Stale | Orphaned |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `server/src/middlewares/security.ts` | P0 | 42 | 6 | 6 | 0 | 6 |
| `client/src/composables/admin/useSelectFiltering.ts` | P0 | 28 | 4 | 4 | 0 | 4 |
| `client/src/utils/booking/confirmationStepData.ts` | P0 | 21 | 3 | 3 | 0 | 3 |
| `client/src/utils/booking/PartFinal.ts` | P0 | 21 | 3 | 3 | 0 | 3 |
| `client/src/components/admin/generic/DynamicForm.vue` | P1 | 7 | 1 | 1 | 0 | 1 |
| `client/src/components/admin/generic/EntityFormContent.vue` | P1 | 7 | 1 | 1 | 0 | 1 |
| `client/src/components/admin/generic/fields/BooleanInput.vue` | P1 | 7 | 1 | 1 | 0 | 1 |
| `client/src/composables/booking/useAvailabilityDefaults.ts` | P1 | 7 | 1 | 1 | 0 | 1 |
| `client/src/composables/booking/useDevPanelsComputed.ts` | P1 | 7 | 1 | 1 | 0 | 1 |
| `client/src/composables/useFormValidation.ts` | P1 | 7 | 1 | 1 | 0 | 1 |
| `client/src/views/admin/tabs/components/OverlapConstraintsPanel.vue` | P1 | 7 | 1 | 1 | 0 | 1 |
| `client/src/views/admin/tabs/components/RangeConstraintsPanel.vue` | P1 | 7 | 1 | 1 | 0 | 1 |
| `server/src/scripts/helpers/calendarParsingHelpers.ts` | P1 | 7 | 1 | 1 | 0 | 1 |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | P2 | 2 | 1 | 0 | 0 | 1 |
| `client/src/composables/admin/useInputConfigEditor.ts` | P2 | 2 | 1 | 0 | 0 | 1 |
