# Session 20.7.1: Canonical plan adoption and doc protections


### Task 20.7.1.1: Task 20.7.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.1.2



## Completed Tasks

### Task 20.7.1.2: Task 20.7.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.1.3



### Task 20.7.1.1: Task 20.7.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.1.2

<!-- end excerpt session -->



### Task 20.7.1.2: Task 20.7.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.1.3





## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.1.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.1.2-planning.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.7.1/`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-20.7-guide.md                     |   2 +-
 .../phases/phase-20.7-log.md                       |   8 +
 .../sessions/session-20.7.1-guide.md               |   2 +
 .../sessions/session-20.7.1-log.md                 |   6 +
 .../sessions/session-20.7.1-planning.md            | 388 ++++++---------------
 .../sessions/task-20.7.1.1-planning.md             | 166 ---------
 .../sessions/task-20.7.1.2-planning.md             | 174 ---------
 7 files changed, 124 insertions(+), 622 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md
index 259c3666..a18c2345 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md
@@ -82,7 +82,7 @@ Do **not** reopen the architecture in this phase. The goal is to confirm code/do
 
 Session guides/logs are created at **`/session-start`**. This phase should produce the documents that downstream close-out work can cite directly.
 
-- [ ] ### Session 20.7.1: Canonical plan adoption and doc protections
+- [x] ### Session 20.7.1: Canonical plan adoption and doc protections
 **Description:** Mark the locked master plan as the active close-out sequencing surface; update feature-level guidance so the new ladder is visible; add warning/tombstone text where contradictory or superseded planning paths could still mislead agents.
 
 **Tasks:**
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md
index 594a7c52..961f1e2a 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 20.7.1: Canonical plan adoption and doc protections ✅
+**Completed:** 2026-04-04
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** Canonical plan adoption and doc protections
+
+
+
 ### Session [SESSION_ID]: [SESSION_NAME] ✅
 **Completed:** [Date]
 **Tasks Completed:** [List of task IDs]
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-guide.md
index e129c81b..5f99f48e 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-guide.md
@@ -414,3 +414,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-log.md
index a1def9de..c5dbe4b7 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-log.md
@@ -192,3 +192,9 @@ index 9f061aea..7a6db151 100644
 … (truncated)
 ```
 <!-- /harness:anchor:commit-preview -->
+
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-planning.md
index 432f6a22..a8cddee7 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-planning.md
@@ -1,34 +1,8 @@
-# Plan: session 20.7.1 — Canonical plan adoption and doc protections
-
-## Contract
-- **Tier:** session | **ID:** 20.7.1
-- **Scope:** Adopt the locked close-out sequencing story in harness docs; add tombstones/warnings on superseded planning surfaces; align feature handoff next actions with the **20.7–20.13** ladder (no immediate **`/feature-end`** after **20.6**).
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
-
-Phase **20.7** planning and guide gates are complete (**`/phase-start 20.7`** → **`/accepted-plan`** → **`/accepted-build`**). First execution slice is **Session 20.7.1** per **`phases/phase-20.7-guide.md`** (canonical lock + contradictory-doc protections only — preflight evidence is **20.7.2**).
+<!-- harness-planning-rollup tier=session id=20.7.1 consolidatedAt=2026-04-04T00:55:03.583Z -->
+
+# Consolidated planning: session 20.7.1
+
+## Session 20.7.1 (parent)
 
 ## Story
 
@@ -37,315 +11,167 @@ Phase **20.7** planning and guide gates are complete (**`/phase-start 20.7`** 
 **Estimated size:** M (docs-only; no product code unless a tombstone lives beside code).
 
 ---
-## Architecture context (harness-injected)
-
-## 1. System overview
-
-Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:
-
-- **Public booking users** — wizard-style scheduling and property/availability flows.
-- **Admin configurators** — domain-specific editors for shapes/instances, wizard settings, availability rules, integrations (target: **no** DB-driven admin metadata pipeline; see `FEATURE_20_ARCHITECTURE_REDESIGN.md` §6.3).
-
-TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Until the metadata stack is removed (Feature 20 Pass 6), some admin routes may still prefetch legacy metadata — treat that as **transitional**, not the end state.
-
----
-
-## 2. Domain map
-
-| Domain | Client paths | Server paths | Key models / areas | Shared types |
-|--------|----------------|-------------|---------------------|--------------|
-| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
-| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
-| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Session 6.18.1) |
-| **Integrations** | `services/calendarApiService`, `mapsApiService`, `propertyEnrichmentApiService` (full-URL axios) | `routes/external/calendar`, `oauth`, `maps`, `service
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
