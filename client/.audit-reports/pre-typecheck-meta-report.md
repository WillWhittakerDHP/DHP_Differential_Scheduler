# Pre-Typecheck Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Use this report to build a **repair plan** before running `audit:all` or `typecheck:audit`.

Generated at: 2026-02-23T01:13:48.324Z

## Pre-Typecheck Audit Summary

| Audit | Files with findings | Total findings | Detail |
| --- | ---: | ---: | --- |
| type-similarity | 20 | 20 | Similarity groups (UNIFY/BRAND/EXTEND/REVIEW): 20 |
| dep-freshness | 0 | 0 | Outdated: 0 (major: 0, minor: 0, patch: 0) |
| import-hygiene | 0 | 0 | Barrel: 0, Deep relative: 0, Type re-export: 0, Inconsistent: 0, Duplicate re-exports: 0 |
| import-graph | 0 | 0 | Cycles: 0, Fan-out violations: 0, Fan-in violations: 0 |
| api-contract | 0 | 0 | Client/server type mismatches: 0 |
| type-escape | 28 | 49 | Type escape hatches (as any, ts-ignore, etc.): 49 |
| type-import | 0 | 0 | Value-from-type-only: 0, Type-used-as-value: 0 |

Audits loaded: 7 / 7

## Repair plan readiness

**Total pre-typecheck findings:** 69

Address the findings above (see each audit's JSON/MD in `.audit-reports/`) before relying on typecheck or full audit.

## Top hotspot files (pre-typecheck only)

Files appearing in multiple pre-typecheck audits — good repair candidates.

| File | Score | Audits | Which audits |
| --- | ---: | ---: | --- |
| `client/src/composables/admin/useEntityList.ts` | 18.0 | 1 | type-escape |
| `client/src/composables/admin/useBlockInstanceForm.ts` | 12.0 | 1 | type-escape |
| `client/src/composables/admin/usePartInstanceForm.ts` | 12.0 | 1 | type-escape |
| `client/src/composables/admin/useEntityDisplay.ts` | 9.0 | 1 | type-escape |
| `client/src/composables/admin/useEntityCardActions.ts` | 6.0 | 1 | type-escape |
| `client/src/composables/admin/useFieldLocation.ts` | 6.0 | 1 | type-escape |
| `client/src/composables/admin/useFormElementPatching.ts` | 6.0 | 1 | type-escape |
| `client/src/composables/admin/useInstanceBulkEdit.ts` | 6.0 | 1 | type-escape |
| `client/src/composables/admin/usePartsCollectionField.ts` | 6.0 | 1 | type-escape |
| `client/src/composables/admin/useRelationshipCollectionField.ts` | 6.0 | 1 | type-escape |
| `client/src/composables/useNotification.ts` | 6.0 | 1 | type-escape |
| `client/src/views/admin/tabs/ShapesTab.vue` | 6.0 | 1 | type-escape |
| `client/src/composables/admin/useDialogFormState.ts` | 3.0 | 1 | type-escape |
| `client/src/composables/admin/useEntityCardSaveState.ts` | 3.0 | 1 | type-escape |
| `client/src/composables/admin/useEntityCardStoreSync.ts` | 3.0 | 1 | type-escape |

## Trend (vs previous run)

- **type-similarity**: 21 → 20 (↓ -1)
- **dep-freshness**: 7 → 0 (↓ -7)
- **import-hygiene**: 0 → 0 (→ 0)
- **import-graph**: 0 → 0 (→ 0)
- **api-contract**: 0 → 0 (→ 0)
- **type-escape**: 8 → 49 (↑ +41)
- **type-import**: 4 → 0 (↓ -4)

## Next steps

1. Run pre-typecheck audits: `npm run audit:pre-typecheck`
2. Run this meta report: `npm run audit:pre-typecheck:meta`
3. Fix findings using the per-audit reports in `client/.audit-reports/`
4. Re-run pre-typecheck + meta until total findings are acceptable
5. Run `npm run typecheck:audit` or `npm run audit:all`
