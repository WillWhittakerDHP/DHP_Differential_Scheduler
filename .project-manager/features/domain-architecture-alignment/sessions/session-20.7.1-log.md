# Session 20.7.1: Canonical plan adoption and doc protections


### Task 20.7.1.1: Task 20.7.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.1.2



## Completed Tasks

### Task 20.7.1.1: Task 20.7.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.1.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (13): `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.10-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.7-handoff.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.7-planning.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.8-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.9-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-log.md`, `.project-manager/features/domain-architecture-alignment/architecture-alignment-closeout-master-plan.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.1.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.1.1-planning.md`

### `git diff --stat HEAD`

```text
.../domain-architecture-alignment/across-ladder.json   |  2 +-
 .../feature-domain-architecture-alignment-guide.md     |  4 ++--
 .../phases/phase-20.10-guide.md                        |  2 +-
 .../phases/phase-20.7-guide.md                         |  2 +-
 .../phases/phase-20.7-handoff.md                       |  2 +-
 .../phases/phase-20.7-planning.md                      |  4 ++--
 .../phases/phase-20.8-guide.md                         |  2 +-
 .../phases/phase-20.9-guide.md                         |  2 +-
 .../sessions/session-20.7.1-guide.md                   |  2 +-
 .../sessions/session-20.7.1-log.md                     | 18 ++++++++++++++++++
 10 files changed, 29 insertions(+), 11 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index fa448e59..386c2265 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-04T00:31:19.164Z",
+  "derivedAt": "2026-04-04T00:38:29.760Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md
index fe802790..882bbea3 100644
--- a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md
@@ -15,9 +15,9 @@
 
 - [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
 - [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).
-- [/.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md](../../../.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md) — locked canonical sequencing plan for the post-20.6 close-out extension.
+- [architecture-alignment-closeout-master-plan.md](./architecture-alignment-closeout-master-plan.md) — in-repo close-out sequencing index (phases **20.7–20.13**); canonical harness path for extension order.
 
-**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or the implementation plan.
+**Conflict rule:** If this guide disagrees with **ARCHITECTURE_PRINCIPLES** or **FEATURE_20_ARCHITECTURE_REDESIGN**, **the analysis documents win**. For **extension sequencing** (**20.7–20.13**), the **close-out master plan index** and phase guides win over informal forks; update this guide rather than duplicating a second ladder.
 
 ---
 
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.10-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.10-guide.md
index 490878f7..95997b0e 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.10-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.10-guide.md
@@ -10,7 +10,7 @@
 
 - `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`
 - `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`
-- `/.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md`
+- [architecture-alignment-closeout-master-plan.md](../architecture-alignment-closeout-master-plan.md) — in-repo close-out sequencing index (phases **20.7–20.13**).
 
 ---
 
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md
index f8c50332..259c3666 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md
@@ -10,7 +10,7 @@
 
 - [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
 - [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — original Feature 20 implementation plan and pass inventory.
-- [/.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md](../../../../.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md) — locked canonical sequencing plan for the post-20.6 close-out extension.
+- [architecture-alignment-closeout-master-plan.md](../architecture-alignment-closeout-master-plan.md) — in-repo close-out sequencing index (phases **20.7–20.13**).
 
 **Conflict rule:** If this guide disagrees with the locked architecture docs, the analysis docs win. If sequencing conflicts remain after that, the locked master plan wins over older feature-planning surfaces.
 
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-handoff.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-handoff.md
index 1b5dd138..4e4a50c4 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-handoff.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-handoff.md
@@ -20,7 +20,7 @@
 Phase **20.7** is the post-20.6 preflight phase that locks the master close-out plan as the active sequencing surface, creates the preflight safeguards/evidence package, and extracts the residual execution backlog for later phases.
 
 **What you need to start Phase 20.7:**
-- Read `/.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md`
+- Read [`architecture-alignment-closeout-master-plan.md`](../architecture-alignment-closeout-master-plan.md)
 - Read `phases/phase-20.7-guide.md`
 - Start with canonical-lock and contradictory-doc protection work before the preflight audit and backlog-extraction sessions
 
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-planning.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-planning.md
index da143755..7658313c 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-planning.md
@@ -22,7 +22,7 @@
 
 ## Codebase recon (agent-led — required)
 
-- **Paths reviewed:** `feature-domain-architecture-alignment-guide.md` (phases **20.7–20.8** + post-20.6 note); `phases/phase-20.7-guide.md`, `phases/phase-20.7-handoff.md`, `phases/phase-20.6-handoff.md` (next → **20.7**); `across-ladder.json` (phases **20.1–20.13** on disk); `feature-domain-architecture-alignment-handoff.md`; glob for **`.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md`** → **not present** in workspace (treat **`phase-20.7-guide.md`** + feature guide as operational spec until the plan file is added or relocated under **`.project-manager/`**).
+- **Paths reviewed:** `feature-domain-architecture-alignment-guide.md`; `architecture-alignment-closeout-master-plan.md` (in-repo extension index); `phases/phase-20.7-guide.md`, `phases/phase-20.7-handoff.md`, `phases/phase-20.6-handoff.md`; `across-ladder.json` (phases **20.1–20.13** on disk); `feature-domain-architecture-alignment-handoff.md`.
 - **Patterns / call sites:** Extension ladder is **PM/harness-first** (no single code entrypoint). Product truth remains **`ARCHITECTURE_PRINCIPLES.md`**, **`FEATURE_20_ARCHITECTURE_REDESIGN.md`**, **`ARCHITECTURE.md`**. Pass **6** evidence lives in **`session-20.6.4-log.md`** and **`DOMAIN_REWRITE_WORKLOG.md`**.
 - **Gaps / unknowns:** Session **20.7.1** should either **add** the master closeout plan to the repo at a stable path or **update** all references to the real location. **`across-ladder.json`** lists **20.7.1** / **20.7.2** only — confirm whether **20.7.3** needs harness **tier-add** or manual ladder refresh.
 
@@ -42,7 +42,7 @@ Complete **Phase 20.7** as the bridge between the original Feature 20 pass ladde
 
 ## Files
 
-- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`, `.project-manager/ARCHITECTURE.md` — **master closeout plan:** add under **`.proje
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
