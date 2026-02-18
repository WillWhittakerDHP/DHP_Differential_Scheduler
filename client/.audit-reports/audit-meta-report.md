# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

Generated at: 2026-02-18T20:50:46.751Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 73 | 73 |
| composables-logic | 176 | 176 |
| loop-mutation | 196 | 633 |
| hardcoding | 252 | 963 |
| function-complexity | 325 | 325 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 144 | 144 |
| error-handling | 12 | 26 |
| deprecation | 69 | 158 |
| security | 0 | 0 |
| todo-aging | 16 | 28 |
| import-graph | 0 | 0 |
| file-cohesion | 82 | 82 |
| api-contract | 0 | 0 |
| constants-consolidation | 2 | 3 |
| bundle-size-budget | 19 | 19 |
| coverage-risk-crossref | 11 | 11 |
| naming-convention | 68 | 81 |
| api-versioning | 0 | 0 |
| data-flow | 0 | 0 |
| dep-freshness | 40 | 40 |
| type-escape | 40 | 70 |
| type-import | 14 | 14 |
| lint | 3 | 6 |
| lint-warnings | 0 | 0 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `client/src/constants/entities.ts` | 386.0 | 2 | file-cohesion, coverage-risk-crossref |
| `client/src/types/entities.ts` | 382.0 | 1 | coverage-risk-crossref |
| `client/src/constants/primitives.ts` | 228.0 | 1 | coverage-risk-crossref |
| `client/src/types/appointment.ts` | 145.0 | 2 | deprecation, coverage-risk-crossref |
| `client/src/constants/entityFieldConstants.ts` | 120.0 | 1 | coverage-risk-crossref |
| `client/src/types/entityMetadata.ts` | 100.0 | 1 | coverage-risk-crossref |
| `client/src/components/booking/types/selectionCardTypes.ts` | 99.0 | 3 | hardcoding, deprecation, coverage-risk-crossref |
| `client/src/types/datetime.ts` | 89.0 | 2 | hardcoding, coverage-risk-crossref |
| `client/src/components/admin/generic/EntityCard.vue` | 77.5 | 6 | loop-mutation, hardcoding, function-complexity, file-cohesion, type-escape, lint |
| `client/src/utils/api` | 76.0 | 1 | coverage-risk-crossref |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 73 → 73 (→ 0)
- **composables-logic**: 176 → 176 (→ 0)
- **loop-mutation**: 633 → 633 (→ 0)
- **hardcoding**: 963 → 963 (→ 0)
- **function-complexity**: 325 → 325 (→ 0)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 144 → 144 (→ 0)
- **error-handling**: 26 → 26 (→ 0)
- **deprecation**: 158 → 158 (→ 0)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 28 → 28 (→ 0)
- **import-graph**: 0 → 0 (→ 0)
- **file-cohesion**: 82 → 82 (→ 0)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 3 → 3 (→ 0)
- **bundle-size-budget**: 19 → 19 (→ 0)
- **coverage-risk-crossref**: 11 → 11 (→ 0)
- **naming-convention**: 81 → 81 (→ 0)
- **api-versioning**: 0 → 0 (→ 0)
- **data-flow**: 0 → 0 (→ 0)
- **dep-freshness**: 61 → 40 (↓ -21)
- **type-escape**: 70 → 70 (→ 0)
- **type-import**: 14 → 14 (→ 0)
- **lint**: 6 → 6 (→ 0)
- **lint-warnings**: 0 → 0 (→ 0)

## Exception Analysis

**Verdict:** Stable — no meaningful exception changes

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 1348 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 9 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1357** | |
| Config pattern rules | 42 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** → 0
- **Structural:** → 0 
- **Specific:** → 0 

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 1061 | 2 | 1063 | 647 | 1.64 |
| hardcoding | 287 | 0 | 287 | 757 | 0.379 |
| deprecation | 0 | 4 | 4 | 972 | 0 |
| constants-consolidation | 0 | 3 | 3 | 647 | 0 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `client/src/components/booking/types/selectionCardTypes.ts` (3 audits): hardcoding, deprecation, coverage-risk-crossref
- `client/src/components/admin/generic/EntityCard.vue` (6 audits): loop-mutation, hardcoding, function-complexity, file-cohesion, type-escape, lint
- `client/src/utils/transformers/globalToBookingTransformer.ts` (6 audits): loop-mutation, function-complexity, deprecation, file-cohesion, coverage-risk-crossref, type-escape
- `server/src/services/slotComputationService.ts` (4 audits): loop-mutation, hardcoding, function-complexity, file-cohesion
- `server/src/services/google/maps/routesApiService.ts` (5 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation
- `server/src/scripts/importCalendarData.ts` (5 audits): hardcoding, function-complexity, error-handling, file-cohesion, type-escape
- `client/src/composables/admin/useBusinessRuleForm.ts` (3 audits): hardcoding, function-complexity, deprecation
- `client/src/utils/logger.ts` (3 audits): function-complexity, unused-code, coverage-risk-crossref
- `server/src/services/google/maps/placesApiService.ts` (3 audits): loop-mutation, hardcoding, function-complexity
- `client/src/utils/differentialScheduling.ts` (4 audits): loop-mutation, function-complexity, unused-code, file-cohesion
- `client/src/utils/booking/constraintColors.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `server/src/utils/userTypeMapping.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `client/src/utils/booking/cascadeFilterPipeline.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `client/src/components/booking/dev/DevPanelsContainer.vue` (6 audits): hardcoding, function-complexity, error-handling, todo-aging, file-cohesion, type-escape
- `client/src/utils/booking/partFinalizer.ts` (6 audits): loop-mutation, hardcoding, function-complexity, unused-code, file-cohesion, type-import
