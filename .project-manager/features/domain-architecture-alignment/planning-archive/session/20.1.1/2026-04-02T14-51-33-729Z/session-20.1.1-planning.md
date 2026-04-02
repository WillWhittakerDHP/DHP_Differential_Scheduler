# Plan: session 20.1.1 — ** ** Block shape type enum rename -- migration (`property`->`time`, `coupon`->`price`, `option`->`event`); update `block_shape.ts` model and TS type; update `client/src/constants/blockShapeTypes.ts` and `entities.ts`; grep and update server Joi validators / route constants referencing old strings.

## Contract
- **Tier:** session | **ID:** 20.1.1
- **Scope:** ** ** Block shape type enum rename -- migration (`property`->`time`, `coupon`->`price`, `option`->`event`); update `block_shape.ts` model and TS type; update `client/src/constants/blockShapeTypes.ts` and `entities.ts`; grep and update server Joi validators / route constants referencing old strings.
- **Governance (harness snapshot):**
  - Governance Context (Session)
  - Function Governance
  - Clean — no violations detected.
  - Component Governance
  - Clean — no violations detected.
  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
  - `client/src/composables/admin/useEntityCardSaveAndActions.ts` — oversized-return: Return surface has 14 properties; decompose into focused composables
  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Re
  - … _(truncated)_

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs, architecture, booking
- **Gate profile:** standard
- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Phase 20.1 planning accepted. Branch **`feature/domain-architecture-alignment`** confirmed. This is the first session in the schema alignment pass. No schema changes have landed yet.

## Story
**This session delivers** the block shape type enum rename (`property`->`time`, `coupon`->`price`, `option`->`event`) in PostgreSQL, the Sequelize model, and all client/server code that references those strings, **so that** subsequent sessions and passes operate on the target vocabulary without carrying legacy type names.
**Estimated size:** M

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
4. Resolve part-level event assignment (override ?? baselin

_(Excerpt truncated.)_

## Codebase recon (agent-led — required)

- **Paths reviewed:**
  - `server/src/db/models/admin/block_shape.ts` — TS type: `'user' | 'service' | 'property' | 'option' | 'coupon'`; DataTypes.ENUM with same five values (line 23, 52).
  - `client/src/constants/blockShapeTypes.ts` — `BLOCK_SHAPE_TYPES` object with keys `USER`, `SERVICE`, `PROPERTY`, `OPTION`, `COUPON` mapping to lowercase strings; exports `BlockShapeType`.
  - `client/src/types/entities.ts` — `BlockShapeEntity.type` uses `BlockShapeType`.
  - **Server files referencing old strings:** `server/src/repositories/appointmentSelectionRepository.ts`, `server/src/repositories/appointmentSelectionCodec.ts`, `server/src/middlewares/ownershipRegistry.ts`, `server/src/middlewares/ownershipEnforcement.ts`, `server/src/db/models/booking/appointment_selection_line.ts` — all contain `'property'`, `'coupon'`, or `'option'` in block-type context.
  - **Client files referencing old constants:** `client/src/utils/transformers/appointmentToWizardHelpers.ts`, `client/src/utils/booking/cascadeFilterPipeline.ts`, `client/src/utils/blockInstanceUtils.ts`, `client/src/utils/admin/calibrationChartTransforms.ts`, `client/src/types/transformers/bookingData.ts`, `client/src/composables/booking/useWizardFilteredOptions.ts`, `client/src/composables/booking/useDevPanelsComputed.ts`, `client/src/composables/admin/useSelectEnumOptions.ts`.
  - **No server Joi validators** in `server/src/routes/internal/entities/` reference the old enum strings directly.
  - `server/src/db/migrations/` — most recent: `20260432_000057`; pattern is `.mjs` with raw SQL.
- **Patterns / call sites:** Client code uses `BLOCK_SHAPE_TYPES.PROPERTY` / `.OPTION` / `.COUPON` from the constants file. Server model uses the string literal enum. Migration pattern: `ALTER TYPE ... RENAME VALUE` (see migration 000056).
- **Gaps / unknowns:** Some `'property'` / `'option'` string references in server files may be domain-context (e.g. `property` as in real-estate property, not block type). Need to verify each hit before renaming.

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

## Decomposition
- **Task 20.1.1.1:** Migration + server model -- author PG enum rename migration; update `block_shape.ts` model type union and ENUM; update server files referencing old block-type strings (`appointmentSelectionRepository`, `appointmentSelectionCodec`, `ownershipRegistry`, `ownershipEnforcement`, `appointment_selection_line`).
- **Task 20.1.1.2:** Client constants + all client references -- rename `BLOCK_SHAPE_TYPES` keys/values in `blockShapeTypes.ts`; update all client files importing or switching on old constants; update `entities.ts` if needed; verify app starts and lint passes.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.1-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
