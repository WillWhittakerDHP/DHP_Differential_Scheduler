# Session 20.7.3: Close-out backlog mapping


### Task 20.7.3.1: Task 20.7.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.3.2



## Completed Tasks

### Task 20.7.3.2: Task 20.7.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.3.3



### Task 20.7.3.1: Task 20.7.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.3.2

<!-- end excerpt session -->



### Task 20.7.3.2: Task 20.7.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.3.3

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md`, `.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.3.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.3.2-planning.md`

### `git diff --stat HEAD`

```text
...eature-domain-architecture-alignment-handoff.md |  9 ++-
 .../phases/phase-20.7-guide.md                     |  2 +-
 .../phases/phase-20.7-log.md                       | 65 ++++++++--------------
 .../preflight-evidence-20.7.2.md                   | 48 +++++++++++++---
 .../sessions/session-20.7.3-guide.md               |  2 +-
 .../sessions/session-20.7.3-log.md                 | 15 +++++
 6 files changed, 86 insertions(+), 55 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
index 368bf453..17b3d338 100644
--- a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
+++ b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
@@ -5,20 +5,23 @@
 **Tier:** Feature (Tier 0 - Highest Level)
 
 **Last Updated:** 2026-04-04  
-**Feature Status:** In Progress — passes **20.1–20.6** complete; extension phases **20.7–20.13** in flight; **Phase 20.7** / **Session 20.7.1** active (canonical lock + doc protections)  
+**Feature Status:** In Progress — passes **20.1–20.6** complete; **Phase 20.7** preflight + backlog mapping complete (sessions **20.7.1–20.7.3**); **next harness phase: 20.8**  
 **Next Feature:** _(after Feature **20** closeout)_
 
 ---
 
 ## Current Status
 
-**Feature domain-architecture-alignment:** Pass **20.6** (§**8.6**) sessions **20.6.1–20.6.4** delivered; evidence in **`sessions/session-20.6.4-log.md`** and **`DOMAIN_REWRITE_WORKLOG.md`**. Remaining work runs through extension phases **20.7–20.13** per **[`architecture-alignment-closeout-master-plan.md`](./architecture-alignment-closeout-master-plan.md)**. **Phase 20.7** and **Session 20.7.1** are underway.
+**Feature domain-architecture-alignment:** Extension **Phase 20.7** delivered the canonical lock, full **[`preflight-evidence-20.7.2.md`](./preflight-evidence-20.7.2.md)** (§§1–4), and **Preflight follow-ups** in **`phase-20.8`–`phase-20.13`** guides. Remaining work: execution phases **20.8–20.13**, then truth-doc closeout — see **[`architecture-alignment-closeout-master-plan.md`](./architecture-alignment-closeout-master-plan.md)**.
 
 ---
 
 ## Next Action
 
-Continue **Session 20.7.1** — follow **`sessions/session-20.7.1-guide.md`**. Sequencing index: **[`architecture-alignment-closeout-master-plan.md`](./architecture-alignment-closeout-master-plan.md)**. Task **20.7.1.1** (in-repo master plan + link normalization) is complete; after **20.7.1.2** (handoff alignment), run **`/task-start 20.7.1.3`** for the tombstone pass, then **`/session-end`** when session objectives are met. Do **not** run **`/feature-end`** until **20.13** is complete.
+1. Run **`/phase-end 20.7`** (with feature ref **`domain-architecture-alignment`** as required by the harness).  
+2. Run **`/phase-start 20.8`** — **[`phases/phase-20.8-guide.md`](./phases/phase-20.8-guide.md)** (residual schema and API enforcement).  
+
+Do **not** run **`/feature-end`** until **20.13** is complete.
 
 ---
 
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md
index 97523488..8d0c76fa 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md
@@ -99,7 +99,7 @@ Session guides/logs are created at **`/session-start`**. This phase should produ
 - Restate migration execution policy in the active close-out docs.
 - Verify `property_details` remains appointment-scoped input data and is not drifting into time-configuration storage.
 
-- [ ] ### Session 20.7.3: Residual execution backlog (phases 20.8–20.13)
+- [x] ### Session 20.7.3: Residual execution backlog (phases 20.8–20.13)
 **Description:** Turn preflight conclusions from **20.7.2** into actionable rows on the extension ladder: each finding or deferred risk should land in the correct **`phase-20.x-guide.md`** (for **x ≥ 8**) or in **`across-ladder.json`** session notes. Do not restate completed **20.1–20.6** pass work here.
 
 **Tasks:**
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md
index ff763b3d..f09db227 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md
@@ -8,63 +8,44 @@
 
 ## Phase Status
 
-**Phase:** 20.7
-**Status:** Planned
-**Started:** [Date]
-**Completed:** [Date] (if complete)
+**Phase:** 20.7  
+**Status:** Ready for phase-end (all sessions complete on doc surface)  
+**Started:** 2026-04-04  
+**Completed:** _(pending `/phase-end 20.7`)_
 
 ---
 
 ## Completed Sessions
 
-### Session 20.7.2: Preflight evidence package ✅
-**Completed:** 2026-04-04
-**Tasks Completed:** All tasks completed
-**Key Accomplishments:**
-- Completed ** Preflight evidence package
-
+### Session 20.7.3: Residual execution backlog (phases 20.8–20.13) ✅
+**Completed:** 2026-04-04  
+**Tasks Completed:** 20.7.3.1, 20.7.3.2  
+**Key accomplishments:**
+- Cross-walked **[`preflight-evidence-20.7.2.md`](../preflight-evidence-20.7.2.md)** §§1–2 into **`phase-20.8-guide.md`–`phase-20.13-guide.md`** (**Preflight follow-ups** subsections).
+- Finished preflight **§3** (migration execution policy) and **§4** (`property_details` vs time-configuration).
+- Updated feature / session handoffs for **`/phase-start 20.8`**.
 
+### Session 20.7.2: Preflight evidence package ✅
+**Completed:** 2026-04-04  
+**Key accomplishments:** Event-routing watchpoint (**§1**), invariant audit (**§2**).
 
 ### Session 20.7.1: Canonical plan adoption and doc protections ✅
-**Completed:** 2026-04-04
-**Tasks Completed:** All tasks completed
-**Key Accomplishments:**
-- Completed ** Canonical plan adoption and doc protections
-
-
-
-### Session [SESSION_ID]: [SESSION_NAME] ✅
-**Completed:** [Date]
-**Tasks Completed:** [List of task IDs]
-**Key Accomplishments:**
-- [Accomplishment 1]
-- [Accomplishment 2]
-
----
-
-## In Progress Sessions
-
-### Session [SESSION_ID]: [SESSION_NAME] 🔄
-**Started:** [Date]
-**Current Task:** [TASK_ID]
-**Progress:** [X] of [Y] tasks complete
+**Completed:** 2026-04-04  
+**Key accomplishments:** Master plan adoption, doc tombstones / warnings, link normalization.
 
 ---
 
 ## Key Decisions
 
-### Decision [Date]
-**Context:** [What decision was needed]
-**Decision:** [What was decided]
-**Rationale:** [Why this decision was made]
-**Impact:** [How this affects downstream phases]
+### 2026-04-04 — Preflight package surface
+**Context:** Close-out phases **20.8+** need a single evidence file plus guide-level backlog rows.  
+**Decision:** **`preflight-evidence-20.7.2.md`** holds §§1–4; extension phase guides hold execution backlog bullets.  
+**Impact:** Phase **20.8** agents start from **`phase-20.8-guide.md`** + preflight link, not only session logs.
 
 ---
 
 ## Next Steps
 
-- Start **20.7.1**
-- Lock the canonical close-out sequencing surface
-- Prepare the preflight evidence package for **20.7.2**
-- Extract the residual execution backlog in **20.7.3**
-
+1. Run **`/phase-end 20.7`** when ready (feature branch, harness clean).
+2. Run **`/phase-start 20.8`** with feature ref **`domain-architecture-alignment`** — **[`phase-20.8-guide.md`](./phase-20.8-guide.md)** (residual schema and API enforcement).
+3. Continue extension ladder per **[`architecture-alignment-closeout-master-plan.md`](../architecture-alignment-closeout-master-plan.md)** through **20.13** before **`/feature-end`**.
diff --git a/.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md b/.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md
index cfc0eee0..182f8586 100644
--- a/.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md
+++ b/.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md
@@ -9,7 +9,7 @@
 - [architecture-alignment-closeout-master-plan.md](./architecture-alignment-closeout-master-plan.md) — close-out sequencing (phases 20.7–20.13).
 -
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
