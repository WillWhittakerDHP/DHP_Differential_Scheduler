# Session 20.3.4: — Segment manager relocation (§8.3 #4):** Move or embed **segment / event-instance** management from `InstancesTab` **Events** surface into **event block-instance** editing (per-instance segment list, links to `eventInstance` CRUD); keep API alignment with **20.2**.


### Task 20.3.4.1: Task 20.3.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.4.2



## Completed Tasks

### Task 20.3.4.1: Task 20.3.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.4.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (11): `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md`, `client/src/components/admin/generic/EntityCardContent.vue`, `client/src/utils/admin/blockInstanceShape.ts`, `client/tsconfig.tsbuildinfo`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.4.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.4.1-planning.md`, `client/src/components/admin/generic/EventBlockInstanceSegmentsPanel.vue`, `client/src/composables/admin/useBlockInstanceEventSegments.ts`, `client/src/types/admin/blockInstanceEventSegments.ts`

### `git diff --stat HEAD`

```text
.../across-ladder.json                              |  2 +-
 .../sessions/session-20.3.4-guide.md                |  2 +-
 .../sessions/session-20.3.4-log.md                  | 18 ++++++++++++++++++
 .../components/admin/generic/EntityCardContent.vue  | 21 +++++++++++++++++++--
 client/src/utils/admin/blockInstanceShape.ts        |  7 +++++--
 client/tsconfig.tsbuildinfo                         |  1 -
 6 files changed, 44 insertions(+), 7 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index 28a2f66f..9f3be3ef 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-02T20:24:16.194Z",
+  "derivedAt": "2026-04-02T20:27:07.204Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md
index 22cddceb..668c4b29 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 20.3.4.1: [Task Name]
+- [x] #### Task 20.3.4.1: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
index b8056208..17f1218c 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
@@ -1,2 +1,20 @@
 # Session 20.3.4: — Segment manager relocation (§8.3 #4):** Move or embed **segment / event-instance** management from `InstancesTab` **Events** surface into **event block-instance** editing (per-instance segment list, links to `eventInstance` CRUD); keep API alignment with **20.2**.
 
+
+### Task 20.3.4.1: Task 20.3.4.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.3.4.2
+
+
+
+## Completed Tasks
+
+### Task 20.3.4.1: Task 20.3.4.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.3.4.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/client/src/components/admin/generic/EntityCardContent.vue b/client/src/components/admin/generic/EntityCardContent.vue
index 130cf004..cb863617 100644
--- a/client/src/components/admin/generic/EntityCardContent.vue
+++ b/client/src/components/admin/generic/EntityCardContent.vue
@@ -3,20 +3,24 @@
   PATTERN: Child component that receives all necessary props for rendering form fields and actions
 -->
 <script setup lang="ts">
+import { computed, type ComputedRef } from 'vue'
 import type { FieldsByLocation } from '@/types/admin/conditionalFieldVisibility'
 import FieldRenderer from './fields/FieldRenderer.vue'
 import AnnotationContentEditor from './fields/AnnotationContentEditor.vue'
 import EventInstanceTemplateRef from './fields/EventInstanceTemplateRef.vue'
 import ServiceAtomicEditor from './ServiceAtomicEditor.vue'
 import TimePriceAtomicPartLedgerEditor from './TimePriceAtomicPartLedgerEditor.vue'
+import EventBlockInstanceSegmentsPanel from './EventBlockInstanceSegmentsPanel.vue'
 import EntityCardSubPanels from './EntityCardSubPanels.vue'
+import { useAdmin } from '@/composables/admin/useAdmin'
+import { getBlockInstanceShapeProperties } from '@/utils/admin/blockInstanceShape'
+import { toGlobalEntityId } from '@/utils/globalEntity'
 import type { GlobalEntity } from '@/types/entities'
 import type { GlobalEntityKey } from '@/constants/entities'
 import type { GlobalFieldKey } from '@/constants/primitives'
 import type { FormContext } from 'vee-validate'
 import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
 import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
-import type { ComputedRef } from 'vue'
 import type { EntityCardSharedProps } from './entityCardConstants'
 
 interface Props extends EntityCardSharedProps {
@@ -40,7 +44,15 @@ interface Props extends EntityCardSharedProps {
   }
 }
 
-defineProps<Props>()
+const props = defineProps<Props>()
+
+const admin = useAdmin()
+const showEventSegments = computed((): boolean => {
+  if (props.entityKey !== 'blockInstance' || props.isNew) {
+    return false
+  }
+  return getBlockInstanceShapeProperties(admin, toGlobalEntityId(props.entityId)).isEventShape
+})
 </script>
 
 <template>
@@ -102,6 +114,11 @@ defineProps<Props>()
     :block-instance-id="entityId"
   />
 
+  <EventBlockInstanceSegmentsPanel
+    v-if="showEventSegments"
+    :block-instance-id="entityId"
+  />
+
   <div v-for="fieldKey in fieldsByLocation.directStacked" :key="fieldKey" class="mb-4">
     <FieldRenderer
       v-if="getFieldContext(fieldKey)"
diff --git a/client/src/utils/admin/blockInstanceShape.ts b/client/src/utils/admin/blockInstanceShape.ts
index d0da02f2..db48bfe9 100644
--- a/client/src/utils/admin/blockInstanceShape.ts
+++ b/client/src/utils/admin/blockInstanceShape.ts
@@ -9,6 +9,8 @@ interface BlockInstanceShapeFlags {
   composable: boolean
   /** Non-user shapes participate in part-instance totals (replaces shape canHaveParts). */
   canHaveParts: boolean
+  /** Block shape type is `event` — segment (eventInstance) editor on instance card. */
+  isEventShape: boolean
 }
 
 /**
@@ -20,16 +22,17 @@ export function getBlockInstanceShapeProperties(
 ): BlockInstanceShapeFlags {
   const blockInstance = adminComp.getEntity('blockInstance', toGlobalEntityId(entityIdValue))
   if (!blockInstance) {
-    return { composable: false, canHaveParts: false }
+    return { composable: false, canHaveParts: false, isEventShape: false }
   }
   const bi = blockInstance as GlobalEntity<'blockInstance'>
   const blockShape = adminComp.getEntity('blockShape', toGlobalEntityId(bi.blockShapeRef))
   if (!blockShape) {
-    return { composable: false, canHaveParts: false }
+    return { composable: false, canHaveParts: false, isEventShape: false }
   }
   const shape = blockShape as GlobalEntity<'blockShape'>
   return {
     composable: bi.composite === true,
     canHaveParts: shape.type !== BLOCK_SHAPE_TYPES.USER,
+    isEventShape: shape.type === BLOCK_SHAPE_TYPES.EVENT,
   }
 }
diff --git a/client/tsconfig.tsbuildinfo b/client/tsconfig.tsbuildinfo
deleted file mode 100644
index d91e28f0..00000000
--- a/client/tsconfig.tsbuildinfo
+++ /dev/null
@@ -1 +0,0 @@
-{"root":["./src/main.ts","./src/vite-env.d.ts","./src/@core/enums.ts","./src/@core/index.ts","./src/@core/initcore.ts","./src/@core/types.ts","./src/@core/composable/createurl.ts","./src/@core/composable/usecookie.ts","./src/@core/composable/usecustomizeroptions.ts","./src/@core/composable/usegenerateimagevariant.ts","./src/@core/composable/useresponsivesidebar.ts","./src/@core/composable/useskins.ts","./src/@core/libs/apex-chart/apexcharconfig.ts","./src/@core/stores/config.ts","./src/@core/utils/colorconverter.ts","./src/@core/utils/formatters.ts","./src/@core/utils/helpers.ts","./src/@core/utils/plugins.ts","./src/@core/utils/validators.ts","./src/@core/utils/vuetify.ts","./src/@layouts/config.ts","./src/@layouts/enums.ts","./src/@layouts/index.ts","./src/@layouts/symbols.ts","./src/@layouts/types.ts","./src/@layouts/utils.ts","./src/@layouts/plugins/casl.ts","./src/@layouts/stores/config.ts","./src/components/admin/dev/devpaneltypes.ts","./src/components/admin/generic/entitycardconstants.ts","./src/components/admin/generic/entitycardkeyboardconstants.ts","./src/components/admin/generic/fields/fieldrenderercomponentmap.ts","./src/components/admin/generic/fields/fieldtypes.ts","./src/components/booking/plugins/localstateplugin.ts","./src/components/booking/plugins/wizardstateplugin.ts","./src/components/booking/types/selectioncardtypes.ts","./src/composables/useaddressautocomplete.ts","./src/composables/useaddressautocompletemodelwatchers.ts","./src/composables/useaddressautocompleteselection.ts","./src/composables/useaddressautocomplete
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
