# Session 20.7.2: Preflight evidence package


### Task 20.7.2.1: Task 20.7.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.2.2



## Completed Tasks

### Task 20.7.2.2: Task 20.7.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.2.3



### Task 20.7.2.1: Task 20.7.2.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.2.2

<!-- end excerpt session -->



### Task 20.7.2.2: Task 20.7.2.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.2.3

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (5): `.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.2-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.2-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.2.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.2.2-planning.md`

### `git diff --stat HEAD`

```text
.../preflight-evidence-20.7.2.md                   | 35 ++++++++++++++++++++--
 .../sessions/session-20.7.2-guide.md               |  2 +-
 .../sessions/session-20.7.2-log.md                 | 15 ++++++++++
 3 files changed, 48 insertions(+), 4 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md b/.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md
index ed728ebf..cfc0eee0 100644
--- a/.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md
+++ b/.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md
@@ -9,7 +9,7 @@
 - [architecture-alignment-closeout-master-plan.md](./architecture-alignment-closeout-master-plan.md) — close-out sequencing (phases 20.7–20.13).
 - [.project-manager/ARCHITECTURE.md](../ARCHITECTURE.md) — **§10** (PartFinalizer, `event_assignments`), **§11** (events / placement).
 
-This file is the **single primary surface** for preflight notes produced in session **20.7.2**. Sections **2–4** are completed in tasks **20.7.2.2** and **20.7.2.3** (stubs below).
+This file is the **single primary surface** for preflight notes produced in session **20.7.2**. **§2** is complete (task **20.7.2.2**); **§3–§4** remain for task **20.7.2.3**.
 
 ---
 
@@ -46,7 +46,7 @@ Per **ARCHITECTURE.md** §10.1 and §14.3e, **events are routed relationally** v
 |-------|------------|--------|
 | **Confirm live meaning of `event_assignments` where code appears ambiguous** (phase guide Session 20.7.2) | **Pass with documented nuance** | **Default** relationship parent is **`blockInstance`** → **`eventInstance`** (`relationships.ts`). **`fetchToGlobalTransformer.transformApiRelationship`** allows **`parentKind` override** when the API sends `raw.parentKind` for **`eventAssignments`**, so global graphs may include **non–block-instance** parents while the booking rebuild in **`appointmentSlotBuilder`** only consumes relationships whose **`parent.entityKey === 'blockInstance'`**. If the API emits only part-scoped edges, **booking `eventAssignmentsByPartShape` may be empty** until shapes align — **risk** for drift between admin editing surface and booking consumer. **Owning follow-up:** extension phases **20.8–20.13** as needed; booking alignment emphasis **20.10** if product requires part-scoped edges in the live pipeline. |
 | **Two admin surfaces** (`blockInstance` vs `partInstance` `eventAssignments`) | **Risk (coordination)** | Both are intentional in code-first metadata; they must stay consistent with **migrations** and the **global relationship** graph the API returns. Single source of truth is **server + global fetch**, not either editor alone. |
-| **Map keyed by part shape name** in `eventAssignmentsByPartShape` vs **§10 / §14** lineage rules | **Risk (model collision)** | PartFinalizer **slot-shape** aggregation indexes assigned events by **`part.partShape`** string. **ARCHITECTURE.md** §10.2 / §14.3d warns against resolving **only** by `part_shape` when multiple work items could collide; the watchpoint does **not** assert that collision case is fully handled in **`appointmentSlotBuilder`** — **unknown / deferred** to **20.7.2.2** invariant audit. |
+| **Map keyed by part shape name** in `eventAssignmentsByPartShape` vs **§10 / §14** lineage rules | **Risk (model collision)** | PartFinalizer **slot-shape** aggregation indexes assigned events by **`part.partShape`** string. **ARCHITECTURE.md** §10.2 / §14.3d warns against resolving **only** by `part_shape` when multiple work items could collide; see **§2** table row **§14.3d**. |
 
 ### 1.5 Next (remaining preflight sections)
 
@@ -57,7 +57,36 @@ Per **ARCHITECTURE.md** §10.1 and §14.3e, **events are routed relationally** v
 
 ## 2. Invariant audit (ARCHITECTURE.md §14-style)
 
-*To be completed in task **20.7.2.2**.*
+**Authority:** [.project-manager/ARCHITECTURE.md](../ARCHITECTURE.md) **§14** — *“If any assertion below is violated, the architecture has drifted.”*
+
+**Method:** Each row states **pass**, **fail**, or **unknown** against current code/docs as of this preflight. **unknown** means the audit did not trace or prove the invariant end-to-end. **Owning phase** applies to **fail** and **unknown** only (pass → **—**).
+
+**See also:** **§1** for `event_assignments` / `parentKind` / dual admin surfaces.
+
+**Extension phase guides (ownership targets):** [phase-20.8-guide.md](./phases/phase-20.8-guide.md) (schema/API), [phase-20.9-guide.md](./phases/phase-20.9-guide.md) (admin), [phase-20.10-guide.md](./phases/phase-20.10-guide.md) (booking), [phase-20.11-guide.md](./phases/phase-20.11-guide.md) (migrations), [phase-20.12-guide.md](./phases/phase-20.12-guide.md) (cleanup), [phase-20.13-guide.md](./phases/phase-20.13-guide.md) (truth docs).
+
+| Invariant (§14 ref) | Status | Evidence (paths / notes) | Owning phase | Guide |
+|---------------------|--------|---------------------------|--------------|--------|
+| **§14.1** Domain separation — block types write only their concern; domains compose | **unknown** | No exhaustive audit of every write path to `part_instances` / cross-domain overwrites in this pass. | **20.8** | [phase-20.8-guide.md](./phases/phase-20.8-guide.md) |
+| **§14.2** Three booleans on all block instances: `composite`, `orchestrator`, `wizardVisible` | **pass** | `server/src/db/models/booking/block_instance.ts` declares **composite**, **orchestrator**, **wizardVisible**; **wizardVisible** / **orchestrator** on `block_instance_version.ts`. | — | — |
+| **§14.2a–c** Composite / orchestrator / wizardVisible semantics | **unknown** | Semantics match **ARCHITECTURE** §9 in intent; not proven against all cascade/wizard list code paths here. | **20.9** | [phase-20.9-guide.md](./phases/phase-20.9-guide.md) |
+| **§14.3** Per-block part sets via `part_assignments`; no cross-writes | **unknown** | Expected from Sequelize models and transformers; not proven with a full cross-write audit. | **20.8** | [phase-20.8-guide.md](./phases/phase-20.8-guide.md) |
+| **§14.3a–c** Base only on orchestrator; atomics PerUnit; atomic base rules | **unknown** | Resolution tiers described in **§10.1**; enforcement across all admin mutations not traced in this pass. | **20.8** | [phase-20.8-guide.md](./phases/phase-20.8-guide.md) |
+| **§14.3d** Lineage — PartFinalizer must not use `part_shape` alone when collisions possible | **unknown** | `client/src/utils/booking/partFinalizer.ts` **`groupPartsByShape`** / **`partShapeKey`** group booking parts by **part shape name**; **`appointmentSlotBuilder`** / **`partFinalizerSlotShapeHelpers`** key **`eventAssignmentsByPartShape`** by **part shape name**. No **`lineage`** bucket field found under `client/src/utils/booking/*.ts` (string search). Aligns with **§1.4** risk. | **20.10** | [phase-20.10-guide.md](./phases/phase-20.10-guide.md) |
+| **§14.3e** Event assignments relational (`event_assignments`); override per part else baseline | **pass** (nuance) | Relational model: `client/src/constants/relationships.ts` (**`event_assignments`**); booking consumes **`globalData.relationships.eventAssignments`**. **Nuance:** API **`parentKind` override** (`client/src/utils/transformers/fetchToGlobalTransformer.ts`) vs booking filter on **`blockInstance`** parents — see **§1.4**. “Override vs baseline” for **resolvedEvent** not fully traced in one function in this pass. | — | — |
+| **§14.3f** PartFinalizer client-side aggregation; server persists without recomputing same resolution | **pass** | `server/src/routes/internal/appointments/appointmentHelpers.ts` module doc: persistence-only, **does not re-run PartFinalizer** or verify resolved totals. | — | — |
+| **§14.3g** Per-block-instance provenance / undo / reconfiguration | **unknown** | Consistent with per-block part rows in models; operational “undo” not audited. | **20.10** | [phase-20.10-guide.md](./phases/phase-20.10-guide.md) |
+| **§10.3 step 5** Zero-out **after** floor; zero-out wins for rollups | **unknown** (partial) | **Excluded from rollups:** `filterZeroedParts` / **`filterZeroedBlocks`** (`client/src/utils/booking/partFinalizer.ts`, `blockFinalizer.ts`) remove zeroed parts before **`buildAppointmentShape`** slot p
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
