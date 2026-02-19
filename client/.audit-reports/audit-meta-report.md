# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

Generated at: 2026-02-19T01:12:29.052Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 73 | 73 |
| composables-logic | 176 | 176 |
| loop-mutation | 206 | 684 |
| hardcoding | 236 | 798 |
| function-complexity | 325 | 325 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 143 | 143 |
| error-handling | 12 | 18 |
| deprecation | 57 | 143 |
| security | 0 | 0 |
| todo-aging | 16 | 28 |
| import-graph | 0 | 0 |
| file-cohesion | 86 | 86 |
| api-contract | 0 | 0 |
| constants-consolidation | 7 | 17 |
| bundle-size-budget | 19 | 19 |
| coverage-risk-crossref | 11 | 11 |
| naming-convention | 1 | 1 |
| api-versioning | 0 | 0 |
| data-flow | 0 | 0 |
| dep-freshness | 10 | 10 |
| type-escape | 3 | 3 |
| type-import | 14 | 14 |
| lint | 0 | 0 |
| lint-warnings | 0 | 0 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `client/src/types/entities.ts` | 387.0 | 3 | hardcoding, file-cohesion, coverage-risk-crossref |
| `client/src/constants/entities.ts` | 382.0 | 1 | coverage-risk-crossref |
| `client/src/constants/primitives.ts` | 228.0 | 1 | coverage-risk-crossref |
| `client/src/types/appointment.ts` | 144.0 | 1 | coverage-risk-crossref |
| `client/src/constants/entityFieldConstants.ts` | 120.0 | 1 | coverage-risk-crossref |
| `client/src/types/entityMetadata.ts` | 100.0 | 1 | coverage-risk-crossref |
| `client/src/components/booking/types/selectionCardTypes.ts` | 96.0 | 1 | coverage-risk-crossref |
| `client/src/types/datetime.ts` | 90.5 | 3 | hardcoding, error-handling, coverage-risk-crossref |
| `client/src/utils/api` | 76.0 | 1 | coverage-risk-crossref |
| `server/src/services/brightMls/brightMlsApiClient.ts` | 72.5 | 4 | loop-mutation, hardcoding, function-complexity, error-handling |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 73 → 73 (→ 0)
- **composables-logic**: 176 → 176 (→ 0)
- **loop-mutation**: 633 → 684 (↑ +51)
- **hardcoding**: 963 → 798 (↓ -165)
- **function-complexity**: 325 → 325 (→ 0)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 144 → 143 (↓ -1)
- **error-handling**: 26 → 18 (↓ -8)
- **deprecation**: 158 → 143 (↓ -15)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 28 → 28 (→ 0)
- **import-graph**: 0 → 0 (→ 0)
- **file-cohesion**: 82 → 86 (↑ +4)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 3 → 17 (↑ +14)
- **bundle-size-budget**: 19 → 19 (→ 0)
- **coverage-risk-crossref**: 11 → 11 (→ 0)
- **naming-convention**: 81 → 1 (↓ -80)
- **api-versioning**: 0 → 0 (→ 0)
- **data-flow**: 0 → 0 (→ 0)
- **dep-freshness**: 40 → 10 (↓ -30)
- **type-escape**: 70 → 3 (↓ -67)
- **type-import**: 14 → 14 (→ 0)
- **lint**: 6 → 0 (↓ -6)
- **lint-warnings**: 0 → 0 (→ 0)

## Exception Analysis

**Verdict:** Suppression creep — new inline/specific exceptions were added

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 1739 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 23 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1762** | |
| Config pattern rules | 78 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↑ +405
- **Structural:** ↑ +391 
- **Specific:** ↑ +14 **⚠️ Review new suppressions**
- **Configs changed:** type-similarity, composables-logic, loop-mutation, hardcoding, pattern-detection, unused-code, error-handling, deprecation, file-cohesion, constants-consolidation, naming-convention, dep-freshness, lint, typecheck

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 1136 | 2 | 1138 | 679 | 1.673 |
| hardcoding | 443 | 2 | 445 | 759 | 0.584 |
| error-handling | 46 | 0 | 46 | 797 | 0.058 |
| deprecation | 31 | 16 | 47 | 797 | 0.039 |
| constants-consolidation | 0 | 3 | 3 | 681 | 0 |
| naming-convention | 83 | 0 | 83 | 787 | 0.105 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `client/src/types/entities.ts` (3 audits): hardcoding, file-cohesion, coverage-risk-crossref
- `client/src/types/datetime.ts` (3 audits): hardcoding, error-handling, coverage-risk-crossref
- `server/src/services/brightMls/brightMlsApiClient.ts` (4 audits): loop-mutation, hardcoding, function-complexity, error-handling
- `server/src/services/slotComputationService.ts` (4 audits): loop-mutation, hardcoding, function-complexity, file-cohesion
- `client/src/utils/transformers/globalToBookingTransformer.ts` (4 audits): loop-mutation, function-complexity, file-cohesion, coverage-risk-crossref
- `server/src/services/google/maps/routesApiService.ts` (6 audits): loop-mutation, hardcoding, function-complexity, unused-code, error-handling, deprecation
- `server/src/services/google/maps/placesApiService.ts` (4 audits): loop-mutation, hardcoding, function-complexity, error-handling
- `client/src/utils/differentialScheduling.ts` (4 audits): loop-mutation, function-complexity, unused-code, file-cohesion
- `server/src/services/propertyFeatureMatcher.ts` (5 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation
- `client/src/utils/booking/constraintColors.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `server/src/utils/userTypeMapping.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `client/src/utils/booking/cascadeFilterPipeline.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `client/src/components/admin/generic/EntityCardSubPanels.vue` (3 audits): loop-mutation, hardcoding, function-complexity
- `server/src/services/propertyFieldMapper.ts` (4 audits): loop-mutation, function-complexity, unused-code, deprecation
- `client/src/utils/booking/partFinalizer.ts` (6 audits): loop-mutation, hardcoding, function-complexity, unused-code, file-cohesion, type-import
