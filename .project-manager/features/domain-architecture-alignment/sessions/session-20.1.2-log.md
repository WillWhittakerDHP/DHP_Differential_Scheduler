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

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (4): `.project-manager/WORKFLOW_FRICTION_LOG.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md`, `client/src/utils/admin/statusButtonTogglePayloads.ts`

### `git diff --stat HEAD`

```text
.project-manager/WORKFLOW_FRICTION_LOG.md          | 73 ++++++++++++++++++++++
 .../sessions/session-20.1.2-guide.md               |  2 +-
 .../sessions/session-20.1.2-log.md                 | 16 ++++-
 .../src/utils/admin/statusButtonTogglePayloads.ts  |  2 +-
 4 files changed, 90 insertions(+), 3 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/WORKFLOW_FRICTION_LOG.md b/.project-manager/WORKFLOW_FRICTION_LOG.md
index ad90360e..ca4aa219 100644
--- a/.project-manager/WORKFLOW_FRICTION_LOG.md
+++ b/.project-manager/WORKFLOW_FRICTION_LOG.md
@@ -2072,3 +2072,76 @@ nextAction:
 - Session 20.1.1 is not marked as complete in phase guide
 - Session 20.1.2 cannot be started until Session 20.1.1 is complete
 - Complete Session 20.1.1 first with /session-end 20.1.1
+
+### 2026-04-02 — 20.1.2.2 — task — end — audit_failed
+
+- **reasonCodeRaw:** audit_failed
+- **reasonCodeNormalized:** audit_failed
+- **isFailureReason:** true
+- **tier:** task
+- **action:** end
+- **identifier:** 20.1.2.2
+- **featureName:** domain-architecture-alignment
+- **stepPath:** conflict_marker_guard, plan_mode_exit, resolve_run_tests, pre_work, test_goal_validation, run_tests, mid_work, comment_cleanup, readme_cleanup, deliverables_check, gap_analysis, planning_rollup, doc_rollup, commit_remaining, git, propagate_shared, verification_check, config_fix, end_audit
+
+- **Symptom:** Harness end failed (reasonCode=audit_failed).
+- **Context:** tier=task; identifier=20.1.2.2; featureName=domain-architecture-alignment
+
+nextAction:
+Fix audit warnings or errors per governance, then re-run this tier-end. Read the governance docs listed in deliverables FIRST.
+
+deliverables (excerpt):
+# Task Audit: 20.1.2.2
+
+**Overall Status:** WARN
+**Report:** .cursor/project-manager/features/domain-architecture-alignment/audits/task-20.1.2.2-audit.md
+
+*Note: Task audits run tier-task group (typecheck, loop-mutations, hardcoding, error-handling, naming-convention, security) with --changed-only.*
+
+## External Signals (captured)
+
+- **Location:** `.cursor/project-manager/features/domain-architecture-alignment/audits/external/task-20.1.2.2/2026-04-02T15-34-18Z`
+- **Copied:** 7 file(s)
+- **Missing:** 2 file(s) (signals not present yet)
+
+## Results Summary
+
+- ⚠️ **tier-quality**: warn (90/100)
+
+## Autofix
+
+Tier task: 0 script fix(es) applied, 1 agent directive(s). Affected files: 1.
+
+**Agent directives:**
+- Fix type errors reported in /Users/districthomepro/Bonsai/Differential_Scheduler/client/.audit-reports/typecheck/typecheck-audit.json. Address P0 pools first.
+
+---
+
+## 📋 Review Request
+
+**Please review the audit report with me:**
+
+📄 **Report File:** `/Users/districthomepro/Bonsai/Differential_Scheduler/.cursor/project-manager/features/domain-architecture-alignment/audits/task-20.1.2.2-audit.md`
+
+**Questions to consider:**
+- Are the audit findings accurate?
+- Are there false positives or missing issues?
+- How can we improve the audit checks?
+- What workflow refinements do the audits suggest?
+
+*The audit report file should be open in your editor. Let's review it together to refine the workflow command tool.*
+
+---
+
+## Architecture context (harness-injected)
+
+## 1. System overview
+
+Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:
+
+- **Public booking users** — wizard-style scheduling and property/availability flows.
+- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.
+
+TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often b
+
+…(truncated)
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md
index c29d2b69..ec88a125 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md
@@ -68,7 +68,7 @@ These sections contain session-specific content:
 **Approach:** Author the `block_instances` migration first, then update the Sequelize model and direct versioning/client consumers in the same pass so removed fields are not left referenced.
 **Checkpoint:** `BlockInstance` / `BlockInstanceEntity` compile with `orchestrator` / `wizardVisible`; no direct reads of removed instance fields remain in touched code; client + server lint pass.
 
-- [x] #### Task 20.1.2.2: Block shape legacy boolean cleanup
+- [x] - [x] #### Task 20.1.2.2: Block shape legacy boolean cleanup
 **Goal:** Remove `composable`, `isStateControl`, and `canHaveParts` from `block_shapes`, then update model/client/runtime checks that still depend on those booleans.
 **Files:** 
 - `server/src/db/migrations/` — drop legacy columns from `block_shapes`
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
index 1a5e9c95..511750f2 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
@@ -19,6 +19,14 @@
 
 
 
+### Task 20.1.2.2: Task 20.1.2.2 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.1.2.3
+
+
+
 ### Task 20.1.2.1: Task 20.1.2.1 ✅
 **Goal:** Task completed
 
@@ -121,4 +129,10 @@ index 6438b21c..cf0f7659 100644
 --- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
 +++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+### Task 20.1.2.2: Task 20.1.2.2 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.1.2.3
+
diff --git a/client/src/utils/admin/statusButtonTogglePayloads.ts b/client/src/utils/admin/statusButtonTogglePayloads.ts
index 3c80a8e7..61912144 100644
--- a/client/src/utils/admin/statusButtonTogglePayloads.ts
+++ b/client/src/utils/admin/statusButtonTogglePayloads.ts
@@ -60,7 +60,7 @@ export function buildTernaryTogglePayloads(
 }
 
 export function buildBooleanTogglePayloads<GE extends GlobalEntityKey>(
-  entityKey: GE,
+  _entityKey: GE,
   entity: GlobalEntity<GE>,
   fieldKey: GlobalFieldKey<GE>,
   currentRaw: unknown
```
<!-- /harness:anchor:commit-preview -->
