# Session 20.3.2: — Service atomic editor (§8.3 #2):** **ServiceAtomicEditor** — service block-instance **convergence / atomic** editing aligned with §3 / §9 instance model (`orchestrator`, `composite`, `wizardVisible` where applicable).


### Task 20.3.2.1: Task 20.3.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.2.2



## Completed Tasks

### Task 20.3.2.2: Task 20.3.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.2.3



### Task 20.3.2.1: Task 20.3.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.2.2

<!-- end excerpt session -->



### Task 20.3.2.2: Task 20.3.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.2.3

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md`, `client/src/components/admin/generic/EntityCardContent.vue`, `client/src/composables/admin/useServiceAtomicPartRows.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.2.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.2.2-planning.md`, `client/src/components/admin/generic/ServiceAtomicEditor.vue`

### `git diff --stat HEAD`

```text
.../sessions/session-20.3.2-guide.md                     |  2 +-
 .../sessions/session-20.3.2-log.md                       | 15 +++++++++++++++
 .../src/components/admin/generic/EntityCardContent.vue   |  6 ++++++
 client/src/composables/admin/useServiceAtomicPartRows.ts | 16 +++++++++-------
 4 files changed, 31 insertions(+), 8 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md
index cc81c208..2ee80a36 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md
@@ -61,7 +61,7 @@ These sections contain session-specific content:
 **Approach:** Pure composable + explicit return type; document column mapping vs `PartInstanceEntity`; logger on failure paths.
 **Checkpoint:** Composable returns stable rows for a real service instance in dev; no UI required.
 
-- [ ] #### Task 20.3.2.2: ServiceAtomicEditor UI + EntityCard integration
+- [x] #### Task 20.3.2.2: ServiceAtomicEditor UI + EntityCard integration
 **Goal:** **VCard + VDataTable** (or equivalent) mounted from `EntityCardContent` for **service** instances only; surface convergence columns; save via existing **partInstance** update path; convergence-oriented labels.
 **Files:**
 - `client/src/components/admin/generic/ServiceAtomicEditor.vue` (new)
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md
index 65d532fd..16a79aaf 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md
@@ -11,6 +11,14 @@
 