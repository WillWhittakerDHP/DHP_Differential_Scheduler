**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Bundle Size Budget Audit (Generated)

Generated at: 2026-02-23T21:42:53.000Z
Build timestamp: 2026-02-23T17:23:45.993Z

## Summary

- Chunks scanned: **21**
- Total JS (gzip): **393.7 KB**
- Total CSS (gzip): **91.8 KB**
- Largest chunk: **109.5 KB**
- Entry point: **28.6 KB**

## Budgets

| Budget | Limit (KB) | Actual (KB) | Pass | % of budget |
| --- | ---: | ---: | --- | ---: |
| totalJsKb | 800 | 393.7 | Yes | 49% |
| totalCssKb | 200 | 91.8 | Yes | 46% |
| largestChunkKb | 250 | 109.5 | Yes | 44% |
| entryPointKb | 150 | 28.6 | Yes | 19% |

## Chunks

| File | Type | Size (KB) | Gzip (KB) | Entry |
| --- | --- | ---: | ---: | --- |
| `assets/AdminPanel-B_LZhKf4.css` | css | 35.4 | 6.3 |  |
| `assets/AdminPanel-DLQF0qiJ.js` | js | 423.7 | 109.3 |  |
| `assets/BetaFeedbackView-Bv8zFrvO.js` | js | 10.2 | 3.0 |  |
| `assets/BetaFeedbackView-X1676Je3.css` | css | 0.1 | 0.1 |  |
| `assets/BookingWizardView-8JiL63Qa.css` | css | 22.0 | 3.9 |  |
| `assets/BookingWizardView-BjvgfNg8.js` | js | 167.3 | 46.1 |  |
| `assets/EntityCard-B6JWAjvk.js` | js | 0.4 | 0.2 |  |
| `assets/axios-C0Zqfgkc.js` | js | 35.8 | 14.3 |  |
| `assets/dependencyCleanup-rF8Rl5Jb.js` | js | 0.6 | 0.4 |  |
| `assets/index-B1IH1aXA.css` | css | 126.3 | 14.9 |  |
| `assets/index-DdNYZZGA.js` | js | 97.8 | 28.6 | Yes |
| `assets/pinia-B5X-hN8x.js` | js | 3.7 | 1.8 |  |
| `assets/timeFormatting-I7Ly4XHi.js` | js | 37.7 | 13.6 |  |
| `assets/useBetaFeedback-tl9cCPdS.js` | js | 0.7 | 0.4 |  |
| `assets/vee-validate-CAZXNrDj.js` | js | 27.9 | 10.1 |  |
| `assets/vue-JsoSmu5X.js` | js | 77.8 | 30.8 |  |
| `assets/vue-query-Bwll3ySA.js` | js | 37.0 | 10.9 |  |
| `assets/vue-router-BAniQuVs.js` | js | 24.9 | 9.8 |  |
| `assets/vuetify-CA15CqLa.css` | css | 514.6 | 66.6 |  |
| `assets/vuetify-DxIkWGut.js` | js | 349.7 | 109.5 |  |
| `assets/vueuse-BcYULufa.js` | js | 11.6 | 5.0 |  |
