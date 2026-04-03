# Plan: session 20.6.1 — Admin metadata stack removal (server + client API)

## Contract
- **Tier:** session | **ID:** 20.6.1
- **Scope:** Admin metadata stack removal (server + client API)
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
Phase **20.5** closed documentation gates (**§8.5**); **`DOMAIN_REWRITE_WORKLOG.md`** contains **admin metadata retirement** ordering for execution in **20.6**.

## Story
**This session delivers** removal of the **admin metadata HTTP stack** (client prefetch/mutations + server **`/admin-metadata`** routers/models) **so that** admin UI no longer depends on DB-driven field-metadata rows and **Pass 6** can proceed to **EntityCard** deletion in **20.6.2** without a live metadata API.

**Estimated size:** **L** (router prefetch, many composables, **FieldRenderer** / metadata editors, server models, migration).

---
## Architecture context (harness-injected)

## 1. System overview

Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:

- **Public booking users** — wizard-style scheduling and property/availability flows.
- **Admin configurators** — domain-specific editors for shapes/instances, wizard settings, availability rules, integrations (target: **no** DB-driven admin metadata pipeline; see `FEATURE_20_ARCHITECTURE_REDESIGN.md` §6.3).

TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Until the metadata stack is removed (Feature 20 Pass 6), some admin routes may still prefetch legacy metadata — treat that as **transitional**, not the end state.

---

## 2. Domain map

| Domain | Client paths | Server paths | Key models / areas | Shared types |
|--------|----------------|-------------|---------------------|--------------|
| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `admin-metadata` (legacy until removed), `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
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
- **Depends on** admin configuration data (wizard blocks, availability rules) served as **entities and settings** — document cross-domain deps in planning **Analysis** (booking must not assume a permanent admin-metadata-row model).
- **Scheduling rules:** Block instances, part ledger, PartFinalizer, event placement, and invariants are defined in **§8–§14** below.

### Admin

- **Prefixes:** `useAdmin*`, `useEntity*`, entity CRUD around `EntityBase<GlobalEntityKey>` + `ENTITY_CONFIGS`.
- **Pattern:** Domain-specific editors + `EntityBase` / `ENTITY_CONFIGS` where generic CRUD remains; **target** is direct Vuetify forms per entity, not DB field-metadata-driven renderers (Principles §7.1, plan §6.3a).
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

- **Paths reviewed:** `client/src/utils/api/adminMetadataApi.ts`, `client/src/composables/admin/useMetadataCache.ts`, `client/src/router/index.ts` (batch prefetch + `adminMetadata` query key), `client/src/composables/admin/useAdminMetadataMutations.ts`, `client/src/utils/admin/adminMetadataSaveRequest.ts`, `client/src/components/admin/metadata/AdminPrimitiveMetadataEditor.vue`, `client/src/components/admin/generic/fields/FieldRenderer.vue`, `server/src/routes/internal/index.ts` (`/admin-metadata`), `server/src/routes/internal/admin-metadata/`, `server/src/db/models/admin/adminMetadata.ts` and sibling **primitive/relationship** metadata models, `server/src/routes/schemas/adminMetadata*.ts`, `server/src/routes/internal/shared/metadataValidatorFactory.ts`.
- **Patterns / call sites:** Client treats **`/admin-metadata/batch`** as global cache (`['adminMetadata']`); **FieldRenderer** and **form field** helpers assume rows exist or warn. Server exposes CRUD-style metadata routes consumed by **AdminPrimitiveMetadataEditor** and mutations. Removal must follow **Pass 5** order: **UI no longer reads/writes rows** before dropping API and DDL.
- **Gaps / unknowns:** Exact list of **admin views** still requiring field-level metadata for render vs already using **ENTITY_CONFIGS** / explicit forms — verify per screen before deleting **FieldRenderer** dependency; confirm **annotation** paths from **`ANNOTATION_METADATA_DEFERRALS_20.6.md`**.

## Analysis
- **Problem / why now:** **§8.6** / **§6.3a** require **full** metadata infrastructure removal. **20.5** documented retirement **ordering**; **20.6.1** executes **client + API + server model** teardown for the metadata stack (DDL in same session or follow-up task if split for safety).
- **Boundaries:** **Admin** client + **server internal routes** + **DB models**; must **not** change booking **PartFinalizer** or appointment submit payloads.
- **Patterns:** Prefer **explicit** field definitions and existing **entity** admin patterns from Pass **20.3**; avoid new generic metadata abstractions.
- **Risks:** Stripping prefetch before replacements **breaks admin screens**; mitigate with ordered tasks and smoke checks. **Remote DB:** author migrations only; run locally when **DB_HOST** is localhost.
- **Alternatives:** Leave API stub returning empty — **rejected** (plan requires **full** removal).

## Goal
**Session 20.6.1:** Remove the **admin metadata** feature from the **client and server**: no **`/admin-metadata`** or **`/admin-metadata/batch`** callers, no **TanStack** `adminMetadata` cache, no metadata **Sequelize** models in active use, and a **migration** to drop the relevant tables (authored in-repo; execute per **DB_HOST** policy). Admin screens must remain usable via **non-metadata** configuration paths agreed in task implementation orders.

**Phase context:** This session owns only the **metadata stack** slice of **§8.6**; **EntityCard** is **20.6.2**.

## Files
- **Canonical:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.3a, §8.6**), `DOMAIN_REWRITE_WORKLOG.md` (**admin metadata retirement** subsection)
- **Harness:** `phases/phase-20.6-guide.md` (**### Session 20.6.1**), `sessions/session-20.6.1-guide.md`
- **Client (expected touch):** `client/src/router/index.ts`, `client/src/utils/api/adminMetadataApi.ts`, `client/src/composables/admin/useMetadataCache.ts`, `client/src/composables/admin/useAdminMetadataMutations.ts`, `client/src/utils/admin/adminMetadataSaveRequest.ts`, `client/src/components/admin/metadata/**`, `client/src/components/admin/generic/fields/FieldRenderer.vue`, `client/src/utils/forms/formFieldsMetadataWarningResolution.ts`, call sites invalidating **`adminMetadata`** queries
- **Server (expected touch):** `server/src/routes/internal/index.ts`, `server/src/routes/internal/admin-metadata/**`, related **primitive/relationship** metadata routes if still mounted, `server/src/db/models/admin/adminMetadata*.ts`, `server/src/routes/schemas/adminMetadata*.ts`, model `index` / associations, **new** `server/src/db/migrations/*` for table drops

## Approach
1. **Task 20.6.1.1:** Client cutover — remove or replace every **runtime** dependency on **`/admin-metadata`** (prefetch, hooks, **FieldRenderer** metadata requirement, primitive metadata editor flows) so admin builds without metadata API calls.
2. **Task 20.6.1.2:** Server + DB — remove routers, Joi validators tied only to metadata, Sequelize models/associations; add migration to **drop** metadata tables; remove **`metadataValidatorFactory`** only if no remaining internal callers.
3. After each task: **client + server lint**, **app start** smoke on key admin routes; log decisions in **`session-20.6.1-log.md`** at session-end.

## Checkpoint
- **`/accepted-code`** then **implementation** per task orders; **`/task-end`** after each task; **`/session-end 20.6.1`** when both tasks complete.
- Run **§9.1 / §9.1a** drift checklist at session end; note metadata removal in **`DOMAIN_REWRITE_WORKLOG.md`** if not already reflected.

## Deliverables
- No remaining **`fetch`** / **`apiClient`** calls to **`/admin-metadata`** from `client/src`.
- No **`['adminMetadata']`** query cache population in router or composables (remove or replace with non-metadata data sources).
- Server: **`/admin-metadata`** router unmounted; metadata models removed from runtime graph; migration file(s) to drop tables listed in **§6.3a**.
- **`session-20.6.1-guide.md`** objectives checked; **`session-20.6.1-handoff.md`** updated with **Next Action** → **`/session-start 20.6.2`** (or **`/session-end`** then next session).

## Acceptance Criteria
- [ ] Admin app loads and critical entity admin paths work without metadata API (define smoke list in task planning).
- [ ] `cd client && npm run lint` and `cd server && npm run lint` pass.
- [ ] No references to removed routes in client; server `tsc` / build clean.
- [ ] Migration authored for metadata table drops; execution only on allowed **DB_HOST**.

## Decomposition
- **Task 20.6.1.1:** **Client cutover** — Remove admin-metadata API usage, prefetch, and field-metadata-dependent UI paths; replace with explicit config / entity patterns per Implementation Orders.
- **Task 20.6.1.2:** **Server + migrations** — Remove metadata routes, models, validators; add DDL migration(s); verify internal index and associations compile.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
