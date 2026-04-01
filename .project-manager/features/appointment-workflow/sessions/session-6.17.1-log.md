# Session 6.17.1: Delete dependency model + API contract


### Task 6.17.1.1: Task 6.17.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.1.2



## Completed Tasks

### Task 6.17.1.2: Task 6.17.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.1.3



### Task 6.17.1.1: Task 6.17.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.1.2

<!-- end excerpt session -->



### Task 6.17.1.2: Task 6.17.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.1.3


## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/features/appointment-workflow/sessions/session-6.17.1-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.1-log.md`, `server/src/routes/internal/entities/entityConstants.ts`, `server/src/routes/internal/entities/entityCrudRouter.ts`, `.project-manager/features/appointment-workflow/docs/`, `.project-manager/features/appointment-workflow/sessions/task-6.17.1.2-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.17.1.2-planning.md`

### `git diff --stat HEAD`

```text
.../appointment-workflow/sessions/session-6.17.1-guide.md |  2 +-
 .../appointment-workflow/sessions/session-6.17.1-log.md   | 15 +++++++++++++++
 server/src/routes/internal/entities/entityConstants.ts    | 12 ++++++++++++
 server/src/routes/internal/entities/entityCrudRouter.ts   |  6 ++++++
 4 files changed, 34 insertions(+), 1 deletion(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.1-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.1-guide.md
index 4071b36e..b1229527 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.1-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.1-guide.md
@@ -59,7 +59,7 @@ These sections contain session-specific content:
 **Approach:** [Approach to take]
 **Checkpoint:** [What needs to be verified]
 
-- [ ] #### Task 6.17.1.2: [Task Name]
+- [x] #### Task 6.17.1.2: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.1-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.1-log.md
index 6d292269..c990b911 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.1-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.1-log.md
@@ -11,6 +11,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md`, `.project-manager/features/appointment-workflow/phases/phase-6.17-log.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.1-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.1-log.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.1-planning.md`, `.project-manager/features/appointment-workflow/sessions/task-6.17.1.1-planning.md`, `.project-manager/features/appointment-workflow/sessions/task-6.17.1.2-planning.md`, `.project-manager/features/appointment-workflow/planning-archive/session/6.17.1/`, `.project-manager/features/appointment-workflow/sessions/session-6.17.1-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-6.17-guide.md                     |   2 +-
 .../appointment-workflow/phases/phase-6.17-log.md  |   8 +
 .../sessions/session-6.17.1-guide.md               |   2 +
 .../sessions/session-6.17.1-log.md                 |   7 +-
 .../sessions/session-6.17.1-planning.md            | 313 +++++++++++----------
 .../sessions/task-6.17.1.1-planning.md             | 201 -------------
 .../sessions/task-6.17.1.2-planning.md             | 173 ------------
 7 files changed, 188 insertions(+), 518 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md b/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md
index 8f7ed341..860bc7db 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md
@@ -117,7 +117,7 @@ Start with a **small** set; expand via registry:
 
 ## Sessions Breakdown
 
-- [ ] ### Session 6.17.1: Delete dependency model + API contract  
+- [x] ### Session 6.17.1: Delete dependency model + API contract  
 **Description:** Shared types for dependency graph, policy categories, preflight/finalize request–response shapes; OpenAPI-level or internal contract doc; alignment with `entityCrudRouter` extension points.  
 **Focus:** Contracts first; no “hidden” cascade semantics.
 
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md b/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md
index ee8d7887..b4e3c081 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 6.17.1: Delete dependency model + API contract ✅
+**Completed:** 2026-04-01
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** Delete dependency model + API contract
+
+
+
 _(None yet.)_
 
 ---
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.1-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.1-guide.md
index b1229527..f1f80c03 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.1-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.1-guide.md
@@ -414,3 +414,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.1-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.1-log.md
index 55ac20bd..365fa7b8 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.1-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.1-log.md
@@ -71,4 +71,9 @@ index 6d292269..c990b911 100644
 --- a/.project-manager/features/appointment-workflow/sessions/session-6.17.1-log.md
 +++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.1-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.1-planning.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.1-planning.md
index f6ef52f2..dcb98bcf 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.1-planning.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.1-planning.md
@@ -1,207 +1,236 @@
-# Plan: session 6.17.1 — Delete dependency model + API contract
-
-## Contract
-- **Tier:** session | **ID:** 6.17.1
-- **Scope:** Shared types + documented HTTP/API contract for dependency-aware delete (preflight / resolve / finalize). **No** full server handlers or client wizard in this session — those are 6.17.2+.
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
-Phase 6.17 registered in feature guide and PROJECT_PLAN; scope and five-session breakdown documented in `phase-6.17-guide.md`.
-
-## Story / epic
+<!-- harness-planning-rollup tier=session id=6.17.1 consolidatedAt=2026-04-01T17:49:14.358Z -->
+
+# Consolidated planning: session 6.17.1
+
+## Session 6.17.1 (parent)
+
+## Story
 
 **This session delivers** machine-readable **contracts** (TypeScript in `shared/` + written API spec) for dependency-aware delete **so that** Session 6.17.2 can implement preflight/resolution/finalize against a stable shape, and Session 6.17.3+ can type client calls without rework.
 
 **Estimated size:** M (mostly types + docs; small optional constants for route paths).
 
 ---
-## Architecture context (harness-injected)
 
-## 1. System overview
+## Analysis
+
+- **Problem / why now:** Phase 6.17 depends on a single **contract** for preflight → user resolution → finalize. Without frozen DTOs, server and client work in 6.17.2–6.17.4 will diverge.
+- **Domains:** **Shared** (`shared/` / `@shared`) for cross-boundary DTOs and policy literals; **docs** for HTTP contract; **server** touch limited to **naming alignment** (constants/comments/route skeleton optional) — no behavioral delete logic here.
+- **Patterns to follow:** `ARCHITECTURE.md` §4 — shared types only where both sides need them; reuse existing **entity key** vocabulary (`GlobalEntityKey` / `ENTITY_KEYS` style) for `entityType` fields in payloads; align error **codes** with existing `entityErrorHandler` / structured response patterns used in `entityCrudRouter`.
+- **Risks:** Over-modeling the graph (start minimal: nodes, edges, policy per edge, counts); versioning — document additive-only expectation for v1.
+- **Out of scope this session:** Sequelize queries, Vue wizard UI, wiring `useEntityCrud`, transactional apply — **6.17.2+**.
+
+## Goal
+
+Introduce **versioned shared types** and a **written API contract** for:
+
+1. **Delete preflight** — response describes blocking/related dependencies with **policy classification** per edge (`reassign_required` | `safe_auto_remove` | `confirm_bulk_remove` | `hard_blocked` | `allow_direct_delete`).
+2. **Delete resolve** (optional split from finalize in spec) — request body carries user choices (reassignment targets, bulk confirm tokens).
+3. **Delete finalize** — request confirms apply + **entity id**; response confirms completion or structured failure.
+
+**Explicitly not required in 6.17.1:** working Express routes beyond optional **path constants** or commented mount plan.
+
+## Files
+
+| Area | Paths |
+|------|--------|
+| Shared types | New module under `shared/types/` (e.g. `adminDeleteDependency.ts` or split by concern) — policy union, graph DTOs, preflight/resolve/finalize bodies, **machine-readable error code** union/string brand |
+| Contract doc | `.project-manager/features/appointment-workflow/` or `server/docs/` — single markdown “Delete preflight API v1” (methods, paths, examples, error table) |
+| Server (optional) | `server/src/routes/internal/entities/entityConstants.ts` — route segment constants; **or** `entityCrudRouter.ts` top-of-file JSDoc listing future routes — **no** handlers unless stub `501` is explicitly chosen in task |
+| Reference | `phases/phase-6.17-guide.md`, `phases/phase-6.17
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
