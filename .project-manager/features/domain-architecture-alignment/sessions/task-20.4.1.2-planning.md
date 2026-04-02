# Plan: task 20.4.1.2 — Remove no-op mergeBlockDifferentialRoleOverrides

## Contract
- **Tier:** task | **ID:** 20.4.1.2
- **Scope:** Client booking only — inline empty `differentialEventRoleOverrides` in `buildAppointmentShape`; delete `mergeBlockDifferentialRoleOverrides` from `partFinalizer.ts`. No API or behavior change (overrides remain `{}`).
- **Governance:** Explicit types on new/changed bindings; no new allowlist.

## Work Profile
- **Execution intent:** implement
- **Gate profile:** fast

## Where we left off
Task **20.4.1.1** complete; session inventory confirms **merge** is no-op and only called from **`appointmentSlotBuilder.ts`**.

## Story

**This task removes** a dead **`mergeBlockDifferentialRoleOverrides`** export **because** block-level differential overrides are gone and the function always returned `{}`, adding noise before phase **20.4.2** refactors.

## Architecture pointers

- FEATURE_20 §4.3 — differential role enrichment slated for removal; this step only deletes **inert** merge plumbing.
- ARCHITECTURE.md §10 — PartFinalizer stays client-side.

## Codebase recon

- **Grep (2026-04-02):** `mergeBlockDifferentialRoleOverrides` appears only in `partFinalizer.ts` (definition) and `appointmentSlotBuilder.ts` (import + call). PM docs reference it by name only.
- **`buildAppointmentShape`:** Passes result to `calculateSlotShape` as `mergedRoleOverrides`; empty object behavior preserved.

## Analysis

- **Risk:** Low — single call site; types unchanged on `AppointmentShape`.
- **Out of scope:** `enrichBlockFinalsWithDifferentialRoles`, `PartFinal` ternaries (session **20.4.2**).

## Design

1. In **`appointmentSlotBuilder.ts`**: import `DifferentialRole` from `@shared`; set `const differentialEventRoleOverrides: Record<string, DifferentialRole> = {}`; drop `mergeBlockDifferentialRoleOverrides` import.
2. In **`partFinalizer.ts`**: delete `mergeBlockDifferentialRoleOverrides` and its JSDoc block.
3. Refresh **`session-20.4.1-log.md`** inventory lines that name the merge function as live code (mark as removed in **20.4.1.2**).

## Goal

Remove dead merge helper; keep runtime output identical.

## Files

- `client/src/utils/booking/appointmentSlotBuilder.ts`
- `client/src/utils/booking/partFinalizer.ts`
- `sessions/session-20.4.1-log.md` (inventory note only)

## Implementation Orders

1. Edit `appointmentSlotBuilder.ts` as in Design.
2. Edit `partFinalizer.ts` — remove merge function.
3. Update `session-20.4.1-log.md` sections A and D to state merge was inlined/removed in task **20.4.1.2**.
4. `cd client && npm run lint`

## Deliverables

- No `mergeBlockDifferentialRoleOverrides` symbol in `client/src`.
- Lint clean on touched client files.

## Acceptance Criteria

- [ ] Grep shows **zero** `mergeBlockDifferentialRoleOverrides` under `client/`.
- [ ] `buildAppointmentShape` still passes an empty `Record<string, DifferentialRole>` into `calculateSlotShape`.
- [ ] Client lint passes.

## Checkpoint

- Session **20.4.1** can proceed to **`/session-end`** after both tasks closed.

## Definition of Done

- [ ] Lint passes; session guide task **20.4.1.2** checked at **`/task-end`**.

---

## Reference

- `sessions/session-20.4.1-guide.md`, `sessions/session-20.4.1-log.md`
- `sessions/task-20.4.1.1-handoff.md`
- `.project-manager/ARCHITECTURE.md` §8–§14
