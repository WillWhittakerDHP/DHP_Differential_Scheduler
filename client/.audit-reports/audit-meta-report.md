# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-02-20T15:41:44.026Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 44 | 44 |
| composables-logic | 177 | 10 |
| loop-mutation | 0 | 0 |
| hardcoding | 51 | 87 |
| function-complexity | 322 | 322 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 0 | 0 |
| error-handling | 0 | 0 |
| deprecation | 55 | 137 |
| security | 0 | 0 |
| todo-aging | 15 | 27 |
| import-graph | 4 | 4 |
| file-cohesion | 159 | 159 |
| api-contract | 0 | 0 |
| constants-consolidation | 0 | 0 |
| bundle-size-budget | 22 | 22 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 1 | 1 |
| api-versioning | 47 | 47 |
| data-flow | 9 | 11 |
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
| `client/src/composables/admin/useSelectFiltering.ts` | 47.5 | 4 | composables-logic, function-complexity, todo-aging, file-cohesion |
| `client/src/utils/forms/fieldLocationDispatcher.ts` | 47.0 | 2 | hardcoding, function-complexity |
| `client/src/composables/useSelectOptions.ts` | 45.5 | 3 | composables-logic, function-complexity, import-graph |
| `server/src/scripts/importCalendarData.ts` | 45.5 | 3 | hardcoding, function-complexity, file-cohesion |
| `client/src/composables/admin/useSelectConfig.ts` | 43.5 | 5 | composables-logic, hardcoding, function-complexity, deprecation, file-cohesion |
| `server/src/services/propertyFeatureMatcher.ts` | 43.0 | 3 | hardcoding, function-complexity, deprecation |
| `client/src/composables/admin/useBusinessRules.ts` | 41.5 | 3 | composables-logic, function-complexity, deprecation |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 73 → 44 (↓ -29)
- **composables-logic**: 177 → 10 (↓ -167)
- **loop-mutation**: 0 → 0 (→ 0)
- **hardcoding**: 87 → 87 (→ 0)
- **function-complexity**: 322 → 322 (→ 0)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 0 → 0 (→ 0)
- **error-handling**: 0 → 0 (→ 0)
- **deprecation**: 137 → 137 (→ 0)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 27 → 27 (→ 0)
- **import-graph**: 0 → 4 (↑ +4)
- **file-cohesion**: 86 → 159 (↑ +73)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 0 → 0 (→ 0)
- **bundle-size-budget**: 22 → 22 (→ 0)
- **coverage-risk-crossref**: 0 → 0 (→ 0)
- **naming-convention**: 1 → 1 (→ 0)
- **api-versioning**: 47 → 47 (→ 0)
- **data-flow**: 11 → 11 (→ 0)
- **dep-freshness**: 2 → 5 (↑ +3)
- **type-escape**: 1 → 1 (→ 0)
- **type-import**: 2 → 2 (→ 0)
- **lint**: 0 → 0 (→ 0)
- **lint-warnings**: 0 → 0 (→ 0)

## Exception Analysis

**Verdict:** Stable — no meaningful exception changes

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 1167 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 59 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1226** | |
| Config pattern rules | 88 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** → 0
- **Structural:** → 0 
- **Specific:** → 0 

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 533 | 16 | 549 | 669 | 0.797 |
| hardcoding | 485 | 26 | 511 | 750 | 0.647 |
| error-handling | 45 | 0 | 45 | 775 | 0.058 |
| deprecation | 30 | 16 | 46 | 777 | 0.039 |
| naming-convention | 74 | 1 | 75 | 777 | 0.095 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `client/src/composables/entityCrud/useEntityCrudMutations.ts` (3 audits): composables-logic, function-complexity, file-cohesion
- `client/src/composables/booking/useAppointmentDataCollection.ts` (5 audits): composables-logic, hardcoding, function-complexity, deprecation, file-cohesion
- `client/src/composables/admin/useSelectFiltering.ts` (4 audits): composables-logic, function-complexity, todo-aging, file-cohesion
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
