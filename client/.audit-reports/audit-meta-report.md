# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-02-23T21:42:59.285Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 44 | 44 |
| composables-logic | 179 | 8 |
| loop-mutation | 0 | 0 |
| hardcoding | 0 | 0 |
| function-complexity | 244 | 244 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 0 | 0 |
| error-handling | 16 | 20 |
| deprecation | 0 | 0 |
| security | 0 | 0 |
| todo-aging | 8 | 9 |
| import-graph | 2 | 2 |
| file-cohesion | 19 | 19 |
| api-contract | 0 | 0 |
| constants-consolidation | 3 | 4 |
| bundle-size-budget | 21 | 21 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 3 | 3 |
| api-versioning | 0 | 0 |
| data-flow | 0 | 0 |
| dep-freshness | 5 | 5 |
| type-escape | 0 | 0 |
| type-import | 2 | 2 |
| lint | 0 | 0 |
| lint-warnings | 0 | 0 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `client/src/composables/admin/useSelectFiltering.ts` | 62.0 | 4 | composables-logic, function-complexity, error-handling, file-cohesion |
| `client/src/composables/admin/useBusinessRules.ts` | 49.0 | 2 | composables-logic, function-complexity |
| `client/src/composables/useSelectOptions.ts` | 44.0 | 3 | composables-logic, function-complexity, import-graph |
| `client/src/composables/useRelationship.ts` | 43.5 | 2 | composables-logic, function-complexity |
| `server/src/routes/helpers/crudRouteHandlers.ts` | 40.5 | 1 | function-complexity |
| `client/src/composables/usePartInstanceData.ts` | 40.0 | 3 | composables-logic, function-complexity, import-graph |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | 37.5 | 2 | composables-logic, function-complexity |
| `client/src/composables/fieldContext/useFieldContextSaveHelpers.ts` | 35.5 | 2 | composables-logic, function-complexity |
| `server/src/services/invites/inviteOrchestrationService.ts` | 34.5 | 2 | function-complexity, file-cohesion |
| `client/src/composables/admin/useSelectHandlers.ts` | 33.0 | 2 | composables-logic, function-complexity |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 44 → 44 (→ 0)
- **composables-logic**: 9 → 8 (↓ -1)
- **loop-mutation**: 0 → 0 (→ 0)
- **hardcoding**: 82 → 0 (↓ -82)
- **function-complexity**: 256 → 244 (↓ -12)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 0 → 0 (→ 0)
- **error-handling**: 0 → 20 (↑ +20)
- **deprecation**: 104 → 0 (↓ -104)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 11 → 9 (↓ -2)
- **import-graph**: 3 → 2 (↓ -1)
- **file-cohesion**: 23 → 19 (↓ -4)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 17 → 4 (↓ -13)
- **bundle-size-budget**: 22 → 21 (↓ -1)
- **coverage-risk-crossref**: 0 → 0 (→ 0)
- **naming-convention**: 1 → 3 (↑ +2)
- **api-versioning**: 47 → 0 (↓ -47)
- **data-flow**: 10 → 0 (↓ -10)
- **dep-freshness**: 5 → 5 (→ 0)
- **type-escape**: 1 → 0 (↓ -1)
- **type-import**: 3 → 2 (↓ -1)
- **lint**: 0 → 0 (→ 0)
- **lint-warnings**: 0 → 0 (→ 0)

## Exception Analysis

**Verdict:** Suppression creep — new inline/specific exceptions were added

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 1125 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 95 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1254** | |
| Config pattern rules | 95 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↑ +66
- **Structural:** ↓ -15 
- **Specific:** ↑ +47 **⚠️ Review new suppressions**
- **Configs changed:** type-similarity, loop-mutation, hardcoding, error-handling, deprecation, type-escape, type-import

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 532 | 16 | 552 | 687 | 0.774 |
| hardcoding | 518 | 78 | 626 | 770 | 0.673 |
| naming-convention | 75 | 1 | 76 | 797 | 0.094 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `client/src/composables/admin/useSelectFiltering.ts` (4 audits): composables-logic, function-complexity, error-handling, file-cohesion
- `client/src/composables/useSelectOptions.ts` (3 audits): composables-logic, function-complexity, import-graph
- `client/src/composables/usePartInstanceData.ts` (3 audits): composables-logic, function-complexity, import-graph
- `client/src/composables/admin/useSelectConfig.ts` (3 audits): composables-logic, function-complexity, error-handling
- `client/src/components/booking/dev/DevPanelsContainer.vue` (4 audits): component-logic, function-complexity, todo-aging, file-cohesion
- `client/src/composables/admin/useRelationshipCollection.ts` (3 audits): composables-logic, function-complexity, error-handling
- `client/src/composables/booking/useAvailabilityDefaults.ts` (3 audits): composables-logic, function-complexity, todo-aging
