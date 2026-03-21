**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Bundle Size Budget Audit (Generated)

Generated at: 2026-03-07T18:37:51.529Z
Build timestamp: 2026-03-05T00:34:41.848Z

## Summary

- Chunks scanned: **61**
- Total JS (gzip): **425.2 KB**
- Total CSS (gzip): **115.5 KB**
- Largest chunk: **109.5 KB**
- Entry point: **0.0 KB**

## Budgets

| Budget | Limit (KB) | Actual (KB) | Pass | % of budget |
| --- | ---: | ---: | --- | ---: |
| totalJsKb | 800 | 425.2 | Yes | 53% |
| totalCssKb | 200 | 115.5 | Yes | 58% |
| largestChunkKb | 250 | 109.5 | Yes | 44% |
| entryPointKb | 150 | 0.0 | Yes | 0% |

## Chunks

| File | Type | Size (KB) | Gzip (KB) | Entry |
| --- | --- | ---: | ---: | --- |
| `assets/AddressAutocomplete.vue_vue_type_script_setup_true_lang-Dk9z87dB.js` | js | 8.3 | 3.1 |  |
| `assets/AdminPanel-BFkMM7v_.js` | js | 5.8 | 2.3 |  |
| `assets/AdminPanel-DlvIg0BA.css` | css | 0.0 | 0.1 |  |
| `assets/AvailabilityStep-D9SiNMmN.js` | js | 51.0 | 15.7 |  |
| `assets/AvailabilityStep-DDmuoWPv.css` | css | 13.4 | 2.4 |  |
| `assets/BetaFeedbackView-1UZAge82.css` | css | 0.1 | 0.1 |  |
| `assets/BetaFeedbackView-DG2Bqx9q.js` | js | 9.5 | 3.2 |  |
| `assets/BookingWizardView-BmT8-bVA.js` | js | 58.9 | 18.4 |  |
| `assets/BookingWizardView-Bmryo114.css` | css | 7.1 | 1.5 |  |
| `assets/BusinessControlsTab-J06W35pL.js` | js | 96.8 | 22.2 |  |
| `assets/BusinessControlsTab-bu_Eg08f.css` | css | 0.4 | 0.2 |  |
| `assets/CancelConfirmView-CWjVTii7.css` | css | 0.1 | 0.1 |  |
| `assets/CancelConfirmView-Dm-wsZk-.js` | js | 3.4 | 1.5 |  |
| `assets/ConfirmationStep-DyS9UXIt.js` | js | 7.4 | 2.3 |  |
| `assets/ConfirmationStep-n2Bh0ymk.css` | css | 0.5 | 0.3 |  |
| `assets/ContactsStep-DzPhLh5L.js` | js | 14.9 | 3.3 |  |
| `assets/ContactsStep-uvBumCKy.css` | css | 0.0 | 0.0 |  |
| `assets/DataManagementTab-B-VnYE-K.js` | js | 46.0 | 10.1 |  |
| `assets/DataManagementTab-B4RDlzqH.css` | css | 1.6 | 0.5 |  |
| `assets/EntityCard-h68Al1j3.js` | js | 0.6 | 0.3 |  |
| `assets/InstancesTab-CbimXIL2.css` | css | 1.7 | 0.6 |  |
| `assets/InstancesTab-DqinOJrp.js` | js | 43.7 | 12.7 |  |
| `assets/PropertyDetailsStep-C5fGuVY1.css` | css | 0.2 | 0.1 |  |
| `assets/PropertyDetailsStep-a9pzd01e.js` | js | 27.3 | 7.7 |  |
| `assets/RequiredConfirmationModal.vue_vue_type_script_setup_true_lang-DHJqflB9.js` | js | 2.4 | 1.1 |  |
| `assets/SelectionCardGroup-BrSs8BwK.js` | js | 16.5 | 5.2 |  |
| `assets/SelectionCardGroup-BsJM67m6.css` | css | 3.6 | 0.9 |  |
| `assets/ServiceSelectionStep-YmVW5ur6.js` | js | 8.1 | 2.8 |  |
| `assets/ServiceSelectionStep-loLURZbB.css` | css | 0.4 | 0.2 |  |
| `assets/ShapesTab-CxEOd20Q.js` | js | 19.6 | 5.2 |  |
| `assets/ShapesTab-aIBb-zm0.css` | css | 0.8 | 0.3 |  |
| `assets/WizardTextField.vue_vue_type_script_setup_true_lang-zffRcfXy.js` | js | 0.6 | 0.4 |  |
| `assets/appointmentStatus-kJqMVDZ6.js` | js | 0.5 | 0.2 |  |
| `assets/appointmentsTableConstants-CTDSvluL.js` | js | 2.8 | 1.2 |  |
| `assets/axios-C0Zqfgkc.js` | js | 35.8 | 14.3 |  |
| `assets/betaFeedback-D0AF5Osh.js` | js | 0.7 | 0.4 |  |
| `assets/datetime-BDwq2N5d.js` | js | 4.2 | 1.5 |  |
| `assets/errorMessages-C9lYqY4p.js` | js | 0.2 | 0.1 |  |
| `assets/eventAttendeeUtils-AVpyJQ9C.js` | js | 0.3 | 0.2 |  |
| `assets/iconify-j2tpkn_2.js` | js | 18.1 | 7.0 |  |
| `assets/index-BpkLYJu-.js` | js | 103.1 | 30.4 |  |
| `assets/index-mgF-7Swp.css` | css | 126.5 | 15.1 |  |
| `assets/injectionKeys-c2H2okYd.js` | js | 0.1 | 0.1 |  |
| `assets/instanceComponentUtils-CqPJMEwn.js` | js | 1.2 | 0.6 |  |
| `assets/partsTotals-C8R03hxC.js` | js | 0.3 | 0.1 |  |
| `assets/pinia-CYQbIG1u.js` | js | 3.7 | 1.8 |  |
| `assets/timeFormatting-C_kauy9Y.js` | js | 0.5 | 0.3 |  |
| `assets/useBusiness-D6AdKoZy.js` | js | 1.1 | 0.5 |  |
| `assets/useComponentEntity-Cl5__akC.js` | js | 4.0 | 1.5 |  |
| `assets/useEntityTabState-CRtiYR9K.css` | css | 31.2 | 5.4 |  |
| `assets/useEntityTabState-CikyS5En.js` | js | 246.7 | 70.0 |  |
| `assets/useStepValidation-w0d56RZJ.js` | js | 2.9 | 1.2 |  |
| `assets/useTabNavigation-CLLvO-bf.js` | js | 0.1 | 0.1 |  |
| `assets/useWizardStepSync-CMY3IR-G.js` | js | 0.5 | 0.3 |  |
| `assets/vee-validate-BUN0ESPl.js` | js | 27.9 | 10.1 |  |
| `assets/vue-CXDTPvUa.js` | js | 77.8 | 30.8 |  |
| `assets/vue-query-Dropo6Se.js` | js | 37.0 | 10.9 |  |
| `assets/vue-router-Cp3krIFy.js` | js | 25.0 | 9.8 |  |
| `assets/vuetify-Dcrvl_Q0.css` | css | 620.7 | 87.6 |  |
| `assets/vuetify-ZxuFsui1.js` | js | 348.4 | 109.5 |  |
| `assets/vueuse-ByYQHvxe.js` | js | 11.6 | 5.0 |  |
