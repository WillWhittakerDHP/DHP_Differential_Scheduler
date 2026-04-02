<!-- harness-planning-rollup tier=session id=20.1.1 consolidatedAt=2026-04-02T14:51:33.729Z -->

# Consolidated planning: session 20.1.1

## Session 20.1.1 (parent)

## Story

**This session delivers** the block shape type enum rename (`property`->`time`, `coupon`->`price`, `option`->`event`) in PostgreSQL, the Sequelize model, and all client/server code that references those strings, **so that** subsequent sessions and passes operate on the target vocabulary without carrying legacy type names.
**Estimated size:** M

---

## Analysis

- **Problem / why now:** The DB enum and all code still use legacy type names (`property`/`coupon`/`option`). Every subsequent phase (API, admin, booking) depends on the canonical names being in place first.
- **Domain boundaries:** Server persistence (model + migration) and client constants/types. Some server middleware and repositories also reference the strings. No UI or route handler logic changes in this session.
- **Grounding:** Recon confirmed 1 server model, 1 client constants file, ~7 server files, and ~8 client files reference the old strings. No Joi validators in entity routes need updating.
- **Patterns:** Use `ALTER TYPE ... RENAME VALUE` for PG enum (one per rename). Update TS type unions and constants in the same task so the app builds.
- **Risks:** (1) `'property'` appears in non-block-type contexts (real-estate property, property_details) -- must not rename those. (2) String literals in server code may be used in SQL queries or switch statements -- verify each before changing.
- **Alternatives:** None meaningful -- the rename is prescribed by the implementation plan.

## Goal

Rename the `block_shapes.type` PostgreSQL enum values from `property`/`coupon`/`option` to `time`/`price`/`event` (per plan §1.1, §2.1). Update the Sequelize model type union, the client `BLOCK_SHAPE_TYPES` constants, and all server/client code that switches on or references the old strings in block-type context.

**Done for this session:** Migration authored; `block_shape.ts` model uses `time`/`price`/`event`; `blockShapeTypes.ts` uses `TIME`/`PRICE`/`EVENT` keys; all referencing files updated; app starts and lint passes.

## Files

- **Migration (create):** `server/src/db/migrations/20260432_000058_rename_block_shape_type_enum.mjs`
- **Server model (modify):** `server/src/db/models/admin/block_shape.ts` -- type union + DataTypes.ENUM
- **Client constants (modify):** `client/src/constants/blockShapeTypes.ts` -- keys + values + exported type
- **Client types (modify):** `client/src/types/entities.ts` -- `BlockShapeEntity` type usage
- **Server files to update (block-type string refs):** `server/src/repositories/appointmentSelectionRepository.ts`, `server/src/repositories/appointmentSelectionCodec.ts`, `server/src/middlewares/ownershipRegistry.ts`, `server/src/middlewares/ownershipEnforcement.ts`, `server/src/db/models/booking/appointment_selection_line.ts`
- **Client files to update (BLOCK_SHAPE_TYPES refs):** `client/src/utils/transformers/appointmentToWizardHelpers.ts`, `client/src/utils/booking/cascadeFilterPipeline.ts`, `client/src/utils/blockInstanceUtils.ts`, `client/src/utils/admin/calibrationChartTransforms.ts`, `client/src/types/transformers/bookingData.ts`, `client/src/composables/booking/useWizardFilteredOptions.ts`, `client/src/composables/booking/useDevPanelsComputed.ts`, `client/src/composables/admin/useSelectEnumOptions.ts`

## Approach

1. **Task 1 (migration + server model):** Author `.mjs` migration with three `ALTER TYPE ... RENAME VALUE` statements. Update `block_shape.ts` type union and `DataTypes.ENUM`. Update server files that reference old strings in block-type context (verify each hit is actually a block type, not a real-estate property reference).
2. **Task 2 (client constants + all client refs):** Rename `BLOCK_SHAPE_TYPES` keys (`PROPERTY`->`TIME`, `COUPON`->`PRICE`, `OPTION`->`EVENT`) and values. Update all client files that import or reference the old constants. Update `BlockShapeEntity` type if needed.
3. **Verify:** App starts, lint passes, no orphaned old strings in block-type context.

## Checkpoint

- After Task 1: server starts with new enum values; model file clean.
- After Task 2: client builds with new constants; no lint errors.
- Final: grep for `'property'`, `'coupon'`, `'option'` in block-type context returns zero hits (excluding real-estate `property` references like `property_details`, `propertyId`).

## Deliverables

- Migration file `20260432_000058_rename_block_shape_type_enum.mjs`
- Updated `server/src/db/models/admin/block_shape.ts`
- Updated `client/src/constants/blockShapeTypes.ts`
- Updated ~13 server + client files with old string references

---

## Task 20.1.1.1 (source: task-20.1.1.1-planning.md)

### Story

**This task changes** the PostgreSQL `block_shapes.type` enum values and the Sequelize model type declaration from `property`/`coupon`/`option` to `time`/`price`/`event`, plus updates all server files referencing those strings in block-type context, **because** the locked domain principles require the target vocabulary and all subsequent passes depend on it.

---

### Analysis

- **Problem / why now:** The DB enum and all code still use legacy type names (`property`/`coupon`/`option`). Every subsequent phase (API, admin, booking) depends on the canonical names being in place first.
- **Domain boundaries:** Server persistence (model + migration) and client constants/types. Some server middleware and repositories also reference the strings. No UI or route… _(truncated)_

### Goal

Author the PG enum rename migration and update all **server-side** references to old block shape type strings (`property`->`time`, `coupon`->`price`, `option`->`event`). This is the server half of the block shape type rename.

**Done for this task:** Migration file authored; `block_shape.ts` model updated; server files with block-type string references updated.

### Files

- **Migration (create):** `server/src/db/migrations/20260432_000058_rename_block_shape_type_enum.mjs`
- **Server model (modify):** `server/src/db/models/admin/block_shape.ts` -- type union + DataTypes.ENUM
- **Client constants (modify):** `client/src/constants/blockShapeTypes.ts` -- keys + values + exported type
- **Client types (modify):** `client/src/types/entities.ts` -- `BlockShapeEntity` type usage
- **Server files to update (block-type string refs):** `server/src/repositories/appointmentSelectionRepository.ts`, `server/src/repositories/appointmentSelectionCodec.ts`, `server/src/middlewares/ownershipRegistry.ts`, `server/src/middlewares/ownershipEnforcement.ts`, `server/src/db/models/booking/appointment_selection_line.ts`
- **Client files to update (BLOCK_SHAPE_TYPES refs):** `client/src/utils/transformers/appointmentToWizardHelpers.ts`, `client/src/utils/booking/cascadeFilterPipeline.ts`, `client/src/utils/blockInstanceUtils.ts`, `client/src/utils/admin/calibrationChartTransforms.ts`, `client/src/types/transformers/bookingData.ts`, `client/src/composables/booking/useWizardFilteredOptions.ts`, `client/src/composables/booking/useDevPanelsComputed.ts`, `client/src/composables/admin/useSelectEnumOptions.ts`

### Approach

1. **Task 1 (migration + server model):** Author `.mjs` migration with three `ALTER TYPE ... RENAME VALUE` statements. Update `block_shape.ts` type union and `DataTypes.ENUM`. Update server files that reference old strings in block-type context (verify each hit is actually a block type, not a real-estate property reference).
2. **Task 2 (client constants + all client refs):** Rename `BLOCK_SHAPE_TYPES` keys (`PROPERTY`->`TIME`, `COUPON`->`PRICE`, `OPTION`->`EVENT`) and values. Update all client files that import or reference the old constants. Update `BlockShapeEntity` type if needed.
3. **Verify:** App starts, lint passes, no orphaned old strings in block-type context.

### Checkpoint

- After Task 1: server starts with new enum values; model file clean.
- After Task 2: client builds with new constants; no lint errors.
- Final: grep for `'property'`, `'coupon'`, `'option'` in block-type context returns zero hits (excluding real-estate `property` references like `property_details`, `propertyId`).

### Deliverables

- `server/src/db/migrations/20260432_000058_rename_block_shape_type_enum.mjs`
- Updated `server/src/db/models/admin/block_shape.ts` (type union + ENUM)
- Updated server files (~5) with block-type string references

### Acceptance Criteria

- [ ] Migration renames `property`->`time`, `coupon`->`price`, `option`->`event` in the PG enum with idempotent guards.
- [ ] `block_shape.ts` model type is `'user' | 'service' | 'time' | 'event' | 'price'`.
- [ ] All server files verified: block-type `'property'`/`'coupon'`/`'option'` references updated; real-estate `property` references untouched.
- [ ] Server lint passes (`cd server && npm run lint`).

### Design

1. **Migration file** (`20260432_000058_rename_block_shape_type_enum.mjs`):
   - `up`: Three `ALTER TYPE "enum_block_shapes_type" RENAME VALUE 'property' TO 'time'` (repeat for coupon->price, option->event).
   - `down`: Reverse renames (time->property, price->coupon, event->option).
   - Idempotent: wrap in `DO $$ ... IF EXISTS ... $$ LANGUAGE plpgsql` or check `pg_enum` before rename.
2. **Model update** (`block_shape.ts`):
   - Line 23: `'user' | 'service' | 'time' | 'event' | 'price'`
   - Line 52: `DataTypes.ENUM('user', 'service', 'time', 'event', 'price')`
3. **Server file updates** (only block-type context references):
   - `appointmentSelectionRepository.ts` — update any `'property'`/`'coupon'`/`'option'` strings used as block type values.
   - `appointmentSelectionCodec.ts` — same.
   - `ownershipRegistry.ts` — same.
   - `ownershipEnforcement.ts` — same.
   - `appointment_selection_line.ts` — same.
   - **Skip** any `'property'` that refers to real-estate property (e.g. property_details, propertyId).

---

## Task 20.1.1.2 (source: task-20.1.1.2-planning.md)

### Story

**This task changes** client-side `BLOCK_SHAPE_TYPES` keys/values and every consumer so API-loaded `blockShape.type` matches the renamed PostgreSQL enum (`time`, `price`, `event`) **because** Task 20.1.1.1 already migrated the DB and server codecs; the Vue app must stop emitting or comparing legacy strings (`property`, `coupon`, `option`) for block shapes.

---

### Analysis

- **Problem / why now:** The DB enum and all code still use legacy type names (`property`/`coupon`/`option`). Every subsequent phase (API, admin, booking) depends on the canonical names being in place first.
- **Domain boundaries:** Server persistence (model + migration) and client constants/types. Some server middleware and repositories also reference the strings. No UI or route… _(truncated)_

### Goal

**Client half only:** Update `client/src/constants/blockShapeTypes.ts` and every file that references `BLOCK_SHAPE_TYPES` or `BlockShapeType` so the app matches server/DB block shape types (`time`, `price`, `event`). **Prerequisite:** Task 20.1.1.1 merged/applied on environments that run the app against migrated DB.

**Done for this task:** Constants + types + listed consumers updated; `cd client && npm run lint` passes; app starts; no block-type comparisons using legacy enum strings.

### Files

- **Constants (modify):** `client/src/constants/blockShapeTypes.ts`
- **Types (modify):** `client/src/types/entities.ts` — comment / `BlockShapeEntity.type` semantics
- **Composables:** `client/src/composables/booking/useWizardFilteredOptions.ts`, `client/src/composables/admin/useSelectEnumOptions.ts`
- **Transformers:** `client/src/utils/transformers/appointmentToWizardTransformer.ts`, `client/src/utils/transformers/appointmentToWizardHelpers.ts` (verify `keyof typeof` after const change)
- **Utils / types (import-only or comparisons):** `client/src/utils/booking/cascadeFilterPipeline.ts`, `client/src/utils/blockInstanceUtils.ts`, `client/src/types/transformers/bookingData.ts`, `client/src/utils/admin/calibrationChartTransforms.ts`, `client/src/utils/admin/eligibleUserRoleAlignmentBlockInstances.ts`
- **Optional verify:** `client/src/composables/booking/useDevPanelsComputed.ts` (SERVICE only — likely unchanged)

### Approach

1. Edit `BLOCK_SHAPE_TYPES`: `PROPERTY`→`TIME` (`'time'`), `COUPON`→`PRICE` (`'price'`), `OPTION`→`EVENT` (`'event'`).
2. Replace all `BLOCK_SHAPE_TYPES.PROPERTY|COUPON|OPTION` usages with new names; update admin **titles** to Time / Price / Event.
3. In `appointmentToWizardTransformer.resolveBlockCategories`, update `blockShapeType` literals: `'PROPERTY'`→`'TIME'`, `'OPTION'`→`'EVENT'` (service block stays `'SERVICE'`; no coupon category in this resolver).
4. Run `npm run lint` in `client/`; fix any TS errors from renamed keys.
5. Grep `client/src` for block-shape legacy strings in **type** context; exclude unrelated `property` domains.

### Checkpoint

- Typecheck/lint clean for `client/`.
- Spot-check: wizard filtered options and admin block-shape type select still resolve shapes from global data.
- Final grep: no `BLOCK_SHAPE_TYPES.PROPERTY` / `.OPTION` / `.COUPON` left; no `=== 'property'` against `shape.type` for block shapes.

### Deliverables

- Updated `blockShapeTypes.ts` with `TIME`/`PRICE`/`EVENT` and wire string values.
- Updated consumer files (list above); `entities.ts` comment accurate.
- Lint passing; no behavioral regression in block-shape filtering (manual smoke: admin shapes + booking wizard if available).

### Acceptance Criteria

- [ ] `BLOCK_SHAPE_TYPES` uses keys `TIME`, `PRICE`, `EVENT` with values `time`, `price`, `event`; `USER` and `SERVICE` unchanged.
- [ ] `BlockShapeEntity.type` / `BlockShapeType` reflect new vocabulary; JSDoc/comment in `entities.ts` updated.
- [ ] All listed client files compile; no stale `PROPERTY`/`COUPON`/`OPTION` enum key references for block shapes.
- [ ] `cd client && npm run lint` passes.
- [ ] Spot grep: no accidental edit of real-estate-only strings (`property_details`, ownership `property` resource names on server — out of scope).

### Design

Rename const keys to **`TIME`**, **`PRICE`**, **`EVENT`** with string values **`time`**, **`price`**, **`event`** (parallel to existing `USER`/`SERVICE`). Update imports/usages; admin select labels → **Time**, **Price**, **Event** (or match product copy in phase guide). `appointmentToWizardTransformer` passes updated key literals (`'TIME'`, `'EVENT'`, `'PRICE'` as applicable). `entities.ts` comment documents the new union.

---
