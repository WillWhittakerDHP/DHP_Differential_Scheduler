# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-02-25T01:19:04.930Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 0 | 0 |
| composables-logic | 217 | 217 |
| loop-mutation | 0 | 0 |
| hardcoding | 27 | 38 |
| function-complexity | 247 | 247 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 0 | 0 |
| error-handling | 15 | 19 |
| deprecation | 2 | 3 |
| security | 0 | 0 |
| todo-aging | 4 | 4 |
| import-graph | 6 | 6 |
| file-cohesion | 15 | 15 |
| api-contract | 0 | 0 |
| constants-consolidation | 17 | 28 |
| bundle-size-budget | 55 | 55 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 3 | 3 |
| api-versioning | 0 | 0 |
| data-flow | 0 | 0 |
| dep-freshness | 5 | 5 |
| type-escape | 0 | 0 |
| type-import | 2 | 2 |
| lint | 36 | 61 |
| lint-warnings | 36 | 61 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `client/src/composables/admin/useSelectFiltering.ts` | 62.5 | 5 | composables-logic, function-complexity, error-handling, lint, lint-warnings |
| `client/src/composables/useSelectOptions.ts` | 44.0 | 3 | composables-logic, function-complexity, import-graph |
| `client/src/composables/admin/useSelectConfig.ts` | 42.0 | 5 | composables-logic, function-complexity, error-handling, lint, lint-warnings |
| `client/src/composables/useRelationship.ts` | 41.5 | 2 | composables-logic, function-complexity |
| `server/src/services/invites/inviteOrchestrationService.ts` | 40.5 | 3 | hardcoding, function-complexity, file-cohesion |
| `server/src/routes/helpers/crudRouteHandlers.ts` | 40.5 | 1 | function-complexity |
| `client/src/composables/usePartInstanceData.ts` | 40.0 | 3 | composables-logic, function-complexity, import-graph |
| `server/src/constants/appConstants.ts` | 35.7 | 1 | constants-consolidation |
| `client/src/composables/admin/useEntityCardSubPanels.ts` | 35.0 | 4 | composables-logic, function-complexity, lint, lint-warnings |
| `server/src/services/slotComputationService.ts` | 34.5 | 3 | hardcoding, function-complexity, file-cohesion |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 44 → 0 (↓ -44)
- **composables-logic**: 8 → 217 (↑ +209)
- **loop-mutation**: 0 → 0 (→ 0)
- **hardcoding**: 64 → 38 (↓ -26)
- **function-complexity**: 242 → 247 (↑ +5)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 0 → 0 (→ 0)
- **error-handling**: 2 → 19 (↑ +17)
- **deprecation**: 10 → 3 (↓ -7)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 5 → 4 (↓ -1)
- **import-graph**: 2 → 6 (↑ +4)
- **file-cohesion**: 18 → 15 (↓ -3)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 27 → 28 (↑ +1)
- **bundle-size-budget**: 21 → 55 (↑ +34)
- **coverage-risk-crossref**: 0 → 0 (→ 0)
- **naming-convention**: 3 → 3 (→ 0)
- **api-versioning**: 47 → 0 (↓ -47)
- **data-flow**: 9 → 0 (↓ -9)
- **dep-freshness**: 5 → 5 (→ 0)
- **type-escape**: 2 → 0 (↓ -2)
- **type-import**: 0 → 2 (↑ +2)
- **lint**: 0 → 61 (↑ +61)
- **lint-warnings**: 0 → 61 (↑ +61)

## Exception Analysis

**Verdict:** Suppression creep — new inline/specific exceptions were added

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 1080 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 53 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1168** | |
| Config pattern rules | 125 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↓ -37
- **Structural:** ↓ -45 
- **Specific:** ↑ +10 **⚠️ Review new suppressions**
- **Configs changed:** type-similarity, composables-logic, hardcoding, duplication, type-escape

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 498 | 12 | 514 | 949 | 0.525 |
| hardcoding | 512 | 40 | 583 | 1027 | 0.499 |
| naming-convention | 70 | 1 | 71 | 1057 | 0.066 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `client/src/composables/admin/useSelectFiltering.ts` (5 audits): composables-logic, function-complexity, error-handling, lint, lint-warnings
- `client/src/composables/useSelectOptions.ts` (3 audits): composables-logic, function-complexity, import-graph
- `client/src/composables/admin/useSelectConfig.ts` (5 audits): composables-logic, function-complexity, error-handling, lint, lint-warnings
- `server/src/services/invites/inviteOrchestrationService.ts` (3 audits): hardcoding, function-complexity, file-cohesion
- `client/src/composables/usePartInstanceData.ts` (3 audits): composables-logic, function-complexity, import-graph
- `client/src/composables/admin/useEntityCardSubPanels.ts` (4 audits): composables-logic, function-complexity, lint, lint-warnings
- `server/src/services/slotComputationService.ts` (3 audits): hardcoding, function-complexity, file-cohesion
- `client/src/composables/admin/useRelationshipCollection.ts` (5 audits): composables-logic, function-complexity, error-handling, lint, lint-warnings
- `client/src/composables/booking/useDevPanelsComputed.ts` (5 audits): composables-logic, function-complexity, todo-aging, lint, lint-warnings
- `client/src/composables/booking/selectionCard/useSelectionCardState.ts` (5 audits): composables-logic, function-complexity, constants-consolidation, lint, lint-warnings
- `client/src/composables/booking/useTimeSlotCalculations.ts` (3 audits): composables-logic, hardcoding, function-complexity
- `client/src/composables/booking/selectionCard/useSelectionCardGroupState.ts` (4 audits): composables-logic, function-complexity, lint, lint-warnings
- `client/src/composables/booking/usePropertyDetailsLogic.ts` (4 audits): composables-logic, function-complexity, lint, lint-warnings
- `client/src/composables/booking/useComputedAvailability.ts` (4 audits): composables-logic, function-complexity, lint, lint-warnings
- `client/src/composables/booking/useAvailabilityDefaults.ts` (3 audits): composables-logic, function-complexity, todo-aging
