**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Data Flow Health Audit Summary (Generated)

Generated from `client/.audit-reports/data-flow-health-audit.json`.

## Overview

| Metric | Count |
| --- | ---: |
| Total scanned | 411 |
| Findings | 0 |
| Phase A (per-file) | 0 |
| Phase B (cross-file) | 0 |
| Files with findings | 0 |

## Input Audit Status

| Input | Available |
| --- | --- |
| import-graph | Yes |
| api-contract | Yes |
| type-inventory | Yes |

## By rule

| Rule | Phase | Severity | Count |
| --- | --- | --- | ---: |

## Flow Maps

- Provide sites: **28**
- Inject sites: **50**
- Matched pairs: **15**
- Unmatched provides: **13**
- Unmatched injects: **8**

## Repair waves

- **Contained** (affectedFiles ≤ 2 or per-file): 0
- **Moderate** (affectedFiles 3–5): 0
- **Systemic** (affectedFiles ≥ 6): 0

## Notes

- Full report: `client/.audit-reports/data-flow-health-audit.md`. Phase A = per-file rules, Phase B = cross-file correlation using import-graph, api-contract, and type-inventory audits.
- Repair waves prioritize fixes: contained (isolated) → moderate (flow path) → systemic (architectural refactor).
