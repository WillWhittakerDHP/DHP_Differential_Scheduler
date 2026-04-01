# Session 6.17.2: Server preflight / resolution / finalize infrastructure


### Task 6.17.2.1: Task 6.17.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.2.2



## Completed Tasks

### Task 6.17.2.2: Task 6.17.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.2.3



### Task 6.17.2.1: Task 6.17.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.2.2

<!-- end excerpt session -->



### Task 6.17.2.2: Task 6.17.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.2.3


## Harness: commit preview (in-scope diff)

Paths (8): `.project-manager/WORKFLOW_FRICTION_LOG.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md`, `server/src/routes/internal/entities/entityCrudRouter.ts`, `server/src/routes/internal/entities/entityDeleteContractFacade.ts`, `.project-manager/features/appointment-workflow/sessions/task-6.17.2.2-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.17.2.2-planning.md`, `server/src/services/entityDelete/`

### `git diff --stat HEAD`

```text
.project-manager/WORKFLOW_FRICTION_LOG.md          |  63 +++
 .../sessions/session-6.17.2-guide.md               |   2 +-
 .../sessions/session-6.17.2-log.md                 |  15 +
 .../routes/internal/entities/entityCrudRouter.ts   |  12 +-
 .../entities/entityDeleteContractFacade.ts         | 421 ++++++++++++++++-----
 5 files changed, 406 insertions(+), 107 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/WORKFLOW_FRICTION_LOG.md b/.project-manager/WORKFLOW_FRICTION_LOG.md
index 8feca0f1..f9f070ca 100644
--- a/.project-manager/WORKFLOW_FRICTION_LOG.md
+++ b/.project-manager/WORKFLOW_FRICTION_LOG.md
@@ -1323,3 +1323,66 @@ If you are not already using this model, consider switching before proceeding.
 *Speed-optimized for focused task changes*
 If you are not already using this model, consider switching before proceeding.
 ---
+
+### 2026-04-01 — 6.17.2.1 — task — end — harness_plugin_advisory
+
+- **reasonCodeRaw:** harness_plugin_advisory
+- **reasonCodeNormalized:** harness_plugin_advisory
+- **isFailureReason:** false
+- **tier:** task
+- **action:** end
+- **identifier:** 6.17.2.1
+- **featureName:** appointment-workflow
+- **stepPath:** —
+
+- **Symptom:** Harness appended plugin advisory to control-plane message (run success=true).
+- **Context:** runId=run_task_end_6_17_2_1_1775066601779; harnessAction=end
+
+---
+---
+**Recommended agent/model for this run:** Composer (fast)
+*Express profile: minimal gates, prioritize speed*
+If you are not already using this model, consider switching before proceeding.
+---
+
+### 2026-04-01 — 6.17.2.2 — task — start — harness_plugin_advisory
+
+- **reasonCodeRaw:** harness_plugin_advisory
+- **reasonCodeNormalized:** harness_plugin_advisory
+- **isFailureReason:** false
+- **tier:** task
+- **action:** start
+- **identifier:** 6.17.2.2
+- **featureName:** appointment-workflow
+- **stepPath:** —
+
+- **Symptom:** Harness appended plugin advisory to control-plane message (run success=true).
+- **Context:** runId=run_task_start_6_17_2_2_1775066719352; harnessAction=start
+
+---
+---
+**Recommended agent/model for this run:** Composer (fast)
+*Speed-optimized for focused task changes*
+If you are not already using this model, consider switching before proceeding.
+---
+
+### 2026-04-01 — 6.17.2.2 — task — start — harness_plugin_advisory
+
+- **reasonCodeRaw:** harness_plugin_advisory
+- **reasonCodeNormalized:** harness_plugin_advisory
+- **isFailureReason:** false
+- **tier:** task
+- **action:** start
+- **identifier:** 6.17.2.2
+- **featureName:** appointment-workflow
+- **stepPath:** —
+
+- **Symptom:** Harness appended plugin advisory to control-plane message (run success=true).
+- **Context:** runId=run_task_start_6_17_2_2_1775066881270; harnessAction=start
+
+---
+---
+**Recommended agent/model for this run:** Composer (fast)
+*Speed-optimized for focused task changes*
+If you are not already using this model, consider switching before proceeding.
+---
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md
index 26c8069a..9f60d4f9 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md
@@ -60,7 +60,7 @@ These sections contain session-specific content:
 **Approach:** Use `ENTITY_DELETE_ROUTE_SEGMENTS`; thin handlers → facade; no domain graph in this task beyond stubs/delegation.
 **Checkpoint:** All three paths return JSON; consistent `code` field on error paths; server lint clean.
 
-- [ ] #### Task 6.17.2.2: Registry + transactional resolve/finalize
+- [x] #### Task 6.17.2.2: Registry + transactional resolve/finalize
 **Goal:** Strategy registry; preflight graph; apply resolutions; finalize in transaction; optional pilot entity strategy.
 **Files:**
 - New service/registry module(s) under `server/src/services/` or `entities/`
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md
index 26d91320..f945533b 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md
@@ -11,6 +11,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md`, `.project-manager/features/appointment-workflow/phases/phase-6.17-log.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.2-planning.md`, `.project-manager/features/appointment-workflow/sessions/task-6.17.2.1-planning.md`, `.project-manager/features/appointment-workflow/sessions/task-6.17.2.2-planning.md`, `.project-manager/features/appointment-workflow/planning-archive/session/6.17.2/`, `.project-manager/features/appointment-workflow/sessions/session-6.17.2-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-6.17-guide.md                     |   2 +-
 .../appointment-workflow/phases/phase-6.17-log.md  |   8 +
 .../sessions/session-6.17.2-guide.md               |   2 +
 .../sessions/session-6.17.2-log.md                 |   7 +-
 .../sessions/session-6.17.2-planning.md            | 327 ++++++++++++---------
 .../sessions/task-6.17.2.1-planning.md             | 186 ------------
 .../sessions/task-6.17.2.2-planning.md             | 214 --------------
 7 files changed, 200 insertions(+), 546 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md b/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md
index 860bc7db..788bec6c 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md
@@ -121,7 +121,7 @@ Start with a **small** set; expand via registry:
 **Description:** Shared types for dependency graph, policy categories, preflight/finalize request–response shapes; OpenAPI-level or internal contract doc; alignment with `entityCrudRouter` extension points.  
 **Focus:** Contracts first; no “hidden” cascade semantics.
 
-- [ ] ### Session 6.17.2: Server preflight / resolution / finalize infrastructure  
+- [x] ### Session 6.17.2: Server preflight / resolution / finalize infrastructure  
 **Description:** Implement preflight query per entity registry; transactional resolve + final delete; structured errors; relationship helpers.  
 **Focus:** Correctness and transactions; explicit policy handling.
 
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md b/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md
index b4e3c081..b5191322 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 6.17.2: Server preflight / resolution / finalize infrastructure ✅
+**Completed:** 2026-04-01
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** Server preflight / resolution / finalize infrastructure
+
+
+
 ### Session 6.17.1: Delete dependency model + API contract ✅
 **Completed:** 2026-04-01
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md
index 9f60d4f9..feabc49a 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md
@@ -415,3 +415,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md
index dc80421c..6a7ba53e 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md
@@ -144,4 +144,9 @@ index 26d91320..f945533b 100644
 --- a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md
 +++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-planning.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-planning.md
index 356ae2cb..e945da8b 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-planning.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-planning.md
@@ -1,207 +1,246 @@
-# Plan: session 6.17.2 — Server preflight / resolution / finalize infrastructure
-
-## Contract
-- **Tier:** session | **ID:** 6.17.2
-- **Scope:** Server-only: mount dependency-delete routes, structured errors, registry/strategy layer, transactional resolve + finalize — per `delete-preflight-api-v1.md` and `@shared/types/adminDeleteDependency`. **No** Vue wizard (6.17.3) or generic CRUD wiring (6.17.4).
-- **Governance (harness snapshot):**
-  - Governance Context (Session)
-  - Function Governance
-  - Clean — no violations detected.
-  - Component Governance
-  - Clean — no violations detected.
-  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
-  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Return surface has 15 properties; decompose into focused composables
-  - `client/src/composables/booking/useMinimizerPartsScheduling.ts` — oversized-return: 
-  - … _(truncated)_
-
-## Work Profile
-- **Execution intent:** plan
-- **Action type:** decomposition
-- **Scope shape:** cross_cutting
-- **Governance domains:** docs, architecture
-- **Gate profile:** standard
-- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
-- **Recommended context pack:** decomposition_pack
-- **Planning artifact action:** create
-- **Decomposition mode:** moderate
-- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.
-
-## Where we left off
-Session **6.17.1** complete: shared DTOs, API v1 markdown, `ENTITY_DELETE_ROUTE_SEGMENTS`, router JSDoc. <!-- harness-across-ladder:start -->
-
-## Story / epic
+<!-- harness-planning-rollup tier=session id=6.17.2 consolidatedAt=2026-04-01T18:16:56.801Z -->
+
+# Consolidated planning: session 6.17.2
+
+## Session 6.17.2 (parent)
+
+## Story
 
 **This session delivers** working **Express handlers** and a **server registry** for preflight / resolve / finalize **so that** Session **6.17.3** can call real endpoints from the delete wizard without redesigning URLs or payloads.
 
 **Estimated size:** **M–L** (routing + domain layer + transactions + at least one registrable path or documented no-op registry boundary).
 
 ---
-## Architecture context (harness-injected)
 
-## 1. System overview
+## Analysis
+
+- **Problem / why now:** Contracts from **6.17.1** are frozen; without server behavior, **6.17.3** cannot integrate. This session implements the **wire + domain** side only.
+- **Domains:** **Server** (`server/src/routes/internal/entities/`, `server/src/services/` or co-located delete module). **Shared** is **read-only** — import existing `@shared/types/adminDeleteDependency`; avoid new shared types unless both sides will need them in the same PR (unlikely).
+- **Patterns:** Match existing CRUD: `csrfProtection`, `requireAuth`, `entityTypeParamHandler`, `validateEntityId`, `handleRouteError` / `entityErrorHandler`. Reuse dependency counting patterns (e.g. `countPartShapeDeleteDependencies`) when building graphs — extract shared helpers if duplication appears.
+- **Risks:** Token storage (memory vs DB), idempotency semantics, and **scope creep** into client. Keep tokens **opaque**; document TTL; defer DB-backed tokens unless required for multi-instance. **Transactions:** resolve + finalize must not leave partial state; use Sequelize transactions where multiple rows change.
+- **Out of scope:** Admin UI, TanStack Query, `entityListDelete`, entity card — **6.17.3–6.17.4**. Full rollout of every entity policy — **6.17.5**; this session may register **zero or one** pilot strategy if needed to prove the pipe.
+
+## Goal
+
+1. **Mount** the three routes from **`delete-preflight-api-v1.md`** using **`ENTITY_DELETE_ROUTE_SEGMENTS`** (same base path as CRUD).
+2. **Return** JSON bodies that satisfy **`DeletePreflightResponse`**, **`DeleteResolveResponse`**, **`DeleteFinalizeResponse`** (validate/sanitize inputs; reject malformed bodies with **`RESOLUTION_INVALID`** / **`PREFLIGHT_FAILED`** as appropriate).
+3. **Introduce** a **registry** (map from admin entity key → strategy) for preflight graph, apply resolutions, and finalize delete; unregistered keys return a clear **4xx** with **`DeleteContractErrorCode`** (e.g. not supported yet) — **not** a silent 500.
+4. **Extend** error responses so clients c
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
