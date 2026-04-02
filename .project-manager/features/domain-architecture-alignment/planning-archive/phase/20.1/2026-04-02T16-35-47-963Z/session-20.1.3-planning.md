<!-- harness-planning-rollup tier=session id=20.1.3 consolidatedAt=2026-04-02T16:33:15.278Z -->

# Consolidated planning: session 20.1.3

## Session 20.1.3 (parent)

## Story

**This session delivers** PostgreSQL + Sequelize + client entity alignment for **event placement types** (shapes) and **named segments** (instances), including **attendee rows keyed to segments**, **so that** phase 20.2+ UI and booking logic can rely on Principles §5.1 / §5.3 / §5.4 without fighting legacy `differential_role` and shape-level invite toggles.
**Estimated size:** M (two tasks; data migration + relationship rewiring).

---

## Analysis

- **Problem / why now:** Sessions 20.1.1–20.1.2 aligned block shapes and instances; event modeling still encodes placement as `differential_role` and hangs calendar toggles on the shape. Principles §5.1–§5.4 require **placement types** on shapes and **named segments** (instances) with **per-segment** toggles and attendees — this session applies the DDL + model/type layer so later phases can simplify UI and PartFinalizer without another breaking migration.
- **Domain boundaries:** Touches **booking** (event shapes/instances, attendees), **admin** (relationship UI, shapes tab), **internal API** (sanitizers, relationship validation, transformers). Shared enums for placement may land in `client/src/types` or `shared/` per existing patterns — confirm in task 20.1.3.1.
- **Child-tier patterns:** Follow existing migration style (`.mjs`, idempotent SQL, JSDoc rationale). Keep Sequelize `init()` / associations in sync with `sequelizeModelAssociationsPartA` and `config/app.js` exports. Client: update `GlobalEntityKey` paths, transformers, and relationship `backendName` in lockstep with server table rename.
- **Risks:** Attendee table rename + FK change is **breaking** for any raw SQL or external tools; relationship validation must require **event instance** parent. **PartFinalizer** logic must be rewritten from `differentialRole` to `placement_kind` / `anchor_edge` (or explicit ordering rules) — scope in 20.1.3.2 with tests deferred per project policy.
- **Alternatives:** Single mega-task (DDL + all consumers) vs **two tasks** (DDL/models/types/seeds first, then relationships + booking utils + admin wiring) — chosen split below for reviewable commits and smaller failure surface.

## Goal

For **session 20.1.3 only** (phase 20.1 checklist items that remain for events):
- `event_shapes`: add **`placement_kind`**, **`anchor_edge`**; remove **`differential_role`**, **`include_reschedule_link`**, **`include_cancel_link`** (after data copied to instances where required).
- `event_instances`: add **`parent_block_instance_id`**, **location** fields per FEATURE_20 §2.3, and **`include_reschedule_link`**, **`include_cancel_link`** (per-segment).
- Rename **`event_shape_attendees` → `event_instance_attendees`** with FK to **`event_instance_id`** (model file rename, associations, registry).
- Seed **default placement type** rows per FEATURE_20 §2.2 (if still specified as DB seed vs enum-only — implement per locked doc).
- Update **Sequelize models**, **client entity types**, **transformers/sanitizers**, **relationship constants + validation**, and **direct consumers** (`partFinalizer`, `eventAttendeeUtils`, shapes-tab composables) so the app **starts** and **lint passes**.

**Out of scope for 20.1.3:** Full UX polish for segment pickers, public booking wizard copy, and deep route refactors beyond what is required to compile and preserve behavior.

## Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§2.2–§2.4, §5, §8.1 event bullets), `ARCHITECTURE_PRINCIPLES.md`, `.project-manager/ARCHITECTURE.md`, `phases/phase-20.1-guide.md`
- **Migrations (create):** `server/src/db/migrations/*.mjs` — event shape/instance columns; attendee table rename + FK; optional backfill steps; placement seeds
- **Server models:** `event_shape.ts`, `event_instance.ts`, `event_shape_attendee.ts` → `event_instance_attendee.ts` (table `event_instance_attendees`), `index.ts`, `sequelizeModelAssociationsPartA.ts`, `config/app.js`
- **Server routes/utils:** `entitySanitizers.ts`, `relationshipConstants.ts`, `relationshipCrudRouter` / handlers if table names appear, `relationshipHelpersValidation.ts`, internal entity Joi if event fields validated
- **Client:** `client/src/types/entities.ts`, `entityTransformers.ts`, `apiEntityFieldNormalization.ts`, `constants/relationships.ts`, `partFinalizer.ts`, `eventAttendeeUtils.ts`, `useShapesTabEventPanel.ts`, `ShapesTabEventPanel.vue`, `useEntityCardFormSetup.ts`, any grep hits for `differentialRole`, `event_shape_attendees`, `EventShapeAttendee`

## Approach

1. **Task 20.1.3.1:** Author migration(s): add new enums/columns; backfill `include_*` from shapes to all related `event_instances` (or documented rule); add instance location + `parent_block_instance_id`; drop removed shape columns; rename attendee table and column FKs; insert placement seeds; update `EventShape` / `EventInstance` / attendee Sequelize models + `index.ts` / associations / `app.js` exports; update client `EventShapeEntity` / `EventInstanceEntity` and field normalization/transformers (relationship registry and `partFinalizer` follow in 20.1.3.2).
2. **Task 20.1.3.2:** Complete **attendee relationship** rename: `RELATIONSHIP_REGISTRY` parent `eventInstance`, new Sequelize model name, `client/src/constants/relationships.ts` `backendName`, `validateAttendeeAssignmentEntities`, admin relationship UI labels if hard-coded; replace **`differentialRole`** usage in **`partFinalizer`** / **`eventAttendeeUtils`** and admin shapes tab with **`placement_kind` / `anchor_edge`** (or interim ordering helper); verify **event routing** still flows through `event_assignments` only (no scalar event fields on part instances).
3. **Verification:** `npm run start:dev`; `cd client && npm run lint`; `cd server && npm run lint`. Migrations: author always; **run** only when `DB_HOST` is localhost/127.0.0.1 per project policy.

## Checkpoint

- After 20.1.3.1: DB schema + core models + client types reflect new columns; no references to dropped shape columns in models (consumers may be temporarily broken until 20.1.3.2 — prefer completing both tasks in one session push if policy allows).
- After 20.1.3.2: No `differentialRole` on event shapes in TS; attendees keyed to instances; relationship admin path works for create/list/delete; phase-20.1 event bullets in `phase-20.1-guide.md` can be checked.

## Deliverables

- [ ] One or more migrations under `server/src/db/migrations/` for event DDL + attendee rename + seeds
- [ ] Updated Sequelize models, associations, and `config/app.js` model exports
- [ ] Updated client entity types, transformers, relationship `backendName`, sanitizers
- [ ] `partFinalizer` / `eventAttendeeUtils` / admin event UI aligned with placement model
- [ ] Session guide tasks 20.1.3.1 / 20.1.3.2 filled to mirror Implementation Orders
- [ ] App start + client/server lint clean

---

## Task 20.1.3.1 (source: task-20.1.3.1-planning.md)

### Story

**This task changes** PostgreSQL event tables, Sequelize models, and client entity/transform layers **because** Feature 20 §2.2–§2.4 require placement types on `event_shapes`, segment ownership and per-segment calendar toggles on `event_instances`, and attendee rows keyed to segments (`event_instance_attendees`).

---

### Analysis

- **Problem / why now:** Sessions 20.1.1–20.1.2 aligned block shapes and instances; event modeling still encodes placement as `differential_role` and hangs calendar toggles on the shape. Principles §5.1–§5.4 require **placement types** on shapes and **named segments** (instances) with **per-segment** toggles and attendees — this session applies the DDL + model/type layer so later… _(truncated)_

### Goal

- One migration implements §2.2–§2.4 DDL + data moves + attendee rename + seeds.
- Sequelize + `app.ts` + associations + relationship mapping/validation + invite helpers use new tables/columns.
- Client entity types, transformers, normalization, `RELATIONSHIP_KEYS.attendeeAssignments`, fetch resolver `eventInstanceId`, merge attendees, `useShapesTab` defaults, `eventShapeDisplays` for placement fields.
- `differentialRole` on `EventShapeEntity` remains as **derived** from placement for booking math until task 20.1.3.2 removes it.

### Files

- `server/src/db/migrations/20260432_000061_event_schema_placement_instance_attendees.mjs` (new)
- `server/src/db/models/booking/event_shape.ts`, `event_instance.ts`, `event_instance_attendee.ts` (new; delete `event_shape_attendee.ts`)
- `server/src/db/models/index.ts`, `sequelizeModelAssociationsPartA.ts`, `sequelizeModelsBag.ts`, `sequelizeModelAssociationsPartB.ts`
- `server/src/config/app.ts`, `relationshipConstants.ts`, `relationshipHelpersMapping.ts`, `relationshipHelpersValidation.ts`
- `server/src/routes/internal/entities/entitySanitizers.ts`, `entityConstants.ts` (field names if needed)
- `server/src/services/invites/*` (attendee + strip links + orchestration query)
- `shared/utils/eventPlacementUtils.ts` (new)
- `client/...` as listed in recon

### Approach

1. Author migration (idempotent guards).
2. Replace Sequelize attendee model; wire associations and exports.
3. Update server invite + relationship + sanitizer paths.
4. Add shared placement helpers; update client types + transformers + merge + constants + displays + shapes tab defaults.
5. `npm run lint` in `client` and `server`.

### Checkpoint

- Migration file committed; models load; TypeScript compiles for touched packages; lint clean.

### Deliverables

- [ ] Migration `000061` under `server/src/db/migrations/`
- [ ] Sequelize + relationship + invite code updated
- [ ] Client types/transformers/relationships/merge updated
- [ ] Client + server lint pass

### Acceptance Criteria

- [ ] `event_shapes` has `placement_kind` + `anchor_edge`; legacy shape columns removed in migration.
- [ ] `event_instances` has ownership, location, per-segment invite toggles.
- [ ] Table `event_instance_attendees` with `event_instance_id` FK; admin relationship parent is event instance.
- [ ] Default placement seed rows inserted per FEATURE_20 §2.2 names.
- [ ] App builds (client + server) and lint passes without new tests (testing suspended).

### Design

1. **Migration:** Add instance columns + backfill from shapes and `event_assignments`; add `placement_kind` / `anchor_edge` with CHECK; map `differential_role` → placement; migrate attendee rows to `event_instance_id`; rename table; drop legacy shape columns; insert default placement seed rows (ON CONFLICT by name).
2. **ORM:** `EventInstanceAttendee` model; associations `EventInstance` ↔ `EventInstanceAttendee` ↔ `BlockInstance`; registry `parentEntity: eventInstance`.
3. **Compat:** `shared` helper maps `placement_kind` + `anchor_edge` → legacy `DifferentialRole` for existing `partFinalizer` / `eventAttendeeUtils` until 20.1.3.2.
4. **Client:** `mergeAttendeesIntoEventShapes` aggregates relationships grouped by `eventInstance` parents sharing `eventShapeRef`.

---

## Task 20.1.3.2 (source: task-20.1.3.2-planning.md)

### Story

**This task changes** booking and admin code that still depends on **`differentialRole` / `differential_role`** for event segment ordering and attendee matrices **because** migration **000061** removed that column from `event_shapes`; placement is now **`placement_kind`** + **`anchor_edge`**. It also **confirms and finishes** the **`attendeeAssignments` → `event_instance_attendees`** relationship (parent **`eventInstance`**) across validation, fetch paths, and any straggling UI defaults so the stack matches Feature 20 §2.2–§2.4.

---

### Analysis

- **Problem / why now:** Sessions 20.1.1–20.1.2 aligned block shapes and instances; event modeling still encodes placement as `differential_role` and hangs calendar toggles on the shape. Principles §5.1–§5.4 require **placement types** on shapes and **named segments** (instances) with **per-segment** toggles and attendees — this session applies the DDL + model/type layer so later… _(truncated)_

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

- [ ] No production use of **`es.differentialRole`** on event shapes in `partFinalizer.ts`, `eventAttendeeUtils.ts`, `minimizerEventShapes.ts`, `partFinalizerSlotShape*.ts`, `perspectiveResolver.ts` — use **placement** (+ shared helper) instead.
- [ ] Admin **`useShapesTab`** (and related event shape defaults) use **placement** fields, not `differentialRole`.
- [ ] **Matrix / overrides** path (`differentialRoleMatrixRows`, `DifferentialEventRoleOverridesField`) updated to use placement-derived template or documented interim bridge without reading dropped DB column.
- [ ] **Server** relationship validation and messages aligned with **`event_instance_attendees`** + parent **event instance**.
- [ ] **`EventShapeEntity`** (and transformers) updated: remove `differentialRole` when safe; **`entityFieldConstants` / select normalization** updated if field keys removed.
- [ ] Grep cleanup: no stray `event_shape_attendees` / `EventShapeAttendee` in app code paths that should be instance-based.
- [ ] App starts; client + server lint clean.

### Acceptance Criteria

- [ ] `attendeeAssignments` client `backendName` and server registry both reference **`event_instance_attendees`** with parent **`eventInstance`** (already true — re-verify after edits).
- [ ] PartFinalizer pipeline resolves segment ordering from **placement_kind / anchor_edge** (and existing override map), not from removed shape column.
- [ ] `eventAttendeeUtils` does not depend on template `differentialRole` from the entity for the same purpose.
- [ ] Admin shapes event panel does not send or default **`differentialRole`** as the primary placement control.
- [ ] `npm run start:dev` succeeds; `client` and `server` lint pass (no new tests; testing suspended).

### Design

1. **Ordering / template role:** Introduce or reuse a small function **`placementFieldsToSegmentOrderRole`** (name TBD) mapping `(placementKind, anchorEdge)` → the same major/minor/none semantics `effectiveDifferentialRole` expected from the template. PartFinalizer, minimizer, slot helpers, and `eventAttendeeUtils` call this instead of reading `es.differentialRole` from the entity (and drop `differentialRole` from `EventShapeEntity` when no longer needed).
2. **Entity layer:** Remove `differentialRole` from `EventShapeEntity` once all consumers use placement; remove `eventShapeDifferentialRoleFromPlacementFields` from transformers or reduce to internal helper only.
3. **Admin:** `useShapesTab` defaults: set **`placementKind` / `anchorEdge`** defaults instead of `differentialRole`. Matrix rows + `DifferentialEventRoleOverridesField`: drive rows from placement or keep override storage but label consistently; `selectFieldValueResolution` / `selectHandlersNormalization`: drop `differentialRole` field keys if fields removed from metadata registry (coordinate with `entityFieldConstants` / admin metadata).
4. **Server validation:** `validateAttendeeAssignmentEntities` and related: assert parent is **event instance** row, child is user-type **block instance**; table name **`event_instance_attendees`** only.
5. **Verification:** `npm run start:dev`, `cd client && npm run lint`, `cd server && npm run lint`; ripgrep gates for forbidden identifiers above.

---
