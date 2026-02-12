# Typecheck Audit Summary (Generated)

Generated from `.audit-reports/typecheck/typecheck-audit.json`.

## Pool index (ranked)

| Priority | Pool | score | errors | files | severity | blast | repetition | unsafeCasts | suppressions |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| P0 | `TS2322-ts2322-assign-string-null-string` | 24 | 2 | 1 | 20 | 2 | 2 | 0 | 0 |
| P1 | `TS2367-ts2367-this-comparison-appears-to-be-unintentional-because-the-types-roundup-rounddown-roundnearest-and-have-no-overlap` | 13 | 1 | 1 | 10 | 2 | 1 | 0 | 0 |

## File index (ranked)

| File | errors | unsafeCasts | suppressions |
| --- | ---: | ---: | ---: |
| `src/utils/transformers/fetchToGlobalTransformer.ts` | 2 | 0 | 0 |
| `src/utils/booking/durationRounding.ts` | 1 | 0 | 0 |

## Notes

- This is a *signal* index. Use `client/.typecheck/typecheck-audit.md` for detailed errors.
- Priority (P0/P1/P2) is computed via config weights in `client/.typecheck/typecheck-audit-config.json`.
