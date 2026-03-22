# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-03-22T13:21:29.847Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 0 | 0 |
| composables-logic | 1 | 1 |
| loop-mutation | 0 | 0 |
| hardcoding | 0 | 0 |
| function-complexity | 0 | 0 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 0 | 0 |
| error-handling | 0 | 0 |
| deprecation | 5 | 5 |
| security | 0 | 0 |
| todo-aging | 0 | 0 |
| import-graph | 11 | 11 |
| file-cohesion | 18 | 18 |
| api-contract | 0 | 0 |
| constants-consolidation | 6 | 6 |
| bundle-size-budget | 0 | 0 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 0 | 0 |
| api-versioning | 0 | 0 |
| data-flow | 0 | 0 |
| dep-freshness | 33 | 33 |
| type-escape | 0 | 0 |
| type-import | 1 | 1 |
| lint | 0 | 0 |
| lint-warnings | 0 | 0 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `client/src/composables/booking/injectionKeys.ts` | 34.0 | 1 | file-cohesion |
| `client/src/composables/fieldContext/useFieldContext` | 24.0 | 1 | import-graph |
| `client/src/composables/formFields/useFormFields` | 24.0 | 1 | import-graph |
| `server/src/routes/internal/appointments/appointmentHelpers.ts` | 18.0 | 1 | file-cohesion |
| `client/src/composables/admin/useInstancesTab` | 12.0 | 1 | import-graph |
| `client/src/composables/admin/usePartsCollectionField` | 12.0 | 1 | import-graph |
| `client/src/composables/admin/useRelationshipCollectionField` | 12.0 | 1 | import-graph |
| `client/src/composables/booking/useBookingWizardSetup` | 12.0 | 1 | import-graph |
| `client/src/composables/booking/useMoveablePartsScheduling` | 12.0 | 1 | import-graph |
| `client/src/composables/fieldContext/useFieldContextState` | 12.0 | 1 | import-graph |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 0 → 0 (→ 0)
- **composables-logic**: 0 → 1 (↑ +1)
- **loop-mutation**: 0 → 0 (→ 0)
- **hardcoding**: 0 → 0 (→ 0)
- **function-complexity**: 0 → 0 (→ 0)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 0 → 0 (→ 0)
- **error-handling**: 0 → 0 (→ 0)
- **deprecation**: 3 → 5 (↑ +2)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 0 → 0 (→ 0)
- **import-graph**: 11 → 11 (→ 0)
- **file-cohesion**: 16 → 18 (↑ +2)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 8 → 6 (↓ -2)
- **bundle-size-budget**: 0 → 0 (→ 0)
- **coverage-risk-crossref**: 0 → 0 (→ 0)
- **naming-convention**: 0 → 0 (→ 0)
- **api-versioning**: 0 → 0 (→ 0)
- **data-flow**: 0 → 0 (→ 0)
- **dep-freshness**: 19 → 33 (↑ +14)
- **type-escape**: 0 → 0 (→ 0)
- **type-import**: 0 → 1 (↑ +1)
- **lint**: 0 → 0 (→ 0)
- **lint-warnings**: 0 → 0 (→ 0)

## Exception Analysis

**Verdict:** Improving — total exceptions decreased

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 0 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 0 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **0** | |
| Config pattern rules | 176 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↓ -2
- **Structural:** ↓ -1 
- **Specific:** ↓ -1 
- **Configs changed:** function-complexity

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

No files appear in 3 or more audits.
