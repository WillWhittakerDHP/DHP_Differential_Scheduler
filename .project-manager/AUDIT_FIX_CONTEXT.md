# Audit Fix Context

When fixing findings from session, phase, or task audits, load the following documents so thresholds, allowlists, and decision trees are applied consistently. This ensures fixes align with governance and do not introduce new violations.

**Read the attached context first.** The agent must read the governance playbooks and tier-appropriate docs (guide + planning doc) before making changes, and reuse existing patterns to avoid duplication and maintain governance.

---

## Governance remediation ladder (causes before symptoms)

Use this order for **discretionary** governance cleanups (no failing gate). When **tier-end, CI, or release checks fail** on an audit, treat that audit as **blocking**: fix or allowlist per the relevant playbook immediately—you are not expected to “finish the ladder” first.

**Principle:** Several audits measure **graph shape, import fan-out, and local complexity** that often **moves or disappears** after structural work (types, boundaries, module surfaces). Chasing those reports file-by-file *before* cohesion and module boundaries tends to churn without lasting improvement.

**Dependency freshness** (`cd client && npm run audit:dep-freshness`) is **orthogonal** to steps 3–7: it reflects **npm semver drift** on `client/` and `server/`, not module shape inside the repo. Run it on a **cadence** (e.g. alongside feature-tier audits), before large releases, or when addressing **security** / `npm audit` findings—**not** as a substitute for structural cleanup. Prefer **patch/minor** bumps in focused PRs; **major** upgrades need changelog review, typecheck, and smoke of affected surfaces.

| Step | Focus | Typical artifacts / playbooks |
|------|--------|-----------------------------|
| 1–2 | **Ship blockers & architecture alignment** | Lint/type errors; `.project-manager/ARCHITECTURE.md`; data-flow alignment; **dependency freshness** (`audit:dep-freshness`) and **security** (`audit:security` / `npm audit` where applicable) as supply-chain hygiene—not driven by import-graph or composable audits |
| 3 | **Type boundaries** | `TYPE_AUTHORING_PLAYBOOK.md`; type-escape / type-constant-inventory when tuning types |
| 4 | **Composable contract shape** | `COMPOSABLE_AUTHORING_PLAYBOOK.md` — explicit return types, flat public surface, `InjectionKey`, action-based mutation |
| 5 | **Component boundaries** | `COMPONENT_AUTHORING_PLAYBOOK.md` — thin SFCs, props/emits/slots, extract vs allowlist |
| **6** | **Module boundaries (structure)** | **File cohesion** (split oversized or multi-concern files); **dual-role export** (split public vs internal surfaces, thin barrels); clear **public API** per folder. This class of work most often **reduces import-graph depth/fan-out** and **composable-health** noise (e.g. excessive composable imports) as a **consequence**, without tuning those audits first. |
| **7** | **Symptom audits last** | Treat as **outcomes** to re-run after step 6: **import-graph** (hotspots), **composables-logic**, **function-complexity**, **component-logic** (and related **composable-health** / **component-health** scores). What remains is more likely **real localized complexity** worth extracting or allowlisting deliberately. |

**`/audit-fix`:** When the failure report is a step-7 audit, still fix what the report lists if the gate is blocking. On **optional** cleanups, prefer checking whether **step 6** (or 4–5) would collapse many findings before deep file-by-file tuning.

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
| component-logic | `client/.audit-reports/component-logic-audit.md` (or summary) — *symptom-style; see **Governance remediation ladder** § step 7* |
| composable-health | `client/.audit-reports/composable-health-audit.md` |
| composables-logic | `client/.audit-reports/composables-logic-audit.md` (or summary) — *symptom-style; see § step 7* |
| function-complexity | `client/.audit-reports/function-complexity-audit.md` — *symptom-style; see § step 7* |
| import-graph | `client/.audit-reports/import-graph-audit.json` (or `cd client && npm run audit:import-graph`) — *symptom-style; see § step 7* |
| file-cohesion | `cd client && npm run audit:file-cohesion` — *structural; aligns with § step 6* |
| dual-role-export | `cd client && npm run audit:dual-role-export` — *structural; aligns with § step 6* |
| dep-freshness | `cd client && npm run audit:dep-freshness` → `client/.audit-reports/dep-freshness-audit.{json,md}` — *supply-chain / semver hygiene; orthogonal to § steps 3–7; see ladder intro* |
| security | `cd client && npm run audit:security` (and server-side checks per script) — *vulnerabilities; not the same as freshness* |
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
