# Session 20.1.2: ** Block instance three-property alignment and legacy cleanup -- migration: ADD `orchestrator` (bool), ADD `wizardVisible` (bool) to `block_instances`; DROP `bookingMode`, `differential`, `differentialEventRoleOverrides` from `block_instances`; DROP `composable`, `isStateControl`, `canHaveParts` from `block_shapes`; update both Sequelize models; update `BlockInstanceEntity` and `BlockShapeEntity` client types.


### Task 20.1.2.1: Task 20.1.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.2.2



## Completed Tasks

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

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (42): `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md`, `client/src/components/admin/InstanceBulkEditModal.vue`, `client/src/components/admin/generic/fields/FieldRenderer.vue`, `client/src/components/admin/generic/fields/fieldRendererComponentMap.ts`, `client/src/components/booking/dev/InstancesPanel.vue`, `client/src/composables/admin/useInstanceDragAndDropGrouped.ts`, `client/src/composables/admin/useInstanceFiltering.ts`, `client/src/composables/booking/useAvailabilityLogic.ts`, `client/src/composables/booking/useDevPanelsComputed.ts`, `client/src/constants/bookingMode.ts`, `client/src/constants/entityFieldConstants.ts`, `client/src/constants/primitives.ts`, `client/src/constants/statusButtonLabels.ts`, `client/src/types/booking/devPanelsComputed.ts`, `client/src/types/booking/propertyDetailsLogic.ts`, `client/src/types/entities.ts`, `client/src/types/forms/fieldComponent.ts`, `client/src/types/transformers/bookingData.ts`, `client/src/types/wizardCore.ts`, `client/src/utils/booking/availabilityDifferentialOverride.ts`, `client/src/utils/booking/partFinalizer.ts`, `client/src/utils/fieldContext/resolveEntityFieldValue.ts`, `client/src/utils/forms/fieldComponentDispatcher.ts`, `client/src/utils/forms/fieldPanelFromKey.ts`, `client/src/utils/transformers/apiEntityFieldNormalization.ts`, `client/src/utils/transformers/appointmentToWizardHelpers.ts`, `client/src/utils/transformers/entityTransformers.ts`, `client/src/utils/transformers/globalToBookingTransformer.ts`, `client/src/utils/transformers/globalToBookingTransformerBlocks.ts`, `client/src/utils/transformers/transformerPrimitiveConvert.ts`, `server/src/db/models/booking/appointment.ts`, `server/src/db/models/booking/block_instance.ts`, `server/src/db/models/booking/block_instance_version.ts`, `server/src/routes/internal/entities/entityConstants.ts`, `server/src/routes/internal/entities/entitySanitizers.ts`, `server/src/services/appointmentSnapshotLoader.ts`, `server/src/services/instanceVersioning.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.2.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.2.1-planning.md`, `server/src/db/migrations/20260432_000059_block_instance_three_property_columns.mjs`

### `git diff --stat HEAD`

```text
.../across-ladder.json                             |  2 +-
 .../sessions/session-20.1.2-guide.md               | 41 ++++++++++++++------
 .../sessions/session-20.1.2-log.md                 | 32 +++++++++++++++
 .../src/components/admin/InstanceBulkEditModal.vue |  8 ++--
 .../admin/generic/fields/FieldRenderer.vue         |  2 -
 .../generic/fields/fieldRendererComponentMap.ts    |  3 --
 .../src/components/booking/dev/InstancesPanel.vue  |  4 +-
 .../admin/useInstanceDragAndDropGrouped.ts         |  9 ++---
 .../src/composables/admin/useInstanceFiltering.ts  | 11 ++----
 .../composables/booking/useAvailabilityLogic.ts    |  3 +-
 .../composables/booking/useDevPanelsComputed.ts    |  4 +-
 client/src/constants/bookingMode.ts                |  3 +-
 client/src/constants/entityFieldConstants.ts       | 13 +++----
 client/src/constants/primitives.ts                 |  2 +-
 client/src/constants/statusButtonLabels.ts         | 12 +-----
 client/src/types/booking/devPanelsComputed.ts      |  5 +--
 client/src/types/booking/propertyDetailsLogic.ts   |  2 +-
 client/src/types/entities.ts                       | 12 +++---
 client/src/types/forms/fieldComponent.ts           |  3 --
 client/src/types/transformers/bookingData.ts       |  8 +---
 client/src/types/wizardCore.ts                     |  4 +-
 .../booking/availabilityDifferentialOverride.ts    |  9 ++---
 client/src/utils/booking/partFinalizer.ts          | 34 +++-------------
 .../utils/fieldContext/resolveEntityFieldValue.ts  |  8 +---
 client/src/utils/forms/fieldComponentDispatcher.ts |  5 ---
 client/src/utils/forms/fieldPanelFromKey.ts        |  4 --
 .../transformers/apiEntityFieldNormalization.ts    | 30 ++++++++-------
 .../transformers/appointmentToWizardHelpers.ts     |  9 +++--
 .../src/utils/transformers/entityTransformers.ts   | 17 +++-----
 .../transformers/globalToBookingTransformer.ts     |  6 +--
 .../globalToBookingTransformerBlocks.ts            | 45 ++++++++--------------
 .../transformers/transformerPrimitiveConvert.ts    |  5 +--
 server/src/db/models/booking/appointment.ts        |  3 +-
 server/src/db/models/booking/block_instance.ts     | 32 +++++++--------
 .../db/models/booking/block_instance_version.ts    | 15 ++++++--
 .../routes/internal/entities/entityConstants.ts    |  7 ++--
 .../routes/internal/entities/entitySanitizers.ts   | 32 ++-------------
 server/src/services/appointmentSnapshotLoader.ts   |  3 +-
 server/src/services/instanceVersioning.ts          |  9 +++--
 39 files changed, 201 insertions(+), 255 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index 874dfa4d..0343a821 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-02T15:01:27.933Z",
+  "derivedAt": "2026-04-02T15:04:22.240Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md
index 106eb5d3..7804cae4 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md
@@ -52,19 +52,38 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 20.1.2.1: [Task Name]
-**Goal:** [Task goal]
+- [x] - [x] #### Task 20.1.2.1: Block instance three-property columns
+**Goal:** Add `orchestrator` / `wizardVisible` to `block_instances`, remove legacy instance fields (`bookingMode`, `differential`, `differentialEventRoleOverrides`), and update the direct server/client consumers that break when those fields disappear.
 **Files:** 
-- [Files to work with]
-**Approach:** [Approach to take]
-**Checkpoint:** [What needs to be verified]
-
-- [ ] #### Task 20.1.2.2: [Task Name]
-**Goal:** [Task goal]
+- `server/src/db/migrations/` — new migration for `block_instances`
+- `server/src/db/models/booking/block_instance.ts`
+- `server/src/db/models/booking/block_instance_version.ts`
+- `server/src/services/instanceVersioning.ts`
+- `server/src/services/appointmentSnapshotLoader.ts`
+- `client/src/types/entities.ts`
+- `client/src/utils/transformers/entityTransformers.ts`
+- `client/src/utils/transformers/globalToBookingTransformerBlocks.ts`
+- `client/src/composables/admin/useInstanceFiltering.ts`
+- `client/src/utils/booking/appointmentSlotBuilder.ts`
+**Approach:** Author the `block_instances` migration first, then update the Sequelize model and direct versioning/client consumers in the same pass so removed fields are not left referenced.
+**Checkpoint:** `BlockInstance` / `BlockInstanceEntity` compile with `orchestrator` / `wizardVisible`; no direct reads of removed instance fields remain in touched code; client + server lint pass.
+
+- [ ] #### Task 20.1.2.2: Block shape legacy boolean cleanup
+**Goal:** Remove `composable`, `isStateControl`, and `canHaveParts` from `block_shapes`, then update model/client/runtime checks that still depend on those booleans.
 **Files:** 
-- [Files to work with]
-**Approach:** [Approach to take]
-**Checkpoint:** [What needs to be verified]
+- `server/src/db/migrations/` — drop legacy columns from `block_shapes`
+- `server/src/db/models/admin/block_shape.ts`
+- `server/src/routes/internal/entities/entityCrudRouter.ts`
+- `server/src/routes/internal/relationships/relationshipHelpersValidation.ts`
+- `server/src/utils/validateUserRoleBlockAlignmentPayload.ts`
+- `server/src/utils/userTypeMapping.ts`
+- `server/src/repositories/stateControlUserTypeBlockInstanceIds.ts`
+- `server/src/repositories/availabilityDifferentialAttendeeCleanup.ts`
+- `client/src/types/entities.ts`
+- `client/src/utils/eventAttendeeUtils.ts`
+- `client/src/utils/admin/eligibleUserRoleAlignmentBlockInstances.ts`
+**Approach:** Remove the shape booleans from schema/model, then re-home or remove direct runtime checks immediately so the app still has a coherent source of truth.
+**Checkpoint:** `BlockShape` / `BlockShapeEntity` no longer expose the removed booleans; touched runtime checks are updated; client + server lint pass.
 
 ---
 
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
index 229c10e1..96835b97 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-log.md
@@ -1,2 +1,34 @@
 # Session 20.1.2: ** Block instance three-property alignment and legacy cleanup -- migration: ADD `orchestrator` (bool), ADD `wizardVisible` (bool) to `block_instances`; DROP `bookingMode`, `differential`, `differentialEventRoleOverrides` from `block_instances`; DROP `composable`, `isStateControl`, `canHaveParts` from `block_shapes`; update both Sequelize models; update `BlockInstanceEntity` and `BlockShapeEntity` client types.
 
+
+### Task 20.1.2.1: Task 20.1.2.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.1.2.2
+
+
+
+## Completed Tasks
+
+### Task 20.1.2.1: Task 20.1.2.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.1.2.2
+
+
+
+### Task 20.1.2.1: Task 20.1.2.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.1.2.2
+
+<!-- end excerpt session -->
+### Task 20.1.2.1: Task 20.1.2.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.1.2.2
+
diff --git a/client/src/components/admin/InstanceBulkEditModal.vue b/client/src/components/admin/InstanceBulkEditModal.vue
index e4c08a70..f6c43aa6 100644
--- a/client/src/components/admin/InstanceBulkEditModal.vue
+++ b/client/src/components/admin/InstanceBulkEditModal.vue
@@ -55,8 +55,8 @@ const templateEntity = computed<GlobalEntity<'blockInstance'>>(() => {
       icon: '',
       allowMultiple: false,
       requiresUnitNumber: false,
-      differential: undefined as TernaryBoolean | undefined,
-      bookingMode: undefined as TernaryBoolean | undefined,
+      orchestrator: undefined as boolean | undefined,
+      wizardVisible: undefined as boolean | undefined,
       agentPermissions: undefined as TernaryBoolean | undefined,
       isMultiFamily: false,
       requiresAgent: false
@@ -79,8 +79,8 @@ const templateEntity = computed<GlobalEntity<'blockInstance'>>(() => {
       icon: '',
       allowMultiple: false,
       requiresUnitNumber: false,
-      differential: undefined,
-      bookingMode: undefined,
+      orchestrator: undefined,
+      wizardVisible: undefined,
       agentPermissions: undefined,
       isMultiFamily: false,
       requiresAgent: false
diff --git a/client/src/components/admin/generic/fields/FieldRenderer.vue b/client/src/components/admin/generic/fields/FieldRenderer.vue
index 9a3b3155..e1365fc2 100644
--- a/client/src/components/admin/generic/fields/FieldRenderer.vue
+++ b/client/src/components/admin/generic/fields/FieldRenderer.vue
@@ -39,7 +39,6 @@
  */
 import { computed, toRef, type ComputedRef } from 'vue'
 import type { GlobalEntityKey } from '@/constants/entities'
-import { FIELD_NAMES } from '@/constants/entityFieldConstants'
 import type { GlobalFieldKey } from '@/constants/primitives'
 import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
 import { useFieldValue } from '@/composables/useFieldValue'
@@ -164,7 +163,6 @@ const componentsWithLabel: Array<FieldComponent['type']> = [
   'icon',
   'primitive',
   'select',
-  FIELD_NAMES.DIFFERENTIAL_EVENT_ROLE_OVERRIDES,
 ]
 
 const fieldShowLabel = computed(() =>
diff --git a/client/src/components/admin/generic/fields/fieldRendererComponentMap.ts b/client/src/components/admin/generic/fields/fieldRendererComponentMap.ts
index b8c19f81..faa35243 100644
--- a/client/src/components/admin/generic/fields/fieldRendererComponentMap.ts
+++ b/client/src/components/admin/generic/fields/fieldRendererComponentMap.ts
@@ -3,9 +3,7 @@ import PrimitiveInputs from './PrimitiveInputs.vue'
 import SelectInputs from './SelectInputs.vue'
 import RelationshipCollection from '../collections/RelationshipCollection.vue'
 import IconInput from './IconInput.vue'
-import DifferentialEventRoleOverridesField from './Differenti
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
