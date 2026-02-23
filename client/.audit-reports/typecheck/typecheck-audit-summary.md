**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Typecheck Audit Summary (Generated)

Generated from `client/.audit-reports/typecheck/typecheck-audit.json`.

## Pool index (ranked)

| Priority | Pool | score | errors | files | severity | blast | repetition | unsafeCasts | suppressions |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| P0 | `TS1109-ts1109-expression-expected` | 427 | 55 | 21 | 330 | 42 | 55 | 0 | 0 |
| P0 | `TS1005-ts1005-expected` | 360 | 44 | 26 | 264 | 52 | 44 | 0 | 0 |
| P0 | `TS1005-ts1005-expected` | 298 | 36 | 23 | 216 | 46 | 36 | 0 | 0 |
| P0 | `TS1128-ts1128-declaration-or-statement-expected` | 102 | 12 | 9 | 72 | 18 | 12 | 0 | 0 |
| P0 | `TS1131-ts1131-property-or-signature-expected` | 97 | 11 | 10 | 66 | 20 | 11 | 0 | 0 |
| P0 | `TS1011-ts1011-an-element-access-expression-should-take-an-argument` | 32 | 4 | 2 | 24 | 4 | 4 | 0 | 0 |
| P0 | `TS1005-ts1005-expected` | 18 | 2 | 2 | 12 | 4 | 2 | 0 | 0 |
| P0 | `TS1005-ts1005-expected` | 18 | 2 | 2 | 12 | 4 | 2 | 0 | 0 |
| P0 | `TS1136-ts1136-property-assignment-expected` | 18 | 2 | 2 | 12 | 4 | 2 | 0 | 0 |
| P2 | `TS1005-ts1005-expected` | 9 | 1 | 1 | 6 | 2 | 1 | 0 | 0 |

## File index (ranked)

| File | errors | unsafeCasts | suppressions |
| --- | ---: | ---: | ---: |
| `src/components/booking/types/selectionCardTypes.ts` | 20 | 0 | 0 |
| `src/components/admin/generic/CardButton.vue` | 16 | 0 | 0 |
| `src/configs/availabilitySettings.ts` | 16 | 0 | 0 |
| `src/components/admin/generic/EntityFormContent.vue` | 10 | 0 | 0 |
| `src/composables/admin/useBusinessRules.ts` | 9 | 0 | 0 |
| `src/components/admin/generic/fields/FieldRenderer.vue` | 7 | 0 | 0 |
| `src/composables/useFormValidation.ts` | 6 | 0 | 0 |
| `src/components/booking/plugins/localStatePlugin.ts` | 5 | 0 | 0 |
| `src/components/booking/plugins/wizardStatePlugin.ts` | 5 | 0 | 0 |
| `src/composables/businessDataCollections/types.ts` | 5 | 0 | 0 |
| `src/composables/admin/useBlockInstanceForm.ts` | 4 | 0 | 0 |
| `src/composables/admin/useIconPickerState.ts` | 4 | 0 | 0 |
| `src/composables/admin/usePartInstanceForm.ts` | 4 | 0 | 0 |
| `src/composables/booking/useAvailabilityDefaults.ts` | 4 | 0 | 0 |
| `src/composables/booking/useAvailabilityStepHandlers.ts` | 4 | 0 | 0 |
| `src/composables/booking/useBookingWizard.ts` | 4 | 0 | 0 |
| `src/composables/useLoadingIndicator.ts` | 4 | 0 | 0 |
| `src/composables/useNotification.ts` | 4 | 0 | 0 |
| `src/composables/admin/usePartInstanceBulkEdit.ts` | 3 | 0 | 0 |
| `src/composables/booking/selectionCard/useSelectionCardState.ts` | 3 | 0 | 0 |
| `src/composables/booking/useAvailabilityLogic.ts` | 3 | 0 | 0 |
| `src/composables/useComponentDistribution.ts` | 3 | 0 | 0 |
| `src/composables/admin/useInstanceGrouping.ts` | 2 | 0 | 0 |
| `src/composables/admin/useSelectFiltering.ts` | 2 | 0 | 0 |
| `src/composables/booking/useInstanceComponents.ts` | 2 | 0 | 0 |
| `src/composables/booking/useInstanceComponentsList.ts` | 2 | 0 | 0 |
| `src/composables/booking/useWizardAppointmentManagement.ts` | 2 | 0 | 0 |
| `src/composables/useSelectOptions.ts` | 2 | 0 | 0 |
| `src/composables/admin/useInstanceTabHandlers.ts` | 1 | 0 | 0 |
| `src/composables/admin/useMetadataCache.ts` | 1 | 0 | 0 |
| `src/composables/admin/usePartInstanceCollection.ts` | 1 | 0 | 0 |
| `src/composables/admin/usePartsCollectionField.ts` | 1 | 0 | 0 |
| `src/composables/admin/useRelationshipCollection.ts` | 1 | 0 | 0 |
| `src/composables/admin/useSelectConfig.ts` | 1 | 0 | 0 |
| `src/composables/admin/useStatusButtonHandlers.ts` | 1 | 0 | 0 |
| `src/composables/booking/dev/usePanelPosition.ts` | 1 | 0 | 0 |
| `src/composables/booking/useAvailabilityStepData.ts` | 1 | 0 | 0 |
| `src/composables/booking/useAvailabilityUI.ts` | 1 | 0 | 0 |
| `src/composables/booking/useInstanceSelectionConfig.ts` | 1 | 0 | 0 |
| `src/composables/booking/usePropertyDetailsLogic.ts` | 1 | 0 | 0 |
| `src/composables/booking/usePropertyFormWatchers.ts` | 1 | 0 | 0 |
| `src/composables/booking/usePropertyValidation.ts` | 1 | 0 | 0 |

## Notes

- This is a *signal* index. Use `client/.audit-reports/typecheck/typecheck-audit.md` for detailed errors.
- Priority from config: `client/.audit-reports/typecheck/typecheck-audit-config.json`.
