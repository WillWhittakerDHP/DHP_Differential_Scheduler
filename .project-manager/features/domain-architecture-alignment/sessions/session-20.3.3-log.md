# Session 20.3.3: — Remaining domain editors (§8.3 #3):** Other shape-type instance editors: orchestration selection UX for **time** / **price** / **event** instances as needed; shared patterns from 20.3.1–20.3.2.


### Task 20.3.3.1: Task 20.3.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.3.2



## Completed Tasks

### Task 20.3.3.2: Task 20.3.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.3.3



### Task 20.3.3.1: Task 20.3.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.3.2

<!-- end excerpt session -->



### Task 20.3.3.2: Task 20.3.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.3.3.3


## Harness: commit preview (in-scope diff)

Paths (7): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md`, `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`, `client/src/utils/forms/formFieldsMetadataWarningResolution.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.3.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.3.2-planning.md`, `client/src/utils/forms/applyPrimitiveDisplayOverlay.ts`

### `git diff --stat HEAD`

```text
.../sessions/session-20.3.3-guide.md               |  2 +-
 .../sessions/session-20.3.3-log.md                 | 15 ++++++++++++++
 .../appliedDisplay/blockInstanceDisplays.ts        | 24 ++++++++++++++++++++++
 .../forms/formFieldsMetadataWarningResolution.ts   |  4 +++-
 4 files changed, 43 insertions(+), 2 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md
index 5e307941..6f58ec58 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md
@@ -61,7 +61,7 @@ These sections contain session-specific content:
 **Approach:** Reuse or generalize **20.3.2** patterns; explicit types; logger on failed updates.
 **Checkpoint:** Lint + type-check; manual smoke on Instances tab for time + price shapes.
 
-- [ ] #### Task 20.3.3.2: Event block instance — orchestration copy & display
+- [x] #### Task 20.3.3.2: Event block instance — orchestration copy & display
 **Goal:** Validity-constrained **orchestration** language on **event** block instance cards (labels/descriptions/display metadata).
 **Files:**
 - `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
index f3eaeda4..5c1909b5 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
@@ -11,6 +11,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.3.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.3.3.2-planning.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.3.3/`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-20.3-guide.md                     |   2 +-
 .../phases/phase-20.3-log.md                       |   8 +
 .../sessions/session-20.3.3-guide.md               |   2 +
 .../sessions/session-20.3.3-log.md                 |   7 +-
 .../sessions/session-20.3.3-planning.md            | 345 +++++++--------------
 .../sessions/task-20.3.3.1-planning.md             | 183 -----------
 .../sessions/task-20.3.3.2-planning.md             | 165 ----------
 7 files changed, 133 insertions(+), 579 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
index c28d670c..d146e147 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md
@@ -94,7 +94,7 @@ Harness expects each session below as `### Session X.Y.Z:` (do not remove headin
 
 **Tasks:** Session planning → composables/components for service-instance UX → verify against `ENTITY_CONFIGS` / generic admin patterns.
 
-- [ ] ### Session 20.3.3: Remaining domain editors (§8.3 #3)
+- [x] ### Session 20.3.3: Remaining domain editors (§8.3 #3)
 
 **Description:** Instance-level orchestration UIs for other shape types (**time** / **price** / **event**) using validity-constrained selection language.
 
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
index d9168678..f175c66e 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.3-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 20.3.3: Remaining domain editors (§8.3 #3) ✅
+**Completed:** 2026-04-02
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** Remaining domain editors (§8.3 #3)
+
+
+
 ### Session 20.3.2: Service atomic editor (§8.3 #2) ✅
 **Completed:** 2026-04-02
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md
index 6f58ec58..4b9bda64 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-guide.md
@@ -417,3 +417,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
index a92cac2b..6ba109d5 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
@@ -71,4 +71,9 @@ index f3eaeda4..5c1909b5 100644
 --- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
 +++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-planning.md
index f700c6f1..4bf31b35 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-planning.md
@@ -1,301 +1,188 @@
-# Plan: session 20.3.3 — Remaining domain editors (FEATURE_20 §8.3 #3)
-
-## Contract
-- **Tier:** session | **ID:** 20.3.3
-- **Scope:** Remaining instance-level editors for **time** and **price** block instances (atomic part ledger UX, mirroring 20.3.2); **event** block-instance orchestration copy and field presentation (validity-constrained selection language) without segment relocation (that is **20.3.4**).
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
-Completed Task - Begin Session 20.3.3 <!-- harness-across-ladder:start -->
+<!-- harness-planning-rollup tier=session id=20.3.3 consolidatedAt=2026-04-02T20:22:09.191Z -->
+
+# Consolidated planning: session 20.3.3
+
+## Session 20.3.3 (parent)
 
 ## Story
+
 **This session delivers** (1) **time** and **price** counterparts to the **service** convergence table pattern from **20.3.2**, and (2) clearer **event** block-instance admin copy and field framing aligned with **orchestrators as active assignment selectors** — **so that** §8.3 item **#3** is satisfied before **segment relocation (20.3.4)**.
 
 **Estimated size:** M
 
 ---
-## Architecture context (harness-injected)
 
-## 1. System overview
+## Analysis
 
-Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:
+- **Problem / why now:** **20.3.1** (placement) and **20.3.2** (service atomic) are done. §8.3 **#3** requires **parity** for other scheduling domains (**time**, **price**, **event**) at the **instance** card level so admins do not fall back to opaque generic fields only.
+- **Boundaries:** **Client admin** only; **no** new booking math; **no** server PartFinalizer; **no** segment-island move (deferred to **20.3.4**).
+- **Dependencies:** Reuse **`blockInstancePartsTotalsResolution`** + **`useEntityCrud('partInstance')`** patterns from **20.3.2**.
+- **Risks:** Copy-heavy task (**20.3.3.2**) can sprawl — keep changes in **display metadata**, **tooltips**, or a **small** presentational component; avoid rewriting **RelationshipCollection** internals in this session.
+- **Alternatives:** Single mega-composable for all shape types — **rejected** for readability; prefer **shared utility** + **thin per-type composable** or **parameterized** gate list if duplication is mechanical.
 
-- **Public booking users** — wizard-style scheduling and property/availability flows.
-- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.
+## Goal
 
-TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often batch-prefetched (e.g. router navigation guards).
+Close **FEATURE_20 §8.3 #3** for this feature branch: deliver **time**- and **price**-shaped **block instance** part-ledger editors analogous to **ServiceAtomicEditor**, and improve **event** **block instance** admin **copy / field framing** for orchestration-related surfaces using **validity-constrained selection** language — **without** implementing **segment manager relocation** (session **20.3.4**).
 
----
+## Files
 
-## 2. Domain map
+- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§3, §6, §8.3, §9.1), `.proj
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
