# Session 20.4.3: ** **Slot shape + time axis** — rewrite **`calculateSlotShape`**, **`partFinalizerSlotShape`**, **`applyShapeToTime`**, and related helpers to use **placement_kind / anchor_edge** and instance grouping instead of role flags.


### Task 20.4.3.1: Task 20.4.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.3.2



## Completed Tasks

### Task 20.4.3.1: Task 20.4.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.3.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (8): `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.3-log.md`, `client/src/utils/booking/appointmentSlotBuilder.ts`, `client/src/utils/booking/partFinalizerSlotShape.ts`, `client/src/utils/booking/partFinalizerSlotShapeHelpers.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.3.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.3.1-planning.md`

### `git diff --stat HEAD`

```text
.../across-ladder.json                             |  2 +-
 .../sessions/session-20.4.3-guide.md               | 24 ++++++++++------------
 .../sessions/session-20.4.3-log.md                 | 18 ++++++++++++++++
 client/src/utils/booking/appointmentSlotBuilder.ts |  1 -
 client/src/utils/booking/partFinalizerSlotShape.ts |  3 ---
 .../utils/booking/partFinalizerSlotShapeHelpers.ts |  9 ++------
 6 files changed, 32 insertions(+), 25 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index 382485a9..2a8e49f2 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-02T22:03:04.082Z",
+  "derivedAt": "2026-04-02T22:05:51.191Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.3-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.3-guide.md
index 70e72ed6..989be292 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.3-guide.md
@@ -52,19 +52,17 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 20.4.3.1: [Task Name]
-**Goal:** [Task goal]
-**Files:** 
-- [Files to work with]
-**Approach:** [Approach to take]
-**Checkpoint:** [What needs to be verified]
-
-- [ ] #### Task 20.4.3.2: [Task Name]
-**Goal:** [Task goal]
-**Files:** 
-- [Files to work with]
-**Approach:** [Approach to take]
-**Checkpoint:** [What needs to be verified]
+- [x] #### Task 20.4.3.1: Slot shape + differential offsets (placement-only API)
+**Goal:** Remove **`mergedRoleOverrides`** from **`calculateSlotShape`** / **`computeDifferentialOffsetsFromMaps`**; booking path uses placement-only **`resolvePrimarySecondaryEventShapesForBooking`**.
+**Files:** `partFinalizerSlotShape.ts`, `partFinalizerSlotShapeHelpers.ts`, `appointmentSlotBuilder.ts` (`buildAppointmentShape` call)
+**Approach:** Signature shrink + single call site; grep + client lint.
+**Checkpoint:** No other **`calculateSlotShape`** callers; lint clean.
+
+- [ ] #### Task 20.4.3.2: Time axis (`applyShapeToTime` + `resolveEventShapes`)
+**Goal:** Stop threading empty **`differentialEventRoleOverrides`** through time application where grep-clean; align with task 20.4.3.1 slot output.
+**Files:** `appointmentSlotBuilder.ts` (`applyShapeToTime`), `perspectiveResolver.ts`, `slotShapeLookups.ts` if needed
+**Approach:** Grep then refactor; preserve **`roundedDifferentialOffset`** / major-minor adjustment behavior.
+**Checkpoint:** Lint; manual smoke availability slots if time permits.
 
 ---
 
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.3-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.3-log.md
index 9d1739cf..6012d027 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.3-log.md
@@ -1,2 +1,20 @@
 # Session 20.4.3: ** **Slot shape + time axis** — rewrite **`calculateSlotShape`**, **`partFinalizerSlotShape`**, **`applyShapeToTime`**, and related helpers to use **placement_kind / anchor_edge** and instance grouping instead of role flags.
 
+
+### Task 20.4.3.1: Task 20.4.3.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.4.3.2
+
+
+
+## Completed Tasks
+
+### Task 20.4.3.1: Task 20.4.3.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.4.3.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/client/src/utils/booking/appointmentSlotBuilder.ts b/client/src/utils/booking/appointmentSlotBuilder.ts
index 8fcbabf8..0fc3a1e5 100644
--- a/client/src/utils/booking/appointmentSlotBuilder.ts
+++ b/client/src/utils/booking/appointmentSlotBuilder.ts
@@ -147,7 +147,6 @@ export function buildAppointmentShape(
     eventAssignmentsByPartShape,
     resolvedEventShapes,
     settings ?? null,
-    differentialEventRoleOverrides,
     resolvedTimeRounding,
   )
 
diff --git a/client/src/utils/booking/partFinalizerSlotShape.ts b/client/src/utils/booking/partFinalizerSlotShape.ts
index 0b325ceb..55444d89 100644
--- a/client/src/utils/booking/partFinalizerSlotShape.ts
+++ b/client/src/utils/booking/partFinalizerSlotShape.ts
@@ -1,6 +1,5 @@
 import type { BlockFinal } from '@/types/booking/blockFinal'
 import type { EventInstance, EventShape } from '@/types/events'
-import type { DifferentialRole } from '@shared/types/differentialRole'
 import type { SlotShape } from '@/types/appointment'
 import type { AvailabilitySettings } from '@/configs/availabilitySettings'
 import type { ResolvedNumericPolicy } from '@shared/types/organizationDefaults'
@@ -20,7 +19,6 @@ export function calculateSlotShape(
   eventAssignmentsByPartShape: Record<string, EventInstance[]> = {},
   eventShapes: EventShape[] = [],
   roundingSettings?: AvailabilitySettings | null,
-  mergedRoleOverrides: Record<string, DifferentialRole> = {},
   resolvedTimeRounding?: ResolvedNumericPolicy['timeAndRounding'] | null,
 ): SlotShape {
   const eventShapeById = new Map(eventShapes.map((es) => [es.id, es]))
@@ -52,7 +50,6 @@ export function calculateSlotShape(
     eventRawDurations,
     eventRoundedDurationsByShapeId,
     eventShapes,
-    mergedRoleOverrides,
   )
 
   return {
diff --git a/client/src/utils/booking/partFinalizerSlotShapeHelpers.ts b/client/src/utils/booking/partFinalizerSlotShapeHelpers.ts
index 55747d89..049c0de8 100644
--- a/client/src/utils/booking/partFinalizerSlotShapeHelpers.ts
+++ b/client/src/utils/booking/partFinalizerSlotShapeHelpers.ts
@@ -4,7 +4,6 @@ import type { EventInstance, EventShape } from '@/types/events'
 import type { EventShapeEntity } from '@/types/entities'
 import type { EventFinal } from '@/types/appointment'
 import type { AvailabilitySettings } from '@/configs/availabilitySettings'
-import type { DifferentialRole } from '@shared/types/differentialRole'
 import type { ResolvedNumericPolicy } from '@shared/types/organizationDefaults'
 import { resolvePrimarySecondaryEventShapesForBooking } from '@/utils/eventAttendeeUtils'
 import { roundDuration, roundDurationFromResolvedTimeRounding } from '@/utils/booking/durationRounding'
@@ -109,8 +108,7 @@ export function computeTopLevelRoundedDuration(eventFinals: EventFinal[]): numbe
 export function computeDifferentialOffsetsFromMaps(
   eventRawDurations: Map<string, number>,
   eventRoundedDurationsByShapeId: Map<string, number>,
-  eventShapes: EventShape[],
-  mergedRoleOverrides: Record<string, DifferentialRole>
+  eventShapes: EventShape[]
 ): DifferentialDurationOffsets {
   let rawDifferentialOffset = 0
   let roundedDifferentialOffset = 0
@@ -123,10 +121,7 @@ export function computeDifferentialOffsetsFromMaps(
   const candidateEventShapes = eventShapes.filter((es) => participatingIds.has(String(es.id)))
 
   const { primary: majorEventShape, secondary: minorEventShape } =
-    resolvePrimarySecondaryEventShapesForBooking(
-      candidateEventShapes as EventShapeEntity[],
-      mergedRoleOverrides,
-    )
+    resolvePrimarySecondaryEventShapesForBooking(candidateEventShapes as EventShapeEntity[])
   if (majorEventShape) {
     const majorRawDuration = eventRawDurations.get(majorEventShape.id) || 0
     const majorRoundedDuration = eventRoundedDurationsByShapeId.get(majorEventShape.id) || 0
```
<!-- /harness:anchor:commit-preview -->
