**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Bundle Size Budget Audit Summary (Generated)

Generated from `client/.audit-reports/bundle-size-budget-audit.json`.

- Chunks: **22**
- Total JS (gzip): **388.5 KB**
- Total CSS (gzip): **91.5 KB**
- Budget violations: **0**

| Budget | Limit (KB) | Actual (KB) | Pass |
| --- | ---: | ---: | --- |
| totalJsKb | 800 | 388.5 | Yes |
| totalCssKb | 200 | 91.5 | Yes |
| largestChunkKb | 250 | 106.7 | Yes |
| entryPointKb | 150 | 28.6 | Yes |
