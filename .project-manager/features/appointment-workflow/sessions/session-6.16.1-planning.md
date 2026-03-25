<!-- harness-planning-rollup tier=session id=6.16.1 consolidatedAt=2026-03-25T21:19:44.920Z -->

# Consolidated planning: session 6.16.1

## Session 6.16.1 (parent)

## Story

**This session delivers** the `margin` differential role end-to-end — from DB ENUM + shared types through the part finalizer pipeline to the admin override UI — **so that** event shapes can be assigned `margin` for pre-major temporal placement, and the booking slot pipeline correctly sets `PartFinal.minimizer === 'override'` for margin parts.  
**Estimated size:** M

## Analysis

- **What problem does this solve and why now?** The `margin` role (pre-major anchor) is the first concrete extension of the ternary `PartFinal.minimizer` system designed in Phase 6.16. Without it, `minimizer: 'override'` is dead code — never emitted. Margin must land before multi-minimizer (6.16.2) because it exercises the same type + pipeline + admin surface.
- **Domain boundaries:** Shared types (`shared/types/differentialRole.ts`, `shared/utils/differentialRoleUtils.ts`, `shared/constants/differentialRoleMappings.ts`); server model + migration (`server/src/db/models/booking/event_shape.ts`, migrations); client booking utilities (`client/src/utils/booking/partFinalizer.ts`); admin field component (`client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`).
- **Existing patterns:** `DifferentialRole` union + `DifferentialRoleStorage` + `DIFFERENTIAL_ROLE_LABELS` + `DIFFERENTIAL_ROLE_SELECT_OPTIONS` — add `margin` to each. `resolvePartShapeDifferentialFlags` uses an `if/else if` chain on `effectiveDifferentialRole` output — add `margin` branch. Admin field uses `roleSelectItems` derived from shared constants.
- **Risks:** (1) DB ENUM migration on remote — we author migration but **do not run** (migration authority rule: `DB_HOST` is remote). (2) ENUM rename strategy: decide whether to keep `moveable` in storage and alias on client, or add `minimizer` alongside — **decision: keep `moveable` in DB for now**, add only `margin`; rename is session 6.16.3.
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
- `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue` — verify `roleSelectItems` picks up new constant
- `client/src/utils/admin/differentialRoleMatrixRows.ts` — verify compatibility

## Approach

1. **Task 6.16.1.1 (Shared types + constants):** Extend `DifferentialRole`, `DifferentialRoleStorage`, labels, select options, and all util guards/parsers in `shared/`.
2. **Task 6.16.1.2 (Server model + migration):** Add `'margin'` to `event_shape.ts` model TypeScript union and Sequelize ENUM; author migration file (do not run — remote DB).
3. **Task 6.16.1.3 (Part finalizer pipeline):** Add `'margin'` branch in `resolvePartShapeDifferentialFlags` → `minimizer = 'override'`; verify `enrichBlockFinalsWithDifferentialRoles` passes it through.
4. **Task 6.16.1.4 (Admin UI + lint):** Confirm admin field + matrix builder pick up new role from shared constants; run client + server lint; verify app starts.

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

---

## Task 6.16.1.1 (source: task-6.16.1.1-planning.md)

### Story

**This task changes** the shared `DifferentialRole` contract and helpers **because** downstream layers (server ENUM, part finalizer, admin selects) all import from `@shared`; without `margin` in the union and guards, TypeScript and runtime sanitization would reject or drop the new role.

### Analysis

- **Problem / why now:** Phase 6.16 introduces **margin** as a first-class event-shape role. The shared layer is the single source of truth for API/JSONB and UI; it must list `margin` before server or client code can safely persist or display it.
- **Domain boundaries:** **Shared contracts only** (`shared/types`, `shared/constants`, `shared/utils`). No client-only or server-only files in this task’s file list (see Design note on duplicate loose checks).
- **Patterns:** Keep `DifferentialRole` = union including `'none'`; `DifferentialRoleStorage` = persisted non-null roles (add `'margin'`). `DIFFERENTIAL_ROLE_LABELS` / `DIFFERENTIAL_ROLE_SELECT_OPTIONS` stay the canonical admin labels. Guards use explicit equality checks (existing style).
- **Risks:** Any **client duplicate** of `isDifferentialRoleStorage` (e.g. `isDifferentialRoleStorageLoose` in `apiEntityFieldNormalization.ts`) must be updated in a follow-up edit when wiring API normalization, or API may log false “invalid differentialRole” for `'margin'`. Not required for shared-only compile, but track when implementing the stack.
- **Alternatives:** Stringly-typed margin only on server — rejected; breaks shared boundary and admin transformers.

### Goal

Extend shared types and utilities so **`margin`** is a valid **`DifferentialRole`** and **`DifferentialRoleStorage`**, with labels and select options for admin/API consumers, and guards that accept **`margin`** everywhere **`moveable`** was already accepted for storage and overrides.

### Files

- `shared/types/differentialRole.ts`
- `shared/constants/differentialRoleMappings.ts`
- `shared/utils/differentialRoleUtils.ts`

### Approach

1. Edit `differentialRole.ts` — add `'margin'` to both type aliases.
2. Edit `differentialRoleMappings.ts` — labels + select option row for `margin`.
3. Edit `differentialRoleUtils.ts` — extend `isDifferentialRoleStorage` and `isDifferentialRoleOverrideValue`; adjust comments if they enumerate literals.

### Checkpoint

- `tsc` / project build for packages that compile `shared/` succeeds (or client/server typecheck after import).
- No exhaustive `switch` on `DifferentialRole` in `shared/` left non-exhaustive (grep if any).

### Deliverables

- Updated `DifferentialRole` and `DifferentialRoleStorage` including `'margin'`.
- `DIFFERENTIAL_ROLE_LABELS` and `DIFFERENTIAL_ROLE_SELECT_OPTIONS` include margin.
- `isDifferentialRoleStorage` and `isDifferentialRoleOverrideValue` accept `'margin'`.

### Acceptance Criteria

- [ ] `DifferentialRole` includes `'margin'`; `DifferentialRoleStorage` includes `'margin'`.
- [ ] `DIFFERENTIAL_ROLE_LABELS.margin === 'Margin'` (or agreed copy).
- [ ] `DIFFERENTIAL_ROLE_SELECT_OPTIONS` includes `{ value: 'margin', label: ... }`.
- [ ] `isDifferentialRoleStorage('margin')` is true; `parseDifferentialRole('margin')` returns `'margin'`.
- [ ] `isDifferentialRoleOverrideValue('margin')` is true; `sanitizeDifferentialEventRoleOverridesInput` preserves margin entries when present in input.

### Design

1. **`shared/types/differentialRole.ts`:** Extend to  
   `DifferentialRole = 'major' | 'minor' | 'moveable' | 'margin' | 'none'`  
   and `DifferentialRoleStorage = 'major' | 'minor' | 'moveable' | 'margin'`.
2. **`shared/constants/differentialRoleMappings.ts`:** Add `margin: 'Margin'` to `DIFFERENTIAL_ROLE_LABELS`; append `{ value: 'margin', label: ... }` to `DIFFERENTIAL_ROLE_SELECT_OPTIONS` (order: after `moveable` or before `none` in label-only sense — match product: major, minor, moveable, margin, none for selects that list storage values).
3. **`shared/utils/differentialRoleUtils.ts`:**
   - `isDifferentialRoleStorage`: add `value === 'margin'`.
   - `isDifferentialRoleOverrideValue`: add `raw === 'margin'` (override map may include margin for block instances).
   - `parseDifferentialRole` / `sanitizeDifferentialRoleInput`: unchanged structure — they route through `isDifferentialRoleStorage`.
   - `toApiDifferentialRole`: unchanged — returns `DifferentialRoleStorage | null`; `margin` is storage.
   - Update JSDoc on override helper if it lists literals explicitly.

**Pseudocode (guards):**

```ts
// isDifferentialRoleStorage
return value === 'major' || value === 'minor' || value === 'moveable' || value === 'margin'

// isDifferentialRoleOverrideValue  
return raw === 'major' || raw === 'minor' || raw === 'moveable' || raw === 'margin' || raw === 'none'
```

---

## Task 6.16.1.2 (source: task-6.16.1.2-planning.md)

### Story

**This task changes** the `EventShape` model and adds a migration **so that** `event_shapes.differential_role` can store **`margin`** at rest, matching **`DifferentialRoleStorage`** and admin/API payloads.

### Analysis

- **Why now:** Without a DB ENUM value, inserts/updates with `differentialRole: 'margin'` fail at the database regardless of shared types.
- **Boundaries:** Server-only (`server/src/db/models/booking/event_shape.ts`, `server/src/db/migrations/`). Shares semantics with `shared/types/differentialRole.ts` (already includes `margin`).
- **Patterns:** Prior migration `20260323_000004_differential_role_enum.mjs` created `differential_role_enum` and updated `admin_metadata` id `132b05ce-f486-4d3d-be5d-211b13a7ee9d` (eventShape `differentialRole` select options). This task extends ENUM and refreshes that `input_config` JSON to include **Margin**.
- **Risks:** `ALTER TYPE ... ADD VALUE` cannot run inside a transaction block in older PostgreSQL versions — Sequelize may wrap migrations; use `sequelize.query` with raw SQL; if the project uses a transaction wrapper, follow existing repo patterns. **Idempotency:** use `pg_enum` existence check before `ADD VALUE`.
- **Down migration:** Removing an ENUM label in PostgreSQL is non-trivial; **down** will revert `admin_metadata` options only and document that the ENUM label may remain until a manual/type-rebuild migration (acceptable for this codebase unless a stricter policy exists).

### Goal

Align the database and Sequelize model with the shared **`margin`** role: ENUM contains `margin`, model types and `ENUM()` list include it, migration + admin_metadata options shipped.

### Files

- `server/src/db/models/booking/event_shape.ts`
- `server/src/db/migrations/20260432_000044_add_margin_to_differential_role_enum.mjs`

### Approach

1. Edit `event_shape.ts` — TypeScript union + `DataTypes.ENUM` + comment.
2. Add migration file — idempotent `ADD VALUE`, `UPDATE admin_metadata`.
3. Run `cd server && npm run lint` (no migrate).

### Checkpoint

- Server ESLint passes; TypeScript accepts `'margin'` on `differentialRole`.
- Migration file present and readable; idempotent where possible.

### Deliverables

- Updated `EventShape` model with `margin` in union and Sequelize ENUM.
- New migration: add ENUM value + admin_metadata options.

### Acceptance Criteria

- [ ] `event_shape.ts` declares `differentialRole` including `'margin'` and `ENUM` lists all four storage roles.
- [ ] Migration adds `'margin'` to `public.differential_role_enum` idempotently.
- [ ] Migration updates `admin_metadata` `132b05ce-f486-4d3d-be5d-211b13a7ee9d` to include Margin in `input_config.options`.
- [ ] `cd server && npm run lint` passes.
- [ ] Migrations not executed against remote DB in this workspace session.

### Design

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

---

## Task 6.16.1.3 (source: task-6.16.1.3-planning.md)

### Story

**This task changes** `resolvePartShapeDifferentialFlags` in `partFinalizer.ts` **so that** when an assigned event shape’s effective role is **`margin`**, the merged **`PartFinal`** flags include **`minimizer: 'override'`** per Phase 6.16 design (`TernaryBoolean` — margin uses **`override`**, not the minimizer completion-window **`true`** path).

### Analysis

- **Domain:** Client booking utilities only (`client/src/utils/booking/partFinalizer.ts`). Uses `@shared` `effectiveDifferentialRole` (already returns `DifferentialRole` including `margin`).
- **Semantics:** Phase guide: **`'override'`** = margin (pre-major anchor); **`'true'`** = minimizer segment (`moveable` in DB until rename). One new `else if` after the `moveable` branch.
- **Interaction with loop:** Multiple event instances per part shape still OR flags (existing behavior). If both `moveable` and `margin` appeared on the same part shape, later iterations overwrite `minimizer` — same class of issue as before; out of scope unless product requires priority rules.
- **Downstream:** `enrichBlockFinalsWithDifferentialRoles` spreads flags onto `PartFinal` unchanged — no API change.

### Goal

When **`effectiveDifferentialRole(...)`** is **`'margin'`** for an event shape tied to a part shape, the returned flags set **`minimizer: 'override'`** (and do not leave **`minimizer`** at **`'false'`**).

### Files

- `client/src/utils/booking/partFinalizer.ts` — `resolvePartShapeDifferentialFlags` only

### Approach

1. Add **`margin`** branch as above.
2. `cd client && npm run lint`

### Checkpoint

- For a shape with `differentialRole` (or override) **`margin`**, enriched **`PartFinal`** has **`minimizer === 'override'`**.
- **`major` / `minor` / `moveable`** behavior unchanged.

### Deliverables

- Single branch in **`resolvePartShapeDifferentialFlags`**.

### Acceptance Criteria

- [ ] `role === 'margin'` sets **`minimizer = 'override'`**.
- [ ] Lint passes for `client/`.
- [ ] No new dependencies or refactors beyond this branch.

### Design

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

---

## Task 6.16.1.4 (source: task-6.16.1.4-planning.md)

### Story

**This task confirms** admin + lint health for the margin rollout **so that** session **6.16.1** can close without hidden hardcoded role lists or broken governance gates.

### Analysis

- **Override matrix (`DifferentialEventRoleOverridesField.vue`):** Already lists **Margin** via **`DIFFERENTIAL_ROLE_LABELS.margin`**. **`differentialRoleMatrixRows`** only surfaces **`templateRole`** from entities — no enum hardcoding.
- **Event shape template role (metadata-driven select):** Options come from **`admin_metadata.input_config`**; migration **6.16.1.2** added Margin to the canonical row — after migrate on host DB, Shapes UI will show Margin without further Vue changes.
- **`DIFFERENTIAL_ROLE_SELECT_OPTIONS`** uses **`value: null`** for template “none”; override UI uses explicit **`'none'`** for block overrides — **two semantics**; do not blindly replace override **`roleSelectItems`** with **`SELECT_OPTIONS`** without a small mapping layer (out of scope unless we add a 5-line helper).
- **Risk:** None beyond missing grep — if a stray **`'major'|'minor'|'moveable'`** guard exists in admin-only code, fix minimally.

### Goal

Session **6.16.1** exit criteria: admin paths documented, **client + server** lint clean, no known missing **Margin** entry in reviewed surfaces.

### Files

- **Likely none** (verification-only), or at most:
  - `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue` — optional comment only

### Approach

1. Search `client/` for **`moveable`** / **`DifferentialRole`** in admin + booking admin utils; confirm **Margin** coverage or fix.
2. Run both linters.
3. If all green, **no code edits** — note in task handoff.

### Checkpoint

- Lint passes both packages.
- Grep shows no stale three-value-only differential role lists in admin UI code paths we care about.

### Deliverables

- Verification notes (implicit in `/task-end` handoff).
- Clean lint.

### Acceptance Criteria

- [ ] Client ESLint passes.
- [ ] Server ESLint passes.
- [ ] Override field includes **Margin** (already true) or is fixed in-session.
- [ ] Optional: one-line comment if it clarifies **none** vs **inherit** vs **`DIFFERENTIAL_ROLE_SELECT_OPTIONS`**.

### Design

1. **Grep / read:** Confirm no admin-only differential-role list omits **`margin`** (except intentional legacy docs).
2. **Lint:** `cd client && npm run lint` and `cd server && npm run lint`.
3. **App:** User **`npm run start:dev`** already running counts as smoke; agent does not need to restart if lint is clean (per session checklist “acceptable when already running”).
4. **Code changes:** Only if grep finds a gap; otherwise **no product diff** beyond possible **comment** in **`DifferentialEventRoleOverridesField`** noting **`admin_metadata`** + **`DIFFERENTIAL_ROLE_LABELS`** alignment.

---
