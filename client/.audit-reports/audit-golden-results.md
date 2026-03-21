**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Audit Golden Sample Results

Generated: 2026-02-23T18:03:16.400Z

## Summary

| Passed | Failed | Skipped |
| ---: | ---: | ---: |
| 5 | 1 | 0 |

## Per rule

| Audit | Rule | Status | TP det | TP total | FP det | Precision | Recall |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| error-handling | catch-without-logger | passed | 1 | 1 | 0 | 1 | 1 |
| error-handling | empty-catch | passed | 1 | 1 | 0 | 1 | 1 |
| type-escape | as-any | passed | 2 | 2 | 0 | 1 | 1 |
| type-escape | as-unknown-as | passed | 1 | 1 | 0 | 1 | 1 |
| type-escape | ts-ignore | failed | 0 | 1 | 0 | 1 | 0 |
| type-import | type-used-as-value | passed | 1 | 1 | 0 | 1 | 1 |
