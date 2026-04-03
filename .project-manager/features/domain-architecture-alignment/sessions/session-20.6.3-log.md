# Session 20.6.3 Log: Legacy differential-role and event-shape remnants

**Status:** In Progress
**Date:** 2026-04-03

---

## Session Goal

[Document concrete session goal]

### Task 20.6.3.1: Task 20.6.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.6.3.2



## Completed Tasks

### Task 20.6.3.1: Task 20.6.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.6.3.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (10): `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-planning.md`, `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`, `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`, `client/src/constants/primitives.ts`, `client/src/utils/admin/differentialRoleMatrixRows.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.6.3.1-handoff.md`

### `git diff --stat HEAD`

```text
.../across-ladder.json                             |   2 +-
 .../sessions/session-20.6.3-guide.md               |   8 +-
 .../sessions/session-20.6.3-handoff.md             |  13 ++
 .../sessions/session-20.6.3-log.md                 |  18 ++
 .../sessions/session-20.6.3-planning.md            |   4 +-
 .../fields/DifferentialEventRoleOverridesField.vue | 189 ---------------------
 .../appliedDisplay/blockInstanceDisplays.ts        |  10 --
 client/src/constants/primitives.ts                 |   6 -
 .../src/utils/admin/differentialRoleMatrixRows.ts  |  70 --------
 9 files changed, 38 insertions(+), 282 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index 1766e848..e2401135 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-03T15:14:58.674Z",
+  "derivedAt": "2026-04-03T15:18:35.688Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-guide.md
index a91ea6ce..67c4614e 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-guide.md
@@ -48,11 +48,11 @@ These sections contain session-specific content:
 **Description:** Remove **block-instance `differentialEventRoleOverrides`** admin UI and related **booking/types** after placement-first migration; simplify **event-attendee** helpers; scan **event-instance** admin remnants. **Do not** remove **availability differential perspectives** (unrelated).
 
 **Duration:** Medium (2 tasks)
-**Status:** Planning filled — await **`/accepted-plan`**, then **`/task-start 20.6.3.1`**
+**Status:** In Progress filled — await **`/accepted-plan`**, then **`/task-start 20.6.3.1`**
 
 ### Tasks
 
-- [ ] #### Task 20.6.3.1: Admin — strip override matrix and field plumbing
+- [x] #### Task 20.6.3.1: Admin — strip override matrix and field plumbing
 **Goal:** Delete **`DifferentialEventRoleOverridesField`**, **`differentialRoleMatrixRows`**, **`blockInstanceDisplays.differentialEventRoleOverrides`**, and any **FieldRenderer / code-first** hook for **`differentialEventRoleOverrides`**; tighten **`primitives` / `GlobalFieldKey`** if the key is removed.
 **Files:**
 - `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`
@@ -64,11 +64,11 @@ These sections contain session-specific content:
 **Checkpoint:** **`rg differentialEventRoleOverrides`** clean in admin configs/components.
 
 - [ ] #### Task 20.6.3.2: Booking + types + optional event-instance remnant scan
-**Goal:** Remove **`differentialEventRoleOverrides`** from **`appointmentModels`** and consumers; simplify **`eventAttendeeUtils`** (placement-derived roles only); review **`entityTransformers`**; optional **EventInstance*** standalone path cleanup if provably dead.
+**Goal:** Remove **`differentialEventRoleOverrides`** from **`appointmentModels`** and consumers; simplify **`eventAttendeeUtils`** (placement-derived roles only); review **`entityTransformers`**; optional **event-instance** admin component cleanup if provably dead.
 **Files:**
 - `client/src/types/appointmentModels.ts`, `client/src/utils/eventAttendeeUtils.ts`, booking callers
 - `client/src/utils/transformers/entityTransformers.ts`
-- Optionally `client/src/views/admin/tabs/components/EventInstance*.vue` + related composables
+- Optionally `EventInstanceEditor.vue`, `EventInstanceBuilderBody.vue`, and siblings under `views/admin/tabs/components/` + related composables
 **Approach:** Typecheck-first refactors; no **PartFinalizer** behavior change except dead-branch removal with identical placement-only outcomes.
 **Checkpoint:** Lint + vue-tsc; **`DOMAIN_REWRITE_WORKLOG.md`** one-line note; brief smoke (admin + wizard availability).
 
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-handoff.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-handoff.md
index e1d6b90c..01bebd9a 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-handoff.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-handoff.md
@@ -22,3 +22,16 @@
 **Scope:** FEATURE_20 **§8.6** — remove **legacy block-instance differential event role overrides** and booking/type remnants; **placement_kind + anchor_edge** + **event_assignments** are canonical. **Do not** conflate with **wizard / availability “differential perspectives”**.
 
 **Planning:** `sessions/session-20.6.3-planning.md` (Goal, Acceptance Criteria, **## Decomposition**).
+
+<!-- harness-across-ladder:start -->
+## Across ladder (harness)
+
+_Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._
+
+- **Feature:** `domain-architecture-alignment` · **Source:** session · **Derived:** 2026-04-03T15:18:35.688Z
+- **Phases on disk (6):** 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
+- **Focus phase:** `20.6` · **Next phase across:** _(none — after phase-end use /feature-end if last)_
+- **Focus session:** `20.6.3` · **Session 3/4 in phase** · **Next session across:** `20.6.4` → `/session-start 20.6.4`
+- **Tasks in session (detected):** 2 · **Next task across:** `20.6.3.1` → `/task-start` / cascade
+- **Manifest:** `.project-manager/features/domain-architecture-alignment/across-ladder.json`
+<!-- harness-across-ladder:end -->
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-log.md
index 81443740..527a99aa 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-log.md
@@ -8,3 +8,21 @@
 ## Session Goal
 
 [Document concrete session goal]
+
+### Task 20.6.3.1: Task 20.6.3.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.6.3.2
+
+
+
+## Completed Tasks
+
+### Task 20.6.3.1: Task 20.6.3.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.6.3.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-planning.md
index b5bf0ca3..48e03d51 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-planning.md
@@ -251,7 +251,7 @@ Injected docs above are not a substitute for opening real code. Search/read `cli
   - `client/src/utils/transformers/entityTransformers.ts`
   - `server/src/routes/internal/entities/eventShapeLegacyDifferentialRoleKeys.ts` (retain if still needed for API rejection; delete only if redundant)
   - **Field wiring:** `FieldRenderer.vue` / `PrimitiveInputs.vue` / `codeFirstMetadataCache.ts` — only if **`differentialEventRoleOverrides`** still registered
-  - **Event instance UI:** `client/src/views/admin/tabs/components/EventInstance*.vue`, related composables under `composables/admin/useInstancesTab*`
+  - **Event instance UI:** `client/src/views/admin/tabs/components/EventInstanceEditor.vue`, `EventInstanceBuilderBody.vue`, `EventInstanceListItem.vue`, `EventInstanceTemplateFields.vue`, `EventInstancePreviewPanel.vue`, `EventInstanceCalendarSettings.vue`, `EventInstanceVariableChips.vue`; composables under `composables/admin/useInstancesTab*`
 
 ## Approach
 1. **Task 20.6.3.1:** **Grep** `differentialEventRoleOverrides` / **`DifferentialEventRoleOverrides`** / matrix component; remove **admin** field component + **blockInstance** display row + **matrix rows** util if orphaned; tighten **`primitives.ts`** / **FieldRenderer** wiring so the property cannot render; smoke **Instances** tab block instance form (**Events** panel / field groups).
@@ -282,7 +282,7 @@ Injected docs above are not a substitute for opening real code. Search/read `cli
   - **Checkpoint:** Grep clean for component name and field key in admin configs.
 
 - **Task 
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
