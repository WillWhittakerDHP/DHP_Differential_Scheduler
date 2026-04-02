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



### Task 20.4.4.1: Task 20.4.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.4.2

<!-- end excerpt session -->



### Task 20.4.4.1: Task 20.4.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.4.2

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (2): `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md`

### `git diff --stat HEAD`

```text
.../sessions/session-20.4.4-guide.md                      |  2 +-
 .../sessions/session-20.4.4-log.md                        | 15 +++++++++++++++
 2 files changed, 16 insertions(+), 1 deletion(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
index 8626e54f..3725a3bf 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [x] #### Task 20.4.4.1: `perspectiveResolver` — dead `resolveEventShapes` overrides + dedupe `derivePerspective`
+- [x] - [x] #### Task 20.4.4.1: `perspectiveResolver` — dead `resolveEventShapes` overrides + dedupe `derivePerspective`
 **Goal:** Drop unused **`overrides`** param from **`resolveEventShapes`**; route **`derivePerspective`** through **`resolveEventShapes`** + **`derivePerspectiveWithResolved`**.
 **Files:** `client/src/utils/booking/perspectiveResolver.ts` (callers already single-arg)
 **Approach:** Refactor + **`vue-tsc`** / client lint.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
index 4734c832..cb6a1cac 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
@@ -11,6 +11,14 @@
 