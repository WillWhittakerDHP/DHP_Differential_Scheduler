**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Bundle Size Budget Audit (Generated)

Generated at: 2026-03-04T15:30:19.973Z
Build timestamp: 2026-02-26T20:54:27.101Z

## Summary

- Chunks scanned: **57**
- Total JS (gzip): **417.0 KB**
- Total CSS (gzip): **115.1 KB**
- Largest chunk: **109.5 KB**
- Entry point: **0.0 KB**

## Budgets

| Budget | Limit (KB) | Actual (KB) | Pass | % of budget |
| --- | ---: | ---: | --- | ---: |
| totalJsKb | 800 | 417.0 | Yes | 52% |
| totalCssKb | 200 | 115.1 | Yes | 58% |
| largestChunkKb | 250 | 109.5 | Yes | 44% |
| entryPointKb | 150 | 0.0 | Yes | 0% |

## Chunks

| File | Type | Size (KB) | Gzip (KB) | Entry |
| --- | --- | ---: | ---: | --- |
| `assets/AddressAutocomplete.vue_vue_type_script_setup_true_lang-oEkE5vvj.js` | js | 8.3 | 3.1 |  |
| `assets/AdminPanel-C5a1GJ-2.js` | js | 5.7 | 2.3 |  |
| `assets/AdminPanel-Epraq2yH.css` | css | 0.0 | 0.1 |  |
| `assets/AvailabilityStep-CBIELR-J.css` | css | 12.9 | 2.3 |  |
| `assets/AvailabilityStep-oSxRCqZx.js` | js | 46.9 | 14.5 |  |
| `assets/BetaFeedbackView-BuMeJOHg.js` | js | 9.5 | 3.2 |  |
| `assets/BetaFeedbackView-DoYPPwpZ.css` | css | 0.1 | 0.1 |  |
| `assets/BookingWizardView-C3f5qavy.css` | css | 5.8 | 1.3 |  |
| `assets/BookingWizardView-mNIhAoC8.js` | js | 54.0 | 16.8 |  |
| `assets/BusinessControlsTab-BUzo-yjm.css` | css | 0.4 | 0.2 |  |
| `assets/BusinessControlsTab-DjWDKBP5.js` | js | 92.2 | 21.6 |  |
| `assets/ConfirmationStep-C9z0lWug.css` | css | 0.5 | 0.3 |  |
| `assets/ConfirmationStep-uNiiie8t.js` | js | 6.1 | 2.0 |  |
| `assets/ContactsStep-BIP6q9yh.js` | js | 13.7 | 3.1 |  |
| `assets/ContactsStep-uvBumCKy.css` | css | 0.0 | 0.0 |  |
| `assets/DataManagementTab-BUk47D-9.css` | css | 1.6 | 0.5 |  |
| `assets/DataManagementTab-C7eaiJTs.js` | js | 44.7 | 9.7 |  |
| `assets/EntityCard-BtUG_XB1.js` | js | 0.6 | 0.3 |  |
| `assets/InstancesTab-Cg1s6VJ1.js` | js | 42.2 | 12.4 |  |
| `assets/InstancesTab-_v7uSjKg.css` | css | 1.7 | 0.6 |  |
| `assets/PropertyDetailsStep-B6Xg74mN.js` | js | 26.4 | 7.5 |  |
| `assets/PropertyDetailsStep-C7ZxdZTc.css` | css | 0.2 | 0.1 |  |
| `assets/SelectionCardGroup-B_qLkCde.css` | css | 3.6 | 0.9 |  |
| `assets/SelectionCardGroup-CTnSgsGE.js` | js | 16.5 | 5.2 |  |
| `assets/ServiceSelectionStep-BWJok9R0.js` | js | 8.1 | 2.8 |  |
| `assets/ServiceSelectionStep-CLvoDWQV.css` | css | 0.4 | 0.2 |  |
| `assets/ShapesTab-ChZPjJQW.js` | js | 18.4 | 4.9 |  |
| `assets/ShapesTab-D-LCPjMc.css` | css | 0.8 | 0.3 |  |
| `assets/WizardTextField.vue_vue_type_script_setup_true_lang-mgesTSpU.js` | js | 0.6 | 0.4 |  |
| `assets/appointmentsTableConstants-DH0X8YiP.js` | js | 2.5 | 1.1 |  |
| `assets/axios-C0Zqfgkc.js` | js | 35.8 | 14.3 |  |
| `assets/betaFeedback-CmL2EVTz.js` | js | 0.7 | 0.4 |  |
| `assets/datetime-BzzjtrLW.js` | js | 5.0 | 1.7 |  |
| `assets/errorMessages-ChOmi9qr.js` | js | 0.2 | 0.1 |  |
| `assets/eventAttendeeUtils-BV9v6gGv.js` | js | 0.3 | 0.2 |  |
| `assets/iconify-xG1x1Gc-.js` | js | 18.1 | 7.0 |  |
| `assets/index-BFMtTyHL.css` | css | 126.5 | 15.1 |  |
| `assets/index-cyymr-ki.js` | js | 101.8 | 30.1 |  |
| `assets/injectionKeys-c2H2okYd.js` | js | 0.1 | 0.1 |  |
| `assets/instanceComponentUtils-CqPJMEwn.js` | js | 1.2 | 0.6 |  |
| `assets/partsTotals-C8R03hxC.js` | js | 0.3 | 0.1 |  |
| `assets/pinia-B87p1dPI.js` | js | 3.7 | 1.8 |  |
| `assets/timeFormatting-B1cLDU6S.js` | js | 0.5 | 0.3 |  |
| `assets/useBlockInstanceSelection-Bhf1cxCm.js` | js | 0.5 | 0.3 |  |
| `assets/useComponentEntity-npHnFADe.js` | js | 4.0 | 1.5 |  |
| `assets/useEntityTabState-BrWcF4cN.css` | css | 31.2 | 5.4 |  |
| `assets/useEntityTabState-CRJaVvFt.js` | js | 246.4 | 69.9 |  |
| `assets/useStepValidation-BEp-7xi6.js` | js | 2.9 | 1.2 |  |
| `assets/useTabNavigation-BoJLg5Us.js` | js | 0.1 | 0.1 |  |
| `assets/useWizardStepSync-DDSdxsmv.js` | js | 0.5 | 0.3 |  |
| `assets/vee-validate-BLy76YOh.js` | js | 27.9 | 10.1 |  |
| `assets/vue-RbN4JVuX.js` | js | 77.8 | 30.8 |  |
| `assets/vue-query-DxLsMSA7.js` | js | 37.0 | 10.9 |  |
| `assets/vue-router-DNHFWmiD.js` | js | 24.9 | 9.8 |  |
| `assets/vuetify-C90MPy7L.js` | js | 348.4 | 109.5 |  |
| `assets/vuetify-DZTe57-x.css` | css | 620.7 | 87.6 |  |
| `assets/vueuse-BSatPeLz.js` | js | 11.6 | 5.0 |  |
