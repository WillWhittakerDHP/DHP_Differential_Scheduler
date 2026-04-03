# Session 20.6.2 Log: EntityCard tree and façade consumers

**Status:** In Progress
**Date:** 2026-04-03

---

## Session Goal

[Document concrete session goal]

### Task 20.6.2.1: Task 20.6.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.6.2.2



## Completed Tasks

### Task 20.6.2.2: Task 20.6.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.6.2.3



### Task 20.6.2.1: Task 20.6.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.6.2.2

<!-- end excerpt session -->



### Task 20.6.2.2: Task 20.6.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.6.2.3


## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-log.md`, `client/src/components/admin/generic/AdminEntityEditorPanel.vue`, `client/src/components/admin/generic/EntityCard.vue`, `client/src/components/admin/generic/collections/RelationshipCollection.vue`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.6.2.2-handoff.md`

### `git diff --stat HEAD`

```text
.../ENTITY_CARD_CONSUMERS_20.6.md                  | 45 ++++---------
 .../sessions/session-20.6.2-guide.md               |  2 +-
 .../sessions/session-20.6.2-log.md                 | 15 +++++
 .../admin/generic/AdminEntityEditorPanel.vue       |  4 +-
 client/src/components/admin/generic/EntityCard.vue | 73 ----------------------
 .../generic/collections/RelationshipCollection.vue | 22 ++-----
 6 files changed, 37 insertions(+), 124 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md b/.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md
index 57ec6548..874d8e0a 100644
--- a/.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md
+++ b/.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md
@@ -1,45 +1,26 @@
 # EntityCard consumer inventory (phase 20.6)
 
-**Scope change (2026-04):** **`EntityCard`** removal is part of the same Pass 6 cleanup as **full** admin metadata stack removal (see **`DOMAIN_REWRITE_WORKLOG.md` → `### Admin metadata retirement (Pass 5 narrative)`**). Façades must be replaced with **domain editors**, not preserved as a permanent metadata exception.
+**Scope change (2026-04):** **`EntityCard.vue`** (generic SFC name) is **removed** from the client. **`AdminEntityEditorPanel.vue`** is the shared shell until FEATURE_20 **§3.6** domain editors and **§6.3a** full inner-tree deletion land.
 
-**Purpose:** Remaining entry points that still mount or import **`EntityCard.vue`**, for FEATURE_20 **§6.3a** deletion planning. **Last updated:** task **20.6.2.1** (partial).
+**Purpose:** Historical tracker for Pass 6 **§6.3a** work. **Last updated:** task **20.6.2.2**.
 
-## Task 20.6.2.1 status
+## Task 20.6.2.2 status
 
-- **`AdminEntityEditorPanel.vue`** holds the former **`EntityCard`** implementation (expansion shell + content + dialogs).
-- **Tab/modal consumers** below now import **`AdminEntityEditorPanel.vue`**, not **`EntityCard.vue`**.
-- **`EntityCard.vue`** is a **thin wrapper** around **`AdminEntityEditorPanel`** for **`RelationshipCollection`** async import until **20.6.2.2**.
+- **`EntityCard.vue`** — **deleted** (no file on disk).
+- **`RelationshipCollection.vue`** imports **`AdminEntityEditorPanel`** directly (no async **`EntityCard`** chunk).
+- **Remaining `EntityCard*` SFCs** (`EntityCardContent`, `EntityCardSubPanels`, etc.) and **`useEntityCard*`** composables — **still in use** by **`AdminEntityEditorPanel`**; **not** deleted in 20.6.2 (see FEATURE_20 **§6.3a** for the later full inventory).
 
-## Façade note
+## Client imports of `EntityCard.vue`
 
-- **`AnnotationShapeListCard.vue`** wraps **`AdminEntityEditorPanel`** with fixed `entity-key="annotationShape"` (no **`EntityCard`** import).
+**None.** (Verify: `rg 'EntityCard\\.vue' client/src`.)
 
-## Remaining imports of `EntityCard.vue` (client)
+## Current shell
 
-| Path | Role |
-|------|------|
-| `client/src/components/admin/generic/collections/RelationshipCollection.vue` | `defineAsyncComponent(() => import('../EntityCard.vue'))` — **migrate in 20.6.2.2** |
-| `client/src/components/admin/generic/EntityCard.vue` | Thin forwarder only (not a “consumer” in the product sense) |
-
-## Migrated off `EntityCard.vue` (20.6.2.1)
-
-| Path | Replacement |
-|------|-------------|
-| `client/src/views/admin/tabs/components/ShapesTabEventPanel.vue` | `AdminEntityEditorPanel` |
-| `client/src/views/admin/tabs/components/ShapesTabPartPanel.vue` | `AdminEntityEditorPanel` |
-| `client/src/views/admin/tabs/components/ShapeCardList.vue` | `AdminEntityEditorPanel` |
-| `client/src/views/admin/tabs/components/BlockInstancesGroup.vue` | `AdminEntityEditorPanel` |
-| `client/src/views/admin/tabs/components/ShapeCreationForm.vue` | `AdminEntityEditorPanel` |
-| `client/src/components/admin/BulkEditModal.vue` | `AdminEntityEditorPanel` |
-| `client/src/components/admin/BlockInstanceCreateModal.vue` | `AdminEntityEditorPanel` |
-| `client/src/components/admin/generic/AnnotationShapeListCard.vue` | `AdminEntityEditorPanel` |
-
-## Internal tree (delete with generic name in 20.6.2.2)
-
-Coupled for §6.3a: `EntityCardContent.vue`, `EntityCardSubPanels.vue`, `EntityCardPrimaryTitleRow.vue`, `EntityCardPartsTotals.vue`, `EntityCardFeePreview.vue`, **`AdminEntityEditorPanel.vue`** (or its successor shell), and `useEntityCard*` composables per FEATURE_20 §6.3a.
+| Component | Role |
+|-----------|------|
+| `client/src/components/admin/generic/AdminEntityEditorPanel.vue` | Expansion + title + `EntityCardContent` + save/delete dialogs |
 
 ## Reference
 
-- `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` — §6.3a
-- `sessions/task-20.3.5.2-planning.md`
+- `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` — §3.6, §6.3a, §8.6
 - `ANNOTATION_METADATA_DEFERRALS_20.6.md`
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-guide.md
index 2948d173..14c419dd 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-guide.md
@@ -61,7 +61,7 @@ These sections contain session-specific content:
 **Approach:** Domain-named **`VExpansionPanel`** (or equivalent) parents that reuse **`EntityCardContent`** + existing **`useEntityCard*`** wiring; smoke after each cluster.
 **Checkpoint:** `rg EntityCard` leaves **`RelationshipCollection`** (and not-yet-deleted generic files) as the only **`EntityCard.vue`** importers.
 
-- [ ] #### Task 20.6.2.2: RelationshipCollection + delete tree
+- [x] #### Task 20.6.2.2: RelationshipCollection + delete tree
 **Goal:** Remove **`defineAsyncComponent`** **`EntityCard`** from **`RelationshipCollection`**; delete **`EntityCard.vue`** and coupled SFCs; prune dead **`useEntityCard*`** / **`entityCard*`** modules; update **`ENTITY_CARD_CONSUMERS_20.6.md`**.
 **Files:**
 - `client/src/components/admin/generic/RelationshipCollection.vue`
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-log.md
index 9f1ca257..386e9c17 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-log.md
@@ -19,6 +19,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (5): `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-log.md`

### `git diff --stat HEAD`

```text
.../phases/phase-20.6-guide.md                         |  2 +-
 .../phases/phase-20.6-log.md                           |  8 ++++++++
 .../sessions/session-20.6.2-guide.md                   |  2 ++
 .../sessions/session-20.6.2-handoff.md                 | 18 +++++++++---------
 .../sessions/session-20.6.2-log.md                     |  7 ++++++-
 5 files changed, 26 insertions(+), 11 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md
index 232aba3e..dca55ff1 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md
@@ -101,7 +101,7 @@ Session guides/logs are created at **`/session-start`**. Trace execution to **FE
 - Author **migration(s)** to drop or detach metadata tables (names from **§6.3a** + live models under **`server/src/db/models/admin/`**); do not run DDL on remote **DB_HOST**.
 - Verify admin UI smoke paths still load for shapes/instances/settings without metadata rows.
 
-- [ ] ### Session 20.6.2: EntityCard tree and façade consumers
+- [x] ### Session 20.6.2: EntityCard tree and façade consumers
 **Description:** Replace or inline remaining **`EntityCard.vue`** import sites in **`ENTITY_CARD_CONSUMERS_20.6.md`**; delete **`EntityCard*`** shell components and **`useEntityCard*`** composables when import graph is zero.
 
 **Tasks:**
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-log.md
index 9d0a389d..b2a5617a 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 20.6.2: EntityCard tree and façade consumers ✅
+**Completed:** 2026-04-03
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** EntityCard tree and façade consumers
+
+
+
 ### Session 20.6.1: Admin metadata stack removal (server + client API) ✅
 **Completed:** 2026-04-03
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-guide.md
index 14c419dd..961a1687 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-guide.md
@@ -417,3 +417,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-handoff.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-handoff.md
index c1d09659..9344f28c 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-handoff.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-handoff.md
@@ -8,21 +8,21 @@
 
 ## Current Status
 
-**Last Completed:** Session planning filled (`session-20.6.2-planning.md`, guide task embeds)  
-**Next task:** 20.6.2.1 — list surfaces, modals, annotation façade  
+**Last Completed:** Task 
+**Next Session:** Session 20.6.3
 **Git Branch:** `feature/domain-architecture-alignment`
+**Last Updated:** 2026-04-03
 
 ## Next Action
 
-1. Run **`/accepted-plan`** (gate: `context_gathering` from **`/session-start 20.6.2`**).  
-2. After success, run **`/task-start 20.6.2.1`** and implement per planning **## Decomposition**.
+Start Session 20.6.3 (see session guide and phase guide for scope).
 
 ## Transition Context
 
-**Where we left off:** Session **20.6.1** shipped code-first metadata + server metadata teardown + migration. Session **20.6.2** planning documents EntityCard consumer replacement and tree deletion.
+**Where we left off:**
+Completed Task 
 
-**What you need to start task work:**
+**What you need to start:**
+- Begin Session 20.6.3
 
-- Canonical inventory: **`ENTITY_CARD_CONSUMERS_20.6.md`**
-- Planning: **`sessions/session-20.6.2-planning.md`** (Goal, Acceptance Criteria, two tasks)
-- Phase context: **`phases/phase-20.6-guide.md`** § Session 20.6.2
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-log.md
index 61ad9a22..4560dc02 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-log.md
@@ -145,4 +145,9 @@ index 9f1ca257..386e9c17 100644
 --- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-log.md
 +++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-log.md
 @@ -19,6 +19,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
```
<!-- /harness:anchor:commit-preview -->
