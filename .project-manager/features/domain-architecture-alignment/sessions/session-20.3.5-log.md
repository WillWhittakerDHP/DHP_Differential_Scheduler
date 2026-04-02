# Session 20.3.5: — Annotation metadata + EntityCard wave (§8.3 #5):** Narrow non-annotation metadata scope where plan allows; replace lowest-risk **EntityCard** usage with focused component(s); document remaining EntityCard debt for **20.6**.


### Task 20.3.5.1: Task 20.3.5.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.5.2



## Completed Tasks

### Task 20.3.5.2: Task 20.3.5.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.5.3



### Task 20.3.5.1: Task 20.3.5.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.5.2

<!-- end excerpt session -->



### Task 20.3.5.2: Task 20.3.5.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.5.3


## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/features/domain-architecture-alignment/ANNOTATION_METADATA_DEFERRALS_20.6.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md`, `client/src/views/admin/tabs/components/ShapesTabAnnotationPanel.vue`, `.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.5.2-handoff.md`, `client/src/components/admin/generic/AnnotationShapeListCard.vue`

### `git diff --stat HEAD`

```text
.../ANNOTATION_METADATA_DEFERRALS_20.6.md                 |  1 +
 .../sessions/session-20.3.5-guide.md                      |  2 +-
 .../sessions/session-20.3.5-log.md                        | 15 +++++++++++++++
 .../admin/tabs/components/ShapesTabAnnotationPanel.vue    |  6 ++----
 4 files changed, 19 insertions(+), 5 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/ANNOTATION_METADATA_DEFERRALS_20.6.md b/.project-manager/features/domain-architecture-alignment/ANNOTATION_METADATA_DEFERRALS_20.6.md
index d31ca464..04d10d07 100644
--- a/.project-manager/features/domain-architecture-alignment/ANNOTATION_METADATA_DEFERRALS_20.6.md
+++ b/.project-manager/features/domain-architecture-alignment/ANNOTATION_METADATA_DEFERRALS_20.6.md
@@ -18,3 +18,4 @@
 
 - `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` — §6.3, §6.3a
 - `sessions/task-20.3.5.1-planning.md`
+- **`ENTITY_CARD_CONSUMERS_20.6.md`** — remaining `EntityCard.vue` import sites + façade note (task 20.3.5.2)
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md
index 3545b493..fb2b2439 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md
@@ -59,7 +59,7 @@ These sections contain session-specific content:
 **Approach:** [Approach to take]
 **Checkpoint:** [What needs to be verified]
 
-- [ ] #### Task 20.3.5.2: [Task Name]
+- [x] #### Task 20.3.5.2: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md
index ffe15225..d1873163 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md
@@ -11,6 +11,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.5.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.5.2-planning.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.3.5/`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-20.3-guide.md                     |   2 +-
 .../phases/phase-20.3-log.md                       |   8 +
 .../sessions/session-20.3.5-guide.md               |   2 +
 .../sessions/session-20.3.5-log.md                 |   7 +-
 .../sessions/session-20.3.5-planning.md            | 384 +++++++++------------
 .../sessions/task-20.3.5.1-planning.md             | 134 -------
 .../sessions/task-20.3.5.2-planning.md             | 140 --------
 7 files changed, 180 insertions(+), 497 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
index c9c06cd7..265fa6ee 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
@@ -106,7 +106,7 @@ Harness expects each session below as `### Session X.Y.Z:` (do not remove headin
 
 **Tasks:** UX design in session plan → wire `EventInstancesSection` / block-instance flows → regression pass on Instances + Shapes tabs.
 
-- [ ] ### Session 20.3.5: Annotation metadata + EntityCard wave (§8.3 #5)
+- [x] ### Session 20.3.5: Annotation metadata + EntityCard wave (§8.3 #5)
 
 **Description:** Annotation-only metadata narrowing where plan allows; first high-confidence **EntityCard** replacement slice; document remaining debt for **20.6**.
 
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
index a0724c8a..711df9d6 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 20.3.5: Annotation metadata + EntityCard wave (§8.3 #5) ✅
+**Completed:** 2026-04-02
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** — Annotation metadata + EntityCard wave (§8.3 #5):** Narrow non-annotation metadata scope where plan allows; replace lowest-risk **EntityCard** usage with focused component(s); document remaining EntityCard debt for **20.6**.
+
+
+
 ### Session 20.3.4: Segment manager relocation (§8.3 #4) ✅
 **Completed:** 2026-04-02
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md
index fb2b2439..153468c0 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-guide.md
@@ -414,3 +414,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md
index 426f8127..9f298387 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md
@@ -80,4 +80,9 @@ index ffe15225..d1873163 100644
 --- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md
 +++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-planning.md
index ec795545..b60fed1f 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.5-planning.md
@@ -1,297 +1,239 @@
-# Plan: session 20.3.5 — Annotation metadata + EntityCard wave (FEATURE_20 §8.3 #5)
-
-## Contract
-- **Tier:** session | **ID:** 20.3.5
-- **Scope:** Narrow non-annotation metadata exposure where the plan allows; replace the **lowest-risk** `EntityCard` usage with a focused domain component; document remaining `EntityCard` debt for phase **20.6** (full deletion per FEATURE_20 §6.3a — out of scope here).
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
-Session **20.3.4** shipped event segment editing on event block instance cards and removed the redundant Instances → Events island; branch pushed. <!-- harness-across-ladder:start -->
+<!-- harness-planning-rollup tier=session id=20.3.5 consolidatedAt=2026-04-02T21:03:36.828Z -->
+
+# Consolidated planning: session 20.3.5
+
+## Session 20.3.5 (parent)
 
 ## Story
+
 **This session delivers** (1) tighter **annotation** metadata surfacing in admin configs/modals and (2) a **first** `EntityCard` replacement at a **single, high-confidence** call site **so that** the admin UI aligns with FEATURE_20 **§8.3** item **#5** and phase **20.6** has an explicit debt list — without deleting the shared `EntityCard` tree yet.
 **Estimated size:** M (metadata audit + one replacement + documentation)
 
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
+- **Why now:** Phase **20.3** sequence (§8.3) places annotation metadata narrowing and the start of EntityCard replacement **after** placement, service atomic, other domain editors, and segment relocation — those are done through **20.3.4**.
+- **Domains:** Admin/config client only; **no** booking math or PartFinalizer changes. Annotations remain **wizard presentation** metadata (see ARCHITECTURE.md domain map).
+- **Boundaries:** Do not remove the shared `EntityCard` component or composable tree in this session; one **call-site** replacement + **docs** for **20.6**.
+- **Patterns:** Prefer extracting a **`AnnotationShape*` focused card** (or reusing subcomponents from `EntityCardContent` / field renderers) over forking generic metadata for all entities.
+- **Risks:** Drag-and-drop ordering for annotation shapes must stay wired (`draggable-annotation-shape`, `useShapesTab` refs). Save/delete parity with current `EntityCard` events (`@saved`, `@delete`).
+- **Alternatives considered:** (a) Replace `ShapeCreationForm` first — **rejected** for wave 1: multi-`entityKey` generic surface, lower confidence. (b) Replace `ShapesTabAnnotationPanel` loop only — **selec
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
