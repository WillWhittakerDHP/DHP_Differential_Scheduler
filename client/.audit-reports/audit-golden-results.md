**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Audit Golden Sample Results

Generated: 2026-02-23T16:50:13.622Z

## Summary

| Passed | Failed | Skipped |
| ---: | ---: | ---: |
| 3 | 1 | 0 |

## Per rule

| Audit | Rule | Status | TP det | TP total | FP det | Precision | Recall |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| error-handling | empty-catch | failed | 0 | 1 | 0 | 1 | 0 |
| type-escape | as-any | passed | 1 | 1 | 0 | 1 | 1 |
| type-escape | ts-ignore | passed | 1 | 1 | 0 | 1 | 1 |
| type-import | type-used-as-value | passed | 1 | 1 | 0 | 1 | 1 |
