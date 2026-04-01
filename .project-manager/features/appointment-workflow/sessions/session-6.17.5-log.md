# Session 6.17.5: Entity-policy rollout + documentation


### Task 6.17.5.1: Task 6.17.5.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.5.2



## Completed Tasks

### Task 6.17.5.1: Task 6.17.5.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.5.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (12): `.project-manager/features/appointment-workflow/across-ladder.json`, `.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md`, `server/src/routes/internal/entities/entityConstants.ts`, `server/src/routes/internal/entities/entityCrudRouter.ts`, `server/src/services/entityDelete/dependencyDeleteRegistry.ts`, `.project-manager/features/appointment-workflow/sessions/task-6.17.5.1-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.17.5.1-planning.md`, `server/src/services/annotations/countAnnotationShapeDeleteDependencies.ts`, `server/src/services/blockShapes/`, `server/src/services/entityDelete/strategies/annotationShapeDependencyDeleteStrategy.ts`, `server/src/services/entityDelete/strategies/blockShapeDependencyDeleteStrategy.ts`

### `git diff --stat HEAD`

```text
.../features/appointment-workflow/across-ladder.json  |  2 +-
 .../sessions/session-6.17.5-guide.md                  |  2 +-
 .../sessions/session-6.17.5-log.md                    | 18 ++++++++++++++++++
 .../src/routes/internal/entities/entityConstants.ts   |  5 ++++-
 .../src/routes/internal/entities/entityCrudRouter.ts  | 19 +++++++++++--------
 .../services/entityDelete/dependencyDeleteRegistry.ts |  4 ++++
 6 files changed, 39 insertions(+), 11 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/appointment-workflow/across-ladder.json b/.project-manager/features/appointment-workflow/across-ladder.json
index c3f7c4e7..cb08bcea 100644
--- a/.project-manager/features/appointment-workflow/across-ladder.json
+++ b/.project-manager/features/appointment-workflow/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "appointment-workflow",
-  "derivedAt": "2026-04-01T23:05:09.793Z",
+  "derivedAt": "2026-04-01T23:07:03.952Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "6.2",
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md
index 4f2041a4..8e61bdc5 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 6.17.5.1: [Task Name]
+- [x] #### Task 6.17.5.1: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md
index 45d85722..a806d438 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md
@@ -1,2 +1,20 @@
 # Session 6.17.5: Entity-policy rollout + documentation
 
+
+### Task 6.17.5.1: Task 6.17.5.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.17.5.2
+
+
+
+## Completed Tasks
+
+### Task 6.17.5.1: Task 6.17.5.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.17.5.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/server/src/routes/internal/entities/entityConstants.ts b/server/src/routes/internal/entities/entityConstants.ts
index 681a7566..f6491607 100644
--- a/server/src/routes/internal/entities/entityConstants.ts
+++ b/server/src/routes/internal/entities/entityConstants.ts
@@ -33,10 +33,13 @@ export const ERROR_MESSAGES = {
   /** DELETE annotation shape blocked by referencing annotation instances */
   ANNOTATION_SHAPE_IN_USE: 'Annotation shape is in use',
   ANNOTATION_SHAPE_IN_USE_DETAILS:
-    'Cannot delete this annotation shape because {dependentCount} annotation instance(s) still reference it. Remove or reassign those instances first.',
+    'Cannot delete this annotation shape because {annotationInstanceCount} annotation instance(s) reference it and {validAnnotationAssignmentChildCount} valid annotation assignment link(s) use it on the annotation side. Remove or reassign those records first.',
   /** FK violation after pre-count (rare race): omit exact count */
   ANNOTATION_SHAPE_IN_USE_DETAILS_RACE:
     'Cannot delete this annotation shape because one or more annotation instances still reference it. Remove or reassign those instances first.',
+  BLOCK_SHAPE_IN_USE: 'Block shape is in use',
+  BLOCK_SHAPE_IN_USE_DETAILS:
+    'Cannot delete this block shape because it is still referenced by {blockInstanceCount} block instance(s), {validBookingCascadeCount} valid booking cascade link(s), {validPartCascadeParentCount} valid part cascade link(s) as parent, {validAnnotationAssignmentParentCount} valid annotation assignment link(s) as parent block, and {validEventCascadeParentCount} valid event cascade link(s) as parent. Remove or reassign those records first.',
   PART_SHAPE_IN_USE: 'Part shape is in use',
   PART_SHAPE_IN_USE_DETAILS:
     'Cannot delete this part shape because it is still referenced by {partInstanceCount} part instance(s), {validPartCascadeCount} valid part cascade link(s), and {validPricingCascadeCount} pricing cascade link(s). Remove or reassign those records first.',
diff --git a/server/src/routes/internal/entities/entityCrudRouter.ts b/server/src/routes/internal/entities/entityCrudRouter.ts
index 744e5987..be563359 100644
--- a/server/src/routes/internal/entities/entityCrudRouter.ts
+++ b/server/src/routes/internal/entities/entityCrudRouter.ts
@@ -19,7 +19,7 @@ import {
   syncAnnotationInstanceContentRows,
 } from '../../../services/annotations/annotationInstanceContentSync.js'
 import type { AnnotationContentRow } from '@shared/types/annotationContentRow.js'
-import { countAnnotationInstancesForShape } from '../../../services/annotations/countAnnotationInstancesForShape.js'
+import { countAnnotationShapeDeleteDependencies } from '../../../services/annotations/countAnnotationShapeDeleteDependencies.js'
 import { countPartShapeDeleteDependencies } from '../../../services/partShapes/countPartShapeDeleteDependencies.js'
 import { getModelAttributes } from '../../../utils/sequelizeHelpers.js'
 import { createLogger } from '../../../utils/logger.js'
@@ -363,20 +363,23 @@ router.delete(
           sendBadRequest(res, idValidation.error, idValidation.details?.message as string, entityId)
           return
         }
-        const dependentCount = await countAnnotationInstancesForShape(entityId)
-        if (dependentCount > 0) {
-          logger.warn('Annotation shape delete blocked: instances still reference shape', {
+        const annotationShapeDependencyCounts = await countAnnotationShapeDeleteDependencies(entityId)
+        if (annotationShapeDependencyCounts.totalCount > 0) {
+          logger.warn('Annotation shape delete blocked: dependent records still reference shape', {
             shapeId: entityId,
-            dependentCount,
+            ...annotationShapeDependencyCounts,
           })
           res.status(HTTP_STATUS_CODES.CONFLICT).json({
             error: ERROR_MESSAGES.ANNOTATION_SHAPE_IN_USE,
             details: ERROR_MESSAGES.ANNOTATION_SHAPE_IN_USE_DETAILS.replace(
-              '{dependentCount}',
-              String(dependentCount)
+              '{annotationInstanceCount}',
+              String(annotationShapeDependencyCounts.annotationInstanceCount)
+            ).replace(
+              '{validAnnotationAssignmentChildCount}',
+              String(annotationShapeDependencyCounts.validAnnotationAssignmentChildCount)
             ),
             shapeId: entityId,
-            dependentCount,
+            ...annotationShapeDependencyCounts,
           })
           return
         }
diff --git a/server/src/services/entityDelete/dependencyDeleteRegistry.ts b/server/src/services/entityDelete/dependencyDeleteRegistry.ts
index e3de37a0..6b17dd49 100644
--- a/server/src/services/entityDelete/dependencyDeleteRegistry.ts
+++ b/server/src/services/entityDelete/dependencyDeleteRegistry.ts
@@ -1,9 +1,13 @@
 import { ENTITY_KEYS } from '../../constants/entities.js'
 import type { DependencyDeleteStrategy } from './dependencyDeleteStrategyTypes.js'
+import { annotationShapeDependencyDeleteStrategy } from './strategies/annotationShapeDependencyDeleteStrategy.js'
+import { blockShapeDependencyDeleteStrategy } from './strategies/blockShapeDependencyDeleteStrategy.js'
 import { partShapeDependencyDeleteStrategy } from './strategies/partShapeDependencyDeleteStrategy.js'
 
 const strategies: Record<string, DependencyDeleteStrategy> = {
   [ENTITY_KEYS.PART_SHAPE]: partShapeDependencyDeleteStrategy,
+  [ENTITY_KEYS.BLOCK_SHAPE]: blockShapeDependencyDeleteStrategy,
+  [ENTITY_KEYS.ANNOTATION_SHAPE]: annotationShapeDependencyDeleteStrategy,
 }
 
 export function getDependencyDeleteStrategy(entityType: string): DependencyDeleteStrategy | undefined {
```
<!-- /harness:anchor:commit-preview -->
