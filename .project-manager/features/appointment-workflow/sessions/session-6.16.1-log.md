# Session 6.16.1: Margin role — types, pipeline, admin


### Task 6.16.1.1: Task 6.16.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.16.1.2



## Completed Tasks

### Task 6.16.1.1: Task 6.16.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.16.1.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/appointment-workflow/across-ladder.json`, `.project-manager/features/appointment-workflow/sessions/session-6.16.1-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.16.1-log.md`, `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`, `client/src/utils/booking/partFinalizer.ts`, `client/src/utils/transformers/apiEntityFieldNormalization.ts`, `client/tsconfig.tsbuildinfo`, `.project-manager/features/appointment-workflow/sessions/task-6.16.1.1-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.16.1.1-planning.md`

### `git diff --stat HEAD`

```text
.../features/appointment-workflow/across-ladder.json   |  4 ++--
 .../sessions/session-6.16.1-guide.md                   |  4 ++--
 .../sessions/session-6.16.1-log.md                     | 18 ++++++++++++++++++
 .../fields/DifferentialEventRoleOverridesField.vue     | 10 ++++++----
 client/src/utils/booking/partFinalizer.ts              |  4 ++--
 .../utils/transformers/apiEntityFieldNormalization.ts  |  2 +-
 client/tsconfig.tsbuildinfo                            |  2 +-
 7 files changed, 32 insertions(+), 12 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/across-ladder.json b/.project-manager/features/appointment-workflow/across-ladder.json
index 5881b890..d700c795 100644
--- a/.project-manager/features/appointment-workflow/across-ladder.json
+++ b/.project-manager/features/appointment-workflow/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "appointment-workflow",
-  "derivedAt": "2026-03-25T21:00:51.561Z",
+  "derivedAt": "2026-03-25T21:02:46.730Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "6.2",
@@ -122,6 +122,6 @@
   "sessionAcrossTotal": 3,
   "sessionIndex0Based": 0,
   "nextSessionAcross": "6.16.2",
-  "taskAcrossTotal": 2,
+  "taskAcrossTotal": 4,
   "nextTaskAcross": "6.16.1.1"
 }
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.16.1-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.16.1-guide.md
index 14bea307..26ec29c8 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.16.1-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.16.1-guide.md
@@ -39,11 +39,11 @@ These sections contain session-specific content:
 **Description:** Add `margin` to `DifferentialRole` across the full stack: shared types + constants, DB migration (authored), server model, part finalizer pipeline (`minimizer: 'override'`), and admin override UI. Locks the ENUM rename strategy (keep `moveable` in storage for now; full rename in 6.16.3).
 
 **Duration:** 1–2 hours (4 focused tasks)
-**Status:** Not Started
+**Status:** In Progress
 
 ### Tasks
 
-- [ ] #### Task 6.16.1.1: Shared types + constants for margin
+- [x] #### Task 6.16.1.1: Shared types + constants for margin
 **Goal:** Add `'margin'` to `DifferentialRole`, `DifferentialRoleStorage`, labels, select options, and all guards/parsers in `shared/`.
 **Files:** 
 - `shared/types/differentialRole.ts`
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.16.1-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.16.1-log.md
index 27de2179..7b8a9d17 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.16.1-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.16.1-log.md
@@ -1,2 +1,20 @@
 # Session 6.16.1: Margin role — types, pipeline, admin
 
+
+### Task 6.16.1.1: Task 6.16.1.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.16.1.2
+
+
+
+## Completed Tasks
+
+### Task 6.16.1.1: Task 6.16.1.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.16.1.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue b/client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue
index 4e3b215f..7138fd2b 100644
--- a/client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue
+++ b/client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue
@@ -87,6 +87,7 @@ import { useAdmin } from '@/composables/admin/useAdmin'
 import { buildDifferentialRoleMatrixRows } from '@/utils/admin/differentialRoleMatrixRows'
 import type { BlockInstanceEntity, EventShapeEntity } from '@/types/entities'
 import type { DifferentialRole } from '@shared/types/differentialRole'
+import { DIFFERENTIAL_ROLE_LABELS } from '@shared/constants/differentialRoleMappings'
 import { sanitizeDifferentialEventRoleOverridesInput } from '@shared/utils/differentialRoleUtils'
 import BaseInput from './BaseInput.vue'
 
@@ -128,10 +129,11 @@ const matrixRows = computed(() =>
 
 const roleSelectItems = computed((): RoleSelectItem[] => [
   { title: 'Inherit (use event shape template)', value: INHERIT_SENTINEL },
-  { title: 'Major', value: 'major' },
-  { title: 'Minor', value: 'minor' },
-  { title: 'Movable', value: 'moveable' },
-  { title: 'None', value: 'none' },
+  { title: DIFFERENTIAL_ROLE_LABELS.major, value: 'major' },
+  { title: DIFFERENTIAL_ROLE_LABELS.minor, value: 'minor' },
+  { title: DIFFERENTIAL_ROLE_LABELS.moveable, value: 'moveable' },
+  { title: DIFFERENTIAL_ROLE_LABELS.margin, value: 'margin' },
+  { title: DIFFERENTIAL_ROLE_LABELS.none, value: 'none' },
 ])
 
 const overridesMap = computed((): DifferentialEventRoleOverridesMap => {
diff --git a/client/src/utils/booking/partFinalizer.ts b/client/src/utils/booking/partFinalizer.ts
index 7c0475c3..b2cbf6bc 100644
--- a/client/src/utils/booking/partFinalizer.ts
+++ b/client/src/utils/booking/partFinalizer.ts
@@ -9,7 +9,7 @@ import type { TernaryBoolean } from '@/types/ternary'
 import { createLogger } from '@/utils/logger'
 import { nilToEmptyArray } from '@shared/utils/nilDefaults'
 import type { DifferentialRole } from '@shared/types/differentialRole'
-import { effectiveDifferentialRole } from '@shared/utils/differentialRoleUtils'
+import { effectiveDifferentialRole, isDifferentialRoleOverrideValue } from '@shared/utils/differentialRoleUtils'
 
 export { calculateSlotShape } from './partFinalizerSlotShape'
 
@@ -26,7 +26,7 @@ export function mergeBlockDifferentialRoleOverrides(blockFinals: BlockFinal[]):
       continue
     }
     for (const [k, v] of Object.entries(raw)) {
-      if (v !== 'major' && v !== 'minor' && v !== 'moveable' && v !== 'none') {
+      if (!isDifferentialRoleOverrideValue(v)) {
         continue
       }
       if (k in merged && merged[k] !== v) {
diff --git a/client/src/utils/transformers/apiEntityFieldNormalization.ts b/client/src/utils/transformers/apiEntityFieldNormalization.ts
index 62bf2ca9..47b9de2e 100644
--- a/client/src/utils/transformers/apiEntityFieldNormalization.ts
+++ b/client/src/utils/transformers/apiEntityFieldNormalization.ts
@@ -100,5 +100,5 @@ export function normalizeEventShapeDifferentialRoleFromApi(raw: unknown): Differ
 }
 
 function isDifferentialRoleStorageLoose(raw: unknown): boolean {
-  return raw === 'major' || raw === 'minor' || raw === 'moveable'
+  return raw === 'major' || raw === 'minor' || raw === 'moveable' || raw === 'margin'
 }
diff --git a/client/tsconfig.tsbuildinfo b/client/tsconfig.tsbuildinfo
index 6d02e444..2ba2a84b 100644
--- a/client/tsconfig.tsbuildinfo
+++ b/client/tsconfig.tsbuildinfo
@@ -1 +1 @@
-{"root":["./src/main.ts","./src/vite-env.d.ts","./src/@core/enums.ts","./src/@core/index.ts","./src/@core/initcore.ts","./src/@core/types.ts","./src/@core/composable/createurl.ts","./src/@core/composable/usecookie.ts","./src/@core/composable/usecustomizeroptions.ts","./src/@core/composable/usegenerateimagevariant.ts","./src/@core/composable/useresponsivesidebar.ts","./src/@core/composable/useskins.ts","./src/@core/libs/apex-chart/apexcharconfig.ts","./src/@core/stores/config.ts","./src/@core/utils/colorconverter.ts","./src/@core/utils/formatters.ts","./src/@core/utils/helpers.ts","./src/@core/utils/plugins.ts","./src/@core/utils/validators.ts","./src/@core/utils/vuetify.ts","./src/@layouts/config.ts","./src/@layouts/enums.ts","./src/@layouts/index.ts","./src/@layouts/symbols.ts","./src/@layouts/types.ts","./src/@layouts/utils.ts","./src/@layouts/plugins/casl.ts","./src/@layouts/stores/config.ts","./src/components/admin/dev/devpaneltypes.ts","./src/components/admin/generic/entitycardconstants.ts","./src/components/admin/generic/entitycardkeyboardconstants.ts","./src/components/admin/generic/fields/fieldrenderercomponentmap.ts","./src/components/admin/generic/fields/fieldtypes.ts","./src/components/booking/plugins/localstateplugin.ts","./src/components/booking/plugins/wizardstateplugin.ts","./src/components/booking/types/selectioncardtypes.ts","./src/composables/useaddressautocomplete.ts","./src/composables/useaddressautocompletemodelwatchers.ts","./src/composables/useaddressautocompleteselection.ts","./src/composables/useaddressautocompletesuggestions.ts","./src/composables/useadminconfig.ts","./src/composables/useapierrormessage.ts","./src/composables/useappointment.ts","./src/composables/useasyncoperation.ts"
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
