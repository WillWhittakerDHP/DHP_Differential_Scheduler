# Session 6.16.2: Multiple minimizers — segments, composable, orchestrator


### Task 6.16.2.1: Task 6.16.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.16.2.2



## Completed Tasks

### Task 6.16.2.2: Task 6.16.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.16.2.3



### Task 6.16.2.1: Task 6.16.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.16.2.2

<!-- end excerpt session -->



### Task 6.16.2.2: Task 6.16.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.16.2.3


## Harness: commit preview (in-scope diff)

Paths (12): `.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md`, `client/src/composables/booking/useMinimizerPartsScheduling.ts`, `client/src/configs/wizardSettings/api.ts`, `client/src/types/minimizerScheduling.ts`, `client/src/utils/booking/minimizerDurationFromAppointmentShape.ts`, `client/src/utils/booking/minimizerEventShapes.ts`, `client/src/utils/booking/minimizerPartShapeName.ts`, `server/src/routes/internal/wizardSettings/wizardSettingsCrudRouter.ts`, `server/src/routes/internal/wizardSettings/wizardSettingsLogoUploadRouter.ts`, `.project-manager/features/appointment-workflow/sessions/task-6.16.2.2-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.16.2.2-planning.md`

### `git diff --stat HEAD`

```text
.../sessions/session-6.16.2-guide.md               |  2 +-
 .../sessions/session-6.16.2-log.md                 | 15 ++++++++
 .../booking/useMinimizerPartsScheduling.ts         | 42 +++++++++++-----------
 client/src/configs/wizardSettings/api.ts           | 14 ++++++--
 client/src/types/minimizerScheduling.ts            |  3 +-
 .../minimizerDurationFromAppointmentShape.ts       | 14 ++------
 client/src/utils/booking/minimizerEventShapes.ts   | 11 ++++++
 client/src/utils/booking/minimizerPartShapeName.ts | 26 ++++++++++++++
 .../wizardSettings/wizardSettingsCrudRouter.ts     |  3 +-
 .../wizardSettingsLogoUploadRouter.ts              |  3 +-
 10 files changed, 95 insertions(+), 38 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md
index 20d263c8..557ec757 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md
@@ -50,7 +50,7 @@ These sections contain session-specific content:
 **Approach:** [Approach to take]
 **Checkpoint:** [What needs to be verified]
 
-- [ ] #### Task 6.16.2.2: [Task Name]
+- [x] #### Task 6.16.2.2: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md
index 8420a949..a12118d1 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md
@@ -11,6 +11,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md`, `.project-manager/features/appointment-workflow/phases/phase-6.16-log.md`, `.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md`, `.project-manager/features/appointment-workflow/sessions/session-6.16.2-planning.md`, `.project-manager/features/appointment-workflow/sessions/task-6.16.2.1-planning.md`, `.project-manager/features/appointment-workflow/sessions/task-6.16.2.2-planning.md`, `.project-manager/features/appointment-workflow/planning-archive/session/6.16.2/`, `.project-manager/features/appointment-workflow/sessions/session-6.16.2-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-6.16-guide.md                     |   2 +-
 .../appointment-workflow/phases/phase-6.16-log.md  |   8 +
 .../sessions/session-6.16.2-guide.md               |   2 +
 .../sessions/session-6.16.2-log.md                 |   7 +-
 .../sessions/session-6.16.2-planning.md            | 238 +++++++++++++++------
 .../sessions/task-6.16.2.1-planning.md             | 149 -------------
 .../sessions/task-6.16.2.2-planning.md             | 142 ------------
 7 files changed, 187 insertions(+), 361 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md b/.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md
index 1b977603..1aaee846 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md
@@ -88,7 +88,7 @@ Use the same **`TernaryBoolean`** type as `major` / `minor` on **`PartFinal`**:
 **Tasks:** ENUM migration; shared types; part finalizer margin path; perspective + enrichment; admin override UI; lint + app start.
 **Focus:** Foundation: margin in storage/types/pipeline/admin; no silent fallback in resolver.
 
-- [ ] ### Session 6.16.2: Multiple minimizers — segments, composable, orchestrator
+- [x] ### Session 6.16.2: Multiple minimizers — segments, composable, orchestrator
 **Description:** Detection utilities for multiple minimizer shapes; `MinimizerSegment`-style types (or rename from `MoveableSegment`); `useMoveablePartsScheduling` multi-segment refactor with sequential boundary chaining; orchestrator / availability sub-step wiring.
 **Tasks:** Multi-minimizer detection; segment types; composable refactor; sequential boundaries; orchestrator wiring; lint + app start.
 **Focus:** Ordered multi-segment scheduling with correct inner/outer boundaries.
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.16-log.md b/.project-manager/features/appointment-workflow/phases/phase-6.16-log.md
index e10ab373..ba6c98cc 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.16-log.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.16-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 6.16.2: Multiple minimizers — segments, composable, orchestrator ✅
+**Completed:** 2026-03-25
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** Multiple minimizers — segments, composable, orchestrator
+
+
+
 ### Session 6.16.1: Margin role — types, pipeline, admin ✅
 **Completed:** 2026-03-25
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md
index 557ec757..05cab5f0 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-guide.md
@@ -402,3 +402,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md
index 006e482e..a1f2aabf 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md
@@ -78,4 +78,9 @@ index 8420a949..a12118d1 100644
 --- a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md
 +++ b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-planning.md b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-planning.md
index dfd3ba6d..33c5db98 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.16.2-planning.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.16.2-planning.md
@@ -1,30 +1,8 @@
-# Plan: session 6.16.2 — Multiple minimizers — segments, composable, orchestrator
-
-## Contract
-- **Tier:** session | **ID:** 6.16.2
-- **Scope:** Multiple minimizer event shapes — ordered segment detection, types/utilities, `useMoveablePartsScheduling` multi-segment + sequential boundaries, availability orchestrator / sub-step wiring.
-- **Governance (harness snapshot):**
-  - Governance Context (Session)
-  - Function Governance — Clean
-  - Component Governance — Clean
-  - Advisory: `useAvailabilitySubStepContent.ts` oversized return (pre-existing; not in this session’s file list unless we touch it)
-
-## Work Profile
-- **Execution intent:** plan
-- **Action type:** decomposition
-- **Scope shape:** cross_cutting
-- **Governance domains:** docs, architecture, booking
-- **Gate profile:** standard
-- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
-- **Recommended context pack:** decomposition_pack
-- **Planning artifact action:** create
-- **Decomposition mode:** moderate
-- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.
-
-## Where we left off
-Session **6.16.1** complete: `margin` on `DifferentialRole`, DB ENUM, `PartFinal.minimizer: 'override'` for margin, admin override dropdown, part finalizer + normalization. Phase guide session 6.16.2 row is the active focus.
+<!-- harness-planning-rollup tier=session id=6.16.2 consolidatedAt=2026-03-25T22:30:52.642Z -->
 
----
+# Consolidated planning: session 6.16.2
+
+## Session 6.16.2 (parent)
 
 ## Story
 
@@ -60,7 +38,7 @@ Session **6.16.1** complete: `margin` on `DifferentialRole`, DB ENUM, `PartFinal
 
 ---
 
-## Files (expected touch set)
+## Files
 
 | Area | Paths |
 |------|--------|
@@ -99,68 +77,192 @@ Session **6.16.1** complete: `margin` on `DifferentialRole`, DB ENUM, `PartFinal
 
 ---
 
-## Decomposition
+## Acceptance Criteria
+
+- [ ] Phase 6.16 guide intent for **6.16.2** satisfied: multi-minimizer detection + composable + orchestrator wiring.
+- [ ] No silent fallback when multiple minimizer shapes exist.
+- [ ] Client lint passes; app starts.
+- [ ] Session guide tasks 6.16.2.1 / 6.16.2.2 align with this decomposition (update guide at task-start if labels differ).
 
-### Task 6.16.2.1 — Minimizer segment detection + types
+---
 
-**Story:** Add pure utilities and types to list minimizer-role event shapes in canonical order and describe each segment for scheduling.
+---
 
-**Implementation orders:**
-1. Add ordered query helper (effective role `moveable` + overrides) with explicit return type; stable sort per `eventFinals` order.
-2. Add segment descriptor type(s) (shape id, duration minutes, label helper reusing `getMoveablePartShapeName` or equivalent).
-3. Add focused unit tests **only if** project re-enables tests in this phase — otherwise verify via lint + manual dev check (per project policy: tests suspended → **no new test files**).
+## Task 6.16.2.1 (source: task-6.16.2.1-planning.md)
 
-**Acceptance criteria:**
-- [ ] Helper returns empty array when no minimizer shapes; one entry when one shape; N entries when N distinct shapes match role.
-- [ ] Ordering matches `slotShape.eventFinals` traversal order.
-- [ ] No new `Ref | ComputedRef` unions on public composable APIs (types only in this task).
+### Story
 
-### Task 6.16.2.2 — Multi-segment composable + orchestrator wiring
+**This task adds** `listMinimizerSegmentsFromAppointmentShape` (name may be finalized) **and** `MinimizerSegmentDescriptor` **because** `getEventShapeByRoleWithOverrides(..., 'moveable')` only returns **one** shape while templates can contain **multiple** event finals whose **effective** role is minimizer storage (`moveable`). Task **6.16.2.2** will consume the ordered list without re-implementing role resolution.
 
-**Story:** Refactor `useMoveablePartsScheduling` to consume ordered segments and chain boundaries; connect `useAvailabilityOrchestrator` (and sub-step content) to the expanded contract.
+---
 
-**Implementation orders:**
-1. Replace single-shape assumption with segment list from 6.1
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
