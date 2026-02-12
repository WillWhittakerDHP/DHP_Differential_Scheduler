# Audit Meta Report (Generated)

Generated at: 2026-02-11T04:10:12.879Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 66 | 66 |
| composables-logic | 173 | 173 |
| loop-mutation | 196 | 630 |
| hardcoding | 228 | 833 |
| function-complexity | 355 | 355 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 335 | 335 |
| error-handling | 32 | 59 |
| deprecation | 156 | 349 |
| security | 0 | 0 |
| todo-aging | 16 | 28 |
| import-graph | 29 | 29 |
| file-cohesion | 78 | 78 |
| api-contract | 0 | 64 |
| constants-consolidation | 2 | 3 |
| bundle-size-budget | 10 | 1 |
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
| `client/src/constants/entities.ts` | 382.0 | 2 | file-cohesion, coverage-risk-crossref |
| `client/src/types/entities.ts` | 378.0 | 1 | coverage-risk-crossref |
| `assets/index-Dc9GZHWc.js` | 261.8 | 1 | bundle-size-budget |
| `client/src/constants/primitives.ts` | 228.0 | 1 | coverage-risk-crossref |
| `assets/AdminPanel-DLitoqMB.js` | 179.5 | 1 | bundle-size-budget |
| `client/src/types/appointment.ts` | 145.0 | 2 | deprecation, coverage-risk-crossref |
| `client/src/constants/entityFieldConstants.ts` | 120.0 | 1 | coverage-risk-crossref |
| `client/src/types/datetime.ts` | 102.5 | 4 | hardcoding, function-complexity, unused-code, coverage-risk-crossref |
| `client/src/types/entityMetadata.ts` | 102.0 | 1 | coverage-risk-crossref |
| `client/src/components/booking/types/selectionCardTypes.ts` | 99.0 | 3 | hardcoding, deprecation, coverage-risk-crossref |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 66 → 66 (→ 0)
- **composables-logic**: 173 → 173 (→ 0)
- **loop-mutation**: 633 → 630 (↓ -3)
- **hardcoding**: 851 → 833 (↓ -18)
- **function-complexity**: 353 → 355 (↑ +2)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 332 → 335 (↑ +3)
- **error-handling**: 61 → 59 (↓ -2)
- **deprecation**: 359 → 349 (↓ -10)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 30 → 28 (↓ -2)
- **import-graph**: 29 → 29 (→ 0)
- **file-cohesion**: 78 → 78 (→ 0)
- **api-contract**: 64 → 64 (→ 0)
- **constants-consolidation**: 139 → 3 (↓ -136)
- **bundle-size-budget**: 1 → 1 (→ 0)
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
| Structural (patterns) | 1319 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 9 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1328** | |
| Config pattern rules | 85 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↑ +12
- **Structural:** ↑ +6 
- **Specific:** ↑ +6 **⚠️ Review new suppressions**
- **Configs changed:** constants-consolidation

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 1055 | 2 | 1057 | 644 | 1.638 |
| hardcoding | 264 | 0 | 264 | 716 | 0.369 |
| deprecation | 0 | 4 | 4 | 969 | 0 |
| constants-consolidation | 0 | 3 | 3 | 646 | 0 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `client/src/types/datetime.ts` (4 audits): hardcoding, function-complexity, unused-code, coverage-risk-crossref
- `client/src/components/booking/types/selectionCardTypes.ts` (3 audits): hardcoding, deprecation, coverage-risk-crossref
- `server/src/services/slotComputationService.ts` (4 audits): loop-mutation, hardcoding, function-complexity, file-cohesion
- `server/src/scripts/importCalendarData.ts` (4 audits): hardcoding, function-complexity, error-handling, file-cohesion
- `client/src/utils/transformers/globalToBookingTransformer.ts` (5 audits): loop-mutation, function-complexity, deprecation, file-cohesion, coverage-risk-crossref
- `server/src/services/google/maps/routesApiService.ts` (5 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation
- `client/src/utils/differentialScheduling.ts` (4 audits): loop-mutation, function-complexity, unused-code, deprecation
- `client/src/configs/availabilitySettings.ts` (4 audits): function-complexity, unused-code, deprecation, file-cohesion
- `client/src/components/admin/generic/EntityCard.vue` (6 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation, file-cohesion
- `client/src/utils/booking/cascadeFilterPipeline.ts` (5 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation
- `server/src/services/computedAvailabilityService.ts` (5 audits): loop-mutation, hardcoding, function-complexity, deprecation, file-cohesion
- `client/src/composables/admin/useBusinessRuleForm.ts` (3 audits): hardcoding, function-complexity, deprecation
- `client/src/components/common/AddressAutocomplete.vue` (4 audits): hardcoding, function-complexity, unused-code, deprecation
- `server/src/services/google/maps/placesApiService.ts` (3 audits): loop-mutation, hardcoding, function-complexity
- `client/src/composables/entityCrud/useEntityCrudMutations.ts` (5 audits): loop-mutation, hardcoding, function-complexity, deprecation, file-cohesion
