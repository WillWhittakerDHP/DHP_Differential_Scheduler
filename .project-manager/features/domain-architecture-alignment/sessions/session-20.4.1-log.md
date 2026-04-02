# Session 20.4.1: Pipeline audit + safe dead-code (booking)

**Last updated:** 2026-04-02

---

## Pipeline map: current code vs FEATURE_20 §4.2

**Canonical target steps** (FEATURE_20 §4.2, aligned to Principles §4.4):

1. `createPerBlockInstancePartRecords`  
2. `resolvePartLevelTime`  
3. `resolvePartLevelFee`  
4. `resolvePartLevelEventAssignment`  
5. `applyZeroOutLast`  
6. `groupResolvedTimeByEvent`  
7. `rollResolvedFeesByOrchestrator`  
8. `layoutSegmentsOnTimeAxis`  
9. `derivePerspectiveViews`  
10. `resolveFloatingWindows`  

**Current chain** (FEATURE_20 §4.1 + code verified 2026-04-02):

| Current step (module / symbol) | Maps to §4.2 | Notes / gap |
|--------------------------------|--------------|-------------|
| `transformGlobalToBooking` → `bookingTransformer` (`globalToBookingTransformer.ts`) | Pre-pipeline | Builds `BookingData` / `BookingBlockInstance` + part rows from global entities. Not listed in §4.2 numbered steps; feeds everything below. |
| `createBlockFinals` → `createBlockFinal` → `createPartFinals` → `createPartFinal` (`blockFinalizer.ts`, `BlockFinal.ts`, `partFinalizer.ts`, `PartFinal.ts`) | **1** (partial) | Rolls part instances per block into `PartFinal` (time/fee rates already on booking part rows from transformer). Does not yet match renamed “createPerBlockInstancePartRecords” wording. |
| `filterZeroedBlocks` / `filterZeroedParts` (`blockFinalizer.ts`, `partFinalizer.ts`) | **5** (partial) | Drops zeroed parts/blocks before slot math — related to zero-out semantics; not identical to “applyZeroOutLast” ordering in principles (see §4.4). |
| `buildEventAssignmentsByPartShape` (`appointmentSlotBuilder.ts`) | **4** (supporting structure) | Produces `eventAssignmentsByPartShape` from relationships + instances. Feeds enrichment and duration rollup by event shape. |
| `enrichBlockFinalsWithDifferentialRoles` (`partFinalizer.ts`) | **§4.3 remove** | Derives `PartFinal.major` / `minor` / `minimizer` from placement → `DifferentialRole`. Target: replace with placement + instance grouping only. |
| `mergeBlockDifferentialRoleOverrides` (`partFinalizer.ts`) | Dead plumbing | Always returns `{}`; block-level overrides removed per comment. |
| `calculateSlotShape` + `partFinalizerSlotShapeHelpers` (`partFinalizerSlotShape.ts`) | **6–8** (partial) | `accumulateRawDurationsFromBlockFinals` uses **part `baseTime`** × event assignments, **not** `PartFinal.major/minor/minimizer`. Differential **offsets** use `getEventShapeByRoleWithOverrides(..., 'major'/'minor', mergedRoleOverrides)` — role labels, with overrides map currently always empty from merge. |
| `applyShapeToTime` (`appointmentSlotBuilder.ts`) | **8 → slot instance** | Builds `AppointmentSlot` with time ranges; calls `resolveEventShapes` / `adjustMinorTimeRange` / perspective-related paths. |
| `perspectiveResolver` / `derivePerspective` | **9** (downstream) | Uses event shapes + optional `differentialEventRoleOverrides` on models. |
| `minimizerEventShapes`, minimizer scheduling composables | **10** (downstream) | Uses `effectiveDifferentialRole` + placement for shape selection in minimizer path. |

**Finding for 20.4.2+:** `PartFinal.major` / `minor` / `minimizer` are **set** in `enrichBlockFinalsWithDifferentialRoles` and defaulted in `createPartFinal`, but **no production reader** in `client/` uses those ternaries for slot math (confirmed by search for `part.major` / `pf.major` / etc. outside `partFinalizer.ts`). Slot logic uses **event shape roles** via `getEventShapeByRoleWithOverrides` and **empty** `mergedRoleOverrides` today. Dev **`InstancesPanel.vue`** shows part shape, time, fee, zero-out, events — not the ternary flags.

---

## Consumer inventory (grep-backed, 2026-04-02)

### A. `enrichBlockFinalsWithDifferentialRoles` / `mergeBlockDifferentialRoleOverrides`

| File | Role |
|------|------|
| `client/src/utils/booking/partFinalizer.ts` | Defines both. |
| `client/src/utils/booking/appointmentSlotBuilder.ts` | Only caller of both. |
| `client/src/utils/booking/PartFinal.ts` | Comment references enrichment defaults. |

### B. `DifferentialRole` type imports (`@shared/types/differentialRole`) — client

| File | Role |
|------|------|
| `client/src/utils/booking/partFinalizer.ts` | Merge map + enrichment. |
| `client/src/utils/booking/partFinalizerSlotShape.ts` | `calculateSlotShape` param `mergedRoleOverrides`. |
| `client/src/utils/booking/partFinalizerSlotShapeHelpers.ts` | `computeDifferentialOffsetsFromMaps` param. |
| `client/src/utils/booking/perspectiveResolver.ts` | Optional overrides on resolve helpers. |
| `client/src/utils/booking/minimizerEventShapes.ts` | Template + effective role per event shape. |
| `client/src/utils/eventAttendeeUtils.ts` | `getEventShapeByRoleWithOverrides` + placement. |
| `client/src/types/appointmentModels.ts` | `differentialEventRoleOverrides`, perspective kind alias. |
| `client/src/constants/primitives.ts` | `DifferentialEventRoleOverridesMap`. |
| `client/src/utils/admin/differentialRoleMatrixRows.ts` | **Admin** matrix rows. |
| `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue` | **Admin** UI. |

### C. Shared package

| File | Role |
|------|------|
| `shared/types/differentialRole.ts` | Type definitions. |
| `shared/constants/differentialRoleMappings.ts` | Labels. |
| `shared/utils/differentialRoleUtils.ts` | `effectiveDifferentialRole`, sanitizers. |
| `shared/utils/eventPlacementUtils.ts` | `eventShapeDifferentialRoleFromPlacementFields`. |

### D. `differentialEventRoleOverrides` / `mergedRoleOverrides` flow

- **Produced:** `buildAppointmentShape` sets `differentialEventRoleOverrides` from `mergeBlockDifferentialRoleOverrides` → always `{}`.
- **Consumed:** Passed into `calculateSlotShape` as `mergedRoleOverrides`; forwarded on `AppointmentShape` for perspective / UI models. Non-empty path would require future wiring from appointment payload or admin overrides (not present in merge today).

### E. Server (legacy / validation only for this audit)

- `server/src/routes/internal/entities/eventShapeEntityValidation.ts`, `entitySanitizers.ts` — `eventShapeLegacyDifferentialRoleKeys` (sanitization / migration), not PartFinalizer.

---

## Task 20.4.1.1 status

- [x] Pipeline map and consumer inventory recorded (this log).

### Task 20.4.1.1: Task 20.4.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.1.2



## Completed Tasks

### Task 20.4.1.1: Task 20.4.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.1.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (3): `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.1.1-handoff.md`

### `git diff --stat HEAD`

```text
.../sessions/session-20.4.1-guide.md                   |  4 ++--
 .../sessions/session-20.4.1-log.md                     | 18 ++++++++++++++++++
 2 files changed, 20 insertions(+), 2 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-guide.md
index f0ee25ce..e400ab5d 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-guide.md
@@ -49,11 +49,11 @@ These sections contain session-specific content:
 **Description:** Map live pipeline vs FEATURE_20 §4.2; inventory differential-role / PartFinal layout consumers; optional inline removal of no-op `mergeBlockDifferentialRoleOverrides`.
 
 **Duration:** ~0.5–1 day
-**Status:** Not Started
+**Status:** In Progress
 
 ### Tasks
 
-- [x] #### Task 20.4.1.1: Pipeline map + consumer inventory
+- [x] - [x] #### Task 20.4.1.1: Pipeline map + consumer inventory
 **Goal:** Author §4.2 alignment table + grep-backed consumer list in `session-20.4.1-log.md` (or `DOMAIN_REWRITE_WORKLOG.md` if preferred).
 **Files:** `session-20.4.1-planning.md`, `session-20.4.1-log.md`, `client/src/utils/booking/` (pipeline modules), `client/src/utils/transformers/globalToBookingTransformer.ts`, `shared/utils/eventPlacementUtils.ts`, `shared/utils/differentialRoleUtils.ts`
 **Approach:** Read `buildAppointmentShape` chain; crosswalk to FEATURE_20 §4.1–4.2; document; grep `DifferentialRole`, `enrichBlockFinalsWithDifferentialRoles`, `PartFinal` major/minor/minimizer, override maps.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-log.md
index cf77590d..05081606 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-log.md
@@ -86,3 +86,21 @@
 ## Task 20.4.1.1 status
 
 - [x] Pipeline map and consumer inventory recorded (this log).
+
+### Task 20.4.1.1: Task 20.4.1.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.4.1.2
+
+
+
+## Completed Tasks
+
+### Task 20.4.1.1: Task 20.4.1.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.4.1.2
+
+<!-- end excerpt session -->
\ No newline at end of file
```
<!-- /harness:anchor:commit-preview -->
