# Type-Escape Audit Summary (Generated)

Generated from `.audit-reports/type-escape-audit.json`.

## Overview

| Metric | Count |
| --- | ---: |
| Files scanned | 783 |
| Total findings | 70 |
| Files with findings | 40 |

## By rule

| Rule | Count |
| --- | ---: |
| as-unknown-as | 56 |
| as-unknown | 9 |
| as-any | 5 |

## Top 20 files (by score)

| File | Priority | Score |
| --- | --- | ---: |
| `client/src/composables/booking/useDependentInstances.ts` | P0 | 24 |
| `client/src/configs/field/form/_archived/selectableFieldConfig.ts` | P0 | 20 |
| `client/src/components/admin/InstanceBulkEditModal.vue` | P1 | 12 |
| `client/src/components/admin/PartInstanceBulkEditModal.vue` | P1 | 12 |
| `client/src/composables/admin/useEntityCardStoreSync.ts` | P1 | 12 |
| `client/src/composables/formFields/useFormFieldsContext.ts` | P1 | 12 |
| `client/src/utils/dependencyCleanup.ts` | P1 | 12 |
| `server/src/routes/helpers/dataController.ts` | P1 | 10 |
| `client/src/components/admin/generic/EntityCard.vue` | P1 | 8 |
| `client/src/composables/admin/useBufferSettings.ts` | P1 | 8 |
| `client/src/composables/admin/useInstanceFiltering.ts` | P1 | 8 |
| `client/src/composables/admin/useStatusButtonToggle.ts` | P1 | 8 |
| `client/src/composables/booking/useBlockInstanceSelection.ts` | P1 | 8 |
| `client/src/composables/entityCrud/useSharedMutationHandlers.ts` | P1 | 6 |
| `client/src/components/admin/generic/DynamicForm.vue` | P2 | 4 |
| `client/src/components/admin/generic/EntityFormContent.vue` | P2 | 4 |
| `client/src/components/booking/TimeBasisButtonGrid.vue` | P2 | 4 |
| `client/src/components/booking/TimeBasisSelector.vue` | P2 | 4 |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | P2 | 4 |
| `client/src/components/booking/plugins/wizardStatePlugin.ts` | P2 | 4 |

*...and 20 more files. See full report for details.*

## Notes

- Full report: `client/.audit-reports/type-escape-audit.md`
- Rules: as-any, as-unknown, as-unknown-as, ts-ignore, ts-expect-error
