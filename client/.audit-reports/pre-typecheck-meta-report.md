# Pre-Typecheck Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Use this report to build a **repair plan** before running `audit:all` or `typecheck:audit`.

Generated at: 2026-02-19T02:25:03.795Z

## Pre-Typecheck Audit Summary

| Audit | Files with findings | Total findings | Detail |
| --- | ---: | ---: | --- |
| type-similarity | 45 | 45 | Similarity groups (UNIFY/BRAND/EXTEND/REVIEW): 45 |
| dep-freshness | 13 | 13 | Outdated: 13 (major: 10, minor: 2, patch: 0) |
| import-hygiene | 0 | 0 | Barrel: 0, Deep relative: 0, Type re-export: 0, Inconsistent: 0, Duplicate re-exports: 0 |
| import-graph | 0 | 0 | Cycles: 0, Fan-out violations: 0, Fan-in violations: 0 |
| api-contract | 0 | 0 | Client/server type mismatches: 0 |
| type-escape | 3 | 3 | Type escape hatches (as any, ts-ignore, etc.): 3 |
| type-import | 12 | 21 | Value-from-type-only: 0, Type-used-as-value: 21 |

Audits loaded: 7 / 7

## Repair plan readiness

**Total pre-typecheck findings:** 82

Address the findings above (see each audit's JSON/MD in `.audit-reports/`) before relying on typecheck or full audit.

## Top hotspot files (pre-typecheck only)

Files appearing in multiple pre-typecheck audits — good repair candidates.

| File | Score | Audits | Which audits |
| --- | ---: | ---: | --- |
| `client/src/types/appointmentApi.ts` | 8.0 | 1 | type-import |
| `client/src/types/user.ts` | 8.0 | 1 | type-import |
| `client/src/composables/useLocalTime.ts` | 6.0 | 1 | type-import |
| `client:@tiptap/extension-placeholder` | 5.0 | 1 | dep-freshness |
| `client:@tiptap/extension-text-align` | 5.0 | 1 | dep-freshness |
| `client:@tiptap/extension-underline` | 5.0 | 1 | dep-freshness |
| `client:@tiptap/starter-kit` | 5.0 | 1 | dep-freshness |
| `client:@tiptap/vue-3` | 5.0 | 1 | dep-freshness |
| `server:@types/dotenv` | 5.0 | 1 | dep-freshness |
| `server:@types/helmet` | 5.0 | 1 | dep-freshness |
| `server:express` | 5.0 | 1 | dep-freshness |
| `client:vitest` | 5.0 | 1 | dep-freshness |
| `client:vue-router` | 5.0 | 1 | dep-freshness |
| `client/src/components/admin/generic/DynamicForm.vue` | 4.0 | 1 | type-escape |
| `client/src/components/admin/generic/EntityCard.vue` | 4.0 | 1 | type-escape |

## Trend (vs previous run)

- **type-similarity**: 99 → 45 (↓ -54)
- **dep-freshness**: 62 → 13 (↓ -49)
- **import-hygiene**: 0 → 0 (→ 0)
- **import-graph**: 0 → 0 (→ 0)
- **api-contract**: 0 → 0 (→ 0)
- **type-escape**: 0 → 3 (↑ +3)
- **type-import**: 0 → 21 (↑ +21)

## Next steps

1. Run pre-typecheck audits: `npm run audit:pre-typecheck`
2. Run this meta report: `npm run audit:pre-typecheck:meta`
3. Fix findings using the per-audit reports in `client/.audit-reports/`
4. Re-run pre-typecheck + meta until total findings are acceptable
5. Run `npm run typecheck:audit` or `npm run audit:all`
