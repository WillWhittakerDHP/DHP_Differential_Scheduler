# Audit Fix Context

When fixing findings from session, phase, or task audits, load the following documents so thresholds, allowlists, and decision trees are applied consistently. This ensures fixes align with governance and do not introduce new violations.

**Read the attached context first.** The agent must read the governance playbooks and tier-appropriate docs (guide + planning doc) before making changes, and reuse existing patterns to avoid duplication and maintain governance.

---

## Harness alignment (audit-fix + tier-end)

**Single assembly (no split brain):** `getAuditFixContext` and `auditFixPrompt` in `.cursor/commands/audit/atomic/audit-fix-prompt.ts` share one internal pipeline. Both return the same **`instruction`** (with full embedded markdown) and the same deduped **`paths`** list; the paste variant only adds an `@` refs line for Cursor attachments.

**Intent and domains:** Audit remediation uses `classifyWorkProfile({ tier, action: 'end', reasonCode: 'audit_fix' })`. Playbook and architecture excerpt resolution use **`domainsForAuditFix`** = classifier `governanceDomains` ∪ **`architecture`** so `ARCHITECTURE.md` stays consistent with tier-start excerpt behavior and appears in the path list when relevant.

**Rich instruction (not meta-hints):** `instruction` embeds real markdown from **`buildGovernanceContext`** and **`readArchitectureExcerptForPlanning`** under harness-injected headings (`## Architecture context`, `## Governance context`). Agents should treat the instruction body as authoritative summary; **`paths`** still lists playbooks, tier docs, report, and `audit-global-config.json` for full-file reads.

**Path union:** Final `paths` are the deduped union of:

- Playbooks from `getPlaybooksForGovernanceDomains(domainsForAuditFix)`
- When `reportPath` is set: playbooks from `getPlaybooksForAudit(reportPathToAuditName(reportPath))` (report-tuned refs)
- When `featureName`, `tier`, and `identifier` are set: tier guide + planning paths (same shape as before)
- The audit report path (when provided)
- `client/.audit-reports/audit-global-config.json`

**Task file scope:** Optional `taskFiles` on the API; when omitted for `tier === 'task'` with feature + task id, paths are parsed from **## Deliverables** in the task planning doc via `parseDeliverablesFromPlanningDoc`, then passed into `buildGovernanceContext({ tier: 'task', taskFiles })`.

**Tier-end `audit_failed`:** Deliverables append the existing regex-based "Required reading before fixes" block **plus** the same harness-injected architecture and governance markdown (via `buildAuditFixContextEnvelope` and `resolveTaskFilesForAuditFix` in `tier-end-steps.ts`).

---

## Tier-appropriate context (injected by /audit-fix when available)

When you run `/audit-fix` with **explicit** `featureName`, `tier`, and `identifier` (from failure context or `.tier-scope`), the command adds @ refs for the **current tier's guide and planning doc** (e.g. session 6.10.1 → session guide + session planning; task 6.9.1.1 → task planning doc + session guide). The same `.tier-scope` file is read by `readTierScope()` and attached to `WorkflowCommandContext.scope` for tier-start flows (e.g. `/session-start`, `/task-start`), so branch and slug resolution use the current scope when present. **Harness summary:** `.project-manager/HARNESS_PLAYBOOK_ALIGNMENT.md` (Vue root `client/`, scope APIs, tier-end git policy).

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

**Tier- and report-pertinent refs:** When you run `/audit-fix` with a report path, the merged path list includes report-specific playbooks from `tier-context-config.ts` **in addition to** domain playbooks from the classifier. When paths would otherwise be empty or for feature tier without a report, the harness merges the fallback line from this doc (first code block below). The copy-paste block remains the full list for manual use.

Paste the line below into chat (after the audit report path if you have one) so Cursor attaches baseline governance context. Add the audit report path as an extra @ ref when fixing a specific report.

```
@.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md @.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md @.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md @.project-manager/TYPE_AUTHORING_PLAYBOOK.md @client/.audit-reports/audit-global-config.json
```

**With audit report:** Append the report path, e.g.  
`@.cursor/project-manager/features/<feature>/audits/session-6.7.2-audit.md`  
(or the path shown in the tier-end message).

**Usage:** Run `/audit-fix [report-path]` or `auditFixPrompt(...)` to generate a full prompt (instruction with embedded harness context + governance @ refs + tier-appropriate paths + report). For agents, prefer `getAuditFixContext(...)`—same content, structured. See `.cursor/commands/audit-fix.md`.
