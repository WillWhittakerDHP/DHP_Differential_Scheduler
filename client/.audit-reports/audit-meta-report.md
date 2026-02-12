# Audit Meta Report (Generated)

Generated at: 2026-02-12T01:57:31.846Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 68 | 68 |
| composables-logic | 174 | 174 |
| loop-mutation | 196 | 633 |
| hardcoding | 234 | 835 |
| function-complexity | 310 | 310 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 327 | 327 |
| error-handling | 23 | 41 |
| deprecation | 69 | 158 |
| security | 0 | 0 |
| todo-aging | 16 | 28 |
| import-graph | 28 | 28 |
| file-cohesion | 82 | 82 |
| api-contract | 0 | 64 |
| constants-consolidation | 2 | 3 |
| bundle-size-budget | 19 | 19 |
| coverage-risk-crossref | 11 | 11 |
| naming-convention | 68 | 81 |
| api-versioning | 0 | 0 |
| data-flow | 0 | 0 |
| dep-freshness | 60 | 60 |

Audits loaded: 23 / 23

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `client/src/constants/entities.ts` | 386.0 | 2 | file-cohesion, coverage-risk-crossref |
| `client/src/types/entities.ts` | 382.0 | 1 | coverage-risk-crossref |
| `assets/AdminPanel-DKxki4Bp.js` | 230.2 | 1 | bundle-size-budget |
| `client/src/constants/primitives.ts` | 228.0 | 1 | coverage-risk-crossref |
| `assets/vuetify-DQFqr_wv.js` | 149.1 | 1 | bundle-size-budget |
| `client/src/types/appointment.ts` | 145.0 | 2 | deprecation, coverage-risk-crossref |
| `client/src/constants/entityFieldConstants.ts` | 120.0 | 1 | coverage-risk-crossref |
| `client/src/types/entityMetadata.ts` | 100.0 | 1 | coverage-risk-crossref |
| `client/src/components/booking/types/selectionCardTypes.ts` | 99.0 | 3 | hardcoding, deprecation, coverage-risk-crossref |
| `assets/vuetify-DDKLoE_6.css` | 93.9 | 1 | bundle-size-budget |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 66 → 68 (↑ +2)
- **composables-logic**: 173 → 174 (↑ +1)
- **loop-mutation**: 632 → 633 (↑ +1)
- **hardcoding**: 851 → 835 (↓ -16)
- **function-complexity**: 355 → 310 (↓ -45)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 336 → 327 (↓ -9)
- **error-handling**: 61 → 41 (↓ -20)
- **deprecation**: 351 → 158 (↓ -193)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 29 → 28 (↓ -1)
- **import-graph**: 29 → 28 (↓ -1)
- **file-cohesion**: 78 → 82 (↑ +4)
- **api-contract**: 64 → 64 (→ 0)
- **constants-consolidation**: 3 → 3 (→ 0)
- **bundle-size-budget**: 1 → 19 (↑ +18)
- **coverage-risk-crossref**: 15 → 11 (↓ -4)
- **naming-convention**: 81 → 81 (→ 0)
- **api-versioning**: 0 → 0 (→ 0)
- **data-flow**: 0 → 0 (→ 0)
- **dep-freshness**: 60 → 60 (→ 0)

## Exception Analysis

**Verdict:** Suppression creep — new inline/specific exceptions were added

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 1342 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 9 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1351** | |
| Config pattern rules | 92 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↑ +25
- **Structural:** ↑ +22 
- **Specific:** ↑ +3 **⚠️ Review new suppressions**
- **Configs changed:** loop-mutation, hardcoding, function-complexity, unused-code

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 1061 | 2 | 1063 | 647 | 1.64 |
| hardcoding | 281 | 0 | 281 | 719 | 0.391 |
| deprecation | 0 | 4 | 4 | 972 | 0 |
| constants-consolidation | 0 | 3 | 3 | 647 | 0 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `client/src/components/booking/types/selectionCardTypes.ts` (3 audits): hardcoding, deprecation, coverage-risk-crossref
- `client/src/utils/transformers/globalToBookingTransformer.ts` (5 audits): loop-mutation, function-complexity, deprecation, file-cohesion, coverage-risk-crossref
- `server/src/services/slotComputationService.ts` (4 audits): loop-mutation, hardcoding, function-complexity, file-cohesion
- `server/src/services/google/maps/routesApiService.ts` (5 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation
- `client/src/components/admin/generic/EntityCard.vue` (5 audits): loop-mutation, hardcoding, function-complexity, unused-code, file-cohesion
- `client/src/composables/admin/useBusinessRuleForm.ts` (3 audits): hardcoding, function-complexity, deprecation
- `client/src/utils/logger.ts` (3 audits): function-complexity, unused-code, coverage-risk-crossref
- `server/src/scripts/importCalendarData.ts` (4 audits): hardcoding, function-complexity, error-handling, file-cohesion
- `server/src/services/google/maps/placesApiService.ts` (3 audits): loop-mutation, hardcoding, function-complexity
- `client/src/utils/differentialScheduling.ts` (4 audits): loop-mutation, function-complexity, unused-code, file-cohesion
- `client/src/utils/booking/constraintColors.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `server/src/utils/userTypeMapping.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `client/src/utils/booking/cascadeFilterPipeline.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `client/src/utils/booking/partFinalizer.ts` (5 audits): loop-mutation, hardcoding, function-complexity, unused-code, file-cohesion
- `server/src/services/computedAvailabilityService.ts` (4 audits): loop-mutation, hardcoding, function-complexity, file-cohesion
