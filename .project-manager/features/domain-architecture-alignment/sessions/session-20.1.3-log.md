# Session 20.1.3: ** Event schema alignment -- migration: ADD `placement_kind`, `anchor_edge` to `event_shapes`, DROP `differential_role`, move `include_reschedule_link`/`include_cancel_link` to `event_instances`; ADD `parent_block_instance_id` + location fields to `event_instances`; rename `event_shape_attendees` -> `event_instance_attendees`; seed default placement types (§2.2); update Sequelize models + client types.


### Task 20.1.3.1: Task 20.1.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.3.2



## Completed Tasks

### Task 20.1.3.2: Task 20.1.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.3.3



### Task 20.1.3.1: Task 20.1.3.1 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.3.2

<!-- end excerpt session -->



### Task 20.1.3.2: Task 20.1.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 20.1.3.3


## Harness: commit preview (in-scope diff)

Paths (16): `.project-manager/WORKFLOW_FRICTION_LOG.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md`, `client/src/composables/admin/useShapesTab.ts`, `client/src/constants/entityFieldConstants.ts`, `client/src/types/entities.ts`, `client/src/utils/admin/differentialRoleMatrixRows.ts`, `client/src/utils/admin/selectFieldValueResolution.ts`, `client/src/utils/admin/selectHandlersNormalization.ts`, `client/src/utils/booking/minimizerEventShapes.ts`, `client/src/utils/booking/partFinalizer.ts`, `client/src/utils/eventAttendeeUtils.ts`, `client/src/utils/transformers/entityTransformers.ts`, `server/src/routes/internal/entities/entitySanitizers.ts`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.3.2-handoff.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.3.2-planning.md`

### `git diff --stat HEAD`

```text
.project-manager/WORKFLOW_FRICTION_LOG.md            | 20 ++++++++++++++++++++
 .../sessions/session-20.1.3-guide.md                 |  2 +-
 .../sessions/session-20.1.3-log.md                   | 15 +++++++++++++++
 client/src/composables/admin/useShapesTab.ts         |  1 -
 client/src/constants/entityFieldConstants.ts         |  2 --
 client/src/types/entities.ts                         |  6 ------
 client/src/utils/admin/differentialRoleMatrixRows.ts |  6 +++++-
 client/src/utils/admin/selectFieldValueResolution.ts |  4 ++--
 .../src/utils/admin/selectHandlersNormalization.ts   |  2 +-
 client/src/utils/booking/minimizerEventShapes.ts     |  6 +++++-
 client/src/utils/booking/partFinalizer.ts            |  4 +++-
 client/src/utils/eventAttendeeUtils.ts               |  4 +++-
 client/src/utils/transformers/entityTransformers.ts  | 11 ++---------
 .../src/routes/internal/entities/entitySanitizers.ts |  2 ++
 14 files changed, 59 insertions(+), 26 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/WORKFLOW_FRICTION_LOG.md b/.project-manager/WORKFLOW_FRICTION_LOG.md
index ca4aa219..cb21802d 100644
--- a/.project-manager/WORKFLOW_FRICTION_LOG.md
+++ b/.project-manager/WORKFLOW_FRICTION_LOG.md
@@ -2145,3 +2145,23 @@ Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application w
 TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often b
 
 …(truncated)
+
+### 2026-04-02 — 20.1.3.1 — task — end — git helper stderr during tier-end resume
+
+- **reasonCodeRaw:** harness_git_stderr_on_success_path
+- **reasonCodeNormalized:** harness_plugin_advisory
+- **isFailureReason:** false
+- **tier:** task
+- **action:** end
+- **identifier:** 20.1.3.1
+- **featureName:** domain-architecture-alignment
+- **stepPath:** —
+
+- **Symptom:** Resuming task-end with continuePastGapAnalysis logged git helper failures on stderr even though the run finished with task_complete.
+- **Context:** Captured lines from the same shell invocation as successful task-end (second pass after gap analysis):
+
+- [compareBranchToRemote-behind] Command failed: git merge-base --is-ancestor fde41bc5509649954d9a92162065e3adad595236 c6dda2f48f7d65b3eb7d3748e6a5f63d9264f571
+- [commitUncommitted-diff] Command failed: git diff --cached --quiet
+- [compareBranchToRemote-behind] Command failed: git merge-base --is-ancestor 05dc734c80e57261940dcbf7b8c69ee0ba9b96f6 c6dda2f48f7d65b3eb7d3748e6a5f63d9264f571
+- **Outcome / workaround:** Non-blocking: merge-base --is-ancestor exits non-zero when HEAD is not an ancestor of the compared ref (branch ahead/diverged); git diff --cached --quiet exits 1 when the index has staged changes.
+- **Suggestion:** When triaging harness output, distinguish stderr from git plumbing (expected exit codes) from real git_failed / commit_remaining failures.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md
index 8452f43c..4c7564e4 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md
@@ -63,7 +63,7 @@ These sections contain session-specific content:
 **Approach:** One coherent migration pass (or sequenced files) per `phase-20.1-guide.md` §Session 20.1.3; backfill `include_*` from shapes to instances before drop; document rule for mapping old attendee rows to `event_instance_id`.
 **Checkpoint:** Server/client typecheck for touched files; models load; migration files ready (run only on localhost DB per policy).
 
-- [ ] #### Task 20.1.3.2: Relationships, validation, and booking/admin consumers
+- [x] #### Task 20.1.3.2: Relationships, validation, and booking/admin consumers
 **Goal:** `attendeeAssignments` parent is **event instance**; client `backendName` and validation match; remove `differentialRole` usage from `partFinalizer`, `eventAttendeeUtils`, admin shapes tab; grep cleanup; `npm run start:dev` + client/server lint clean.
 **Files:**
 - `server/src/routes/internal/relationships/relationshipConstants.ts`, `relationshipHelpersValidation.ts`, related CRUD handlers
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md
index db5e62dc..dd883035 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md
@@ -11,6 +11,14 @@
 


## Test Status

**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (12): `.project-manager/features/domain-architecture-alignment/across-ladder.json`, `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.1-guide.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.1-handoff.md`, `.project-manager/features/domain-architecture-alignment/phases/phase-20.1-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.3.1-planning.md`, `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.3.2-planning.md`, `.project-manager/features/domain-architecture-alignment/planning-archive/session/20.1.3/`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-handoff.md`

### `git diff --stat HEAD`

```text
.../across-ladder.json                             |   4 +-
 ...eature-domain-architecture-alignment-handoff.md |   6 +-
 .../phases/phase-20.1-guide.md                     |   2 +-
 .../phases/phase-20.1-handoff.md                   |   6 +-
 .../phases/phase-20.1-log.md                       |   8 +
 .../sessions/session-20.1.3-guide.md               |   2 +
 .../sessions/session-20.1.3-log.md                 |   7 +-
 .../sessions/session-20.1.3-planning.md            | 321 ++++++++-------------
 .../sessions/task-20.1.3.1-planning.md             | 166 -----------
 .../sessions/task-20.1.3.2-planning.md             | 266 -----------------
 10 files changed, 142 insertions(+), 646 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/domain-architecture-alignment/across-ladder.json b/.project-manager/features/domain-architecture-alignment/across-ladder.json
index 3b55ad0d..acd5374f 100644
--- a/.project-manager/features/domain-architecture-alignment/across-ladder.json
+++ b/.project-manager/features/domain-architecture-alignment/across-ladder.json
@@ -1,8 +1,8 @@
 {
   "schemaVersion": 1,
   "feature": "domain-architecture-alignment",
-  "derivedAt": "2026-04-02T15:46:25.726Z",
-  "sourceTier": "session",
+  "derivedAt": "2026-04-02T16:33:03.396Z",
+  "sourceTier": "session_end",
   "phasesOnDisk": [
     "20.1",
     "20.2",
diff --git a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
index 7ff99b82..aab7803c 100644
--- a/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
+++ b/.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md
@@ -79,10 +79,10 @@
 
 _Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._
 
-- **Feature:** `domain-architecture-alignment` · **Source:** session_end · **Derived:** 2026-04-02T15:40:12.494Z
+- **Feature:** `domain-architecture-alignment` · **Source:** session_end · **Derived:** 2026-04-02T16:33:03.396Z
 - **Phases on disk (6):** 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
 - **Focus phase:** `20.1` · **Next phase across:** `20.2` → `/phase-start 20.2`
-- **Focus session:** `20.1.2` · **Session 2/3 in phase** · **Next session across:** `20.1.3` → `/session-start 20.1.3`
-- **Tasks in session (detected):** 2 · **Next task across:** `20.1.2.1` → `/task-start` / cascade
+- **Focus session:** `20.1.3` · **Session 3/3 in phase** · **Next session across:** _(then /phase-end)_
+- **Tasks in session (detected):** 2 · **Next task across:** `20.1.3.1` → `/task-start` / cascade
 - **Manifest:** `.project-manager/features/domain-architecture-alignment/across-ladder.json`
 <!-- harness-across-ladder:end -->
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-guide.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-guide.md
index 5722a121..de0e4da7 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-guide.md
@@ -127,7 +127,7 @@ Run `/session-start 20.1.1` to begin the first session. Each session covers one
 
 ---
 
-- [ ] ### Session 20.1.3: Event schema alignment
+- [x] ### Session 20.1.3: Event schema alignment
 
 **Goal:** Add placement columns to `event_shapes`, ownership and location fields to `event_instances`, move calendar toggles from shapes to instances, rename `event_shape_attendees` to `event_instance_attendees`, and seed default placement types (per plan §2.2, §2.3, §2.4).
 
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-handoff.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-handoff.md
index 0bba2123..615021f9 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-handoff.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-handoff.md
@@ -69,10 +69,10 @@ Continue with next step. [Fill in.]
 
 _Auto-updated from disk guides. Agents: prefer `across-ladder.json` for checks._
 
-- **Feature:** `domain-architecture-alignment` · **Source:** session_end · **Derived:** 2026-04-02T15:40:12.494Z
+- **Feature:** `domain-architecture-alignment` · **Source:** session_end · **Derived:** 2026-04-02T16:33:03.396Z
 - **Phases on disk (6):** 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
 - **Focus phase:** `20.1` · **Next phase across:** `20.2` → `/phase-start 20.2`
-- **Focus session:** `20.1.2` · **Session 2/3 in phase** · **Next session across:** `20.1.3` → `/session-start 20.1.3`
-- **Tasks in session (detected):** 2 · **Next task across:** `20.1.2.1` → `/task-start` / cascade
+- **Focus session:** `20.1.3` · **Session 3/3 in phase** · **Next session across:** _(then /phase-end)_
+- **Tasks in session (detected):** 2 · **Next task across:** `20.1.3.1` → `/task-start` / cascade
 - **Manifest:** `.project-manager/features/domain-architecture-alignment/across-ladder.json`
 <!-- harness-across-ladder:end -->
diff --git a/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-log.md b/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-log.md
index 91d167c0..45c3c5dd 100644
--- a/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-log.md
+++ b/.project-manager/features/domain-architecture-alignment/phases/phase-20.1-log.md
@@ -17,6 +17,14 @@
 
 ## Completed Sessions
 
+### Session 20.1.3: Event schema alignment ✅
+**Completed:** 2026-04-02
+**Tasks Completed:** All tasks completed
+**Key Accomplishments:**
+- Completed ** Event schema alignment (placement, segment ownership, instance attendees)
+
+
+
 ### Session 20.1.2: Block instance three-property alignment and legacy cleanup ✅
 **Completed:** 2026-04-02
 **Tasks Completed:** All tasks completed
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md
index 4c7564e4..fe2a567e 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md
@@ -421,3 +421,5 @@ Break each session into focused tasks:
 ## Notes
 
 [Session-specific notes, patterns, architectural decisions]
+
+<!-- end excerpt session -->
\ No newline at end of file
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md
index e2928a5e..695074fa 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md
@@ -110,4 +110,9 @@ index db5e62dc..dd883035 100644
 --- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md
 +++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-log.md
 @@ -11,6 +11,14 @@
- 
\ No newline at end of file
+ 
+
+
+## Test Status
+
+**Note:** No test strategy or justification documented for this session. Consider adding test requirements or documenting why tests are deferred.
diff --git a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-planning.md b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-planning.md
index 8b9474a2..07552b6b 100644
--- a/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-planning.md
+++ b/.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-planning.md
@@ -1,232 +1,145 @@
-# Plan: session 20.1.3 — Event schema alignment (placement, segment ownership, instance attendees)
-
-## Contract
-- **Tier:** session | **ID:** 20.1.3
-- **Scope:** Align `event_shapes`, `event_instances`, and attendee storage with Feature 20 §2.2–§2.4: placement columns on shapes; segment ownership + location + per-segment calendar toggles on instances; rename `event_shape_attendees` → `event_instance_attendees`; default placement seeds; Sequelize + client types + direct consumers so app builds and lints.
-- **Governance (harness snapshot):**
-  - Governance Context (Session)
-  - Function Governance
-  - Clean — no violations detected.
-  - Component Governance
-  - Clean — no violations detected.
-  - 3. Script logic can move to composable/util? →
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
