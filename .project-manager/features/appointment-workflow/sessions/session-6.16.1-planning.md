# Plan: session 6.16.1 — Margin role — types, pipeline, admin

## Contract
- **Tier:** session | **ID:** 6.16.1
- **Scope:** Margin role — types, pipeline, admin

## Where we left off

Phase 6.16 planning. `PartFinal.minimizer: TernaryBoolean` exists. `resolvePartShapeDifferentialFlags` maps `'moveable'` → `minimizer: 'true'`; add **`margin`** → `minimizer: 'override'`. DB ENUM: `major`, `minor`, `moveable` — add `margin` (migration authored; run only on localhost per project policy).

## Story

**This session delivers** the `margin` differential role end-to-end (shared types, DB, server model, part finalizer, admin UI) **so that** margin parts get `PartFinal.minimizer === 'override'`.  
**Estimated size:** M

## Analysis

- **Domains:** `shared/types`, `shared/constants`, `shared/utils`, `server/src/db/models/booking/event_shape.ts`, migrations, `client/src/utils/booking/partFinalizer.ts`, admin `DifferentialEventRoleOverridesField.vue`.
- **ENUM strategy (locked):** Add `margin` alongside `moveable`; do not rename `moveable` → `minimizer` in DB this session (6.16.3).
- **Risks:** Migration execution only when `DB_HOST` is localhost.

## Goal

Add `margin` to `DifferentialRole` across the stack; part finalizer sets `minimizer: 'override'` when effective role is `margin`; admin shows Margin in overrides.

## Files

- `shared/types/differentialRole.ts`, `shared/constants/differentialRoleMappings.ts`, `shared/utils/differentialRoleUtils.ts`
- `server/src/db/models/booking/event_shape.ts`, new migration under `server/src/db/migrations/`
- `client/src/utils/booking/partFinalizer.ts`
- `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`, `client/src/utils/admin/differentialRoleMatrixRows.ts`

## Approach

1. **6.16.1.1** — Shared types + constants + utils.
2. **6.16.1.2** — Server model + migration (authored).
3. **6.16.1.3** — Part finalizer: `margin` → `minimizer: 'override'`.
4. **6.16.1.4** — Admin UI check + client/server lint + app start.

## Deliverables

- `margin` on `DifferentialRole` / storage; labels and select options; guards updated.
- Server model + migration file.
- Part finalizer branch for margin.
- Admin override includes Margin; lint clean.

## Acceptance Criteria

- [ ] Types and utils accept `margin`
- [ ] Server model ENUM includes `margin`
- [ ] Migration authored
- [ ] `minimizer: 'override'` when role is `margin`
- [ ] Admin dropdown includes Margin
- [ ] Client + server lint; app starts

## Decomposition

| Task | Name |
|------|------|
| 6.16.1.1 | Shared types + constants for margin |
| 6.16.1.2 | Server model + migration |
| 6.16.1.3 | Part finalizer pipeline — margin branch |
| 6.16.1.4 | Admin UI verification + lint |

## Definition of Done

- [ ] App starts; lint passes; session log/handoff updated when session ends

---
## Reference
- `phases/phase-6.16-guide.md`
