**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Duplication Audit Summary (Generated)

Generated from `client/.audit-reports/duplication-audit.json`.

## Index (ranked)

| Group | Priority | unique files | occurrences | lineCount | sample locations |
| --- | --- | ---: | ---: | ---: | --- |
| `dup-39164113c7d0` | P0 | 2 | 3 | 10 | `client/src/composables/admin/useShapesTab.ts@49`, `client/src/composables/admin/useShapesTab.ts@199`, `client/src/composables/admin/useShapesTabModals.ts@55` |
| `dup-6d904a607168` | P0 | 2 | 3 | 10 | `client/src/composables/admin/useShapesTab.ts@48`, `client/src/composables/admin/useShapesTab.ts@198`, `client/src/composables/admin/useShapesTabModals.ts@54` |
| `dup-03cc625a46aa` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useOverlapConstraintsPanel.ts@95`, `client/src/views/admin/tabs/components/OverlapConstraintsPanel.vue@17` |
| `dup-03ecf443188e` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useShapesTabModals.ts@10`, `client/src/types/admin/shapesTab.ts@22` |
| `dup-0cd5727b10ad` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useShapesTab.ts@211`, `client/src/composables/admin/useShapesTabCreation.ts@148` |
| `dup-0eec51133848` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useOverlapConstraintsPanel.ts@99`, `client/src/views/admin/tabs/components/OverlapConstraintsPanel.vue@21` |
| `dup-15b042726270` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useOverlapConstraintsPanel.ts@94`, `client/src/views/admin/tabs/components/OverlapConstraintsPanel.vue@16` |
| `dup-2f3ba6277c62` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useShapesTabCreation.ts@16`, `client/src/types/admin/shapesTab.ts@32` |
| `dup-4613f08a0dd9` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useOverlapConstraintsPanel.ts@96`, `client/src/views/admin/tabs/components/OverlapConstraintsPanel.vue@18` |
| `dup-593e42bee1ad` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useShapesTab.ts@213`, `client/src/composables/admin/useShapesTabCreation.ts@150` |
| `dup-702d91fa95aa` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useShapesTab.ts@212`, `client/src/composables/admin/useShapesTabCreation.ts@149` |
| `dup-76dd3e40c0ef` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useOverlapConstraintsPanel.ts@97`, `client/src/views/admin/tabs/components/OverlapConstraintsPanel.vue@19` |
| `dup-7bbc40d4cc56` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useOverlapConstraintsPanel.ts@100`, `client/src/views/admin/tabs/components/OverlapConstraintsPanel.vue@22` |
| `dup-8664cd70ff8d` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useShapesTab.ts@214`, `client/src/composables/admin/useShapesTabCreation.ts@151` |
| `dup-87a347e1daf9` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useOverlapConstraintsPanel.ts@98`, `client/src/views/admin/tabs/components/OverlapConstraintsPanel.vue@20` |
| `dup-8c3423862ea4` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useShapesTabModals.ts@9`, `client/src/types/admin/shapesTab.ts@21` |
| `dup-9b4f257f5a9a` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useShapesTab.ts@215`, `client/src/composables/admin/useShapesTabCreation.ts@152` |
| `dup-a3072b74e292` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useShapesTab.ts@210`, `client/src/composables/admin/useShapesTabCreation.ts@147` |
| `dup-bba3eec172a6` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useOverlapConstraintsPanel.ts@93`, `client/src/views/admin/tabs/components/OverlapConstraintsPanel.vue@15` |
| `dup-c1f632479d25` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useShapesTab.ts@209`, `client/src/composables/admin/useShapesTabCreation.ts@146` |

## Notes

- This is a *signal* index. Use the full report: `client/.audit-reports/duplication-audit.md`.
