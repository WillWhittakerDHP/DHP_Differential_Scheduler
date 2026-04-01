# Session 6.17.4: Wire generic delete entry points (list + entity card)


### Task 6.17.4.1: Task 6.17.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.4.2



## Completed Tasks

### Task 6.17.4.1: Task 6.17.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.4.2



### Task 6.17.4.1: Task 6.17.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.4.2

<!-- end excerpt session -->



### Task 6.17.4.1: Task 6.17.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.4.2

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (6): `.project-manager/WORKFLOW_FRICTION_LOG.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md`, `client/src/composables/admin/useAdminEntityDeleteWizard.ts`, `client/src/utils/admin/entityList.ts`, `client/tsconfig.tsbuildinfo`

### `git diff --stat HEAD`

```text
.project-manager/WORKFLOW_FRICTION_LOG.md          | 74 ++++++++++++++++++++++
 .../sessions/session-6.17.4-guide.md               |  2 +-
 .../sessions/session-6.17.4-log.md                 | 15 +++++
 .../admin/useAdminEntityDeleteWizard.ts            | 46 ++++++++------
 client/src/utils/admin/entityList.ts               |  3 +-
 client/tsconfig.tsbuildinfo                        |  2 +-
 6 files changed, 118 insertions(+), 24 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/WORKFLOW_FRICTION_LOG.md b/.project-manager/WORKFLOW_FRICTION_LOG.md
index 934a6d78..1706e1a1 100644
--- a/.project-manager/WORKFLOW_FRICTION_LOG.md
+++ b/.project-manager/WORKFLOW_FRICTION_LOG.md
@@ -1617,3 +1617,77 @@ If you are not already using this model, consider switching before proceeding.
 *Express profile: minimal gates, prioritize speed*
 If you are not already using this model, consider switching before proceeding.
 ---
+
+### 2026-04-01 — 6.17.4.1 — task — end — audit_failed
+
+- **reasonCodeRaw:** audit_failed
+- **reasonCodeNormalized:** audit_failed
+- **isFailureReason:** true
+- **tier:** task
+- **action:** end
+- **identifier:** 6.17.4.1
+- **featureName:** appointment-workflow
+- **stepPath:** conflict_marker_guard, plan_mode_exit, resolve_run_tests, pre_work, test_goal_validation, run_tests, mid_work, comment_cleanup, readme_cleanup, deliverables_check, gap_analysis, planning_rollup, doc_rollup, commit_remaining, git, propagate_shared, verification_check, config_fix, end_audit
+
+- **Symptom:** Harness end failed (reasonCode=audit_failed).
+- **Context:** tier=task; identifier=6.17.4.1; featureName=appointment-workflow
+
+nextAction:
+Fix audit warnings or errors per governance, then re-run this tier-end. Read the governance docs listed in deliverables FIRST.
+
+deliverables (excerpt):
+# Task Audit: 6.17.4.1
+
+**Overall Status:** FAIL
+**Report:** .cursor/project-manager/features/appointment-workflow/audits/task-6.17.4.1-audit.md
+
+*Note: Task audits run tier-task group (typecheck, loop-mutations, hardcoding, error-handling, naming-convention, security) with --changed-only.*
+
+## External Signals (captured)
+
+- **Location:** `.cursor/project-manager/features/appointment-workflow/audits/external/task-6.17.4.1/2026-04-01T22-49-02Z`
+- **Copied:** 6 file(s)
+- **Missing:** 3 file(s) (signals not present yet)
+
+## Results Summary
+
+- ❌ **tier-quality**: fail (70/100)
+
+## Autofix
+
+Tier task: 0 script fix(es) applied, 2 agent directive(s). Affected files: 1.
+
+**Agent directives:**
+- Fix type errors reported in /Users/districthomepro/Bonsai/Differential_Scheduler/client/.audit-reports/typecheck/typecheck-audit.json. Address P0 pools first.
+- Fix type errors reported in /Users/districthomepro/Bonsai/Differential_Scheduler/client/.audit-reports/typecheck/typecheck-audit.json. Address P0 pools first.
+
+---
+
+## 📋 Review Request
+
+**Please review the audit report with me:**
+
+📄 **Report File:** `/Users/districthomepro/Bonsai/Differential_Scheduler/.cursor/project-manager/features/appointment-workflow/audits/task-6.17.4.1-audit.md`
+
+**Questions to consider:**
+- Are the audit findings accurate?
+- Are there false positives or missing issues?
+- How can we improve the audit checks?
+- What workflow refinements do the audits suggest?
+
+*The audit report file should be open in your editor. Let's review it together to refine the workflow command tool.*
+
+---
+
+## Architecture context (harness-injected)
+
+## 1. System overview
+
+Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:
+
+- **Public booking users** — wizard-style scheduling and property/availability flows.
+- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.
+
+TanStack **Vue Query*
+
+…(truncated)
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md
index 363d7063..b337bab6 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [x] #### Task 6.17.4.1: [Task Name]
+- [x] - [x] #### Task 6.17.4.1: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md
index 52ceafa2..fa13db13 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md
@@ -11,6 +11,14 @@
 