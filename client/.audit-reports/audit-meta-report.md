# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-02-23T18:13:14.015Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 44 | 44 |
| composables-logic | 179 | 8 |
| loop-mutation | 0 | 0 |
| hardcoding | 38 | 64 |
| function-complexity | 242 | 242 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 0 | 0 |
| error-handling | 2 | 2 |
| deprecation | 1 | 10 |
| security | 0 | 0 |
| todo-aging | 5 | 5 |
| import-graph | 2 | 2 |
| file-cohesion | 18 | 18 |
| api-contract | 0 | 0 |
| constants-consolidation | 12 | 27 |
| bundle-size-budget | 21 | 21 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 3 | 3 |
| api-versioning | 47 | 47 |
| data-flow | 8 | 9 |
| dep-freshness | 5 | 5 |
| type-escape | 2 | 2 |
| type-import | 0 | 0 |
| lint | 0 | 0 |
| lint-warnings | 0 | 0 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `server/src/services/invites/inviteOrchestrationService.ts` | 109.8 | 5 | hardcoding, function-complexity, deprecation, file-cohesion, constants-consolidation |
| `client/src/composables/admin/useBusinessRules.ts` | 49.0 | 2 | composables-logic, function-complexity |
| `server/src/utils/propertyTransformers.ts` | 44.5 | 2 | function-complexity, constants-consolidation |
| `client/src/composables/useSelectOptions.ts` | 44.0 | 3 | composables-logic, function-complexity, import-graph |
| `client/src/composables/useRelationship.ts` | 43.5 | 2 | composables-logic, function-complexity |
| `server/src/routes/helpers/crudRouteHandlers.ts` | 40.5 | 1 | function-complexity |
| `client/src/composables/usePartInstanceData.ts` | 40.0 | 3 | composables-logic, function-complexity, import-graph |
| `server/src/routes/internal/properties/propertyConstants.ts` | 40.0 | 1 | constants-consolidation |
| `client/src/composables/booking/useMoveablePartsScheduling.ts` | 37.5 | 2 | composables-logic, function-complexity |
| `client/src/composables/fieldContext/useFieldContextSaveHelpers.ts` | 35.5 | 2 | composables-logic, function-complexity |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 44 → 44 (→ 0)
- **composables-logic**: 10 → 8 (↓ -2)
- **loop-mutation**: 0 → 0 (→ 0)
- **hardcoding**: 82 → 64 (↓ -18)
- **function-complexity**: 254 → 242 (↓ -12)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 0 → 0 (→ 0)
- **error-handling**: 0 → 2 (↑ +2)
- **deprecation**: 105 → 10 (↓ -95)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 11 → 5 (↓ -6)
- **import-graph**: 4 → 2 (↓ -2)
- **file-cohesion**: 25 → 18 (↓ -7)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 17 → 27 (↑ +10)
- **bundle-size-budget**: 22 → 21 (↓ -1)
- **coverage-risk-crossref**: 0 → 0 (→ 0)
- **naming-convention**: 1 → 3 (↑ +2)
- **api-versioning**: 47 → 47 (→ 0)
- **data-flow**: 10 → 9 (↓ -1)
- **dep-freshness**: 5 → 5 (→ 0)
- **type-escape**: 1 → 2 (↑ +1)
- **type-import**: 2 → 0 (↓ -2)
- **lint**: 0 → 0 (→ 0)
- **lint-warnings**: 0 → 0 (→ 0)

## Exception Analysis

**Verdict:** Stable — no meaningful exception changes

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 1125 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 43 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1205** | |
| Config pattern rules | 86 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↑ +17
- **Structural:** ↓ -15 
- **Specific:** ↓ -5 
- **Configs changed:** loop-mutation, hardcoding, error-handling, deprecation, type-import

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 533 | 16 | 553 | 685 | 0.778 |
| hardcoding | 517 | 26 | 576 | 768 | 0.673 |
| naming-convention | 75 | 1 | 76 | 795 | 0.094 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `server/src/services/invites/inviteOrchestrationService.ts` (5 audits): hardcoding, function-complexity, deprecation, file-cohesion, constants-consolidation
- `client/src/composables/useSelectOptions.ts` (3 audits): composables-logic, function-complexity, import-graph
- `client/src/composables/usePartInstanceData.ts` (3 audits): composables-logic, function-complexity, import-graph
- `server/src/services/slotComputationService.ts` (3 audits): hardcoding, function-complexity, file-cohesion
- `client/src/composables/admin/useSelectFiltering.ts` (3 audits): composables-logic, function-complexity, file-cohesion
- `client/src/composables/booking/useTimeSlotCalculations.ts` (3 audits): composables-logic, hardcoding, function-complexity
- `client/src/components/booking/dev/DevPanelsContainer.vue` (4 audits): component-logic, function-complexity, todo-aging, file-cohesion
- `client/src/composables/booking/useComputedAvailability.ts` (3 audits): composables-logic, hardcoding, function-complexity
- `client/src/utils/booking/appointmentDataBuilders.ts` (3 audits): hardcoding, function-complexity, file-cohesion
- `client/src/composables/admin/useBusinessRuleForm.ts` (3 audits): composables-logic, hardcoding, function-complexity
- `server/src/services/computedAvailabilityService.ts` (3 audits): hardcoding, function-complexity, file-cohesion
