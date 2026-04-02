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

<!-- harness:anchor:commit-preview -->
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
 