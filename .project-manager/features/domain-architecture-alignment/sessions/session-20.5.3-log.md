# Session 20.5.3: — Legacy assumption closure:** Complete **§0.2 / §2** legacy-to-target mapping in writing; verify **no migration step** depends on undocumented implicit defaults; final edit pass on **§8.5** acceptance checklist; prepare **phase handoff** for **20.6**.


### Task 20.5.3.1: Task 20.5.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.3.2



## Completed Tasks

### Task 20.5.3.1: Task 20.5.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.5.3.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (6): `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`, `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.3-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.3.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.3.1-planning.md`

### `git diff --stat HEAD`

```text
.../analysis/DOMAIN_REWRITE_WORKLOG.md             | 29 ++++++++++++++++++++++
 .../across-ladder.json                             |  2 +-
 .../sessions/session-20.5.3-guide.md               |  2 +-
 .../sessions/session-20.5.3-log.md                 | 18 ++++++++++++++
 4 files changed, 49 insertions(+), 2 deletions(-)
```

### `git diff HEAD`

```diff
diff --git a/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md b/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
index a2ab7856..638ba589 100644
--- a/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
+++ b/.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md
@@ -235,3 +235,32 @@
 
 - **Risk (FEATURE_20 §9.6):** *Migration sequence leaves default routing implicit* — would conflict with an explicit baseline **event-orchestrator** model.
 - **Mitigation (this worklog):** **Default routing** is **not** “whatever the ORM left null” and **no** documented server path **synthesizes** **`event_assignments`** as a silent baseline when graphs are empty. After migrate, **061** guarantees **placement-type catalog** rows on **`event_shapes`** only; **routing edges** live in **`event_assignments`** and related instance data supplied by **admin configuration**, imports, or product flows. That preserves **FEATURE_20** §5.2 (persist the client payload; no second PartFinalizer on the server) and keeps baselines **relational** and **inspectable** in the database.
+
+### Legacy assumption closure (session 20.5.3)
+
+#### §0.2 legacy assumptions → replacement
+
+| §0.2 assumption (paraphrase) | Removed / replaced by | Evidence |
+| --- | --- | --- |
+| Shape-level **`composite` / `orchestrator`** (and shape-level three-property framing). | **Three booleans only on `block_instances`** (`composite`, `orchestrator`, `wizardVisible`); legacy shape booleans dropped. | **`20260432_000059_block_instance_three_property_columns.mjs`**, **`20260432_000060_drop_block_shape_legacy_boolean_columns.mjs`**; **FEATURE_20** §2.5; **`#### Orchestrator baseline vs profile override`** above. |
+| Orchestrators **define validity** instead of **selecting** from the shape-level graph. | Orchestrators = **active assignment selectors**; **`valid_*` / `valid_event_cascades`** = structural universe. | **`20260432_000036_admin_metadata_valid_events_block_shape.mjs`**, **051–055** renames; worklog **§9.5 crosswalk**; admin/booking UX phases (**20.3** / **20.4**) per **FEATURE_20**. |
+| **Service-default / event-atomic** event ownership drift (weakens orchestrator baseline + profile override). | **Relational `event_assignments`** + **event orchestrator baseline** + **PartFinalizer profile override** (client). | **`20260432_000035_*`**, **061–062**, **`### Baseline placement & event routing`**; **FEATURE_20** §1.2. |
+| **Server** becomes a **second booking calculator** (resolution drift). | Server **persists** submitted payload; **PartFinalizer** stays **client-only** (**§5.2**). | **FEATURE_20** §5.2; **`.project-manager/ARCHITECTURE.md`** booking boundary (injected in session plans) — **not** a DDL migration; enforced in API/product design. |
+| **Scalar** event fields on **part instances** instead of **`event_assignments`**. | No **`defaultEvent` / `eventOverride`** on parts; routing in **`event_assignments`** only. | **FEATURE_20** §1.3; **§9.5 crosswalk** row “Preserve relational event routing”; **`20260432_000035_*`**. |
+| **Excluding user instances** from the three-property model. | **User block instances** participate in the same instance model. | **059** (orchestrator / wizard_visible on instances — applies across instance types per migration scope); **FEATURE_20** §2.5 bullet “User instances do participate”. |
+
+#### §2 model targets vs legacy (closure)
+
+| Theme | FEATURE_20 §2 anchor | Evidence (this repo) |
+| --- | --- | --- |
+| **Enum rename** `property`→`time`, `coupon`→`price`, `option`→`event` | §2.1 | **`20260432_000058_rename_block_shape_type_enum.mjs`**; **Checkpoint 9** item **25**. |
+| **Tables survive / adapt** (placement, segments, validity, attendees) | §2.2 | **061** (`event_shapes` / `event_instances` / **`event_instance_attendees`**), **062** admin cards; **034–036**, **051–055** validity graph; **Checkpoint 9** narrative. |
+| **Columns dropped** (JSON overrides, shape booleans, `bookingMode`, `differential_role`, links moved off placement types) | §2.3 | **059–060** (instance + shape legacy drops); **061** (event schema, **`differential_role`**, segment ownership); align with **§2.3** table in **FEATURE_20**. |
+| **Columns added** (three-property on instances, placement_kind/anchor_edge, segment location/calendar fields) | §2.4 | **059–061** as above; **Checkpoint 9** rows **25–28**. |
+| **Explicit drift removals** (orchestrator ≠ composite; orchestrators don’t define validity; every block instance → parts) | §2.5 | Documented in **FEATURE_20**; DDL alignment via **059–060** + validity migrations; booking/admin behavior **Feature 20** phases **20.3–20.4** (code paths, not repeated here). |
+
+#### Migration implicit-default audit
+
+- Each **`20260432_*`** file in **Checkpoint 9** performs **named** DDL/data transforms (enum alters, renames, reparents, prunes, column add/drop) described in **its header** and idempotent guards — not “fill in meaning from Sequelize defaults.”
+- **Event routing** semantics after migrate are defined in **`### Baseline placement & event routing (session 20.5.2)`** and **`#### FEATURE_20 §9.6 mitigation (session 20.5.2)`**: **061** seeds **placement-type catalog** only; **`event_assignments`** and instance graphs are **operator/product** responsibility.
+- **No crosswalk migration** is documented as relying on **undocumented null semantics** or **silent ORM inserts** for full tenant routing graphs; gaps are **explicit** (e.g. **Addressed (session 20.5.2)** + **Fresh database** bullets).
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index 9624dfaa..8754e242 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-03T00:12:16.618Z",
+  "derivedAt": "2026-04-03T00:22:55.188Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.3-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.3-guide.md
index 697f5b56..fdc43969 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.3-guide.md
@@ -52,7 +52,7 @@ These sections contain session-specific content:
 
 ### Tasks
 
-- [ ] #### Task 20.5.3.1: [Task Name]
+- [x] #### Task 20.5.3.1: [Task Name]
 **Goal:** [Task goal]
 **Files:** 
 - [Files to work with]
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.3-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.3-log.md
index f4331ba0..274e0d01 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.5.3-log.md
@@ -1,2 +1,20 @@
 # Session 20.5.3: — Legacy assumption closure:** Complete **§0.2 / §2** legacy-to-target mapping in writing; verify **no migration step** depends on undocumented implicit defaults; final edit pass on **§8.5** acceptance checklist; prepare **phase handoff** for **20.6**.
 
+
+### Task 20.5.3.1: Task 20.5.3.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.5.3.2
+
+
+
+## Completed Tasks
+
+### Task 20.5.3.1: Task 20.5.3.1 ✅
+**Goal:** Task completed
+
+**Next Task:**
+- 20.5.3.2
+
+<!-- end excerpt session -->
\ No newline at end of file
```
<!-- /harness:anchor:commit-preview -->
