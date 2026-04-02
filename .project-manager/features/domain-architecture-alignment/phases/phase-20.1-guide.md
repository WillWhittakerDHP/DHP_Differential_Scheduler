# Phase 20.1 Guide: Pass 1 — Schema alignment

**Purpose:** Phase-level harness guide for Feature 20 — implementation plan **§8.1** (schema pass).

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or the implementation plan.

---

## Verbatim directive (FEATURE_20_ARCHITECTURE_REDESIGN.md §8.1)

Scope:

- Rename block-shape types to `time`, `price`, and `event`.
- Move three-property storage to `block_instances`.
- Add event placement columns and event-instance ownership fields.
- Drop differential-role storage and other legacy columns called out in section 2.

Acceptance checks:

- Schema plan refers to `block_instances.composite`, `block_instances.orchestrator`, and `block_instances.wizardVisible`.
- No schema step enforces `orchestrator -> composite`.
- Event routing is still modeled through `event_assignments`.

---

## Related plan sections

- **§2** — Model changes (DB / Sequelize): enum renames, tables, columns aligned to this pass.
- **§1** — Rename mappings and part-instance migration (type renames `property`→`time`, etc.).
- **§0.2** — Legacy assumptions to remove (shape-level three-property framing, etc.).

---

## Principles and drift

Enforce **ARCHITECTURE_PRINCIPLES.md** §1 (domain separation), §2 (three-property instance model), §3–§5 as cited in plan §2. At session boundaries run **plan §9.1** and confirm **§9.1a** invariants (especially instance-level three-property storage and relational `event_assignments`).

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)

---

## Overview

**Phase Number:** 20.1
**Phase Name:** Pass 1 — Schema alignment (models, enums, instance fields per plan §8.1 / doc §2).
**Description:** Align PostgreSQL schema and Sequelize models with locked domain principles: rename block shape types, add instance-level three-property columns, add event placement/ownership columns, drop legacy columns, rename attendee table.
**Status:** Not Started

---

## Objectives

- [ ] Block shape type enum renamed (`property`->`time`, `coupon`->`price`, `option`->`event`)
- [ ] `block_instances` carries `composite`, `orchestrator`, `wizardVisible`; legacy columns removed
- [ ] `event_shapes` has `placement_kind` + `anchor_edge`; legacy `differential_role` removed
- [ ] `event_instances` has `parent_block_instance_id` + location fields; calendar toggles moved from event_shapes
- [ ] `event_shape_attendees` renamed to `event_instance_attendees`
- [ ] Legacy shape-level booleans (`composable`, `isStateControl`, `canHaveParts`) removed from `block_shapes`
- [ ] Client constants and entity types updated to match schema
- [ ] App starts and lint passes

---

## Sessions Breakdown

Session 20.1.1: Block shape type enum rename
Session 20.1.2: Block instance three-property alignment and legacy cleanup
Session 20.1.3: Event schema alignment (placement, ownership, attendee rename)

## Tasks

Run `/session-start 20.1.1` to begin the first session. Each session covers one logical group of schema changes per the phase planning doc.

---

### Session 20.1.1: Block shape type enum rename

**Goal:** Rename the PostgreSQL `block_shapes.type` enum from `property`/`coupon`/`option` to `time`/`price`/`event` (per plan §1.1, §2.1). Update the Sequelize model, client constants, and any server validators that reference the old strings.

**Files:**
- `server/src/db/migrations/` -- new `.mjs` migration (ALTER TYPE ... RENAME VALUE x3)
- `server/src/db/models/admin/block_shape.ts` -- update TS type union and DataTypes.ENUM
- `client/src/constants/blockShapeTypes.ts` -- rename `PROPERTY`->`TIME`, `COUPON`->`PRICE`, `OPTION`->`EVENT` keys and values
- `client/src/types/entities.ts` -- update `BlockShapeEntity.type` usage and comments
- `server/src/routes/internal/entities/` -- check Joi validators for old enum strings

**Approach:**
1. Author migration using `ALTER TYPE ... RENAME VALUE` (one per rename; PG >=10).
2. Update `block_shape.ts` model to `'user' | 'service' | 'time' | 'event' | 'price'`.
3. Update `client/src/constants/blockShapeTypes.ts` keys/values and `BlockShapeType` type.
4. Grep client and server for remaining `'property'`, `'coupon'`, `'option'` string references in block-type context; update.
5. Verify app starts and lint passes.

**Checkpoint:** After this session, `block_shapes.type` uses `time`/`price`/`event` in DB, server model, and client constants. No orphaned `property`/`coupon`/`option` references in type-switching code.

---

### Session 20.1.2: Block instance three-property alignment and legacy cleanup

**Goal:** Add `orchestrator` and `wizardVisible` boolean columns to `block_instances`; drop legacy columns from both `block_instances` and `block_shapes` (per plan §2.3, §2.4). Update Sequelize models and client types.

**Files:**
- `server/src/db/migrations/` -- new `.mjs` migration(s)
- `server/src/db/models/booking/block_instance.ts` -- add `orchestrator`, `wizardVisible`; remove `bookingMode`, `differential`, `differentialEventRoleOverrides`
- `server/src/db/models/admin/block_shape.ts` -- remove `composable`, `isStateControl`, `canHaveParts` and their validate hooks
- `client/src/types/entities.ts` -- update `BlockInstanceEntity` (add `orchestrator`, `wizardVisible`; remove `bookingMode`, `differential`, `differentialEventRoleOverrides`) and `BlockShapeEntity` (remove `composable`, `isStateControl`, `canHaveParts`)
- `server/src/db/models/sequelizeModelAssociationsPartA.ts` -- verify no FK references to dropped columns

**Approach:**
1. Author migration: ADD COLUMN `orchestrator` boolean DEFAULT false, ADD COLUMN `wizard_visible` boolean DEFAULT true, then DROP COLUMN for each legacy field (remove validate hooks in model first so model loads cleanly).
2. Update `block_instance.ts` model declarations and `init()`.
3. Update `block_shape.ts` model: remove declarations, `init()` entries, and the `stateControlMutualExclusivity` validate block.
4. Update `BlockInstanceEntity` and `BlockShapeEntity` in client types.
5. Grep for remaining references to dropped field names; update or remove.
6. Verify app starts and lint passes.

**Checkpoint:** `block_instances` has `composite`, `orchestrator`, `wizardVisible`. No `orchestrator -> composite` implication in schema or model. Legacy columns (`bookingMode`, `differential`, `differentialEventRoleOverrides`, `composable`, `isStateControl`, `canHaveParts`) gone from schema and models.

---

### Session 20.1.3: Event schema alignment

**Goal:** Add placement columns to `event_shapes`, ownership and location fields to `event_instances`, move calendar toggles from shapes to instances, rename `event_shape_attendees` to `event_instance_attendees`, and seed default placement types (per plan §2.2, §2.3, §2.4).

**Files:**
- `server/src/db/migrations/` -- new `.mjs` migration(s)
- `server/src/db/models/booking/event_shape.ts` -- add `placement_kind`, `anchor_edge`; drop `differentialRole`, `includeRescheduleLink`, `includeCancelLink`
- `server/src/db/models/booking/event_instance.ts` -- add `parent_block_instance_id`, location fields, `includeRescheduleLink`, `includeCancelLink`
- `server/src/db/models/booking/event_shape_attendee.ts` -- rename to `event_instance_attendee.ts`, update table name to `event_instance_attendees`, change FK from `event_shape_id` to `event_instance_id`
- `server/src/db/models/index.ts` -- update factory registration for renamed model
- `server/src/db/models/sequelizeModelAssociationsPartA.ts` -- update association wiring
- `client/src/types/entities.ts` -- update event shape and instance entity types

**Approach:**
1. Author migration(s): ADD `placement_kind` ENUM, `anchor_edge` ENUM to `event_shapes`; DROP `differential_role`, `include_reschedule_link`, `include_cancel_link` from `event_shapes`; ADD `include_reschedule_link`, `include_cancel_link`, `parent_block_instance_id`, location columns to `event_instances`; RENAME TABLE `event_shape_attendees` to `event_instance_attendees` and update FK; INSERT seed rows for default placement types per §2.2.
2. Update all affected Sequelize models.
3. Update model index and associations.
4. Update client entity types.
5. Verify event routing is still relational through `event_assignments` (no scalar event columns on part instances).
6. Verify app starts and lint passes.

**Checkpoint:** `event_shapes` has `placement_kind` + `anchor_edge` (with validation constraints per principles §5.1). `event_instances` owns segments via `parent_block_instance_id`. Attendees scoped to instances not shapes. Default placement seeds exist. Event routing remains relational.