**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Error Handling Audit Summary (Generated)

Generated from `client/.audit-reports/error-handling-audit.json`.

- Requiring review: **0**
- Allowed exceptions: **45**

## Top 0 files (ranked by score)

| File | Priority | Score | P0 | P1 | P2 |
| --- | --- | ---: | ---: | ---: | ---: |

## Notes

- **P0**: Silent error swallowing (empty catch, silent .catch()).
- **P1**: Console in catch, type suppressions (@ts-ignore, as any).
- **P2**: General console usage.
