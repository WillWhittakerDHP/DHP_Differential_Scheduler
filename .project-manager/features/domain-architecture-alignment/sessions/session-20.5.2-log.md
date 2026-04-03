# Session 20.5.2: — Baseline placement & event routing:** Document **seed expectations** and **how baseline event routing is established** for new and upgraded environments; align language with relational **`event_assignments`** and event orchestrator baseline model (**§9.5** last bullet, **§9.6** mitigation).


### Task 20.5.2.1: Task 20.5.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.2.2



## Completed Tasks

### Task 20.5.2.1: Task 20.5.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.2.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (6): `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`, `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.2.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.2.1-planning.md`

### `git diff --stat HEAD`

```text
.../analysis/DOMAIN_REWRITE_WORKLOG.md             | 27 ++++++++++++++++++++++
 .../across-ladder.json                             |  2 +-
 .../sessions/session-20.5.2-guide.md               |  2 +-
 .../sessions/session-20.5.2-log.md                 | 18 +++++++++++++++
 4 files changed, 47 insertions(+), 2 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md b/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
index b870cf4b..153d3294 100644
--- a/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
+++ b/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
@@ -203,3 +203,30 @@
 #### Canonical narrative home
 
 **Single home:** continue Feature 20 migration narrative in **`DOMAIN_REWRITE_WORKLOG.md`** (Checkpoint 9 + this crosswalk). **No** separate `MIGRATION_SEQUENCE.md` for this pass.
+
+### Baseline placement & event routing (session 20.5.2)
+
+#### Fresh database
+
+- After a **full** `20260432_*` migrate on an empty database, you get **schema** (including **`event_assignments`**, validity graph tables, **`event_shapes` / `event_instances`** placement and segment columns, **`event_instance_attendees`**, block-instance three-property columns per **059–060**, etc.) plus **061**’s **default placement-type** rows on **`event_shapes`** (and **062** admin metadata for placement fields).
+- **Migrations do not** fabricate tenant **`block_instances`**, **`event_instances`**, template **`part_instances`**, or a complete **`event_assignments`** graph for production use. Those graphs are created by **admin configuration**, imports, or product flows — not implied by “migrate succeeded.”
+- **Recon:** this repo has **no** `server/src/db/seeders/**` tree at the time of this section; treat **baseline instance + assignment data** as **migrations (DDL + named placement seeds) + operator/product actions**, not automatic ORM defaults.
+
+#### Upgraded database
+
+- **035** reparents and cleans **`event_assignments`** so the parent is **`blockInstance`** only; **034 / 036 / 051–055** align validity and admin keys with shape-level event routing. **061** adds placement/segment/attendee surfaces and renames or adds columns as in its header; **058** renames block-shape type enum values.
+- **Routing semantics** remain **relational**: **`event_assignments`** rows link **event instances** (and segments where modeled) to **part instances**. **No** migration in this crosswalk adds **scalar** “default event” / “event override” columns on **`part_instances`** (see **FEATURE_20** §1.3). Legacy rows are transformed or pruned per each file’s idempotent logic; meaning is still read from the **stored graph**, not from nulls interpreted as magic defaults.
+
+#### Placement-type seeds (061)
+
+- **`20260432_000061_event_schema_placement_instance_attendees.mjs`** guarantees **named default placement-type** **`event_shapes`** rows (catalog semantics — see the migration header for the exact labels). It **does not** claim to seed every template **block/event** tree, every **event_instance**, or every **`event_assignments`** edge an operator might expect for a “fully wired” demo tenant.
+- **062** adds **admin_metadata** cards for **`placement_kind`** / **`anchor_edge`** on event shapes; it is **admin UX**, not a substitute for instance-level routing data.
+
+#### Relational routing (`event_assignments`)
+
+- **`20260432_000035_event_assignments_block_instance_only.mjs`** is the enforcement line: **`event_assignments`** attach under **`blockInstance`**, not free-floating or part-shape-only parents. Edges express **which part instance** participates in **which event instance** (and segment ownership is carried on **`event_instances`** per **061**), consistent with **FEATURE_20** §2 / §1.2 — **structural** routing lives in tables, not ad hoc columns on parts.
+
+#### Orchestrator baseline vs profile override
+
+- **Orchestrator baseline** (shape-level **validity** such as **`valid_event_cascades`** / related graph, then persisted **`event_assignments`** from **event instances** to **part instances**) is the **stored default** path the booking stack should read when no client override applies. **Profile override** is the **client** path (**PartFinalizer** and related selection UX) that may choose an alternate segment assignment; resolution order follows **FEATURE_20** §1.2 (**override** when present, else **baseline**).
+- **FEATURE_20** §5.2 still applies: the server **persists** the submitted appointment payload and does **not** re-run PartFinalizer as a second calculator for the same contract. Documenting baseline vs override here is **data and client-resolution** clarity, not a new server-side inference layer that invents **`event_assignments`**.
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index b379220a..ba0c7c1b 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-03T00:01:24.062Z",
+  "derivedAt": "2026-04-03T00:02:45.444Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md
index 60380ef6..3ce2c4d9 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 20.5.2.1: [Task Name]
+- [x] #### Task 20.5.2.1: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md
index c611b514..7f60fc02 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md
@@ -1,2 +1,20 @@
 # Session 20.5.2: — Baseline placement & event routing:** Document **seed expectations** and **how baseline event routing is established** for new and upgraded environments; align language with relational **`event_assignments`** and event orchestrator baseline model (**§9.5** last bullet, **§9.6** mitigation).
 
+
+### Task 20.5.2.1: Task 20.5.2.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.5.2.2
+
+
+
+## Completed Tasks
+
+### Task 20.5.2.1: Task 20.5.2.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.5.2.2
+
+<!-- end excerpt session -->
\ No newline at end of file
```
<!-- /harness:anchor:commit-preview -->
