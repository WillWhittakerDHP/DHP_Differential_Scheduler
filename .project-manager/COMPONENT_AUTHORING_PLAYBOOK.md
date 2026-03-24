# Component Authoring Playbook

## Purpose and scope

This document governs how Vue components are designed and maintained: prop/emit/slot boundaries, thin script and template surfaces, logic extraction, and decomposition when health thresholds are exceeded. It complements:

- **Harness playbook alignment** (`.project-manager/HARNESS_PLAYBOOK_ALIGNMENT.md`) — app lives under `client/`; tier-end commit/staging rules.
- **Type Authoring Playbook** (`.project-manager/TYPE_AUTHORING_PLAYBOOK.md`) — types at boundaries.
- **Composable Authoring Playbook** (`.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`) — composable shape and where extracted logic lives.
- **Function Authoring Playbook** (`.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`) — complexity and return types in extracted utilities.
- **Cursor rules** (`.cursor/rules/component-governance.mdc`) — boundaries, thresholds, reusability; always-applied.
- **Audit scripts** — `client/.scripts/component-logic-audit.mjs` and `client/.scripts/component-health-audit.mjs` (reports in `client/.audit-reports/`).
- **Architectural patterns** — `.project-manager/ARCHITECTURE.md` §6 (e.g. admin metadata-driven pattern, generic components under `client/src/admin/components/generic/`).

The playbook is the source of truth for rationale and thresholds; cursor rules are condensed references; the audits provide automated enforcement.

---

## Threshold table

Component-health thresholds are defined in the audit script; component-logic uses Tier1 rules for "requiring review."

| Concern | Threshold / Rule | Audit signal |
| ------- | ----------------- | ------------ |
| Prop count | ≤ 8 (or config object) | excessive-prop-count |
| Emit count | ≤ 8 (or grouped) | excessive-emit-count |
| Component coupling | ≤ 5 direct imports | component-coupling |
| Template directive depth | ≤ 3 | template-directive-depth |
| Template size | ≤ 200 lines | oversized-template |
| Complex expression | ≤ 80 chars | complex-template-expression |
| Logic in component | Prefer composable/util | component-logic (Tier1) |
| Thin component | Logic out of SFC | component-logic, component-health |

**Component-health priority:** P0 = file score ≥ 6; P1 = file score ≥ 3; P2 otherwise. Allowlists live in `client/.audit-reports/audit-global-config.json` under `component-health` and `component-logic`.

**Component-logic Tier1 rule ids** (drive "requiring review"): watch, watchEffect, async, await, map, reduce, dom, inlineConfig, console, alert. Tier2 (inventory only): computed, ref, reactive, filter, sort, provideInject, vueQuery.

---

## Decision tree: extract vs keep vs allowlist

1. **Does the component exceed prop/emit/coupling or template thresholds?**
   - If no → keep; ensure logic stays thin and boundaries are explicit.
2. **Is it an orchestrator, layout wrapper, or other allowlisted context (e.g. field type switcher)?**
   - If yes → add or confirm allowlist entry in `audit-global-config.json`; document reason. Otherwise treat as violation.
3. **Can script logic be moved to a composable or named utility?**
   - If yes (Tier1 hotspots: watch, async/await, map/reduce, DOM) → extract to composable or util; re-run component-logic audit.
4. **Can template complexity be reduced by sub-components or computed properties?**
   - If yes (deep v-if/v-for, oversized template, long expressions) → extract sub-component or computed; re-run component-health audit.
5. **Is the component a thin wrapper that intentionally relays props/events?**
   - Prefer provide/inject or composable for deep communication; allowlist emit-relay only where justified (e.g. beta wrappers).

---

## Boundary policy

- **Props as explicit API:** Keep prop count bounded (≤8) or group into a single config/options object. Document required vs optional; use consistent null/undefined semantics (see Type Authoring Playbook).
- **Events as explicit contract:** Emit count bounded (≤8) or group related events; avoid long emit relay chains—prefer provide/inject or composable for deep trees.
- **Slots for layout variation:** Use slots where layout differs by consumer; keep slot depth shallow where possible. Avoid deep slot wrappers without a documented reason (e.g. framework layout constraints).
- **No logic in template beyond simple expressions:** Complex expressions (>80 chars) or nested conditionals belong in computed properties or methods; deep v-if/v-for belongs in sub-components.

---

## Definition of Done for component changes

- `vue-tsc --noEmit` passes with no new errors.
- `npm run lint` passes in the client directory.
- New or changed components stay within prop/emit/coupling and template thresholds (or have a documented allowlist entry).
- Heavy logic is in composables or named utilities; components remain thin.
- No new component-logic Tier1 hotspots in SFC script without extraction or allowlist.
- Template depth and expression complexity within limits (or extracted to sub-component/computed).
- Component-logic and component-health audits do not regress for touched files (or new allowlist entry is justified).

---

## Common mistakes / anti-patterns

| Mistake | Why it fails | Correct approach |
| ------- | ------------- | ----------------- |
| Prop explosion (9+ props) | Hard to use and test; audit violation | Group into config object or extract sub-components |
| Emit relay chains | Brittle; hard to trace; audit signal | Use provide/inject or composable for deep communication |
| Deep v-if/v-for nesting | Hard to read; template-directive-depth violation | Extract sub-components or computed properties |
| Logic in SFC script (watch, async, map/reduce, DOM) | component-logic Tier1 "requiring review" | Extract to composable or named utility |
| Oversized template (>200 lines) | Hard to maintain; audit violation | Extract logical sections into sub-components |
| Complex template expression (>80 chars) | Hard to read; audit violation | Move to computed property or method |
| Allowlisting without justification | Technical debt; drift from thresholds | Document reason in allowlist and in code comment |

---

## Audit rule cross-reference

**Component-health** (ruleId, severity, weight):

| ruleId | Severity | Weight | Playbook concern |
| ------ | -------- | ------ | ---------------- |
| excessive-prop-count | P1 | 2 | Prop count ≤ 8 |
| excessive-emit-count | P2 | 1 | Emit count ≤ 8 |
| component-coupling | P1 | 2 | Coupling ≤ 5 |
| template-directive-depth | P1 | 2 | Directive depth ≤ 3 |
| oversized-template | P2 | 1 | Template ≤ 200 lines |
| complex-template-expression | P2 | 1 | Expression ≤ 80 chars |
| unused-named-slot | P2 | 1 | Remove or document slot |
| emit-relay, deep-slot-wrapper, constant-prop-value | info | 0 | Review; allowlist if justified |

**Component-logic** (Tier1 = requiring review): watch, watchEffect, async, await, map, reduce, dom, inlineConfig, console, alert. Tier2 (inventory): computed, ref, reactive, filter, sort, provideInject, vueQuery.

---

## Baseline score formula (session tier)

The `component-governance` baseline score (0–100) is derived in `.cursor/commands/audit/background-audit-runner.ts` (`computeGovernanceScores`). Formula: start at 100; subtract P0 file count × 3 and P1 file count × 1 (from `component-health-audit.json` `files[]` by `priority`); cap at 0. Same category is stored at session-start and compared at session-end. Component-logic is not included in the numeric score but is enforced by the session-tier audit and checklist.

---

## Cross-references

- **Cursor rules:** `component-governance.mdc` (boundaries, thresholds, reusability).
- **Audit scripts:** `client/.scripts/component-logic-audit.mjs`, `client/.scripts/component-health-audit.mjs` (reports in `client/.audit-reports/`).
- **Config:** `client/.audit-reports/audit-global-config.json` (allowlists.component-health, allowlists.component-logic).
