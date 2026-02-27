**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Component Health Audit

Generated: 2026-02-27T22:05:52.969Z

## Overview

- Components scanned: **0**
- Findings: **0**
- Files with findings: **0**

## Ruleset

| Rule | Severity | Weight | Description |
| --- | --- | ---: | --- |
| excessive-prop-count | P1 | 2 | Component accepts too many props; consider decomposition or a config/options object. |
| excessive-emit-count | P2 | 1 | Component declares too many events; consider grouping or provide/inject. |
| component-coupling | P1 | 2 | Component imports many sibling components; high coupling surface. |
| emit-relay | info | 0 | Component relays child events to parent unchanged. |
| template-directive-depth | P1 | 2 | Template has deeply nested v-if/v-for directives. |
| oversized-template | P2 | 1 | Template section exceeds 200 lines. |
| complex-template-expression | P2 | 1 | Template expression exceeds 80 characters. |
| deep-slot-wrapper | info | 0 | Named slot buried in deep nesting. |
| unused-named-slot | P2 | 1 | Named slot defined but never filled by any parent. |
| constant-prop-value | info | 0 | Prop always receives the same literal value across all parents. |

## Repair Waves

- **Wave 1 — Local** (parentCount = 0): 0 finding(s)
- **Wave 2 — Low fan-in** (parentCount 1–3): 0 finding(s)
- **Wave 3 — High fan-in** (parentCount ≥ 4): 0 finding(s)

## Notes

- **P1 rules** (weight 2): excessive-prop-count, component-coupling, template-directive-depth — structural issues impacting maintainability.
- **P2 rules** (weight 1): excessive-emit-count, oversized-template, complex-template-expression, unused-named-slot — readability/cleanup signals.
- **Info rules** (weight 0): emit-relay, deep-slot-wrapper, constant-prop-value — informational signals for future optimization.
- Repair waves: Wave 1 (local) = zero cascade risk; Wave 2 (low fan-in) = 1–3 parents to update; Wave 3 (high fan-in) = multi-file coordination needed.
