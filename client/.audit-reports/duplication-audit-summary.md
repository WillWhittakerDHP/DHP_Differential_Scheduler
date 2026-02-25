**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Duplication Audit Summary (Generated)

Generated from `client/.audit-reports/duplication-audit.json`.

## Index (ranked)

| Group | Priority | unique files | occurrences | lineCount | sample locations |
| --- | --- | ---: | ---: | ---: | --- |
| `dup-02e09562fbee` | P0 | 2 | 2 | 10 | `client/src/utils/admin/metadataFieldUpdates.ts@40`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@19` |
| `dup-0399e7cb7a09` | P0 | 2 | 2 | 10 | `client/src/utils/admin/metadataFieldUpdates.ts@36`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@15` |
| `dup-216670b622fd` | P0 | 2 | 2 | 10 | `client/src/utils/admin/metadataFieldUpdates.ts@38`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@17` |
| `dup-24e89764b1f9` | P0 | 2 | 2 | 10 | `client/src/components/admin/InstanceBulkEditModal.vue@162`, `client/src/components/admin/PartInstanceBulkEditModal.vue@183` |
| `dup-2a12de2d7d9a` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@186`, `client/src/composables/admin/useRelationshipCollectionField.ts@188` |
| `dup-345455ae5c05` | P0 | 2 | 2 | 10 | `client/src/components/admin/InstanceBulkEditModal.vue@155`, `client/src/components/admin/PartInstanceBulkEditModal.vue@176` |
| `dup-434e272ef180` | P0 | 2 | 2 | 10 | `client/src/utils/admin/metadataFieldUpdates.ts@37`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@16` |
| `dup-5cdea5a5f126` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@23`, `client/src/composables/admin/useRelationshipCollectionField.ts@23` |
| `dup-911d1500cc08` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@182`, `client/src/composables/admin/useRelationshipCollectionField.ts@184` |
| `dup-a08a21eabaf1` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@22`, `client/src/composables/admin/useRelationshipCollectionField.ts@22` |
| `dup-ad8ee8be63f6` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@24`, `client/src/composables/admin/useRelationshipCollectionField.ts@24` |
| `dup-b36fd2f2d669` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@29`, `client/src/composables/admin/useRelationshipCollectionField.ts@27` |
| `dup-bbbe20e10e53` | P0 | 2 | 2 | 10 | `client/src/components/admin/InstanceBulkEditModal.vue@161`, `client/src/components/admin/PartInstanceBulkEditModal.vue@182` |
| `dup-f3908ce6488c` | P0 | 2 | 2 | 10 | `client/src/components/admin/InstanceBulkEditModal.vue@166`, `client/src/components/admin/PartInstanceBulkEditModal.vue@187` |
| `dup-f5dc7d13d6e7` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@25`, `client/src/composables/admin/useRelationshipCollectionField.ts@25` |

## Notes

- This is a *signal* index. Use the full report: `client/.audit-reports/duplication-audit.md`.
