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

### Task 20.6.2.1: Task 20.6.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.6.2.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (20): `.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md`, `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.1-handoff.md`, `client/src/components/admin/BlockInstanceCreateModal.vue`, `client/src/components/admin/BulkEditModal.vue`, `client/src/components/admin/generic/AnnotationShapeListCard.vue`, `client/src/components/admin/generic/EntityCard.vue`, `client/src/views/admin/tabs/components/BlockInstancesGroup.vue`, `client/src/views/admin/tabs/components/ShapeCardList.vue`, `client/src/views/admin/tabs/components/ShapeCreationForm.vue`, `client/src/views/admin/tabs/components/ShapesTabEventPanel.vue`, `client/src/views/admin/tabs/components/ShapesTabPartPanel.vue`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.6.2.1-handoff.md`, `client/src/components/admin/generic/AdminEntityEditorPanel.vue`

### `git diff --stat HEAD`

```text
.../ENTITY_CARD_CONSUMERS_20.6.md                  |  46 ++-
 .../across-ladder.json                             |  12 +-
 ...eature-domain-architecture-alignment-handoff.md |   2 +-
 .../phases/phase-20.6-handoff.md                   |   2 +-
 .../sessions/session-20.6.1-handoff.md             |   2 +-
 .../components/admin/BlockInstanceCreateModal.vue  |   6 +-
 client/src/components/admin/BulkEditModal.vue      |   6 +-
 .../admin/generic/AnnotationShapeListCard.vue      |   8 +-
 client/src/components/admin/generic/EntityCard.vue | 456 ++-------------------
 .../admin/tabs/components/BlockInstancesGroup.vue  |   8 +-
 .../views/admin/tabs/components/ShapeCardList.vue  |   8 +-
 .../admin/tabs/components/ShapeCreationForm.vue    |   4 +-
 .../admin/tabs/components/ShapesTabEventPanel.vue  |   4 +-
 .../admin/tabs/components/ShapesTabPartPanel.vue   |   4 +-
 14 files changed, 87 insertions(+), 481 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md b/.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md
index df7a4b3a..57ec6548 100644
--- a/.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md
+++ b/.project-manager/features/domain-architecture-alignment/ENTITY_CARD_CONSUMERS_20.6.md
@@ -2,29 +2,41 @@
 
 **Scope change (2026-04):** **`EntityCard`** removal is part of the same Pass 6 cleanup as **full** admin metadata stack removal (see **`DOMAIN_REWRITE_WORKLOG.md` → `### Admin metadata retirement (Pass 5 narrative)`**). Façades must be replaced with **domain editors**, not preserved as a permanent metadata exception.
 
-**Purpose:** Remaining entry points that still mount or import **`EntityCard.vue`**, for FEATURE_20 **§6.3a** deletion planning. Last updated with task **20.3.5.2**.
+**Purpose:** Remaining entry points that still mount or import **`EntityCard.vue`**, for FEATURE_20 **§6.3a** deletion planning. **Last updated:** task **20.6.2.1** (partial).
 
-## Façade note (20.3.5.2)
+## Task 20.6.2.1 status
 
-- **`AnnotationShapeListCard.vue`** wraps **`EntityCard`** with fixed `entity-key="annotationShape"`. The Shapes → Annotations **tab panel** no longer imports `EntityCard` directly; **removing** `EntityCard` from the bundle still requires replacing this façade with an inline domain editor (or shared extracted shell) in **20.6**.
+- **`AdminEntityEditorPanel.vue`** holds the former **`EntityCard`** implementation (expansion shell + content + dialogs).
+- **Tab/modal consumers** below now import **`AdminEntityEditorPanel.vue`**, not **`EntityCard.vue`**.
+- **`EntityCard.vue`** is a **thin wrapper** around **`AdminEntityEditorPanel`** for **`RelationshipCollection`** async import until **20.6.2.2**.
 
-## Direct imports of `EntityCard.vue` (client)
+## Façade note
+
+- **`AnnotationShapeListCard.vue`** wraps **`AdminEntityEditorPanel`** with fixed `entity-key="annotationShape"` (no **`EntityCard`** import).
+
+## Remaining imports of `EntityCard.vue` (client)
 
 | Path | Role |
 |------|------|
-| `client/src/views/admin/tabs/components/ShapesTabEventPanel.vue` | Event shape list rows |
-| `client/src/views/admin/tabs/components/ShapesTabPartPanel.vue` | Part shape list rows |
-| `client/src/views/admin/tabs/components/ShapeCardList.vue` | Generic shape cards |
-| `client/src/views/admin/tabs/components/BlockInstancesGroup.vue` | Block instance cards |
-| `client/src/views/admin/tabs/components/ShapeCreationForm.vue` | New-shape create form |
-| `client/src/components/admin/generic/collections/RelationshipCollection.vue` | `defineAsyncComponent(() => import('../EntityCard.vue'))` |
-| `client/src/components/admin/BulkEditModal.vue` | Bulk edit |
-| `client/src/components/admin/BlockInstanceCreateModal.vue` | Create modal |
-| `client/src/components/admin/generic/AnnotationShapeListCard.vue` | Annotation shape list façade (this task) |
-
-## Internal tree (delete with `EntityCard.vue`)
-
-Not separate “consumers” but coupled for §6.3a: `EntityCardContent.vue`, `EntityCardSubPanels.vue`, `EntityCardPrimaryTitleRow.vue`, `EntityCardPartsTotals.vue`, `EntityCardFeePreview.vue`, and `useEntityCard*` composables listed in FEATURE_20 §6.3a.
+| `client/src/components/admin/generic/collections/RelationshipCollection.vue` | `defineAsyncComponent(() => import('../EntityCard.vue'))` — **migrate in 20.6.2.2** |
+| `client/src/components/admin/generic/EntityCard.vue` | Thin forwarder only (not a “consumer” in the product sense) |
+
+## Migrated off `EntityCard.vue` (20.6.2.1)
+
+| Path | Replacement |
+|------|-------------|
+| `client/src/views/admin/tabs/components/ShapesTabEventPanel.vue` | `AdminEntityEditorPanel` |
+| `client/src/views/admin/tabs/components/ShapesTabPartPanel.vue` | `AdminEntityEditorPanel` |
+| `client/src/views/admin/tabs/components/ShapeCardList.vue` | `AdminEntityEditorPanel` |
+| `client/src/views/admin/tabs/components/BlockInstancesGroup.vue` | `AdminEntityEditorPanel` |
+| `client/src/views/admin/tabs/components/ShapeCreationForm.vue` | `AdminEntityEditorPanel` |
+| `client/src/components/admin/BulkEditModal.vue` | `AdminEntityEditorPanel` |
+| `client/src/components/admin/BlockInstanceCreateModal.vue` | `AdminEntityEditorPanel` |
+| `client/src/components/admin/generic/AnnotationShapeListCard.vue` | `AdminEntityEditorPanel` |
+
+## Internal tree (delete with generic name in 20.6.2.2)
+
+Coupled for §6.3a: `EntityCardContent.vue`, `EntityCardSubPanels.vue`, `EntityCardPrimaryTitleRow.vue`, `EntityCardPartsTotals.vue`, `EntityCardFeePreview.vue`, **`AdminEntityEditorPanel.vue`** (or its successor shell), and `useEntityCard*` composables per FEATURE_20 §6.3a.
 
 ## Reference
 
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index 6f806c80..4ae8b4a0 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,8 +1,8 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-03T14:48:28.514Z",
-  "sourceTier": "session_end",
+  "derivedAt": "2026-04-03T14:51:19.481Z",
+  "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
     "20.2",
@@ -52,10 +52,10 @@
       "20.6.4"
     ]
   },
-  "focusSessionId": "20.6.1",
+  "focusSessionId": "20.6.2",
   "sessionAcrossTotal": 4,
-  "sessionIndex0Based": 0,
-  "nextSessionAcross": "20.6.2",
+  "sessionIndex0Based": 1,
+  "nextSessionAcross": "20.6.3",
   "taskAcrossTotal": 2,
-  "nextTaskAcross": "20.6.1.1"
+  "nextTaskAcross": "20.6.2.1"
 }
diff --git a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
index 08262dd8..31a1c0af 100644
--- a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
+++ b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
@@ -85,7 +85,7 @@ Continue Phase 20.3: run **`/session-start 20.3.5`** on branch `feature/domain-a
 
 _Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._
 
-- **Feature:** `domain-architecture-alignment` · **Source:** session_end · **Derived:** 2026-04-03T14:48:28.514Z
+- **Feature:** `domain-architecture-alignment` · **Source:** session_end · **Derived:** 2026-04-03T14:48:52.195Z
 - **Phases on disk (6):** 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
 - **Focus phase:** `20.6` · **Next phase across:** _(none — after phase-end use /feature-end if last)_
 - **Focus session:** `20.6.1` · **Session 1/4 in phase** · **Next session across:** `20.6.2` → `/session-start 20.6.2`
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md
index 65ddaebd..c239105d 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md
@@ -43,7 +43,7 @@ Run **`/session-start 20.6.1`** (then **`/accepted-code`** when the harness prom
 
 _Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._
 
-- **Feature:** `domain-architecture-alignment` · **Source:** session_end · **Derived:** 2026-04-03T14:48:28.514Z
+- **Feature:** `domain-architecture-alignment` · **Source:** session_end · **Derived:** 2026-04-03T14:48:52.195Z
 - **Phases on disk (6):** 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
 - **Focus phase:** `20.6` · **Next phase across:** _(none — after phase-end use /feature-end if last)_
 - **Focus session:** `20.6.1` · **Session 1
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
