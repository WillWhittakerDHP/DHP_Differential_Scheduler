# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-02-19T23:20:27.504Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 73 | 73 |
| composables-logic | 177 | 177 |
| loop-mutation | 208 | 682 |
| hardcoding | 247 | 844 |
| function-complexity | 328 | 328 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 139 | 139 |
| error-handling | 0 | 0 |
| deprecation | 58 | 143 |
| security | 0 | 0 |
| todo-aging | 16 | 28 |
| import-graph | 0 | 0 |
| file-cohesion | 90 | 90 |
| api-contract | 0 | 0 |
| constants-consolidation | 2 | 3 |
| bundle-size-budget | 22 | 22 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 1 | 1 |
| api-versioning | 47 | 47 |
| data-flow | 0 | 0 |
| dep-freshness | 1 | 1 |
| type-escape | 1 | 1 |
| type-import | 1 | 1 |
| lint | 0 | 0 |
| lint-warnings | 0 | 0 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `server/src/services/slotComputationService.ts` | 77.0 | 4 | loop-mutation, hardcoding, function-complexity, file-cohesion |
| `server/src/services/brightMls/brightMlsApiClient.ts` | 71.0 | 3 | loop-mutation, hardcoding, function-complexity |
| `server/src/services/google/maps/routesApiService.ts` | 61.0 | 5 | loop-mutation, hardcoding, function-complexity, unused-code, deprecation |
| `server/src/services/google/maps/placesApiService.ts` | 53.5 | 3 | loop-mutation, hardcoding, function-complexity |
| `server/src/services/propertyFeatureMatcher.ts` | 50.5 | 5 | loop-mutation, hardcoding, function-complexity, unused-code, deprecation |
| `client/src/utils/booking/confirmationStepData.ts` | 50.0 | 6 | loop-mutation, hardcoding, function-complexity, unused-code, deprecation, todo-aging |
| `client/src/utils/booking/constraintColors.ts` | 49.5 | 4 | loop-mutation, hardcoding, function-complexity, unused-code |
| `server/src/utils/userTypeMapping.ts` | 49.5 | 4 | loop-mutation, hardcoding, function-complexity, unused-code |
| `server/src/routes/helpers/crudRouteHandlers.ts` | 49.5 | 2 | function-complexity, file-cohesion |
| `client/src/utils/booking/cascadeFilterPipeline.ts` | 49.0 | 4 | loop-mutation, hardcoding, function-complexity, unused-code |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 73 → 73 (→ 0)
- **composables-logic**: 176 → 177 (↑ +1)
- **loop-mutation**: 680 → 682 (↑ +2)
- **hardcoding**: 840 → 844 (↑ +4)
- **function-complexity**: 327 → 328 (↑ +1)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 144 → 139 (↓ -5)
- **error-handling**: 18 → 0 (↓ -18)
- **deprecation**: 143 → 143 (→ 0)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 28 → 28 (→ 0)
- **import-graph**: 0 → 0 (→ 0)
- **file-cohesion**: 90 → 90 (→ 0)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 17 → 3 (↓ -14)
- **bundle-size-budget**: 22 → 22 (→ 0)
- **coverage-risk-crossref**: 0 → 0 (→ 0)
- **naming-convention**: 4 → 1 (↓ -3)
- **api-versioning**: 47 → 47 (→ 0)
- **data-flow**: 0 → 0 (→ 0)
- **dep-freshness**: 12 → 1 (↓ -11)
- **type-escape**: 3 → 1 (↓ -2)
- **type-import**: 12 → 1 (↓ -11)
- **lint**: 1 → 0 (↓ -1)
- **lint-warnings**: 1 → 0 (↓ -1)

## Exception Analysis

**Verdict:** Suppression creep — new inline/specific exceptions were added

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 1779 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 24 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1803** | |
| Config pattern rules | 88 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↑ +30
- **Structural:** ↑ +29 
- **Specific:** ↑ +1 **⚠️ Review new suppressions**
- **Configs changed:** naming-convention, type-import

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 1125 | 2 | 1127 | 690 | 1.63 |
| hardcoding | 493 | 2 | 495 | 774 | 0.637 |
| error-handling | 45 | 0 | 45 | 802 | 0.056 |
| deprecation | 31 | 16 | 47 | 802 | 0.039 |
| constants-consolidation | 0 | 3 | 3 | 696 | 0 |
| naming-convention | 85 | 1 | 86 | 802 | 0.106 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `server/src/services/slotComputationService.ts` (4 audits): loop-mutation, hardcoding, function-complexity, file-cohesion
- `server/src/services/brightMls/brightMlsApiClient.ts` (3 audits): loop-mutation, hardcoding, function-complexity
- `server/src/services/google/maps/routesApiService.ts` (5 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation
- `server/src/services/google/maps/placesApiService.ts` (3 audits): loop-mutation, hardcoding, function-complexity
- `server/src/services/propertyFeatureMatcher.ts` (5 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation
- `client/src/utils/booking/confirmationStepData.ts` (6 audits): loop-mutation, hardcoding, function-complexity, unused-code, deprecation, todo-aging
- `client/src/utils/booking/constraintColors.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `server/src/utils/userTypeMapping.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `client/src/utils/booking/cascadeFilterPipeline.ts` (4 audits): loop-mutation, hardcoding, function-complexity, unused-code
- `client/src/components/admin/generic/EntityCardSubPanels.vue` (3 audits): loop-mutation, hardcoding, function-complexity
- `server/src/services/propertyFieldMapper.ts` (4 audits): loop-mutation, function-complexity, unused-code, deprecation
- `server/src/scripts/importCalendarData.ts` (3 audits): hardcoding, function-complexity, file-cohesion
- `server/src/services/computedAvailabilityService.ts` (4 audits): loop-mutation, hardcoding, function-complexity, file-cohesion
- `client/src/composables/booking/useAppointmentDataCollection.ts` (4 audits): loop-mutation, hardcoding, function-complexity, deprecation
- `server/src/services/appointmentCalendarService.ts` (5 audits): loop-mutation, hardcoding, function-complexity, unused-code, todo-aging
