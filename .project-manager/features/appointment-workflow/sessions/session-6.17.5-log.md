# Session 6.17.5: Entity-policy rollout + documentation

## Completed Tasks

### Task 6.17.5.2: Task 6.17.5.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.5.3



### Task 6.17.5.1: Task 6.17.5.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.5.2

<!-- end excerpt session -->

### Task 6.17.5.2: Task 6.17.5.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.5.3

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md`, `client/src/utils/admin/dependencyDeleteContractKeys.ts`, `client/src/views/admin/entities/BlockShapeList.vue`, `.project-manager/features/appointment-workflow/sessions/task-6.17.5.2-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.17.5.2-planning.md`

### `git diff --stat HEAD`

```text
.../docs/delete-preflight-api-v1.md                |  22 ++-
 .../sessions/session-6.17.5-guide.md               |   2 +-
 .../sessions/session-6.17.5-log.md                 | 164 +--------------------
 .../utils/admin/dependencyDeleteContractKeys.ts    |   6 +-
 client/src/views/admin/entities/BlockShapeList.vue |  41 +++++-
 5 files changed, 68 insertions(+), 167 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md b/.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md
index 34a7d342..5bfe3fda 100644
--- a/.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md
+++ b/.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md
@@ -1,6 +1,11 @@
 # Delete preflight API — v1 (contract)
 
-**Status:** Specification only. Handlers are implemented in Phase **6.17.2** (Session 6.17.2).  
+**Status:** **Implemented** — HTTP handlers ship with entity routes (Phase **6.17.2**). Per-entity behavior is registered in **`server/src/services/entityDelete/dependencyDeleteRegistry.ts`** (`DependencyDeleteStrategy`: preflight, resolve, finalize).
+
+**Rolled-out entity types (server registry, Phase 6.17.5):** **`partShape`**, **`blockShape`**, **`annotationShape`**. Other `entityType` values return **404** from contract routes until a strategy is registered.
+
+**Client allowlist (must match registry):** `client/src/utils/admin/dependencyDeleteContractKeys.ts` — `DEPENDENCY_DELETE_CONTRACT_ENTITY_KEYS`. List and card entry points use **`AdminEntityDeleteWizard`** when the key is listed.
+
 **Shared types:** `@shared/types/adminDeleteDependency` (`DeletePreflightResponse`, `DeleteResolveRequest`, `DeleteResolveResponse`, `DeleteFinalizeRequest`, `DeleteFinalizeResponse`, `DeleteContractErrorCode`, `DeleteDependencyPolicy`, …).  
 **Policy semantics:** See `.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md` — do not introduce synonym policy strings; use the shared type literals only.
 
@@ -8,6 +13,18 @@
 
 ---
 
+## Adding a new entity key (checklist)
+
+1. **Server — dependency counts:** Add a small module (e.g. `count*DeleteDependencies`) that returns buckets and a **`totalCount`** aligned with FK / validity tables.
+2. **Server — strategy:** Implement **`DependencyDeleteStrategy`** (`preflight`, `resolve`, `finalize`) under `server/src/services/entityDelete/strategies/`, mirroring **`partShapeDependencyDeleteStrategy.ts`** for v1 noop-only resolve and transactional finalize with a re-count guard.
+3. **Server — registry:** Register the strategy in **`dependencyDeleteRegistry.ts`** using the same string as CRUD **`entityType`** (`ENTITY_KEYS` / camelCase as used in routes).
+4. **Client — allowlist:** Append the **`GlobalEntityKey`** to **`DEPENDENCY_DELETE_CONTRACT_ENTITY_KEYS`** and keep the **SYNC** comment pointed at **`dependencyDeleteRegistry.ts`**.
+5. **Client — surfaces:** For each **list** that calls **`entityListDelete`** / **`entityList`**, pass **`contractDelete`** that opens **`AdminEntityDeleteWizard`** (see **`PartShapeList.vue`** / **`BlockShapeList.vue`**). **Entity cards** pick up the wizard automatically via **`usesDependencyDeleteContract`** in **`useEntityCardActions`** when the key is allowlisted.
+6. **Server — legacy `DELETE` (optional):** If the entity already has a guard on raw **`DELETE /:entityType/:id`**, align it with the same dependency rules as preflight/finalize so one-shot delete does not bypass policy.
+7. **Docs:** Update this file’s **Rolled-out entity types** line when the key ships.
+
+---
+
 ## Base URL and auth
 
 | Item | Value |
@@ -181,5 +198,6 @@ Handlers should return JSON useful for admin UI. Align with existing entity rout
 ## Implementation pointer
 
 - **Contract doc (this file):** `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md`
-- **Router comment:** `server/src/routes/internal/entities/entityCrudRouter.ts` (planned mount location for 6.17.2).
+- **Router / facade:** `server/src/routes/internal/entities/entityCrudRouter.ts` and `entityDeleteContractFacade.ts` (delete-preflight, delete-resolve, delete-finalize).
+- **Registry:** `server/src/services/entityDelete/dependencyDeleteRegistry.ts`
 - **Constants:** `ENTITY_DELETE_ROUTE_SEGMENTS` in `entityConstants.ts`.
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md
index 8e61bdc5..a340ce2c 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md
@@ -59,7 +59,7 @@ These sections contain session-specific content:
 **Approach:** [Approach to take]
 **Checkpoint:** [What needs to be verified]
 
-- [ ] #### Task 6.17.5.2: [Task Name]
+- [x] #### Task 6.17.5.2: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md
index d7f2600d..3ebd6d52 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md
@@ -1,16 +1,15 @@
 # Session 6.17.5: Entity-policy rollout + documentation
 
+## Completed Tasks
 
-### Task 6.17.5.1: Task 6.17.5.1 ✅
+### Task 6.17.5.2: Task 6.17.5.2 ✅
 **Goal:** Task completed
 
 **Next Task:**
-- 6.17.5.2
+- 6.17.5.3
 
 
 
-## Completed Tasks
-
 ### Task 6.17.5.1: Task 6.17.5.1 ✅
 **Goal:** Task completed
 
@@ -19,158 +18,9 @@
 
 
-<!-- harness:anchor:commit-preview -->
-## Harness: commit preview (in-scope diff)
-
-Paths (12): `.project-manager/features/appointment-workflow/across-ladder.json`, `.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md`, `server/src/routes/internal/entities/entityConstants.ts`, `server/src/routes/internal/entities/entityCrudRouter.ts`, `server/src/services/entityDelete/dependencyDeleteRegistry.ts`, `.project-manager/features/appointment-workflow/sessions/task-6.17.5.1-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.17.5.1-planning.md`, `server/src/services/annotations/countAnnotationShapeDeleteDependencies.ts`, `server/src/services/blockShapes/`, `server/src/services/entityDelete/strategies/annotationShapeDependencyDeleteStrategy.ts`, `server/src/services/entityDelete/strategies/blockShapeDependencyDeleteStrategy.ts`
-
-### `git diff --stat HEAD`
-
-```text
-.../features/appointment-workflow/across-ladder.json  |  2 +-
- .../sessions/session-6.17.5-guide.md                  |  2 +-
- .../sessions/session-6.17.5-log.md                    | 18 ++++++++++++++++++
- .../src/routes/internal/entities/entityConstants.ts   |  5 ++++-
- .../src/routes/internal/entities/entityCrudRouter.ts  | 19 +++++++++++--------
- .../services/entityDelete/dependencyDeleteRegistry.ts |  4 ++++
- 6 files changed, 39 insertions(+), 11 deletions(-)
-```
+### Task 6.17.5.2: Task 6.17.5.2 ✅
+**Goal:** Task completed
 
-### `git diff HEAD`
+**Next Task:**
+- 6.17.5.3
 
-```diff
-diff --git a/.project-manager/features/appointment-workflow/across-ladder.json b/.project-manager/features/appointment-workflow/across-ladder.json
-index c3f7c4e7..cb08bcea 100644
---- a/.project-manager/features/appointment-workflow/across-ladder.json
-+++ b/.project-manager/features/appointment-workflow/across-ladder.json
-@@ -1,7 +1,7 @@
- {
-   "schemaVersion": 1,
-   "feature": "appointment-workflow",
--  "derivedAt": "2026-04-01T23:05:09.793Z",
-+  "derivedAt": "2026-04-01T23:07:03.952Z",
-   "sourceTier": "session",
-   "phasesOnDisk": [
-     "6.2",
-diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md
-index 4f2041a4..8e61bdc5 100644
---- a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md
-+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md
-@@ -52,7 +52,7 @@ These sections contain sessio
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
