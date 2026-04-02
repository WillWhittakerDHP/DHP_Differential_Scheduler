# Plan: phase 20.2 — 20.2

## Contract
- **Tier:** phase | **ID:** 20.2
- **Scope:** 20.2
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
Phase 20.1 completed with sessions: 20.1.1, 20.1.2, 20.1.3.

## Story
**As a** platform maintainer, **I want** internal entity and relationship APIs to match Phase 20.1 schema (renamed block-shape types, instance three-property fields, event placement and segment ownership), **so that** admin and booking clients can rely on consistent contracts without the server re-implementing PartFinalizer or exposing removed differential-role fields.

**Estimated size:** M / L (touches generic entity CRUD, event flows, appointments, and preview)

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

- **Paths reviewed:** `server/src/routes/internal/entities/` (`entityCrudRouter.ts`, `entitySanitizers.ts`, `entityConstants.ts`); `server/src/routes/internal/relationships/` (`relationshipConstants.ts`, `relationshipQueryBuilders.ts`, `relationshipCrudRouter.ts`); `server/src/routes/internal/index.ts` (mounts including `EventInstancePreviewRouter`); `shared/utils/eventPlacementUtils.ts`, `shared/utils/differentialRoleUtils.ts`; `.project-manager/features/domain-architecture-alignment/phases/phase-20.2-guide.md`; `FEATURE_20_ARCHITECTURE_REDESIGN.md` §5, §8.2; `phase-20.1-handoff.md`.
- **Patterns / call sites:** Generic **entity CRUD** drives most shape/instance payloads; **`sanitizeEntityDataForCreate/Update`** already strips `differential_role` from `eventShape` and sanitizes placement fields via shared utils. **Block instance** sanitization today only normalizes `agentPermissions` — three-property fields will need explicit validation alignment with Sequelize model. **Relationships** registry already includes `eventAssignments` and `attendeeAssignments` (EventInstanceAttendee). **Appointment** and **calendar** routes sit under `appointments/`, `external/calendar` — must stay persistence-only per ARCHITECTURE §10 / plan §4.
- **Gaps / unknowns:** Exact Joi schemas per entity key (often centralized vs per-route) need a full pass during implementation; admin-metadata batch paths if they duplicate entity validation; client transformers that assume old API keys should be listed in child sessions (phase 20.4 covers booking pipeline UI, but any **breaking** response shape from this phase should be noted for 20.3/20.4).

## Analysis
- **Problem / why now:** Phase **20.1** landed DB + Sequelize models for renamed block-shape types, instance-level `composite` / `orchestrator` / `wizardVisible`, event placement columns, and relational segment/attendee tables. Without **API alignment**, admin batch loads and mutations can still send or expect legacy fields (`differential_role`, old shape-type tokens, unscoped event instances). This phase implements **FEATURE_20 §8.2** and **§5.1–5.4**.
- **Domain boundaries:** **Server** routes and validation only — responses remain **configuration + raw rows** for the **client PartFinalizer** (no server-side booking total resolution). **Shared** placement sanitizers already exist; extend **`@shared`** where both sides must agree on enums or DTOs.
- **Patterns to follow:** Keep using **`entitySanitizers`** + **`FIELD_NAMES`** for camel/snake parity; use **`sanitizeEventPlacementKindInput` / `sanitizeEventAnchorEdgeInput`** for event shapes; reject or strip **`differential_role`** on event shapes at the API boundary (sanitizer already deletes on patch/create). Relationship CRUD stays on Sequelize models defined in 20.1.
- **Risks:** Generic CRUD may accept unknown keys — ensure validators for `blockInstance` and `blockShape` enforce allowed `type` set and required event-instance parent. **Preview** and **calendar** paths must not grow server-side resolution logic.
- **Alternatives:** Per-entity bespoke routers instead of generic CRUD — rejected; plan assumes adapting the existing internal entity/relationship stack.

## Goal
Complete **Phase 20.2 — Pass 2: API alignment** per **`phase-20.2-guide.md`** verbatim **§8.2** scope: internal **entity and relationship** routes accept Phase 20.1 schema (renamed types, instance three-property fields, event placement, scoped event instances); **no** server-side booking-total resolution; **event shape** APIs expose **placement fields only** (no differential-role concepts). Align with **FEATURE_20 §5** acceptance checks (ownership via `parent_block_instance_id`, no resolution drift).

## Files
- **Canonical (read-only intent):** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§5**, **§8.2**), `.project-manager/ARCHITECTURE.md`
- **Harness / PM:** `phases/phase-20.2-guide.md`, `phases/phase-20.1-handoff.md`, `feature-domain-architecture-alignment-guide.md`, `DOMAIN_REWRITE_WORKLOG.md`
- **Implementation (this phase — server + shared contracts):** `server/src/routes/internal/entities/**`, `server/src/routes/internal/relationships/**`, `server/src/routes/internal/appointments/**`, `server/src/routes/internal/event-instance-preview/**`, `server/src/routes/external/calendar*` and calendar services under `server/src/services/google/calendar/`, `shared/utils/eventPlacementUtils.ts`, `shared/types/**` as needed for exported API shapes, Joi/schema modules colocated with routes

## Approach
1. Trace **§5.1** table row-by-row: for each route/module, list current validators and response shapes, then align with Phase 20.1 models (no new migrations in 20.2 unless a gap is found and documented).
2. **Block shapes / instances first** — enum `type` and three booleans on instances must round-trip through batch entity APIs used by admin prefetch.
3. **Event shapes** — only `placement_kind` + `anchor_edge` (+ existing identity fields); continue stripping differential-role at sanitization; document any breaking JSON key removals for downstream sessions.
4. **Event instances** — enforce **`parent_block_instance_id`** on create/update where required; scope list/query helpers used by preview and admin so segments are always owned by an event **block instance**.
5. **Appointments + calendar** — persistence-only: store client-submitted payload; calendar reads segment + placement policy from new columns/relations — **no** PartFinalizer port to server.
6. After each session: run **plan §9.1** drift checklist; update `DOMAIN_REWRITE_WORKLOG.md` with API decisions.
7. **Client/admin UI** consumption of new contracts is largely **20.3–20.4**; this phase may add minimal shared type exports so both sides compile.

## Checkpoint
- **20.1** is complete; branch **`feature/domain-architecture-alignment`** is the expected worktree.
- Before **`/session-start 20.2.x`:** re-read **`phase-20.2-guide.md`** acceptance checks and **§5.4**; confirm no server-side “resolved totals” endpoints are introduced.
- Coordinate with **Feature 6** only where appointment persistence contracts overlap; principles + FEATURE_20 remain authoritative.

## Deliverables
- Updated **internal entity** validation and sanitization for `blockShape`, `blockInstance`, `eventShape`, `eventInstance` consistent with Phase 20.1 schema.
- **Relationship** handling for `eventAssignments`, attendee rows on event instances, and `validEventCascades` validated for segment ownership and integrity.
- **Event-instance preview** (or equivalent) re-scoped to parent event block instance context per plan.
- **Appointment** and **calendar** integration paths persist client payload and read segment/placement data without server finalizer logic.
- Removal or deadening of **differential-role-specific** route helpers/schemas called out in **§5.3** (where safe without breaking 20.3 work — document any stragglers).
- **`@shared`** types or constants updated where API contracts are shared with the client.

## Acceptance Criteria
- [ ] Route payloads and validators match the **Phase 20.1** schema (renamed types, instance three-property fields, placement columns, `parent_block_instance_id` where required).
- [ ] **No** API path introduces server-side booking-total or PartFinalizer-equivalent resolution.
- [ ] **Event shape** APIs expose **placement** fields only; differential-role is not part of the public create/update contract.
- [ ] **§5.4** checks satisfied: no resolution drift in route descriptions; event instance ownership flows through `parent_block_instance_id`; shape-level validity remains separate from orchestrator selection.
- [ ] App starts; **client + server lint** pass (per Definition of Done).
- [ ] Phase guide **objectives** and handoff sections updated at **phase-end**.

## Decomposition
- **Session 20.2.1:** **Block shape & block instance** internal entity routes — validate renamed `type` values (`user`, `service`, `time`, `price`, `event`) and instance **`composite` / `orchestrator` / `wizardVisible`**; align batch CRUD + `entitySanitizers` / Joi with Sequelize models.
- **Session 20.2.2:** **Event shape & event instance** entity routes — placement-only surface for shapes; require/validate **`parent_block_instance_id`** for instances; segment field validation per Principles §5.4; ensure serializers omit legacy differential-role.
- **Session 20.2.3:** **Relationships + preview** — `eventAssignments`, `event_instance_attendees` / attendee relationship registry, `validEventCascades`; re-scope **`event-instance-preview`** to segments under a parent event block instance (or equivalent simplification per §5.1).
- **Session 20.2.4:** **Appointments + calendar + cleanup** — appointment persistence helpers/routers; calendar creation reads segment identity and placement policy; remove or isolate **differential-role** route helpers per §5.3; final lint + drift checklist; prepare phase guide / handoff for phase-end.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved (session-tier audits as run during session-end)
- [ ] All sessions **20.2.1–20.2.4** complete with session logs/handoffs
- [ ] **`phase-20.2-guide.md`** objectives checked and **`phase-20.2-handoff.md`** / feature handoff updated for next phase (**20.3**)

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/phases/phase-20.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
