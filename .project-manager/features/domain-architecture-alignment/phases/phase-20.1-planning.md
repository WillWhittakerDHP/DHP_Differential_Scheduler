<!-- harness-planning-rollup tier=phase id=20.1 consolidatedAt=2026-04-02T16:35:47.963Z -->

# Consolidated planning: phase 20.1

## Phase 20.1 (parent)

## Story

**As a** platform maintainer, **I want** the database schema and Sequelize models to match the locked domain principles (block type renames, instance-level three-property model, event placement columns, event-instance ownership, legacy column removal), **so that** all subsequent passes (API, admin, booking pipeline, migration) operate against the target schema rather than working around legacy structures.
**Estimated size:** L

---

## Analysis

- **Problem / why now:** The DB schema still carries legacy type names (`property`/`coupon`/`option`), shape-level booleans that should be instance-level (`composable` on shapes; no `orchestrator`/`wizardVisible` on instances), differential-role storage on event shapes instead of placement data, and missing event-instance ownership (`parent_block_instance_id`). Every subsequent pass (API, admin, booking) depends on the schema matching the locked principles first.
- **Domain boundaries:** Primarily **server persistence** (models + migrations) and **shared type contracts**. Client constants and entity types (`blockShapeTypes.ts`, `entities.ts`) need to stay in sync but this phase does not rewrite booking logic or admin UI — those are 20.3–20.4.
- **Grounding:** Recon confirmed all legacy columns exist, all target columns are missing, and migration pattern is `.mjs` with raw SQL + idempotent guards.
- **Patterns:** Migrations use `queryInterface.sequelize.query(...)` with `IF EXISTS` / `IF NOT EXISTS`. Enum changes use `ALTER TYPE ... RENAME VALUE` (see migration 000056). Model files use `Model.init(...)` with `DataTypes`. Follow these existing patterns.
- **Risks:** (1) Enum rename in PostgreSQL (`ALTER TYPE ... RENAME VALUE`) requires PG ≥10 and must rename one value at a time. (2) Dropping columns that have FK or validation references requires ordering (drop validate first, then column). (3) `event_shape_attendees` rename to `event_instance_attendees` also requires FK updates. (4) `DB_HOST` migration policy — author migration files only; do not run on shared DB from this machine.
- **Open questions:** Whether `active_part.ts` duplicate factory needs cleanup (deferred — not blocking schema work). Whether any server-side Joi validators hard-code the old enum values (verify in session tasks).
- **Alternatives:** Single mega-migration vs. multiple focused migrations. Chose **multiple focused migrations** (one per logical group: type rename, instance properties, event shape/instance) for clarity and safer rollback.

## Goal

Align the **database schema** (PostgreSQL + Sequelize models) and **client/shared type constants** with the locked domain principles per **FEATURE_20_ARCHITECTURE_REDESIGN.md §2** and **§8.1** acceptance checks:
- Block shape type enum uses `time` / `price` / `event` (not `property` / `coupon` / `option`).
- `block_instances` carries all three booleans: `composite`, `orchestrator`, `wizardVisible`.
- Legacy shape-level booleans (`composable`, `isStateControl`, `canHaveParts`) and instance-level drift columns (`bookingMode`, `differential`, `differentialEventRoleOverrides`) removed.
- `event_shapes` has `placement_kind` + `anchor_edge` instead of `differential_role`; calendar toggles moved to `event_instances`.
- `event_instances` owns `parent_block_instance_id` and location fields.
- `event_shape_attendees` renamed to `event_instance_attendees`.

**Done for this phase:** Migrations authored (and run on localhost if applicable); Sequelize models updated; client constants and entity types updated; app starts and lint passes.

## Files

- **Canonical (read-only references):** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§1, §2, §8.1), `.project-manager/ARCHITECTURE.md` (§8–§14)
- **Harness / PM:** `phases/phase-20.1-guide.md`, this planning doc, feature handoff/log
- **Server models (modify):** `server/src/db/models/admin/block_shape.ts`, `server/src/db/models/booking/block_instance.ts`, `server/src/db/models/booking/event_shape.ts`, `server/src/db/models/booking/event_instance.ts`, `server/src/db/models/booking/event_shape_attendee.ts` → rename model, `server/src/db/models/index.ts` (factory registration), `server/src/db/models/sequelizeModelAssociationsPartA.ts` (FK wiring)
- **Migrations (create):** `server/src/db/migrations/` — new `.mjs` files following existing pattern
- **Client constants/types (modify):** `client/src/constants/blockShapeTypes.ts`, `client/src/types/entities.ts`
- **Shared types (verify/modify if enum is shared):** `shared/` — grep for block type strings
- **Server validators (verify):** Joi schemas in `server/src/routes/internal/entities/` that enforce old enum values

## Approach

1. **Three focused sessions** -- one per logical schema group: (1) block shape type rename, (2) block instance three-property + legacy cleanup, (3) event shape/instance columns + attendee rename.
2. **Each session** authors migration(s), updates Sequelize model(s), updates client constants/types as needed, verifies app starts and lint passes.
3. **Migration file convention:** `.mjs`, raw SQL via `queryInterface.sequelize.query(...)`, idempotent `IF EXISTS`/`IF NOT EXISTS` guards, JSDoc "why" header -- matching existing pattern (e.g. migration 000056).
4. **Enum renames** use `ALTER TYPE ... RENAME VALUE` one value at a time (PG >=10 compatible).
5. **Column drops** preceded by removing FK constraints or validate hooks that reference them.
6. **Client type sync** happens in the same session as the model change so the app can build; avoid mismatched TS types across sessions.
7. **DB_HOST policy:** Author files; run only if `DB_HOST` is localhost/127.0.0.1.
8. **No API/admin/booking logic changes** -- this phase is schema + models + constants only. Route handlers and UI that consume these models adapt in **20.2--20.4**.

## Checkpoint

- Before accepting this plan: confirm the **three-session decomposition** covers all §8.1 acceptance checks and §2 model changes.
- At each **session start/end**: run **FEATURE_20_ARCHITECTURE_REDESIGN §9.1** drift checklist and cross-check **§9.1a** vs **ARCHITECTURE_PRINCIPLES §8** (per feature guide).
- After all three sessions: verify `block_instances` has `composite`, `orchestrator`, `wizardVisible`; `block_shapes.type` uses `time`/`price`/`event`; event routing remains relational; app builds and starts.

## Deliverables

- **Migrations (authored):** ~3-5 `.mjs` migration files covering type rename, instance property add/legacy drop, event schema changes, attendee table rename.
- **Sequelize models (updated):** `block_shape.ts`, `block_instance.ts`, `event_shape.ts`, `event_instance.ts`, `event_shape_attendee.ts` -> `event_instance_attendee.ts`; updated associations.
- **Client constants/types (updated):** `blockShapeTypes.ts` (rename keys + values), `entities.ts` (`BlockInstanceEntity`, `BlockShapeEntity`, `EventShapeEntity`).
- **Seed data (if applicable):** Default placement type rows per plan §2.2.

## Acceptance Criteria

- [ ] `block_shapes.type` enum uses `user`, `service`, `time`, `price`, `event` -- no `property`/`coupon`/`option`.
- [ ] `block_instances` has `composite` (bool), `orchestrator` (bool), `wizardVisible` (bool) -- no `orchestrator -> composite` implication.
- [ ] Legacy columns dropped: `block_shapes.composable`, `block_shapes.isStateControl`, `block_shapes.canHaveParts`; `block_instances.bookingMode`, `block_instances.differential`, `block_instances.differentialEventRoleOverrides`.
- [ ] `event_shapes` has `placement_kind` + `anchor_edge`; `differential_role` dropped; `include_reschedule_link`/`include_cancel_link` moved to `event_instances`.
- [ ] `event_instances` has `parent_block_instance_id` and location fields (`location_type`, `location_place_id`, `location_address`, `location_lat`, `location_lng`).
- [ ] `event_shape_attendees` renamed to `event_instance_attendees` with FK pointing to `event_instances`.
- [ ] Event routing still modeled through `event_assignments` -- no scalar event columns added to part instances.
- [ ] Sequelize models match the migrated schema; client types and constants updated.
- [ ] App starts (`npm run start:dev`) and lint passes.

---

## Session 20.1.1 (source: session-20.1.1-planning.md)

### Story

**This session delivers** the block shape type enum rename (`property`->`time`, `coupon`->`price`, `option`->`event`) in PostgreSQL, the Sequelize model, and all client/server code that references those strings, **so that** subsequent sessions and passes operate on the target vocabulary without carrying legacy type names.
**Estimated size:** M

---

### Analysis

- **Problem / why now:** The DB enum and all code still use legacy type names (`property`/`coupon`/`option`). Every subsequent phase (API, admin, booking) depends on the canonical names being in place first.
- **Domain boundaries:** Server persistence (model + migration) and client constants/types. Some server middleware and repositories also reference the strings. No UI or route handler logic changes in this session.
- **Grounding:** Recon confirmed 1 server model, 1 client constants file, ~7 server files, and ~8 client files reference the old strings. No Joi validators in entity routes need updating.
- **Patterns:** Use `ALTER TYPE ... RENAME VALUE` for PG enum (one per rename). Update TS type unions and constants in the same task so the app builds.
- **Risks:** (1) `'property'` appears in non-block-type contexts (real-estate property, property_details) -- must not rename those. (2) String literals in server code may be used in SQL queries or switch statements -- verify each before changing.
- **Alternatives:** None meaningful -- the rename is prescribed by the implementation plan.

### Goal

Rename the `block_shapes.type` PostgreSQL enum values from `property`/`coupon`/`option` to `time`/`price`/`event` (per plan §1.1, §2.1). Update the Sequelize model type union, the client `BLOCK_SHAPE_TYPES` constants, and all server/client code that switches on or references the old strings in block-type context.

**Done for this session:** Migration authored; `block_shape.ts` model uses `time`/`price`/`event`; `blockShapeTypes.ts` uses `TIME`/`PRICE`/`EVENT` keys; all referencing files updated; app starts and lint passes.

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

- Migration file `20260432_000058_rename_block_shape_type_enum.mjs`
- Updated `server/src/db/models/admin/block_shape.ts`
- Updated `client/src/constants/blockShapeTypes.ts`
- Updated ~13 server + client files with old string references

---

---

## Session 20.1.2 (source: session-20.1.2-planning.md)

### Story

**This session delivers** block-instance three-property schema alignment and block-shape legacy cleanup across migrations, Sequelize models, and directly impacted type/validation consumers **so that** later passes can treat `block_instances` as the home of `composite` / `orchestrator` / `wizardVisible` without carrying legacy shape booleans or stale instance fields.
**Estimated size:** M

---

### Analysis

- **Problem / why now:** Session 20.1.1 renamed the type vocabulary; the next locked architecture rule is that the three orthogonal properties live on `block_instances`, not `block_shapes`. Current models and client types still encode the old split, so later event/admin passes would build on the wrong shape.
- **Domain boundaries:** Server persistence (`db/models`, migrations) plus client-only entity types and direct consumers in admin/booking flows. No new shared types are needed; this remains local to `server/` and `client/src/types`.
- **Grounding in code:** `block_instance.ts` and `client/src/types/entities.ts` prove the old instance fields are still modeled. `block_shape.ts`, `entityCrudRouter.ts`, and `relationshipHelpersValidation.ts` prove runtime code still assumes shape-level booleans are authoritative.
- **Patterns to follow:** Keep migrations idempotent (`IF EXISTS` / `DROP COLUMN IF EXISTS`) and pair model/type changes in the same task. Prefer narrow targeted cleanup around direct field references instead of broad refactors.
- **Risks / open questions:** The biggest risk is **runtime behavior**, not lint. Removing `isStateControl` / `composable` from the model without replacing their call sites will break attendee validation, user-role alignment, and component relationship rules. We should explicitly capture that in task scope instead of pretending this is “models only.”
- **Alternatives considered:** Doing one giant task for all model + consumer cleanup would blur risk and make recovery harder. Splitting by entity family (`block_instances` first, `block_shapes` second) gives cleaner checkpoints.

### Goal

Align **block instance** and **block shape** storage with the locked three-property model for this session only:
- `block_instances` owns `composite`, `orchestrator`, `wizardVisible`.
- Remove legacy instance columns `bookingMode`, `differential`, `differentialEventRoleOverrides`.
- Remove legacy shape booleans `composable`, `isStateControl`, `canHaveParts`.
- Update Sequelize models, client entity types, and direct runtime references that would break once those columns disappear.

**Done for this session:** Migration(s) authored; `BlockInstance` / `BlockShape` Sequelize models updated; `BlockInstanceEntity` / `BlockShapeEntity` updated; direct legacy field references addressed enough for app start + lint to pass.

### Files

- **Canonical (read-only references):** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§1, §2, §8.1), `.project-manager/ARCHITECTURE.md` (§8–§14)
- **Harness / PM:** `phases/phase-20.1-guide.md`, this planning doc, feature handoff/log
- **Migration(s) (create):** `server/src/db/migrations/` — add `orchestrator`, `wizard_visible`; drop legacy columns from `block_instances` / `block_shapes`
- **Server models (modify):** `server/src/db/models/booking/block_instance.ts`, `server/src/db/models/admin/block_shape.ts`
- **Server direct consumers (verify/update as needed):** `server/src/routes/internal/entities/entityCrudRouter.ts`, `server/src/routes/internal/relationships/relationshipHelpersValidation.ts`, `server/src/utils/validateUserRoleBlockAlignmentPayload.ts`, `server/src/utils/userTypeMapping.ts`, `server/src/repositories/stateControlUserTypeBlockInstanceIds.ts`, `server/src/repositories/availabilityDifferentialAttendeeCleanup.ts`
- **Client types / direct consumers (modify):** `client/src/types/entities.ts`, plus any direct references revealed by grep (initially `client/src/utils/eventAttendeeUtils.ts`, `client/src/utils/admin/eligibleUserRoleAlignmentBlockInstances.ts`, booking consumers of `differentialEventRoleOverrides`)
- **Out of scope for this session:** event schema / attendee table rename files (`event_shape`, `event_instance`, attendee model rename) — session 20.1.3

### Approach

1. **Task 20.1.2.1:** Handle `block_instances` storage: author migration for `orchestrator` + `wizard_visible`, drop `bookingMode`, `differential`, `differentialEventRoleOverrides`, update `block_instance.ts`, `BlockInstanceEntity`, and any direct booking/client consumers that must compile once those fields are gone.
2. **Task 20.1.2.2:** Handle `block_shapes` cleanup: drop `composable`, `isStateControl`, `canHaveParts`, remove model validate hook, update `BlockShapeEntity`, and re-home or remove direct runtime checks that still depend on those booleans.
3. **Migration pattern:** `.mjs` raw SQL with JSDoc header + idempotent guards. If runtime code still reads a field, update that code in the same task before considering the drop complete.
4. **Verification:** run `cd server && npm run lint`, `cd client && npm run lint`, and app start check after both tasks. Grep for removed field names in touched domains before `session-end`.
5. **DB_HOST policy:** author files here; only execute migrations locally if DB host is `localhost` / `127.0.0.1`.

### Checkpoint

- After Task 20.1.2.1: `block_instances` model + client type compile with `orchestrator` / `wizardVisible`; removed instance fields no longer block build.
- After Task 20.1.2.2: no `BlockShape` model fields or direct client/server checks depend on `composable` / `isStateControl` / `canHaveParts`.
- Final session checkpoint: app starts; client + server lint pass; grep confirms removed field names are only present in intentional non-domain strings / archived docs.

### Deliverables

- Migration file(s) for `block_instances` / `block_shapes` column alignment
- Updated `server/src/db/models/booking/block_instance.ts`
- Updated `server/src/db/models/admin/block_shape.ts`
- Updated `client/src/types/entities.ts`
- Focused cleanup of direct runtime references to removed fields in server/client call sites

### Acceptance Criteria

- [ ] Migration(s) add `orchestrator` and `wizard_visible` to `block_instances` with safe defaults, and drop `bookingMode`, `differential`, `differentialEventRoleOverrides`.
- [ ] Migration(s) drop `composable`, `is_state_control`, and `can_have_parts` from `block_shapes`.
- [ ] `server/src/db/models/booking/block_instance.ts` and `client/src/types/entities.ts` reflect the new block-instance shape.
- [ ] `server/src/db/models/admin/block_shape.ts` and `client/src/types/entities.ts` no longer expose the removed block-shape booleans.
- [ ] Direct runtime references to removed fields are either updated to the new source of truth or removed so `cd server && npm run lint` and `cd client && npm run lint` pass.
- [ ] Coverage check: these two tasks are enough to enact the session goal without spilling event-shape work into 20.1.2.

---

---

## Session 20.1.3 (source: session-20.1.3-planning.md)

### Story

**This session delivers** PostgreSQL + Sequelize + client entity alignment for **event placement types** (shapes) and **named segments** (instances), including **attendee rows keyed to segments**, **so that** phase 20.2+ UI and booking logic can rely on Principles §5.1 / §5.3 / §5.4 without fighting legacy `differential_role` and shape-level invite toggles.
**Estimated size:** M (two tasks; data migration + relationship rewiring).

---

### Analysis

- **Problem / why now:** Sessions 20.1.1–20.1.2 aligned block shapes and instances; event modeling still encodes placement as `differential_role` and hangs calendar toggles on the shape. Principles §5.1–§5.4 require **placement types** on shapes and **named segments** (instances) with **per-segment** toggles and attendees — this session applies the DDL + model/type layer so later phases can simplify UI and PartFinalizer without another breaking migration.
- **Domain boundaries:** Touches **booking** (event shapes/instances, attendees), **admin** (relationship UI, shapes tab), **internal API** (sanitizers, relationship validation, transformers). Shared enums for placement may land in `client/src/types` or `shared/` per existing patterns — confirm in task 20.1.3.1.
- **Child-tier patterns:** Follow existing migration style (`.mjs`, idempotent SQL, JSDoc rationale). Keep Sequelize `init()` / associations in sync with `sequelizeModelAssociationsPartA` and `config/app.js` exports. Client: update `GlobalEntityKey` paths, transformers, and relationship `backendName` in lockstep with server table rename.
- **Risks:** Attendee table rename + FK change is **breaking** for any raw SQL or external tools; relationship validation must require **event instance** parent. **PartFinalizer** logic must be rewritten from `differentialRole` to `placement_kind` / `anchor_edge` (or explicit ordering rules) — scope in 20.1.3.2 with tests deferred per project policy.
- **Alternatives:** Single mega-task (DDL + all consumers) vs **two tasks** (DDL/models/types/seeds first, then relationships + booking utils + admin wiring) — chosen split below for reviewable commits and smaller failure surface.

### Goal

For **session 20.1.3 only** (phase 20.1 checklist items that remain for events):
- `event_shapes`: add **`placement_kind`**, **`anchor_edge`**; remove **`differential_role`**, **`include_reschedule_link`**, **`include_cancel_link`** (after data copied to instances where required).
- `event_instances`: add **`parent_block_instance_id`**, **location** fields per FEATURE_20 §2.3, and **`include_reschedule_link`**, **`include_cancel_link`** (per-segment).
- Rename **`event_shape_attendees` → `event_instance_attendees`** with FK to **`event_instance_id`** (model file rename, associations, registry).
- Seed **default placement type** rows per FEATURE_20 §2.2 (if still specified as DB seed vs enum-only — implement per locked doc).
- Update **Sequelize models**, **client entity types**, **transformers/sanitizers**, **relationship constants + validation**, and **direct consumers** (`partFinalizer`, `eventAttendeeUtils`, shapes-tab composables) so the app **starts** and **lint passes**.

**Out of scope for 20.1.3:** Full UX polish for segment pickers, public booking wizard copy, and deep route refactors beyond what is required to compile and preserve behavior.

### Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§2.2–§2.4, §5, §8.1 event bullets), `ARCHITECTURE_PRINCIPLES.md`, `.project-manager/ARCHITECTURE.md`, `phases/phase-20.1-guide.md`
- **Migrations (create):** `server/src/db/migrations/*.mjs` — event shape/instance columns; attendee table rename + FK; optional backfill steps; placement seeds
- **Server models:** `event_shape.ts`, `event_instance.ts`, `event_shape_attendee.ts` → `event_instance_attendee.ts` (table `event_instance_attendees`), `index.ts`, `sequelizeModelAssociationsPartA.ts`, `config/app.js`
- **Server routes/utils:** `entitySanitizers.ts`, `relationshipConstants.ts`, `relationshipCrudRouter` / handlers if table names appear, `relationshipHelpersValidation.ts`, internal entity Joi if event fields validated
- **Client:** `client/src/types/entities.ts`, `entityTransformers.ts`, `apiEntityFieldNormalization.ts`, `constants/relationships.ts`, `partFinalizer.ts`, `eventAttendeeUtils.ts`, `useShapesTabEventPanel.ts`, `ShapesTabEventPanel.vue`, `useEntityCardFormSetup.ts`, any grep hits for `differentialRole`, `event_shape_attendees`, `EventShapeAttendee`

### Approach

1. **Task 20.1.3.1:** Author migration(s): add new enums/columns; backfill `include_*` from shapes to all related `event_instances` (or documented rule); add instance location + `parent_block_instance_id`; drop removed shape columns; rename attendee table and column FKs; insert placement seeds; update `EventShape` / `EventInstance` / attendee Sequelize models + `index.ts` / associations / `app.js` exports; update client `EventShapeEntity` / `EventInstanceEntity` and field normalization/transformers (relationship registry and `partFinalizer` follow in 20.1.3.2).
2. **Task 20.1.3.2:** Complete **attendee relationship** rename: `RELATIONSHIP_REGISTRY` parent `eventInstance`, new Sequelize model name, `client/src/constants/relationships.ts` `backendName`, `validateAttendeeAssignmentEntities`, admin relationship UI labels if hard-coded; replace **`differentialRole`** usage in **`partFinalizer`** / **`eventAttendeeUtils`** and admin shapes tab with **`placement_kind` / `anchor_edge`** (or interim ordering helper); verify **event routing** still flows through `event_assignments` only (no scalar event fields on part instances).
3. **Verification:** `npm run start:dev`; `cd client && npm run lint`; `cd server && npm run lint`. Migrations: author always; **run** only when `DB_HOST` is localhost/127.0.0.1 per project policy.

### Checkpoint

- After 20.1.3.1: DB schema + core models + client types reflect new columns; no references to dropped shape columns in models (consumers may be temporarily broken until 20.1.3.2 — prefer completing both tasks in one session push if policy allows).
- After 20.1.3.2: No `differentialRole` on event shapes in TS; attendees keyed to instances; relationship admin path works for create/list/delete; phase-20.1 event bullets in `phase-20.1-guide.md` can be checked.

### Deliverables

- [ ] One or more migrations under `server/src/db/migrations/` for event DDL + attendee rename + seeds
- [ ] Updated Sequelize models, associations, and `config/app.js` model exports
- [ ] Updated client entity types, transformers, relationship `backendName`, sanitizers
- [ ] `partFinalizer` / `eventAttendeeUtils` / admin event UI aligned with placement model
- [ ] Session guide tasks 20.1.3.1 / 20.1.3.2 filled to mirror Implementation Orders
- [ ] App start + client/server lint clean

---

---
