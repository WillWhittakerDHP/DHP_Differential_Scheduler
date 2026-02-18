# Pre-Typecheck Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

Use this report to build a **repair plan** before running `audit:all` or `typecheck:audit`.

Generated at: 2026-02-18T21:19:01.786Z

## Pre-Typecheck Audit Summary

| Audit | Files with findings | Total findings | Detail |
| --- | ---: | ---: | --- |
| type-similarity | 99 | 99 | Similarity groups (UNIFY/BRAND/EXTEND/REVIEW): 99 |
| dep-freshness | 41 | 41 | Outdated: 41 (major: 23, minor: 8, patch: 9) |
| import-hygiene | 0 | 0 | Barrel: 0, Deep relative: 0, Type re-export: 0, Inconsistent: 0, Duplicate re-exports: 0 |
| import-graph | 0 | 0 | Cycles: 0, Fan-out violations: 0, Fan-in violations: 0 |
| api-contract | 0 | 0 | Client/server type mismatches: 0 |
| type-escape | 40 | 70 | Type escape hatches (as any, ts-ignore, etc.): 70 |
| type-import | 14 | 29 | Value-from-type-only: 0, Type-used-as-value: 29 |

Audits loaded: 7 / 7

## Repair plan readiness

**Total pre-typecheck findings:** 239

Address the findings above (see each audit's JSON/MD in `.audit-reports/`) before relying on typecheck or full audit.

## Top hotspot files (pre-typecheck only)

Files appearing in multiple pre-typecheck audits — good repair candidates.

| File | Score | Audits | Which audits |
| --- | ---: | ---: | --- |
| `client/src/composables/booking/useDependentInstances.ts` | 24.0 | 1 | type-escape |
| `client/src/configs/field/form/_archived/selectableFieldConfig.ts` | 20.0 | 1 | type-escape |
| `client/src/components/admin/InstanceBulkEditModal.vue` | 12.0 | 1 | type-escape |
| `client/src/components/admin/PartInstanceBulkEditModal.vue` | 12.0 | 1 | type-escape |
| `client/src/composables/admin/useEntityCardStoreSync.ts` | 12.0 | 1 | type-escape |
| `client/src/composables/formFields/useFormFieldsContext.ts` | 12.0 | 1 | type-escape |
| `client/src/utils/dependencyCleanup.ts` | 12.0 | 1 | type-escape |
| `client/src/types/wizard.ts` | 12.0 | 1 | type-import |
| `server/src/routes/helpers/dataController.ts` | 10.0 | 1 | type-escape |
| `client/src/components/admin/generic/EntityCard.vue` | 8.0 | 1 | type-escape |
| `client/src/composables/admin/useBufferSettings.ts` | 8.0 | 1 | type-escape |
| `client/src/composables/admin/useInstanceFiltering.ts` | 8.0 | 1 | type-escape |
| `client/src/composables/admin/useStatusButtonToggle.ts` | 8.0 | 1 | type-escape |
| `client/src/composables/booking/useBlockInstanceSelection.ts` | 8.0 | 1 | type-escape |
| `client/src/types/appointmentApi.ts` | 8.0 | 1 | type-import |

## Trend (vs previous run)

- **type-similarity**: 99 → 99 (→ 0)
- **dep-freshness**: 62 → 41 (↓ -21)
- **import-hygiene**: 0 → 0 (→ 0)
- **import-graph**: 28 → 0 (↓ -28)
- **api-contract**: 66 → 0 (↓ -66)
- **type-escape**: 70 → 70 (→ 0)
- **type-import**: 125 → 29 (↓ -96)

## Next steps

1. Run pre-typecheck audits: `npm run audit:pre-typecheck`
2. Run this meta report: `npm run audit:pre-typecheck:meta`
3. Fix findings using the per-audit reports in `client/.audit-reports/`
4. Re-run pre-typecheck + meta until total findings are acceptable
5. Run `npm run typecheck:audit` or `npm run audit:all`
