# Session 6.18.2: Admin alignment — canonical roles ↔ user-type block instances


### Task 6.18.2.1: Task 6.18.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.18.2.2



## Completed Tasks

### Task 6.18.2.2: Task 6.18.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.18.2.3



### Task 6.18.2.1: Task 6.18.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.18.2.2

<!-- end excerpt session -->



### Task 6.18.2.2: Task 6.18.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.18.2.3


## Harness: commit preview (in-scope diff)

Paths (12): `.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md`, `client/src/composables/admin/useBusinessControlsTab.ts`, `client/src/configs/businessControlsTabStrings.ts`, `client/src/types/admin/businessControlsState.ts`, `client/src/views/admin/tabs/BusinessControlsTab.vue`, `.project-manager/features/appointment-workflow/sessions/task-6.18.2.2-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.18.2.2-planning.md`, `client/src/composables/admin/useAdminUserRoleBlockAlignment.ts`, `client/src/configs/userRoleBlockAlignment/`, `client/src/utils/admin/eligibleUserRoleAlignmentBlockInstances.ts`, `client/src/views/admin/tabs/BusinessControlsRoleAlignmentSection.vue`

### `git diff --stat HEAD`

```text
.../sessions/session-6.18.2-guide.md               | 11 ++++---
 .../sessions/session-6.18.2-log.md                 | 15 ++++++++++
 .../composables/admin/useBusinessControlsTab.ts    | 34 ++++++++++++++++++++--
 client/src/configs/businessControlsTabStrings.ts   | 10 ++++++-
 client/src/types/admin/businessControlsState.ts    |  2 ++
 .../src/views/admin/tabs/BusinessControlsTab.vue   | 14 +++++++++
 6 files changed, 76 insertions(+), 10 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md
index 430db6ff..34942974 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md
@@ -59,12 +59,11 @@ These sections contain session-specific content:
 **Approach:** [Approach to take]
 **Checkpoint:** [What needs to be verified]
 
-- [ ] #### Task 6.18.2.2: [Task Name]
-**Goal:** [Task goal]
-**Files:** 
-- [Files to work with]
-**Approach:** [Approach to take]
-**Checkpoint:** [What needs to be verified]
+- [x] - [x] #### Task 6.18.2.2: Admin UI — role ↔ user-type instance matrix
+**Goal:** Business Controls tab to load/save `user-role-block-alignment` with pickers limited to user-type state-control instances.
+**Files:** `client/src/configs/userRoleBlockAlignment/api.ts`, `client/src/utils/admin/eligibleUserRoleAlignmentBlockInstances.ts`, `useAdminUserRoleBlockAlignment.ts`, `BusinessControlsRoleAlignmentSection.vue`, `BusinessControlsTab.vue`, `useBusinessControlsTab.ts`, `businessControlsTabStrings.ts`, `businessControlsState.ts`
+**Approach:** Mirror organization defaults composable + new VTabs pane; `GET`/`PUT` via `@/utils/api`.
+**Checkpoint:** Admin can persist alignment; client lint + `vue-tsc` pass.
 
 ---
 
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md
index 346d4f6e..fe55dc44 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md
@@ -11,6 +11,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/appointment-workflow/phases/phase-6.18-guide.md`, `.project-manager/features/appointment-workflow/phases/phase-6.18-log.md`, `.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md`, `.project-manager/features/appointment-workflow/sessions/session-6.18.2-planning.md`, `.project-manager/features/appointment-workflow/sessions/task-6.18.2.1-planning.md`, `.project-manager/features/appointment-workflow/sessions/task-6.18.2.2-planning.md`, `.project-manager/features/appointment-workflow/planning-archive/session/6.18.2/`, `.project-manager/features/appointment-workflow/sessions/session-6.18.2-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-6.18-guide.md                     |   2 +-
 .../appointment-workflow/phases/phase-6.18-log.md  |   8 +
 .../sessions/session-6.18.2-guide.md               |   2 +
 .../sessions/session-6.18.2-log.md                 |   7 +-
 .../sessions/session-6.18.2-planning.md            | 114 +++++++------
 .../sessions/task-6.18.2.1-planning.md             | 162 ------------------
 .../sessions/task-6.18.2.2-planning.md             | 188 ---------------------
 7 files changed, 76 insertions(+), 407 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.18-guide.md b/.project-manager/features/appointment-workflow/phases/phase-6.18-guide.md
index 76f2e1d7..f41f0e56 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.18-guide.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.18-guide.md
@@ -47,7 +47,7 @@
 **Description:** Add/extend `@shared` constants (array + per-role const exports as needed); migration to alter ENUM `seller` → `owner` and update existing `users.user_role` rows; update `Users` model, `userSchemas.ts`, `userTypeMapping.ts`, `client/src/types/user.ts`, `UserCreateForm.vue` and any `VSelect` role lists, `appointmentDataBuilders`, tests of behavior, seeds; grep for `seller` and hardcoded role arrays; align **Feature 7** enactment docs that mention role examples (`transaction_manager`, etc.).  
 **Focus:** One import path for allowed values; rename complete across API/DB/client.
 
-- [ ] ### Session 6.18.2: Admin alignment — canonical roles ↔ user-type block instances  
+- [x] ### Session 6.18.2: Admin alignment — canonical roles ↔ user-type block instances  
 **Description:** Design minimal persistence (e.g. JSON on `wizard_settings`, `organization_defaults`, or a small `user_role_block_alignment` table) mapping **canonical role key** → **block_instance_id** (user-type shape). Admin UI: table or matrix “Role → User-type instance” with pickers sourced from state-control user-type instances (`getUserTypeBlockIdForRole` reads config first, then legacy name map). Document seed expectations for default rows (“Owner”, “Buyer”, …).  
 **Focus:** Operators can add/rename user-type instances without a deploy for mapping-only changes (where product allows).
 
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.18-log.md b/.project-manager/features/appointment-workflow/phases/phase-6.18-log.md
index b04df748..bb381aae 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.18-log.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.18-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 6.18.2: Admin alignment — canonical roles ↔ user-type block instances ✅
+**Completed:** 2026-04-02
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** Admin alignment — canonical roles ↔ user-type block instances
+
+
+
 ### Session 6.18.1: Shared role catalog + `seller` → `owner` + full-stack audit ✅
 **Completed:** 2026-04-02
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md
index 435fe444..d718b4a9 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-guide.md
@@ -413,3 +413,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md
index 3ef76e54..76c42098 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md
@@ -83,4 +83,9 @@ index 346d4f6e..fe55dc44 100644
 --- a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md
 +++ b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-planning.md b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-planning.md
index d5e474ef..45c4a792 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.18.2-planning.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.18.2-planning.md
@@ -1,9 +1,8 @@
-# Session 6.18.2 — Admin alignment: canonical roles ↔ user-type block instances
+<!-- harness-planning-rollup tier=session id=6.18.2 consolidatedAt=2026-04-02T01:01:37.442Z -->
 
-## Contract
+# Consolidated planning: session 6.18.2
 
-- **Tier:** session | **ID:** 6.18.2 | **Parent phase:** 6.18  
-- **Depends on:** Session **6.18.1** — `@shared` `USER_ROLE_VALUES`, API/DB `owner`, `userTypeMapping` name map in place.
+## Session 6.18.2 (parent)
 
 ## Story
 
@@ -17,28 +16,11 @@ Operators need to **choose which user-type block instance** backs each canonical
 - **Patterns:** Mirror **`business-settings`** key pattern (`businessSettingsCrudRouter`, `checkOwnership('businessSetting', …)`) for a dedicated key (e.g. `user_role_block_alignment`) **or** introduce a small table if JSON size/auditing warrants it — **decide in task 6.18.2.1** with preference for **one JSONB row** keyed like availability unless multiple writers conflict.
 - **No silent fallback:** Unmapped role → keep current **warn** + `null`; unknown UUID in payload → **400** with clear error.
 
-## Codebase recon
-
-**Paths reviewed (server):**
-
-- `server/src/utils/userTypeMapping.ts` — `ROLE_TO_BLOCK_NAME`, `getUserTypeBlockIdForRole`, `findUserTypeBlockByName`, in-memory cache by **block name** (TTL 5m).
-- `server/src/routes/internal/appointments/appointmentPersistenceHelpers.ts` — calls `getUserTypeBlockIdForRole(attendee.role)` when persisting attendees.
-- `server/src/db/models/admin/block_shape.ts` — `isStateControl`, `type: 'user' | …`.
-- `server/src/routes/internal/businessSettings/businessSettingsCrudRouter.ts` — GET/PATCH patterns, `validateSettingValue`, ownership.
-- `server/src/middlewares/ownershipEnforcement.ts` — `businessSetting` param handling.
-
-**Paths reviewed (client):**
-
-- `client/src/utils/booking/cascadeFilterPipeline.ts` — `getUserTypeBlocks` for wizard user-type options.
-- `client/src/composables/booking/useWizardFilteredOptions.ts` — consumes `getUserTypeBlocks`.
-
-**Gaps / decisions for tasks:** Exact **settings key** vs **new table**; admin **route/tab** placement (reuse Developer “Business Controls” vs new sub-view); whether **client booking** needs to read alignment (likely **no** — server resolves on persist; wizard already loads instances from global data).
-
 ## Goal
 
 Let operators **align** each canonical **`user_role`** to a **user-type block instance** via admin UI and persisted config, so **`getUserTypeBlockIdForRole`** uses **stored `block_instance_id` first** and falls back to the **legacy name-based map** when unset.
 
-## Files (primary)
+## Files
 
 | Layer | Paths (expected touch) |
 |--------|-------------------------|
@@ -66,51 +48,73 @@ After **6.18.2.1:** API returns/saves alignment; server resolves attendees using
 - `getUserTypeBlockIdForRole` reads config first; legacy map fallback; cache safety.
 - Brief doc/seed note for defaults.
 
-## Acceptance criteria
+---
+
+## Task 6.18.2.2 (source: task-6.18.2.2-planning.md)
+
+### Story
 
-- [ ] Saving alignment changes which block instance is used for new/updated attendee rows using that role (server path), without redeploy for mapping-only edits.
-- [ ] Legacy `ROLE_TO_BLOCK_NAME` + name lookup still applies when a role has **no** stored override.
-- [ ] Invalid instance IDs rejected at API with clear errors; unknown roles logged as today.
-- [ ] `npm run lint` (client + server) and local app start succeed.
+**This task adds** an admin settings panel **because** staff must view and edit which **user-type block instance** each canonical **`user_role`** maps to, using the existing internal API, with picke
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
