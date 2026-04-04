# Session 20.7.3: Close-out backlog mapping


### Task 20.7.3.1: Task 20.7.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.3.2



## Completed Tasks

### Task 20.7.3.2: Task 20.7.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.3.3



### Task 20.7.3.1: Task 20.7.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.3.2

<!-- end excerpt session -->



### Task 20.7.3.2: Task 20.7.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.3.3





## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (8): `.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.3.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.3.2-planning.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.7.3/`

### `git diff --stat HEAD`

```text
.../phases/phase-20.7-log.md                       |   8 +
 .../sessions/session-20.7.3-guide.md               |   2 +
 .../sessions/session-20.7.3-handoff.md             |  23 +-
 .../sessions/session-20.7.3-log.md                 |   6 +
 .../sessions/session-20.7.3-planning.md            | 385 ++++++---------------
 .../sessions/task-20.7.3.1-planning.md             | 163 ---------
 .../sessions/task-20.7.3.2-planning.md             | 161 ---------
 7 files changed, 131 insertions(+), 617 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md
index f09db227..4fdd333a 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.7-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 20.7.3: Residual execution backlog (phases 20.8–20.13) ✅
+**Completed:** 2026-04-04
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** Close-out backlog mapping
+
+
+
 ### Session 20.7.3: Residual execution backlog (phases 20.8–20.13) ✅
 **Completed:** 2026-04-04  
 **Tasks Completed:** 20.7.3.1, 20.7.3.2  
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-guide.md
index 5f17c404..5f1bef88 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-guide.md
@@ -414,3 +414,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-handoff.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-handoff.md
index 9512b8eb..5235d50f 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-handoff.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-handoff.md
@@ -12,22 +12,21 @@
 
 ## Current Status
 
-**Last completed:** Tasks **20.7.3.1** (crosswalk preflight §§1–2 → **`phase-20.8`–`phase-20.13`** guides), **20.7.3.2** (**`preflight-evidence-20.7.2.md`** §3–§4, handoffs, **`phase-20.7-log.md`**).  
-**Git branch:** `feature/domain-architecture-alignment`
-
----
+**Last Completed:** Task 
+**Next Session:** Session 
+**Git Branch:** `feature/domain-architecture-alignment`
+**Last Updated:** 2026-04-04
 
 ## Next Action
 
-1. **`/phase-end 20.7`** — close Phase **20.7** on the harness (feature: **`domain-architecture-alignment`**).  
-2. **`/phase-start 20.8`** — begin **[`../phases/phase-20.8-guide.md`](../phases/phase-20.8-guide.md)** (residual schema and API enforcement).
-
-Do **not** run **`/feature-end`** until extension **20.13** and truth-doc work are complete per **[`../architecture-alignment-closeout-master-plan.md`](../architecture-alignment-closeout-master-plan.md)**.
-
----
+Start Session  (see session guide and phase guide for scope).
 
 ## Transition Context
 
-**Where we left off:** Preflight package is **complete** (**[`../preflight-evidence-20.7.2.md`](../preflight-evidence-20.7.2.md)** §§1–4). Each extension phase guide **20.8–20.13** has a **Preflight follow-ups (Session 20.7.2)** subsection for execution.
+**Where we left off:**
+Completed Task 
+
+**What you need to start:**
+- Begin Session 
 
-**What you need to start Phase 20.8:** Read **`phase-20.8-guide.md`**, **`preflight-evidence-20.7.2.md`** (for context), and **[`.project-manager/ARCHITECTURE.md`](../../../ARCHITECTURE.md)** §8–§14 as needed.
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-log.md
index 78100ae3..b576f855 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-log.md
@@ -201,3 +201,9 @@ index cfc0eee0..182f8586 100644
 … (truncated)
 ```
 <!-- /harness:anchor:commit-preview -->
+
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-planning.md
index 7c76ccb5..9d345fa3 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-planning.md
@@ -1,33 +1,8 @@
-# Plan: session 20.7.3 — Residual execution backlog (phases 20.8–20.13)
-
-## Contract
-- **Tier:** session | **ID:** 20.7.3
-- **Scope:** Map **`preflight-evidence-20.7.2.md`** conclusions into **actionable backlog rows** on **`phase-20.8-guide.md`–`phase-20.13-guide.md`** and **`across-ladder.json`** (session notes where applicable); complete remaining **`preflight-evidence-20.7.2.md` §3–§4** (migration policy + **`property_details`** boundary); update **phase / feature handoffs** for **`/phase-start 20.8`**. **No** duplication of completed **20.1–20.6** pass work.
-- **Governance (harness snapshot):**
-  - Governance Context (Session)
-  - Function Governance
-  - Clean — no violations detected.
-  - Component Governance
-  - Clean — no violations detected.
-  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
-  - `client/src/composables/admin/useEntityCardSaveAndActions.ts` — oversized-return: Return surface has 14 properties; decompose into focused composables
-  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Return surface has 15 properties; decompose into focused composables
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
-**Session 20.7.2** produced **`preflight-evidence-20.7.2.md`** with **§1–§2** complete; **§3–§4** are still stubs. **`across-ladder.json`** lists **20.7.3** under phase **20.7**; **`nextTaskAcross`** → **20.7.3.1**.
+<!-- harness-planning-rollup tier=session id=20.7.3 consolidatedAt=2026-04-04T18:38:51.248Z -->
+
+# Consolidated planning: session 20.7.3
+
+## Session 20.7.3 (parent)
 
 ## Story
 
@@ -36,316 +11,164 @@
 **Estimated size:** M (docs-only; no product refactor unless filed as a later phase task).
 
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
-| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
