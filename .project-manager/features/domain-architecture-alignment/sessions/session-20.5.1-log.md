# Session 20.5.1: — Migration chain inventory:** Map existing **`20260432_*`** migrations to **FEATURE_20 §1–2** and **§9.5** ordering; note any **ordering gaps** or **undocumented steps**; choose **worklog vs `MIGRATION_SEQUENCE.md`** as the canonical narrative home; first draft of the sequence table.


### Task 20.5.1.1: Task 20.5.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.1.2



## Completed Tasks

### Task 20.5.1.2: Task 20.5.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.1.3



### Task 20.5.1.1: Task 20.5.1.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.1.2

<!-- end excerpt session -->



### Task 20.5.1.2: Task 20.5.1.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.1.3


## Harness: commit preview (in-scope diff)

Paths (5): `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.1.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.1.2-planning.md`

### `git diff --stat HEAD`

```text
.../analysis/DOMAIN_REWRITE_WORKLOG.md             | 24 ++++++++++++++++++++++
 .../sessions/session-20.5.1-guide.md               |  2 +-
 .../sessions/session-20.5.1-log.md                 | 15 ++++++++++++++
 3 files changed, 40 insertions(+), 1 deletion(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md b/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
index d4941759..b870cf4b 100644
--- a/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
+++ b/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
@@ -179,3 +179,27 @@
 - **Wizard / availability / differential-era cleanup:** 037–039, 043–044, 049–050.
 - **User role (Feature 6 adjacency):** 056–057.
 - **Feature 20 phase 20.1 tranche (enum + instance + event):** **058–062**.
+
+### FEATURE_20 §9.5 migration crosswalk (task 20.5.1.2)
+
+| §9.5 bullet (paraphrase) | Primary migrations | Supporting / prerequisite | Notes or `gap:` |
+| --- | --- | --- | --- |
+| Migrate **type names** first (`time` / `price` / `event`). | `20260432_000058_rename_block_shape_type_enum.mjs` | Same file aligns `appointment_selection_lines.line_kind` CHECK + data. | Must run **before** app/admin assumes new `block_shapes.type` labels; on fresh DBs, **058** runs after earlier `20260432_*` files in lex order — OK if no code reads enum labels until migrations complete. |
+| **Three-property** persistence on **`block_instances`** before APIs assume it. | `20260432_000059_block_instance_three_property_columns.mjs` | `20260432_000060_drop_block_shape_legacy_boolean_columns.mjs` (removes shape-level booleans so instance flags are canonical). | **059** adds `orchestrator` / `wizard_visible` and drops legacy instance columns; **060** completes shape/instance boundary per FEATURE_20 §2. |
+| **Event placement** + **event-instance ownership** before routing UX / booking layout rewrites. | `20260432_000061_event_schema_placement_instance_attendees.mjs`, `20260432_000062_event_shape_placement_admin_metadata.mjs` | `20260432_000049_*` … `000050_*` (differential/minimizer admin cleanup on event shapes, adjacent). | **061** adds `placement_kind` / `anchor_edge`, segment ownership columns, `event_instance_attendees`, **default placement type seeds**; **062** seeds admin cards for placement fields. Client/booking rewrites (phase **20.4**) assume this schema. |
+| **Preserve relational event routing**; no **scalar event** fields on **part instances**. | `20260432_000035_event_assignments_block_instance_only.mjs` | `000034`, `000036`, `000051`–`000055` (validity graph + admin keys for structural event routing). | **035** enforces **`event_assignments`** parent = **blockInstance**. No listed migration introduces `defaultEvent` / `eventOverride` columns on `part_instances` (FEATURE_20 §1.3). |
+| **Seed or confirm** baseline **placement types** and **event-orchestrator** data. | `20260432_000061_event_schema_placement_instance_attendees.mjs` | — | **Partial:** **061** seeds **default placement type** rows by name (see migration header). **`gap:`** — **baseline event-orchestrator** graph (which block/event instances and `event_assignments` rows constitute explicit default routing for an empty vs upgraded DB) is **not** fully specified in migration comments alone → **session 20.5.2** + optional **`server/src/db/seeders/**` audit. |
+
+#### Narrative (§9.5 logical order vs `20260432` lex order)
+
+**§9.5** states **dependencies** Feature 20 work must respect. **Sequelize** applies **all pending** files matching the configured glob in **lexicographic** order (the **Checkpoint 9** list). That list interleaves **auth**, **wizard copy**, **user_role**, and **Feature 20** DDL. For **greenfield** installs, operators still run the **full** chain once; the **logical** sequence for domain alignment is: relational event + validity foundations (**034–036**, **051–055**) → **type enum** (**058**) → **instance three-property** (**059–060**) → **event placement + segments + attendee rename + placement admin** (**061–062**), with **049–050** and other adjacent files already positioned earlier in lex order. **Upgraded** DBs may have applied subsets historically; idempotent migrations and repair files (**053–054**) cover rename drift.
+
+#### Gaps for session 20.5.2
+
+- **Baseline event-orchestrator:** Document explicitly what data must exist after migrate (and/or seed) so **default routing** is never “whatever the ORM left null” — tie to **FEATURE_20** §5.2 / **§9.6** row *Migration sequence leaves default routing implicit*.
+- **Seeders:** If production/staging rely on **`server/src/db/seeders/**`**, enumerate which seeds supply orchestrator-relevant rows vs migrations-only baselines.
+- **Fresh vs upgraded:** One short subsection on differences (empty DB after migrate vs legacy rows).
+
+#### Canonical narrative home
+
+**Single home:** continue Feature 20 migration narrative in **`DOMAIN_REWRITE_WORKLOG.md`** (Checkpoint 9 + this crosswalk). **No** separate `MIGRATION_SEQUENCE.md` for this pass.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md
index d320b49f..68adfdde 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md
@@ -59,7 +59,7 @@ These sections contain session-specific content:
 **Approach:** [Approach to take]
 **Checkpoint:** [What needs to be verified]
 
-- [ ] #### Task 20.5.1.2: [Task Name]
+- [x] #### Task 20.5.1.2: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-log.md
index 01d0e97a..abec7156 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-log.md
@@ -11,6 +11,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (9): `.project-manager/features/domain-architecture-alignment/phases/phase-20.5-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.1.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.1.2-planning.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.5-log.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.5.1/`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-handoff.md`

### `git diff --stat HEAD`

```text
.../phases/phase-20.5-guide.md                     |   2 +-
 .../sessions/session-20.5.1-guide.md               |   2 +
 .../sessions/session-20.5.1-log.md                 |   7 +-
 .../sessions/session-20.5.1-planning.md            | 312 +++++++--------------
 .../sessions/task-20.5.1.1-planning.md             | 150 ----------
 .../sessions/task-20.5.1.2-planning.md             | 160 -----------
 6 files changed, 110 insertions(+), 523 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.5-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.5-guide.md
index d3722490..f1828e69 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.5-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.5-guide.md
@@ -81,7 +81,7 @@ Migration steps must remain permitted by **ARCHITECTURE_PRINCIPLES.md**; use **p
 
 Use session guides (`sessions/session-20.5.*-guide.md`) as each session starts; keep this phase guide objectives in sync at session-end.
 
-- [ ] ### Session 20.5.1: Migration chain inventory
+- [x] ### Session 20.5.1: Migration chain inventory
 **Description:** Map existing **`20260432_*`** migrations to **FEATURE_20 §9.5** ordering; choose **DOMAIN_REWRITE_WORKLOG** vs **`MIGRATION_SEQUENCE.md`**; draft the ordered sequence table.
 
 **Tasks:**
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md
index 68adfdde..ed178608 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md
@@ -414,3 +414,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-log.md
index 635efde8..4393ee66 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-log.md
@@ -102,4 +102,9 @@ index 01d0e97a..abec7156 100644
 --- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-log.md
 +++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-planning.md
index 2da52c59..d9ec1eb3 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-planning.md
@@ -1,278 +1,168 @@
-# Plan: session 20.5.1 — Migration chain inventory
-
-## Contract
-- **Tier:** session | **ID:** 20.5.1
-- **Scope:** Map **`server/src/db/migrations/20260432_*.mjs`** to **FEATURE_20** §1–2 and **§9.5** ordering; flag gaps; choose canonical doc home; land **first draft** ordered sequence table.
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
-Phase **20.5** started after **20.4** (placement-only booking + shared cleanup). **20.5.1** is the first session of **Pass 5 (§8.5)** — documentation-only unless a gap forces a new migration file (author only; run on DB host per policy).
+<!-- harness-planning-rollup tier=session id=20.5.1 consolidatedAt=2026-04-03T00:00:44.361Z -->
+
+# Consolidated planning: session 20.5.1
+
+## Session 20.5.1 (parent)
 
 ## Story
+
 **This session delivers** a **traceable migration narrative** (ordered files + **§9.5** crosswalk) **so that** **20.5.2** can document **baseline routing/seeds** without guessing order, and **§8.5** acceptance stays auditable.
 **Estimated size:** S–M (docs + table; no app code unless explicitly scoped later).
 
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
+- **Why now:** **§8.5** / **§9.5** require an **explicit** sequence; code exists but the **narrative** was fragmented across phase logs.
+- **Boundaries:** **`.project-manager/analysis/`** + migration **filenames** as evidence; **no** client/server product code in **20.5.1** unless a task discovers a **blocking** doc error (then note follow-up, do not expand scope silently).
+- **Child tasks:** Prefer **small commits**: inventory markdown first, then crosswalk table.
+- **Risks:** Mis-ordering migrations in prose could mislead operators — mitigate by **copying numeric order from filesystem** and citing file names.
+- **Alternatives:** New **`MIGRATION_SEQUENCE.md`** only — deferred unless worklog becomes too long (**>~100 lines** added).
 
-| Domain | Client paths | Server paths | Key models / areas | Shared types |
-|--------|----------------|-------------|---------------------|--------------|
-| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
-| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `admin-metadata`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
-| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Session 6.18.1) |
-| **Integrations** | `services/calendarApiService`, `mapsApiService`, `propertyEnrichmentApiService` (full-URL axios) | `routes/external/calendar`, `oauth`, `maps`, `services/google/` | OAuth, external APIs | `@shared/types/calendar` |
-| **Beta** | `composables/beta/`, `views/beta/`, `components/beta
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
