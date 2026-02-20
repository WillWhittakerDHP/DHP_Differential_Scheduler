# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-02-20T16:44:18.662Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 44 | 44 |
| composables-logic | 177 | 10 |
| loop-mutation | 0 | 0 |
| hardcoding | 51 | 82 |
| function-complexity | 322 | 322 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 0 | 0 |
| error-handling | 0 | 0 |
| deprecation | 55 | 135 |
| security | 0 | 0 |
| todo-aging | 11 | 11 |
| import-graph | 4 | 4 |
| file-cohesion | 159 | 159 |
| api-contract | 0 | 0 |
| constants-consolidation | 4 | 17 |
| bundle-size-budget | 22 | 22 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 1 | 1 |
| api-versioning | 47 | 47 |
| data-flow | 8 | 10 |
| dep-freshness | 5 | 5 |
| type-escape | 1 | 1 |
| type-import | 2 | 2 |
| lint | 0 | 0 |
| lint-warnings | 0 | 0 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `client/src/composables/entityCrud/useEntityCrudMutations.ts` | 65.5 | 3 | composables-logic, function-complexity, file-cohesion |
| `client/src/composables/booking/useAppointmentDataCollection.ts` | 49.5 | 5 | composables-logic, hardcoding, function-complexity, deprecation, file-cohesion |
| `server/src/routes/helpers/crudRouteHandlers.ts` | 49.5 | 2 | function-complexity, file-cohesion |
| `client/src/composables/useSelectOptions.ts` | 45.5 | 3 | composables-logic, function-complexity, import-graph |
| `server/src/scripts/importCalendarData.ts` | 45.5 | 3 | hardcoding, function-complexity, file-cohesion |
| `server/src/utils/propertyTransformers.ts` | 44.5 | 2 | function-complexity, constants-consolidation |
| `client/src/composables/admin/useSelectConfig.ts` | 43.5 | 5 | composables-logic, hardcoding, function-complexity, deprecation, file-cohesion |
| `server/src/services/propertyFeatureMatcher.ts` | 43.0 | 3 | hardcoding, function-complexity, deprecation |
| `client/src/composables/admin/useBusinessRules.ts` | 41.5 | 3 | composables-logic, function-complexity, deprecation |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | 41.0 | 3 | composables-logic, function-complexity, deprecation |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 44 → 44 (→ 0)
- **composables-logic**: 10 → 10 (→ 0)
- **loop-mutation**: 0 → 0 (→ 0)
- **hardcoding**: 87 → 82 (↓ -5)
- **function-complexity**: 322 → 322 (→ 0)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 0 → 0 (→ 0)
- **error-handling**: 0 → 0 (→ 0)
- **deprecation**: 137 → 135 (↓ -2)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 27 → 11 (↓ -16)
- **import-graph**: 4 → 4 (→ 0)
- **file-cohesion**: 159 → 159 (→ 0)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 0 → 17 (↑ +17)
- **bundle-size-budget**: 22 → 22 (→ 0)
- **coverage-risk-crossref**: 0 → 0 (→ 0)
- **naming-convention**: 1 → 1 (→ 0)
- **api-versioning**: 47 → 47 (→ 0)
- **data-flow**: 11 → 10 (↓ -1)
- **dep-freshness**: 2 → 5 (↑ +3)
- **type-escape**: 1 → 1 (→ 0)
- **type-import**: 2 → 2 (→ 0)
- **lint**: 0 → 0 (→ 0)
- **lint-warnings**: 0 → 0 (→ 0)

## Exception Analysis

**Verdict:** Suppression creep — new inline/specific exceptions were added

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 1167 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 62 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1229** | |
| Config pattern rules | 88 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↑ +3
- **Structural:** → 0 
- **Specific:** ↑ +3 **⚠️ Review new suppressions**

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 533 | 16 | 549 | 670 | 0.796 |
| hardcoding | 485 | 27 | 512 | 751 | 0.646 |
| error-handling | 45 | 0 | 45 | 776 | 0.058 |
| deprecation | 30 | 18 | 48 | 778 | 0.039 |
| naming-convention | 74 | 1 | 75 | 778 | 0.095 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `client/src/composables/entityCrud/useEntityCrudMutations.ts` (3 audits): composables-logic, function-complexity, file-cohesion
- `client/src/composables/booking/useAppointmentDataCollection.ts` (5 audits): composables-logic, hardcoding, function-complexity, deprecation, file-cohesion
- `client/src/composables/useSelectOptions.ts` (3 audits): composables-logic, function-complexity, import-graph
- `server/src/scripts/importCalendarData.ts` (3 audits): hardcoding, function-complexity, file-cohesion
- `client/src/composables/admin/useSelectConfig.ts` (5 audits): composables-logic, hardcoding, function-complexity, deprecation, file-cohesion
- `server/src/services/propertyFeatureMatcher.ts` (3 audits): hardcoding, function-complexity, deprecation
- `client/src/composables/admin/useBusinessRules.ts` (3 audits): composables-logic, function-complexity, deprecation
- `client/src/composables/booking/useMoveablePartsScheduling.ts` (3 audits): composables-logic, function-complexity, deprecation
- `client/src/composables/useRelationship.ts` (3 audits): composables-logic, function-complexity, deprecation
- `client/src/composables/useAdmin.ts` (4 audits): composables-logic, function-complexity, deprecation, import-graph
- `client/src/components/booking/dev/DevPanelsContainer.vue` (5 audits): component-logic, hardcoding, function-complexity, todo-aging, file-cohesion
- `client/src/composables/fieldContext/useFieldContextSaveHelpers.ts` (3 audits): composables-logic, function-complexity, file-cohesion
- `client/src/composables/booking/useAvailabilityOrchestrator.ts` (3 audits): composables-logic, hardcoding, function-complexity
- `client/src/composables/fieldContext/useFieldContextState.ts` (3 audits): composables-logic, function-complexity, deprecation
- `server/src/services/slotComputationService.ts` (3 audits): hardcoding, function-complexity, file-cohesion
