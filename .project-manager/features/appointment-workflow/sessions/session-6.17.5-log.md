# Session 6.17.5: Entity-policy rollout + documentation

## Completed Tasks

### Task 6.17.5.1: Task 6.17.5.1 ✅
**Goal:** Task completed

### Task 6.17.5.2: Task 6.17.5.2 ✅
**Goal:** Task completed

**Next step:** Session tasks done — run **`/session-end 6.17.5`** when ready.

<!-- end excerpt session -->



## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (6): `.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md`, `.project-manager/features/appointment-workflow/phases/phase-6.17-log.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.5-planning.md`, `.project-manager/features/appointment-workflow/sessions/session-6.17.5-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-6.17-guide.md                     |   2 +-
 .../appointment-workflow/phases/phase-6.17-log.md  |   8 +
 .../sessions/session-6.17.5-guide.md               |   2 +
 .../sessions/session-6.17.5-log.md                 |   6 +
 .../sessions/session-6.17.5-planning.md            | 285 ---------------------
 5 files changed, 17 insertions(+), 286 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md b/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md
index 8633af73..5edf84a0 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md
@@ -133,7 +133,7 @@ Start with a **small** set; expand via registry:
 **Description:** Replace/adapt one-shot delete in `entityListDelete`, entity card persistence, and `useEntityCrud` mutations to use the new flow when entity is registered.  
 **Focus:** Single funnel into the wizard for supported keys.
 
-- [ ] ### Session 6.17.5: Entity-policy rollout + documentation  
+- [x] ### Session 6.17.5: Entity-policy rollout + documentation  
 **Description:** Register policies for `partShape`, `blockShape`, `annotationShape` (and related); document extension guide for new entities; client lint + app start.  
 **Focus:** Prove end-to-end on real admin paths; handoff for future entities.
 
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md b/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md
index eda7237a..c6d40cbd 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.17-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 6.17.5: Entity-policy rollout + documentation ✅
+**Completed:** 2026-04-01
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** Entity-policy rollout + documentation
+
+
+
 ### Session 6.17.4: Wire generic delete entry points (list + entity card) ✅
 **Completed:** 2026-04-01
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md
index a340ce2c..fef883fd 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md
@@ -414,3 +414,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md
index 72763ac0..4408eedc 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md
+++ b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-log.md
@@ -11,3 +11,9 @@
 **Next step:** Session tasks done — run **`/session-end 6.17.5`** when ready.
 
+
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-planning.md b/.project-manager/features/appointment-workflow/sessions/session-6.17.5-planning.md
deleted file mode 100644
index 43955b3d..00000000
--- a/.project-manager/features/appointment-workflow/sessions/session-6.17.5-planning.md
+++ /dev/null
@@ -1,285 +0,0 @@
-# Plan: session 6.17.5 — Entity-policy rollout + documentation
-
-## Contract
-- **Tier:** session | **ID:** 6.17.5
-- **Scope:** Entity-policy rollout + documentation (registry expansion + client allowlist sync + operator docs)
-- **Governance (harness snapshot):**
-  - Governance Context (Session)
-  - Function Governance
-  - Clean — no violations detected.
-  - Component Governance
-  - Clean — no violations detected.
-  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
-  - `client/src/composables/admin/useEntityCardSaveAndActions.ts` — oversized-return: Return surface has 14 properties; decompose into focused composables
-  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Re
-  - … _(truncated)_
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
-Session **6.17.4** shipped generic **list + entity card** entry points that funnel **`partShape`** deletes through **`AdminEntityDeleteWizard`** + preflight/finalize; server registry currently registers **`partShape` only** (`dependencyDeleteRegistry.ts`). Session **6.17.5** expands **policies to additional shape keys** and documents how to add more without copy-paste. <!-- harness-across-ladder:start -->
-
-## Story
-**This session delivers** registered **dependency-delete strategies** for **`blockShape`** and **`annotationShape`** (plus client allowlist + list wiring where those entities use generic delete), **and** an up-to-date **extension guide** **so that** operators get the same preflight/wizard experience as **`partShape`**, and future entity keys follow one documented path (server strategy + client mirror + surfaces).
-**Estimated size:** M (two tasks: server domain work + client/docs)
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
-Canonica
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
