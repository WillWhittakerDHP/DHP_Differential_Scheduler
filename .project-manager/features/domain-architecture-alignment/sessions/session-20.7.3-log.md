# Session 20.7.3: Close-out backlog mapping


### Task 20.7.3.1: Task 20.7.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.3.2



## Completed Tasks

### Task 20.7.3.1: Task 20.7.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.7.3.2

<!-- end excerpt session -->

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (11): `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.10-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.11-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.12-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.13-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.8-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.9-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.3.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.3.1-planning.md`

### `git diff --stat HEAD`

```text
.../domain-architecture-alignment/across-ladder.json   |  2 +-
 .../phases/phase-20.10-guide.md                        | 11 +++++++++++
 .../phases/phase-20.11-guide.md                        |  7 +++++++
 .../phases/phase-20.12-guide.md                        |  7 +++++++
 .../phases/phase-20.13-guide.md                        |  7 +++++++
 .../phases/phase-20.8-guide.md                         |  8 ++++++++
 .../phases/phase-20.9-guide.md                         |  8 ++++++++
 .../sessions/session-20.7.3-guide.md                   |  2 +-
 .../sessions/session-20.7.3-log.md                     | 18 ++++++++++++++++++
 9 files changed, 68 insertions(+), 2 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index a4b020bc..6093bd34 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,7 +1,7 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-04T18:31:17.994Z",
+  "derivedAt": "2026-04-04T18:33:00.907Z",
   "sourceTier": "session",
   "phasesOnDisk": [
     "20.1",
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.10-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.10-guide.md
index 95997b0e..b6b1ebcd 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.10-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.10-guide.md
@@ -29,6 +29,17 @@
 - [ ] Placement/layout derives from event instances and placement types
 - [ ] Zero-out ordering is verified in the actual live path
 
+### Preflight follow-ups (Session 20.7.2)
+
+Source: [`preflight-evidence-20.7.2.md`](../preflight-evidence-20.7.2.md) §§1–2; authority: [`.project-manager/ARCHITECTURE.md`](../../../ARCHITECTURE.md) §10–§14.
+
+- **§14.3d (unknown)** — PartFinalizer / slot pipeline key **`eventAssignmentsByPartShape`** and **`groupPartsByShape`** by **part shape name** — reconcile with **lineage** bucket rules (§10.2 / §14.3d) when multiple work items could collide.
+- **§14.3g (unknown)** — Per-block-instance provenance / undo / reconfiguration — operational verification on live path.
+- **§10.3 step 5 (unknown)** — **Zero-out last** vs current **`filterZeroedParts` / `filterZeroedBlocks`** exclusion before slot-shape — prove ordering matches **ARCHITECTURE** §10.3.
+- **§14.4a–c (unknown)** — New event placement types via data rows without mandatory engine change per row.
+- **§14.5 (unknown)** — **`property_details`** as appointment data vs time-configuration rates — full boundary paragraph tracks **preflight** §4 (session **20.7.3**).
+- **§1.4 (risk)** — If the live pipeline requires **part-scoped** `event_assignments` edges, align **`appointmentSlotBuilder`** consumption with API/global graph.
+
 ---
 
 ## Sessions breakdown
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.11-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.11-guide.md
index 440e25a6..2f240357 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.11-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.11-guide.md
@@ -21,6 +21,13 @@
 - [ ] Conversion and migration crosswalks reflect the final execution reality
 - [ ] Metadata-retirement ordering remains traceable before final cleanup/closeout
 
+### Preflight follow-ups (Session 20.7.2)
+
+Source: [`preflight-evidence-20.7.2.md`](../preflight-evidence-20.7.2.md) §3 (pending); [`.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`](../../../analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) ordering.
+
+- **Migration execution policy** — Restate workspace rule: run DDL/migrations only when **`DB_HOST`** is **`localhost`** / **`127.0.0.1`** (shared DB consumers do not execute migrations). Tie **Feature 20** migration sequence to this phase’s baseline and conversion crosswalks.
+- **Routing reality** — After **20.8** API/schema work, update migration/seed narratives so **`event_assignments`** and related tables match the enforced contract.
+
 ---
 
 ## Sessions breakdown
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.12-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.12-guide.md
index 3f5b1c0b..0db9ed1b 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.12-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.12-guide.md
@@ -21,6 +21,13 @@
 - [ ] Residual stale vocabulary no longer teaches the wrong model
 - [ ] Cleanup follows proven replacement and narrative support
 
+### Preflight follow-ups (Session 20.7.2)
+
+Source: [`preflight-evidence-20.7.2.md`](../preflight-evidence-20.7.2.md) §1–§2; [`.project-manager/ARCHITECTURE.md`](../../../ARCHITECTURE.md) §8.
+
+- Remove or narrow **transitional** layers that still teach legacy domain labels (`property` / `coupon` / `option`) where **§8** target names are **time** / **price** / **event**.
+- After **20.8–20.10** land, delete dead paths that only existed for pre-preflight ambiguity (e.g. duplicate **event assignment** UX) once replacement is verified.
+
 ---
 
 ## Sessions breakdown
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.13-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.13-guide.md
index 7d3653bd..4b4bce83 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.13-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.13-guide.md
@@ -21,6 +21,13 @@
 - [ ] Parallel planning surfaces no longer compete with the active sequencing surface
 - [ ] Feature-level and project-level closeout text support a clean **`/feature-end`**
 
+### Preflight follow-ups (Session 20.7.2)
+
+Source: [`preflight-evidence-20.7.2.md`](../preflight-evidence-20.7.2.md) §2.1; [`.project-manager/ARCHITECTURE.md`](../../../ARCHITECTURE.md) §14.
+
+- Reconcile **§14** preflight **unknown** rows with **post-execution** reality after phases **20.8–20.12** (lineage, zero-out, **`property_details`**, admin semantics).
+- Archive or supersede **`preflight-evidence-20.7.2.md`** as a historical checkpoint once **`ARCHITECTURE.md`** and phase guides reflect the same truth.
+
 ---
 
 ## Sessions breakdown
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.8-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.8-guide.md
index a0f24456..922bcb75 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.8-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.8-guide.md
@@ -43,6 +43,14 @@ This phase executes the residual work from master-plan **Phases 1–2** that rem
 - [ ] **Routing ownership** — `event_assignments`, `parent_block_instance_id`, and attendee ownership are enforced consistently.
 - [ ] **Validation tightening** — placement and legacy-alias validators teach the locked model rather than the transitional one.
 
+### Preflight follow-ups (Session 20.7.2)
+
+Source: [`preflight-evidence-20.7.2.md`](../preflight-evidence-20.7.2.md) §2; authority: [`.project-manager/ARCHITECTURE.md`](../../../ARCHITECTURE.md) §14.
+
+- **§14.1 (unknown)** — Audit domain separation on part instances: each block type writes only its own concern; no cross-domain overwrites (full write-path review).
+- **§14.3 / §14.3a–c (unknown)** — Enforce per-block `part_assignments` boundaries, orchestrator-only **Base**, and PerUnit on atomics across admin mutations and API contracts.
+- **§1.4 (risk)** — Align **`event_assignments`** API shape with **`RELATIONSHIP_KEYS.eventAssignments`** (`blockInstance` → `eventInstance` default) vs optional **`parentKind`** on fetch (`fetchToGlobalTransformer`); booking currently filters **`parent.entityKey === 'blockInstance'`** — resolve drift if the API emits part-scoped edges only.
+
 ---
 
 ## Sessions breakdown
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.9-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.9-guide.md
index 996205a8..565df1eb 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.9-guide.md
+++ b/.project-manager/features/domain-architecture
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
