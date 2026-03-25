# Session 7.4.4 Log: ** Enactment GC-7-E1 — Selective requireAuth/requireRole on internal routes per product rules; maintain anonymous allowlist for booking wizard paths; document router-level policy in handoff; align with appointment ownership and CSRF ordering; update GAP_CLOSURE_CHECKLIST GC-7-E1 to done or split follow-up rows when verified (lint + smoke).

**Status:** In Progress
**Date:** 2026-03-25

---

## Session Goal

[Document concrete session goal]

### Task 7.4.4.1: Task 7.4.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 7.4.4.2



## Completed Tasks

### Task 7.4.4.2: Task 7.4.4.2 ✅
**Goal:** Task completed

**Next Task:**
- 7.4.4.3



### Task 7.4.4.1: Task 7.4.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 7.4.4.2

<!-- end excerpt session -->



### Task 7.4.4.2: Task 7.4.4.2 ✅
**Goal:** Task completed

**Next Task:**
- 7.4.4.3

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/features/authentication/sessions/session-7.4.4-guide.md`, `.project-manager/features/authentication/sessions/session-7.4.4-log.md`, `server/docs/INTERNAL_API_ENACTMENT_MATRIX.md`, `server/src/routes/internal/appointments/appointmentRouter.ts`, `.project-manager/GAP_CLOSURE_CHECKLIST.md`, `.project-manager/features/authentication/sessions/task-7.4.4.2-handoff.md`, `.project-manager/features/authentication/sessions/task-7.4.4.2-planning.md`

### `git diff --stat HEAD`

```text
.../authentication/sessions/session-7.4.4-guide.md       |  2 +-
 .../authentication/sessions/session-7.4.4-log.md         | 15 +++++++++++++++
 server/docs/INTERNAL_API_ENACTMENT_MATRIX.md             | 16 ++++++++++++----
 .../routes/internal/appointments/appointmentRouter.ts    | 10 +++++++++-
 4 files changed, 37 insertions(+), 6 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/authentication/sessions/session-7.4.4-guide.md b/.project-manager/features/authentication/sessions/session-7.4.4-guide.md
index 14b91772..a42affdd 100644
--- a/.project-manager/features/authentication/sessions/session-7.4.4-guide.md
+++ b/.project-manager/features/authentication/sessions/session-7.4.4-guide.md
@@ -50,7 +50,7 @@ These sections contain session-specific content:
 **Approach:** [Approach to take]
 **Checkpoint:** [What needs to be verified]
 
-- [ ] #### Task 7.4.4.2: [Task Name]
+- [x] #### Task 7.4.4.2: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/authentication/sessions/session-7.4.4-log.md b/.project-manager/features/authentication/sessions/session-7.4.4-log.md
index 6f6194fe..8f3585ca 100644
--- a/.project-manager/features/authentication/sessions/session-7.4.4-log.md
+++ b/.project-manager/features/authentication/sessions/session-7.4.4-log.md
@@ -19,6 +19,14 @@
 
 ## Explicit priorities for enactment (7.4.4.2+)
 
-1. **`GET /api/v1/internal/appointments/list-for-admin-entry`** — **must not** remain world-readable; gate with **`requireAuth`** + **`requireRole`** (internal staff / admin — match product role constants).
+1. ~~**`GET /api/v1/internal/appointments/list-for-admin-entry`**~~ — **Done (2026-03-25):** **`requireAuth`** + **`requireRole`** in `appointmentRouter.ts`.
 2. **`POST /api/v1/internal/availability/computed-data`** — **must remain** callable for the wizard with **anonymous** user identity (session + CSRF only), unless product explicitly changes — **do not** add blanket `requireAuth` here without a wizard alternative.
 3. **Settings GETs** used during booking (`wizard-settings`, `calendar-settings`, `organization-defaults`, `business-settings/availability_settings`) — typically **readable** without named user; **mutations** remain **staff/admin**.
 
@@ -79,3 +79,11 @@ Mounted **before** the generic `/internal` stack: `v1Router.use("/internal/auth"
 ## Related docs
 
 - `server/docs/SECURITY_STUBS.md` — CSRF, `requireAuth`, `requireRole`, `checkOwnership` behavior and smoke tables
+
+---
+
+## Changelog
+
+| Date | Change |
+|------|--------|
+| 2026-03-25 | **7.4.4.2:** `GET /appointments/list-for-admin-entry` — `requireAuth` + `requireRole(USER_ROLE_AGENT, 'transaction_manager', 'seller', 'admin')` (`appointmentRouter.ts`). |
diff --git a/server/src/routes/internal/appointments/appointmentRouter.ts b/server/src/routes/internal/appointments/appointmentRouter.ts
index b6880290..e570f6b3 100644
--- a/server/src/routes/internal/appointments/appointmentRouter.ts
+++ b/server/src/routes/internal/appointments/appointmentRouter.ts
@@ -1,11 +1,19 @@
 import { Router } from 'express'
+import { USER_ROLE_AGENT } from '../../../constants/userRoles.js'
+import { requireAuth, requireRole } from '../../../middlewares/security.js'
 import { AppointmentCrudRouter } from './appointmentCrudRouter.js'
 import { forceCreateRouter } from './forceCreateRouter.js'
 import { listForAdminEntryHandler } from './listForAdminEntryHandler.js'
 
 const router = Router()
 
-router.get('/list-for-admin-entry', listForAdminEntryHandler)
+/** WHY: Admin-only list — must not be world-readable (GC-7-E1 / task 7.4.4.2). Align roles with internal staff + admin usage (see forceCreateRouter). */
+router.get(
+  '/list-for-admin-entry',
+  requireAuth,
+  requireRole(USER_ROLE_AGENT, 'transaction_manager', 'seller', 'admin'),
+  listForAdminEntryHandler
+)
 router.use('/', AppointmentCrudRouter)
 router.use('/force-create', forceCreateRouter)
```
<!-- /harness:anchor:commit-preview -->
