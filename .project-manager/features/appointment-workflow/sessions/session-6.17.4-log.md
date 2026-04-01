# Session 6.17.4: Wire generic delete entry points (list + entity card)


### Task 6.17.4.1: Task 6.17.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.4.2



## Completed Tasks

### Task 6.17.4.1: Task 6.17.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.4.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (10): `.project-manager/features/appointment-workflow/across-ladder.json`, `.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md`, `client/src/utils/admin/entityList.ts`, `client/src/utils/admin/entityListDelete.ts`, `client/src/views/admin/entities/PartShapeList.vue`, `client/tsconfig.tsbuildinfo`, `.project-manager/features/appointment-workflow/sessions/task-6.17.4.1-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.17.4.1-planning.md`, `client/src/utils/admin/dependencyDeleteContractKeys.ts`

### `git diff --stat HEAD`

```text
.../appointment-workflow/across-ladder.json        |  2 +-
 .../sessions/session-6.17.4-guide.md               |  2 +-
 .../sessions/session-6.17.4-log.md                 | 18 +++++++++++++
 client/src/utils/admin/entityList.ts               | 14 ++++++++++
 client/src/utils/admin/entityListDelete.ts         | 17 ++++++++++--
 client/src/views/admin/entities/PartShapeList.vue  | 30 ++++++++++++++++++++++
 client/tsconfig.tsbuildinfo                        |  2 +-
 7 files changed, 80 insertions(+), 5 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/across-ladder.json b/.project-manager/features/appointment-workflow/across-ladder.json
index deb9ea1b..c8a28e70 100644
--- a/.project-manager/features/appointment-workflow/across-ladder.json
+++ b/.project-manager/features/appointment-workflow/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "appointment-workflow",
-  "derivedAt": "2026-04-01T22:38:18.251Z",
+  "derivedAt": "2026-04-01T22:43:35.353Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "6.2",
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md
index 198ed0f0..363d7063 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 6.17.4.1: [Task Name]
+- [x] #### Task 6.17.4.1: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md
index 83a64f0b..bae76aa7 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md
@@ -1,2 +1,20 @@
 # Session 6.17.4: Wire generic delete entry points (list + entity card)
 
+
+### Task 6.17.4.1: Task 6.17.4.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.17.4.2
+
+
+
+## Completed Tasks
+
+### Task 6.17.4.1: Task 6.17.4.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.17.4.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/client/src/utils/admin/entityList.ts b/client/src/utils/admin/entityList.ts
index a156ef3c..c74b3dfb 100644
--- a/client/src/utils/admin/entityList.ts
+++ b/client/src/utils/admin/entityList.ts
@@ -19,6 +19,8 @@ interface EntityListOptions {
   }
   deleteConfirmation?: string | ((entityId: GlobalEntityId) => string)
   deleteErrorMessage?: string | ((error: unknown) => string)
+  /** When set, skips confirm + `remove`; caller runs contract delete flow (e.g. wizard). */
+  contractDelete?: (id: GlobalEntityId) => void | Promise<void>
 }
 
 export interface EntityListReturn {
@@ -64,6 +66,18 @@ export function entityList(options: EntityListOptions): EntityListReturn {
   }
 
   const handleDelete = async (id: GlobalEntityId): Promise<void> => {
+    if (contractDelete != null) {
+      try {
+        await contractDelete(id)
+      } catch (err) {
+        logger.error('Delete entity failed', { err })
+        const errorMsg = getDeleteErrorMessage(err)
+        notifyError(errorMsg)
+        throw err
+      }
+      return
+    }
+
     const confirmation = getDeleteConfirmation(id)
 
     if (!confirm(confirmation)) {
diff --git a/client/src/utils/admin/entityListDelete.ts b/client/src/utils/admin/entityListDelete.ts
index 10e49ac4..4bc92032 100644
--- a/client/src/utils/admin/entityListDelete.ts
+++ b/client/src/utils/admin/entityListDelete.ts
@@ -2,7 +2,7 @@
  * Pure delete-handler factory: confirms and calls remove with error handling.
  * WHY: Moved from composables (utils-in-disguise) — no Vue reactivity; single source for list delete logic.
  */
-import type { GlobalEntityId } from '@/types/entities'
+import type { GlobalEntityId } from '@shared/types/primitiveBrands'
 import { getApiErrorMessage } from '@/composables/useApiErrorMessage'
 import type { AppLogger } from '@/utils/logger'
 
@@ -12,15 +12,28 @@ interface EntityListDeleteOptions {
   errorMessage: string
   logger: AppLogger
   notifyError: (message: string) => void
+  /**
+   * When set, skips browser `confirm` and `remove` — caller opens dependency delete UI (e.g. wizard).
+   */
+  contractDelete?: (id: GlobalEntityId) => void | Promise<void>
 }
 
 /**
  * Returns an async delete handler that confirms, calls remove, and handles errors.
  */
 export function entityListDelete(options: EntityListDeleteOptions): (id: GlobalEntityId) => Promise<void> {
-  const { remove, confirmMessage, errorMessage, logger, notifyError } = options
+  const { remove, confirmMessage, errorMessage, logger, notifyError, contractDelete } = options
 
   return async function handleDelete(id: GlobalEntityId): Promise<void> {
+    if (contractDelete != null) {
+      try {
+        await contractDelete(id)
+      } catch (error) {
+        logger.error(errorMessage, { error })
+        notifyError(getApiErrorMessage(error, errorMessage))
+      }
+      return
+    }
     if (!confirm(confirmMessage)) return
     try {
       await remove(id)
diff --git a/client/src/views/admin/entities/PartShapeList.vue b/client/src/views/admin/entities/PartShapeList.vue
index a853edd1..65c82573 100644
--- a/client/src/views/admin/entities/PartShapeList.vue
+++ b/client/src/views/admin/entities/PartShapeList.vue
@@ -61,12 +61,22 @@
         </v-card>
       </v-col>
     </v-row>
+    <AdminEntityDeleteWizard
+      v-model="deleteWizardOpen"
+      entity-key="partShape"
+      :entity-id="deleteWizardEntityId"
+      :entity-label="deleteWizardEntityLabel"
+      @finalized="onDeleteWizardFinalized"
+    />
   </v-container>
 </template>
 
 <script setup lang="ts">
+import { ref } from 'vue'
 import { useRouter } from 'vue-router'
+import { useQueryClient } from '@tanstack/vue-query'
 import type { GlobalEntityId } from '@shared/types/primitiveBrands'
+import AdminEntityDeleteWizard from '@/components/admin/generic/AdminEntityDeleteWizard.vue'
 import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
 import { entityListDelete } from '@/utils/admin/entityListDelete'
 import { useNotification } from '@/composables/useNotification'
@@ -74,16 +84,36 @@ import { createLogger } from '@/utils/logger'
 
 const logger = createLogger('PartShapeList')
 const router = useRouter()
+const queryClient = useQueryClient()
 const { error: notifyError } = useNotification()
 const { entities, isLoading, error, remove } = useEntityCrud('partShape')
+
+const deleteWizardOpen = ref(false)
+const deleteWizardEntityId = ref('')
+const deleteWizardEntityLabel = ref('')
+
 const handleDelete = entityListDelete({
   remove,
   confirmMessage: 'Are you sure you want to delete this part type?',
   errorMessage: 'Failed to delete part type',
   logger,
   notifyError,
+  contractDelete: async (id: GlobalEntityId): Promise<void> => {
+    const row = entities.value.find((e) => e.id === id)
+    deleteWizardEntityId.value = String(id)
+    deleteWizardEntityLabel.value =
+      row?.name != null && row.name !== '' ? row.name : `Part Shape ${id}`
+    deleteWizardOpen.value = true
+  },
 })
 
+function onDeleteWizardFinalized(): void {
+  void queryClient.invalidateQueries({ queryKey: ['globalData'] })
+  deleteWizardOpen.value = false
+  deleteWizardEntityId.value = ''
+  deleteWizardEntityLabel.value = ''
+}
+
 function goToCreate(): void {
   router.push({ name: 'part-type-create' })
 }
diff --git a/client/tsconfig.tsbuildinfo b/client/tsconfig.tsbuildinfo
index 189ae5bd..5cde3a16 100644
--- a/client/tsconfig.tsbuildinfo
+++ b/client/tsconfig.tsbuildinfo
@@ -1 +1 @@
-{"root":["./src/main.ts","./src/vite-env.d.ts","./src/@core/enums.ts","./src/@core/index.ts","./src/@core/initcore.ts","./src/@core/types.ts","./src/@core/composable/createurl.ts","./src/@core/composable/usecookie.ts","./src/@core/composable/usecustomizeroptions.ts","./src/@core/composable/usegenerateimagevariant.ts","./src/@core/composable/useresponsivesidebar.ts","./src/@core/composable/useskins.ts","./src/@core/libs/apex-chart/apexcharconfig.ts","./src/@core/stores/config.ts","./src/@core/utils/colorconverter.ts","./src/@core/utils/formatters.ts","./src/@core/utils/helpers.ts","./src/@core/utils/plugins.
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
