**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Deprecation & Legacy Accommodation Audit Summary (Generated)

Generated from `client/.audit-reports/deprecation-audit.json`.

- Files with findings: **55**
- Requiring review: **137**
- Allowed exceptions: **46**

- Annotated deprecations: **0**
- Runtime legacy accommodation: **137**

## Top 30 files (ranked by score)

| File | Priority | Score | Annotations | Legacy/Compat |
| --- | --- | ---: | ---: | ---: |
| `client/src/utils/booking/confirmationStepData.ts` | P0 | 15 | 0 | 8 |
| `client/src/types/admin/adminEntity.ts` | P0 | 10 | 0 | 5 |
| `client/src/composables/booking/useDependentInstances.ts` | P1 | 8 | 0 | 4 |
| `client/src/composables/dataCollections/useDataCollectionActions.ts` | P1 | 8 | 0 | 4 |
| `client/src/composables/formFields/useFormFieldsStandardLayout.ts` | P1 | 8 | 0 | 4 |
| `client/src/components/admin/InstanceBulkEditModal.vue` | P1 | 6 | 0 | 3 |
| `client/src/composables/admin/useDefaultLocation.ts` | P1 | 6 | 0 | 3 |
| `client/src/composables/admin/useSelectConfig.ts` | P1 | 6 | 0 | 3 |
| `client/src/composables/componentEntity/useComponentEntityDomain.ts` | P1 | 6 | 0 | 3 |
| `client/src/composables/fieldContext/useFieldContextState.ts` | P1 | 6 | 0 | 3 |
| `client/src/composables/useBusiness.ts` | P1 | 6 | 0 | 3 |
| `client/src/utils/booking/availabilityStepData.ts` | P1 | 6 | 0 | 3 |
| `client/src/utils/transformers/componentAggregator.ts` | P1 | 6 | 0 | 3 |
| `server/src/services/rateLimiter.ts` | P1 | 6 | 0 | 3 |
| `client/src/components/booking/DifferentialGraph.vue` | P1 | 5 | 0 | 5 |
| `client/src/composables/admin/useBufferSettings.ts` | P1 | 5 | 0 | 3 |
| `client/src/composables/admin/useMetadataFieldOrdering.ts` | P1 | 5 | 0 | 4 |
| `client/src/composables/entityCrud/usePrimitiveMutation.ts` | P1 | 5 | 0 | 3 |
| `client/src/composables/useFormValidation.ts` | P1 | 5 | 0 | 5 |
| `client/src/views/admin/tabs/BusinessControlsTab.vue` | P1 | 5 | 0 | 4 |
| `client/src/components/AppNotification.vue` | P1 | 4 | 0 | 3 |
| `client/src/composables/admin/useAttendeeQuickSelect.ts` | P1 | 4 | 0 | 2 |
| `client/src/composables/admin/useBlockInstanceForm.ts` | P1 | 4 | 0 | 2 |
| `client/src/composables/admin/useBusinessRules.ts` | P1 | 4 | 0 | 2 |
| `client/src/composables/admin/useEntityCardLayout.ts` | P1 | 4 | 0 | 2 |
| `client/src/composables/admin/useInstanceBulkEdit.ts` | P1 | 4 | 0 | 2 |
| `client/src/composables/admin/usePartInstanceForm.ts` | P1 | 4 | 0 | 2 |
| `client/src/composables/booking/useAppointmentDropdown.ts` | P1 | 4 | 0 | 2 |
| `client/src/composables/booking/useAppointmentSlots.ts` | P1 | 4 | 0 | 2 |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | P1 | 4 | 0 | 3 |

*...and 25 more. See full report for details.*

## Notes

- **Annotations**: @deprecated, // Deprecated, (deprecated), LEGACY/compat markers.
- **Legacy/Compat**: Runtime keywords, || '', ?? '', default params, chaining fallbacks.
- See full report: `client/.audit-reports/deprecation-audit.md`.
