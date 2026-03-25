# Plan: session 6.16.1 — Margin role — types, pipeline, admin

## Contract
- **Tier:** session | **ID:** 6.16.1
- **Scope:** Margin role — types, pipeline, admin
- **Governance (harness snapshot):**
  - Governance Context (Session)
  - Function Governance
  - Clean — no violations detected.
  - Component Governance
  - Clean — no violations detected.
  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Return surface has 15 properties; decompose into focused composables

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs, architecture
- **Gate profile:** standard
- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off

Phase 6.16 planning complete. Design captured in `phase-6.16-guide.md`. `PartFinal.minimizer: TernaryBoolean` type already landed (replacing `moveable: boolean`). The `resolvePartShapeDifferentialFlags` function currently maps `'moveable'` → `minimizer: 'true'` but has **no branch for margin** (`minimizer: 'override'`). DB ENUM is `('major', 'minor', 'moveable')` with no `margin` value.

## Story

**This session delivers** the `margin` differential role end-to-end — from DB ENUM + shared types through the part finalizer pipeline to the admin override UI — **so that** event shapes can be assigned `margin` for pre-major temporal placement, and the booking slot pipeline correctly sets `PartFinal.minimizer === 'override'` for margin parts.  
**Estimated size:** M

## Analysis

- **What problem does this solve and why now?** The `margin` role (pre-major anchor) is the first concrete extension of the ternary `PartFinal.minimizer` system designed in Phase 6.16. Without it, `minimizer: 'override'` is dead code — never emitted. Margin must land before multi-minimizer (6.16.2) because it exercises the same type + pipeline + admin surface.
- **Domain boundaries:** Shared types (`shared/types/differentialRole.ts`, `shared/utils/differentialRoleUtils.ts`, `shared/constants/differentialRoleMappings.ts`); server model + migration (`server/src/db/models/booking/event_shape.ts`, migrations); client booking utilities (`client/src/utils/booking/partFinalizer.ts`); admin field component (`client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`).
- **Existing patterns:** `DifferentialRole` union + `DifferentialRoleStorage` + `DIFFERENTIAL_ROLE_LABELS` + `DIFFERENTIAL_ROLE_SELECT_OPTIONS` — add `margin` to each. `resolvePartShapeDifferentialFlags` uses an `if/else if` chain on `effectiveDifferentialRole` output — add `margin` branch. Admin field uses `roleSelectItems` derived from shared constants.
- **Risks:** (1) DB ENUM migration on remote — we author migration but **do not run** (migration authority rule: `DB_HOST` is remote). (2) ENUM rename strategy: decide whether to keep `moveable` in storage and alias on client, or add `minimizer` alongside — **decision: keep `moveable` in DB for now**, add only `margin`; rename is session 6.16.3. (3) Slot pipeline consumers that filter by role value — grep for `'moveable'` string literals in client booking utils.
- **ENUM rename strategy decision (locked):** Add `margin` to DB ENUM alongside existing `moveable`. Do **not** rename `moveable` → `minimizer` in this session — that is 6.16.3 scope. Client code already uses `minimizer` field name on `PartFinal`; the mapping `'moveable' → minimizer: 'true'` and `'margin' → minimizer: 'override'` keeps storage and client aligned without churn.

## Goal

Add `margin` to `DifferentialRole` across the full stack — shared types, DB migration, server model, part finalizer pipeline (`minimizer: 'override'` for margin), admin label/select/override UI — so event shapes can be assigned `margin` and the booking pipeline correctly flags margin parts.

## Files

- `shared/types/differentialRole.ts` — add `'margin'` to `DifferentialRole` and `DifferentialRoleStorage`
- `shared/constants/differentialRoleMappings.ts` — add `margin: 'Margin'` label + select option
- `shared/utils/differentialRoleUtils.ts` — update `isDifferentialRoleStorage`, `isDifferentialRoleOverrideValue`, `parseDifferentialRole`
- `server/src/db/models/booking/event_shape.ts` — add `'margin'` to TypeScript union and `DataTypes.ENUM`
- `server/src/db/migrations/` — new migration: `ALTER TYPE differential_role_enum ADD VALUE 'margin'`
- `client/src/utils/booking/partFinalizer.ts` — `resolvePartShapeDifferentialFlags`: add `role === 'margin'` → `minimizer = 'override'`
- `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue` — verify `roleSelectItems` picks up new constant (likely automatic via shared import)
- `client/src/utils/admin/differentialRoleMatrixRows.ts` — verify compatibility

## Approach

1. **Task 6.16.1.1 (Shared types + constants):** Extend `DifferentialRole`, `DifferentialRoleStorage`, labels, select options, and all util guards/parsers in `shared/`.
2. **Task 6.16.1.2 (Server model + migration):** Add `'margin'` to `event_shape.ts` model TypeScript union and Sequelize ENUM; author migration file (do not run — remote DB).
3. **Task 6.16.1.3 (Part finalizer pipeline):** Add `'margin'` branch in `resolvePartShapeDifferentialFlags` → `minimizer = 'override'`; verify `enrichBlockFinalsWithDifferentialRoles` passes it through.
4. **Task 6.16.1.4 (Admin UI + lint):** Confirm admin field + matrix builder pick up new role from shared constants; add `'Margin'` to `roleSelectItems` if not automatic; run client + server lint; verify app starts.

## Checkpoint

- `margin` exists in `DifferentialRole` union, DB ENUM (migration authored), server model, and admin UI select.
- `resolvePartShapeDifferentialFlags` returns `minimizer: 'override'` when effective role is `'margin'`.
- No silent fallback: margin does not silently map to `'none'` or get dropped.
- Client and server lint pass; app starts.

## Deliverables

- Extended `DifferentialRole` / `DifferentialRoleStorage` types with `'margin'`
- Updated shared constants: labels, select options
- Updated shared utils: guards, parsers, sanitizers
- Server model with `'margin'` in TypeScript union and ENUM
- Migration file for `ALTER TYPE differential_role_enum ADD VALUE 'margin'` (authored, not executed)
- Part finalizer: `'margin'` → `minimizer: 'override'` branch
- Admin override field: `Margin` option in dropdown
- Lint clean; app starts

## Acceptance Criteria

- [ ] `DifferentialRole` includes `'margin'`; `DifferentialRoleStorage` includes `'margin'`
- [ ] `DIFFERENTIAL_ROLE_LABELS.margin === 'Margin'`; select options include margin
- [ ] `isDifferentialRoleStorage('margin') === true`; `parseDifferentialRole('margin') === 'margin'`
- [ ] Server `event_shape` model accepts `'margin'` without type error
- [ ] Migration file exists (authored but not run per migration authority)
- [ ] `resolvePartShapeDifferentialFlags` sets `minimizer: 'override'` when effective role is `'margin'`
- [ ] Admin differential-role-override dropdown includes "Margin"
- [ ] Client lint passes; server lint passes; app starts

## Decomposition

| Task | Name | Scope |
|------|------|-------|
| **6.16.1.1** | Shared types + constants for margin | `shared/types/`, `shared/constants/`, `shared/utils/` |
| **6.16.1.2** | Server model + migration | `server/src/db/models/`, `server/src/db/migrations/` |
| **6.16.1.3** | Part finalizer pipeline — margin branch | `client/src/utils/booking/partFinalizer.ts` |
| **6.16.1.4** | Admin UI verification + lint | `DifferentialEventRoleOverridesField.vue`, matrix builder, lint |

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
