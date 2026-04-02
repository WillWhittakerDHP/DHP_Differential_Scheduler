# Session 20.3.5: — Annotation metadata + EntityCard wave (§8.3 #5):** Narrow non-annotation metadata scope where plan allows; replace lowest-risk **EntityCard** usage with focused component(s); document remaining EntityCard debt for **20.6**.


### Task 20.3.5.1: Task 20.3.5.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.5.2



## Completed Tasks

### Task 20.3.5.1: Task 20.3.5.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.5.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (8): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md`, `client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue`, `client/src/configs/field/display/fullFieldDisplayConfig.ts`, `client/tsconfig.tsbuildinfo`, `.project-manager/features/domain-architecture-alignment/ANNOTATION_METADATA_DEFERRALS_20.6.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.5.1-handoff.md`, `client/src/configs/field/display/appliedDisplay/annotationInstanceDisplays.ts`

### `git diff --stat HEAD`

```text
.../sessions/session-20.3.5-guide.md                   |  2 +-
 .../sessions/session-20.3.5-log.md                     | 18 ++++++++++++++++++
 .../admin/metadata/AdminPrimitiveMetadataEditor.vue    |  9 +++++++++
 .../configs/field/display/fullFieldDisplayConfig.ts    |  7 ++++++-
 client/tsconfig.tsbuildinfo                            |  1 -
 5 files changed, 34 insertions(+), 3 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md
index 0d682f86..3545b493 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 20.3.5.1: [Task Name]
+- [x] #### Task 20.3.5.1: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md
index 58fb3934..43a2898c 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md
@@ -1,2 +1,20 @@
 # Session 20.3.5: — Annotation metadata + EntityCard wave (§8.3 #5):** Narrow non-annotation metadata scope where plan allows; replace lowest-risk **EntityCard** usage with focused component(s); document remaining EntityCard debt for **20.6**.
 
+
+### Task 20.3.5.1: Task 20.3.5.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.3.5.2
+
+
+
+## Completed Tasks
+
+### Task 20.3.5.1: Task 20.3.5.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.3.5.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue b/client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue
index 9e9cbc28..8df3ff1a 100644
--- a/client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue
+++ b/client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue
@@ -12,6 +12,11 @@
         <span v-if="entityKey === 'blockShape' || entityKey === 'partShape'">
           Changes apply globally to all {{ entityTypeLabel }} entities.
         </span>
+        <span v-else-if="isAnnotationMetadataEntity">
+          Scope: booking wizard annotations only (labels, layout, visibility)—not blocks, parts, or
+          calendar segments. Aligns with FEATURE_20 metadata plan: annotations stay
+          metadata-driven; broader generic metadata cleanup is phase 20.6.
+        </span>
       </p>
     </div>
 
@@ -214,6 +219,10 @@ const entityTypeLabel = computed(() => {
   return getEntityTypeLabel(props.entityKey)
 })
 
+const isAnnotationMetadataEntity = computed(
+  () => props.entityKey === 'annotationShape' || props.entityKey === 'annotationInstance'
+)
+
 function getFieldMetadata(fieldKey: string) {
   return fieldMetadata.value[fieldKey]
 }
diff --git a/client/src/configs/field/display/fullFieldDisplayConfig.ts b/client/src/configs/field/display/fullFieldDisplayConfig.ts
index 3daeab68..799679a4 100644
--- a/client/src/configs/field/display/fullFieldDisplayConfig.ts
+++ b/client/src/configs/field/display/fullFieldDisplayConfig.ts
@@ -12,6 +12,7 @@ import { partInstanceDisplays } from './appliedDisplay/partInstanceDisplays'
 import { partShapeDisplays } from './appliedDisplay/partShapeDisplays'
 import { eventShapeDisplays } from './appliedDisplay/eventShapeDisplays'
 import { annotationShapeDisplays } from './appliedDisplay/annotationShapeDisplays'
+import { annotationInstanceDisplays } from './appliedDisplay/annotationInstanceDisplays'
 import { buildSelectableDisplayType, type SelectableDisplayType } from './selectableDisplayConfig'
 import { asEmptyObject } from '@/utils/safeDefaults'
 
@@ -53,7 +54,11 @@ export function buildDisplayFieldConfig(): DisplayFieldConfigMap {
       annotationShapeDisplays,
       selectableDisplayConfig.annotationShape
     ),
-    annotationInstance: {},
+    annotationInstance: buildAllPerEntityDisplayConfig(
+      'annotationInstance',
+      annotationInstanceDisplays,
+      selectableDisplayConfig.annotationInstance
+    ),
   };
 }
 
diff --git a/client/tsconfig.tsbuildinfo b/client/tsconfig.tsbuildinfo
deleted file mode 100644
index c8f4ee92..00000000
--- a/client/tsconfig.tsbuildinfo
+++ /dev/null
@@ -1 +0,0 @@
-{"root":["./src/main.ts","./src/vite-env.d.ts","./src/@core/enums.ts","./src/@core/index.ts","./src/@core/initcore.ts","./src/@core/types.ts","./src/@core/composable/createurl.ts","./src/@core/composable/usecookie.ts","./src/@core/composable/usecustomizeroptions.ts","./src/@core/composable/usegenerateimagevariant.ts","./src/@core/composable/useresponsivesidebar.ts","./src/@core/composable/useskins.ts","./src/@core/libs/apex-chart/apexcharconfig.ts","./src/@core/stores/config.ts","./src/@core/utils/colorconverter.ts","./src/@core/utils/formatters.ts","./src/@core/utils/helpers.ts","./src/@core/utils/plugins.ts","./src/@core/utils/validators.ts","./src/@core/utils/vuetify.ts","./src/@layouts/config.ts","./src/@layouts/enums.ts","./src/@layouts/index.ts","./src/@layouts/symbols.ts","./src/@layouts/types.ts","./src/@layouts/utils.ts","./src/@layouts/plugins/casl.ts","./src/@layouts/stores/config.ts","./src/components/admin/dev/devpaneltypes.ts","./src/components/admin/generic/entitycardconstants.ts","./src/components/admin/generic/entitycardkeyboardconstants.ts","./src/components/admin/generic/fields/fieldrenderercomponentmap.ts","./src/components/admin/generic/fields/fieldtypes.ts","./src/components/booking/plugins/localstateplugin.ts","./src/components/booking/plugins/wizardstateplugin.ts","./src/components/booking/types/selectioncardtypes.ts","./src/composables/useaddressautocomplete.ts","./src/composables/useaddressautocompletemodelwatchers.ts","./src/composables/useaddressautocompleteselection.ts","./src/composables/useaddressautocompletesuggestions.ts","./src/composables/useadminconfig.ts","./src/composables/useapierrormessage.ts","./src/composables/useappointment.ts","./src/composables/useasyncoperation.ts","./src/composables/usebooking.ts","./src/composables/usebusiness.ts","./src/composables/usecomponentdistribution.ts","./src/composables/usecomponententity.ts","./src/composables/useentityform.ts","./src/composables/usefieldvalue.ts","./src/composables/useformfields.ts","./src/composables/useformvalidation.ts","./src/composables/useglobal.ts","./src/composables/uselayoutloading.ts","./src/composables/useloadingindicator.ts","./src/composables/usemapssessiontoken.ts","./src/composables/usenotification.ts","./src/composables/useproperty.ts","./src/composables/userelationship.ts","./src/composables/useselectoptions.ts","./src/composables/usethememode.ts","./src/composables/useuser.ts","./src/composables/admin/businesscontrolstabcomposablesbundle.ts","./src/composables/admin/entitycardactionspersistence.ts","./src/composables/admin/useadmin.ts","./src/composables/admin/useadminavailabilitysettings.ts","./src/composables/admin/useadminavailabilitysettingscore.ts","./src/composables/admin/useadmincalendarsettings.ts","./src/composables/admin/useadminentitydeletewizard.ts","./src/composables/admin/useadminmetadatamutations.ts","./src/composables/admin/useadminorganizationdefaults.ts","./src/composables/admin/useadminuserroleblockalignment.ts","./src/composables/admin/useadminwizardsettings.ts","./src/composables/admin/useannotationcontenteditor.ts","./src/composables/admin/useapidevpanelvisibility.ts","./src/composables/admin/useatomicpartledgerrows.ts","./src/composables/admin/useattendeequickselect.ts","./src/composables/admin/usebasecollectionfield.ts","./src/composables/admin/usebasecollectionfieldbindingcomputeds.ts","./src/composables/admin/usebasecollectionfieldbindingcomputedskeys.ts","./src/composables/admin/usebasecollectionfieldbindingcomputedsparent.ts","./src/composables/admin/usebasecollectionfieldbindings.ts","./src/composables/admin/usebasecollectionfieldcore.ts","./src/composables/admin/usebasecollectionfieldtypes.ts","./src/composables/admin/useblockinstancecre
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
