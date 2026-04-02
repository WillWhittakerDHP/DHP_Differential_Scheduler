# Session 20.2.3: ** **Relationships + preview** — `eventAssignments`, `event_instance_attendees` / attendee relationship registry, `validEventCascades`; re-scope **`event-instance-preview`** to segments under a parent event block instance (or equivalent simplification per §5.1).


### Task 20.2.3.1: Task 20.2.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.3.2



## Completed Tasks

### Task 20.2.3.2: Task 20.2.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.3.3



### Task 20.2.3.1: Task 20.2.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.3.2

<!-- end excerpt session -->



### Task 20.2.3.2: Task 20.2.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.3.3

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (11): `.project-manager/WORKFLOW_FRICTION_LOG.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-log.md`, `client/src/composables/admin/useEventTemplatePreview.ts`, `client/src/types/admin/instancesTabEventInstance.ts`, `client/src/views/admin/tabs/components/EventInstanceEditor.vue`, `server/src/routes/internal/event-instance-preview/eventInstancePreviewRouter.ts`, `server/src/routes/schemas/eventInstancePreviewBodySchema.ts`, `server/src/services/invites/eventInstancePreviewService.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.2.3.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.2.3.2-planning.md`

### `git diff --stat HEAD`

```text
.project-manager/WORKFLOW_FRICTION_LOG.md          | 29 ++++++++++++++++------
 .../sessions/session-20.2.3-guide.md               |  2 +-
 .../sessions/session-20.2.3-log.md                 | 15 +++++++++++
 .../composables/admin/useEventTemplatePreview.ts   | 11 +++++++-
 .../src/types/admin/instancesTabEventInstance.ts   |  2 ++
 .../admin/tabs/components/EventInstanceEditor.vue  |  1 +
 .../eventInstancePreviewRouter.ts                  |  4 +--
 .../schemas/eventInstancePreviewBodySchema.ts      |  2 +-
 .../invites/eventInstancePreviewService.ts         | 13 +++++-----
 9 files changed, 60 insertions(+), 19 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/WORKFLOW_FRICTION_LOG.md b/.project-manager/WORKFLOW_FRICTION_LOG.md
index fd77f391..e59824d9 100644
--- a/.project-manager/WORKFLOW_FRICTION_LOG.md
+++ b/.project-manager/WORKFLOW_FRICTION_LOG.md
@@ -2634,15 +2634,30 @@ Tier task: 0 script fix(es) applied, 1 agent directive(s). Affected files: 1.
 
 ---
 
-## Architecture context (harness-injected)
+### 2026-04-02 — 20.2.3.1 — task-end — Git / harness commit noise vs successful tier-end (agent diagnosis)
 
-## 1. System overview
+- **reasonCodeRaw:** HARNESS_WORKFLOW_FRICTION (manual / material confusion)
+- **reasonCodeNormalized:** process_note
+- **isFailureReason:** false
+- **tier:** task
+- **action:** end
+- **identifier:** 20.2.3.1
+- **featureName:** domain-architecture-alignment
+- **stepPath:** commit_remaining, git, agent_chat_summary
 
-Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:
+- **Symptom:** During **`/task-end 20.2.3.1`** the harness stderr/trace showed alarming lines such as **`[gitCommit] Command failed: git commit`**, **`[commitUncommitted-diff] Command failed: git diff --cached --quiet`**, and **`compareBranchToRemote-behind` merge-base failures**, while the JSON result still reported **`success: true`** and **`reasonCode: task_complete`**. In chat, the agent summarized **`git status`** as branch **`feature/domain-architecture-alignment` ahead of **`origin`**, **`m .cursor`**, and **`?? client/tsconfig.tsbuildinfo`**, which can look like a dirty or failed workflow if read without the repo's harness policies.
 
-- **Public booking users** — wizard-style scheduling and property/availability flows.
-- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.
+- **Context (historical / diagnosis):**
+  1. **Tier-end commit is multi-step.** `commit_remaining` may stage a subset of paths (`client/`, `server/`, `.project-manager/` per policy), run **`git diff --cached --quiet`** (exits **1** when there *is* something to commit — not an application error), then **`git commit`**. A logged **`Command failed`** for **`git diff --cached --quiet`** often means "non-empty index" or an intermediate check, not "commit aborted." The authoritative signal is whether a new commit appears on **`git log -1`** (e.g. **`[task 20.2.3.1] completion`**) and whether **`success: true`** on the harness result.
+  2. **`.cursor` submodule (`m .cursor`).** Process rules state **`tier-end` does not auto-commit** the **`.cursor/`** submodule; **`git status`** showing **` m .cursor`** is **expected by policy**, not proof the harness failed. Treat it as one-line context when reporting status to the user.
+  3. **`client/tsconfig.tsbuildinfo`.** TypeScript incremental build artifacts may be **untracked** or **deleted/recreated** across runs. The task-end preview for **20.2.3.1** included deleting a tracked **`tsbuildinfo`** in one snapshot while the working tree later showed **`?? client/tsconfig.tsbuildinfo`** — typical churn unless the file is **gitignored** or consistently ignored in commits. Agents should not treat this alone as "task-end broke the tree."
+  4. **`compareBranchToRemote-behind` / `merge-base --is-ancestor` failures** in trace output often reflect **local vs fetched `origin`** tip comparisons (e.g. remote moved, or first fetch incomplete); combined with **ahead N** on the feature branch, the actionable read is: **push when ready** to refresh PRs, not "re-run task-end because merge-base errored."
+  5. **Duplicate "success vs failed line" pattern** appeared earlier on **20.2.2.2** task-end (`git commit` line failed in trace but commit existed). Same class: **trust commit SHA + `success: true`**, use **`git log`/`git status`** to disambiguate.
 
-TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often b
+- **What we tried:** Re-ran **`git status -sb`** and **`git log -1`** after harness output; confirmed **`[task 20.2.3.1] completion`** present and branch **ahead of origin**.
 
-…(truncated)
+- **Outcome / workaround:** Document for agents: when summarizing tier-end, lead with **harness `success` + `reasonCode` + latest commit message**; mention **`.cursor` / tsbuildinfo** as **policy/noise** in one line; route **real** git failures to **`.project-manager/.git-friction-log.jsonl`** and **`/harness-repair`** per playbook.
+
+- **Suggestion:** (Optional) In tier-end step logging, distinguish **"expected non-zero"** git exits (e.g. `diff --cached --quiet` when index non-empty) from **hard commit failures** so traces are less scary; or append a one-line harness footer: "If `success: true`, ignore `git diff --cached --quiet` exit 1 unless no commit was created."
+
+- **Cross-reference:** `.cursor/rules/process-workflow.mdc` (git status / dirty tree reporting); `.project-manager/HARNESS_CHARTER.md` §4 (tier-end commit behavior).
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-guide.md
index 36b2c9fc..c40dab4e 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-guide.md
@@ -59,7 +59,7 @@ These sections contain session-specific content:
 **Approach:** [Approach to take]
 **Checkpoint:** [What needs to be verified]
 
-- [ ] #### Task 20.2.3.2: [Task Name]
+- [x] #### Task 20.2.3.2: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-log.md
index dc66ed07..68b3a6e0 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-log.md
@@ -11,6 +11,14 @@
 