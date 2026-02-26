**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Bundle Size Budget Audit (Generated)

Generated at: 2026-02-26T01:00:57.527Z
Build timestamp: 2026-02-24T15:28:40.179Z

## Summary

- Chunks scanned: **55**
- Total JS (gzip): **410.2 KB**
- Total CSS (gzip): **93.4 KB**
- Largest chunk: **108.4 KB**
- Entry point: **0.0 KB**

## Budgets

| Budget | Limit (KB) | Actual (KB) | Pass | % of budget |
| --- | ---: | ---: | --- | ---: |
| totalJsKb | 800 | 410.1 | Yes | 51% |
| totalCssKb | 200 | 93.4 | Yes | 47% |
| largestChunkKb | 250 | 108.4 | Yes | 43% |
| entryPointKb | 150 | 0.0 | Yes | 0% |

## Chunks

| File | Type | Size (KB) | Gzip (KB) | Entry |
| --- | --- | ---: | ---: | --- |
| `assets/AddressAutocomplete.vue_vue_type_script_setup_true_lang-CfU4BrEB.js` | js | 7.9 | 3.0 |  |
| `assets/AdminPanel-CmlQsXoK.js` | js | 7.2 | 2.8 |  |
| `assets/AdminPanel-Epraq2yH.css` | css | 0.0 | 0.1 |  |
| `assets/AvailabilityStep-BIP40UrN.css` | css | 11.8 | 2.1 |  |
| `assets/AvailabilityStep-mHhw_nit.js` | js | 47.0 | 14.4 |  |
| `assets/BetaFeedbackView-DvXVRaha.js` | js | 10.2 | 3.0 |  |
| `assets/BetaFeedbackView-X1676Je3.css` | css | 0.1 | 0.1 |  |
| `assets/BookingWizardView-BHJvpMdm.css` | css | 5.8 | 1.3 |  |
| `assets/BookingWizardView-DwH5LZuv.js` | js | 52.9 | 16.4 |  |
| `assets/BusinessControlsTab-BcWyGmsa.css` | css | 0.4 | 0.2 |  |
| `assets/BusinessControlsTab-Yf7Qs3GS.js` | js | 95.7 | 21.4 |  |
| `assets/ConfirmationStep-ChInDEax.css` | css | 0.5 | 0.3 |  |
| `assets/ConfirmationStep-DfaJNxrg.js` | js | 6.0 | 2.0 |  |
| `assets/ContactsStep-CtsbCE7X.js` | js | 13.4 | 2.9 |  |
| `assets/ContactsStep-uvBumCKy.css` | css | 0.0 | 0.0 |  |
| `assets/DataManagementTab-BQa2fP4b.js` | js | 42.2 | 8.8 |  |
| `assets/DataManagementTab-CmQBojYL.css` | css | 1.2 | 0.5 |  |
| `assets/EntityCard-D7zV1LD9.js` | js | 0.6 | 0.3 |  |
| `assets/InstancesTab-3tPdZXGQ.js` | js | 37.7 | 11.6 |  |
| `assets/InstancesTab-MW0QPhUX.css` | css | 1.7 | 0.6 |  |
| `assets/PropertyDetailsStep-C3C_xucV.js` | js | 23.6 | 6.8 |  |
| `assets/SelectionCardGroup-BbGWSTB4.css` | css | 3.6 | 0.9 |  |
| `assets/SelectionCardGroup-ElRJ7GGp.js` | js | 18.8 | 5.3 |  |
| `assets/ServiceSelectionStep-0GRjbpog.js` | js | 6.1 | 2.3 |  |
| `assets/ServiceSelectionStep-C4fNvUHl.css` | css | 0.4 | 0.2 |  |
| `assets/ShapesTab-BXUbyKAq.js` | js | 17.1 | 4.4 |  |
| `assets/ShapesTab-DypL076T.css` | css | 0.8 | 0.3 |  |
| `assets/axios-C0Zqfgkc.js` | js | 35.8 | 14.3 |  |
| `assets/datetime-hfIxVIOq.js` | js | 6.9 | 2.5 |  |
| `assets/dependencyCleanup-Buglbox7.js` | js | 0.6 | 0.4 |  |
| `assets/errorMessages-ChOmi9qr.js` | js | 0.2 | 0.1 |  |
| `assets/eventAttendeeUtils-KWTUWumJ.js` | js | 0.3 | 0.2 |  |
| `assets/iconify-DxUG9h9y.js` | js | 18.1 | 7.0 |  |
| `assets/index-C_yQZvHO.js` | js | 99.6 | 29.3 |  |
| `assets/index-D0-jxQAz.css` | css | 126.3 | 14.9 |  |
| `assets/instanceComponentUtils-k1m53kwc.js` | js | 3.2 | 1.1 |  |
| `assets/partsTotals-C8R03hxC.js` | js | 0.3 | 0.1 |  |
| `assets/pinia-CyDfLiNr.js` | js | 3.7 | 1.8 |  |
| `assets/timeFormatting-Psmzx-9V.js` | js | 0.7 | 0.4 |  |
| `assets/useBetaFeedback-DofjSJrM.js` | js | 0.7 | 0.4 |  |
| `assets/useBlockInstanceSelection-B6Qzsl5E.js` | js | 0.5 | 0.3 |  |
| `assets/useComponentEntity-BcaYPf0C.js` | js | 4.7 | 1.6 |  |
| `assets/useDragAndDropHelpers-BdhLY93s.js` | js | 242.0 | 68.0 |  |
| `assets/useDragAndDropHelpers-CUugQ4tZ.css` | css | 31.3 | 5.5 |  |
| `assets/useSharedMutationHandlers-Cb2_Jfil.js` | js | 0.6 | 0.3 |  |
| `assets/useStepValidation-Dx3v6BXu.js` | js | 2.7 | 1.1 |  |
| `assets/useTabNavigation-PRoos8Ch.js` | js | 0.1 | 0.1 |  |
| `assets/useWizardStepSync-CBHCliKQ.js` | js | 0.5 | 0.3 |  |
| `assets/vee-validate-X9dUdhq7.js` | js | 27.9 | 10.1 |  |
| `assets/vue-CcbpGyuJ.js` | js | 77.8 | 30.8 |  |
| `assets/vue-query-BHaqrhEi.js` | js | 37.0 | 10.9 |  |
| `assets/vue-router-BsZwhYGn.js` | js | 24.9 | 9.8 |  |
| `assets/vuetify-CpYpwDyl.js` | js | 349.7 | 108.4 |  |
| `assets/vuetify-QbqqxFlv.css` | css | 514.6 | 66.4 |  |
| `assets/vueuse-BwVgCutz.js` | js | 11.6 | 5.0 |  |
