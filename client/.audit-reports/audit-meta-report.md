# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-02-19T13:40:56.989Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 73 | 73 |
| composables-logic | 176 | 176 |
| loop-mutation | 207 | 680 |
| hardcoding | 247 | 840 |
| function-complexity | 327 | 327 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 144 | 144 |
| error-handling | 12 | 18 |
| deprecation | 57 | 143 |
| security | 0 | 0 |
| todo-aging | 16 | 28 |
| import-graph | 0 | 0 |
| file-cohesion | 90 | 90 |
| api-contract | 0 | 0 |
| constants-consolidation | 7 | 17 |
| bundle-size-budget | 22 | 22 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 4 | 4 |
| api-versioning | 47 | 47 |
| data-flow | 0 | 0 |
| dep-freshness | 12 | 12 |
| type-escape | 3 | 3 |
| type-import | 12 | 12 |
| lint | 1 | 1 |
| lint-warnings | 1 | 1 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `server/src/services/slotComputationService.ts` | 77.0 | 4 | loop-mutation, hardcoding, function-complexity, file-cohesion |
| `server/src/services/brightMls/brightMlsApiClient.ts` | 72.5 | 4 | loop-mutation, hardcoding, function-complexity, error-handling |
| `server/src/services/google/maps/routesApiService.ts` | 62.5 | 6 | loop-mutation, hardcoding, function-complexity, unused-code, error-handling, deprecation |
| `server/src/services/google/maps/placesApiService.ts` | 56.5 | 4 | loop-mutation, hardcoding, function-complexity, error-handling |
| `server/src/services/propertyFeatureMatcher.ts` | 50.5 | 5 | loop-mutation, hardcoding, function-complexity, unused-code, deprecation |
| `client/src/utils/booking/confirmationStepData.ts` | 50.0 | 6 | loop-mutation, hardcoding, function-complexity, unused-code, deprecation, todo-aging |
| `client/src/utils/booking/constraintColors.ts` | 49.5 | 4 | loop-mutation, hardcoding, function-complexity, unused-code |
| `server/src/utils/userTypeMapping.ts` | 49.5 | 4 | loop-mutation, hardcoding, function-complexity, unused-code |
| `server/src/routes/helpers/crudRouteHandlers.ts` | 49.5 | 2 | function-complexity, file-cohesion |
| `client/src/utils/booking/cascadeFilterPipeline.ts` | 49.0 | 4 | loop-mutation, hardcoding, function-complexity, unused-code |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 73 → 73 (→ 0)
- **composables-logic**: 176 → 176 (→ 0)
- **loop-mutation**: 633 → 680 (↑ +47)
- **hardcoding**: 963 → 840 (↓ -123)
- **function-complexity**: 325 → 327 (↑ +2)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 144 → 144 (→ 0)
- **error-handling**: 26 → 18 (↓ -8)
- **deprecation**: 158 → 143 (↓ -15)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 28 → 28 (→ 0)
- **import-graph**: 0 → 0 (→ 0)
- **file-cohesion**: 82 → 90 (↑ +8)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 3 → 17 (↑ +14)
- **bundle-size-budget**: 19 → 22 (↑ +3)
- **coverage-risk-crossref**: 11 → 0 (↓ -11)
- **naming-convention**: 81 → 4 (↓ -77)
- **api-versioning**: 0 → 47 (↑ +47)
- **data-flow**: 0 → 0 (→ 0)
- **dep-freshness**: 40 → 12 (↓ -28)
- **type-escape**: 70 → 3 (↓ -67)
- **type-import**: 14 → 12 (↓ -2)
- **lint**: 6 → 1 (↓ -5)
- **lint-warnings**: 0 → 1 (↑ +1)

## Exception Analysis

**Verdict:** Suppression creep — new inline/specific exceptions were added

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 1750 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 23 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1773** | |
| Config pattern rules | 78 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↑ +416
- **Structural:** ↑ +402 
- **Specific:** ↑ +14 **⚠️ Review new suppressions**
- **Configs changed:** type-similarity, composables-logic, loop-mutation, hardcoding, pattern-detection, unused-code, error-handling, deprecation, file-cohesion, constants-consolidation, naming-convention, dep-freshness, lint, typecheck

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 1136 | 2 | 1138 | 685 | 1.658 |
| hardcoding | 453 | 2 | 455 | 769 | 0.589 |
| error-handling | 45 | 0 | 45 | 797 | 0.056 |
| deprecation | 31 | 16 | 47 | 797 | 0.039 |
| constants-consolidation | 0 | 3 | 3 | 691 | 0 |
| naming-convention | 85 | 0 | 85 | 797 | 0.107 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `server/src/services/slotComputationService.ts` (4 audits): loop-mutation, hardcoding, function-complexity, file-cohesion
- `server/src/services/brightMls/brightMlsApiClient.ts` (4 audits): loop-mutation, hardcoding, function-complexity, error-handling
- `server/src/services/google/maps/routesApiService.ts` (6 audits): loop-mutation, hardcoding, function-complexity, unused-code, error-handling, deprecation
- `server/src/services/google/maps/placesApiService.ts` (4 audits): loop-mutation, hardcoding, function-complexity, error-handling
- `server/src/services/propertyFeatureMatcher.ts` (5 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation
- `client/src/utils/booking/confirmationStepData.ts` (6 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation, todo-aging
- `client/src/utils/booking/constraintColors.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `server/src/utils/userTypeMapping.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `client/src/utils/booking/cascadeFilterPipeline.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `client/src/components/admin/generic/EntityCardSubPanels.vue` (3 audits): loop-mutation, hardcoding, function-complexity
- `server/src/services/propertyFieldMapper.ts` (4 audits): loop-mutation, function-complexity, unused-code, deprecation
- `client/src/composables/admin/useBusinessRules.ts` (4 audits): hardcoding, function-complexity, deprecation, constants-consolidation
- `server/src/scripts/importCalendarData.ts` (3 audits): hardcoding, function-complexity, file-cohesion
- `server/src/services/appointmentCalendarService.ts` (6 audits): loop-mutation, hardcoding, function-complexity, unused-code, error-handling, todo-aging
- `server/src/services/computedAvailabilityService.ts` (4 audits): loop-mutation, hardcoding, function-complexity, file-cohesion
