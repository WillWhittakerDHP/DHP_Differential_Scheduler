# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-03-04T15:30:37.003Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 0 | 0 |
| composables-logic | 0 | 0 |
| loop-mutation | 0 | 0 |
| hardcoding | 0 | 0 |
| function-complexity | 3 | 3 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 0 | 0 |
| error-handling | 1 | 1 |
| deprecation | 0 | 0 |
| security | 0 | 0 |
| todo-aging | 0 | 0 |
| import-graph | 10 | 10 |
| file-cohesion | 15 | 15 |
| api-contract | 0 | 0 |
| constants-consolidation | 2 | 1 |
| bundle-size-budget | 0 | 0 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 0 | 0 |
| api-versioning | 0 | 0 |
| data-flow | 0 | 0 |
| dep-freshness | 9 | 9 |
| type-escape | 0 | 0 |
| type-import | 0 | 0 |
| lint | 0 | 0 |
| lint-warnings | 0 | 0 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `client/src/composables/booking/injectionKeys.ts` | 28.0 | 1 | file-cohesion |
| `client/src/composables/fieldContext/useFieldContext` | 24.0 | 1 | import-graph |
| `client/src/composables/formFields/useFormFields` | 24.0 | 1 | import-graph |
| `client/src/composables/booking/useMoveableAvailabilityData.ts` | 12.0 | 2 | function-complexity, error-handling |
| `client/src/composables/admin/useInstancesTab` | 12.0 | 1 | import-graph |
| `client/src/composables/admin/usePartsCollectionField` | 12.0 | 1 | import-graph |
| `client/src/composables/admin/useRelationshipCollectionField` | 12.0 | 1 | import-graph |
| `client/src/composables/booking/useBookingWizardSetup` | 12.0 | 1 | import-graph |
| `client/src/composables/booking/useMoveablePartsScheduling` | 12.0 | 1 | import-graph |
| `client/src/composables/fieldContext/useFieldContextState` | 12.0 | 1 | import-graph |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 1 → 0 (↓ -1)
- **composables-logic**: 1 → 0 (↓ -1)
- **loop-mutation**: 0 → 0 (→ 0)
- **hardcoding**: 0 → 0 (→ 0)
- **function-complexity**: 118 → 3 (↓ -115)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 0 → 0 (→ 0)
- **error-handling**: 0 → 1 (↑ +1)
- **deprecation**: 0 → 0 (→ 0)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 2 → 0 (↓ -2)
- **import-graph**: 4 → 10 (↑ +6)
- **file-cohesion**: 13 → 15 (↑ +2)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 0 → 1 (↑ +1)
- **bundle-size-budget**: 0 → 0 (→ 0)
- **coverage-risk-crossref**: 0 → 0 (→ 0)
- **naming-convention**: 0 → 0 (→ 0)
- **api-versioning**: 0 → 0 (→ 0)
- **data-flow**: 0 → 0 (→ 0)
- **dep-freshness**: 2 → 9 (↑ +7)
- **type-escape**: 0 → 0 (→ 0)
- **type-import**: 0 → 0 (→ 0)
- **lint**: 0 → 0 (→ 0)
- **lint-warnings**: 0 → 0 (→ 0)

## Exception Analysis

**Verdict:** Improving — total exceptions decreased

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 16 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 1 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **17** | |
| Config pattern rules | 175 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↓ -1046
- **Structural:** ↓ -924 
- **Specific:** ↓ -87 
- **Configs changed:** error-handling, import-graph, constants-consolidation

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 16 | 0 | 16 | 9 | 1.778 |
| constants-consolidation | 0 | 1 | 1 | 977 | 0 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

No files appear in 3 or more audits.
