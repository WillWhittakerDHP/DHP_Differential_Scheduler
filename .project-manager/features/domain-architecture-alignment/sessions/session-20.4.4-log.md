# Session 20.4.4: ** **Perspective + minimizer + shared cleanup** — update **`perspectiveResolver`**, **`minimizerSchedulingBounds`**, **`minimizerEventShapes`**, **`partFinalizerSlotShapeHelpers`** as needed; delete unused **`differentialRole*`** shared/client utilities per **§6.2** when grep-clean.


### Task 20.4.4.1: Task 20.4.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.4.2



## Completed Tasks

### Task 20.4.4.1: Task 20.4.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.4.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (6): `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md`, `client/src/utils/booking/perspectiveResolver.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.4.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.4.1-planning.md`

### `git diff --stat HEAD`

```text
.../across-ladder.json                             |  2 +-
 .../sessions/session-20.4.4-guide.md               |  2 +-
 .../sessions/session-20.4.4-log.md                 | 18 ++++++++++++++
 client/src/utils/booking/perspectiveResolver.ts    | 28 +++++++---------------
 4 files changed, 28 insertions(+), 22 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index 92dae288..6539c9f4 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-02T22:17:53.328Z",
+  "derivedAt": "2026-04-02T22:20:31.586Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
index 9b0b8033..8626e54f 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 20.4.4.1: `perspectiveResolver` — dead `resolveEventShapes` overrides + dedupe `derivePerspective`
+- [x] #### Task 20.4.4.1: `perspectiveResolver` — dead `resolveEventShapes` overrides + dedupe `derivePerspective`
 **Goal:** Drop unused **`overrides`** param from **`resolveEventShapes`**; route **`derivePerspective`** through **`resolveEventShapes`** + **`derivePerspectiveWithResolved`**.
 **Files:** `client/src/utils/booking/perspectiveResolver.ts` (callers already single-arg)
 **Approach:** Refactor + **`vue-tsc`** / client lint.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
index b4eee236..f349c43e 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
@@ -1,2 +1,20 @@
 # Session 20.4.4: ** **Perspective + minimizer + shared cleanup** — update **`perspectiveResolver`**, **`minimizerSchedulingBounds`**, **`minimizerEventShapes`**, **`partFinalizerSlotShapeHelpers`** as needed; delete unused **`differentialRole*`** shared/client utilities per **§6.2** when grep-clean.
 
+
+### Task 20.4.4.1: Task 20.4.4.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.4.4.2
+
+
+
+## Completed Tasks
+
+### Task 20.4.4.1: Task 20.4.4.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.4.4.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/client/src/utils/booking/perspectiveResolver.ts b/client/src/utils/booking/perspectiveResolver.ts
index 0a76975f..aa8720cb 100644
--- a/client/src/utils/booking/perspectiveResolver.ts
+++ b/client/src/utils/booking/perspectiveResolver.ts
@@ -4,7 +4,6 @@ import type { AppointmentSlot } from '@/types/appointment'
 import type { SlotShape } from '@/types/appointment'
 import type { EventShapeEntity } from '@/types/entities'
 import { resolveDifferentialMajorMinorFromEventShapes } from '@/utils/eventAttendeeUtils'
-import type { DifferentialRole } from '@shared/types/differentialRole'
 import { createTimeRange, addMinutes } from './slotTimeUtils'
 import { EVENT_PERSPECTIVE_KEYS } from '@/configs/eventPerspectiveLabels'
 import type { ResolvedEventShapes } from '@/types/booking/perspectiveResolver'
@@ -30,20 +29,14 @@ function resolvedShapesFromMajorMinorPair(
   }
 }
 
-function resolveEventShapesCore(
-  eventFinals: SlotShape['eventFinals'],
-  overrides?: Record<string, DifferentialRole> | null
-): ResolvedEventShapes {
-  const eventShapeEntities = eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
-  const pair = resolveDifferentialMajorMinorFromEventShapes(eventShapeEntities, overrides)
+function resolveEventShapesCore(eventFinals: SlotShape['eventFinals']): ResolvedEventShapes {
+  const eventShapeEntities = eventFinals.map((ef) => ef.eventShape) as EventShapeEntity[]
+  const pair = resolveDifferentialMajorMinorFromEventShapes(eventShapeEntities)
   return resolvedShapesFromMajorMinorPair(pair)
 }
 
-export function resolveEventShapes(
-  eventFinals: SlotShape['eventFinals'],
-  overrides?: Record<string, DifferentialRole> | null
-): ResolvedEventShapes {
-  return resolveEventShapesCore(eventFinals, overrides)
+export function resolveEventShapes(eventFinals: SlotShape['eventFinals']): ResolvedEventShapes {
+  return resolveEventShapesCore(eventFinals)
 }
 
 export function adjustMinorTimeRange(
@@ -128,17 +121,12 @@ export function derivePerspective(
   if (!eventFinals?.length) {
     return derivePerspectiveNoEventFinals(slot, perspective)
   }
-  const eventShapeEntities = eventFinals.map((ef) => ef.eventShape) as EventShapeEntity[]
-  const pair = resolveDifferentialMajorMinorFromEventShapes(eventShapeEntities)
+  const resolved = resolveEventShapes(eventFinals)
   // WHY: Without a major+minor pair, role-based ranges are not defined; use total for every
   // perspective (including minor). Reusing derivePerspectiveNoEventFinals would return null
   // for minor and show "Unavailable" while totalTimeRange is valid.
-  if (!pair.hasMajorMinorPair) {
+  if (!resolved.majorEventShape) {
     return slot.totalTimeRange ?? derivePerspectiveNoEventFinals(slot, perspective)
   }
-  return derivePerspectiveWithResolved(
-    slot,
-    perspective,
-    resolvedShapesFromMajorMinorPair(pair),
-  )
+  return derivePerspectiveWithResolved(slot, perspective, resolved)
 }
```
<!-- /harness:anchor:commit-preview -->
