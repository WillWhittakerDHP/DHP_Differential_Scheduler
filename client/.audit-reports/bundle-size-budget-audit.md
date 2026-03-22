**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Bundle Size Budget Audit (Generated)

Generated at: 2026-03-22T02:02:09.256Z
Build timestamp: 2026-03-21T19:13:05.009Z

## Summary

- Chunks scanned: **65**
- Total JS (gzip): **440.2 KB**
- Total CSS (gzip): **116.1 KB**
- Largest chunk: **109.5 KB**
- Entry point: **31.2 KB**

## Budgets

| Budget | Limit (KB) | Actual (KB) | Pass | % of budget |
| --- | ---: | ---: | --- | ---: |
| totalJsKb | 800 | 440.2 | Yes | 55% |
| totalCssKb | 200 | 116.1 | Yes | 58% |
| largestChunkKb | 250 | 109.5 | Yes | 44% |
| entryPointKb | 150 | 31.2 | Yes | 21% |

## Chunks

| File | Type | Size (KB) | Gzip (KB) | Entry |
| --- | --- | ---: | ---: | --- |
| `assets/AddressAutocomplete.vue_vue_type_script_setup_true_lang-8CX5iV2B.js` | js | 8.3 | 3.1 |  |
| `assets/AdminBookingEntryView-C7-2MhJK.css` | css | 0.1 | 0.1 |  |
| `assets/AdminBookingEntryView-HvnsCpbr.js` | js | 4.1 | 1.7 |  |
| `assets/AdminPanel-BVbx4lnD.js` | js | 6.2 | 2.5 |  |
| `assets/AdminPanel-C_7kq-_g.css` | css | 0.0 | 0.1 |  |
| `assets/AvailabilityStep-CpoWiKfX.css` | css | 16.0 | 2.7 |  |
| `assets/AvailabilityStep-DWT6hBdi.js` | js | 63.2 | 19.3 |  |
| `assets/BetaFeedbackView-CH2zETZV.css` | css | 0.1 | 0.1 |  |
| `assets/BetaFeedbackView-DYanMmZq.js` | js | 9.6 | 3.2 |  |
| `assets/BookingWizardView-BFb1s8yG.js` | js | 63.2 | 19.7 |  |
| `assets/BookingWizardView-BIuyoa2M.css` | css | 7.6 | 1.6 |  |
| `assets/BusinessControlsTab-BG9BzHtT.css` | css | 0.4 | 0.2 |  |
| `assets/BusinessControlsTab-CkVYV9rQ.js` | js | 111.9 | 25.3 |  |
| `assets/CancelConfirmView-8UEajSeo.js` | js | 3.3 | 1.5 |  |
| `assets/CancelConfirmView-CWjVTii7.css` | css | 0.1 | 0.1 |  |
| `assets/ConfirmationStep-CgFun4-l.js` | js | 8.4 | 2.7 |  |
| `assets/ConfirmationStep-dF7ULV7a.css` | css | 0.5 | 0.3 |  |
| `assets/ContactsStep-CUCz-PXP.js` | js | 14.9 | 3.3 |  |
| `assets/ContactsStep-uvBumCKy.css` | css | 0.0 | 0.0 |  |
| `assets/DataManagementTab-DEBb7jK4.js` | js | 47.4 | 10.4 |  |
| `assets/DataManagementTab-YC1gzoUf.css` | css | 1.6 | 0.5 |  |
| `assets/InstancesTab-CbimXIL2.css` | css | 1.7 | 0.6 |  |
| `assets/InstancesTab-uKcHtNSS.js` | js | 47.2 | 13.5 |  |
| `assets/PropertyDetailsStep-C5fGuVY1.css` | css | 0.2 | 0.1 |  |
| `assets/PropertyDetailsStep-DsRsuwAx.js` | js | 28.6 | 8.0 |  |
| `assets/SelectionCardGroup-BCOB4g80.js` | js | 16.5 | 5.2 |  |
| `assets/SelectionCardGroup-BsJM67m6.css` | css | 3.6 | 0.9 |  |
| `assets/ServiceSelectionStep-BunCk1R_.js` | js | 8.1 | 2.8 |  |
| `assets/ServiceSelectionStep-loLURZbB.css` | css | 0.4 | 0.2 |  |
| `assets/ShapesTab-BQG60nuw.css` | css | 0.8 | 0.3 |  |
| `assets/ShapesTab-DEcKbOkI.js` | js | 20.0 | 5.2 |  |
| `assets/WizardSelect.vue_vue_type_script_setup_true_lang-BXRfUo2i.js` | js | 0.6 | 0.4 |  |
| `assets/WizardTextField.vue_vue_type_script_setup_true_lang-CM0Nr8U9.js` | js | 0.6 | 0.4 |  |
| `assets/appointmentStatus-kJqMVDZ6.js` | js | 0.5 | 0.2 |  |
| `assets/appointmentsTableConstants-CM5_ka2B.js` | js | 2.5 | 1.0 |  |
| `assets/axios-C0Zqfgkc.js` | js | 35.8 | 14.3 |  |
| `assets/betaFeedback-CZ12Upja.js` | js | 0.7 | 0.4 |  |
| `assets/datetime-BmWi3Zz2.js` | js | 2.0 | 0.9 |  |
| `assets/errorMessages-C9lYqY4p.js` | js | 0.2 | 0.1 |  |
| `assets/iconify-CGIBln35.js` | js | 18.1 | 7.0 |  |
| `assets/index-4PtnAsIo.js` | js | 106.0 | 31.2 | Yes |
| `assets/index-C2Snad4n.css` | css | 126.5 | 15.1 |  |
| `assets/injectionKeys-c2H2okYd.js` | js | 0.1 | 0.1 |  |
| `assets/instanceComponentUtils-CqPJMEwn.js` | js | 1.2 | 0.6 |  |
| `assets/pinia-DStYrkRZ.js` | js | 3.7 | 1.8 |  |
| `assets/timeFormatting-DfwjtMzU.js` | js | 0.5 | 0.3 |  |
| `assets/useBlockInstanceSelection-Vct2KkNH.js` | js | 0.5 | 0.3 |  |
| `assets/useBusiness-B6wZM9U7.js` | js | 1.1 | 0.6 |  |
| `assets/useComponentEntity-MJpvxX5p.js` | js | 4.0 | 1.5 |  |
| `assets/useEntityTabState-B9z6MTKr.css` | css | 32.7 | 5.7 |  |
| `assets/useEntityTabState-CJh92xdD.js` | js | 249.6 | 71.0 |  |
| `assets/useSharedMutationHandlers-Cb2_Jfil.js` | js | 0.6 | 0.3 |  |
| `assets/useStepValidation-B31P-KW8.js` | js | 2.9 | 1.2 |  |
| `assets/useTabNavigation-C_SWRKeN.js` | js | 0.1 | 0.1 |  |
| `assets/useTableModelHelpers-BS9GIYS0.js` | js | 0.1 | 0.1 |  |
| `assets/useUser-C698pP87.js` | js | 2.4 | 0.9 |  |
| `assets/useWizardSettings-Dy9s-PPk.js` | js | 4.4 | 1.6 |  |
| `assets/useWizardStepSync-CJIhCByl.js` | js | 0.5 | 0.3 |  |
| `assets/vee-validate-vLPgWGlf.js` | js | 27.9 | 10.1 |  |
| `assets/vue-B6QXj5xn.js` | js | 77.8 | 30.8 |  |
| `assets/vue-query-CUgs6ZXN.js` | js | 37.0 | 10.9 |  |
| `assets/vue-router-Duj5Hmby.js` | js | 25.0 | 9.8 |  |
| `assets/vuetify-D6DQf1Ky.js` | js | 348.4 | 109.5 |  |
| `assets/vuetify-DZTe57-x.css` | css | 620.7 | 87.6 |  |
| `assets/vueuse-ClBtD2Md.js` | js | 11.6 | 5.0 |  |
