**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Composable-Health Audit Summary (Generated)

Generated from `client/.audit-reports/composable-health-audit.json`.

## Overview

| Metric | Count |
| --- | ---: |
| Total scanned | 277 |
| Findings | 177 |
| Files with findings | 122 |

## Delta (vs previous run)

| Baseline state | Count |
| --- | ---: |
| New | 177 |
| Regressed | 0 |
| Unchanged | 0 |
| Resolved | 0 |

### By rule

| Rule | New | Unchanged | Resolved | Regressed |
| --- | ---: | ---: | ---: | ---: |
| missing-return-type | 50 | 0 | 0 | 0 |
| watcher-no-scope-dispose | 50 | 0 | 0 | 0 |
| oversized-return | 35 | 0 | 0 | 0 |
| untyped-provide | 18 | 0 | 0 | 0 |
| re-export-barrel | 11 | 0 | 0 | 0 |
| module-level-ref | 6 | 0 | 0 | 0 |
| spread-return | 5 | 0 | 0 | 0 |
| excessive-composable-imports | 2 | 0 | 0 | 0 |

### New findings

| File | Line | Rule | Snippet |
| --- | ---: | --- | --- |
| `client/src/composables/admin/tables/useAppointmentsTableHandlers.ts` | 13 | missing-return-type | export function useAppointmentsTableHandlers(params: UseAppo |
| `client/src/composables/admin/tables/useAppointmentsTableHandlers.ts` | 103 | oversized-return | Return surface has 20 properties |
| `client/src/composables/admin/tables/useCrudDataTableModel.ts` | 119 | oversized-return | Return surface has 18 properties |
| `client/src/composables/admin/useAdmin.ts` | 161 | missing-return-type | export function useAdmin() { |
| `client/src/composables/admin/useAdminAvailabilitySettings.ts` | 1 | watcher-no-scope-dispose | watch()/watchEffect() without onScopeDispose |
| `client/src/composables/admin/useAdminMetadataMutations.ts` | 15 | missing-return-type | export function useAdminMetadataMutations() { |
| `client/src/composables/admin/useAdminPrimitiveMetadataMutations.ts` | 14 | missing-return-type | export function useAdminPrimitiveMetadataMutations() { |
| `client/src/composables/admin/useAdminRelationshipMetadataMutations.ts` | 12 | missing-return-type | export function useAdminRelationshipMetadataMutations() { |
| `client/src/composables/admin/useApiDevPanelVisibility.ts` | 1 | watcher-no-scope-dispose | watch()/watchEffect() without onScopeDispose |
| `client/src/composables/admin/useBlockInstanceCreate.ts` | 1 | watcher-no-scope-dispose | watch()/watchEffect() without onScopeDispose |
| `client/src/composables/admin/useBufferSettings.ts` | 249 | oversized-return | Return surface has 11 properties |
| `client/src/composables/admin/useBusinessControlsFormState.ts` | 15 | missing-return-type | export function useBusinessControlsFormState(params: UseBusi |
| `client/src/composables/admin/useBusinessControlsFormState.ts` | 94 | oversized-return | Return surface has 29 properties |
| `client/src/composables/admin/useBusinessHoursFormState.ts` | 10 | missing-return-type | export function useBusinessHoursFormState(formData: Ref<Avai |
| `client/src/composables/admin/useBusinessRuleForm.ts` | 1 | watcher-no-scope-dispose | watch()/watchEffect() without onScopeDispose |
| `client/src/composables/admin/useBusinessRuleForm.ts` | 11 | missing-return-type | export function useBusinessRuleForm(selectedBlockId: Ref<Glo |
| `client/src/composables/admin/useBusinessRuleForm.ts` | 155 | oversized-return | Return surface has 12 properties |
| `client/src/composables/admin/useBusinessRules.ts` | 32 | missing-return-type | export function useBusinessRules() { |
| `client/src/composables/admin/useBusinessRules.ts` | 148 | oversized-return | Return surface has 11 properties |
| `client/src/composables/admin/useBusinessRulesTab.ts` | 1 | watcher-no-scope-dispose | watch()/watchEffect() without onScopeDispose |
| *...and 157 more* | | | |

## By rule

| Rule | Severity | Count |
| --- | --- | ---: |
| missing-return-type | P0 | 50 |
| watcher-no-scope-dispose | info | 50 |
| oversized-return | P1 | 35 |
| untyped-provide | P1 | 18 |
| re-export-barrel | P2 | 11 |
| module-level-ref | info | 6 |
| spread-return | info | 5 |
| excessive-composable-imports | P1 | 2 |

## Repair waves

- **Local** (not exported or zero consumers): 43
- **Low fan-in** (exported, 1–3 consumers): 112
- **High fan-in** (exported, 4+ consumers): 22

## Top 20 files by severity

| File | Priority | Score |
| --- | --- | ---: |
| `client/src/composables/booking/useWizardStepDataRefs.ts` | P0 | 28 |
| `client/src/composables/booking/useWizardDateAvailability.ts` | P1 | 8 |
| `client/src/composables/booking/useAvailabilityOrchestrator.ts` | P1 | 7 |
| `client/src/composables/admin/tables/useAppointmentsTableHandlers.ts` | P2 | 5 |
| `client/src/composables/admin/useBusinessControlsFormState.ts` | P2 | 5 |
| `client/src/composables/admin/useBusinessRuleForm.ts` | P2 | 5 |
| `client/src/composables/admin/useBusinessRules.ts` | P2 | 5 |
| `client/src/composables/admin/useBusinessRulesTab.ts` | P2 | 5 |
| `client/src/composables/admin/useCalendarHoldFormState.ts` | P2 | 5 |
| `client/src/composables/admin/useEntityCardSubPanels.ts` | P2 | 5 |
| `client/src/composables/admin/usePartsCollectionField.ts` | P2 | 5 |
| `client/src/composables/admin/useRelationshipCollectionField.ts` | P2 | 5 |
| `client/src/composables/admin/useShapesTabCreation.ts` | P2 | 5 |
| `client/src/composables/admin/useShapesTabModals.ts` | P2 | 5 |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | P2 | 5 |
| `client/src/composables/entityCrud/useEntityCrud.ts` | P2 | 5 |
| `client/src/composables/useComponentEntity.ts` | P2 | 5 |
| `client/src/composables/useFormValidation.ts` | P2 | 5 |
| `client/src/composables/admin/usePartInstanceCollection.ts` | P2 | 4 |
| `client/src/composables/admin/useAdmin.ts` | P2 | 3 |


## Notes

- Full report: `client/.audit-reports/composable-health-audit.md`. Rules: missing return types, oversized return surfaces, module-level reactive state, etc. Use repair waves for prioritized fixes.
