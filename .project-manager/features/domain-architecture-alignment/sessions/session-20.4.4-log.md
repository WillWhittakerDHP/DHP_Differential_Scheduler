# Session 20.4.4: ** **Perspective + minimizer + shared cleanup** — update **`perspectiveResolver`**, **`minimizerSchedulingBounds`**, **`minimizerEventShapes`**, **`partFinalizerSlotShapeHelpers`** as needed; delete unused **`differentialRole*`** shared/client utilities per **§6.2** when grep-clean.


### Task 20.4.4.1: Task 20.4.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.4.2



## Completed Tasks

### Task 20.4.4.2: Task 20.4.4.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.4.3



### Task 20.4.4.1: Task 20.4.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.4.2



### Task 20.4.4.1: Task 20.4.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.4.2

<!-- end excerpt session -->



### Task 20.4.4.1: Task 20.4.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.4.2


## Harness: commit preview (in-scope diff)

Paths (2): `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md`

### `git diff --stat HEAD`

```text
.../sessions/session-20.4.4-guide.md                      |  2 +-
 .../sessions/session-20.4.4-log.md                        | 15 +++++++++++++++
 2 files changed, 16 insertions(+), 1 deletion(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
index 8626e54f..3725a3bf 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [x] #### Task 20.4.4.1: `perspectiveResolver` — dead `resolveEventShapes` overrides + dedupe `derivePerspective`
+- [x] - [x] #### Task 20.4.4.1: `perspectiveResolver` — dead `resolveEventShapes` overrides + dedupe `derivePerspective`
 **Goal:** Drop unused **`overrides`** param from **`resolveEventShapes`**; route **`derivePerspective`** through **`resolveEventShapes`** + **`derivePerspectiveWithResolved`**.
 **Files:** `client/src/utils/booking/perspectiveResolver.ts` (callers already single-arg)
 **Approach:** Refactor + **`vue-tsc`** / client lint.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
index 4734c832..cb6a1cac 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
@@ -11,6 +11,14 @@
 
### Task 20.4.4.2: Task 20.4.4.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.4.4.3


## Harness: commit preview (in-scope diff)

Paths (5): `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md`, `client/src/utils/booking/minimizerEventShapes.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.4.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.4.2-planning.md`

### `git diff --stat HEAD`

```text
.../sessions/session-20.4.4-guide.md               |  2 +-
 .../sessions/session-20.4.4-log.md                 | 16 ++++++++++-
 client/src/utils/booking/minimizerEventShapes.ts   | 32 ++++------------------
 3 files changed, 21 insertions(+), 29 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
index 3725a3bf..60b65848 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
@@ -58,7 +58,7 @@ These sections contain session-specific content:
 **Approach:** Refactor + **`vue-tsc`** / client lint.
 **Checkpoint:** Same perspective behavior for placement-only slots.
 
-- [ ] #### Task 20.4.4.2: Minimizer + grep-gated `@shared` `differentialRole*` cleanup
+- [x] #### Task 20.4.4.2: Minimizer + grep-gated `@shared` `differentialRole*` cleanup
 **Goal:** **`minimizerEventShapes`** — simplify legacy override branch only if grep proves safe; **`shared/`** — remove **only** unreferenced symbols (full-repo grep).
 **Files:** `minimizerEventShapes.ts`, `shared/utils/differentialRoleUtils.ts`, `shared/constants/differentialRoleMappings.ts`, types as needed
 **Approach:** Grep-before-delete; document deferrals in task log if nothing is safe to remove.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
index 822cca0b..1427dd31 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
@@ -11,6 +11,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/domain-architecture-alignment/phases/phase-20.4-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.4-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.4.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.4.4.2-planning.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.4.4/`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-20.4-guide.md                     |   2 +-
 .../phases/phase-20.4-log.md                       |   8 +
 .../sessions/session-20.4.4-guide.md               |   2 +
 .../sessions/session-20.4.4-log.md                 |   7 +-
 .../sessions/session-20.4.4-planning.md            | 296 +++++++--------------
 .../sessions/task-20.4.4.1-planning.md             | 155 -----------
 .../sessions/task-20.4.4.2-planning.md             | 155 -----------
 7 files changed, 110 insertions(+), 515 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.4-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.4-guide.md
index 9edea6ac..6c024e75 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.4-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.4-guide.md
@@ -90,7 +90,7 @@ Harness expects each session below as `### Session X.Y.Z:` (do not remove headin
 
 **Tasks:** Session planning → helper rewrites → consumer updates → lint / smoke.
 
-- [ ] ### Session 20.4.4: Perspective + minimizer + shared cleanup
+- [x] ### Session 20.4.4: Perspective + minimizer + shared cleanup
 
 **Description:** **`perspectiveResolver`**, **`minimizerSchedulingBounds`**, **`minimizerEventShapes`**, **`partFinalizerSlotShapeHelpers`** as needed; remove **§6.2** **`differentialRole*`** paths when unused.
 
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.4-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.4-log.md
index e8a53afd..8eaa68b0 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.4-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.4-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 20.4.4: Perspective + minimizer + shared cleanup ✅
+**Completed:** 2026-04-02
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** ** **Perspective + minimizer + shared cleanup** — update **`perspectiveResolver`**, **`minimizerSchedulingBounds`**, **`minimizerEventShapes`**, **`partFinalizerSlotShapeHelpers`** as needed; delete unused **`differentialRole*`** shared/client utilities per **§6.2** when grep-clean.
+
+
+
 ### Session 20.4.3: Slot shape + time axis ✅
 **Completed:** 2026-04-02
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
index 60b65848..9654320b 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-guide.md
@@ -412,3 +412,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
index 46902815..8cd1c0dd 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
@@ -119,4 +119,9 @@ index 822cca0b..1427dd31 100644
 --- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
 +++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-planning.md
index d47272b6..5d4dde52 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.4.4-planning.md
@@ -1,271 +1,161 @@
-# Plan: session 20.4.4 — Perspective, minimizer, and shared differential-role cleanup
-
-## Contract
-- **Tier:** session | **ID:** 20.4.4
-- **Scope:** Final **20.4** slice for FEATURE_20 **§8.4**: (1) tighten **`perspectiveResolver`** after **20.4.3** (remove dead **`resolveEventShapes`** override arity; dedupe major/minor resolution with **`derivePerspective`**). (2) Minimizer + **`AppointmentShape`** optional **`differentialEventRoleOverrides`** — simplify only where grep proves safe; preserve behavior if persisted snapshots could still carry overrides. (3) **§6.2-style** shared cleanup: **grep-first** removal of **unreferenced** `differentialRole*` symbols — **do not** delete admin/server contract types or **`DifferentialEventRoleOverridesField`** paths.
-- **Governance (harness snapshot):** Session-scoped audits clean; repo-wide advisory in `client/.audit-reports/` — out of scope unless blocking.
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
-Session **20.4.3** completed: placement-only **`calculateSlotShape`**; booking **`AppointmentShape`** no longer sets **`differentialEventRoleOverrides`**; **`resolveEventShapes`** / **`derivePerspective`** / minimizer call sites use single-arg resolution where applicable. **`resolveEventShapes`** still exposes an unused optional **`overrides`** parameter; **`derivePerspective`** duplicates **`resolveDifferentialMajorMinorFromEventShapes`**.
-
-<!-- harness-across-ladder:start -->
+<!-- harness-planning-rollup tier=session id=20.4.4 consolidatedAt=2026-04-02T22:34:53.654Z -->
+
+# Consolidated planning: session 20.4.4
+
+## Session 20.4.4 (parent)
 
 ## Story
+
 **This session delivers** a single coherent **perspective + minimizer** story and **safe** shared **`differentialRole*`** pruning **so that** phase **20.4** closes without dead API surface and without breaking admin placement UI or **`@shared`** contracts still referenced by server/client.
 **Estimated size:** M (two tasks; booking utils + shared grep)
 
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
+- **Why now:** **20.4.3** cleared override **threading**; this session removes **dead API** and dedupes **perspective** resolution.
+- **Boundaries:** **`client/src/utils/booking/*`** first; **`@shared`** edits only with **full-repo grep** (client + server importers).
+- **Risks:** Deleting **`shared/types/differentialRole`** or **`differentialRoleUtils`** wholesale — **rejected**; admin (**`DifferentialEventRoleOverridesField`**) and **`eventPlacementUtils`** still use role **template** mapping.
 
-| Domain | Client paths | Server paths | Key models / areas | Shared types |
-|--------|----------------|-------------|---------------------|--------------|
-| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/mod
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
