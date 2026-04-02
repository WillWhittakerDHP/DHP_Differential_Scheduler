# Session 20.2.4: ** **Appointments + calendar + cleanup** — appointment persistence helpers/routers; calendar creation reads segment identity and placement policy; remove or isolate **differential-role** route helpers per §5.3; final lint + drift checklist; prepare phase guide / handoff for phase-end.


### Task 20.2.4.1: Task 20.2.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.4.2



## Completed Tasks

### Task 20.2.4.2: Task 20.2.4.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.4.3



### Task 20.2.4.1: Task 20.2.4.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.4.2

<!-- end excerpt session -->



### Task 20.2.4.2: Task 20.2.4.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.2.4.3





## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (8): `.project-manager/features/domain-architecture-alignment/phases/phase-20.2-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.2.4.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.2.4.2-planning.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.2.4/`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-20.2-log.md                       |   8 +
 .../sessions/session-20.2.4-guide.md               |   2 +
 .../sessions/session-20.2.4-log.md                 |   6 +
 .../sessions/session-20.2.4-planning.md            | 324 +++++++--------------
 .../sessions/task-20.2.4.1-planning.md             | 163 -----------
 .../sessions/task-20.2.4.2-planning.md             | 164 -----------
 6 files changed, 123 insertions(+), 544 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.2-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.2-log.md
index f5a263b9..602e9b33 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.2-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.2-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 20.2.4: Appointments, calendar integration & API cleanup ✅
+**Completed:** 2026-04-02
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** ** **Appointments + calendar + cleanup** — appointment persistence helpers/routers; calendar creation reads segment identity and placement policy; remove or isolate **differential-role** route helpers per §5.3; final lint + drift checklist; prepare phase guide / handoff for phase-end.
+
+
+
 ### Session 20.2.4: Appointments, calendar integration & API cleanup ✅
 **Completed:** 2026-04-02
 **Tasks Completed:** 20.2.4.1, 20.2.4.2
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-guide.md
index 6bfae4de..88b0e1ca 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-guide.md
@@ -414,3 +414,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-log.md
index 781fdc22..36e874c0 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-log.md
@@ -218,3 +218,9 @@ index ee2fa303..b65ef2bd 100644
 … (truncated)
 ```
 <!-- /harness:anchor:commit-preview -->
+
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-planning.md
index 22139871..68a764c5 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.2.4-planning.md
@@ -1,284 +1,174 @@
-# Plan: session 20.2.4 — Appointments, calendar integration & API cleanup
-
-## Contract
-- **Tier:** session | **ID:** 20.2.4
-- **Scope:** Appointment persistence helpers/routers (store client-submitted booking context; no server PartFinalizer); calendar / invite pipeline reads **event instance** segment identity and **event shape** placement policy (`placementKind`, `anchorEdge`); remove or isolate **event-shape differential-role** API remnants per FEATURE_20 **§5.3** where safe; phase **20.2** drift checklist + guide/handoff prep for **`/phase-end 20.2`**.
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
-Completed Task - Begin Session 20.2.4 <!-- harness-across-ladder:start -->
+<!-- harness-planning-rollup tier=session id=20.2.4 consolidatedAt=2026-04-02T18:36:28.141Z -->
+
+# Consolidated planning: session 20.2.4
+
+## Session 20.2.4 (parent)
 
 ## Story
+
 **This session delivers** aligned **appointment persistence** and **Google Calendar invite** behavior keyed to **event_instances** + **event_shapes** placement data, and strips remaining **differential-role** noise from the **event-shape entity** API surface, **so that** Phase **20.2** closes with FEATURE_20 **§5.1 / §5.2** satisfied (no server booking calculator; ownership via segments and shapes) and the repo is ready for **20.3** (client-heavy tranche).
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
+- **Problem / why now:** Sessions **20.2.1–20.2.3** aligned entities, relationships, and preview to Phase **20.1** schema. FEATURE_20 **§5.1** still lists **appointment persistence** and **calendar event creation** as route areas that must use **raw rows + client payload**, and **§5.3** calls for removing **differential-role-specific** event-shape helpers. This session closes that gap and finishes **phase 20.2** checklist items before **`/phase-end 20.2`**.
+- **Boundaries:** **Booking** (appointments, invites, Google Calendar) + **admin config** (event shapes) on the server; **no** PartFinalizer port; **no** conflation with **availability “differential”** (major/minor perspectives) unless an explicit alias to event-shape role is found.
+- **Patterns to follow:** Keep persistence in repositories/routers **thin** — validate shape, ownership consistency, and required fields; reuse existing `appointmentIncludes` and invite normalization. Calendar code: extend **`inviteOrchestrationService`** / shared helpers rather than duplicating segment lookup.
+- **Risks:** Multi-segment timing: today **one** slot drives **all** Google events — changing to per-segment windows may require **client** payload fields; if so, document and split minimal server read path only (still no resolution math).
+- **Alternatives:** Key calendar events only by `eventInstanceId` (already true per loop); sort instances by `placementKind` / `anchorEdge` using `@shared` placement ordering helpers if present — prefer shared utility over ad hoc compares.
 
-| Domain | Client paths | Server paths | Key models / areas | Shared types |
-|--------|----------------|-------------|---------------------|--------------|
-| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@sha
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
