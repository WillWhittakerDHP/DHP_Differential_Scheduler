# Plan: phase 20.1 — 20.1

## Contract
- **Tier:** phase | **ID:** 20.1
- **Scope:** 20.1
- **Governance (harness snapshot):**
  - Governance Context (Phase)
  - Type Inventory Issues
  - Duplication Hotspots (top 4)
  - Import Graph
  - **7** composable chain depth violations (max depth exceeded)

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** docs, architecture, booking
- **Gate profile:** decomposition
- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Feature 20 planning accepted. Branch **`feature/domain-architecture-alignment`** created. Phase 20.1 is the first implementation pass — no prior schema work has landed yet. Across ladder: next phase after this is **20.2** (API alignment).

## Story
**As a** platform maintainer, **I want** the database schema and Sequelize models to match the locked domain principles (block type renames, instance-level three-property model, event placement columns, event-instance ownership, legacy column removal), **so that** all subsequent passes (API, admin, booking pipeline, migration) operate against the target schema rather than working around legacy structures.
**Estimated size:** L

---
## Architecture context (harness-injected)

## 1. System overview

Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:

- **Public booking users** — wizard-style scheduling and property/availability flows.
- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.

TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often batch-prefetched (e.g. router navigation guards).

---

## 2. Domain map

| Domain | Client paths | Server paths | Key models / areas | Shared types |
|--------|----------------|-------------|---------------------|--------------|
| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `admin-metadata`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Session 6.18.1) |
| **Integrations** | `services/calendarApiService`, `mapsApiService`, `propertyEnrichmentApiService` (full-URL axios) | `routes/external/calendar`, `oauth`, `maps`, `services/google/` | OAuth, external APIs | `@shared/types/calendar` |
| **Beta** | `composables/beta/`, `views/beta/`, `components/beta/` | `routes/internal/beta-feedback`, `db/models/beta` | Beta feedback | (often local types) |

---

## 3. Data flow

Canonical path:

1. **Vue view** → **presentational component**
2. **Composable** (state + orchestration; thin components)
3. **Client HTTP**
   - **Default:** `utils/api/apiClient` — relative paths, same-origin API.
   - **Integrations:** `services/*ApiService` — full-base-URL axios (calendar, maps, enrichment).
4. **Express route** (`routes/internal/*` or `routes/external/*`)
5. **Service** (`server/src/services/`)
6. **Repository** (`server/src/repositories/`) or direct Sequelize access
7. **Sequelize model** (`server/src/db/models/`)

Cross-cutting: **transformers** (e.g. global → booking), **injection keys** for wizard scope, **TanStack Query** keys + invalidation for mutations.

**Booking resolution boundary:** The server serves **configuration and raw storage rows** (e.g. part instances, relationships) plus appointment-scoped inputs such as `property_details`. **PartFinalizer** on the **client** resolves wizard time, fee, and segment placement for the live booking flow. On submit, the client sends a **full appointment payload**; the server **persists** it and does **not** re-run PartFinalizer to recompute or “verify” those totals. Do not introduce a second booking calculator on the server for the same contract (see §10).

---

## 4. Type boundaries

| Layer | Location | Use when |
|-------|----------|----------|
| **Shared contracts** | Repo `shared/`, imported as `@shared/types/...` | Types needed by **both** client and server (API shapes, branded IDs, shared enums). |
| **Client-only** | `client/src/types/<domain>/` | UI-only: injection keys, wizard step types, transformer helpers, form field types. **Never** imported by server. |
| **Server-only** | `server/src/types/` | Handler params, repository types, internal DTOs. **Never** imported by client. |

**Rule:** If both sides need it → `@shared`. If only one side → keep it local.

**Reactivity boundaries:** Prefer `ComputedRef<T>` for read-only consumer APIs; `Ref<T>` for internal mutable state; avoid leaking `Ref | ComputedRef` unions at public composable boundaries (see type governance rule + TYPE_AUTHORING_PLAYBOOK).

---

## 5. Per-domain conventions

### Booking / wizard

- **Composable prefixes:** `useBooking*`, `useAvailability*`, `useWizard*`, `useAppointment*`, `useProperty*` (orchestrators such as `useAvailabilityOrchestrator`, `useBookingWizardSetup`).
- **Components:** under `components/booking/` (steps in `components/booking/steps/`).
- **Depends on** admin metadata (wizard blocks, availability rules) — document cross-domain deps in planning **Analysis**.
- **Scheduling rules:** Block instances, part ledger, PartFinalizer, event placement, and invariants are defined in **§8–§14** below.

### Admin

- **Prefixes:** `useAdmin*`, `useEntity*`, entity CRUD around `EntityBase<GlobalEntityKey>` + `ENTITY_CONFIGS`.
- **Pattern:** Generic admin components + config objects + transformers.
- **Shape vs instance:** Structural validity (`valid_*` relationships) is edited on the **shapes** side; orchestration editors **select** active assignments from that universe — they do not redefine structural possibility (see §9).

### Auth

- **Emerging domain;** keep route and model changes aligned with `routes/internal/auth` and `db/models/auth`. Consumed by all domains via middleware/guards over time.

### Users / `user_role`

- **`users.user_role`** is a **small closed set** (PostgreSQL ENUM + Joi + client types). **Delivered (Feature 6 Session 6.18.1):** **`@shared`** exports **`USER_ROLE_VALUES`** and per-role constants; server and client **import** that list. Product vocabulary uses **`owner`** (not `seller`) end-to-end, including wizard **`additionalContacts[].role`** and contact-step field names (`ownerInfo`, `showOwner`). **Note:** Older saved wizard or step snapshots that used `seller` / `sellerInfo` are not migrated client-side; users re-enter contacts or clear stored state if needed.
- **User-type block instances** (state-control shapes) drive scheduling/display semantics; **`getUserTypeBlockIdForRole`** maps **DB role** → block instance. **Session 6.18.2** adds **admin-persisted alignment** (role → `block_instance_id`) so mappings are configurable without code edits where product allows. See `features/appointment-workflow/phases/phase-6.18-guide.md`.
- **Feature 7 Enactment** exposes role to the client using the **same** shared vocabulary as the API.

### Integrations

- Prefer **dedicated services** and **external routes**; avoid mixing full-URL axios into `apiClient` call sites without reason.

### Beta

- Isolated feedback capture; keep `beta` paths grouped under composables/views/components/beta.

---

---

## (from ARCHITECTURE.md — domain rules §8+)

## 8. Domain model (block shape types)

The system has five block shape **types**. Each owns one scheduling concern. All five participate in the three-property instance model (§9).

| Type | Domain | What it owns |
|------|--------|----------------|
| `user` | Identity | User identity and wizard state. User instances drive cascades and annotations. |
| `service` | Structure | Work items (part instances), active downstream assignments per service context. **Base** time/fee defaults and floors live only on **service orchestrator** part instances. |
| `event` | Event | Part-instance calendar segment assignments and time-axis patterns. |
| `time` | Duration | Part-instance duration contributions from property characteristics (rates × inputs). |
| `price` | Fee | Part-instance fee contributions and rollups from rates and cascades. |

**Domain separation:** Each domain writes only its own concern on part instances. Domains **compose**; they do not overwrite each other’s values.

**Legacy names:** During migrations, stored enums or code may still reference older labels (`property` / `coupon` / `option`); target names are **`time`**, **`price`**, **`event`** aligned to this table.

---

## 9. Block instances: three-property model and layering

### 9.1 Three orthogonal properties (instance storage only)

Every **block instance** has three independent booleans (not on block **shapes**):

| Property | Axis | Question |
|----------|------|----------|
| `orchestrator` | Behavior | Root of an active assignment graph across other shapes? |
| `composite` | Structure | Owns child block instances of the **same** shape? |
| `wizardVisible` | Presentation | Appears in the booking wizard when cascades permit? |

Any combination is valid. Compositeness is **same-shape** hierarchy; orchestration is **cross-shape** active selection from the shape-level validity graph.

### 9.2 Layering

```
Block shape (template — type, domain, valid shape-level relationships)
  └─ Block instance (runtime — carries composite / orchestrator / wizardVisible)
       └─ Part instance (value ledger per block instance)
```

- **Shapes** define what is structurally possible (`valid_*` tables). They do **not** store the three booleans.
- **Block instances** store the three booleans and create part instances.
- **Orchestrator instances** choose which downstream instances are **active** from the options the shape graph allows — they do **not** redefine validity.

---

## 10. Part instances, PartFinalizer, and resolution

### 10.1 Per-block-instance ledger

Each block instance owns its own part instances via `part_assignments` (including user block instances). No instance writes another instance’s part rows.

**Two resolution tiers on part rows:**

| Tier | Who | Columns |
|------|-----|---------|
| **Base** | Service orchestrator only | `baseTime`, `baseFee` (floor + starting values) |
| **PerUnit** | Time / price atomics | `timePerUnit`, `feePerUnit` |

**Events:** Routed via relational **`event_assignments`** (event instance ↔ part instance), not scalar default/override columns on part instances.

### 10.2 PartFinalizer (client)

Part instances are storage. **PartFinalizer** (booking client pipeline) aggregates:

- `resolvedTime` = service base + Σ(timePerUnit × input) for time atomics in the same **lineage** bucket.
- `resolvedFee` = service base + Σ(feePerUnit × input) and percentage passes.
- `resolvedEvent` = event profile override **else** event orchestrator baseline assignment **per part instance**.

Base acts as a **floor** until zero-out. **Correlation:** bucket by lineage to the atomic service / line item — **forbidden** to resolve by `part_shape` alone when multiple work items could collide.

### 10.3 Resolution order (per part)

1. Per-block-instance part records exist.  
2. Resolve part-level time (base + time atomics using `property_details` inputs).  
3. Resolve part-level fee (base + price atomics).  
4. Resolve part-level event assignment (override ?? baseline).  
5. Apply **zero-out last** (after floor) — zero-out wins for that part's contribution to rollups.  
6. Group resolved time **by event** for layout.  
7. Roll resolved fees **by orchestrator** for presentation / persistence fields the product needs.

### 10.4 Time atomics and `property_details`

Time atomics hold **rates**; **`property_details`** holds appointment-scoped **inputs** (MLS / wizard). Product: rate × input = duration contribution. `property_details` is property **data**, not a substitute for time configuration.

_Source: `.project-manager/ARCHITECTURE.md` §10.3–§10.4 (kept in sync with canonical file)._

## Codebase recon (agent-led — required)

- **Paths reviewed:**
  - `server/src/db/models/admin/block_shape.ts` — type enum: `'user' | 'service' | 'property' | 'option' | 'coupon'`; has legacy columns: `composable` (bool), `canHaveParts` (bool), `isStateControl` (bool, with mutual-exclusivity validate vs `canHaveParts`).
  - `server/src/db/models/booking/block_instance.ts` — has `composite` (bool); **missing** `orchestrator` and `wizardVisible`; legacy columns present: `bookingMode` (enum), `differential` (enum), `differentialEventRoleOverrides` (JSONB).
  - `server/src/db/models/booking/event_shape.ts` — has `differentialRole` (enum `major|minor|minimizer|margin`), `includeRescheduleLink` (bool), `includeCancelLink` (bool); **missing** `placement_kind` and `anchor_edge`.
  - `server/src/db/models/booking/event_instance.ts` — linked to shapes via `event_shape_ref`; has template/calendar fields (`title_template`, `description_template`, etc.); **missing** `parent_block_instance_id`, location fields, and `include_reschedule_link`/`include_cancel_link` (currently on event_shapes).
  - `server/src/db/models/booking/event_assignment.ts` — `event_assignments` table with `parentId` → block instance, `childId` → event instance; relational routing intact.
  - `server/src/db/models/booking/event_shape_attendee.ts` — `event_shape_attendees` table; needs rename to `event_instance_attendees` per plan §2.2.
  - `server/src/db/models/booking/part_assignment.ts` — through-table `part_assignments`; no structural change needed.
  - `client/src/constants/blockShapeTypes.ts` — `BLOCK_SHAPE_TYPES` with `USER`, `SERVICE`, `PROPERTY`, `OPTION`, `COUPON`; exports `BlockShapeType`.
  - `client/src/types/entities.ts` — `BlockInstanceEntity` has `bookingMode`, `differential`, `differentialEventRoleOverrides`, `composite`; no `orchestrator`/`wizardVisible`. `BlockShapeEntity.type` uses `BlockShapeType`.
  - `server/src/db/migrations/` — `.mjs` files, raw SQL, idempotent `IF EXISTS` guards; most recent: `20260432_000057_create_user_role_block_alignments.mjs`.
- **Patterns / call sites:** Migrations use `queryInterface.sequelize.query` with raw SQL for enum ALTER, table rename, column add/drop. Models use `Model.init()` with `DataTypes`. Client types mirror DB schema for admin entity surfaces. `sequelizeModelAssociationsPartA.ts` wires FK relationships.
- **Gaps / unknowns:** Exact set of client code branches switching on `'property'`/`'coupon'`/`'option'` strings — exhaustive grep left to session tasks. Server route validators (Joi schemas) that enforce old enum values — verify per session. `active_part.ts` duplicate factory for `part_assignments` — check if still needed.

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

## Decomposition
- **Session 20.1.1:** Block shape type enum rename -- migration (`property`->`time`, `coupon`->`price`, `option`->`event`); update `block_shape.ts` model and TS type; update `client/src/constants/blockShapeTypes.ts` and `entities.ts`; grep and update server Joi validators / route constants referencing old strings.
- **Session 20.1.2:** Block instance three-property alignment and legacy cleanup -- migration: ADD `orchestrator` (bool), ADD `wizardVisible` (bool) to `block_instances`; DROP `bookingMode`, `differential`, `differentialEventRoleOverrides` from `block_instances`; DROP `composable`, `isStateControl`, `canHaveParts` from `block_shapes`; update both Sequelize models; update `BlockInstanceEntity` and `BlockShapeEntity` client types.
- **Session 20.1.3:** Event schema alignment -- migration: ADD `placement_kind`, `anchor_edge` to `event_shapes`, DROP `differential_role`, move `include_reschedule_link`/`include_cancel_link` to `event_instances`; ADD `parent_block_instance_id` + location fields to `event_instances`; rename `event_shape_attendees` -> `event_instance_attendees`; seed default placement types (§2.2); update Sequelize models + client types.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child sessions complete
- [ ] Phase guide and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
