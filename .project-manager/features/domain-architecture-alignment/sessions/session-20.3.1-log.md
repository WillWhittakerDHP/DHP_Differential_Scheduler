# Session 20.3.1: — Placement type editor (§8.3 #1):** Introduce or elevate **PlacementTypeEditor** (or equivalent) for `eventShape` **placementKind** / **anchorEdge**; align field displays (`eventShapeDisplays.ts`), forms, and admin copy with placement semantics; remove or reword differential-role-forward labels on shape surfaces.


### Task 20.3.1.1: Task 20.3.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.1.2



## Completed Tasks

### Task 20.3.1.1: Task 20.3.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.1.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (13): `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md`, `client/src/components/admin/generic/fields/FieldRenderer.vue`, `client/src/components/admin/generic/fields/fieldRendererComponentMap.ts`, `client/src/composables/admin/useEntityCardFieldConfiguration.ts`, `client/src/types/forms/fieldComponent.ts`, `client/src/utils/forms/fieldComponentDispatcher.ts`, `client/tsconfig.tsbuildinfo`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.1.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.1.1-planning.md`, `client/src/components/admin/generic/fields/EventShapePlacementFields.vue`, `server/src/db/migrations/20260432_000062_event_shape_placement_admin_metadata.mjs`

### `git diff --stat HEAD`

```text
.../domain-architecture-alignment/across-ladder.json   |  2 +-
 .../sessions/session-20.3.1-guide.md                   |  4 ++--
 .../sessions/session-20.3.1-log.md                     | 18 ++++++++++++++++++
 .../components/admin/generic/fields/FieldRenderer.vue  |  1 +
 .../admin/generic/fields/fieldRendererComponentMap.ts  |  2 ++
 .../admin/useEntityCardFieldConfiguration.ts           | 12 +++++++++---
 client/src/types/forms/fieldComponent.ts               |  2 ++
 client/src/utils/forms/fieldComponentDispatcher.ts     |  4 ++++
 client/tsconfig.tsbuildinfo                            |  1 -
 9 files changed, 39 insertions(+), 7 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index ffabfa7a..69b26932 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-02T19:01:06.272Z",
+  "derivedAt": "2026-04-02T19:04:06.035Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md
index 3016ea3f..9ec691c3 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md
@@ -48,11 +48,11 @@ These sections contain session-specific content:
 **Description:** Event-shape admin: explicit **placementKind** / **anchorEdge** editor; placement-forward display config and copy; reduce differential-role-first labeling on shape surfaces.
 
 **Duration:** ~1–2 days
-**Status:** Not Started
+**Status:** In Progress
 
 ### Tasks
 
-- [ ] #### Task 20.3.1.1: PlacementTypeEditor integration
+- [x] #### Task 20.3.1.1: PlacementTypeEditor integration
 **Goal:** Grouped placement controls on **eventShape** with **primary** ⇒ null **anchorEdge**; wire through existing admin field rendering.
 **Files:**
 - `client/src/components/admin/generic/fields/` (new editor + map)
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
index f33f935c..3a100ed5 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
@@ -1,2 +1,20 @@
 # Session 20.3.1: — Placement type editor (§8.3 #1):** Introduce or elevate **PlacementTypeEditor** (or equivalent) for `eventShape` **placementKind** / **anchorEdge**; align field displays (`eventShapeDisplays.ts`), forms, and admin copy with placement semantics; remove or reword differential-role-forward labels on shape surfaces.
 
+
+### Task 20.3.1.1: Task 20.3.1.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.3.1.2
+
+
+
+## Completed Tasks
+
+### Task 20.3.1.1: Task 20.3.1.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.3.1.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/client/src/components/admin/generic/fields/FieldRenderer.vue b/client/src/components/admin/generic/fields/FieldRenderer.vue
index e1365fc2..6225f902 100644
--- a/client/src/components/admin/generic/fields/FieldRenderer.vue
+++ b/client/src/components/admin/generic/fields/FieldRenderer.vue
@@ -163,6 +163,7 @@ const componentsWithLabel: Array<FieldComponent['type']> = [
   'icon',
   'primitive',
   'select',
+  'eventShapePlacement',
 ]
 
 const fieldShowLabel = computed(() =>
diff --git a/client/src/components/admin/generic/fields/fieldRendererComponentMap.ts b/client/src/components/admin/generic/fields/fieldRendererComponentMap.ts
index faa35243..d01bcc0b 100644
--- a/client/src/components/admin/generic/fields/fieldRendererComponentMap.ts
+++ b/client/src/components/admin/generic/fields/fieldRendererComponentMap.ts
@@ -3,6 +3,7 @@ import PrimitiveInputs from './PrimitiveInputs.vue'
 import SelectInputs from './SelectInputs.vue'
 import RelationshipCollection from '../collections/RelationshipCollection.vue'
 import IconInput from './IconInput.vue'
+import EventShapePlacementFields from './EventShapePlacementFields.vue'
 import type { FieldComponent } from '@/utils/forms/fieldComponentDispatcher'
 
 /** Central map so FieldRenderer.vue stays under component-coupling .vue import threshold. */
@@ -12,6 +13,7 @@ export function createFieldRendererComponentMap(): Record<FieldComponent['type']
     primitive: PrimitiveInputs,
     relationshipCollection: RelationshipCollection,
     select: SelectInputs,
+    eventShapePlacement: EventShapePlacementFields,
     unknown: null,
   }
 }
diff --git a/client/src/composables/admin/useEntityCardFieldConfiguration.ts b/client/src/composables/admin/useEntityCardFieldConfiguration.ts
index db151c88..e465cdb0 100644
--- a/client/src/composables/admin/useEntityCardFieldConfiguration.ts
+++ b/client/src/composables/admin/useEntityCardFieldConfiguration.ts
@@ -15,13 +15,19 @@ import { useFieldLocation } from './useFieldLocation'
 export function useEntityCardFieldConfiguration<GE extends GlobalEntityKey = GlobalEntityKey>(
   params: UseEntityCardFieldConfigurationParams<GE>
 ): UseEntityCardFieldConfigurationReturn<GE> {
-  const { fieldKeys, composedFieldMetadata, isExpanded, filteredMetadata } = params
+  const { entityKey, fieldKeys, composedFieldMetadata, isExpanded, filteredMetadata } = params
 
   const finalFieldKeys = computed(() => {
+    let keys: GlobalFieldKey<GE>[]
     if (filteredMetadata && Object.keys(filteredMetadata).length > 0) {
-      return Object.keys(filteredMetadata) as GlobalFieldKey<GE>[]
+      keys = Object.keys(filteredMetadata) as GlobalFieldKey<GE>[]
+    } else {
+      keys = fieldKeys.value
     }
-    return fieldKeys.value
+    if (entityKey === 'eventShape') {
+      return keys.filter((k) => String(k) !== 'anchorEdge')
+    }
+    return keys
   })
 
   const fieldLocation = useFieldLocation<GE>({
diff --git a/client/src/types/forms/fieldComponent.ts b/client/src/types/forms/fieldComponent.ts
index 5535e970..9febeb11 100644
--- a/client/src/types/forms/fieldComponent.ts
+++ b/client/src/types/forms/fieldComponent.ts
@@ -6,4 +6,6 @@ export type FieldComponent =
   | { type: 'primitive'; reason: 'text' | 'number' | 'statusButton' }
   | { type: 'relationshipCollection'; reason: 'relationshipCollection' }
   | { type: 'select'; reason: 'select' | 'multiselect' | 'reference' }
+  /** Grouped placementKind + anchorEdge for admin event shapes (Feature 20). */
+  | { type: 'eventShapePlacement'; reason: 'eventShapePlacement' }
   | { type: 'unknown'; reason: 'notConfigured' | 'invalidRenderAs' }
diff --git a/client/src/utils/forms/fieldComponentDispatcher.ts b/client/src/utils/forms/fieldComponentDispatcher.ts
index 5b478df9..cf98395b 100644
--- a/client/src/utils/forms/fieldComponentDispatcher.ts
+++ b/client/src/utils/forms/fieldComponentDispatcher.ts
@@ -11,6 +11,10 @@ export function getFieldComponent<GE extends GlobalEntityKey>(
   fieldKey: GlobalFieldKey<GE>,
   fieldMetadata: FieldMetadataEntry | undefined
 ): FieldComponent {
+  if (entityKey === 'eventShape' && String(fieldKey) === 'placementKind') {
+    return { type: 'eventShapePlacement', reason: 'eventShapePlacement' }
+  }
+
   if (!fieldMetadata) {
     return { type: 'unknown', reason: 'notConfigured' }
   }
diff --git a/client/tsconfig.tsbuildinfo b/client/tsconfig.tsbuildinfo
deleted file mode 100644
index 428c37ec..00000000
--- a/client/tsconfig.tsbuildinfo
+++ /dev/null
@@ -1 +0,0 @@
-{"root":["./src/main.ts","./src/vite-env.d.ts","./src/@core/enums.ts","./src/@core/index.ts","./src/@core/initcore.ts","./src/@core/types.ts","./src/@core/composable/createurl.ts","./src/@core/composable/usecookie.ts","./src/@core/composable/usecustomizeroptions.ts","./src/@core/composable/usegenerateimagevariant.ts","./src/@core/composable/useresponsivesidebar.ts","./src/@core/composable/useskins.ts","./src/@core/libs/apex-chart/apexcharconfig.ts","./src/@core/stores/config.ts","./src/@core/utils/colorconverter.ts","./src/@core/utils/formatters.ts","./src/@core/utils/helpers.ts","./src/@core/utils/plugins.ts","./src/@core/utils/validators.ts","./src/@core/utils/vuetify.ts","./src/@layouts/config.ts","./src/@layouts/enums.ts","./src/@
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
