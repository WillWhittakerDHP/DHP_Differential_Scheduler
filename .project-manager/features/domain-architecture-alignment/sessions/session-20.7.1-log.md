# Session 20.7.1: ** Canonical plan adoption and doc protections — align feature/handoff/phase surfaces; tombstone or warning on contradictory planning paths.


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

Paths (10): `.project-manager/PROJECT_PLAN.md`, `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md`, `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.7-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.1.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.1.1-planning.md`

### `git diff --stat HEAD`

```text
.project-manager/PROJECT_PLAN.md                       |  2 +-
 .../domain-architecture-alignment/across-ladder.json   |  2 +-
 .../feature-domain-architecture-alignment-guide.md     |  4 ++--
 .../feature-domain-architecture-alignment-handoff.md   |  6 +++---
 .../phases/phase-20.6-handoff.md                       |  4 ++--
 .../phases/phase-20.7-handoff.md                       | 18 +++++++++---------
 .../sessions/session-20.7.1-guide.md                   |  2 +-
 .../sessions/session-20.7.1-log.md                     | 18 ++++++++++++++++++
 8 files changed, 37 insertions(+), 19 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/PROJECT_PLAN.md b/.project-manager/PROJECT_PLAN.md
index e96e2d6a..5cf8f995 100644
--- a/.project-manager/PROJECT_PLAN.md
+++ b/.project-manager/PROJECT_PLAN.md
@@ -1209,4 +1209,4 @@ Native app packaging is not tracked as a PROJECT_PLAN feature. **LAUNCH_CHECKLIS
 - **Launch infrastructure** is tracked in LAUNCH_CHECKLIST.md (hosting, auth, security, CI/CD)
 - **Feature 18 (Admin Assistance Wizard)** replaces the original "GPT Admin Automation" concept — deterministic guided workflows instead of AI dependency
 - **Feature 19 (CRM / Inspection Platform Integration)** is part of beta-launch work: research (Spectora + ISN) and API set-up must be done so we can loop the scheduler into inspection creation (Spectora, ISN, or own CRM). See Phase 19.1–19.2 for detail; Phase 19.3 (full wiring) can follow during or after beta.
-- **Feature 20 (Domain Architecture Alignment)** — execute locked principles and the Feature 20 implementation plan ordered passes (phases 20.1–20.6); full pointers and phase map in **## Feature 20** above and in `features/domain-architecture-alignment/`; **status** remains from the Feature Summary table.
+- **Feature 20 (Domain Architecture Alignment)** — execute locked principles and the Feature 20 implementation plan ordered passes (**20.1–20.6**); then extension phases **20.7–20.8** before **`/feature-end`**. Full pointers and phase map in **## Feature 20** above and in `features/domain-architecture-alignment/`; **status** remains from the Feature Summary table.
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index 8e06fe04..267d3794 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-03T16:49:40.709Z",
+  "derivedAt": "2026-04-03T16:51:56.172Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md
index 4e102dc8..cbbce50f 100644
--- a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md
@@ -15,9 +15,9 @@
 
 - [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
 - [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).
-- [/.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md](../../../.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md) — locked canonical sequencing plan for the post-20.6 close-out extension.
+- **Extension close-out sequencing (post-20.6):** **[`phases/phase-20.7-guide.md`](./phases/phase-20.7-guide.md)** and **[`phases/phase-20.8-guide.md`](./phases/phase-20.8-guide.md)**, plus this feature’s handoffs and **[`phases/phase-20.7-planning.md`](./phases/phase-20.7-planning.md)**, are the **committed in-repo** ordering surface after Pass **6**. An optional narrative capture may be added later as **`.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md`** — **do not** treat that path as authoritative until the file exists in the repository; if it is absent, follow the phase guides.
 
-**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or the implementation plan.
+**Conflict rule:** If this guide disagrees with either analysis file above, **the analysis documents win** on domain truth; update this guide, not the principles or the implementation plan. For **harness sequencing only** (which phase/session to run next), prefer **phase 20.7 / 20.8** guides and handoffs over ad hoc chat.
 
 ---
 
diff --git a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
index d4fa968c..e43a7d33 100644
--- a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
+++ b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
@@ -12,13 +12,13 @@
 
 ## Current Status
 
-**Feature domain-architecture-alignment:** Pass **20.6** (§**8.6**) sessions **20.6.1–20.6.4** delivered; evidence in **`sessions/session-20.6.4-log.md`** and **`DOMAIN_REWRITE_WORKLOG.md`**. Remaining work now flows through extension phases **20.7** and **20.8** derived from the locked master close-out plan.
+**Feature domain-architecture-alignment:** Pass **20.6** (§**8.6**) sessions **20.6.1–20.6.4** delivered; evidence in **`sessions/session-20.6.4-log.md`** and **`DOMAIN_REWRITE_WORKLOG.md`**. Remaining work flows through extension phases **20.7** and **20.8** using the **committed phase guides** and handoffs (see **`phases/phase-20.7-guide.md`** / **`phase-20.8-guide.md`**).
 
 ---
 
 ## Next Action
 
-Run **`/phase-start 20.7`** after completing any remaining **20.6** harness housekeeping. Use **`phases/phase-20.6-handoff.md`**, **`phases/phase-20.7-guide.md`**, and the locked master close-out plan for the extension ladder. Do **not** run **`/feature-end`** until **20.8** is complete.
+**Phase 20.7** is open; continue **Session 20.7.1** (canonical lock + doc protections): finish **Task 20.7.1.1** then **Task 20.7.1.2** per **`sessions/session-20.7.1-planning.md`**, using **`/task-start`** / **`/task-end`** / **`/accepted-code`** as the harness requires. If you have not materialized the session yet, run **`/session-start 20.7.1`** first. Do **not** run **`/feature-end`** until **20.8** is complete.
 
 ---
 
@@ -28,7 +28,7 @@ Run **`/phase-start 20.7`** after completing any remaining **20.6** harness hous
 
 **What you need for feature closeout:**
 - Complete **20.7** and **20.8** before **`/feature-end`**
-- Use the locked master close-out plan as the sequencing surface for the extension work
+- Use **`phases/phase-20.7-guide.md`**, **`phases/phase-20.8-guide.md`**, and this handoff as the sequencing surface (optional **`.cursor/plans/...master_plan...`** file only if present in-repo)
 - Optional: human review of **§9.3** before any redesign filename replacement
 
 **Plan Changes Affecting Downstream Features:**
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md
index 820f8db3..0fcafbc2 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md
@@ -26,9 +26,9 @@ Run **`/phase-start 20.7`** for Feature **20** (`domain-architecture-alignment`)
 Phase 20.6 completed with sessions: 20.6.1, 20.6.2, 20.6.3, 20.6.4.
 
 **What you need for feature closeout:**
-- Harness **`/feature-end`**; confirm **`PROJECT_PLAN`** Feature **20** status after harness run
+- Complete extension phases **20.7** and **20.8**, then run harness **`/feature-end`**; confirm **`PROJECT_PLAN`** Feature **20** status after **`/feature-end`**
 - **`session-20.6.4-log.md`** and **`DOMAIN_REWRITE_WORKLOG.md`** hold Pass **6** evidence; **§9.3–9.4** file swap deferred per **20.6.4**
-- The locked master close-out plan now drives the remaining extension
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
