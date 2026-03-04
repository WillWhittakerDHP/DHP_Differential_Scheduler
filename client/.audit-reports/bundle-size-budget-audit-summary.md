**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Bundle Size Budget Audit Summary (Generated)

Generated from `client/.audit-reports/bundle-size-budget-audit.json`.

- Chunks: **57**
- Total JS (gzip): **417.0 KB**
- Total CSS (gzip): **115.1 KB**
- Budget violations: **0**

| Budget | Limit (KB) | Actual (KB) | Pass |
| --- | ---: | ---: | --- |
| totalJsKb | 800 | 417.0 | Yes |
| totalCssKb | 200 | 115.1 | Yes |
| largestChunkKb | 250 | 109.5 | Yes |
| entryPointKb | 150 | 0.0 | Yes |
