# Session 20.3.2: — Service atomic editor (§8.3 #2):** **ServiceAtomicEditor** — service block-instance **convergence / atomic** editing aligned with §3 / §9 instance model (`orchestrator`, `composite`, `wizardVisible` where applicable).


### Task 20.3.2.1: Task 20.3.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.2.2



## Completed Tasks

### Task 20.3.2.2: Task 20.3.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.2.3



### Task 20.3.2.1: Task 20.3.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.2.2

<!-- end excerpt session -->



### Task 20.3.2.2: Task 20.3.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.2.3


## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md`, `client/src/components/admin/generic/EntityCardContent.vue`, `client/src/composables/admin/useServiceAtomicPartRows.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.2.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.2.2-planning.md`, `client/src/components/admin/generic/ServiceAtomicEditor.vue`

### `git diff --stat HEAD`

```text
.../sessions/session-20.3.2-guide.md                     |  2 +-
 .../sessions/session-20.3.2-log.md                       | 15 +++++++++++++++
 .../src/components/admin/generic/EntityCardContent.vue   |  6 ++++++
 client/src/composables/admin/useServiceAtomicPartRows.ts | 16 +++++++++-------
 4 files changed, 31 insertions(+), 8 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md
index cc81c208..2ee80a36 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md
@@ -61,7 +61,7 @@ These sections contain session-specific content:
 **Approach:** Pure composable + explicit return type; document column mapping vs `PartInstanceEntity`; logger on failure paths.
 **Checkpoint:** Composable returns stable rows for a real service instance in dev; no UI required.
 
-- [ ] #### Task 20.3.2.2: ServiceAtomicEditor UI + EntityCard integration
+- [x] #### Task 20.3.2.2: ServiceAtomicEditor UI + EntityCard integration
 **Goal:** **VCard + VDataTable** (or equivalent) mounted from `EntityCardContent` for **service** instances only; surface convergence columns; save via existing **partInstance** update path; convergence-oriented labels.
 **Files:**
 - `client/src/components/admin/generic/ServiceAtomicEditor.vue` (new)
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md
index 65d532fd..16a79aaf 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md
@@ -11,6 +11,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.2.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.2.2-planning.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.3.2/`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-20.3-guide.md                     |   2 +-
 .../phases/phase-20.3-log.md                       |   8 +
 .../sessions/session-20.3.2-guide.md               |   2 +
 .../sessions/session-20.3.2-log.md                 |   7 +-
 .../sessions/session-20.3.2-planning.md            | 346 ++++++++-------------
 .../sessions/task-20.3.2.1-planning.md             | 193 ------------
 .../sessions/task-20.3.2.2-planning.md             | 190 -----------
 7 files changed, 152 insertions(+), 596 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
index 6f6be1d6..c28d670c 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
@@ -88,7 +88,7 @@ Harness expects each session below as `### Session X.Y.Z:` (do not remove headin
 
 **Tasks:** Session planning → implement focused editor + field display alignment → manual smoke on Shapes tab event panel.
 
-- [ ] ### Session 20.3.2: Service atomic editor (§8.3 #2)
+- [x] ### Session 20.3.2: Service atomic editor (§8.3 #2)
 
 **Description:** ServiceAtomicEditor (or equivalent) for service block-instance convergence / atomic editing aligned with the three-property instance model.
 
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
index d2b2a40d..5c0cb650 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 20.3.2: Service atomic editor (§8.3 #2) ✅
+**Completed:** 2026-04-02
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** Service atomic editor (ServiceAtomicEditor)
+
+
+
 ### Session 20.3.1: Placement type editor (§8.3 #1) ✅
 **Completed:** 2026-04-02
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md
index 2ee80a36..2ab1758a 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md
@@ -418,3 +418,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md
index 555f7de1..160aff2c 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md
@@ -71,4 +71,9 @@ index 65d532fd..16a79aaf 100644
 --- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md
 +++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-planning.md
index 54faec33..12183772 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-planning.md
@@ -1,284 +1,208 @@
-# Plan: session 20.3.2 — Service atomic editor (FEATURE_20 §8.3 #2)
-
-## Contract
-- **Tier:** session | **ID:** 20.3.2
-- **Scope:** **ServiceAtomicEditor** (or equivalent) — **service** `blockInstance` convergence surface: part-instance rows (base time/fee, rates, zero-out) in one table aligned with Principles §4 / §9.1; validity remains shape-level; this session does **not** redefine `valid_*` graphs.
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
-Completed Task - Begin Session 20.3.2 <!-- harness-across-ladder:start -->
+<!-- harness-planning-rollup tier=session id=20.3.2 consolidatedAt=2026-04-02T19:56:33.023Z -->
+
+# Consolidated planning: session 20.3.2
+
+## Session 20.3.2 (parent)
 
 ## Story
+
 **This session delivers** a **service block-instance atomic / convergence editor** (VCard + tabular part rows) **so that** admins see and edit **all work-item part instances** for a service in one place—matching FEATURE_20 **§3.6** / **§8.3** item 2 and proving the **inline part-row** pattern before time/price/event atomic editors.
 **Estimated size:** M
 
 ---
-## Architecture context (harness-injected)
 
-## 1. System overview
+## Analysis
 
-Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:
+- **Problem / why now:** Session **20.3.1** shipped placement-first event-shape UX. **§8.3 #2** is next: the **service atomic** surface is the highest-value **convergence** view (part ledger per service instance) and templates the **VDataTable** pattern for time/price/event atomics.
+- **Boundaries:** **Client admin only.** Do **not** change PartFinalizer math or add server-side resolution. **Shapes** tab stays structural; this editor lives on **Instances** for **service** `blockInstance` only. **Orchestrator / composite / wizardVisible** stay on the existing EntityCard fields—only add the **atomic parts** table (or explicitly defer three-property toggles if already sufficient in metadata).
+- **Grounding:** Reuse **`usePartsTotals` / `blockInstancePartsTotalsResolution`** lineage—same part rows the fee preview uses—so admin and booking share one notion of “parts under this block.”
+- **Child-tier patterns:** Thin **ServiceAtomicEditor.vue**; composable for row resolution + optional save orchestration; explicit return types; logger on catch per project rules.
+- **Risks:** Wide table on mobile—use **horizontal scroll** + compact density. Accidental edits—confirm save path matches **partInstance** entity mutations. **Mitigation:** start with read-only columns if wiring is unclear, then enable edits in 20.3.2.2.
+- **Alternatives:** Only link to **PartInstanceList** — **rejected** (fails §3.6 convergence goal). Full **EntityCard** replacement — **out of scope** for this session (additive panel first).
 
-- **Public booking users** — wizard-style scheduling and property/availability flows.
-- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.
+## Goal
 
-TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often batch-prefetched (e.g. router navigation guards).
+Ship **ServiceAtomicEditor** for **service** `blockInstance`: a **VCard + VDataTable** (or equivalent) 
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
