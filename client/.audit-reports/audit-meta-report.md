# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-03-07T18:37:55.899Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 1 | 1 |
| composables-logic | 0 | 0 |
| loop-mutation | 0 | 0 |
| hardcoding | 2 | 2 |
| function-complexity | 1 | 1 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 0 | 0 |
| error-handling | 0 | 0 |
| deprecation | 0 | 0 |
| security | 0 | 0 |
| todo-aging | 0 | 0 |
| import-graph | 11 | 11 |
| file-cohesion | 16 | 16 |
| api-contract | 0 | 0 |
| constants-consolidation | 2 | 1 |
| bundle-size-budget | 0 | 0 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 0 | 0 |
| api-versioning | 0 | 0 |
| data-flow | 0 | 0 |
| dep-freshness | 19 | 19 |
| type-escape | 0 | 0 |
| type-import | 0 | 0 |
| lint | 0 | 0 |
| lint-warnings | 0 | 0 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `server/src/routes/internal/appointments/appointmentHelpers.ts` | 28.5 | 3 | hardcoding, function-complexity, file-cohesion |
| `client/src/composables/booking/injectionKeys.ts` | 28.0 | 1 | file-cohesion |
| `client/src/composables/fieldContext/useFieldContext` | 24.0 | 1 | import-graph |
| `client/src/composables/formFields/useFormFields` | 24.0 | 1 | import-graph |
| `client/src/composables/admin/useInstancesTab` | 12.0 | 1 | import-graph |
| `client/src/composables/admin/usePartsCollectionField` | 12.0 | 1 | import-graph |
| `client/src/composables/admin/useRelationshipCollectionField` | 12.0 | 1 | import-graph |
| `client/src/composables/booking/useBookingWizardSetup` | 12.0 | 1 | import-graph |
| `client/src/composables/booking/useMoveablePartsScheduling` | 12.0 | 1 | import-graph |
| `client/src/composables/fieldContext/useFieldContextState` | 12.0 | 1 | import-graph |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 0 → 1 (↑ +1)
- **composables-logic**: 0 → 0 (→ 0)
- **loop-mutation**: 0 → 0 (→ 0)
- **hardcoding**: 0 → 2 (↑ +2)
- **function-complexity**: 3 → 1 (↓ -2)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 0 → 0 (→ 0)
- **error-handling**: 1 → 0 (↓ -1)
- **deprecation**: 0 → 0 (→ 0)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 0 → 0 (→ 0)
- **import-graph**: 10 → 11 (↑ +1)
- **file-cohesion**: 15 → 16 (↑ +1)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 1 → 1 (→ 0)
- **bundle-size-budget**: 0 → 0 (→ 0)
- **coverage-risk-crossref**: 0 → 0 (→ 0)
- **naming-convention**: 0 → 0 (→ 0)
- **api-versioning**: 0 → 0 (→ 0)
- **data-flow**: 0 → 0 (→ 0)
- **dep-freshness**: 9 → 19 (↑ +10)
- **type-escape**: 0 → 0 (→ 0)
- **type-import**: 0 → 0 (→ 0)
- **lint**: 0 → 0 (→ 0)
- **lint-warnings**: 0 → 0 (→ 0)

## Exception Analysis

**Verdict:** Config expanded — allowlist rules were added or modified

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 39 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 1 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **41** | |
| Config pattern rules | 174 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↑ +24
- **Structural:** ↑ +23 
- **Specific:** → 0 
- **Configs changed:** type-import

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 39 | 0 | 39 | 6 | 6.5 |
| hardcoding | 0 | 0 | 1 | 9 | 0 |
| constants-consolidation | 0 | 1 | 1 | 981 | 0 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

- `server/src/routes/internal/appointments/appointmentHelpers.ts` (3 audits): hardcoding, function-complexity, file-cohesion
