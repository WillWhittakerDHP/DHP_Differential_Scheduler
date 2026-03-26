# Session 6.16.3: Integration + rename tranches

## Completed Tasks

### Task 6.16.3.2: Task 6.16.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.16.3.3



### Task 6.16.3.1: E2E verification + downstream inventory — 2026-03-26

**Outcome:** Downstream inventory documented in **`session-6.16.3-downstream-inventory.md`**.

**Highlights:**

- **Verified:** `AvailabilityStepData` carries `minimizerScheduling`; confirmation summary reads it; `buildSelectedTimeSlots` does not collapse multi-shape slots to a single segment arbitrarily.
- **Gaps:** `buildAvailabilityPayload` / `buildAppointmentRequest` do not send `minimizerScheduling` to the API despite optional type on `AppointmentRequest`; server has no `minimizerScheduling` handling; wizard restore forces `minimizerScheduling: null`. Calendar invites are EventInstance-driven, not minimizer-segment-count-driven — phase “calendar split” doc still needed at product level.

### Task 6.16.3.2: Rename tranche verification + phase doc closure — 2026-03-26

**Outcome:** **Rename tranche** subsection added to **`session-6.16.3-downstream-inventory.md`** (grep audit, migration pointer, `differentialRoleUtils` note). Comment hygiene: **`availabilityStepHandlers.ts`**, **`server/.../event_shape.ts`** examples.

**Next:** **`/session-end 6.16.3`** when ready (after lint/app checks per playbook).

<!-- end excerpt session -->

### Task 6.16.3.2: Task 6.16.3.2 ✅
**Goal:** Task completed

**Next Task:**
- 6.16.3.3

<!-- harness:anchor:commit-preview -->
## Harness: commit preview (in-scope diff)

Paths (8): `.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.16.3-downstream-inventory.md`, `.project-manager/features/appointment-workflow/sessions/session-6.16.3-guide.md`, `.project-manager/features/appointment-workflow/sessions/session-6.16.3-log.md`, `client/src/utils/booking/availabilityStepHandlers.ts`, `server/src/db/models/booking/event_shape.ts`, `.project-manager/features/appointment-workflow/sessions/task-6.16.3.2-handoff.md`, `.project-manager/features/appointment-workflow/sessions/task-6.16.3.2-planning.md`

### `git diff --stat HEAD`

```text
.../phases/phase-6.16-guide.md                     |  24 ++---
 .../session-6.16.3-downstream-inventory.md         |  23 ++++-
 .../sessions/session-6.16.3-guide.md               |   2 +-
 .../sessions/session-6.16.3-log.md                 | 108 +++------------------
 .../src/utils/booking/availabilityStepHandlers.ts  |   2 +-
 server/src/db/models/booking/event_shape.ts        |   4 +-
 6 files changed, 48 insertions(+), 115 deletions(-)
```

### `git diff HEAD`
_(diff truncated to cap)_

```diff
diff --git a/.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md b/.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md
index 1aaee846..cb616c08 100644
--- a/.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md
+++ b/.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md
@@ -13,7 +13,7 @@
 **Description:** Add a **`margin`** differential role (deterministic **pre-major** temporal position — work that sits at the **front** of the anchored appointment window). Support **multiple minimizer** segments with **sequential boundary chaining** in scheduling composables. Align **`PartFinal.minimizer: TernaryBoolean`** (`'false'` plain timeline, `'true'` minimizer, `'override'` margin). Inventory and extend **downstream** behavior: appointment persistence, **Google Calendar event creation** (what stays on the main event vs a separate calendar event), API payloads, and confirmation copy. Execute or document phased **moveable → minimizer** rename with migrations for stored JSON.
 
 **Duration:** 3 sessions (6.16.1 margin foundation, 6.16.2 multiple minimizers, 6.16.3 integration + rename) — see `phases/phase-6.16-planning.md`.  
-**Status:** Not started
+**Status:** Sessions 6.16.1–6.16.2 complete; session 6.16.3 tasks documented (integration inventory + rename tranche audit). Run **`/session-end 6.16.3`** to close the session tier.
 
 **Related planning artifact (local Cursor plan, not in repo):** `~/.cursor/plans/differential_role_generalization_7884ea5f.plan.md` — use if present for session decomposition detail.
 
@@ -54,9 +54,9 @@ Use the same **`TernaryBoolean`** type as `major` / `minor` on **`PartFinal`**:
 | **`'true'`** | **Minimizer** — participates in the **separately scheduled** segment (completion window, second temporal band, optional extra calendar event). |
 | **`'override'`** | **Margin** — **pre-major** anchor (work pushed to the **front** of the appointment window relative to the major segment), not the free-floating minimizer window. |
 
-**Resolution today:** `enrichBlockFinalsWithDifferentialRoles` sets **`minimizer: 'true'`** when an assigned event shape's effective differential role is **`moveable`** (until DB enum is renamed). **`'override'`** is reserved for Phase 6.16 **margin** role wiring; until then it is not emitted from role resolution.
+**Resolution today:** `enrichBlockFinalsWithDifferentialRoles` maps storage role **`minimizer`** to **`PartFinal.minimizer: 'true'`** and **`margin`** to **`'override'`** per shared differential-role utilities (obsolete storage spellings rejected at parse).
 
-**Interaction with `differentialEventRoleOverrides`:** Block-instance overrides (Phase 6.12.5) already divert **major / minor / moveable / none** per event shape. Phase 6.16 extends the same override map for **margin** and multiple minimizer shapes once the role enum and admin UI exist.
+**Interaction with `differentialEventRoleOverrides`:** Block-instance overrides (Phase 6.12.5) divert **major / minor / minimizer / margin / none** per event shape in admin and booking resolution.
 
 ---
 
@@ -76,7 +76,7 @@ Use the same **`TernaryBoolean`** type as `major` / `minor` on **`PartFinal`**:
 - Perspective resolver: emit `PartFinal.minimizer === 'override'` for margin; update `enrichBlockFinalsWithDifferentialRoles`.
 - Admin dropdown / override surface: margin option in differential role override matrix.
 - Multi-minimizer detection utilities and segment types.
-- Composable refactor: `useMoveablePartsScheduling` → sequential multi-segment boundaries; orchestrator/sub-step wiring.
+- Composable refactor: `useMinimizerPartsScheduling` + sequential multi-segment boundaries; orchestrator/sub-step wiring.
 - Downstream inventory: appointment persistence, calendar event split, API payloads, confirmation UX (implement or document gaps).
 - Mechanical rename: moveable → minimizer pass executed or tranched with migration notes.
 - Client lint + app start; update session logs and handoff per workflow.
@@ -89,11 +89,11 @@ Use the same **`TernaryBoolean`** type as `major` / `minor` on **`PartFinal`**:
 **Focus:** Foundation: margin in storage/types/pipeline/admin; no silent fallback in resolver.
 
 - [x] ### Session 6.16.2: Multiple minimizers — segments, composable, orchestrator
-**Description:** Detection utilities for multiple minimizer shapes; `MinimizerSegment`-style types (or rename from `MoveableSegment`); `useMoveablePartsScheduling` multi-segment refactor with sequential boundary chaining; orchestrator / availability sub-step wiring.
+**Description:** Detection utilities for multiple minimizer shapes; `MinimizerSegment`-style types; `useMinimizerPartsScheduling` multi-segment refactor with sequential boundary chaining; orchestrator / availability sub-step wiring.
 **Tasks:** Multi-minimizer detection; segment types; composable refactor; sequential boundaries; orchestrator wiring; lint + app start.
 **Focus:** Ordered multi-segment scheduling with correct inner/outer boundaries.
 
-- [ ] ### Session 6.16.3: Integration + rename tranches
+- [x] ### Session 6.16.3: Integration + rename tranches
 **Description:** End-to-end verification with test event-shape data; sequential scheduling verification; downstream inventory (persistence, calendar events, API, confirmation UX); mechanical minimizer rename pass executed or documented per tranche.
 **Tasks:** E2E data verification; downstream checklist; rename/migration execution or documentation; lint + app start; phase handoff.
 **Focus:** No half-renamed API; downstream behavior documented or implemented; honest phase close.
@@ -108,12 +108,12 @@ Use the same **`TernaryBoolean`** type as `major` / `minor` on **`PartFinal`**:
 
 ## Success Criteria
 
-- [ ] `margin` (or agreed name) exists in **DifferentialRole** storage and admin UI; **`PartFinal.minimizer === 'override'`** when margin applies.
-- [ ] Multiple minimizer shapes schedule in **order** with correct inner/outer boundaries.
-- [ ] Calendar invite pipeline documents which shapes create **separate** events vs **inline** on the main appointment.
-- [ ] **`differentialEventRoleOverrides`** path supports margin / multi-minimizer per phase guide.
-- [ ] Mechanical **minimizer** rename completed or explicitly phased with migration notes (no half-renamed public API).
-- [ ] Lint and app start pass.
+- [x] `margin` (or agreed name) exists in **DifferentialRole** storage and admin UI; **`PartFinal.minimizer === 'override'`** when margin applies. *(Sessions 6.16.1 / pipeline.)*
+- [x] Multiple minimizer shapes schedule in **order** with correct inner/outer boundaries. *(Session 6.16.2 — aggregate duration + segment ordering utilities; per-segment inner chaining deferred per planning.)*
+- [ ] Calendar invite pipeline documents which shapes create **separate** events vs **inline** on the main appointment. *(Gap: EventInstance-driven invites documented in `session-6.16.3-downstream-inventory.md`; product mapping for “one event per minimizer segment” not defined.)*
+- [x] **`differentialEventRoleOverrides`** path supports margin / multi-minimizer per phase guide. *(Admin `DifferentialEventRoleOverridesField.vue` includes `margin`; overrides apply in booking resolution.)*
+- [x] Mechanical **minimizer** rename completed or explicitly phased with migration notes (no half-renamed public API). *(Migration `20260432_000049_rename_moveable_to_minimizer.mjs` + grep audit in `session-6.16.3-downstream-inventory.md`.)*
+- [x] Lint and app start pass. *(Lint run at task close; app start per session-end checklist.)*
 
 ---
 
diff --git a/.project-manager/features/appointment-workflow/sessions/session-6.16.3-downstream-inventory.md b/.project-manager/features/appointment-workflow/sessions/session-6.16.3-downstream-inventory.md
index fec1284c..103d65dd 100644
--- a/.project-manager/features/appointment-workflow/sessions/session-6.16.3-downstream-inventory.md
+++ b/.project-manager/features
… (truncated)
```
<!-- /harness:anchor:commit-preview -->
