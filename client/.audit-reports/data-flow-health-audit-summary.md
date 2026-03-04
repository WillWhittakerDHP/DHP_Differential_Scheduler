**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Data Flow Health Audit Summary (Generated)

Generated from `client/.audit-reports/data-flow-health-audit.json`.

## Overview

| Metric | Count |
| --- | ---: |
| Total scanned | 426 |
| Findings | 3 |
| Phase A (per-file) | 0 |
| Phase B (cross-file) | 3 |
| Files with findings | 2 |

## Input Audit Status

| Input | Available |
| --- | --- |
| import-graph | Yes |
| api-contract | Yes |
| type-inventory | Yes |

## Delta (vs previous run)

| Baseline state | Count |
| --- | ---: |
| New | 3 |
| Regressed | 0 |
| Unchanged | 0 |
| Resolved | 0 |

### By rule

| Rule | New | Unchanged | Resolved | Regressed |
| --- | ---: | ---: | ---: | ---: |
| provide-inject-depth | 2 | 0 | 0 | 0 |
| bidirectional-data-channel | 1 | 0 | 0 | 0 |

### New findings

| File | Line | Rule | Snippet |
| --- | ---: | --- | --- |
| `client/src/composables/admin/useEventInstancesSection.ts` | 22 | provide-inject-depth | inject('instancesTabContextKey') — provider in client/src/co |
| `client/src/composables/admin/useOverlapConstraintsPanel.ts` | 40 | provide-inject-depth | inject('BUSINESS_CONTROLS_STATE_KEY') — provider in client/s |
| `client/src/composables/admin/useEventInstancesSection.ts` | 22 | bidirectional-data-channel | inject('instancesTabContextKey') + composable import in same |

## By rule

| Rule | Phase | Severity | Count |
| --- | --- | --- | ---: |
| provide-inject-depth | B | P1 | 2 |
| bidirectional-data-channel | B | info | 1 |

## Flow Maps

- Provide sites: **28**
- Inject sites: **50**
- Matched pairs: **15**
- Unmatched provides: **13**
- Unmatched injects: **8**

## Repair waves

- **Contained** (affectedFiles ≤ 2 or per-file): 3
- **Moderate** (affectedFiles 3–5): 0
- **Systemic** (affectedFiles ≥ 6): 0

## Top flow paths by affected file count

| File | Rule | Phase | Affected |
| --- | --- | --- | ---: |
| `client/src/composables/admin/useEventInstancesSection.ts` | provide-inject-depth | B | 2 |
| `client/src/composables/admin/useOverlapConstraintsPanel.ts` | provide-inject-depth | B | 2 |

## Top 2 files by severity

| File | Priority | Score |
| --- | --- | ---: |
| `client/src/composables/admin/useEventInstancesSection.ts` | P2 | 2 |
| `client/src/composables/admin/useOverlapConstraintsPanel.ts` | P2 | 2 |

## Notes

- Full report: `client/.audit-reports/data-flow-health-audit.md`. Phase A = per-file rules, Phase B = cross-file correlation using import-graph, api-contract, and type-inventory audits.
- Repair waves prioritize fixes: contained (isolated) → moderate (flow path) → systemic (architectural refactor).
