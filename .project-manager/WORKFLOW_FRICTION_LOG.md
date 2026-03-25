# Workflow friction log (harness / planning / verification)

**Purpose:** Append-only log for **material** friction with the tier harness, planning templates, gates, audits, or playbook/skill mismatches — **not** routine git issues (use `.project-manager/.git-friction-log.jsonl` for git).

**When to append:** Repeated confusion, blocked tier flow after following docs, misleading control-plane text, audit false positives worth tuning — **not** one-off typos.

**How to append:** Add a new section at the **bottom** using the template below. Prefer concrete paths, `reasonCode`s, and slash commands. Commit useful entries with other `.project-manager/` docs.

## Entry template

```markdown
### YYYY-MM-DD — [feature/phase/session/task id] — [slash command or step] — Short title

- **Symptom:** What went wrong or was unclear
- **Context:** Tier, `reasonCode` if any, relevant paths (planning doc, guide, pending file)
- **What we tried:**
- **Outcome / workaround:**
- **Suggestion:** Harness, playbook, SKILL, or doc change (optional PR note)
```

## Relationship to git friction

| Log | Owner | Typical triggers |
|-----|--------|------------------|
| `.git-friction-log.jsonl` | Harness + agents | Checkout blocked, wrong branch, merge/stash, staging surprises |
| `WORKFLOW_FRICTION_LOG.md` | Agents | Gates, parsers, audits, ARCHITECTURE.md drift, doc contradictions |

---

*(No entries yet.)*

### 2026-03-25 — 7.4.4 — session — end — audit_failed

- **reasonCodeRaw:** audit_failed
- **reasonCodeNormalized:** audit_failed
- **isFailureReason:** true
- **tier:** session
- **action:** end
- **identifier:** 7.4.4
- **featureName:** authentication
- **stepPath:** conflict_marker_guard, plan_mode_exit, resolve_run_tests, pre_work, test_goal_validation, run_tests, mid_work, comment_cleanup, readme_cleanup, deliverables_check, gap_analysis, planning_rollup, doc_rollup, commit_remaining, git, propagate_shared, verification_check, config_fix, end_audit

- **Symptom:** Harness end failed (reasonCode=audit_failed).
- **Context:** tier=session; identifier=7.4.4; featureName=authentication

nextAction:
Fix audit warnings or errors per governance, then re-run this tier-end. Read the governance docs listed in deliverables FIRST.

deliverables (excerpt):
# Session Audit: 7.4.4

**Overall Status:** WARN
**Report:** .cursor/project-manager/features/authentication/audits/session-7.4.4-audit.md

## External Signals (captured)

- **Location:** `.cursor/project-manager/features/authentication/audits/external/session-7.4.4/2026-03-25T19-37-00Z`
- **Copied:** 6 file(s)
- **Missing:** 3 file(s) (signals not present yet)

## Score Comparison

- ➡️ **type-constant-inventory**: 0 → 0 (+0)
- ➡️ **composable-governance**: 98 → 98 (+0)
- ✅ **function-governance**: 96 → 100 (+4)
- ➡️ **component-governance**: 100 → 100 (+0)

## Results Summary

- ✅ **tier-quality**: pass (98/100)
- ✅ **docs**: pass (100/100)
- ⚠️ **vue-architecture**: warn (90/100)

## Autofix

Tier session: 0 script fix(es) applied, 0 agent directive(s).

---

## 📋 Review Request

**Please review the audit report with me:**

📄 **Report File:** `/Users/districthomepro/Bonsai/Differential_Scheduler/.cursor/project-manager/features/authentication/audits/session-7.4.4-audit.md`

**Questions to consider:**
- Are the audit findings accurate?
- Are there false positives or missing issues?
- How can we improve the audit checks?
- What workflow refinements do the audits suggest?

*The audit report file should be open in your editor. Let's review it together to refine the workflow command tool.*
---

## Required reading before fixes

Read these governance docs to ensure fixes comply with project patterns:

- **Type governance**: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md` (rules: `.cursor/rules/type-governance.mdc`)
- **Coding standards**: `.cursor/rules/coding-standards.mdc`

Read each linked file before making changes. Extract, don't inline. Follow thresholds exactly.

---

## Architecture context (harness-injected)

## 1. System overview

Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:

- **Public booking users** — wizard-style scheduling and property/availability flows.
-

…(truncated)
