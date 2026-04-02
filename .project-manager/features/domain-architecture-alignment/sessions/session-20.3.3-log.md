# Session 20.3.3: — Remaining domain editors (§8.3 #3):** Other shape-type instance editors: orchestration selection UX for **time** / **price** / **event** instances as needed; shared patterns from 20.3.1–20.3.2.


### Task 20.3.3.1: Task 20.3.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.3.2



## Completed Tasks

### Task 20.3.3.1: Task 20.3.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.3.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (13): `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md`, `client/src/components/admin/generic/EntityCardContent.vue`, `client/src/components/admin/generic/ServiceAtomicEditor.vue`, `client/src/composables/admin/useServiceAtomicPartRows.ts`, `client/src/types/admin/serviceAtomicPartRows.ts`, `client/tsconfig.tsbuildinfo`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.3.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.3.1-planning.md`, `client/src/components/admin/generic/AtomicPartLedgerEditor.vue`, `client/src/components/admin/generic/TimePriceAtomicPartLedgerEditor.vue`, `client/src/composables/admin/useAtomicPartLedgerRows.ts`

### `git diff --stat HEAD`

```text
.../across-ladder.json                             |   2 +-
 .../sessions/session-20.3.3-guide.md               |   2 +-
 .../sessions/session-20.3.3-log.md                 |  18 ++
 .../components/admin/generic/EntityCardContent.vue |   6 +
 .../admin/generic/ServiceAtomicEditor.vue          | 271 +--------------------
 .../composables/admin/useServiceAtomicPartRows.ts  |  85 +------
 client/src/types/admin/serviceAtomicPartRows.ts    |   6 +
 client/tsconfig.tsbuildinfo                        |   1 -
 8 files changed, 51 insertions(+), 340 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index e5fb7032..7a42ac74 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-02T20:01:37.570Z",
+  "derivedAt": "2026-04-02T20:03:41.141Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md
index f1b2c911..5e307941 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 20.3.3.1: Time & price atomic part editors (mirror 20.3.2)
+- [x] #### Task 20.3.3.1: Time & price atomic part editors (mirror 20.3.2)
 **Goal:** Part-ledger VCard + table for **time** and **price** `blockInstance`, same resolution/update pattern as **ServiceAtomicEditor**.
 **Files:**
 - `client/src/composables/admin/` (composable(s))
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
index 54103f4f..8bdd4f17 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
@@ -1,2 +1,20 @@
 # Session 20.3.3: — Remaining domain editors (§8.3 #3):** Other shape-type instance editors: orchestration selection UX for **time** / **price** / **event** instances as needed; shared patterns from 20.3.1–20.3.2.
 
+
+### Task 20.3.3.1: Task 20.3.3.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.3.3.2
+
+
+
+## Completed Tasks
+
+### Task 20.3.3.1: Task 20.3.3.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.3.3.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/client/src/components/admin/generic/EntityCardContent.vue b/client/src/components/admin/generic/EntityCardContent.vue
index ef7b740b..130cf004 100644
--- a/client/src/components/admin/generic/EntityCardContent.vue
+++ b/client/src/components/admin/generic/EntityCardContent.vue
@@ -8,6 +8,7 @@ import FieldRenderer from './fields/FieldRenderer.vue'
 import AnnotationContentEditor from './fields/AnnotationContentEditor.vue'
 import EventInstanceTemplateRef from './fields/EventInstanceTemplateRef.vue'
 import ServiceAtomicEditor from './ServiceAtomicEditor.vue'
+import TimePriceAtomicPartLedgerEditor from './TimePriceAtomicPartLedgerEditor.vue'
 import EntityCardSubPanels from './EntityCardSubPanels.vue'
 import type { GlobalEntity } from '@/types/entities'
 import type { GlobalEntityKey } from '@/constants/entities'
@@ -96,6 +97,11 @@ defineProps<Props>()
     :block-instance-id="entityId"
   />
 
+  <TimePriceAtomicPartLedgerEditor
+    v-if="entityKey === 'blockInstance' && !isNew"
+    :block-instance-id="entityId"
+  />
+
   <div v-for="fieldKey in fieldsByLocation.directStacked" :key="fieldKey" class="mb-4">
     <FieldRenderer
       v-if="getFieldContext(fieldKey)"
diff --git a/client/src/components/admin/generic/ServiceAtomicEditor.vue b/client/src/components/admin/generic/ServiceAtomicEditor.vue
index c21e4450..74163c84 100644
--- a/client/src/components/admin/generic/ServiceAtomicEditor.vue
+++ b/client/src/components/admin/generic/ServiceAtomicEditor.vue
@@ -1,270 +1,23 @@
 <!--
-  WHY: Service block instances get a convergence / work-item ledger (Feature 20 §8.3 #2).
-  PATTERN: VCard + VDataTable; rows from useServiceAtomicPartRows; persist via useEntityCrud('partInstance').update.
+  WHY: Service block instances — convergence / work-item ledger (Feature 20 §8.3 #2).
+  PATTERN: Thin wrapper over AtomicPartLedgerEditor with SERVICE shape gate only.
 -->
 <script setup lang="ts">
-import { computed, nextTick, reactive, ref, watch } from 'vue'
-import type { GlobalEntityId } from '@shared/types/primitiveBrands'
-import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
-import { useServiceAtomicPartRows } from '@/composables/admin/useServiceAtomicPartRows'
-import type { ServiceAtomicPartRow } from '@/types/admin/serviceAtomicPartRows'
-import { createLogger } from '@/utils/logger'
-import { toGlobalEntityId } from '@/utils/globalEntity'
+import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
+import AtomicPartLedgerEditor from './AtomicPartLedgerEditor.vue'
 
-const logger = createLogger('ServiceAtomicEditor')
-
-const props = defineProps<{
+defineProps<{
   blockInstanceId: string
 }>()
 
-const { isServiceBlockInstance, rows } = useServiceAtomicPartRows(() => props.blockInstanceId)
-const { update } = useEntityCrud('partInstance')
-
-const isSaving = ref(false)
-
-/** Local edit buffers; seeded when a part row appears, refreshed after successful save. */
-const drafts = reactive<
-  Record<
-    string,
-    {
-      name: string
-      baseTime: string
-      rateOverBaseTime: string
-      baseFee: string
-      rateOverBaseFee: string
-    }
-  >
->({})
-
-function seedDraftFromRow(r: ServiceAtomicPartRow): void {
-  const id = String(r.partInstance.id)
-  drafts[id] = {
-    name: r.name,
-    baseTime: String(r.baseTime),
-    rateOverBaseTime: String(r.rateOverBaseTime),
-    baseFee: String(r.baseFee),
-    rateOverBaseFee: String(r.rateOverBaseFee),
-  }
-}
-
-watch(
-  rows,
-  (list) => {
-    const ids = new Set(list.map((r) => String(r.partInstance.id)))
-    for (const key of Object.keys(drafts)) {
-      if (!ids.has(key)) {
-        delete drafts[key]
-      }
-    }
-    for (const r of list) {
-      const id = String(r.partInstance.id)
-      if (!(id in drafts)) {
-        seedDraftFromRow(r)
-      }
-    }
-  },
-  { immediate: true, deep: true }
-)
-
-const headers = [
-  { title: 'Part shape', key: 'partShapeName', sortable: false },
-  { title: 'Work item', key: 'name', sortable: false },
-  { title: 'Base time', key: 'baseTime', sortable: false },
-  { title: 'Rate / base time', key: 'rateOverBaseTime', sortable: false },
-  { title: 'Base fee', key: 'baseFee', sortable: false },
-  { title: 'Rate / base fee', key: 'rateOverBaseFee', sortable: false },
-  { title: 'Zero out', key: 'zeroOutPart', sortable: false },
-] as const
-
-type TableRow = ServiceAtomicPartRow & { id: string }
-
-const tableItems = computed((): TableRow[] =>
-  rows.value.map((r) => ({
-    ...r,
-    id: String(r.partInstance.id),
-  }))
-)
-
-function parseFiniteNumber(raw: string): number | null {
-  const n = Number(raw)
-  return Number.isFinite(n) ? n : null
-}
-
-async function runUpdate(
-  id: GlobalEntityId,
-  patch: Record<string, unknown>,
-  context: string
-): Promise<boolean> {
-  isSaving.value = true
-  try {
-    await update(patch as Parameters<typeof update>[0], id)
-    return true
-  } catch (error) {
-    logger.error('Part instance update failed', { error, context, id })
-    return false
-  } finally {
-    isSaving.value = false
-  }
-}
-
-async function refreshDraftAfterSave(partId: string): Promise<void> {
-  await nextTick()
-  const row = rows.value.find((r) => String(r.partInstance.id) === partId)
-  if (row) {
-    seedDraftFromRow(row)
-  }
-}
-
-async function onNameBlur(item: TableRow): Promise<void> {
-  const id = String(item.partInstance.id)
-  const d = drafts[id]
-  if (!d) {
-    return
-  }
-  const next = d.name.trim()
-  if (next === item.partInstance.name) {
-    return
-  }
-  const ok = await runUpdate(toGlobalEntityId(id), { name: next }, '
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
