# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-02-19T19:01:52.176Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 73 | 73 |
| composables-logic | 176 | 176 |
| loop-mutation | 207 | 680 |
| hardcoding | 247 | 842 |
| function-complexity | 327 | 327 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 145 | 145 |
| error-handling | 12 | 18 |
| deprecation | 56 | 140 |
| security | 0 | 0 |
| todo-aging | 16 | 28 |
| import-graph | 0 | 0 |
| file-cohesion | 91 | 91 |
| api-contract | 0 | 0 |
| constants-consolidation | 7 | 17 |
| bundle-size-budget | 22 | 22 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 4 | 4 |
| api-versioning | 47 | 47 |
| data-flow | 0 | 0 |
| dep-freshness | 13 | 13 |
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
- **loop-mutation**: 684 → 680 (↓ -4)
- **hardcoding**: 798 → 842 (↑ +44)
- **function-complexity**: 325 → 327 (↑ +2)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 143 → 145 (↑ +2)
- **error-handling**: 18 → 18 (→ 0)
- **deprecation**: 143 → 140 (↓ -3)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 28 → 28 (→ 0)
- **import-graph**: 0 → 0 (→ 0)
- **file-cohesion**: 86 → 91 (↑ +5)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 17 → 17 (→ 0)
- **bundle-size-budget**: 19 → 22 (↑ +3)
- **coverage-risk-crossref**: 11 → 0 (↓ -11)
- **naming-convention**: 1 → 4 (↑ +3)
- **api-versioning**: 0 → 47 (↑ +47)
- **data-flow**: 0 → 0 (→ 0)
- **dep-freshness**: 10 → 13 (↑ +3)
- **type-escape**: 3 → 3 (→ 0)
- **type-import**: 14 → 12 (↓ -2)
- **lint**: 0 → 1 (↑ +1)
- **lint-warnings**: 0 → 1 (↑ +1)

## Exception Analysis

**Verdict:** Codebase growth — same configs, more files matched existing patterns

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 1778 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 23 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1801** | |
| Config pattern rules | 78 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↑ +39
- **Structural:** ↑ +39 *(same configs — just more files)*
- **Specific:** → 0 

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 1124 | 2 | 1126 | 686 | 1.638 |
| hardcoding | 493 | 2 | 495 | 770 | 0.64 |
| error-handling | 45 | 0 | 45 | 798 | 0.056 |
| deprecation | 31 | 16 | 47 | 798 | 0.039 |
| constants-consolidation | 0 | 3 | 3 | 692 | 0 |
| naming-convention | 85 | 0 | 85 | 798 | 0.107 |

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
