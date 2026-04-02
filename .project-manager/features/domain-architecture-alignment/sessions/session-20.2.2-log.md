# Session 20.2.2: ** **Event shape & event instance** entity routes — placement-only surface for shapes; require/validate **`parent_block_instance_id`** for instances; segment field validation per Principles §5.4; ensure serializers omit legacy differential-role.


### Task 20.2.2.1: Task 20.2.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.2.2



## Completed Tasks

### Task 20.2.2.1: Task 20.2.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.2.2



### Task 20.2.2.1: Task 20.2.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.2.2

<!-- end excerpt session -->



### Task 20.2.2.1: Task 20.2.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.2.2

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (4): `.project-manager/WORKFLOW_FRICTION_LOG.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.2-log.md`, `server/src/routes/internal/entities/entityBatchRouter.ts`

### `git diff --stat HEAD`

```text
.project-manager/WORKFLOW_FRICTION_LOG.md          | 73 ++++++++++++++++++++++
 .../sessions/session-20.2.2-guide.md               |  2 +-
 .../sessions/session-20.2.2-log.md                 | 15 +++++
 .../routes/internal/entities/entityBatchRouter.ts  |  2 +-
 4 files changed, 90 insertions(+), 2 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/WORKFLOW_FRICTION_LOG.md b/.project-manager/WORKFLOW_FRICTION_LOG.md
index 9bb451b9..fd77f391 100644
--- a/.project-manager/WORKFLOW_FRICTION_LOG.md
+++ b/.project-manager/WORKFLOW_FRICTION_LOG.md
@@ -2573,3 +2573,76 @@ TanStack **Vue Query** manages server-state caching. Composables typica
 
 nextAction:
 Fix the error above (planning doc, paths, write guard), then re-run tier-start in execute mode.
+
+### 2026-04-02 — 20.2.2.1 — task — end — audit_failed
+
+- **reasonCodeRaw:** audit_failed
+- **reasonCodeNormalized:** audit_failed
+- **isFailureReason:** true
+- **tier:** task
+- **action:** end
+- **identifier:** 20.2.2.1
+- **featureName:** domain-architecture-alignment
+- **stepPath:** conflict_marker_guard, plan_mode_exit, resolve_run_tests, pre_work, test_goal_validation, run_tests, mid_work, comment_cleanup, readme_cleanup, deliverables_check, gap_analysis, planning_rollup, doc_rollup, commit_remaining, git, propagate_shared, verification_check, config_fix, end_audit
+
+- **Symptom:** Harness end failed (reasonCode=audit_failed).
+- **Context:** tier=task; identifier=20.2.2.1; featureName=domain-architecture-alignment
+
+nextAction:
+Fix audit warnings or errors per governance, then re-run this tier-end. Read the governance docs listed in deliverables FIRST.
+
+deliverables (excerpt):
+# Task Audit: 20.2.2.1
+
+**Overall Status:** WARN
+**Report:** .cursor/project-manager/features/domain-architecture-alignment/audits/task-20.2.2.1-audit.md
+
+*Note: Task audits run tier-task group (typecheck, loop-mutations, hardcoding, error-handling, naming-convention, security) with --changed-only.*
+
+## External Signals (captured)
+
+- **Location:** `.cursor/project-manager/features/domain-architecture-alignment/audits/external/task-20.2.2.1/2026-04-02T17-40-37Z`
+- **Copied:** 7 file(s)
+- **Missing:** 2 file(s) (signals not present yet)
+
+## Results Summary
+
+- ⚠️ **tier-quality**: warn (90/100)
+
+## Autofix
+
+Tier task: 0 script fix(es) applied, 1 agent directive(s). Affected files: 1.
+
+**Agent directives:**
+- Fix type errors reported in /Users/districthomepro/Bonsai/Differential_Scheduler/client/.audit-reports/typecheck/typecheck-audit.json. Address P0 pools first.
+
+---
+
+## 📋 Review Request
+
+**Please review the audit report with me:**
+
+📄 **Report File:** `/Users/districthomepro/Bonsai/Differential_Scheduler/.cursor/project-manager/features/domain-architecture-alignment/audits/task-20.2.2.1-audit.md`
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
+TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often b
+
+…(truncated)
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.2-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.2-guide.md
index bf198001..cb072319 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.2-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.2-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [x] #### Task 20.2.2.1: Event shape — placement invariants & no differential-role leakage
+- [x] - [x] #### Task 20.2.2.1: Event shape — placement invariants & no differential-role leakage
 **Goal:** Enforce **`placementKind`** + **`anchorEdge`** rules on writes; reject **`differentialRole`** on body; ensure **`eventShape`** JSON responses omit legacy differential-role.
 **Files:**
 - `server/src/routes/internal/entities/eventShapeEntityValidation.ts` (new, or combined module)
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.2-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.2-log.md
index a5a6ed39..82454a17 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.2-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.2-log.md
@@ -11,6 +11,14 @@
 