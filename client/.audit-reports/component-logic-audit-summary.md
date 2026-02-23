**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Component Logic Audit Summary (Generated)

Generated from `client/.audit-reports/component-logic-audit.json`.

## Top 30 files (Tier 1 score)

| File | Priority | score | watch | async | await | map | reduce | DOM | inline :config | console | alert |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `client/src/views/admin/tabs/BusinessRulesTab.vue` | P1 | 10 | 1 | 3 | 4 | 2 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/beta/BetaFeedbackModal.vue` | P1 | 8 | 1 | 1 | 2 | 0 | 0 | 4 | 0 | 0 | 0 |
| `client/src/components/common/AddressAutocomplete.vue` | P1 | 8 | 1 | 3 | 4 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/admin/generic/EntityCard.vue` | P2 | 6 | 1 | 2 | 2 | 1 | 0 | 0 | 0 | 0 | 0 |
| `client/src/views/admin/tabs/InstancesTab.vue` | P2 | 6 | 1 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 1 |
| `client/src/components/admin/generic/collections/RelationshipCollection.vue` | P2 | 5 | 0 | 2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue` | P2 | 4 | 0 | 1 | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/booking/dev/DevPanelsContainer.vue` | P2 | 4 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 0 |
| `client/src/views/admin/entities/BlockShapeForm.vue` | P2 | 4 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/views/admin/entities/PartShapeForm.vue` | P2 | 4 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | P2 | 4 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/views/admin/tabs/PropertyMappingsTab.vue` | P2 | 4 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/views/admin/tabs/ShapesTab.vue` | P2 | 4 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/admin/BlockInstanceCreateModal.vue` | P2 | 3 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/admin/generic/EntityCardFeePreview.vue` | P2 | 3 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/admin/generic/fields/BooleanInput.vue` | P2 | 3 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/beta/BetaFeedbackDetailModal.vue` | P2 | 3 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/layouts/components/NavSearchBar.vue` | P2 | 3 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/views/admin/tabs/components/FeeCalibrationPanel.vue` | P2 | 3 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/admin/generic/EntityCardSubPanels.vue` | P2 | 2 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/admin/MetadataEditModal.vue` | P2 | 2 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/admin/PartInstanceBulkEditModal.vue` | P2 | 2 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 |
| `client/src/components/beta/BetaFeedbackDashboard.vue` | P2 | 2 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/booking/dev/DevPanelToggle.vue` | P2 | 2 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |
| `client/src/layouts/components/NavBarNotifications.vue` | P2 | 2 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| `client/src/layouts/components/UserProfile.vue` | P2 | 2 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/views/admin/entities/BlockShapeList.vue` | P2 | 2 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/views/admin/entities/PartInstanceList.vue` | P2 | 2 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/views/admin/entities/PartShapeList.vue` | P2 | 2 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `client/src/components/admin/component/ComponentDistributionModal.vue` | P2 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |


## Notes

- This is a *signal* index. Use the full report: `client/.audit-reports/component-logic-audit.md`.
