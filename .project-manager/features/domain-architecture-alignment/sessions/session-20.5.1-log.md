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

<!-- harness:anchor:commit-preview -->
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
 