# Audit Fix Context

When fixing findings from session, phase, or task audits, load the following documents so thresholds, allowlists, and decision trees are applied consistently. This ensures fixes align with governance and do not introduce new violations.

**Read the attached context first.** The agent must read the governance playbooks and tier-appropriate docs (guide + planning doc) before making changes, and reuse existing patterns to avoid duplication and maintain governance.

---

## Tier-appropriate context (injected by /audit-fix when available)

When you run `/audit-fix` (with or without a report path), the command reads `.project-manager/.tier-scope` and injects @ refs for the **current tier's guide and planning doc** (e.g. session 6.10.1 → session guide + session planning doc; task 6.9.1.1 → task planning doc + session guide). This gives the agent the right scope so fixes stay aligned with the current tier and do not duplicate or contradict the plan. The same `.tier-scope` file is read by `readTierScope()` and attached to `WorkflowCommandContext.scope` for tier-start flows (e.g. `/session-start`, `/task-start`), so branch and slug resolution use the current scope when present.

---

## Required for all audit fixes

| Path | Rationale |
|------|-----------|
| `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md` | Component thresholds, prop/emit/coupling, extract vs allowlist |
| `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md` | Composable shape, return types, InjectionKey, mutation policy |
| `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md` | Nesting, branches, return types, no silent catch |
| `.project-manager/TYPE_AUTHORING_PLAYBOOK.md` | Type boundaries, null/undefined, inventory |
| `client/.audit-reports/audit-global-config.json` | Allowlists and exclusions (component-health, component-logic, function-complexity, etc.) |

**Optional but useful (Cursor rules):**

| Path | Rationale |
|------|-----------|
| `.cursor/rules/component-governance.mdc` | Condensed component boundaries and thresholds |
| `.cursor/rules/composable-governance.mdc` | Condensed composable contract and mutation policy |
| `.cursor/rules/function-governance.mdc` | Condensed function thresholds and return types |
| `.cursor/rules/type-governance.mdc` | Condensed type boundaries and placement |
| `.cursor/rules/coding-standards.mdc` | Mutability, return types, error handling |

---

## Required by audit type (additional reports)

When fixing a specific audit category, attach the corresponding report so the agent sees exact findings and ruleIds:

| Audit name | Additional report path |
|------------|-------------------------|
| component-health | `client/.audit-reports/component-health-audit.md` |
| component-logic | `client/.audit-reports/component-logic-audit.md` (or summary) |
| composable-health | `client/.audit-reports/composable-health-audit.md` |
| composables-logic | `client/.audit-reports/composables-logic-audit.md` (or summary) |
| function-complexity | `client/.audit-reports/function-complexity-audit.md` |
| type-escape | `client/.audit-reports/type-escape-audit.md` |
| type-constant-inventory | `client/.audit-reports/type-constant-inventory-audit.md` |
| data-flow-health | `client/.audit-reports/data-flow-health-audit.md` |

---

## Copy-paste block (for /audit-fix command or manual use)

Paste the line below into chat (after the audit report path if you have one) so Cursor attaches all required governance context. Add the audit report path as an extra @ ref when fixing a specific report.

```
@.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md @.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md @.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md @.project-manager/TYPE_AUTHORING_PLAYBOOK.md @client/.audit-reports/audit-global-config.json
```

**With audit report:** Append the report path, e.g.  
`@.cursor/project-manager/features/<feature>/audits/session-6.7.2-audit.md`  
(or the path shown in the tier-end message).

**Usage:** Run `/audit-fix [report-path]` to generate a full prompt (instruction + governance @ refs + tier-appropriate context + report). Paste the output into chat. The instruction tells the agent to read the attached context first and maintain governance patterns.
