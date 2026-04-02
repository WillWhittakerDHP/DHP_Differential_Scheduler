# Plan: session 20.4.1 — Pipeline audit + safe dead-code (booking)

## Contract
- **Tier:** session | **ID:** 20.4.1
- **Scope:** Map the client booking pipeline (`globalToBooking` → `buildAppointmentShape` / PartFinalizer) against FEATURE_20 **§4.1–4.2**; inventory **`DifferentialRole`**, **`enrichBlockFinalsWithDifferentialRoles`**, **`PartFinal.major|minor|minimizer`**, and override maps; apply only **confirmed** dead-code cleanup (no behavioral change).
- **Governance:** Booking + architecture docs; thin edits; explicit return types on touched exports; logger in any new catch paths (N/A if no try/catch added).

## Work Profile
- **Execution intent:** plan → tasks
- **Gate profile:** standard
- **Downstream:** Tasks **20.4.1.1** then **20.4.1.2**; later sessions **20.4.2+** own role-removal refactors.

## Where we left off
Phase **20.4** accepted; **`/accepted-plan`** completed for the phase. First session is **read-only mapping** plus **minimal** deletion/inline of dead plumbing.

## Story

**This session delivers** a **verified map** of the live booking pipeline vs FEATURE_20 **§4.2** and a **grep-backed consumer list** for differential-role and **PartFinal** layout fields, **so that** sessions **20.4.2–20.4.4** can remove or rewrite enrichment without guesswork.

**Estimated size:** M (audit + small safe edits)

---

## Architecture pointers (read with code — not a substitute for recon)

- **FEATURE_20** §4.1 (current chain), §4.2 (target numbered steps), §4.3 (removals), §4.4 (ordering).
- **ARCHITECTURE.md** §10 (PartFinalizer client boundary), §8–9 (block / instance model).
- Full text: `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`, `.project-manager/ARCHITECTURE.md`.

## Codebase recon

- **Paths reviewed:**
  - **Global → booking:** `client/src/utils/transformers/globalToBookingTransformer.ts` (`transformGlobalToBooking`), `globalToBookingTransformerBlocks.ts`, `globalToBookingPartInstanceTransform.ts`
  - **Appointment shape / slots:** `client/src/utils/booking/appointmentSlotBuilder.ts` (`buildAppointmentShape`, `applyShapeToTime`), `appointmentTimeCalculations.ts`
  - **Block/part finals:** `client/src/utils/booking/blockFinalizer.ts`, `BlockFinal.ts`, `partFinalizer.ts` (`createPartFinals`, `filterZeroedParts`, `enrichBlockFinalsWithDifferentialRoles`, `mergeBlockDifferentialRoleOverrides`), `PartFinal.ts`, `client/src/types/booking/partFinal.ts`
  - **Slot math:** `partFinalizerSlotShape.ts` (`calculateSlotShape`), `partFinalizerSlotShapeHelpers.ts` (`accumulateRawDurationsFromBlockFinals`, `computeDifferentialOffsetsFromMaps`, role-based major/minor pick via `getEventShapeByRoleWithOverrides`)
  - **Perspective / minimizer (downstream):** `perspectiveResolver.ts`, `minimizerEventShapes.ts`, `client/src/composables/booking/useAppointmentShape.ts` (calls `buildAppointmentShape`)
  - **Shared role / placement:** `shared/utils/eventPlacementUtils.ts` (`eventShapeDifferentialRoleFromPlacementFields`), `shared/utils/differentialRoleUtils.ts`, `shared/types/differentialRole.ts`
  - **Wizard models:** `client/src/types/appointmentModels.ts` (`differentialEventRoleOverrides`, perspective kinds)
  - **Admin (out of execute scope but referenced):** `client/src/utils/admin/differentialRoleMatrixRows.ts`, `DifferentialEventRoleOverridesField.vue`
- **Patterns / call sites:**
  - **`buildAppointmentShape`** runs `createBlockFinals` → `filterZeroedBlocks` → `buildEventAssignmentsByPartShape` (when event data provided) → **`enrichBlockFinalsWithDifferentialRoles`** (placement → `DifferentialRole` → **`PartFinal.major|minor|minimizer`**) → **`mergeBlockDifferentialRoleOverrides`** → **`calculateSlotShape`**. Slot duration rollup uses **`eventAssignmentsByPartShape` × `baseTime` per part shape**, not the ternary flags directly; **differential offsets** still resolve **major/minor event shapes** via **`getEventShapeByRoleWithOverrides`** and an override map (today always `{}` from merge).
  - **`mergeBlockDifferentialRoleOverrides`** is implemented as **`return {}`** with a comment that block-level overrides were removed — **dead by design**; only caller is `appointmentSlotBuilder.ts`.
  - **`enrichBlockFinalsWithDifferentialRoles`** is only called from **`buildAppointmentShape`**; it folds **event instance → event shape → placement → `effectiveDifferentialRole(..., null)`** into part-level ternaries.
- **Gaps / unknowns:** Whether any **runtime** path still supplies non-empty **`differentialEventRoleOverrides`** on **`AppointmentShape`** from outside `buildAppointmentShape` (search at task time). Minimizer / perspective chains to be fully traced in **20.4.1.1** deliverable table.

## Analysis

- **Why now:** Phase **20.4** depends on an accurate picture before **§4.3** deletes (`PartFinal` role fields, enrichment). Skipping inventory risks breaking slot or perspective ordering.
- **Boundaries:** **Client booking** and **shared** read-only for this session except **confirmed** dead-code (e.g. remove **`mergeBlockDifferentialRoleOverrides`** if inlined). **No** server PartFinalizer. **Admin** matrix files: reference only unless a dead-code delete is zero-risk.
- **Patterns:** Keep **lineage** and **zero-out** order documented; do not reorder pipeline in this session.
- **Risks:** Mistaking “empty override map” for unused **`differentialEventRoleOverrides`** field — type and **`AppointmentShape`** consumers must stay consistent until **20.4.2+**.
- **Alternatives:** Big-bang delete of enrichment in **20.4.1** — **rejected** (phase plan defers to **20.4.2**).

## Goal

Produce an **authoritative pipeline map** (current vs §4.2) and a **consumer inventory** for differential-role and **PartFinal** layout fields; complete **only** safe dead-code cleanup that **cannot** change behavior (e.g. remove no-op **`mergeBlockDifferentialRoleOverrides`** after inlining `{}`).

## Files

- **Canonical docs:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §4.1–4.4, `.project-manager/features/domain-architecture-alignment/phases/phase-20.4-planning.md`
- **PM:** `sessions/session-20.4.1-planning.md` (this file), `sessions/session-20.4.1-guide.md`, `sessions/session-20.4.1-log.md`
- **Implementation (audit + optional cleanup):** paths listed under **Codebase recon**

## Approach

1. **Task 20.4.1.1:** Build a **two-column table** (current function / module → §4.2 step index or “downstream / gap”) in the **session log** or a short subsection of **`DOMAIN_REWRITE_WORKLOG.md`** (team preference: default **session log** § “Pipeline map”).
2. **Task 20.4.1.1:** **Grep table** — list each file that imports **`DifferentialRole`**, calls **`enrichBlockFinalsWithDifferentialRoles`**, reads **`PartFinal.major|minor|minimizer`**, or passes **`mergedRoleOverrides` / `differentialEventRoleOverrides`**.
3. **Task 20.4.1.2:** If **`mergeBlockDifferentialRoleOverrides`** remains a no-op-only API, **inline** `{}` at the call site in **`appointmentSlotBuilder.ts`**, **remove** the export from **`partFinalizer.ts`**, re-export cleanup, run **client lint** on touched files.
4. Do **not** remove **`enrichBlockFinalsWithDifferentialRoles`** or **PartFinal** fields in this session.

## Checkpoint

- After **20.4.1.1:** Map + inventory exist; phase **20.4.2** can cite them.
- After **20.4.1.2:** Lint clean on edited files; behavior unchanged (overrides still empty object).

## Deliverables

- Session **log** (or agreed PM file) contains **pipeline map** + **consumer inventory**.
- Optional: **`mergeBlockDifferentialRoleOverrides`** removed and call site inlined — **only** if grep shows single call site and types still align.

## Acceptance Criteria

- [ ] Written **current vs §4.2** mapping covers **`buildAppointmentShape`** through **`applyShapeToTime`** and names **perspective** / **minimizer** as downstream consumers (at least by file reference).
- [ ] Inventory lists **all** `client/` + `shared/` booking-relevant **`DifferentialRole`** / **`enrichBlockFinalsWithDifferentialRoles`** / **`PartFinal` ternary** touchpoints found by search (admin-only rows may be marked “admin scope”).
- [ ] Any code deletion is **provably** no-op; **client lint** passes on touched paths.
- [ ] No change to **zero-out** order or **lineage** semantics.

## Decomposition

- **Task 20.4.1.1: Pipeline map + consumer inventory** — Author the §4.2 alignment table and grep-backed file list in **`session-20.4.1-log.md`** (or **`DOMAIN_REWRITE_WORKLOG.md`** if you prefer one running doc); include **FEATURE_20 §4.1** diagram cross-check.
- **Task 20.4.1.2: Safe dead-code (merge overrides)** — Inline empty **`differentialEventRoleOverrides`**, remove **`mergeBlockDifferentialRoleOverrides`** if unused elsewhere; verify **`AppointmentShape`** type still satisfied; **`cd client && npm run lint`** on touched files.

## Definition of Done

- [ ] App starts (`npm run start:dev`) when any code changed
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---

## Reference

- `phases/phase-20.4-guide.md`, `phases/phase-20.4-planning.md`
- `.project-manager/ARCHITECTURE.md` §8–§14
- `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`
- `.project-manager/WORKFLOW_FRICTION_LOG.md`
- `.project-manager/agent-model-config.json` (harness model advisory only)
