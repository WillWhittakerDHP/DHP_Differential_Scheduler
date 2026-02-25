**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Bundle Size Budget Audit Summary (Generated)

Generated from `client/.audit-reports/bundle-size-budget-audit.json`.

- Chunks: **55**
- Total JS (gzip): **410.2 KB**
- Total CSS (gzip): **93.4 KB**
- Budget violations: **0**

| Budget | Limit (KB) | Actual (KB) | Pass |
| --- | ---: | ---: | --- |
| totalJsKb | 800 | 410.1 | Yes |
| totalCssKb | 200 | 93.4 | Yes |
| largestChunkKb | 250 | 108.4 | Yes |
| entryPointKb | 150 | 0.0 | Yes |
