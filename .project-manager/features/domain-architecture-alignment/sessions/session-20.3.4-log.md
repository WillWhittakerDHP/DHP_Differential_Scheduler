# Session 20.3.4: — Segment manager relocation (§8.3 #4):** Move or embed **segment / event-instance** management from `InstancesTab` **Events** surface into **event block-instance** editing (per-instance segment list, links to `eventInstance` CRUD); keep API alignment with **20.2**.


### Task 20.3.4.1: Task 20.3.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.4.2



## Completed Tasks

### Task 20.3.4.2: Task 20.3.4.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.4.3



### Task 20.3.4.1: Task 20.3.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.4.2

<!-- end excerpt session -->



### Task 20.3.4.2: Task 20.3.4.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.4.3


## Harness: commit preview (in-scope diff)

Paths (16): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md`, `client/src/components/admin/generic/fields/EventInstanceTemplateRef.vue`, `client/src/composables/admin/useEventInstancesSection.ts`, `client/src/composables/admin/useInstancesTab.ts`, `client/src/composables/admin/useInstancesTabEventInstance.ts`, `client/src/composables/admin/useInstancesTabEventInstanceDrag.ts`, `client/src/types/admin/adminInjectionKeys.ts`, `client/src/types/admin/instancesTab.ts`, `client/src/types/admin/instancesTabEventInstance.ts`, `client/src/types/admin/instancesTabEventInstanceDrag.ts`, `client/src/utils/admin/mountEventInstancesDragAndDrop.ts`, `client/src/views/admin/tabs/InstancesTab.vue`, `client/src/views/admin/tabs/components/EventInstancesSection.vue`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.4.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.4.2-planning.md`

### `git diff --stat HEAD`

```text
.../sessions/session-20.3.4-guide.md               |   2 +-
 .../sessions/session-20.3.4-log.md                 |  15 +++
 .../generic/fields/EventInstanceTemplateRef.vue    |   2 +-
 .../composables/admin/useEventInstancesSection.ts  | 100 ----------------
 client/src/composables/admin/useInstancesTab.ts    |  97 +--------------
 .../admin/useInstancesTabEventInstance.ts          | 130 ---------------------
 .../admin/useInstancesTabEventInstanceDrag.ts      |  71 -----------
 client/src/types/admin/adminInjectionKeys.ts       |  20 +---
 client/src/types/admin/instancesTab.ts             |   3 -
 .../src/types/admin/instancesTabEventInstance.ts   |  11 --
 .../types/admin/instancesTabEventInstanceDrag.ts   |  10 --
 .../utils/admin/mountEventInstancesDragAndDrop.ts  |   2 +-
 client/src/views/admin/tabs/InstancesTab.vue       |  68 +++--------
 .../tabs/components/EventInstancesSection.vue      | 110 -----------------
 14 files changed, 36 insertions(+), 605 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md
index 668c4b29..b67aaebb 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md
@@ -59,7 +59,7 @@ These sections contain session-specific content:
 **Approach:** [Approach to take]
 **Checkpoint:** [What needs to be verified]
 
-- [ ] #### Task 20.3.4.2: [Task Name]
+- [x] #### Task 20.3.4.2: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
index 51f4df03..d722f912 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
@@ -11,6 +11,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.4.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.4.2-planning.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.3.4/`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-20.3-guide.md                     |   2 +-
 .../phases/phase-20.3-log.md                       |   8 +
 .../sessions/session-20.3.4-guide.md               |   2 +
 .../sessions/session-20.3.4-log.md                 |   7 +-
 .../sessions/session-20.3.4-planning.md            | 351 ++++++++-------------
 .../sessions/task-20.3.4.1-planning.md             | 176 -----------
 .../sessions/task-20.3.4.2-planning.md             | 163 ----------
 7 files changed, 153 insertions(+), 556 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
index d146e147..c9c06cd7 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
@@ -100,7 +100,7 @@ Harness expects each session below as `### Session X.Y.Z:` (do not remove headin
 
 **Tasks:** Reuse patterns from 20.3.1–20.3.2; keep shapes structural, instances behavioral.
 
-- [ ] ### Session 20.3.4: Segment manager relocation (§8.3 #4)
+- [x] ### Session 20.3.4: Segment manager relocation (§8.3 #4)
 
 **Description:** Move or embed segment / **eventInstance** management from Instances tab “Events” island into **event block-instance** editing; stay aligned with Phase **20.2** APIs.
 
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
index f175c66e..1bc5024f 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 20.3.4: Segment manager relocation (§8.3 #4) ✅
+**Completed:** 2026-04-02
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** — Segment manager relocation (§8.3 #4):** Move or embed **segment / event-instance** management from `InstancesTab` **Events** surface into **event block-instance** editing (per-instance segment list, links to `eventInstance` CRUD); keep API alignment with **20.2**.
+
+
+
 ### Session 20.3.3: Remaining domain editors (§8.3 #3) ✅
 **Completed:** 2026-04-02
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md
index b67aaebb..9df38f25 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-guide.md
@@ -414,3 +414,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
index 4d5e484f..96471f90 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
@@ -82,4 +82,9 @@ index 51f4df03..d722f912 100644
 --- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
 +++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-planning.md
index b367d0aa..0f6c624f 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-planning.md
@@ -1,284 +1,205 @@
-# Plan: session 20.3.4 — Segment manager relocation (FEATURE_20 §8.3 #4)
-
-## Contract
-- **Tier:** session | **ID:** 20.3.4
-- **Scope:** Relocate **segment / `eventInstance`** management from the **Instances tab → Events** surface into **event-shaped block instance** editing (per-block-instance segment list + CRUD), aligned with Phase **20.2** entity/relationship APIs and server validation (`parentBlockInstanceId` on create).
-- **Governance (harness snapshot):**
-  - Governance Context (Session)
-  - Function Governance
-  - Clean — no violations detected.
-  - Component Governance
-  - Clean — no violations detected.
-  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
-  - `client/src/composables/admin/useEntityCardSaveAndActions.ts` — oversized-return: Return surface has 14 properties; decompose into focused composables
-  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Re
-  - … _(truncated)_
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
-Completed Task - Begin Session 20.3.4 <!-- harness-across-ladder:start -->
+<!-- harness-planning-rollup tier=session id=20.3.4 consolidatedAt=2026-04-02T20:41:01.746Z -->
+
+# Consolidated planning: session 20.3.4
+
+## Session 20.3.4 (parent)
 
 ## Story
+
 **This session delivers** an **event block instance–scoped** segment (event instance) manager **so that** admins configure **calendar segments where the orchestration lives** (on the event block instance card), not on a separate **Instances → Events** island — matching FEATURE_20 **§8.3 #4** and keeping **Shapes** structural-only.
 
 **Estimated size:** M (UI relocation + shared CRUD wiring + tab cleanup)
 
 ---
-## Architecture context (harness-injected)
-
-## 1. System overview
-
-Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:
-
-- **Public booking users** — wizard-style scheduling and property/availability flows.
-- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.
-
-TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often batch-prefetched (e.g. router navigation guards).
 
----
+## Analysis
 
-## 2. Domain map
+- **Problem / why now:** §8.3 sequence places **segment relocation** after domain editors (**20.3.3**). Today, segments are edited under **Instances → Events**, away from the **event block instance** that owns orchestration context — admins lack a single place to manage “this block’s calendar segments.”
+- **Domain boundaries:** **Admin / config** client; **reuse** existing `eventInstance` entity CRUD and relationship routes from Phase **20.2** — **no** new booking math, **no** PartFinalizer changes. Server validation already treats **`parentBlockInstanceId`** as required on create; client must align.
+- **Patterns:** Thin **EntityCard** slices + composables; reuse **`EventInstanceBuilderBody`**, **`EventInstanceListItem`**, template variable warnings, and drag/order patterns from `useInstancesTabEventInstanceDrag` where possible rather than duplicating templates.
+- **Risks:** Shrinking **`InstancesTabContext`** or removing the Events tab without a clear **empty state** may confuse admins — mitigate with copy + link to open the right block shape tab. Drag-and-drop refs (`eventInstancesContainer`) are tied to Instances tab today; **20.3.4.1** must re-bind or replace with a card-local container.
+- **Alternatives considered:** (a) Keep global Events tab as read-only aggregate —
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
