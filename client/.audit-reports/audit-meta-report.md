# Audit Meta Report (Generated)

**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


Generated at: 2026-02-26T01:17:21.306Z

## Audit Coverage

| Audit | Files | Findings |
| --- | ---: | ---: |
| type-similarity | 0 | 0 |
| component-logic | 1 | 1 |
| composables-logic | 1 | 1 |
| loop-mutation | 0 | 0 |
| hardcoding | 0 | 0 |
| function-complexity | 118 | 118 |
| pattern-detection | 0 | 0 |
| duplication | 0 | 0 |
| unused-code | 0 | 0 |
| error-handling | 0 | 0 |
| deprecation | 0 | 0 |
| security | 0 | 0 |
| todo-aging | 2 | 2 |
| import-graph | 4 | 4 |
| file-cohesion | 13 | 13 |
| api-contract | 0 | 0 |
| constants-consolidation | 0 | 0 |
| bundle-size-budget | 0 | 0 |
| coverage-risk-crossref | 0 | 0 |
| naming-convention | 0 | 0 |
| api-versioning | 0 | 0 |
| data-flow | 0 | 0 |
| dep-freshness | 2 | 2 |
| type-escape | 0 | 0 |
| type-import | 0 | 0 |
| lint | 0 | 0 |
| lint-warnings | 0 | 0 |

Audits loaded: 27 / 27

## Top 10 Hotspot Files

Files appearing across the most audits with the highest combined weighted score.

| File | Score | Audits | Which Audits |
| --- | ---: | ---: | --- |
| `client/src/composables/fieldContext/useFieldContextState.ts` | 35.0 | 2 | composables-logic, function-complexity |
| `client/src/composables/booking/injectionKeys.ts` | 24.0 | 1 | file-cohesion |
| `server/src/routes/internal/businessSettings/businessSettingsValidators.ts` | 22.5 | 1 | function-complexity |
| `server/src/routes/internal/shared/metadataValidatorFactory.ts` | 22.5 | 1 | function-complexity |
| `server/src/services/google/maps/routesApiService.ts` | 19.5 | 1 | function-complexity |
| `server/src/services/computedAvailabilityService.ts` | 18.0 | 2 | function-complexity, file-cohesion |
| `server/src/routes/internal/appointments/appointmentHelpers.ts` | 15.5 | 2 | function-complexity, file-cohesion |
| `client/src/components/booking/plugins/wizardStatePlugin.ts` | 15.0 | 1 | function-complexity |
| `client/src/composables/admin/useAdminAvailabilitySettings.ts` | 15.0 | 1 | function-complexity |
| `client/src/composables/admin/useBusinessRuleForm.ts` | 15.0 | 1 | function-complexity |

## Trend (vs previous run)

- **type-similarity**: 0 → 0 (→ 0)
- **component-logic**: 1 → 1 (→ 0)
- **composables-logic**: 1 → 1 (→ 0)
- **loop-mutation**: 0 → 0 (→ 0)
- **hardcoding**: 9 → 0 (↓ -9)
- **function-complexity**: 118 → 118 (→ 0)
- **pattern-detection**: 0 → 0 (→ 0)
- **duplication**: 0 → 0 (→ 0)
- **unused-code**: 0 → 0 (→ 0)
- **error-handling**: 13 → 0 (↓ -13)
- **deprecation**: 0 → 0 (→ 0)
- **security**: 0 → 0 (→ 0)
- **todo-aging**: 2 → 2 (→ 0)
- **import-graph**: 4 → 4 (→ 0)
- **file-cohesion**: 13 → 13 (→ 0)
- **api-contract**: 0 → 0 (→ 0)
- **constants-consolidation**: 0 → 0 (→ 0)
- **bundle-size-budget**: 0 → 0 (→ 0)
- **coverage-risk-crossref**: 0 → 0 (→ 0)
- **naming-convention**: 0 → 0 (→ 0)
- **api-versioning**: 0 → 0 (→ 0)
- **data-flow**: 0 → 0 (→ 0)
- **dep-freshness**: 2 → 2 (→ 0)
- **type-escape**: 0 → 0 (→ 0)
- **type-import**: 0 → 0 (→ 0)
- **lint**: 0 → 0 (→ 0)
- **lint-warnings**: 0 → 0 (→ 0)

## Exception Analysis

**Verdict:** Suppression creep — new inline/specific exceptions were added

### Totals

| Category | Count | Description |
| --- | ---: | --- |
| Structural (patterns) | 940 | Glob patterns in config files — architectural decisions |
| Specific (suppressions) | 88 | Inline @audit-allow comments + specific config entries |
| **Total allowed** | **1063** | |
| Config pattern rules | 180 | Total glob/specific rules across all config files |

### Changes (vs previous run)

- **Total:** ↑ +593
- **Structural:** ↑ +507 
- **Specific:** ↑ +62 **⚠️ Review new suppressions**
- **Configs changed:** hardcoding, error-handling

### Per-Audit Breakdown

| Audit | Structural | Specific | Total | Scanned | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| loop-mutation | 417 | 0 | 419 | 341 | 1.223 |
| hardcoding | 507 | 85 | 625 | 1058 | 0.479 |
| error-handling | 0 | 3 | 3 | 1085 | 0 |
| naming-convention | 16 | 0 | 16 | 1084 | 0.015 |

> **Ratio** = structural exceptions / scanned files. A stable ratio across runs means the codebase grew but patterns did not change.

## Cross-Audit Correlations

Files that appear in 3+ different audits often have systemic issues:

No files appear in 3 or more audits.
