# Session 20.5.2: — Baseline placement & event routing:** Document **seed expectations** and **how baseline event routing is established** for new and upgraded environments; align language with relational **`event_assignments`** and event orchestrator baseline model (**§9.5** last bullet, **§9.6** mitigation).


### Task 20.5.2.1: Task 20.5.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.2.2



## Completed Tasks

### Task 20.5.2.2: Task 20.5.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.2.3



### Task 20.5.2.1: Task 20.5.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.2.2

<!-- end excerpt session -->



### Task 20.5.2.2: Task 20.5.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.2.3

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (5): `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.2.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.2.2-planning.md`

### `git diff --stat HEAD`

```text
.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md       | 15 ++++++++++-----
 .../sessions/session-20.5.2-guide.md                      |  2 +-
 .../sessions/session-20.5.2-log.md                        | 15 +++++++++++++++
 3 files changed, 26 insertions(+), 6 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md b/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
index 153d3294..a2ab7856 100644
--- a/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
+++ b/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
@@ -188,17 +188,17 @@
 | **Three-property** persistence on **`block_instances`** before APIs assume it. | `20260432_000059_block_instance_three_property_columns.mjs` | `20260432_000060_drop_block_shape_legacy_boolean_columns.mjs` (removes shape-level booleans so instance flags are canonical). | **059** adds `orchestrator` / `wizard_visible` and drops legacy instance columns; **060** completes shape/instance boundary per FEATURE_20 §2. |
 | **Event placement** + **event-instance ownership** before routing UX / booking layout rewrites. | `20260432_000061_event_schema_placement_instance_attendees.mjs`, `20260432_000062_event_shape_placement_admin_metadata.mjs` | `20260432_000049_*` … `000050_*` (differential/minimizer admin cleanup on event shapes, adjacent). | **061** adds `placement_kind` / `anchor_edge`, segment ownership columns, `event_instance_attendees`, **default placement type seeds**; **062** seeds admin cards for placement fields. Client/booking rewrites (phase **20.4**) assume this schema. |
 | **Preserve relational event routing**; no **scalar event** fields on **part instances**. | `20260432_000035_event_assignments_block_instance_only.mjs` | `000034`, `000036`, `000051`–`000055` (validity graph + admin keys for structural event routing). | **035** enforces **`event_assignments`** parent = **blockInstance**. No listed migration introduces `defaultEvent` / `eventOverride` columns on `part_instances` (FEATURE_20 §1.3). |
-| **Seed or confirm** baseline **placement types** and **event-orchestrator** data. | `20260432_000061_event_schema_placement_instance_attendees.mjs` | — | **Partial:** **061** seeds **default placement type** rows by name (see migration header). **`gap:`** — **baseline event-orchestrator** graph (which block/event instances and `event_assignments` rows constitute explicit default routing for an empty vs upgraded DB) is **not** fully specified in migration comments alone → **session 20.5.2** + optional **`server/src/db/seeders/**` audit. |
+| **Seed or confirm** baseline **placement types** and **event-orchestrator** data. | `20260432_000061_event_schema_placement_instance_attendees.mjs` | — | **061** seeds **default placement-type** **`event_shapes`** rows by name (migration header). **Instance trees** and full **`event_assignments`** graphs are **not** migration-seeded for tenants — expectations and **§9.6** mitigation are in **`### Baseline placement & event routing (session 20.5.2)`** / **`#### FEATURE_20 §9.6 mitigation (session 20.5.2)`**. **Addressed (session 20.5.2).** **Seeders:** no `server/src/db/seeders/` directory in-repo at **20.5.2**; enumerate in ops docs if added later. |
 
 #### Narrative (§9.5 logical order vs `20260432` lex order)
 
 **§9.5** states **dependencies** Feature 20 work must respect. **Sequelize** applies **all pending** files matching the configured glob in **lexicographic** order (the **Checkpoint 9** list). That list interleaves **auth**, **wizard copy**, **user_role**, and **Feature 20** DDL. For **greenfield** installs, operators still run the **full** chain once; the **logical** sequence for domain alignment is: relational event + validity foundations (**034–036**, **051–055**) → **type enum** (**058**) → **instance three-property** (**059–060**) → **event placement + segments + attendee rename + placement admin** (**061–062**), with **049–050** and other adjacent files already positioned earlier in lex order. **Upgraded** DBs may have applied subsets historically; idempotent migrations and repair files (**053–054**) cover rename drift.
 
-#### Gaps for session 20.5.2
+#### Addressed (session 20.5.2)
 
-- **Baseline event-orchestrator:** Document explicitly what data must exist after migrate (and/or seed) so **default routing** is never “whatever the ORM left null” — tie to **FEATURE_20** §5.2 / **§9.6** row *Migration sequence leaves default routing implicit*.
-- **Seeders:** If production/staging rely on **`server/src/db/seeders/**`**, enumerate which seeds supply orchestrator-relevant rows vs migrations-only baselines.
-- **Fresh vs upgraded:** One short subsection on differences (empty DB after migrate vs legacy rows).
+- **Baseline event-orchestrator** (closed): **`#### Fresh database`**, **`#### Upgraded database`**, **`#### Placement-type seeds (061)`**, **`#### Relational routing (`event_assignments`)`**, **`#### Orchestrator baseline vs profile override`**, and **`#### FEATURE_20 §9.6 mitigation (session 20.5.2)`** under **`### Baseline placement & event routing (session 20.5.2)`** — with **FEATURE_20** §5.2 / §9.6 cross-references.
+- **Seeders** (closed): **N/A** in-repo — no `server/src/db/seeders/` tree at **20.5.2**; if seeders are introduced for staging/production, operators should document which files supply orchestrator-relevant rows vs migrations-only DDL/seeds.
+- **Fresh vs upgraded** (closed): **`#### Fresh database`** vs **`#### Upgraded database`** in the same **`###`**.
 
 #### Canonical narrative home
 
@@ -230,3 +230,8 @@
 
 - **Orchestrator baseline** (shape-level **validity** such as **`valid_event_cascades`** / related graph, then persisted **`event_assignments`** from **event instances** to **part instances**) is the **stored default** path the booking stack should read when no client override applies. **Profile override** is the **client** path (**PartFinalizer** and related selection UX) that may choose an alternate segment assignment; resolution order follows **FEATURE_20** §1.2 (**override** when present, else **baseline**).
 - **FEATURE_20** §5.2 still applies: the server **persists** the submitted appointment payload and does **not** re-run PartFinalizer as a second calculator for the same contract. Documenting baseline vs override here is **data and client-resolution** clarity, not a new server-side inference layer that invents **`event_assignments`**.
+
+#### FEATURE_20 §9.6 mitigation (session 20.5.2)
+
+- **Risk (FEATURE_20 §9.6):** *Migration sequence leaves default routing implicit* — would conflict with an explicit baseline **event-orchestrator** model.
+- **Mitigation (this worklog):** **Default routing** is **not** “whatever the ORM left null” and **no** documented server path **synthesizes** **`event_assignments`** as a silent baseline when graphs are empty. After migrate, **061** guarantees **placement-type catalog** rows on **`event_shapes`** only; **routing edges** live in **`event_assignments`** and related instance data supplied by **admin configuration**, imports, or product flows. That preserves **FEATURE_20** §5.2 (persist the client payload; no second PartFinalizer on the server) and keeps baselines **relational** and **inspectable** in the database.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md
index 3ce2c4d9..ae89762f 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md
@@ -59,7 +59,7 @@ These sections contain session-specific content:
 **Approach:** [Approach to take]
 **Checkpoint:** [What needs to be verified]
 
-- [ ] #### Task 20.5.2.2: [Task Name]
+- [x] #### Task 20.5.2.2: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md
index 8411f261..ae6c63f2 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-log.md
+++ b/.project-manager/
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
