# Harness alignment (for playbook authors and agents)

**Canonical deep spec:** `.project-manager/HARNESS_CHARTER.md`  
**Tier slash-command behavior:** `.cursor/commands/tiers/START_END_PLAYBOOK_STRUCTURE.md`  
**Agent quick reference:** `.cursor/skills/tier-workflow-agent/SKILL.md`

This note keeps **authoring playbooks** and **governance docs** aligned with the **current** harness implementation (workflow scope, git, Vue root).

---

## Frontend and repo layout

- **Vue app root:** `client/` (historical docs may say `frontend-root/` — that path is obsolete).
- **Audit reports:** `client/.audit-reports/` — not auto-committed by tier-end.

---

## Workflow scope and feature resolution

- **Single resolver:** `resolveWorkflowScope` in `.cursor/commands/utils/workflow-scope.ts` normalizes feature directory, tier, identifier, and optional `.tier-scope` snapshot.
- **`WorkflowCommandContext.contextFromParams`** delegates to `resolveWorkflowScope` only (no git-based feature inference).
- **Phase, session, task** invocations **must** include **`featureId` or `featureName`** (PROJECT_PLAN `#` or `features/` directory slug). Pending state for `/accepted-proceed` and `/accepted-code` must carry the same.
- **Feature-only helpers** (utilities, audits, scripts):
  - **`resolveFeatureDirectoryFromPlan(ref)`** — `#` or slug → canonical feature directory (same rules as feature tier).
  - **`resolveActiveFeatureDirectory()`** — reads `.project-manager/.tier-scope` `feature.id` (written on successful tier-starts); **not** derived from git branch.
- **`FeatureContext`** (`.cursor/commands/utils/feature-context.ts`) is only the path/value object; it does **not** export plan resolution — use `workflow-scope.ts`.

---

## Tier validation

- Phase/session/task validators receive a **`WorkflowCommandContext`** built at tier-start (or via `runTierValidate` + explicit `featureId`/`featureName`). There is no **`WorkflowCommandContext.getCurrent()`**.

---

## Git at tier-end

- **Branches** are created at **tier-start** (`ensureTierBranch`). Tier-end does **not** create missing feature/phase/session branches.
- If the **expected branch name does not exist locally**, tier-end fails with **`expected_branch_missing_run_tier_start`** — user runs the appropriate **tier-start** (and optionally `git fetch`) then re-runs tier-end.
- If the branch exists but **checkout ≠ expected**, failure is **`wrong_branch_before_commit`** — checkout expected branch, re-run tier-end.
- **Commit staging** (`commitUncommittedNonCursor`): stages touched paths under **`client/`**, **`server/`**, and **`.project-manager/`** only (non-transient docs). Does **not** stage: **`.cursor/`** (submodule), **`client/.audit-reports/`**, or **transient** `.project-manager/` harness files (e.g. `.tier-scope`, `.write-log`, `.git-ops-log`).

---

## WorkProfile vs context

- **`WorkProfile`** classifies work (planning packs, decomposition). **`WorkflowCommandContext`** resolves **where** in the repo (feature paths, guides). Do not conflate them. See `.project-manager/WORK_PROFILE_DESIGN.md`.

---

## Related

- **Audit-fix scope injection:** `.project-manager/AUDIT_FIX_CONTEXT.md` (`.tier-scope` + guides).
