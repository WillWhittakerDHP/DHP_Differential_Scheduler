**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Function Complexity Audit Summary (Generated)

Generated from `client/.audit-reports/function-complexity-audit.json`.

- Files with complex functions: **3**

## Top 3 files

| File | Priority | Score | Complex Fns | Worst Nesting | Worst Length |
| --- | --- | ---: | ---: | ---: | ---: |
| `client/src/composables/booking/useMoveableAvailabilityData.ts` | P1 | 7 | 1 | 4 | 129 |
| `client/src/composables/admin/tables/useAppointmentsTableModel.ts` | P1 | 5 | 1 | 3 | 124 |
| `client/src/composables/admin/usePropertyCreateForm.ts` | P1 | 5 | 1 | 3 | 65 |
