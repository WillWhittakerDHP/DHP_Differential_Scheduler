# Typecheck Audit Summary (Generated)

Generated from `.audit-reports/typecheck/typecheck-audit.json`.

## Pool index (ranked)

| Priority | Pool | score | errors | files | severity | blast | repetition | unsafeCasts | suppressions |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| P1 | `TS2322-ts2322-assign-string-adminobject-validcascades-adminobject-validparts-adminobject-bookingcascades-adminobject-activepart` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |
| P1 | `TS2739-ts2739-type-ref-boolean-boolean-is-missing-the-following-properties-from-type-computedref-boolean-effect-computedrefsymb` | 12 | 1 | 1 | 9 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-currententity-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-globalfieldkey-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-relationship-keys-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-useentitymetadata-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |
| P2 | `TS6133-ts6133-usefieldlocation-is-declared-but-its-value-is-never-read` | 6 | 1 | 1 | 3 | 2 | 1 | 0 | 0 |

## File index (ranked)

| File | errors | unsafeCasts | suppressions |
| --- | ---: | ---: | ---: |
| `src/components/admin/generic/EntityCard.vue` | 4 | 0 | 0 |
| `src/composables/fieldContext/useFieldContextSaveHelpers.ts` | 2 | 0 | 0 |
| `src/utils/transformers/globalToAdminTransformer.ts` | 1 | 0 | 0 |

## Notes

- This is a *signal* index. Use `client/.typecheck/typecheck-audit.md` for detailed errors.
- Priority (P0/P1/P2) is computed via config weights in `client/.typecheck/typecheck-audit-config.json`.
