# Session 20.1.2: ** Block instance three-property alignment and legacy cleanup -- migration: ADD `orchestrator` (bool), ADD `wizardVisible` (bool) to `block_instances`; DROP `bookingMode`, `differential`, `differentialEventRoleOverrides` from `block_instances`; DROP `composable`, `isStateControl`, `canHaveParts` from `block_shapes`; update both Sequelize models; update `BlockInstanceEntity` and `BlockShapeEntity` client types.


### Task 20.1.2.1: Task 20.1.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.2.2



## Completed Tasks

### Task 20.1.2.2: Task 20.1.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.2.3



### Task 20.1.2.2: Task 20.1.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.2.3



### Task 20.1.2.1: Task 20.1.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.2.2



### Task 20.1.2.1: Task 20.1.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.2.2

<!-- end excerpt session -->
### Task 20.1.2.1: Task 20.1.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.2.2



### Task 20.1.2.2: Task 20.1.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.2.3


## Harness: commit preview (in-scope diff)

Paths (43): `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md`, `client/src/components/admin/generic/EntityCard.vue`, `client/src/components/admin/generic/collections/RelationshipCollection.vue`, `client/src/components/booking/steps/ServiceSelectionStep.vue`, `client/src/composables/admin/useEntityCardFormSetup.ts`, `client/src/composables/admin/useInstanceGrouping.ts`, `client/src/composables/admin/useSelectFiltering.ts`, `client/src/composables/entityCrud/usePrimitiveMutation.ts`, `client/src/configs/field/display/appliedDisplay/blockShapeDisplays.ts`, `client/src/constants/entitySchemaDefaults.ts`, `client/src/constants/statusButtonLabels.ts`, `client/src/types/entities.ts`, `client/src/types/transformers/bookingData.ts`, `client/src/utils/admin/blockInstancePartsTotalsResolution.ts`, `client/src/utils/admin/blockInstanceShape.ts`, `client/src/utils/admin/booleanInputNewEntityToggle.ts`, `client/src/utils/admin/eligibleUserRoleAlignmentBlockInstances.ts`, `client/src/utils/admin/statusButtonTogglePayloads.ts`, `client/src/utils/admin/userTypeBlockInstances.ts`, `client/src/utils/blockInstanceUtils.ts`, `client/src/utils/booking/blockInstanceComposable.ts`, `client/src/utils/componentEntity/blockCompositionDomain.ts`, `client/src/utils/eventAttendeeUtils.ts`, `client/src/utils/instanceComponentUtils.ts`, `client/src/utils/transformers/composePropertyValue.ts`, `client/src/utils/transformers/globalToBookingTransformer.ts`, `server/src/db/models/admin/adminPrimitiveMetadata.ts`, `server/src/db/models/admin/block_shape.ts`, `server/src/db/models/booking/event_shape_attendee.ts`, `server/src/repositories/availabilityDifferentialAttendeeCleanup.ts`, `server/src/repositories/stateControlUserTypeBlockInstanceIds.ts`, `server/src/routes/internal/entities/entityConstants.ts`, `server/src/routes/internal/entities/entityCrudRouter.ts`, `server/src/routes/internal/entities/entityErrorHandler.ts`, `server/src/routes/internal/relationships/relationshipConstants.ts`, `server/src/routes/internal/relationships/relationshipCrudRouter.ts`, `server/src/routes/internal/relationships/relationshipHelpersValidation.ts`, `server/src/utils/userTypeMapping.ts`, `server/src/utils/validateUserRoleBlockAlignmentPayload.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.2.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.2.2-planning.md`, `server/src/db/migrations/20260432_000060_drop_block_shape_legacy_boolean_columns.mjs`

### `git diff --stat HEAD`

```text
.../sessions/session-20.1.2-guide.md               |  2 +-
 .../sessions/session-20.1.2-log.md                 | 15 +++++++++++
 client/src/components/admin/generic/EntityCard.vue |  3 +--
 .../generic/collections/RelationshipCollection.vue |  7 ++---
 .../booking/steps/ServiceSelectionStep.vue         |  2 +-
 .../composables/admin/useEntityCardFormSetup.ts    | 11 +-------
 .../src/composables/admin/useInstanceGrouping.ts   | 14 +++++-----
 client/src/composables/admin/useSelectFiltering.ts |  9 +++----
 .../composables/entityCrud/usePrimitiveMutation.ts | 17 +-----------
 .../display/appliedDisplay/blockShapeDisplays.ts   | 30 ----------------------
 client/src/constants/entitySchemaDefaults.ts       |  2 +-
 client/src/constants/statusButtonLabels.ts         |  3 ---
 client/src/types/entities.ts                       |  3 ---
 client/src/types/transformers/bookingData.ts       |  3 ---
 .../admin/blockInstancePartsTotalsResolution.ts    |  7 +++--
 client/src/utils/admin/blockInstanceShape.ts       | 14 +++++++---
 .../src/utils/admin/booleanInputNewEntityToggle.ts | 10 +-------
 .../eligibleUserRoleAlignmentBlockInstances.ts     |  4 +--
 .../src/utils/admin/statusButtonTogglePayloads.ts  | 25 +-----------------
 client/src/utils/admin/userTypeBlockInstances.ts   |  9 ++++---
 client/src/utils/blockInstanceUtils.ts             | 24 +++++++----------
 .../src/utils/booking/blockInstanceComposable.ts   |  4 +--
 .../componentEntity/blockCompositionDomain.ts      | 10 +++-----
 client/src/utils/eventAttendeeUtils.ts             | 17 ++++++------
 client/src/utils/instanceComponentUtils.ts         |  8 +++---
 .../src/utils/transformers/composePropertyValue.ts | 13 +++-------
 .../transformers/globalToBookingTransformer.ts     |  3 ---
 .../src/db/models/admin/adminPrimitiveMetadata.ts  |  2 +-
 server/src/db/models/admin/block_shape.ts          | 29 +--------------------
 .../src/db/models/booking/event_shape_attendee.ts  |  2 +-
 .../availabilityDifferentialAttendeeCleanup.ts     | 12 ++++-----
 .../stateControlUserTypeBlockInstanceIds.ts        |  2 +-
 .../routes/internal/entities/entityConstants.ts    |  9 -------
 .../routes/internal/entities/entityCrudRouter.ts   | 10 --------
 .../routes/internal/entities/entityErrorHandler.ts | 26 +------------------
 .../relationships/relationshipConstants.ts         |  3 ++-
 .../relationships/relationshipCrudRouter.ts        | 17 +++++++++---
 .../relationships/relationshipHelpersValidation.ts | 28 +++++++++-----------
 server/src/utils/userTypeMapping.ts                | 12 ++++-----
 .../utils/validateUserRoleBlockAlignmentPayload.ts | 10 ++++----
 40 files changed, 139 insertions(+), 292 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md
index 7804cae4..c29d2b69 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md
@@ -68,7 +68,7 @@ These sections contain session-specific content:
 **Approach:** Author the `block_instances` migration first, then update the Sequelize model and direct versioning/client consumers in the same pass so removed fields are not left referenced.
 **Checkpoint:** `BlockInstance` / `BlockInstanceEntity` compile with `orchestrator` / `wizardVisible`; no direct reads of removed instance fields remain in touched code; client + server lint pass.
 
-- [ ] #### Task 20.1.2.2: Block shape legacy boolean cleanup
+- [x] #### Task 20.1.2.2: Block shape legacy boolean cleanup
 **Goal:** Remove `composable`, `isStateControl`, and `canHaveParts` from `block_shapes`, then update model/client/runtime checks that still depend on those booleans.
 **Files:** 
 - `server/src/db/migrations/` — drop legacy columns from `block_shapes`
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
index 6438b21c..cf0f7659 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
@@ -11,6 +11,14 @@
 
### Task 20.1.2.2: Task 20.1.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.2.3





## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/features/domain-architecture-alignment/phases/phase-20.1-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.2.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.2.2-planning.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.1.2/`

### `git diff --stat HEAD`

```text
.../phases/phase-20.1-log.md                       |   8 +
 .../sessions/session-20.1.2-handoff.md             |  25 +-
 .../sessions/session-20.1.2-log.md                 |   2 +
 .../sessions/session-20.1.2-planning.md            | 364 ++++++++-------------
 .../sessions/task-20.1.2.1-planning.md             | 174 ----------
 .../sessions/task-20.1.2.2-planning.md             | 187 -----------
 6 files changed, 160 insertions(+), 600 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-log.md
index ace6ce16..e18e4df1 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-log.md
@@ -25,6 +25,14 @@
 
 
 
+### Session 20.1.2: Block instance three-property alignment and legacy cleanup ✅
+**Completed:** 2026-04-02
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** ** Block instance three-property alignment and legacy cleanup -- migration: ADD `orchestrator` (bool), ADD `wizardVisible` (bool) to `block_instances`; DROP `bookingMode`, `differential`, `differentialEventRoleOverrides` from `block_instances`; DROP `composable`, `isStateControl`, `canHaveParts` from `block_shapes`; update both Sequelize models; update `BlockInstanceEntity` and `BlockShapeEntity` client types.
+
+
+
 ### Session 20.1.1: Block shape type enum rename ✅
 **Completed:** 2026-04-02
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-handoff.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-handoff.md
index 59997eff..f7c9515c 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-handoff.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-handoff.md
@@ -10,6 +10,18 @@
 
 ---
 
+## Across ladder (harness)
+
+_Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._
+
+- **Feature:** `domain-architecture-alignment` · **Source:** session_end · **Derived:** 2026-04-02T15:38:07.749Z
+- **Phases on disk (6):** 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
+- **Focus phase:** `20.1` · **Next phase across:** `20.2` → `/phase-start 20.2`
+- **Focus session:** `20.1.2` · **Session 2/3 in phase** · **Next session across:** `20.1.3` → `/session-start 20.1.3`
+- **Tasks in session (detected):** 2 · **Next task across:** `20.1.2.1` → `/task-start` / cascade
+- **Manifest:** `.project-manager/features/domain-architecture-alignment/across-ladder.json`
+<!-- harness-across-ladder:end -->
+
 ## Current Status
 
 **Last Completed:** Task 
@@ -29,19 +41,6 @@ Completed Task
 **What you need to start:**
 - Begin Session 20.1.3
 
-<!-- harness-across-ladder:start -->
-## Across ladder (harness)
-
-_Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._
-
-- **Feature:** `domain-architecture-alignment` · **Source:** session_end · **Derived:** 2026-04-02T15:38:07.749Z
-- **Phases on disk (6):** 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
-- **Focus phase:** `20.1` · **Next phase across:** `20.2` → `/phase-start 20.2`
-- **Focus session:** `20.1.2` · **Session 2/3 in phase** · **Next session across:** `20.1.3` → `/session-start 20.1.3`
-- **Tasks in session (detected):** 2 · **Next task across:** `20.1.2.1` → `/task-start` / cascade
-- **Manifest:** `.project-manager/features/domain-architecture-alignment/across-ladder.json`
-<!-- harness-across-ladder:end -->
-
 
 ## Document Structure Guidelines
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
index 0fa3804d..855c26db 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
@@ -301,3 +301,5 @@ index 3c80a8e7..61912144 100644
 ## Story
+
 **This session delivers** block-instance three-property schema alignment and block-shape legacy cleanup across migrations, Sequelize models, and directly impacted type/validation consumers **so that** later passes can treat `block_instances` as the home of `composite` / `orchestrator` / `wizardVisible` without carrying legacy shape booleans or stale instance fields.
 **Estimated size:** M
 
 ---
-## Architecture context (harness-injected)
-
-## 1. System overview
 
-Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:
-
-- **Public booking users** — wizard-style scheduling and property/availability flows.
-- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.
-
-TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often batch-prefetched (e.g. router navigation guards).
+## Analysis
 
----
+- **Problem / why now:** Session 20.1.1 renamed the type vocabulary; 
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
