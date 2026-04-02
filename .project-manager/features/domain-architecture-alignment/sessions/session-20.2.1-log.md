# Session 20.2.1: ** **Block shape & block instance** internal entity routes — validate renamed `type` values (`user`, `service`, `time`, `price`, `event`) and instance **`composite` / `orchestrator` / `wizardVisible`**; align batch CRUD + `entitySanitizers` / Joi with Sequelize models.


### Task 20.2.1.1: Task 20.2.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.1.2



## Completed Tasks

### Task 20.2.1.2: Task 20.2.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.1.3



### Task 20.2.1.1: Task 20.2.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.1.2

<!-- end excerpt session -->



### Task 20.2.1.2: Task 20.2.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.1.3

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md`, `server/src/routes/internal/entities/entityBulkRouter.ts`, `server/src/routes/internal/entities/entityCrudRouter.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.2.1.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.2.1.2-planning.md`, `server/src/routes/internal/entities/blockInstanceEntityValidation.ts`

### `git diff --stat HEAD`

```text
.../sessions/session-20.2.1-guide.md               |  2 +-
 .../sessions/session-20.2.1-log.md                 | 15 ++++++++++++
 .../routes/internal/entities/entityBulkRouter.ts   | 20 +++++++++++++++-
 .../routes/internal/entities/entityCrudRouter.ts   | 28 ++++++++++++++++++++++
 4 files changed, 63 insertions(+), 2 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md
index adda598e..0931478b 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md
@@ -59,7 +59,7 @@ These sections contain session-specific content:
 **Approach:** [Approach to take]
 **Checkpoint:** [What needs to be verified]
 
-- [ ] #### Task 20.2.1.2: [Task Name]
+- [x] #### Task 20.2.1.2: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md
index b8e98be4..328da691 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md
@@ -11,6 +11,14 @@
 