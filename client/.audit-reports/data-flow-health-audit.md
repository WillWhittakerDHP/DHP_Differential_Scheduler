**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Data Flow Health Audit

Generated: 2026-03-22T17:10:44.938Z

## Overview

- Files scanned: **439**
- Findings: **0**
- Files with findings: **0**
- Phase A (per-file) findings: **0**
- Phase B (cross-file) findings: **0**

## Input Audit Status

| Input Audit | Available | Path |
| --- | --- | --- |
| import-graph | Yes | `/Users/districthomepro/Bonsai/Differential_Scheduler/client/.audit-reports/import-graph-audit.json` |
| api-contract | Yes | `/Users/districthomepro/Bonsai/Differential_Scheduler/client/.audit-reports/api-contract-audit.json` |
| type-inventory | Yes | `/Users/districthomepro/Bonsai/Differential_Scheduler/client/.audit-reports/type-constant-inventory-audit.json` |

## Ruleset

| Rule | Phase | Severity | Weight | Description |
| --- | --- | --- | ---: | --- |
| untyped-inject | A | P1 | 2 | String-keyed inject() creates invisible, untyped dependency; use InjectionKey. |
| query-data-passthrough | A | P2 | 1 | useQuery .data exposed without transformation. |
| direct-api-in-component | A | P1 | 2 | .vue file imports from utils/api or services layer directly. |
| mutation-without-type-params | A | P2 | 1 | useMutation() without type parameters leaves variables and response as unknown. |
| reactive-state-shadow | A | info | 0 | File imports store state AND creates local reactive state; possible dual source of truth. |
| provide-inject-depth | B | P1 | 2 | Provide/inject chain spans 3+ component levels. |
| type-boundary-gap | B | P1 | 2 | Type used in composable but not at component boundary. |
| transformer-bypass | B | P2 | 1 | API data reaches component without passing through transformer layer. |
| orphaned-injection-key | B | P2 | 1 | Provide key with no matching inject or vice versa. |
| bidirectional-data-channel | B | info | 0 | Same data accessible via both inject and direct composable import. |

## Flow Maps Summary

- Provide sites: **30**
- Inject sites: **53**
- Matched pairs: **18**
- Unmatched provides: **12**
- Unmatched injects: **8**

## Repair Waves

- **Wave 1 — Contained** (affectedFiles ≤ 2 or per-file): 0 finding(s)
- **Wave 2 — Moderate** (affectedFiles 3–5): 0 finding(s)
- **Wave 3 — Systemic** (affectedFiles ≥ 6): 0 finding(s)

## Notes

- **Phase A rules** (per-file): untyped-inject, query-data-passthrough, direct-api-in-component, mutation-without-type-params, reactive-state-shadow.
- **Phase B rules** (cross-file): provide-inject-depth, type-boundary-gap, transformer-bypass, orphaned-injection-key, bidirectional-data-channel.
- Repair waves: Wave 1 (contained) = isolated fixes; Wave 2 (moderate) = fix boundary then flow path; Wave 3 (systemic) = coordinated architectural refactor.
- Cross-audit inputs are optional; rules that depend on missing inputs are skipped and listed above.
