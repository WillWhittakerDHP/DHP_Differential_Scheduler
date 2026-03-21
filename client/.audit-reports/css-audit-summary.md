**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# CSS Extraction Audit Summary (Generated)

Generated from `client/.audit-reports/css-audit.json`.

- Files with findings: **21**

## Top 21 files

| File | Priority | score | large-style | empty | unscoped | inline-static | inline-dynamic | !important | :deep | magic-color | css-in-ts |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `client/src/layouts/default.vue` | P2 | 6 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/admin/generic/fields/SelectInputs.vue` | P2 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 |
| `client/src/components/admin/generic/EntityCardFeePreview.vue` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 |
| `client/src/components/admin/generic/fields/IconInput.vue` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 |
| `client/src/views/admin/tabs/InstancesTab.vue` | P2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 |
| `client/src/components/admin/generic/fields/BaseInput.vue` | P2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 |
| `client/src/components/admin/generic/fields/TextInput.vue` | P2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 |
| `client/src/components/AppNotification.vue` | P2 | 2 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | P2 | 2 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/common/AddressAutocomplete.vue` | P2 | 2 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/views/admin/tabs/ShapesTab.vue` | P2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 |
| `client/src/App.vue` | P2 | 1 | 0 | 0 | 1 | 1 | 1 | 0 | 1 | 0 | 0 |
| `client/src/components/admin/BlockInstanceCreateModal.vue` | P2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| `client/src/components/admin/InstanceBulkEditModal.vue` | P2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| `client/src/components/admin/PartInstanceBulkEditModal.vue` | P2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| `client/src/components/beta/BetaFeedbackDashboard.vue` | P2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| `client/src/components/booking/DependentInstanceCheckboxList.vue` | P2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| `client/src/components/booking/dev/DevPanelToggle.vue` | P2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| `client/src/components/booking/IndependentSelectCard.vue` | P2 | 1 | 0 | 0 | 0 | 1 | 1 | 0 | 1 | 0 | 0 |
| `client/src/components/booking/SelectionCardGroup.vue` | P2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| `client/src/components/booking/steps/ConfirmationStep.vue` | P2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |

## Notes

- This is a *signal* index. Use the full report: `client/.audit-reports/css-audit.md`.
