# Plan: session 20.1.3 — Event schema alignment (placement, segment ownership, instance attendees)

## Contract
- **Tier:** session | **ID:** 20.1.3
- **Scope:** Align `event_shapes`, `event_instances`, and attendee storage with Feature 20 §2.2–§2.4: placement columns on shapes; segment ownership + location + per-segment calendar toggles on instances; rename `event_shape_attendees` → `event_instance_attendees`; default placement seeds; Sequelize + client types + direct consumers so app builds and lints.
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
- [ ] Session 20.1.3 in progress — planning locked after `/accepted-plan`; tasks 20.1.3.1 → 20.1.3.2 in order.

## Story
**This session delivers** PostgreSQL + Sequelize + client entity alignment for **event placement types** (shapes) and **named segments** (instances), including **attendee rows keyed to segments**, **so that** phase 20.2+ UI and booking logic can rely on Principles §5.1 / §5.3 / §5.4 without fighting legacy `differential_role` and shape-level invite toggles.
**Estimated size:** M (two tasks; data migration + relationship rewiring).

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
Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant to this tier.

- **Paths reviewed:** `server/src/db/models/booking/event_shape.ts`, `event_instance.ts`, `event_shape_attendee.ts`; `server/src/db/models/sequelizeModelAssociationsPartA.ts`; `server/src/db/models/index.ts`; `server/src/config/app.js` (model exports); `server/src/routes/internal/relationships/relationshipConstants.ts` (`attendeeAssignments` → `EventShapeAttendee`, parent `eventShape`); `server/src/routes/internal/entities/entitySanitizers.ts` (`sanitizeEventShapeFields`); `server/src/routes/internal/relationships/relationshipHelpersValidation.ts` (`validateAttendeeAssignmentEntities`); `client/src/types/entities.ts` (`EventShapeEntity`, `EventInstanceEntity`); `client/src/constants/relationships.ts` (`backendName: 'event_shape_attendees'`); `client/src/utils/transformers/entityTransformers.ts`, `apiEntityFieldNormalization.ts`; `client/src/utils/booking/partFinalizer.ts`; `client/src/utils/booking/eventAttendeeUtils.ts`; admin event UI: `client/src/composables/admin/useShapesTabEventPanel.ts`, `client/src/components/admin/generic/ShapesTabEventPanel.vue`, `client/src/composables/admin/useEntityCardFormSetup.ts` (event shape fields).
- **Patterns / call sites:** Today `event_shapes` exposes `differential_role`, `include_reschedule_link`, `include_cancel_link`; `EventShapeEntity` mirrors that. Attendees are a join table `event_shape_attendees` from **event shape** → **block instance** (user-type). `partFinalizer` / `eventAttendeeUtils` branch on `differentialRole` for major/minor segment ordering. Relationship CRUD uses `RELATIONSHIP_REGISTRY.attendeeAssignments` with Sequelize `EventShapeAttendee`.
- **Gaps / unknowns:** Exact PostgreSQL enum names for new `placement_kind` / `anchor_edge` (must match migration + model). **Data migration** for existing `event_shape_attendees` rows when switching FK to `event_instance_id`: product rule for which `event_instance` row receives each attendee if multiple instances exist per shape (default: first instance per shape, or document manual follow-up). Whether `admin_metadata` / batch keys need migration for renamed relationship or new shape fields (grep at task time).

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

## Decomposition
- **Task 20.1.3.1:** Full DDL for this session in one migration pass (or tightly sequenced files): `event_shapes` / `event_instances` columns, backfill + drop legacy shape columns, rename `event_shape_attendees` → `event_instance_attendees` with `event_instance_id` FK, placement seeds; Sequelize `EventShape`, `EventInstance`, renamed attendee model; `index.ts`, `sequelizeModelAssociationsPartA`, `config/app.js`; client entity types + transformers + sanitizers for new fields.
- **Task 20.1.3.2:** `RELATIONSHIP_REGISTRY` + route validation + `client/src/constants/relationships.ts`; rewrite `partFinalizer` / `eventAttendeeUtils` / admin event UI off `differentialRole` onto placement fields; grep cleanup; app start + lint.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.1-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
