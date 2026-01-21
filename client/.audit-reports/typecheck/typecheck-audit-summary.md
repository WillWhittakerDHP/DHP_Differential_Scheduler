# Typecheck Audit Summary (Generated)

Generated from `.audit-reports/typecheck/typecheck-audit.json`.

## Pool index (ranked)

| Priority | Pool | score | errors | files | severity | blast | repetition | unsafeCasts | suppressions |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| P0 | `TS2345-ts2345-arg-getfieldkeysoptions` | 26 | 2 | 2 | 20 | 4 | 2 | 0 | 0 |
| P2 | `TS6133-ts6133-props-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-storeentity-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-storesyncresult-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |

## File index (ranked)

| File | errors | unsafeCasts | suppressions |
| --- | ---: | ---: | ---: |
| `src/components/admin/generic/EntityCard.vue` | 2 | 0 | 0 |
| `src/components/admin/generic/DynamicForm.vue` | 1 | 0 | 0 |
| `src/components/admin/generic/EntityCardContent.vue` | 1 | 0 | 0 |
| `src/components/admin/generic/EntityFormContent.vue` | 1 | 0 | 0 |

## Notes

- This is a *signal* index. Use `client/.typecheck/typecheck-audit.md` for detailed errors.
- Priority (P0/P1/P2) is computed via config weights in `client/.typecheck/typecheck-audit-config.json`.
