# Pre-Typecheck Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Use this report to build a **repair plan** before running `audit:all` or `typecheck:audit`.

Generated at: 2026-02-23T19:38:07.414Z

## Pre-Typecheck Audit Summary

| Audit | Files with findings | Total findings | Detail |
| --- | ---: | ---: | --- |
| type-similarity | 21 | 21 | Similarity groups (UNIFY/BRAND/EXTEND/REVIEW): 21 |
| dep-freshness | 5 | 5 | Outdated: 5 (major: 1, minor: 0, patch: 4) |
| import-hygiene | 0 | 0 | Barrel: 0, Deep relative: 0, Type re-export: 0, Inconsistent: 0, Duplicate re-exports: 0 |
| import-graph | 0 | 0 | Cycles: 0, Fan-out violations: 0, Fan-in violations: 0 |
| api-contract | 0 | 0 | Client/server type mismatches: 0 |
| type-escape | 0 | 0 | Type escape hatches (as any, ts-ignore, etc.): 0 |
| type-import | 0 | 0 | Value-from-type-only: 0, Type-used-as-value: 0 |

Audits loaded: 7 / 7

## Repair plan readiness

**Total pre-typecheck findings:** 26

Address the findings above (see each audit's JSON/MD in `.audit-reports/`) before relying on typecheck or full audit.

## Top hotspot files (pre-typecheck only)

Files appearing in multiple pre-typecheck audits — good repair candidates.

| File | Score | Audits | Which audits |
| --- | ---: | ---: | --- |
| `client/src/composables/usePartInstanceData.ts` | 15.0 | 1 | import-graph |
| `client/src/composables/useSelectOptions.ts` | 15.0 | 1 | import-graph |
| `client:ts-morph` | 5.0 | 1 | dep-freshness |
| `server:@typescript-eslint/eslint-plugin` | 0.5 | 1 | dep-freshness |
| `server:@typescript-eslint/parser` | 0.5 | 1 | dep-freshness |
| `client:typescript-eslint` | 0.5 | 1 | dep-freshness |
| `client:vuetify` | 0.5 | 1 | dep-freshness |

## Trend (vs previous run)

- **type-similarity**: 21 → 21 (→ 0)
- **dep-freshness**: 0 → 5 (↑ +5)
- **import-hygiene**: 0 → 0 (→ 0)
- **import-graph**: 0 → 0 (→ 0)
- **api-contract**: 0 → 0 (→ 0)
- **type-escape**: 49 → 0 (↓ -49)
- **type-import**: 0 → 0 (→ 0)

## Next steps

1. Run pre-typecheck audits: `npm run audit:pre-typecheck`
2. Run this meta report: `npm run audit:pre-typecheck:meta`
3. Fix findings using the per-audit reports in `client/.audit-reports/`
4. Re-run pre-typecheck + meta until total findings are acceptable
5. Run `npm run typecheck:audit` or `npm run audit:all`
