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

Paths (2): `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md`

### `git diff --stat HEAD`

```text
.../domain-architecture-alignment/phases/phase-20.3-log.md        | 8 ++++++++
 .../domain-architecture-alignment/sessions/session-20.3.4-log.md  | 2 ++
 2 files changed, 10 insertions(+)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
index 1bc5024f..a0724c8a 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
@@ -25,6 +25,14 @@
 
 
 
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
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
index beb48d18..dcb6d7f4 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.4-log.md
@@ -241,3 +241,5 @@ index b367d0aa..0f6c624f 100644
 … (truncated)
 ```
 <!-- /harness:anchor:commit-preview -->
+
+
```
<!-- /harness:anchor:commit-preview -->
