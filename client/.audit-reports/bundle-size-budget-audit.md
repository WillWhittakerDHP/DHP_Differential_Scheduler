**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Bundle Size Budget Audit (Generated)

Generated at: 2026-02-20T16:44:12.089Z
Build timestamp: 2026-02-19T22:06:17.192Z

## Summary

- Chunks scanned: **22**
- Total JS (gzip): **388.5 KB**
- Total CSS (gzip): **91.5 KB**
- Largest chunk: **106.7 KB**
- Entry point: **28.6 KB**

## Budgets

| Budget | Limit (KB) | Actual (KB) | Pass | % of budget |
| --- | ---: | ---: | --- | ---: |
| totalJsKb | 800 | 388.5 | Yes | 49% |
| totalCssKb | 200 | 91.5 | Yes | 46% |
| largestChunkKb | 250 | 106.7 | Yes | 43% |
| entryPointKb | 150 | 28.6 | Yes | 19% |

## Chunks

| File | Type | Size (KB) | Gzip (KB) | Entry |
| --- | --- | ---: | ---: | --- |
| `assets/AdminPanel-ChpHcsl2.css` | css | 35.4 | 6.3 |  |
| `assets/AdminPanel-Dxnm_3uM.js` | js | 413.5 | 106.2 |  |
| `assets/BetaFeedbackView-X1676Je3.css` | css | 0.1 | 0.1 |  |
| `assets/BetaFeedbackView-eoHlIaah.js` | js | 10.1 | 3.0 |  |
| `assets/BookingWizardView-DG67kUkG.js` | js | 166.3 | 45.9 |  |
| `assets/BookingWizardView-DeI0ZSmt.css` | css | 22.0 | 3.9 |  |
| `assets/EntityCard-gXQOZrgO.js` | js | 0.4 | 0.2 |  |
| `assets/axios-C0Zqfgkc.js` | js | 35.8 | 14.3 |  |
| `assets/dependencyCleanup-b3nyV3Z8.js` | js | 0.6 | 0.4 |  |
| `assets/index-DUuRIeDA.js` | js | 97.6 | 28.6 | Yes |
| `assets/index-KQ7EkI0Y.css` | css | 126.3 | 14.9 |  |
| `assets/pinia-B5X-hN8x.js` | js | 3.7 | 1.8 |  |
| `assets/timeFormatting-C64Ky7er.js` | js | 40.3 | 14.5 |  |
| `assets/timeFormatting-tn0RQdqM.css` | css | 0.0 | 0.0 |  |
| `assets/useBetaFeedback-DCxFf-RV.js` | js | 0.7 | 0.4 |  |
| `assets/vee-validate-CAZXNrDj.js` | js | 27.9 | 10.1 |  |
| `assets/vue-JsoSmu5X.js` | js | 77.8 | 30.8 |  |
| `assets/vue-query-Bwll3ySA.js` | js | 37.0 | 10.9 |  |
| `assets/vue-router-BAniQuVs.js` | js | 24.9 | 9.8 |  |
| `assets/vuetify-BG64wsne.js` | js | 340.8 | 106.7 |  |
| `assets/vuetify-DSra91HW.css` | css | 511.7 | 66.2 |  |
| `assets/vueuse-BcYULufa.js` | js | 11.6 | 5.0 |  |
