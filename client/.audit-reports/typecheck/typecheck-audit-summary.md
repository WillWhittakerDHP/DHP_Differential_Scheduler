**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Typecheck Audit Summary (Generated)

Generated from `.audit-reports/typecheck/typecheck-audit.json`.

## Pool index (ranked)

| Priority | Pool | score | errors | files | severity | blast | repetition | unsafeCasts | suppressions |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| P0 | `TS2304-ts2304-cannot-find-name-globalentityid` | 79 | 7 | 1 | 70 | 2 | 7 | 0 | 0 |
| P0 | `TS2344-ts2344-type-collectionitem-does-not-satisfy-the-constraint-identifiablebyid` | 74 | 6 | 4 | 60 | 8 | 6 | 0 | 0 |
| P0 | `TS2304-ts2304-cannot-find-name-rfc3339datetime` | 46 | 4 | 1 | 40 | 2 | 4 | 0 | 0 |
| P0 | `TS2322-ts2322-assign-number-null-undefined-number-null` | 46 | 4 | 1 | 40 | 2 | 4 | 0 | 0 |
| P0 | `TS2552-ts2552-cannot-find-name-globalentityid-did-you-mean-globalentitykey` | 44 | 6 | 1 | 36 | 2 | 6 | 0 | 0 |
| P0 | `TS2345-ts2345-arg-bookingblockinstance-readonly-identifiablebyid` | 37 | 3 | 2 | 30 | 4 | 3 | 0 | 0 |
| P0 | `TS2304-ts2304-cannot-find-name-formcontext` | 35 | 3 | 1 | 30 | 2 | 3 | 0 | 0 |
| P0 | `TS2322-ts2322-assign-identifiablebyid-null-bookingblockinstance-null` | 26 | 2 | 2 | 20 | 4 | 2 | 0 | 0 |
| P0 | `TS2304-ts2304-cannot-find-name-iso8601date` | 24 | 2 | 1 | 20 | 2 | 2 | 0 | 0 |
| P0 | `TS2322-ts2322-assign-googlecalendarbusyperiod` | 24 | 2 | 1 | 20 | 2 | 2 | 0 | 0 |
| P0 | `TS2322-ts2322-assign-writablecomputedref-writablecomputedref` | 24 | 2 | 1 | 20 | 2 | 2 | 0 | 0 |
| P1 | `TS2304-ts2304-cannot-find-name-attendeerequest` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2304-ts2304-cannot-find-name-fieldmetadataentry` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2304-ts2304-cannot-find-name-identifiablebyid` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-basement-crawlspace-slab-null-undefined-basement-crawlspace-slab-null` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-identifiablebyid-bookingblockinstance` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-ref-void-submitform-promise-name-string-meta-formmeta-25-more-resetfield-void-undefined-formcontext-ref-un` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2339-ts2339-prop-adminconfig-useformfieldsoptionsbase` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2345-ts2345-arg-direction-enforcement-maxhours` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2345-ts2345-arg-direction-enforcement-maxincome` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2353-ts2353-object-literal-may-only-specify-known-properties-and-adminconfig-does-not-exist-in-type-useformfieldsoptionsbase` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2769-ts2769-no-overload-matches-this-call` | 12 | 1 | 1 | 9 | 2 | 1 | 0 | 0 |
| P1 | `TS18048-ts18048-selectedusertypeblock-is-possibly-undefined` | 11 | 1 | 1 | 8 | 2 | 1 | 0 | 0 |

## File index (ranked)

| File | errors | unsafeCasts | suppressions |
| --- | ---: | ---: | ---: |
| `src/types/entities.ts` | 13 | 0 | 0 |
| `src/types/datetime.ts` | 6 | 0 | 0 |
| `src/composables/booking/usePropertyDetailsLogic.ts` | 5 | 0 | 0 |
| `src/composables/formFields/useFormFieldsContext.ts` | 5 | 0 | 0 |
| `src/composables/admin/useCapacitySettings.ts` | 4 | 0 | 0 |
| `src/utils/transformers/appointmentToWizardHelpers.ts` | 4 | 0 | 0 |
| `src/composables/businessDataCollections/useBusinessDataCollectionCrud.ts` | 2 | 0 | 0 |
| `src/composables/globalDataCollections/useGlobalDataCollectionCrud.ts` | 2 | 0 | 0 |
| `src/utils/booking/mockGoogleCalendar.ts` | 2 | 0 | 0 |
| `src/utils/transformers/appointmentToWizardTransformer.ts` | 2 | 0 | 0 |
| `src/composables/admin/useEntityCardForm.ts` | 1 | 0 | 0 |
| `src/composables/booking/useInstanceDescriptions.ts` | 1 | 0 | 0 |
| `src/composables/businessDataCollections/useBusinessDataCollectionActions.ts` | 1 | 0 | 0 |
| `src/composables/formFields/useFormFields.ts` | 1 | 0 | 0 |
| `src/composables/globalDataCollections/useGlobalDataCollectionActions.ts` | 1 | 0 | 0 |
| `src/types/appointmentApi.ts` | 1 | 0 | 0 |
| `src/utils/collections/appendIfMissingById.ts` | 1 | 0 | 0 |
| `src/views/admin/tabs/components/AppointmentsCreateForm.vue` | 1 | 0 | 0 |

## Notes

- This is a *signal* index. Use `client/.typecheck/typecheck-audit.md` for detailed errors.
- Priority (P0/P1/P2) is computed via config weights in `client/.typecheck/typecheck-audit-config.json`.
