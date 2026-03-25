# Plan: task 6.16.1.2 — Server model + migration (margin on `event_shapes`)

## Contract
- **Tier:** task | **ID:** 6.16.1.2
- **Scope:** Sequelize `event_shape.differentialRole` + Postgres `differential_role_enum`; authored migration; **do not run** migrations on remote DB (project migration authority).
- **Governance:** Server model stays aligned with `@shared` `DifferentialRoleStorage`.

## Where we left off

Task **6.16.1.1** complete: shared types and client paths accept `'margin'`. DB column still only allows `major|minor|moveable` at the Postgres ENUM level; model `DataTypes.ENUM` must match after migration.

## Story

**This task changes** the `EventShape` model and adds a migration **so that** `event_shapes.differential_role` can store **`margin`** at rest, matching **`DifferentialRoleStorage`** and admin/API payloads.

## Analysis

- **Why now:** Without a DB ENUM value, inserts/updates with `differentialRole: 'margin'` fail at the database regardless of shared types.
- **Boundaries:** Server-only (`server/src/db/models/booking/event_shape.ts`, `server/src/db/migrations/`). Shares semantics with `shared/types/differentialRole.ts` (already includes `margin`).
- **Patterns:** Prior migration `20260323_000004_differential_role_enum.mjs` created `differential_role_enum` and updated `admin_metadata` id `132b05ce-f486-4d3d-be5d-211b13a7ee9d` (eventShape `differentialRole` select options). This task extends ENUM and refreshes that `input_config` JSON to include **Margin**.
- **Risks:** `ALTER TYPE ... ADD VALUE` cannot run inside a transaction block in older PostgreSQL versions — Sequelize may wrap migrations; use `sequelize.query` with raw SQL; if the project uses a transaction wrapper, follow existing repo patterns. **Idempotency:** use `pg_enum` existence check before `ADD VALUE`.
- **Down migration:** Removing an ENUM label in PostgreSQL is non-trivial; **down** will revert `admin_metadata` options only and document that the ENUM label may remain until a manual/type-rebuild migration (acceptable for this codebase unless a stricter policy exists).

## Design

### 1. Model (`event_shape.ts`)

- `declare differentialRole`: add `'margin'` to the union: `'major' | 'minor' | 'moveable' | 'margin' | null`.
- `differentialRole` column: `DataTypes.ENUM('major', 'minor', 'moveable', 'margin')`.
- Comment: mention **margin** alongside major/minor/moveable.

### 2. Migration (new file under `server/src/db/migrations/`)

- **Name:** `20260432_000044_add_margin_to_differential_role_enum.mjs` (next free slot in `server/src/db/migrations/`).
- **up:**
  - `DO $$ ... $$` block: if `margin` is not in `pg_enum` for `differential_role_enum`, run `ALTER TYPE public.differential_role_enum ADD VALUE 'margin'`.
  - `UPDATE public.admin_metadata SET input_config = '...' WHERE id = '132b05ce-f486-4d3d-be5d-211b13a7ee9d'` — append `{"label":"Margin","value":"margin"}` after Moveable (order: None, Major, Minor, Moveable, Margin).
- **down:**
  - Reset `input_config` to the four-option JSON (no margin) to match pre-migration admin UI.
  - Optional comment: ENUM value `margin` is not removed in `down` (PostgreSQL limitation).

### 3. Execution

- **Do not** run `npm run migrate` here if `DB_HOST` is not localhost (per workspace rules). Author and commit only.

## Goal

Align the database and Sequelize model with the shared **`margin`** role: ENUM contains `margin`, model types and `ENUM()` list include it, migration + admin_metadata options shipped.

## Files (this task)

- `server/src/db/models/booking/event_shape.ts`
- `server/src/db/migrations/20260432_000044_add_margin_to_differential_role_enum.mjs`

## Approach

1. Edit `event_shape.ts` — TypeScript union + `DataTypes.ENUM` + comment.
2. Add migration file — idempotent `ADD VALUE`, `UPDATE admin_metadata`.
3. Run `cd server && npm run lint` (no migrate).

## Checkpoint

- Server ESLint passes; TypeScript accepts `'margin'` on `differentialRole`.
- Migration file present and readable; idempotent where possible.

## Deliverables

- Updated `EventShape` model with `margin` in union and Sequelize ENUM.
- New migration: add ENUM value + admin_metadata options.

## Acceptance Criteria

- [ ] `event_shape.ts` declares `differentialRole` including `'margin'` and `ENUM` lists all four storage roles.
- [ ] Migration adds `'margin'` to `public.differential_role_enum` idempotently.
- [ ] Migration updates `admin_metadata` `132b05ce-f486-4d3d-be5d-211b13a7ee9d` to include Margin in `input_config.options`.
- [ ] `cd server && npm run lint` passes.
- [ ] Migrations not executed against remote DB in this workspace session.

## Implementation Orders (for `/accepted-code`)

1. `event_shape.ts`
2. New `.mjs` migration
3. `npm run lint` in `server/`

## Definition of Done

- [ ] App starts (`npm run start:dev`) — smoke if server touched
- [ ] `cd server && npm run lint`
- [ ] Session guide task row updated after `/task-end`

---
## Reference
- Session guide: `.project-manager/features/appointment-workflow/sessions/session-6.16.1-guide.md`
- Prior ENUM migration: `server/src/db/migrations/20260323_000004_differential_role_enum.mjs`
