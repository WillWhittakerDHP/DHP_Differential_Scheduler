# Plan: task 6.16.1.3 — Part finalizer pipeline — margin branch

## Contract
- **Tier:** task | **ID:** 6.16.1.3
- **Scope:** Map effective differential role **`margin`** → **`PartFinal.minimizer: 'override'`** in `resolvePartShapeDifferentialFlags`.
- **Governance:** Single function edit; keep branch order readable; no silent fallback.

## Where we left off

Tasks **6.16.1.1** (shared types) and **6.16.1.2** (DB + model) complete. `effectiveDifferentialRole` can now return `'margin'` from template or overrides; the part finalizer still only maps **`moveable` → `minimizer: 'true'`**, so **`margin`** never sets **`minimizer: 'override'`**.

## Story

**This task changes** `resolvePartShapeDifferentialFlags` in `partFinalizer.ts` **so that** when an assigned event shape’s effective role is **`margin`**, the merged **`PartFinal`** flags include **`minimizer: 'override'`** per Phase 6.16 design (`TernaryBoolean` — margin uses **`override`**, not the minimizer completion-window **`true`** path).

## Analysis

- **Domain:** Client booking utilities only (`client/src/utils/booking/partFinalizer.ts`). Uses `@shared` `effectiveDifferentialRole` (already returns `DifferentialRole` including `margin`).
- **Semantics:** Phase guide: **`'override'`** = margin (pre-major anchor); **`'true'`** = minimizer segment (`moveable` in DB until rename). One new `else if` after the `moveable` branch.
- **Interaction with loop:** Multiple event instances per part shape still OR flags (existing behavior). If both `moveable` and `margin` appeared on the same part shape, later iterations overwrite `minimizer` — same class of issue as before; out of scope unless product requires priority rules.
- **Downstream:** `enrichBlockFinalsWithDifferentialRoles` spreads flags onto `PartFinal` unchanged — no API change.

## Design

In `resolvePartShapeDifferentialFlags`, after:

```ts
} else if (role === 'moveable') {
  minimizer = 'true'
}
```

add:

```ts
} else if (role === 'margin') {
  minimizer = 'override'
}
```

No new imports. Optional: short **WHY** comment that margin uses `override` per `PartFinal.minimizer` contract.

## Goal

When **`effectiveDifferentialRole(...)`** is **`'margin'`** for an event shape tied to a part shape, the returned flags set **`minimizer: 'override'`** (and do not leave **`minimizer`** at **`'false'`**).

## Files (this task)

- `client/src/utils/booking/partFinalizer.ts` — `resolvePartShapeDifferentialFlags` only

## Approach

1. Add **`margin`** branch as above.
2. `cd client && npm run lint`

## Checkpoint

- For a shape with `differentialRole` (or override) **`margin`**, enriched **`PartFinal`** has **`minimizer === 'override'`**.
- **`major` / `minor` / `moveable`** behavior unchanged.

## Deliverables

- Single branch in **`resolvePartShapeDifferentialFlags`**.

## Acceptance Criteria

- [ ] `role === 'margin'` sets **`minimizer = 'override'`**.
- [ ] Lint passes for `client/`.
- [ ] No new dependencies or refactors beyond this branch.

## Implementation Orders (for `/accepted-code`)

1. Edit `partFinalizer.ts`.
2. `npm run lint` in `client/`.

## Definition of Done

- [ ] Lint; session guide updated on `/task-end`

---
## Reference
- Session guide: `.project-manager/features/appointment-workflow/sessions/session-6.16.1-guide.md`
- Phase semantics: `.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md` (`PartFinal.minimizer`)
