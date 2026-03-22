# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-03-22T02:02:16.315Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 0 | 0 |
| composables-logic | 3 | 3 |
| loop-mutation | 0 | 0 |
| hardcoding | 1 | 1 |
| function-complexity | 12 | 12 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 0 | 0 |
| error-handling | 0 | 0 |
| deprecation | 27 | 54 |
| security | 1 | 1 |
| todo-aging | 0 | 0 |
| import-graph | 11 | 11 |
| file-cohesion | 25 | 25 |
| api-contract | 0 | 0 |
| constants-consolidation | 17 | 39 |
| bundle-size-budget | 0 | 0 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 1 | 1 |
| api-versioning | 0 | 0 |
| data-flow | 3 | 3 |
| dep-freshness | 32 | 32 |
| type-escape | 2 | 6 |
| type-import | 0 | 0 |
| lint | 0 | 0 |
| lint-warnings | 0 | 0 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `server/src/repositories/appointmentSelectionCodec.ts` | 80.0 | 1 | deprecation |
| `server/src/routes/internal/event-instance-preview/eventInstancePreviewRouter.ts` | 46.0 | 2 | security, data-flow |
| `server/src/repositories/appointmentPropertyDetailsSync.ts` | 40.7 | 1 | constants-consolidation |
| `server/src/services/appointmentSnapshotLoader.ts` | 40.0 | 1 | deprecation |
| `client/src/composables/booking/injectionKeys.ts` | 36.0 | 1 | file-cohesion |
| `server/src/routes/internal/properties/propertyConstants.ts` | 35.3 | 1 | constants-consolidation |
| `server/src/routes/internal/entities/entityConstants.ts` | 31.3 | 1 | constants-consolidation |
| `client/src/composables/formFields/useFormFields.ts` | 29.0 | 2 | function-complexity, type-escape |
| `server/src/db/models/index.ts` | 25.2 | 2 | file-cohesion, constants-consolidation |
| `client/src/composables/fieldContext/useFieldContext` | 24.0 | 1 | import-graph |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 0 → 0 (→ 0)
- **composables-logic**: 0 → 3 (↑ +3)
- **loop-mutation**: 0 → 0 (→ 0)
- **hardcoding**: 0 → 1 (↑ +1)
- **function-complexity**: 0 → 12 (↑ +12)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 0 → 0 (→ 0)
- **error-handling**: 0 → 0 (→ 0)
- **deprecation**: 3 → 54 (↑ +51)
- **security**: 0 → 1 (↑ +1)
- **todo-aging**: 0 → 0 (→ 0)
- **import-graph**: 11 → 11 (→ 0)
- **file-cohesion**: 16 → 25 (↑ +9)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 8 → 39 (↑ +31)
- **bundle-size-budget**: 0 → 0 (→ 0)
- **coverage-risk-crossref**: 0 → 0 (→ 0)
- **naming-convention**: 0 → 1 (↑ +1)
- **api-versioning**: 0 → 0 (→ 0)
- **data-flow**: 0 → 3 (↑ +3)
- **dep-freshness**: 19 → 32 (↑ +13)
- **type-escape**: 0 → 6 (↑ +6)
- **type-import**: 0 → 0 (→ 0)
- **lint**: 0 → 0 (→ 0)
- **lint-warnings**: 0 → 0 (→ 0)

## Exception Analysis

**Verdict:** Suppression creep — new inline/specific exceptions were added

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 137 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 23 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **164** | |
| Config pattern rules | 176 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↑ +162
- **Structural:** ↑ +136 
- **Specific:** ↑ +22 **⚠️ Review new suppressions**
- **Configs changed:** function-complexity

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 51 | 16 | 67 | 52 | 0.981 |
| hardcoding | 80 | 7 | 91 | 53 | 1.509 |
| naming-convention | 6 | 0 | 6 | 1214 | 0.005 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

No files appear in 3 or more audits.
