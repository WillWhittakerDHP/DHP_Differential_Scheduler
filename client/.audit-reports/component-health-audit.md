**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Component Health Audit

Generated: 2026-03-22T02:01:44.946Z

## Overview

- Components scanned: **5**
- Findings: **5**
- Files with findings: **3**

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

## By rule

| Rule | Severity | Count |
| --- | --- | ---: |
| complex-template-expression | P2 | 3 |
| oversized-template | P2 | 1 |
| component-coupling | P1 | 1 |

## Repair Waves

- **Wave 1 — Local** (parentCount = 0): 0 finding(s)
- **Wave 2 — Low fan-in** (parentCount 1–3): 3 finding(s)
- **Wave 3 — High fan-in** (parentCount ≥ 4): 2 finding(s)

## Top 3 files by score

| File | Priority | Score | Parents |
| --- | --- | ---: | ---: |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | P1 | 3 | 1 |
| `client/src/components/admin/generic/fields/FieldRenderer.vue` | P2 | 2 | 5 |
| `client/src/components/admin/generic/EntityCard.vue` | P2 | 1 | 7 |

## All findings (first 60)

| File | Line | Rule | Message | Parents |
| --- | ---: | --- | --- | ---: |
| `client/src/components/admin/generic/EntityCard.vue` | 263 | oversized-template | Template is 260 lines; extract sub-components to improve ... | 7 |
| `client/src/components/admin/generic/fields/FieldRenderer.vue` | 37 | component-coupling | Component imports 5 sibling components; high coupling sur... | 5 |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | 49 | complex-template-expression | Complex template expression (105 chars); extract to compu... | 1 |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | 52 | complex-template-expression | Complex template expression (133 chars); extract to compu... | 1 |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | 79 | complex-template-expression | Complex template expression (105 chars); extract to compu... | 1 |

## Notes

- **P1 rules** (weight 2): excessive-prop-count, component-coupling, template-directive-depth — structural issues impacting maintainability.
- **P2 rules** (weight 1): excessive-emit-count, oversized-template, complex-template-expression, unused-named-slot — readability/cleanup signals.
- **Info rules** (weight 0): emit-relay, deep-slot-wrapper, constant-prop-value — informational signals for future optimization.
- Repair waves: Wave 1 (local) = zero cascade risk; Wave 2 (low fan-in) = 1–3 parents to update; Wave 3 (high fan-in) = multi-file coordination needed.
