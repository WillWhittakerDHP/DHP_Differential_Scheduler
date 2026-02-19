**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Typecheck Audit Summary (Generated)

Generated from `.audit-reports/typecheck/typecheck-audit.json`.

## Pool index (ranked)

| Priority | Pool | score | errors | files | severity | blast | repetition | unsafeCasts | suppressions |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| P0 | `TS2304-ts2304-cannot-find-name-createmaxincomecomputed` | 79 | 7 | 1 | 70 | 2 | 7 | 0 | 0 |
| P0 | `TS2345-ts2345-arg-string-number-string` | 61 | 5 | 3 | 50 | 6 | 5 | 0 | 0 |
| P0 | `TS2345-ts2345-arg-string-rfc3339datetime` | 46 | 4 | 1 | 40 | 2 | 4 | 0 | 0 |
| P0 | `TS18046-ts18046-entity-value-is-of-type-unknown` | 38 | 4 | 1 | 32 | 2 | 4 | 0 | 0 |
| P0 | `TS2345-ts2345-arg-globalfieldkey-readonly-string` | 37 | 3 | 2 | 30 | 4 | 3 | 0 | 0 |
| P0 | `TS2345-ts2345-arg-globalfieldkey-string` | 37 | 3 | 2 | 30 | 4 | 3 | 0 | 0 |
| P0 | `TS2339-ts2339-prop-id` | 35 | 3 | 1 | 30 | 2 | 3 | 0 | 0 |
| P0 | `TS2698-ts2698-spread-types-may-only-be-created-from-object-types` | 25 | 3 | 2 | 18 | 4 | 3 | 0 | 0 |
| P0 | `TS2339-ts2339-prop-id-record` | 24 | 2 | 1 | 20 | 2 | 2 | 0 | 0 |
| P1 | `TS2638-ts2638-type-may-represent-a-primitive-value-which-is-not-permitted-as-the-right-operand-of-the-in-operator` | 16 | 2 | 1 | 12 | 2 | 2 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-computedref-ref` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-globalfieldkey-string` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-number-constraintenforcement-drivetimeapplyto-undefined-tvalue-undefined` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-number-off-both-flexible-hard-appointment-drivetime-lunch-before-after-undefined-tvalue-undefined` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-ref-18-more-setvalue-void-omit-map-ref-map` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-string-number-string` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-string-string` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2339-ts2339-prop-localecompare-globalfieldkey` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2345-ts2345-arg-fieldcontexttype` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2345-ts2345-arg-string-number-symbol-string` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2345-ts2345-arg-unknown-globalentity` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2345-ts2345-arg-void-void-void-void-void-void` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2352-ts2352-conversion-of-type-fieldkey-globalentitytype-globalpropertykey-to-type-partial-globalentitytype-may-be-a-mistake-` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2352-ts2352-conversion-of-type-fieldkey-globalfieldkey-blockinstance-blockshape-partinstance-partshape-eventshape-eventinstan` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2352-ts2352-conversion-of-type-id-globalentityid-blockshaperef-globalentityid-to-type-blockinstanceentity-may-be-a-mistake-be` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2352-ts2352-conversion-of-type-readonly-x-string-string-readonly-background-string-readonly-surface-string-readonly-primary-s` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2352-ts2352-conversion-of-type-selectedblockid-globalthis-writablecomputedref-string-null-string-null-to-type-useblockinstanc` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2352-ts2352-conversion-of-type-selectedblockids-globalthis-writablecomputedref-string-string-to-type-useblockinstanceselectio` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2352-ts2352-conversion-of-type-selectioncarditemwithcomponents-to-type-selectioncarditem-may-be-a-mistake-because-neither-typ` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2352-ts2352-conversion-of-type-window-typeof-globalthis-to-type-windowwithdebug-may-be-a-mistake-because-neither-type-suffici` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2352-ts2352-conversion-of-type-workcapacityfilter-rollingweekcapacityfilter-to-type-record-string-tvalue-may-be-a-mistake-bec` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2724-ts2724-types-entities-has-no-exported-member-named-globalentitykey-did-you-mean-globalentity` | 12 | 1 | 1 | 9 | 2 | 1 | 0 | 0 |
| P2 | `TS2536-ts2536-type-globalfieldkey-ge-cannot-be-used-to-index-type` | 9 | 1 | 1 | 6 | 2 | 1 | 0 | 0 |
| P2 | `TS5076-ts5076-and-operations-cannot-be-mixed-without-parentheses` | 9 | 1 | 1 | 6 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-bookingmode-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |

## File index (ranked)

| File | errors | unsafeCasts | suppressions |
| --- | ---: | ---: | ---: |
| `src/composables/admin/useStatusButtonToggle.ts` | 9 | 0 | 0 |
| `src/composables/admin/useCapacitySettings.ts` | 8 | 0 | 0 |
| `src/composables/admin/useEntityCardActions.ts` | 7 | 0 | 0 |
| `src/composables/admin/useMetadataFieldOrdering.ts` | 5 | 0 | 0 |
| `src/components/admin/dev/ApiDevPanelComputedTab.vue` | 4 | 0 | 0 |
| `src/composables/formFields/useFormFieldsContext.ts` | 4 | 0 | 0 |
| `src/composables/admin/useSelectFiltering.ts` | 3 | 0 | 0 |
| `src/composables/admin/useBufferSettings.ts` | 2 | 0 | 0 |
| `src/composables/booking/useBlockInstanceSelection.ts` | 2 | 0 | 0 |
| `src/composables/formFields/useFormFieldsStandardLayout.ts` | 2 | 0 | 0 |
| `src/composables/useSelectOptions.ts` | 2 | 0 | 0 |
| `src/components/admin/generic/collections/PartsCollection.vue` | 1 | 0 | 0 |
| `src/components/booking/steps/PropertyDetailsStep.vue` | 1 | 0 | 0 |
| `src/components/common/AddressAutocomplete.vue` | 1 | 0 | 0 |
| `src/composables/admin/tables/useAppointmentsTableModel.ts` | 1 | 0 | 0 |
| `src/composables/admin/useCalibrationChart.ts` | 1 | 0 | 0 |
| `src/composables/admin/useEntityCardStoreSync.ts` | 1 | 0 | 0 |
| `src/composables/admin/useInstanceFiltering.ts` | 1 | 0 | 0 |
| `src/composables/booking/useDependentInstances.ts` | 1 | 0 | 0 |
| `src/composables/formFields/useFormFields.ts` | 1 | 0 | 0 |
| `src/composables/useEntityForm.ts` | 1 | 0 | 0 |
| `src/utils/debug/windowDebug.ts` | 1 | 0 | 0 |
| `src/utils/entities/entityFieldPatch.ts` | 1 | 0 | 0 |
| `src/views/admin/tabs/InstancesTab.vue` | 1 | 0 | 0 |

## Notes

- This is a *signal* index. Use `client/.typecheck/typecheck-audit.md` for detailed errors.
- Priority (P0/P1/P2) is computed via config weights in `client/.typecheck/typecheck-audit-config.json`.
