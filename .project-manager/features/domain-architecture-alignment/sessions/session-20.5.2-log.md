# Session 20.5.2: — Baseline placement & event routing:** Document **seed expectations** and **how baseline event routing is established** for new and upgraded environments; align language with relational **`event_assignments`** and event orchestrator baseline model (**§9.5** last bullet, **§9.6** mitigation).


### Task 20.5.2.1: Task 20.5.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.2.2



## Completed Tasks

### Task 20.5.2.2: Task 20.5.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.2.3



### Task 20.5.2.1: Task 20.5.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.2.2

<!-- end excerpt session -->



### Task 20.5.2.2: Task 20.5.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.2.3





## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/domain-architecture-alignment/phases/phase-20.5-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.5-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.2.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.2.2-planning.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.5.2/`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-20.5-guide.md                     |   2 +-
 .../phases/phase-20.5-log.md                       |   8 +
 .../sessions/session-20.5.2-guide.md               |   2 +
 .../sessions/session-20.5.2-log.md                 |   6 +
 .../sessions/session-20.5.2-planning.md            | 306 +++++++--------------
 .../sessions/task-20.5.2.1-planning.md             | 157 -----------
 .../sessions/task-20.5.2.2-planning.md             | 154 -----------
 7 files changed, 115 insertions(+), 520 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.5-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.5-guide.md
index f1828e69..48fff1ec 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.5-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.5-guide.md
@@ -90,7 +90,7 @@ Use session guides (`sessions/session-20.5.*-guide.md`) as each session starts;
 - Pick the **canonical narrative file** (extend **DOMAIN_REWRITE_WORKLOG.md** or add **`.project-manager/analysis/MIGRATION_SEQUENCE.md`**) and paste the first **ordered table** there.
 - If a **§9.5** step has **no** migration pointer, open a **Decision needed** line (do not assume implicit behavior).
 
-- [ ] ### Session 20.5.2: Baseline placement and event routing
+- [x] ### Session 20.5.2: Baseline placement and event routing
 **Description:** Document **seed expectations** and explicit **baseline event-orchestrator / placement** behavior for fresh and upgraded DBs; address **§9.6** implicit default routing in prose.
 
 **Tasks:**
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.5-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.5-log.md
index 980ca43b..e6441b3d 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.5-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.5-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 20.5.2: Baseline placement and event routing ✅
+**Completed:** 2026-04-03
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** — Baseline placement & event routing:** Document **seed expectations** and **how baseline event routing is established** for new and upgraded environments; align language with relational **`event_assignments`** and event orchestrator baseline model (**§9.5** last bullet, **§9.6** mitigation).
+
+
+
 ### Session 20.5.1: Migration chain inventory ✅
 **Completed:** 2026-04-03
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md
index ae89762f..7d4f633a 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md
@@ -414,3 +414,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md
index f7dcc9eb..bec5c63a 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md
@@ -109,3 +109,9 @@ index 8411f261..ae6c63f2 100644
 … (truncated)
 ```
 <!-- /harness:anchor:commit-preview -->
+
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-planning.md
index 611ca0fc..6013c44c 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-planning.md
@@ -1,276 +1,166 @@
-# Plan: session 20.5.2 — Baseline placement & event routing
-
-## Contract
-- **Tier:** session | **ID:** 20.5.2
-- **Scope:** Close **DOMAIN_REWRITE_WORKLOG.md** “**Gaps for session 20.5.2**” by documenting **fresh vs upgraded** baseline data, **placement** seeds (**061**), relational **`event_assignments`** framing, and **§9.6** mitigation prose (**orchestrator baseline** ≠ implicit ORM default).
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
-Session **20.5.1** shipped **Checkpoint 9** + **§9.5 crosswalk** in **`DOMAIN_REWRITE_WORKLOG.md`**, with explicit **`gap:`** bullets deferred to **20.5.2** (orchestrator baseline, seeders, fresh vs upgraded).
+<!-- harness-planning-rollup tier=session id=20.5.2 consolidatedAt=2026-04-03T00:08:34.319Z -->
+
+# Consolidated planning: session 20.5.2
+
+## Session 20.5.2 (parent)
 
 ## Story
+
 **This session delivers** written **baseline placement + event routing** expectations for **new and upgraded** databases **so that** **§8.5** / **§9.6** are not satisfied only by migrations list — operators know what **configuration rows** legitimately establish routing vs what **admin/product** must create.
 **Estimated size:** S (documentation only; **no** Sequelize seeders directory exists in repo today).
 
 ---
-## Architecture context (harness-injected)
-
-## 1. System overview
-
-Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:
-
-- **Public booking users** — wizard-style scheduling and property/availability flows.
-- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.
 
-TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often batch-prefetched (e.g. router navigation guards).
-
----
+## Analysis
 
-## 2. Domain map
+- **Why now:** **20.5.1.2** left **`gap:`** for orchestrator baseline; **§9.6** requires explicit mitigation language.
+- **Boundaries:** **`.project-manager/analysis/`** only; cite **migrations** by id, do not change them.
+- **Risks:** Claiming migrations insert full routing graphs — **avoid**; state **admin + validity graph** responsibility clearly.
 
-| Domain | Client paths | Server paths | Key models / areas | Shared types |
-|--------|----------------|-------------|---------------------|--------------|
-| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
-| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entitie
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
