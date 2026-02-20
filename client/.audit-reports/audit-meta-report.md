# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-02-20T17:33:45.388Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 44 | 44 |
| composables-logic | 181 | 9 |
| loop-mutation | 0 | 0 |
| hardcoding | 52 | 82 |
| function-complexity | 256 | 256 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 0 | 0 |
| error-handling | 0 | 0 |
| deprecation | 47 | 104 |
| security | 0 | 0 |
| todo-aging | 11 | 11 |
| import-graph | 3 | 3 |
| file-cohesion | 23 | 23 |
| api-contract | 0 | 0 |
| constants-consolidation | 4 | 17 |
| bundle-size-budget | 22 | 22 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 1 | 1 |
| api-versioning | 47 | 47 |
| data-flow | 8 | 10 |
| dep-freshness | 5 | 5 |
| type-escape | 1 | 1 |
| type-import | 3 | 3 |
| lint | 0 | 0 |
| lint-warnings | 0 | 0 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `server/src/routes/helpers/crudRouteHandlers.ts` | 45.0 | 1 | function-complexity |
| `server/src/utils/propertyTransformers.ts` | 44.5 | 2 | function-complexity, constants-consolidation |
| `client/src/composables/admin/useSelectConfig.ts` | 42.0 | 5 | composables-logic, hardcoding, function-complexity, deprecation, file-cohesion |
| `client/src/composables/admin/useBusinessRules.ts` | 40.0 | 3 | composables-logic, function-complexity, deprecation |
| `server/src/routes/internal/properties/propertyConstants.ts` | 40.0 | 1 | constants-consolidation |
| `server/src/services/propertyFeatureMatcher.ts` | 39.0 | 2 | hardcoding, function-complexity |
| `client/src/composables/useRelationship.ts` | 37.5 | 3 | composables-logic, function-complexity, deprecation |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | 37.5 | 3 | composables-logic, function-complexity, deprecation |
| `client/src/composables/useAdmin.ts` | 37.0 | 4 | composables-logic, function-complexity, deprecation, import-graph |
| `client/src/composables/fieldContext/useFieldContextSaveHelpers.ts` | 36.5 | 2 | composables-logic, function-complexity |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 44 → 44 (→ 0)
- **composables-logic**: 10 → 9 (↓ -1)
- **loop-mutation**: 0 → 0 (→ 0)
- **hardcoding**: 82 → 82 (→ 0)
- **function-complexity**: 254 → 256 (↑ +2)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 0 → 0 (→ 0)
- **error-handling**: 0 → 0 (→ 0)
- **deprecation**: 135 → 104 (↓ -31)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 11 → 11 (→ 0)
- **import-graph**: 4 → 3 (↓ -1)
- **file-cohesion**: 25 → 23 (↓ -2)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 17 → 17 (→ 0)
- **bundle-size-budget**: 22 → 22 (→ 0)
- **coverage-risk-crossref**: 0 → 0 (→ 0)
- **naming-convention**: 1 → 1 (→ 0)
- **api-versioning**: 47 → 47 (→ 0)
- **data-flow**: 10 → 10 (→ 0)
- **dep-freshness**: 5 → 5 (→ 0)
- **type-escape**: 1 → 1 (→ 0)
- **type-import**: 2 → 3 (↑ +1)
- **lint**: 0 → 0 (→ 0)
- **lint-warnings**: 0 → 0 (→ 0)

## Exception Analysis

**Verdict:** Improving — total exceptions decreased

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 1140 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 48 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1188** | |
| Config pattern rules | 88 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↓ -41
- **Structural:** ↓ -27 
- **Specific:** ↓ -14 

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 533 | 16 | 549 | 677 | 0.787 |
| hardcoding | 485 | 27 | 512 | 760 | 0.638 |
| error-handling | 45 | 0 | 45 | 785 | 0.057 |
| deprecation | 3 | 4 | 7 | 787 | 0.004 |
| naming-convention | 74 | 1 | 75 | 787 | 0.094 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `client/src/composables/admin/useSelectConfig.ts` (5 audits): composables-logic, hardcoding, function-complexity, deprecation, file-cohesion
- `client/src/composables/admin/useBusinessRules.ts` (3 audits): composables-logic, function-complexity, deprecation
- `client/src/composables/useRelationship.ts` (3 audits): composables-logic, function-complexity, deprecation
- `client/src/composables/booking/useMoveablePartsScheduling.ts` (3 audits): composables-logic, function-complexity, deprecation
- `client/src/composables/useAdmin.ts` (4 audits): composables-logic, function-complexity, deprecation, import-graph
- `client/src/composables/booking/useAvailabilityOrchestrator.ts` (3 audits): composables-logic, hardcoding, function-complexity
- `client/src/composables/fieldContext/useFieldContextState.ts` (3 audits): composables-logic, function-complexity, deprecation
- `server/src/services/slotComputationService.ts` (3 audits): hardcoding, function-complexity, file-cohesion
- `client/src/components/booking/dev/DevPanelsContainer.vue` (5 audits): component-logic, hardcoding, function-complexity, todo-aging, file-cohesion
- `client/src/composables/admin/useSelectFiltering.ts` (3 audits): composables-logic, function-complexity, file-cohesion
- `client/src/composables/booking/useDependentInstances.ts` (3 audits): composables-logic, function-complexity, deprecation
- `client/src/composables/useBookingWizard.ts` (3 audits): composables-logic, function-complexity, import-graph
- `client/src/composables/componentEntity/useComponentEntityDomain.ts` (3 audits): composables-logic, function-complexity, deprecation
- `client/src/composables/booking/useAvailabilityLogic.ts` (3 audits): composables-logic, function-complexity, file-cohesion
- `client/src/composables/entityCrud/usePrimitiveMutation.ts` (3 audits): composables-logic, function-complexity, deprecation
