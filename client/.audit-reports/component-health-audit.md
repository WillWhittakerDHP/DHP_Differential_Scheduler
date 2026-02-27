**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.

# Component Health Audit

Generated: 2026-02-26T23:57:36.865Z

## Overview

- Components scanned: **102**
- Findings: **20**
- Files with findings: **14**

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
| oversized-template | P2 | 7 |
| complex-template-expression | P2 | 6 |
| excessive-prop-count | P1 | 3 |
| component-coupling | P1 | 2 |
| emit-relay | info | 2 |

## Repair Waves

- **Wave 1 — Local** (parentCount = 0): 3 finding(s)
- **Wave 2 — Low fan-in** (parentCount 1–3): 16 finding(s)
- **Wave 3 — High fan-in** (parentCount ≥ 4): 1 finding(s)

## Top 14 files by score

| File | Priority | Score | Parents |
| --- | --- | ---: | ---: |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | P1 | 4 | 1 |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | P1 | 3 | 1 |
| `client/src/components/admin/BulkEditModal.vue` | P2 | 2 | 4 |
| `client/src/components/booking/steps/AvailabilityStep.vue` | P2 | 2 | 0 |
| `client/src/components/booking/steps/PropertyAddressSection.vue` | P2 | 2 | 1 |
| `client/src/components/booking/steps/PropertyDetailsSection.vue` | P2 | 2 | 1 |
| `client/src/components/booking/steps/PropertyDetailsStep.vue` | P2 | 2 | 0 |
| `client/src/components/admin/generic/fields/BooleanInput.vue` | P2 | 1 | 1 |
| `client/src/components/booking/steps/ContactFormSection.vue` | P2 | 1 | 1 |
| `client/src/views/admin/tabs/ShapesTab.vue` | P2 | 1 | 1 |
| `client/src/views/admin/tabs/components/OverlapConstraintsPanel.vue` | P2 | 1 | 1 |
| `client/src/views/admin/tabs/components/PropertiesTable.vue` | P2 | 1 | 1 |
| `client/src/views/admin/tabs/components/UsersTable.vue` | P2 | 1 | 1 |
| `client/src/views/admin/tabs/components/ShapeCreationForm.vue` | P2 | 0 | 1 |

## All findings (first 60)

| File | Line | Rule | Message | Parents |
| --- | ---: | --- | --- | ---: |
| `client/src/components/admin/BulkEditModal.vue` | 75 | excessive-prop-count | Component accepts 8 props; consider decomposition or a co... | 4 |
| `client/src/components/admin/generic/fields/BooleanInput.vue` | 17 | complex-template-expression | Complex template expression (86 chars); extract to comput... | 1 |
| `client/src/components/booking/steps/AvailabilityStep.vue` | 1 | component-coupling | Component imports 5 sibling components; high coupling sur... | 0 |
| `client/src/components/booking/steps/ContactFormSection.vue` | 5 | oversized-template | Template is 270 lines; extract sub-components to improve ... | 1 |
| `client/src/components/booking/steps/PropertyAddressSection.vue` | 108 | excessive-prop-count | Component accepts 9 props; consider decomposition or a co... | 1 |
| `client/src/components/booking/steps/PropertyDetailsSection.vue` | 168 | excessive-prop-count | Component accepts 10 props; consider decomposition or a c... | 1 |
| `client/src/components/booking/steps/PropertyDetailsStep.vue` | 192 | complex-template-expression | Complex template expression (126 chars); extract to compu... | 0 |
| `client/src/components/booking/steps/PropertyDetailsStep.vue` | 208 | complex-template-expression | Complex template expression (88 chars); extract to comput... | 0 |
| `client/src/views/admin/tabs/ShapesTab.vue` | 185 | oversized-template | Template is 471 lines; extract sub-components to improve ... | 1 |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | 6 | component-coupling | Component imports 6 sibling components; high coupling sur... | 1 |
| `client/src/views/admin/tabs/components/AppointmentsTable.vue` | 80 | oversized-template | Template is 251 lines; extract sub-components to improve ... | 1 |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | 33 | oversized-template | Template is 281 lines; extract sub-components to improve ... | 1 |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | 60 | complex-template-expression | Complex template expression (105 chars); extract to compu... | 1 |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | 63 | complex-template-expression | Complex template expression (133 chars); extract to compu... | 1 |
| `client/src/views/admin/tabs/components/EventInstancesSection.vue` | 276 | complex-template-expression | Complex template expression (105 chars); extract to compu... | 1 |
| `client/src/views/admin/tabs/components/OverlapConstraintsPanel.vue` | 68 | oversized-template | Template is 229 lines; extract sub-components to improve ... | 1 |
| `client/src/views/admin/tabs/components/PropertiesTable.vue` | 49 | oversized-template | Template is 282 lines; extract sub-components to improve ... | 1 |
| `client/src/views/admin/tabs/components/ShapeCreationForm.vue` | 27 | emit-relay | Event relay detected for 'saved'; consider provide/inject... | 1 |
| `client/src/views/admin/tabs/components/ShapeCreationForm.vue` | 28 | emit-relay | Event relay detected for 'cancelled'; consider provide/in... | 1 |
| `client/src/views/admin/tabs/components/UsersTable.vue` | 44 | oversized-template | Template is 209 lines; extract sub-components to improve ... | 1 |

## Notes

- **P1 rules** (weight 2): excessive-prop-count, component-coupling, template-directive-depth — structural issues impacting maintainability.
- **P2 rules** (weight 1): excessive-emit-count, oversized-template, complex-template-expression, unused-named-slot — readability/cleanup signals.
- **Info rules** (weight 0): emit-relay, deep-slot-wrapper, constant-prop-value — informational signals for future optimization.
- Repair waves: Wave 1 (local) = zero cascade risk; Wave 2 (low fan-in) = 1–3 parents to update; Wave 3 (high fan-in) = multi-file coordination needed.
