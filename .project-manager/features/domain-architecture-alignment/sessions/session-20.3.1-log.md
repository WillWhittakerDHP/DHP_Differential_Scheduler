# Session 20.3.1: — Placement type editor (§8.3 #1):** Introduce or elevate **PlacementTypeEditor** (or equivalent) for `eventShape` **placementKind** / **anchorEdge**; align field displays (`eventShapeDisplays.ts`), forms, and admin copy with placement semantics; remove or reword differential-role-forward labels on shape surfaces.


### Task 20.3.1.1: Task 20.3.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.1.2



## Completed Tasks

### Task 20.3.1.2: Task 20.3.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.1.3



### Task 20.3.1.1: Task 20.3.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.1.2

<!-- end excerpt session -->



### Task 20.3.1.2: Task 20.3.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.1.3


## Harness: commit preview (in-scope diff)

Paths (8): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md`, `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`, `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`, `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts`, `client/src/utils/admin/differentialRoleMatrixRows.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.1.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.1.2-planning.md`

### `git diff --stat HEAD`

```text
.../sessions/session-20.3.1-guide.md               |  2 +-
 .../sessions/session-20.3.1-log.md                 | 15 ++++++++++
 .../fields/DifferentialEventRoleOverridesField.vue | 20 +++++++++----
 .../appliedDisplay/blockInstanceDisplays.ts        | 10 +++++++
 .../display/appliedDisplay/eventShapeDisplays.ts   |  4 +--
 .../src/utils/admin/differentialRoleMatrixRows.ts  | 33 ++++++++++++++++++++--
 6 files changed, 73 insertions(+), 11 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md
index 9ec691c3..516b4f7a 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md
@@ -60,7 +60,7 @@ These sections contain session-specific content:
 **Approach:** Add focused component + register for `eventShape` / `placementKind`+`anchorEdge`; mirror server pairing rules in UI.
 **Checkpoint:** Create/edit event shape in Shapes tab; payload shows correct placement fields; anchor hidden or cleared for primary.
 
-- [ ] #### Task 20.3.1.2: Placement-forward copy cleanup
+- [x] #### Task 20.3.1.2: Placement-forward copy cleanup
 **Goal:** `eventShapeDisplays` + **DifferentialEventRoleOverridesField** captions/help use **placement** vocabulary; grep stragglers on shape surfaces.
 **Files:**
 - `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts`
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
index 3cacfe06..78d74d47 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
@@ -11,6 +11,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.1.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.1.2-planning.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.3.1/`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-20.3-guide.md                     |   2 +-
 .../sessions/session-20.3.1-guide.md               |   2 +
 .../sessions/session-20.3.1-log.md                 |   7 +-
 .../sessions/session-20.3.1-planning.md            | 324 ++++++++-------------
 .../sessions/task-20.3.1.1-planning.md             | 182 ------------
 .../sessions/task-20.3.1.2-planning.md             | 172 -----------
 6 files changed, 131 insertions(+), 558 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
index 50bbe9b9..6f6be1d6 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
@@ -82,7 +82,7 @@ Run sessions **in order** (see **phase-20.3-planning.md** § Decomposition). Cas
 
 Harness expects each session below as `### Session X.Y.Z:` (do not remove headings — tier-start uses them to sync decomposition and scaffold session guides).
 
-- [ ] ### Session 20.3.1: Placement type editor (§8.3 #1)
+- [x] ### Session 20.3.1: Placement type editor (§8.3 #1)
 
 **Description:** PlacementTypeEditor (or equivalent) for **eventShape** `placementKind` / `anchorEdge`; align `eventShapeDisplays` and admin copy with placement semantics; avoid differential-role-primary framing on shape surfaces.
 
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md
index 516b4f7a..97b8e264 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-guide.md
@@ -416,3 +416,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
index fbc7fbec..f112959c 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
@@ -74,4 +74,9 @@ index 3cacfe06..78d74d47 100644
 --- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
 +++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-planning.md
index 278a1538..0c6bdb19 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-planning.md
@@ -1,273 +1,193 @@
-# Plan: session 20.3.1 — Placement type editor (FEATURE_20 §8.3 #1)
-
-## Contract
-- **Tier:** session | **ID:** 20.3.1
-- **Scope:** Admin UX for **event shapes**: explicit **placement** editing (`placementKind`, `anchorEdge`), aligned field display config and copy; reword shape-surface UI that foregrounds **differential role** where **placement** is the source of truth.
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
-Phase **20.2** shipped API/schema alignment for **event_shapes** (placement-only writes, no differential-role body). Phase **20.3** session **20.3.1** is the first §8.3 tranche: admin must edit **placement** clearly before later sessions (service editor, segment relocation).
+<!-- harness-planning-rollup tier=session id=20.3.1 consolidatedAt=2026-04-02T19:31:58.421Z -->
+
+# Consolidated planning: session 20.3.1
+
+## Session 20.3.1 (parent)
 
 ## Story
+
 **This session delivers** a dedicated **placement** editing experience on **event shape** admin surfaces and placement-forward copy **so that** configurators reason in **FEATURE_20** terms (placement → calendar ordering / scheduling semantics) without legacy differential-role-first labeling on **shape** templates.
 **Estimated size:** M
 
 ---
-## Architecture context (harness-injected)
 
-## 1. System overview
-
-Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:
+## Analysis
 
-- **Public booking users** — wizard-style scheduling and property/availability flows.
-- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.
+- **Problem / why now:** APIs and types are placement-native; admin still presents placement as opaque text fields and elsewhere shows **template role** without tying copy to **placementKind / anchorEdge**. Misalignment risks misconfiguration and reintroduces a differential-role mental model on **shape** templates.
+- **Boundaries:** **Client admin only** for this session; **no** server PartFinalizer or booking pipeline changes. **Shared** imports only where already used (`@shared/utils/eventPlacementUtils`, sanitizers).
+- **Patterns:** Thin Vue components; composable for pairing logic if non-trivial; reuse `ENTITY_FIELD` / display config patterns; follow COMPONENT/COMPOSABLE playbooks.
+- **Risks:** Over-building a new form system — prefer one focused component + map registration. Regression on `anchorEdge` null sentinel — preserve existing select resolution behavior.
+- **Alternatives:** Leave generic text fields — **rejected** (fails §8.3 #1). Full EntityCard replacement — **out of scope** for 20.3.1 (later §8.3 items).
 
-TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often batch-prefetched (e.g. router navigation guards).
+## Goal
 
----
+Ship **PlacementTypeEditor** (or equivalent named component) for **eventShape** so admins set **placementKind** and **anchorEdge** with correct coupling (**primary** clears anchor), and refresh **shape-surface** copy so **placement** is primary; tighten **eventShapeDisplays** and the differential **override** matrix caption to **placement-forward** language where it describes template event shapes.
 
-## 2. Domain map
+## Files
 
-| Domain | Client paths | Server paths | Key models / areas | Shared types |
-|--------|----------------|-------------|---------------------|--------------|
-| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
-| **Admin / Config** | `compo
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
