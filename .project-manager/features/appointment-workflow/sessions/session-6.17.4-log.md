# Session 6.17.4: Wire generic delete entry points (list + entity card)

## Completed Tasks

### Task 6.17.4.2: Task 6.17.4.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.4.3



### Task 6.17.4.1: Task 6.17.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.4.2

<!-- end excerpt session -->

### Task 6.17.4.2: Task 6.17.4.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.17.4.3


## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md`, `client/src/components/admin/generic/EntityCard.vue`, `client/src/composables/admin/useEntityCardActions.ts`, `client/src/composables/admin/useEntityCardSaveAndActions.ts`, `client/src/types/admin/entityCardActions.ts`, `client/src/types/admin/entityCardSaveAndActions.ts`, `.project-manager/features/appointment-workflow/sessions/task-6.17.4.2-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.17.4.2-planning.md`

### `git diff --stat HEAD`

```text
.../sessions/session-6.17.4-guide.md               |   4 +-
 .../sessions/session-6.17.4-log.md                 | 141 +--------------------
 client/src/components/admin/generic/EntityCard.vue |  20 +++
 .../src/composables/admin/useEntityCardActions.ts  |  46 +++++++
 .../admin/useEntityCardSaveAndActions.ts           |  10 ++
 client/src/types/admin/entityCardActions.ts        |   5 +
 client/src/types/admin/entityCardSaveAndActions.ts |   5 +
 7 files changed, 92 insertions(+), 139 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md
index b337bab6..38b4e4a9 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md
@@ -52,14 +52,14 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [x] - [x] #### Task 6.17.4.1: [Task Name]
+- [x] #### Task 6.17.4.1: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
 **Approach:** [Approach to take]
 **Checkpoint:** [What needs to be verified]
 
-- [ ] #### Task 6.17.4.2: [Task Name]
+- [x] #### Task 6.17.4.2: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md
index 63c782d5..dd04c767 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md
@@ -1,21 +1,12 @@
 # Session 6.17.4: Wire generic delete entry points (list + entity card)
 
-
-### Task 6.17.4.1: Task 6.17.4.1 ✅
-**Goal:** Task completed
-
-**Next Task:**
-- 6.17.4.2
-
-
-


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (6): `.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md`, `.project-manager/features/appointment-workflow/phases/phase-6.17-log.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.4-planning.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.4-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-6.17-guide.md                     |   2 +-
 .../appointment-workflow/phases/phase-6.17-log.md  |   8 +
 .../sessions/session-6.17.4-guide.md               |   2 +
 .../sessions/session-6.17.4-log.md                 |   7 +-
 .../sessions/session-6.17.4-planning.md            | 276 ---------------------
 5 files changed, 17 insertions(+), 278 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md b/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md
index 24774e02..8633af73 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md
@@ -129,7 +129,7 @@ Start with a **small** set; expand via registry:
 **Description:** Wizard UI shell, composable that runs preflight → drives steps → calls finalize; reusable across admin surfaces.  
 **Focus:** Thin components; orchestration in composable/services per project governance.
 
-- [ ] ### Session 6.17.4: Wire generic delete entry points (list + entity card)  
+- [x] ### Session 6.17.4: Wire generic delete entry points (list + entity card)  
 **Description:** Replace/adapt one-shot delete in `entityListDelete`, entity card persistence, and `useEntityCrud` mutations to use the new flow when entity is registered.  
 **Focus:** Single funnel into the wizard for supported keys.
 
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md b/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md
index 65503fe7..eda7237a 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 6.17.4: Wire generic delete entry points (list + entity card) ✅
+**Completed:** 2026-04-01
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** Wire generic delete entry points (list + entity card)
+
+
+
 ### Session 6.17.3: Reusable client delete wizard + composable/service ✅
 **Completed:** 2026-04-01
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md
index 38b4e4a9..12524f3c 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md
@@ -414,3 +414,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md
index b32731be..6ef9237d 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-log.md
@@ -82,4 +82,9 @@ index 63c782d5..dd04c767 100644
 -- 6.17.4.2
 -
 -
--
\ No newline at end of file
+-
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-planning.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.4-planning.md
deleted file mode 100644
index 5ebab022..00000000
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.4-planning.md
+++ /dev/null
@@ -1,276 +0,0 @@
-# Plan: session 6.17.4 — Wire generic delete entry points (list + entity card)
-
-## Contract
-- **Tier:** session | **ID:** 6.17.4
-- **Scope:** Wire generic delete entry points (list + entity card): route admin deletes through the dependency delete **contract** (preflight → wizard → finalize) when the server registry lists a strategy for that `entityKey`; otherwise keep today’s confirm + `DELETE` path.
-- **Governance (harness snapshot):** Session context; function/component snapshots clean at session-start. Composable `useAdminEntityDeleteWizard` now exposes `{ state, actions }` (reduced top-level return surface).
-
-## Work Profile
-- **Execution intent:** plan
-- **Action type:** decomposition
-- **Scope shape:** cross_cutting
-- **Governance domains:** docs, architecture, booking
-- **Gate profile:** standard
-- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
-- **Recommended context pack:** decomposition_pack
-- **Planning artifact action:** create
-- **Decomposition mode:** moderate
-- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.
-
-## Where we left off
-Completed Task - Begin Session 6.17.4 <!-- harness-across-ladder:start -->
-
-## Story
-**This session delivers** wired **list-row** and **entity-card** delete entry points that use `AdminEntityDeleteWizard` + delete-contract HTTP when the entity type participates in the dependency-delete registry **so that** operators get structured blocked/ready flows for `partShape` (v1) without duplicating wizard wiring per screen.
-**Estimated size:** M
-
----
-## Architecture context (harness-injected)
-
-## 1. System overview
-
-Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:
-
-- **Public booking users** — wizard-style scheduling and property/availability flows.
-- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.
-
-TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often batch-prefetched (e.g. router navigation guards).
-
----
-
-## 2. Domain map
-
-| Domain | Client paths | Server paths | Key models / areas | Shared types |
-|--------|----------------|-------------|---------------------|--------------|
-| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
-| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `admin-metadata`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
-| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Phase 6.18) |
-| **Integrations** | `services/calendarApiService`, `mapsApiService`, `propertyEnrichmentApiService` (full-URL axios) | `routes/external/calendar`, `oauth`, `maps`, `services/google/` | OAuth, external APIs | `@shared/types/calendar` |
-| **Beta** | `composables/beta/`, `views/beta/`, `components/beta/` | `routes/internal/beta-feedback`, `db/models/beta` | Beta feedback | (often local types) |
-
----
-
-## 3. Data flow
-
-Canonical path:
-
-1. **Vue view** → **presentational component**
-2. **Composable** (state + orchestration; thin components)
-3. **Client HTTP**
-   - **Default:** `utils/api/apiClient` — relative paths, same-origin API.
-   - **Integrations:** `services/*ApiService` — full-base-URL axios (calendar, maps, enrichment).
-4. **Express route** (`routes/internal/*` or `routes/external/*`)
-5. **Service** (`server/src/services/`)
-6. **Repository** (`server/src/repositories/`) or direct Sequelize access
-7. **Sequelize model** (`server/src/db/models/`)
-
-Cross-cutting: **transformers** (e.g. global → booking), **injection keys** for wizard
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
