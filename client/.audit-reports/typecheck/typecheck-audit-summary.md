# Typecheck Audit Summary (Generated)

Generated from `.audit-reports/typecheck/typecheck-audit.json`.

## Pool index (ranked)

| Priority | Pool | score | errors | files | severity | blast | repetition | unsafeCasts | suppressions |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| P0 | `TS2339-ts2339-prop-fieldmetadata-globalentity` | 224 | 20 | 2 | 200 | 4 | 20 | 0 | 0 |
| P0 | `TS2345-ts2345-arg-globalentity-partshapeentity-null-undefined` | 26 | 2 | 2 | 20 | 4 | 2 | 0 | 0 |
| P0 | `TS7053-ts7053-element-implicitly-has-an-any-type-because-expression-of-type-globalfieldkey-blockinstance-blockshape-partinstanc` | 18 | 2 | 1 | 14 | 2 | 2 | 0 | 0 |
| P1 | `TS2304-ts2304-cannot-find-name-categorizefieldsbysection` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2304-ts2304-cannot-find-name-statusbuttonfield` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-computedref-blockinstance-blockshape-partinstance-partshape-ref` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-computedref-undefined-globalfieldkey-ref-globalfieldkey` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-number-null-undefined-partinstancebulkeditdata-undefined` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2322-ts2322-assign-ref-computedref-undefined-undefined` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2339-ts2339-prop-activeconstituents-blockinstanceentity` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2345-ts2345-arg-globalfieldkey-keyof-blockinstanceentity` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2345-ts2345-arg-globalfieldkey-keyof-partinstanceentity` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS18048-ts18048-vls-ctx-parententity-is-possibly-undefined` | 11 | 1 | 1 | 8 | 2 | 1 | 0 | 0 |
| P1 | `TS7006-ts7006-parameter-f-implicitly-has-an-any-type` | 10 | 1 | 1 | 7 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-computed-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-fieldmetadataentry-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-ge-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-getblockshapefieldmetadata-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-getpartshapefieldmetadata-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-globalfieldkey-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-isdevmodeenabled-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-statusbuttonfield-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6196-ts6196-subpaneltype-is-declared-but-never-used` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |

## File index (ranked)

| File | errors | unsafeCasts | suppressions |
| --- | ---: | ---: | ---: |
| `src/composables/admin/useInstanceShape.ts` | 12 | 0 | 0 |
| `src/components/admin/generic/EntityCard.vue` | 9 | 0 | 0 |
| `src/views/admin/tabs/InstancesTab.vue` | 6 | 0 | 0 |
| `src/composables/admin/useStatusButtonFields.ts` | 4 | 0 | 0 |
| `src/components/admin/generic/collections/PartsCollection.vue` | 3 | 0 | 0 |
| `src/components/admin/generic/fields/InputRenderer.vue` | 2 | 0 | 0 |
| `src/components/admin/PartInstanceBulkEditModal.vue` | 2 | 0 | 0 |
| `src/composables/admin/usePartInstanceBulkEdit.ts` | 2 | 0 | 0 |
| `src/utils/forms/fieldSectionCategorization.ts` | 2 | 0 | 0 |
| `src/components/admin/BlockShapeEditModal.vue` | 1 | 0 | 0 |
| `src/components/admin/PartShapeEditModal.vue` | 1 | 0 | 0 |

## Notes

- This is a *signal* index. Use `client/.typecheck/typecheck-audit.md` for detailed errors.
- Priority (P0/P1/P2) is computed via config weights in `client/.typecheck/typecheck-audit-config.json`.
