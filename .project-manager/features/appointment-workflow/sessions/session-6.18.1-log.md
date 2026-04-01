# Session 6.18.1: Shared role catalog + `seller` → `owner` + full-stack audit


### Task 6.18.1.1: Task 6.18.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.18.1.2



## Completed Tasks

### Task 6.18.1.1: Task 6.18.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.18.1.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (15): `.project-manager/features/appointment-workflow/across-ladder.json`, `.project-manager/features/appointment-workflow/sessions/session-6.18.1-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.18.1-log.md`, `server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`, `server/docs/SECURITY_STUBS.md`, `server/src/constants/userRoles.ts`, `server/src/db/models/participantModels/Users.ts`, `server/src/middlewares/ownershipChecks.ts`, `server/src/middlewares/ownershipEnforcement.ts`, `server/src/routes/internal/appointments/appointmentRouter.ts`, `server/src/routes/schemas/userSchemas.ts`, `server/src/utils/userTypeMapping.ts`, `.project-manager/features/appointment-workflow/sessions/task-6.18.1.1-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.18.1.1-planning.md`, `server/src/db/migrations/20260432_000056_rename_users_user_role_seller_to_owner.mjs`

### `git diff --stat HEAD`

```text
.../features/appointment-workflow/across-ladder.json  |  2 +-
 .../sessions/session-6.18.1-guide.md                  |  2 +-
 .../sessions/session-6.18.1-log.md                    | 18 ++++++++++++++++++
 server/docs/INTERNAL_API_ENACTMENT_MATRIX.md          |  5 +++--
 server/docs/SECURITY_STUBS.md                         |  4 ++--
 server/src/constants/userRoles.ts                     | 11 ++++++++---
 server/src/db/models/participantModels/Users.ts       | 19 +++----------------
 server/src/middlewares/ownershipChecks.ts             | 14 ++++++++++----
 server/src/middlewares/ownershipEnforcement.ts        | 13 +++++++++----
 .../routes/internal/appointments/appointmentRouter.ts | 14 ++++++++++++--
 server/src/routes/schemas/userSchemas.ts              | 10 +---------
 server/src/utils/userTypeMapping.ts                   | 16 +++++++++++-----
 12 files changed, 79 insertions(+), 49 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/across-ladder.json b/.project-manager/features/appointment-workflow/across-ladder.json
index 42717f69..dc3b8f89 100644
--- a/.project-manager/features/appointment-workflow/across-ladder.json
+++ b/.project-manager/features/appointment-workflow/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "appointment-workflow",
-  "derivedAt": "2026-04-01T23:32:59.460Z",
+  "derivedAt": "2026-04-01T23:36:42.389Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "6.2",
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.18.1-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.18.1-guide.md
index 72d8a377..eb18cef1 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.18.1-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.18.1-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 6.18.1.1: [Task Name]
+- [x] #### Task 6.18.1.1: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.18.1-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.18.1-log.md
index d807c7cb..d5494ba5 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.18.1-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.18.1-log.md
@@ -1,2 +1,20 @@
 # Session 6.18.1: Shared role catalog + `seller` → `owner` + full-stack audit
 
+
+### Task 6.18.1.1: Task 6.18.1.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.18.1.2
+
+
+
+## Completed Tasks
+
+### Task 6.18.1.1: Task 6.18.1.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 6.18.1.2
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/server/docs/INTERNAL_API_ENACTMENT_MATRIX.md b/server/docs/INTERNAL_API_ENACTMENT_MATRIX.md
index 87f735ca..3e4828e8 100644
--- a/server/docs/INTERNAL_API_ENACTMENT_MATRIX.md
+++ b/server/docs/INTERNAL_API_ENACTMENT_MATRIX.md
@@ -31,7 +31,7 @@ Express mounts **`InternalRouter`** at `v1Router.use("/internal", …)` (`server
 | `/relationships` | Admin + booking (instances, annotations) | Mixed — wizard reads relationship data | **Mutations:** staff / ownership per route | See relationship CRUD routers |
 | `/properties` | Wizard (property selection); admin | Mixed | **Mutations:** staff-scoped / ownership per registry | `property` / `propertyType` rules in `ownershipRegistry.ts` |
 | `/users` | Admin; rare wizard | **Default:** no for CRUD | **Yes** for user record access | Tighten with `requireAuth` + role where not already implied |
-| `/appointments` | Wizard (create/update); admin tables | **Yes** for core booking flows | **Ownership** via `checkOwnership('appointment', …)`; **not** a blanket `requireAuth` on the router | **`GET /list-for-admin-entry`:** **`requireAuth`** + **`requireRole(agent, transaction_manager, seller, admin)`** (task **7.4.4.2**) |
+| `/appointments` | Wizard (create/update); admin tables | **Yes** for core booking flows | **Ownership** via `checkOwnership('appointment', …)`; **not** a blanket `requireAuth` on the router | **`GET /list-for-admin-entry`:** **`requireAuth`** + **`requireRole(agent, transaction_manager, owner, admin)`** (task **7.4.4.2**; Phase 6.18.1 renamed **`seller`** → **`owner`**) |
 | `/appointment-fee-summaries` | Admin / appointment flows | TBD | **Likely staff** for sensitive fee data | Confirm callers; align with `appointmentFeeSummary` ownership |
 | `/availability` | Wizard — **`POST /availability/computed-data`** | **Yes** (core wizard) | — | Route uses `csrfProtection` + `validateRequest` today |
 | `/business-settings` | Admin; wizard **GET** availability policy | **GET** `availability_settings` often yes for booking UX | **PUT/PATCH** mutations **staff/admin** | `businessSetting` special cases in ownership registry |
@@ -86,4 +86,5 @@ Mounted **before** the generic `/internal` stack: `v1Router.use("/internal/auth"
 
 | Date | Change |
 |------|--------|
-| 2026-03-25 | **7.4.4.2:** `GET /appointments/list-for-admin-entry` — `requireAuth` + `requireRole(USER_ROLE_AGENT, 'transaction_manager', 'seller', 'admin')` (`appointmentRouter.ts`). |
+| 2026-03-25 | **7.4.4.2:** `GET /appointments/list-for-admin-entry` — `requireAuth` + `requireRole` with staff roles (`appointmentRouter.ts`). |
+| 2026-04-01 | **6.18.1.1:** `user_role` enum + `requireRole` use **`owner`** (renamed from **`seller`**) (`appointmentRouter.ts`, migration `20260432_000056_*`). |
diff --git a/server/docs/SECURITY_STUBS.md b/server/docs/SECURITY_STUBS.md
index f205e3bc..ca47ba9c 100644
--- a/server/docs/SECURITY_STUBS.md
+++ b/server/docs/SECURITY_STUBS.md
@@ -352,7 +352,7 @@ Expect `400` with JSON body containing `error: 'Validation failed'` and `details
 2. **`dynamic_entity`** — Used for **`entity`** CRUD: requires `req.entityConfig` (from entity route setup) and **`findByPk`** on the configured model. **Mutations are allowed only for internal staff roles** (see below); others get **403**.
 3. **`special`** — Custom logic in `ownershipEnforcement.ts` (e.g. **`businessSetting`** keyed by `key` param + availability constant; **`calendarSetting`** / **`wizardSetting`** singleton admin paths; **`appointmentFeeSummary`** via parent **`Appointment.scheduledById`**; **`property`** / **`propertyType`** / staff-scoped integration models). See registry `reason` / `notes` for intent; behavior is defined in code.
 
-**Internal staff roles** (bypass or replace strict row-level user match where enforcement implements it): **`agent`**, **`transaction_manager`**, **`seller`** (`isInternalStaffRole` in `ownershipEnforcement.ts`). Product rules may still require a loaded row to exist (404 when missing).
+**Internal staff roles** (bypass or replace strict row-level user match where enforcement implements it): **`agent`**, **`transaction_manager`**, **`owner`** (DB/API rename from legacy **`seller`**, Phase 6.18.1 — `isInternalStaffRole` in `ownershipEnforcement.ts`). Product rules may still require a loaded row to exist (404 when missing).
 
 **Logging:** Denials and misconfiguration (e.g. `req.user` missing, unknown `resourceName`, unhandled special resource) are logged at **warn** or **error** with stable messages — see `ownershipLogger` / `checkOwnership:` prefixes in code.
 
@@ -374,7 +374,7 @@ Expect `400` with JSON body containing `error: 'Validation failed'` and `details
 | 2 | **User row:** Same method on **`/api/v1/internal/users/{userA_id}`**. | Success (**2xx**) if body is valid |
 | 3 | **Appointment:** `GET` **`/api/v1/internal/appointments/{appointment_owned_by_B}`** as User A (session on GET). | **403** ownership denial (appointment uses `scheduledById` in registry) |
 | 4 | **Appointment:** `GET` **`/api/v1/internal/appointments/{random-uuid}`** as User A. | **404** `{ error: "Resource not found" }` |
-| 5 | **Entity (staff gate):** `PUT` or `PATCH` **`/api/v1/internal/entities/{entityType}/{id}`** as User A when A’s **`user_role`** is **not** `agent` / `transaction_manager` / `seller`. | **403** `{ code: FORBIDDEN, message: "Access denied" }` (dynamic entity is staff-only for mutations) |
+| 5 | **Entity (staff gate):** `PUT` or `PATCH` **`/api/v1/internal/entities/{entityType}/{id}`** as User A when A’s **`user_role`** is **not** `agent` / `transaction_manager` / `owner`. | **403** `{ code: FORBIDDEN, message: "Access denied" }` (dynamic entity is staff-only for mutations) |
 | 6 | **Entity:** Repeat **5** as an internal staff user with a valid **`entityType`** and existing **`id`**. | **2xx** if payload valid and row exists (**404** if id missing) |
 | 7 | **Registry fail-closed (optional):** If you temporarily add a route with `checkOwnership('nonexistent', 'id')` in dev, expect **403** and a **`checkOwnership: unknown resourceName`** log — remove the rout
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
