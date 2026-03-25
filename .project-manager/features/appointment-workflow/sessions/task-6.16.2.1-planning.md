# Plan: task 6.16.2.1 — Minimizer segment detection + types

## Contract
- **Tier:** task | **ID:** 6.16.2.1
- **Scope:** Pure utilities + client types to list **all** minimizer-storage-role (`moveable`) event shapes in **`slotShape.eventFinals` order**, with per-segment metadata for later scheduling work. **Out of scope:** `useMoveablePartsScheduling` refactor (task **6.16.2.2**).
- **Governance:** Governance Context (Task) — function complexity, explicit exports, no `Ref|ComputedRef` unions (this task is **types + functions only**).

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function, type
- **Gate profile:** fast
- **Suggested depth:** leaf

---

## Where we left off
Session **6.16.2** planning locks decomposition: **6.16.2.1** = detection/types; **6.16.2.2** = composable + orchestrator.

---

## Story

**This task adds** `listMinimizerSegmentsFromAppointmentShape` (name may be finalized) **and** `MinimizerSegmentDescriptor` **because** `getEventShapeByRoleWithOverrides(..., 'moveable')` only returns **one** shape while templates can contain **multiple** event finals whose **effective** role is minimizer storage (`moveable`). Task **6.16.2.2** will consume the ordered list without re-implementing role resolution.

---

## Analysis

- **Problem:** `resolveEventShapeEntityForRole` uses `Array.find` → first match only. Scheduling needs **every** `eventFinal` whose `effectiveDifferentialRole(...) === 'moveable'`, in **array index order** (phase guide: sequential boundaries).
- **Boundaries:** **Booking / client utils only** — `client/src/utils/booking/*`, optional `client/src/types/booking/*`. Uses `@shared/utils/differentialRoleUtils.effectiveDifferentialRole` and `DifferentialRoleStorage` — **no** server changes.
- **Data source:** `AppointmentShape.slotShape.eventFinals` — each `EventFinal` has `eventShape`, `rawDuration`, `roundedDuration` ([`appointmentModels.ts`](../../../../client/src/types/appointmentModels.ts)).
- **Not included:** Margin (`margin` → `minimizer: 'override'` on `PartFinal`) is a **different** scheduling path; this helper filters by **storage** role **`moveable`** only (minimizer **completion window** segment).
- **Risks:** `EventShape` (wizard model) vs `EventShapeEntity` (admin) — composable today casts `eventShape` to `EventShapeEntity`; keep **one** representation in the descriptor that matches what `getMoveablePartShapeName` / composable expect (document in Design).
- **Tests:** Project policy — **no new test files**; verify via `npm run lint` and manual reasoning.

---

## Design

1. **New module** (preferred over bloating [`eventAttendeeUtils.ts`](../../../../client/src/utils/eventAttendeeUtils.ts)): `client/src/utils/booking/minimizerEventShapes.ts`.
2. **Exported type** `MinimizerSegmentDescriptor` (exact fields TBD in implementation, minimally):
   - `orderIndex: number` — index into `slotShape.eventFinals` (stable ordering).
   - `eventShapeId: string` — `String(eventFinal.eventShape.id)` (or branded id helper if project standard).
   - `rawDurationMinutes: number` / `roundedDurationMinutes: number` — from `EventFinal` (confirm units match existing moveable duration usage in [`useMoveablePartsScheduling`](../../../../client/src/composables/booking/useMoveablePartsScheduling.ts)).
   - `eventShape: EventShape` — reference for callers that need entity fields without re-fetching.
3. **Exported function** `listMinimizerSegmentsFromAppointmentShape(shape: AppointmentShape): MinimizerSegmentDescriptor[]`:
   - Read `shape.differentialEventRoleOverrides`.
   - For each `eventFinal` in `shape.slotShape.eventFinals` **in order**, compute `effectiveDifferentialRole(eventShapeId, templateRole, overrides)`.
   - If effective role **`=== 'moveable'`** (the only `DifferentialRoleStorage` value for minimizer segment in DB today), **push** descriptor; else skip.
   - Return **empty** array if none; **N** entries if N finals qualify.
4. **JSDoc:** One block stating ordering invariant (eventFinals index order) and that **`margin`** is excluded by definition of this helper.

**Optional:** thin re-export or wrapper in `eventAttendeeUtils.ts` **only if** we want a single import surface — default **no** to avoid churn.

---

## Design Before Execute (pseudocode)

```
function listMinimizerSegmentsFromAppointmentShape(shape: AppointmentShape): MinimizerSegmentDescriptor[] {
  const overrides = shape.differentialEventRoleOverrides ?? null
  const out: MinimizerSegmentDescriptor[] = []
  for (let i = 0; i < shape.slotShape.eventFinals.length; i++) {
    const ef = shape.slotShape.eventFinals[i]
    const id = String(ef.eventShape.id)
    const effective = effectiveDifferentialRole(id, ef.eventShape.differentialRole, overrides ?? undefined)
    if (effective !== 'moveable') continue
    out.push({ orderIndex: i, eventShapeId: id, rawDurationMinutes: ef.rawDuration, ... })
  }
  return out
}
```

Adjust duration field names to match how minutes are represented elsewhere (verify against `EventFinal` consumers).

---

## Goal

Ship **ordered** minimizer-segment descriptors for an `AppointmentShape`, suitable for task **6.16.2.2** to chain boundaries in the composable.

---

## Files (this task)

| Action | Path |
|--------|------|
| Add | `client/src/utils/booking/minimizerEventShapes.ts` |
| Add | `client/src/types/booking/minimizerSegment.ts` (optional if types stay inline — prefer single file if &lt; ~80 lines total) |
| Reference only | `client/src/types/appointmentModels.ts`, `@shared/utils/differentialRoleUtils.ts` |

**Not in this task:** `useMoveablePartsScheduling.ts`, `useAvailabilityOrchestrator.ts` (6.16.2.2).

---

## Approach

1. Add types + `listMinimizerSegmentsFromAppointmentShape` with explicit return type.
2. Export from `minimizerEventShapes.ts`; avoid default export.
3. `cd client && npm run lint` on touched files.
4. **Do not** wire the composable yet (prevents scope creep into 6.16.2.2).

---

## Checkpoint

- Lint clean; no new audit P0 on touched files.
- Descriptor list length matches count of `eventFinals` with effective role `moveable`, in index order.

---

## Deliverables

- [ ] `MinimizerSegmentDescriptor` (or equivalent) exported from booking utils/types.
- [ ] `listMinimizerSegmentsFromAppointmentShape` implemented and exported.
- [ ] JSDoc invariants documented.

---

## Acceptance Criteria

- [ ] **0** shapes → `[]`; **1** minimizer final → length **1**; **N** minimizer finals → length **N**, order matches `eventFinals` iteration order.
- [ ] Finals with effective role **major** / **minor** / **margin** / **none** are **not** included unless they resolve to **`moveable`** (verify with override mental examples).
- [ ] No composable changes in this PR scope.

---

## Definition of Done

- [ ] `npm run start:dev` still runs (no import cycles).
- [ ] `cd client && npm run lint` passes for touched files.
- [ ] Session guide task row can be checked at **task-end** (agent updates guide when ending task).

---

## Reference

- Session plan: [session-6.16.2-planning.md](session-6.16.2-planning.md)
- Phase: [phase-6.16-guide.md](../phases/phase-6.16-guide.md)
- Architecture: [.project-manager/ARCHITECTURE.md](../../ARCHITECTURE.md)
- `effectiveDifferentialRole`: `@shared/utils/differentialRoleUtils`

---

## Coverage check

**Enough to enact task 6.16.2.1?** Yes: single utility module + types, no composable. **6.16.2.2** will import this list and replace single-`getEventShapeByRoleWithOverrides` usage.
