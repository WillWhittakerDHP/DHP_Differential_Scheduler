# Session 6.17.3: Reusable client delete wizard + composable/service


### Task 6.17.3.1: Task 6.17.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.3.2



## Completed Tasks

### Task 6.17.3.1: Task 6.17.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.3.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/WORKFLOW_FRICTION_LOG.md`, `.project-manager/features/appointment-workflow/across-ladder.json`, `.project-manager/features/appointment-workflow/sessions/session-6.17.3-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.3-log.md`, `client/src/utils/api/apiExportBundleA.ts`, `client/src/utils/api/entityApi.ts`, `.project-manager/features/appointment-workflow/sessions/task-6.17.3.1-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.17.3.1-planning.md`, `client/src/utils/api/entityDeleteContractApi.ts`

### `git diff --stat HEAD`

```text
.project-manager/WORKFLOW_FRICTION_LOG.md          | 63 ++++++++++++++++++++++
 .../appointment-workflow/across-ladder.json        |  2 +-
 .../sessions/session-6.17.3-guide.md               |  2 +-
 .../sessions/session-6.17.3-log.md                 | 18 +++++++
 client/src/utils/api/apiExportBundleA.ts           |  1 +
 client/src/utils/api/entityApi.ts                  | 21 ++++++++
 6 files changed, 105 insertions(+), 2 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/WORKFLOW_FRICTION_LOG.md b/.project-manager/WORKFLOW_FRICTION_LOG.md
index 21c4e1ad..5c413e52 100644
--- a/.project-manager/WORKFLOW_FRICTION_LOG.md
+++ b/.project-manager/WORKFLOW_FRICTION_LOG.md
@@ -1449,3 +1449,66 @@ If you are not already using this model, consider switching before proceeding.
 *Strong implementation focus for session work*
 If you are not already using this model, consider switching before proceeding.
 ---
+
+### 2026-04-01 — 6.17.3 — session — start — harness_plugin_advisory
+
+- **reasonCodeRaw:** harness_plugin_advisory
+- **reasonCodeNormalized:** harness_plugin_advisory
+- **isFailureReason:** false
+- **tier:** session
+- **action:** start
+- **identifier:** 6.17.3
+- **featureName:** appointment-workflow
+- **stepPath:** —
+
+- **Symptom:** Harness appended plugin advisory to control-plane message (run success=true).
+- **Context:** runId=run_session_start_6_17_3_1775079156851; harnessAction=start
+
+---
+---
+**Recommended agent/model for this run:** Composer
+*Strong implementation focus for session work*
+If you are not already using this model, consider switching before proceeding.
+---
+
+### 2026-04-01 — 6.17.3.1 — task — start — harness_plugin_advisory
+
+- **reasonCodeRaw:** harness_plugin_advisory
+- **reasonCodeNormalized:** harness_plugin_advisory
+- **isFailureReason:** false
+- **tier:** task
+- **action:** start
+- **identifier:** 6.17.3.1
+- **featureName:** appointment-workflow
+- **stepPath:** —
+
+- **Symptom:** Harness appended plugin advisory to control-plane message (run success=true).
+- **Context:** runId=run_task_start_6_17_3_1_1775079212495; harnessAction=start
+
+---
+---
+**Recommended agent/model for this run:** Composer (fast)
+*Speed-optimized for focused task changes*
+If you are not already using this model, consider switching before proceeding.
+---
+
+### 2026-04-01 — 6.17.3.1 — task — start — harness_plugin_advisory
+
+- **reasonCodeRaw:** harness_plugin_advisory
+- **reasonCodeNormalized:** harness_plugin_advisory
+- **isFailureReason:** false
+- **tier:** task
+- **action:** start
+- **identifier:** 6.17.3.1
+- **featureName:** appointment-workflow
+- **stepPath:** —
+
+- **Symptom:** Harness appended plugin advisory to control-plane message (run success=true).
+- **Context:** runId=run_task_start_6_17_3_1_1775079356579; harnessAction=start
+
+---
+---
+**Recommended agent/model for this run:** Composer (fast)
+*Speed-optimized for focused task changes*
+If you are not already using this model, consider switching before proceeding.
+---
diff --git a/.project-manager/features/appointment-workflow/across-ladder.json b/.project-manager/features/appointment-workflow/across-ladder.json
index 2c94a722..f19afc97 100644
--- a/.project-manager/features/appointment-workflow/across-ladder.json
+++ b/.project-manager/features/appointment-workflow/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "appointment-workflow",
-  "derivedAt": "2026-04-01T21:28:46.089Z",
+  "derivedAt": "2026-04-01T21:32:38.103Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "6.2",
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.3-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.3-guide.md
index d4b44c49..0b5f91a8 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.3-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.3-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 6.17.3.1: [Task Name]
+- [x] #### Task 6.17.3.1: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.3-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.3-log.md
index 2e9c0f24..6139ea55 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.3-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.3-log.md
@@ -1,2 +1,20 @@
 # Session 6.17.3: Reusable client delete wizard + composable/service
 
+
+### Task 6.17.3.1: Task 6.17.3.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.17.3.2
+
+
+
+## Completed Tasks
+
+### Task 6.17.3.1: Task 6.17.3.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.17.3.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/client/src/utils/api/apiExportBundleA.ts b/client/src/utils/api/apiExportBundleA.ts
index 8ea8294c..72c89b26 100644
--- a/client/src/utils/api/apiExportBundleA.ts
+++ b/client/src/utils/api/apiExportBundleA.ts
@@ -1,4 +1,5 @@
 export * from './entityApi'
+export * from './entityDeleteContractApi'
 export * from './relationshipApi'
 export * from './relationshipApiHelpers'
 export * from './appointmentApi'
diff --git a/client/src/utils/api/entityApi.ts b/client/src/utils/api/entityApi.ts
index 5d17a2e9..246f9ac0 100644
--- a/client/src/utils/api/entityApi.ts
+++ b/client/src/utils/api/entityApi.ts
@@ -1,3 +1,12 @@
+/**
+ * WHY: Mirrors `ENTITY_DELETE_ROUTE_SEGMENTS` on the server (`entityConstants.ts`).
+ * Spec: `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md`
+ */
+const ENTITY_DELETE_SEGMENTS = {
+  PREFLIGHT: 'delete-preflight',
+  RESOLVE: 'delete-resolve',
+  FINALIZE: 'delete-finalize',
+} as const
 
 export function getEntityEndpoint(entityKey: string): string {
   return `/entities/${entityKey}`
@@ -18,3 +27,15 @@ export function getBulkPatchEndpoint(entityKey: string): string {
 export function getEntitiesBatchEndpoint(): string {
   return '/entities/batch'
 }
+
+export function getDeletePreflightEndpoint(entityKey: string, id: string): string {
+  return `/entities/${entityKey}/${id}/${ENTITY_DELETE_SEGMENTS.PREFLIGHT}`
+}
+
+export function getDeleteResolveEndpoint(entityKey: string, id: string): string {
+  return `/entities/${entityKey}/${id}/${ENTITY_DELETE_SEGMENTS.RESOLVE}`
+}
+
+export function getDeleteFinalizeEndpoint(entityKey: string, id: string): string {
+  return `/entities/${entityKey}/${id}/${ENTITY_DELETE_SEGMENTS.FINALIZE}`
+}
```
<!-- /harness:anchor:commit-preview -->
