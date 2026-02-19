**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Bundle Size Budget Audit (Generated)

Generated at: 2026-02-19T19:01:45.963Z
Build timestamp: 2026-02-12T12:46:44.832Z

## Summary

- Chunks scanned: **22**
- Total JS (gzip): **375.0 KB**
- Total CSS (gzip): **87.8 KB**
- Largest chunk: **101.5 KB**
- Entry point: **28.3 KB**

## Budgets

| Budget | Limit (KB) | Actual (KB) | Pass | % of budget |
| --- | ---: | ---: | --- | ---: |
| totalJsKb | 800 | 375.0 | Yes | 47% |
| totalCssKb | 200 | 87.8 | Yes | 44% |
| largestChunkKb | 250 | 101.5 | Yes | 41% |
| entryPointKb | 150 | 28.3 | Yes | 19% |

## Chunks

| File | Type | Size (KB) | Gzip (KB) | Entry |
| --- | --- | ---: | ---: | --- |
| `assets/AdminPanel-BwaPkP9f.css` | css | 34.8 | 6.3 |  |
| `assets/AdminPanel-e0o5GnO4.js` | js | 395.3 | 101.5 |  |
| `assets/BetaFeedbackView-D_DitYBU.js` | js | 10.1 | 2.9 |  |
| `assets/BetaFeedbackView-X1676Je3.css` | css | 0.1 | 0.1 |  |
| `assets/BookingWizardView-BGuxIMh3.js` | js | 163.8 | 44.9 |  |
| `assets/BookingWizardView-Czv_1-aA.css` | css | 21.6 | 3.8 |  |
| `assets/EntityCard-BjBHAVrp.js` | js | 0.4 | 0.2 |  |
| `assets/axios-B9ygI19o.js` | js | 35.4 | 14.3 |  |
| `assets/dependencyCleanup-By3IPjg9.js` | js | 0.6 | 0.4 |  |
| `assets/index-BLy1htHC.css` | css | 126.2 | 14.9 |  |
| `assets/index-R7INyEjL.js` | js | 96.5 | 28.3 | Yes |
| `assets/pinia-CE8CNn1U.js` | js | 3.7 | 1.8 |  |
| `assets/timeFormatting-WQqpYAV_.js` | js | 39.1 | 14.0 |  |
| `assets/timeFormatting-tn0RQdqM.css` | css | 0.0 | 0.0 |  |
| `assets/useBetaFeedback-Bd4QduCj.js` | js | 0.7 | 0.4 |  |
| `assets/vee-validate-55YNGDDS.js` | js | 27.9 | 10.1 |  |
| `assets/vue-CzYakJs2.js` | js | 76.1 | 30.2 |  |
| `assets/vue-query-B5vyims8.js` | js | 36.5 | 10.8 |  |
| `assets/vue-router-B4Miq84r.js` | js | 24.9 | 9.8 |  |
| `assets/vuetify-CaMqzS4x.js` | js | 327.2 | 101.0 |  |
| `assets/vuetify-X4Vjuyp9.css` | css | 484.1 | 62.6 |  |
| `assets/vueuse-DuApq6UG.js` | js | 9.9 | 4.3 |  |
