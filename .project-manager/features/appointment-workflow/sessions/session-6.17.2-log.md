# Session 6.17.2: Server preflight / resolution / finalize infrastructure


### Task 6.17.2.1: Task 6.17.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.2.2



## Completed Tasks

### Task 6.17.2.1: Task 6.17.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.2.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/WORKFLOW_FRICTION_LOG.md`, `.project-manager/features/appointment-workflow/across-ladder.json`, `.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md`, `server/src/routes/internal/entities/entityCrudRouter.ts`, `.project-manager/features/appointment-workflow/sessions/task-6.17.2.1-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.17.2.1-planning.md`, `server/src/routes/internal/entities/entityDeleteContractFacade.ts`, `server/src/routes/internal/entities/entityDeleteContractResponse.ts`

### `git diff --stat HEAD`

```text
.project-manager/WORKFLOW_FRICTION_LOG.md          | 77 ++++++++++++++++++++++
 .../appointment-workflow/across-ladder.json        |  2 +-
 .../sessions/session-6.17.2-guide.md               |  2 +-
 .../sessions/session-6.17.2-log.md                 | 18 +++++
 .../routes/internal/entities/entityCrudRouter.ts   | 36 +++++++++-
 5 files changed, 132 insertions(+), 3 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/WORKFLOW_FRICTION_LOG.md b/.project-manager/WORKFLOW_FRICTION_LOG.md
index 42902546..8feca0f1 100644
--- a/.project-manager/WORKFLOW_FRICTION_LOG.md
+++ b/.project-manager/WORKFLOW_FRICTION_LOG.md
@@ -1246,3 +1246,80 @@ If you are not already using this model, consider switching before proceeding.
 *Strong implementation focus for session work*
 If you are not already using this model, consider switching before proceeding.
 ---
+
+### 2026-04-01 — 6.17.2 — session — start — harness_plugin_advisory
+
+- **reasonCodeRaw:** harness_plugin_advisory
+- **reasonCodeNormalized:** harness_plugin_advisory
+- **isFailureReason:** false
+- **tier:** session
+- **action:** start
+- **identifier:** 6.17.2
+- **featureName:** appointment-workflow
+- **stepPath:** —
+
+- **Symptom:** Harness appended plugin advisory to control-plane message (run success=true).
+- **Context:** runId=run_session_start_6_17_2_1775066012871; harnessAction=start
+
+---
+---
+**Recommended agent/model for this run:** Composer
+*Strong implementation focus for session work*
+If you are not already using this model, consider switching before proceeding.
+---
+
+### 2026-04-01 — 6.17.2 — /accepted-plan — Planning-check noise, wrong decomposition line, handoff inject skipped
+
+- **Symptom:** After **`/accepted-plan`** for session **6.17.2**, the run returned **`success: true`** / **`start_ok`**, but the console and long **`output`** included several misleading or noisy lines agents should not treat as blockers.
+- **Context:** Command: `acceptedPlan()` from repo root; feature **`appointment-workflow`**; session **6.17.2** (server delete infrastructure).
+
+**Noise items (recorded):**
+
+1. **Documentation / pattern-reuse checks (ENOENT + path bug):** Warnings such as *Could not read generic components directory* for `client/src/admin/components/generic` — **wrong path for this repo**; generic admin Vue components live under **`client/src/components/admin/generic/`**. Transformer checks also logged **doubled absolute paths** in “Full Path” (e.g. `.../Differential_Scheduler/Users/districthomepro/...`), suggesting a path-join bug in the checker. Checklist output still referenced **React** filenames (`FieldRenderer.tsx`, etc.) in a **Vue** repo — confusing for agents.
+2. **Wrong task ids in “Decomposition” text:** A line listed tasks **`6.17.2.1`, `6.17.2.2`, `6.16.1.1`, `6.16.1.2`** — the **6.16.1.x** entries are **not** part of session 6.17.2; likely parser/template bleed. Canonical tasks: **`session-6.17.2-planning.md`** / **`session-6.17.2-guide.md`** (**6.17.2.1**, **6.17.2.2** only).
+3. **`[across-ladder] handoff inject skipped`:** `session-6.17.2-handoff.md` missing (**ENOENT**) until first session-end (or manual create). Expected for a new session; not a failure.
+
+- **Outcome / workaround:** Trust **`outcome.reasonCode`** / **`controlPlaneDecision`** for gate state. Ignore ENOENT planning-check warnings when the session is **server-only**. Ignore stray **6.16.1.x** in decomposition blobs; use session planning + guide. Treat handoff skip as normal until handoff exists.
+- **Suggestion:** Fix transformer “Full Path” construction; align generic-component and transformer scan paths with the **Vue** layout; filter decomposition output to **current session** task ids only; label planning-check failures as **advisory** when tier scope is non-client.
+
+### 2026-04-01 — 6.17.2.1 — task — start — harness_plugin_advisory
+
+- **reasonCodeRaw:** harness_plugin_advisory
+- **reasonCodeNormalized:** harness_plugin_advisory
+- **isFailureReason:** false
+- **tier:** task
+- **action:** start
+- **identifier:** 6.17.2.1
+- **featureName:** appointment-workflow
+- **stepPath:** —
+
+- **Symptom:** Harness appended plugin advisory to control-plane message (run success=true).
+- **Context:** runId=run_task_start_6_17_2_1_1775066220924; harnessAction=start
+
+---
+---
+**Recommended agent/model for this run:** Composer (fast)
+*Speed-optimized for focused task changes*
+If you are not already using this model, consider switching before proceeding.
+---
+
+### 2026-04-01 — 6.17.2.1 — task — start — harness_plugin_advisory
+
+- **reasonCodeRaw:** harness_plugin_advisory
+- **reasonCodeNormalized:** harness_plugin_advisory
+- **isFailureReason:** false
+- **tier:** task
+- **action:** start
+- **identifier:** 6.17.2.1
+- **featureName:** appointment-workflow
+- **stepPath:** —
+
+- **Symptom:** Harness appended plugin advisory to control-plane message (run success=true).
+- **Context:** runId=run_task_start_6_17_2_1_1775066414007; harnessAction=start
+
+---
+---
+**Recommended agent/model for this run:** Composer (fast)
+*Speed-optimized for focused task changes*
+If you are not already using this model, consider switching before proceeding.
+---
diff --git a/.project-manager/features/appointment-workflow/across-ladder.json b/.project-manager/features/appointment-workflow/across-ladder.json
index cd1ab6ee..13792f86 100644
--- a/.project-manager/features/appointment-workflow/across-ladder.json
+++ b/.project-manager/features/appointment-workflow/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "appointment-workflow",
-  "derivedAt": "2026-04-01T17:50:42.793Z",
+  "derivedAt": "2026-04-01T17:53:33.746Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "6.2",
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md
index 265623fe..26c8069a 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 6.17.2.1: Delete-contract HTTP routes + structured errors
+- [x] #### Task 6.17.2.1: Delete-contract HTTP routes + structured errors
 **Goal:** Mount preflight/resolve/finalize routes; middleware parity with CRUD; delete-contract error helper; behavior for unregistered entity keys.
 **Files:**
 - `server/src/routes/internal/entities/entityCrudRouter.ts` and/or `entityDeleteRouter.ts`, `entityRouter.ts`
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md
index 0e318fb8..f05974c2 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.2-log.md
@@ -1,2 +1,20 @@
 # Session 6.17.2: Server preflight / resolution / finalize infrastructure
 
+
+### Task 6.17.2.1: Task 6.17.2.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.17.2.2
+
+
+
+## Completed Tasks
+
+### Task 6.17.2.1: Task 6.17.2.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.17.2.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/server/src/routes/internal/entities/entityCrudRouter.ts b/server/src/routes/internal/entities/entityCrudRouter.ts
index 32fd2d5b..6715398e 100644
--- a/server/src/routes/internal/entities/entityCrudRouter.ts
+++ b/server/src/routes/internal/entities/entityCrudRouter.ts
@@ -7,7 +7,7 @@ import {
 } from '../../helpers/dataController.js'
 import { validateRequest } from '../../../middlewares/validateRequest.js'
 import { entityBodySchema } from '../../schemas/entitySchemas.js'
-import { ERROR_MESSAGES } from './entityConstants.js'
+import { ENTITY_DELETE_ROUTE_SEGMENTS, ERROR_MESSAGES } from './entityConstants.js'
 import { handleRouteError } from './entityErrorHandler.js'
 import { validateEntityId } from './entityValidators.js'
 import { sanitizeEntityDataForCreate, sanitizeEntityDataForUpdate } from './entitySanitizers.js'
@@ -31,6 +31,11 @@ import {
   applyAnnotationShapeUiSlotNormalization,
 } from './entityCrudRouterAnnotationBody.js'
 import { registerEntityCrudReadRoutes } from '
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
