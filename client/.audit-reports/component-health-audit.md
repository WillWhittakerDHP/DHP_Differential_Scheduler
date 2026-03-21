**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Component Health Audit

Generated: 2026-03-21T17:18:47.090Z

## Overview

- Components scanned: **127**
- Findings: **16**
- Files with findings: **11**

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
| complex-template-expression | P2 | 5 |
| oversized-template | P2 | 5 |
| excessive-prop-count | P1 | 2 |
| emit-relay | info | 2 |
| constant-prop-value | info | 1 |
| component-coupling | P1 | 1 |

## Repair Waves

- **Wave 1 — Local** (parentCount = 0): 0 finding(s)
- **Wave 2 — Low fan-in** (parentCount 1–3): 15 finding(s)
- **Wave 3 — High fan-in** (parentCount ≥ 4): 1 finding(s)

## Top 11 files by score

| File | Priority | Score | Parents |
| --- | --- | ---: | ---: |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | P1 | 4 | 1 |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | P1 | 3 | 1 |
| `client/src/components/admin/BulkEditModal.vue` | P2 | 2 | 4 |
| `client/src/views/admin/tabs/components/AppointmentConfirmationPanel.vue` | P2 | 2 | 1 |
| `client/src/components/admin/generic/fields/BooleanInput.vue` | P2 | 1 | 1 |
| `client/src/components/booking/AppointmentSlotGrid.vue` | P2 | 1 | 3 |
| `client/src/views/admin/tabs/ShapesTab.vue` | P2 | 1 | 1 |
| `client/src/views/admin/tabs/components/PropertiesTable.vue` | P2 | 1 | 1 |
| `client/src/views/admin/tabs/components/UsersTable.vue` | P2 | 1 | 1 |
| `client/src/components/booking/steps/SlotGridWithOverlay.vue` | P2 | 0 | 1 |
| `client/src/views/admin/tabs/components/ShapeCreationForm.vue` | P2 | 0 | 1 |

## All findings (first 60)

| File | Line | Rule | Message | Parents |
| --- | ---: | --- | --- | ---: |
| `client/src/components/admin/BulkEditModal.vue` | 74 | excessive-prop-count | Component accepts 8 props; consider decomposition or a co... | 4 |
| `client/src/components/admin/generic/fields/BooleanInput.vue` | 16 | complex-template-expression | Complex template expression (86 chars); extract to comput... | 1 |
| `client/src/components/booking/AppointmentSlotGrid.vue` | 103 | complex-template-expression | Complex template expression (95 chars); extract to comput... | 3 |
| `client/src/components/booking/steps/SlotGridWithOverlay.vue` | 5 | constant-prop-value | Prop 'color' always receives 'primary'; consider making i... | 1 |
| `client/src/views/admin/tabs/ShapesTab.vue` | 72 | oversized-template | Template is 453 lines; extract sub-components to improve ... | 1 |
| `client/src/views/admin/tabs/components/AppointmentConfirmationPanel.vue` | 12 | excessive-prop-count | Component accepts 8 props; consider decomposition or a co... | 1 |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | 5 | component-coupling | Component imports 6 sibling components; high coupling sur... | 1 |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | 88 | oversized-template | Template is 254 lines; extract sub-components to improve ... | 1 |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | 22 | oversized-template | Template is 281 lines; extract sub-components to improve ... | 1 |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | 49 | complex-template-expression | Complex template expression (105 chars); extract to compu... | 1 |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | 52 | complex-template-expression | Complex template expression (133 chars); extract to compu... | 1 |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | 265 | complex-template-expression | Complex template expression (105 chars); extract to compu... | 1 |
| `client/src/views/admin/tabs/components/PropertiesTable.vue` | 52 | oversized-template | Template is 282 lines; extract sub-components to improve ... | 1 |
| `client/src/views/admin/tabs/components/ShapeCreationForm.vue` | 27 | emit-relay | Event relay detected for 'saved'; consider provide/inject... | 1 |
| `client/src/views/admin/tabs/components/ShapeCreationForm.vue` | 28 | emit-relay | Event relay detected for 'cancelled'; consider provide/in... | 1 |
| `client/src/views/admin/tabs/components/UsersTable.vue` | 47 | oversized-template | Template is 209 lines; extract sub-components to improve ... | 1 |

## Notes

- **P1 rules** (weight 2): excessive-prop-count, component-coupling, template-directive-depth — structural issues impacting maintainability.
- **P2 rules** (weight 1): excessive-emit-count, oversized-template, complex-template-expression, unused-named-slot — readability/cleanup signals.
- **Info rules** (weight 0): emit-relay, deep-slot-wrapper, constant-prop-value — informational signals for future optimization.
- Repair waves: Wave 1 (local) = zero cascade risk; Wave 2 (low fan-in) = 1–3 parents to update; Wave 3 (high fan-in) = multi-file coordination needed.
