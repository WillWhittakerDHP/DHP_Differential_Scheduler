# Session 20.7.1: Canonical plan adoption and doc protections


### Task 20.7.1.1: Task 20.7.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.1.2



## Completed Tasks

### Task 20.7.1.2: Task 20.7.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.1.3



### Task 20.7.1.1: Task 20.7.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.1.2

<!-- end excerpt session -->



### Task 20.7.1.2: Task 20.7.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.1.3

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (8): `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md`, `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.7-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.1.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.1.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.1.2-planning.md`

### `git diff --stat HEAD`

```text
.../feature-domain-architecture-alignment-guide.md |  2 +-
 ...eature-domain-architecture-alignment-handoff.md | 65 +++++++++++-----------
 .../phases/phase-20.7-handoff.md                   | 29 +++++-----
 .../sessions/session-20.7.1-guide.md               |  2 +-
 .../sessions/session-20.7.1-log.md                 | 15 +++++
 .../sessions/task-20.7.1.1-planning.md             | 12 ++--
 6 files changed, 71 insertions(+), 54 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md
index 882bbea3..d5e8dba5 100644
--- a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md
@@ -23,7 +23,7 @@
 
 ## Mandatory context for every phase and session
 
-- Open **both** canonical documents (or the sections cited in the active phase guide) **before** implementation work.
+- Open **all canonical sources** under **Canonical sources (absolute truth)** above (principles, implementation plan, close-out sequencing index) or the sections cited in the active phase guide **before** implementation work.
 - At **session start and end**, run **plan §9.1** (drift checklist) and cross-check **plan §9.1a** against **ARCHITECTURE_PRINCIPLES.md §8** invariants.
 - Do not treat this feature guide as a substitute for the full implementation-plan sections that apply to the pass you are in.
 
diff --git a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
index 9f061aea..7a6db151 100644
--- a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
+++ b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
@@ -4,88 +4,89 @@
 
 **Tier:** Feature (Tier 0 - Highest Level)
 
-**Last Updated:** 2026-04-03
-**Feature Status:** In Progress — Pass **6** execution complete; extension close-out phases **20.7** and **20.8** pending
+**Last Updated:** 2026-04-04  
+**Feature Status:** In Progress — passes **20.1–20.6** complete; extension phases **20.7–20.13** in flight; **Phase 20.7** / **Session 20.7.1** active (canonical lock + doc protections)  
 **Next Feature:** _(after Feature **20** closeout)_
 
 ---
 
 ## Current Status
 
-**Feature domain-architecture-alignment:** Pass **20.6** (§**8.6**) sessions **20.6.1–20.6.4** delivered; evidence in **`sessions/session-20.6.4-log.md`** and **`DOMAIN_REWRITE_WORKLOG.md`**. Remaining work now flows through execution-first extension phases **20.7–20.13** derived from the locked master close-out plan.
+**Feature domain-architecture-alignment:** Pass **20.6** (§**8.6**) sessions **20.6.1–20.6.4** delivered; evidence in **`sessions/session-20.6.4-log.md`** and **`DOMAIN_REWRITE_WORKLOG.md`**. Remaining work runs through extension phases **20.7–20.13** per **[`architecture-alignment-closeout-master-plan.md`](./architecture-alignment-closeout-master-plan.md)**. **Phase 20.7** and **Session 20.7.1** are underway.
 
 ---
 
 ## Next Action
 
-Run **`/phase-start 20.7`** after completing any remaining **20.6** harness housekeeping. Use **`phases/phase-20.6-handoff.md`**, **`phases/phase-20.7-guide.md`**, and the locked master close-out plan for the extension ladder. Do **not** run **`/feature-end`** until **20.13** is complete.
+Continue **Session 20.7.1** — follow **`sessions/session-20.7.1-guide.md`**. Sequencing index: **[`architecture-alignment-closeout-master-plan.md`](./architecture-alignment-closeout-master-plan.md)**. Task **20.7.1.1** (in-repo master plan + link normalization) is complete; after **20.7.1.2** (handoff alignment), run **`/task-start 20.7.1.3`** for the tombstone pass, then **`/session-end`** when session objectives are met. Do **not** run **`/feature-end`** until **20.13** is complete.
 
 ---
 
 ## Transition Context
 
-**Where we left off:** Feature **20** implementation passes **20.1–20.6** are executed on **`feature/domain-architecture-alignment`**; **§9.3–9.4** canonical file swap is **deferred** (logged in **20.6.4**). The feature now continues with **20.7–20.13** to lock the close-out plan, finish residual execution work, and reconcile truth-bearing docs before feature-end.
+**Where we left off:** Feature **20** implementation passes **20.1–20.6** are executed on **`feature/domain-architecture-alignment`**; **§9.3–9.4** canonical file swap is **deferred** (logged in **20.6.4**). The feature continues with **20.7–20.13** to finish residual execution work and reconcile truth-bearing docs before **`/feature-end`**.
 
 **What you need for feature closeout:**
+
 - Complete **20.7–20.13** before **`/feature-end`**
-- Use the locked master close-out plan as the sequencing surface for the extension work
+- Use **[`architecture-alignment-closeout-master-plan.md`](./architecture-alignment-closeout-master-plan.md)** as the extension sequencing surface
 - Optional: human review of **§9.3** before any redesign filename replacement
 
-**Plan Changes Affecting Downstream Features:**
-- [Only include if plan changed and affects later features]
-- [Brief description of change and impact]
+**Plan changes affecting downstream features:** None recorded here.
 
 ---
 
 ## Feature Summary
 
-**Phases Completed:** [List phase numbers]
-**Key Accomplishments:**
-- [Major accomplishment 1]
-- [Major accomplishment 2]
+**Phases completed:** 20.1, 20.2, 20.3, 20.4, 20.5, 20.6  
+
+**Key accomplishments:**
+
+- Ordered passes through **20.6** per **FEATURE_20_ARCHITECTURE_REDESIGN**; Pass **6** removed legacy admin metadata stack in favor of code-first surfaces.
+- In-repo **close-out sequencing index** added under this feature directory (**task 20.7.1.1**).
+
+**Decisions made:**
 
-**Decisions Made:**
-- [Decision that affects downstream features]
+- Extension ladder **20.7–20.13** runs before **`/feature-end`**.
+- **§9.3–9.4** canonical file rename/swap deferred per **20.6.4** log.
 
-**Architecture:**
-[Brief architecture summary - 2-3 sentences]
+**Architecture:** Locked domain rules in **ARCHITECTURE_PRINCIPLES** + **ARCHITECTURE.md** (§8–§14); booking resolution remains client **PartFinalizer** + relational **`event_assignments`**.
 
-**Technology Stack:**
-- [Technology 1]
-- [Technology 2]
+**Technology stack:** Vue 3, Express, Sequelize, shared **`@shared`** types.
 
 ---
 
 ## Git Branch Status
 
-**Branch:** `feature/[name]`
-**Status:** [Merged / Deleted]
-**Merged To:** `develop`
-**Merge Date:** 2026-04-02
+**Branch:** `feature/domain-architecture-alignment`  
+**Status:** Active development (not merged)  
+**Merged to:** —  
+**Merge date:** —
 
 ---
 
 ## Notes
 
-**Keep minimal** - Detailed notes belong in feature log, not handoff.
+**Keep minimal** — detailed notes belong in the feature log, not this handoff.
 
 ---
 
 ## Related Documents
 
-- Feature Guide: `.project-manager/features/[name]/feature-[name]-guide.md`
-- Feature Log: `.project-manager/features/[name]/feature-[name]-log.md`
-- Next Feature Guide: `.project-manager/features/[next-name]/feature-[next-name]-guide.md` (if applicable)
+- Feature guide: [`feature-domain-architecture-alignment-guide.md`](./feature-domain-architecture-alignment-guide.md)
+- Feature log: [`feature-domain-architecture-alignment-log.md`](./feature-domain-architecture-alignment-log.md)
+- Close-out index: [`architecture-alignment-closeout-master-plan.md`](./architecture-alignment-closeout-master-plan.md)
 
 <!-- harness-across-ladder:start -->
 ## Across ladder (harness)
 
 _Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._
 
-- **Feature:** `domain-architecture-alignment` · **Source:** manual_extension · **Derived:** 2026-04-03T21:40:00.000Z
-- **Phases on disk (8):** 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8
-- **Focus phase:** `20.6` · **Next phase across:** `20.7` → `/phase-start 20.7`
+- **Feature:** `domain-architecture-alignment` · **Source:** manual_extension · **Derived:** 2026-04-04
+- **Phases on disk (13):** 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9, 20.10, 20.11, 20.12, 20.13
+- **Focus pha
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
