# Session 20.4.1: Pipeline audit + safe dead-code (booking)

**Last updated:** 2026-04-02 (inventory amended after task **20.4.1.2**)

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
| ~~`mergeBlockDifferentialRoleOverrides`~~ | Removed **20.4.1.2** | Was no-op `{}`; inlined in `buildAppointmentShape`. |
| `calculateSlotShape` + `partFinalizerSlotShapeHelpers` (`partFinalizerSlotShape.ts`) | **6–8** (partial) | `accumulateRawDurationsFromBlockFinals` uses **part `baseTime`** × event assignments, **not** `PartFinal.major/minor/minimizer`. Differential **offsets** use `getEventShapeByRoleWithOverrides(..., 'major'/'minor', mergedRoleOverrides)` — role labels; overrides map still `{}` from `buildAppointmentShape`. |
| `applyShapeToTime` (`appointmentSlotBuilder.ts`) | **8 → slot instance** | Builds `AppointmentSlot` with time ranges; calls `resolveEventShapes` / `adjustMinorTimeRange` / perspective-related paths. |
| `perspectiveResolver` / `derivePerspective` | **9** (downstream) | Uses event shapes + optional `differentialEventRoleOverrides` on models. |
| `minimizerEventShapes`, minimizer scheduling composables | **10** (downstream) | Uses `effectiveDifferentialRole` + placement for shape selection in minimizer path. |

**Finding for 20.4.2+:** `PartFinal.major` / `minor` / `minimizer` are **set** in `enrichBlockFinalsWithDifferentialRoles` and defaulted in `createPartFinal`, but **no production reader** in `client/` uses those ternaries for slot math (confirmed by search for `part.major` / `pf.major` / etc. outside `partFinalizer.ts`). Slot logic uses **event shape roles** via `getEventShapeByRoleWithOverrides` and **empty** `mergedRoleOverrides` today. Dev **`InstancesPanel.vue`** shows part shape, time, fee, zero-out, events — not the ternary flags.

---

## Consumer inventory (grep-backed, 2026-04-02)

### A. `enrichBlockFinalsWithDifferentialRoles` (and former merge helper)

| File | Role |
|------|------|
| `client/src/utils/booking/partFinalizer.ts` | Defines `enrichBlockFinalsWithDifferentialRoles` only (**20.4.1.2** removed `mergeBlockDifferentialRoleOverrides`). |
| `client/src/utils/booking/appointmentSlotBuilder.ts` | Calls enrichment; inlines `{}` for `differentialEventRoleOverrides`. |
| `client/src/utils/booking/PartFinal.ts` | Comment references enrichment defaults. |

### B. `DifferentialRole` type imports (`@shared/types/differentialRole`) — client

| File | Role |
|------|------|
| `client/src/utils/booking/partFinalizer.ts` | Enrichment + resolve helpers. |
| `client/src/utils/booking/partFinalizerSlotShape.ts` | `calculateSlotShape` param `mergedRoleOverrides`. |
| `client/src/utils/booking/appointmentSlotBuilder.ts` | `DifferentialRole` for empty overrides map on `AppointmentShape`. |
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

- **Produced:** `buildAppointmentShape` sets `differentialEventRoleOverrides` to `{}` (inlined after **20.4.1.2**; former merge helper removed).
- **Consumed:** Passed into `calculateSlotShape` as `mergedRoleOverrides`; forwarded on `AppointmentShape` for perspective / UI models. Non-empty path would require future wiring from appointment payload or admin overrides (not present in merge today).

### E. Server (legacy / validation only for this audit)

- `server/src/routes/internal/entities/eventShapeEntityValidation.ts`, `entitySanitizers.ts` — `eventShapeLegacyDifferentialRoleKeys` (sanitization / migration), not PartFinalizer.

---

## Task 20.4.1.1 status
- [x] Pipeline map and consumer inventory recorded (this log).

## Completed Tasks

### Task 20.4.1.1: Pipeline map + consumer inventory ✅

**Completed:** 2026-04-02  
**Goal:** §4.2 crosswalk + grep-backed consumer inventory in this log.  
**Next task:** 20.4.1.2 (done)

### Task 20.4.1.2: Safe dead-code (merge overrides) ✅

**Completed:** 2026-04-02  
**Goal:** Inline `{}` for `differentialEventRoleOverrides`; remove `mergeBlockDifferentialRoleOverrides` (`client` commit `cc4e9a3f`).  
**Next step:** `/session-end 20.4.1`



## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/domain-architecture-alignment/phases/phase-20.4-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.1.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.1.2-planning.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.4-log.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.4.1/`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-20.4-guide.md                     |   2 +-
 .../sessions/session-20.4.1-guide.md               |   2 +
 .../sessions/session-20.4.1-log.md                 |   8 ++
 .../sessions/session-20.4.1-planning.md            | 142 ++++++++++++++-------
 .../sessions/task-20.4.1.1-planning.md             |  91 -------------
 .../sessions/task-20.4.1.2-planning.md             |  82 ------------
 6 files changed, 104 insertions(+), 223 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.4-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.4-guide.md
index 6ce073d8..3fa417c5 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.4-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.4-guide.md
@@ -72,7 +72,7 @@ Run sessions **in order** (see **phase-20.4-planning.md** § Decomposition). Cas
 
 Harness expects each session below as `### Session X.Y.Z:` (do not remove headings — tier-start uses them to sync decomposition and scaffold session guides).
 
-- [ ] ### Session 20.4.1: Pipeline audit + safe dead-code
+- [x] ### Session 20.4.1: Pipeline audit + safe dead-code
 
 **Description:** Document the current PartFinalizer / booking chain vs **§4.2**; inventory every **DifferentialRole** / role-enrichment / **PartFinal** major-minor-minimizer consumer; remove only **confirmed** dead branches without behavior change elsewhere.
 
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-guide.md
index bbae3994..1ecb5c85 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-guide.md
@@ -413,3 +413,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-log.md
index 71ee273b..086c7d80 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-log.md
@@ -100,3 +100,11 @@
 **Completed:** 2026-04-02  
 **Goal:** Inline `{}` for `differentialEventRoleOverrides`; remove `mergeBlockDifferentialRoleOverrides` (`client` commit `cc4e9a3f`).  
 **Next step:** `/session-end 20.4.1`
+
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-planning.md
index b3f9e20a..9cf752b6 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-planning.md
@@ -1,17 +1,8 @@
-# Plan: session 20.4.1 — Pipeline audit + safe dead-code (booking)
+<!-- harness-planning-rollup tier=session id=20.4.1 consolidatedAt=2026-04-02T21:30:35.596Z -->
 
-## Contract
-- **Tier:** session | **ID:** 20.4.1
-- **Scope:** Map the client booking pipeline (`globalToBooking` → `buildAppointmentShape` / PartFinalizer) against FEATURE_20 **§4.1–4.2**; inventory **`DifferentialRole`**, **`enrichBlockFinalsWithDifferentialRoles`**, **`PartFinal.major|minor|minimizer`**, and override maps; apply only **confirmed** dead-code cleanup (no behavioral change).
-- **Governance:** Booking + architecture docs; thin edits; explicit return types on touched exports; logger in any new catch paths (N/A if no try/catch added).
+# Consolidated planning: session 20.4.1
 
-## Work Profile
-- **Execution intent:** plan → tasks
-- **Gate profile:** standard
-- **Downstream:** Tasks **20.4.1.1** then **20.4.1.2**; later sessions **20.4.2+** own role-removal refactors.
-
-## Where we left off
-Phase **20.4** accepted; **`/accepted-plan`** completed for the phase. First session is **read-only mapping** plus **minimal** deletion/inline of dead plumbing.
+## Session 20.4.1 (parent)
 
 ## Story
 
@@ -21,29 +12,6 @@ Phase **20.4** accepted; **`/accepted-plan`** completed for the phase. First ses
 
 ---
 
-## Architecture pointers (read with code — not a substitute for recon)
-
-- **FEATURE_20** §4.1 (current chain), §4.2 (target numbered steps), §4.3 (removals), §4.4 (ordering).
-- **ARCHITECTURE.md** §10 (PartFinalizer client boundary), §8–9 (block / instance model).
-- Full text: `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`, `.project-manager/ARCHITECTURE.md`.
-
-## Codebase recon
-
-- **Paths reviewed:**
-  - **Global → booking:** `client/src/utils/transformers/globalToBookingTransformer.ts` (`transformGlobalToBooking`), `globalToBookingTransformerBlocks.ts`, `globalToBookingPartInstanceTransform.ts`
-  - **Appointment shape / slots:** `client/src/utils/booking/appointmentSlotBuilder.ts` (`buildAppointmentShape`, `applyShapeToTime`), `appointmentTimeCalculations.ts`
-  - **Block/part finals:** `client/src/utils/booking/blockFinalizer.ts`, `BlockFinal.ts`, `partFinalizer.ts` (`createPartFinals`, `filterZeroedParts`, `enrichBlockFinalsWithDifferentialRoles`, `mergeBlockDifferentialRoleOverrides`), `PartFinal.ts`, `client/src/types/booking/partFinal.ts`
-  - **Slot math:** `partFinalizerSlotShape.ts` (`calculateSlotShape`), `partFinalizerSlotShapeHelpers.ts` (`accumulateRawDurationsFromBlockFinals`, `computeDifferentialOffsetsFromMaps`, role-based major/minor pick via `getEventShapeByRoleWithOverrides`)
-  - **Perspective / minimizer (downstream):** `perspectiveResolver.ts`, `minimizerEventShapes.ts`, `client/src/composables/booking/useAppointmentShape.ts` (calls `buildAppointmentShape`)
-  - **Shared role / placement:** `shared/utils/eventPlacementUtils.ts` (`eventShapeDifferentialRoleFromPlacementFields`), `shared/utils/differentialRoleUtils.ts`, `shared/types/differentialRole.ts`
-  - **Wizard models:** `client/src/types/appointmentModels.ts` (`differentialEventRoleOverrides`, perspective kinds)
-  - **Admin (out of execute scope but referenced):** `client/src/utils/admin/differentialRoleMatrixRows.ts`, `DifferentialEventRoleOverridesField.vue`
-- **Patterns / call sites:**
-  - **`buildAppointmentShape`** runs `createBlockFinals` → `filterZeroedBlocks` → `buildEventAssignmentsByPartShape` (when event data provided) → **`enrichBlockFinalsWithDifferentialRoles`** (placement → `DifferentialRole` → **`PartFinal.major|minor|minimizer`**) → **`mergeBlockDifferentialRoleOverrides`** → **`calculateSlotShape`**. Slot duration rollup uses **`eventAssignmentsByPartShape` × `baseTime` per part shape**, not the ternary flags directly; **differential offsets** still resolve **major/minor event shapes** via **`getEventShapeByRoleWithOverrides`** and an override map (today always `{}` from merge).
-  - **`mergeBlockDifferentialRoleOverrides`** is implemented as **`return {}`** with a comment that block-level overrides were removed — **dead by design**; only caller is `appointmentSlotBuilder.ts`.
-  - **`enrichBlockFinalsWithDifferentialRoles`** is only called from **`buildAppointmentShape`**; it folds **event instance → event shape → placement → `effectiveDifferentialRole(..., null)`** into part-level ternaries.
-- **Gaps / unknowns:** Whether any **runtime** path still supplies non-empty **`differentialEventRoleOverrides`** on **`AppointmentShape`** from outside `buildAppointmentShape` (search at task time). Minimizer / perspective chains to be fully traced in **20.4.1.1** deliverable table.
-
 ## Analysis
 
 - **Why now:** Phase **20.4** depends on an accurate picture before **§4.3** deletes (`PartFinal` role fields, enrichment). Skipping inventory risks breaking slot or perspective ordering.
@@ -86,24 +54,100 @@ Produce an **authoritative pipeline map** (current vs §4.2) and a **consumer in
 - [ ] Any code deletion is **provably** no-op; **client lint** passes on touched
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
