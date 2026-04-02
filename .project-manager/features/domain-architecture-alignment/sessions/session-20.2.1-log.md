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
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/domain-architecture-alignment/phases/phase-20.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.2.1.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.2.1.2-planning.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.2-log.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.2.1/`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-20.2-guide.md                     |   2 +-
 .../sessions/session-20.2.1-guide.md               |   2 +
 .../sessions/session-20.2.1-log.md                 |   7 +-
 .../sessions/session-20.2.1-planning.md            | 315 +++++++--------------
 .../sessions/task-20.2.1.1-planning.md             | 155 ----------
 .../sessions/task-20.2.1.2-planning.md             | 155 ----------
 6 files changed, 113 insertions(+), 523 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.2-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.2-guide.md
index d57d4426..42acbf89 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.2-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.2-guide.md
@@ -73,7 +73,7 @@ Sessions below mirror **phase-20.2-planning.md** decomposition. Run **`/session-
 
 ## Sessions breakdown
 
-- [ ] ### Session 20.2.1: Block shape & block instance entity routes
+- [x] ### Session 20.2.1: Block shape & block instance entity routes
 **Description:** Align `blockShape` / `blockInstance` internal CRUD and validators with Phase 20.1 (`type` enum, `composite`, `orchestrator`, `wizardVisible`).
 
 **Tasks:** Task blocks added at session-start.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md
index 0931478b..04bd48ea 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md
@@ -414,3 +414,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md
index 336b5bdc..36f14e13 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md
@@ -71,4 +71,9 @@ index b8e98be4..328da691 100644
 --- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md
 +++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-planning.md
index 17b908b5..e058d051 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-planning.md
@@ -1,279 +1,172 @@
-# Plan: session 20.2.1 — Block shape & block instance API alignment
-
-## Contract
-- **Tier:** session | **ID:** 20.2.1
-- **Scope:** Internal **entity** routes for `blockShape` and `blockInstance`: validate canonical five `type` values on shapes and three instance booleans on instances; align sanitizers and any added Joi checks with Sequelize models (Phase 20.1 schema).
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
-Phase **20.1** schema is in place (`block_shapes.type` and `block_instances.composite` / `orchestrator` / `wizardVisible`). Phase **20.2** session **20.2.1** is the first API slice: harden **generic** `/internal/entities` CRUD for these two entity keys so admin batch loads and saves cannot send legacy type tokens or invalid payloads.
+<!-- harness-planning-rollup tier=session id=20.2.1 consolidatedAt=2026-04-02T17:29:21.793Z -->
+
+# Consolidated planning: session 20.2.1
+
+## Session 20.2.1 (parent)
 
 ## Story
+
 **This session delivers** server-side validation and sanitization alignment for **block shape `type`** and **block instance three-property fields** on internal entity routes **so that** later sessions (event APIs, booking) can assume consistent HTTP contracts matching `FEATURE_20` §5.1 and `ARCHITECTURE.md` §8–§9.
 
 **Estimated size:** M
 
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
+- **Problem:** Generic entity CRUD accepts almost any body (`entityBodySchema` is permissive). Legacy **`block_shapes.type`** values (`property`, `option`, `coupon`) or mistyped instance flags could still be sent until validation fails deep in Sequelize or slips through coercions.
+- **Boundaries:** **Server-only** route layer + sanitizers; mirror canonical five types with **`client/src/constants/blockShapeTypes.ts`** / `ARCHITECTURE.md` §8. No booking resolution on server.
+- **Patterns:** Extend **`sanitizeEntityDataForCreate` / `sanitizeEntityDataForUpdate`** for `blockShape` (reject or map legacy type strings with clear 400 messaging if product requires); add **`sanitizeBlockInstancePrimitiveFields`** extensions for boolean coercion only where safe. Prefer **named helpers** in `entitySanitizers.ts` or a small `blockEntityValidation.ts` imported from router layer before `updateRecord` — keep **`entityCrudRouter`** branch count manageable per function governance.
+- **Risks:** Breaking admin saves if clients still emit old type strings — document in task if migration/backfill is separate (20.5); prefer explicit 400 with message over silent map unless plan says otherwise.
+- **Alternatives:** Per-route Joi only for `blockShape`/`blockInstance` — heavier duplication; rejected in favor of central sanitizer + optional thin Joi fragment keyed by `entityType` in middleware (evaluate in task 1).
 
-| Domain | Client paths | Server paths | Key models / areas | Shared types |
-|--------|----------------|-------------|---------------------|--------------|
-| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
-| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
