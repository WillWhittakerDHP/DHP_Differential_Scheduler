# Plan: session 20.2.1 — Block shape & block instance API alignment

## Contract
- **Tier:** session | **ID:** 20.2.1
- **Scope:** Internal **entity** routes for `blockShape` and `blockInstance`: validate canonical five `type` values on shapes and three instance booleans on instances; align sanitizers and any added Joi checks with Sequelize models (Phase 20.1 schema).
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
Phase **20.1** schema is in place (`block_shapes.type` and `block_instances.composite` / `orchestrator` / `wizardVisible`). Phase **20.2** session **20.2.1** is the first API slice: harden **generic** `/internal/entities` CRUD for these two entity keys so admin batch loads and saves cannot send legacy type tokens or invalid payloads.

## Story
**This session delivers** server-side validation and sanitization alignment for **block shape `type`** and **block instance three-property fields** on internal entity routes **so that** later sessions (event APIs, booking) can assume consistent HTTP contracts matching `FEATURE_20` §5.1 and `ARCHITECTURE.md` §8–§9.

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
Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant to this tier.

- **Paths reviewed:** `server/src/routes/internal/entities/entityCrudRouter.ts`, `entitySanitizers.ts`, `entityConstants.ts`; `server/src/routes/schemas/entitySchemas.ts` (minimal `entityBodySchema`: `.unknown(true)`); `server/src/db/models/admin/block_shape.ts`, `server/src/db/models/booking/block_instance.ts`; `client/src/constants/blockShapeTypes.ts` (canonical five types).
- **Patterns / call sites:** All entity POST/PUT/PATCH flows use **`sanitizeEntityDataForCreate/Update`** per `entityType`; **block instance** sanitizer currently only normalizes `agentPermissions`. **Block shape** has no dedicated sanitizer branch yet. **Sequelize** already restricts `block_shapes.type` to ENUM `user|service|time|event|price` and defines the three booleans on `block_instances`.
- **Gaps / unknowns:** Whether any **batch** or non-CRUD path bypasses sanitizers (search during implementation); whether responses need stripping of deprecated keys (out of scope unless surfaced in this session).

## Analysis
- **Problem:** Generic entity CRUD accepts almost any body (`entityBodySchema` is permissive). Legacy **`block_shapes.type`** values (`property`, `option`, `coupon`) or mistyped instance flags could still be sent until validation fails deep in Sequelize or slips through coercions.
- **Boundaries:** **Server-only** route layer + sanitizers; mirror canonical five types with **`client/src/constants/blockShapeTypes.ts`** / `ARCHITECTURE.md` §8. No booking resolution on server.
- **Patterns:** Extend **`sanitizeEntityDataForCreate` / `sanitizeEntityDataForUpdate`** for `blockShape` (reject or map legacy type strings with clear 400 messaging if product requires); add **`sanitizeBlockInstancePrimitiveFields`** extensions for boolean coercion only where safe. Prefer **named helpers** in `entitySanitizers.ts` or a small `blockEntityValidation.ts` imported from router layer before `updateRecord` — keep **`entityCrudRouter`** branch count manageable per function governance.
- **Risks:** Breaking admin saves if clients still emit old type strings — document in task if migration/backfill is separate (20.5); prefer explicit 400 with message over silent map unless plan says otherwise.
- **Alternatives:** Per-route Joi only for `blockShape`/`blockInstance` — heavier duplication; rejected in favor of central sanitizer + optional thin Joi fragment keyed by `entityType` in middleware (evaluate in task 1).

## Goal
For **`blockShape`** and **`blockInstance`** entity keys on internal **`/internal/entities`** CRUD: reject invalid **`type`** and non-boolean / missing handling for **`composite`**, **`orchestrator`**, **`wizardVisible`** consistently with Sequelize models; keep responses as raw rows (no computed booking fields).

## Files
- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §5.1 (rows for block shape / block instance), `phase-20.2-guide.md` §8.2 acceptance checks, `.project-manager/ARCHITECTURE.md` §8–§9.
- **Implementation:** `server/src/routes/internal/entities/entitySanitizers.ts`, `entityCrudRouter.ts` (only if a pre-flight validation hook is needed), `server/src/routes/schemas/entitySchemas.ts` (optional stricter schema by `entityType` via dynamic validation — only if chosen in task), `server/src/db/models/admin/block_shape.ts`, `server/src/db/models/booking/block_instance.ts` (reference only unless model tweak required).

## Approach
1. Add **block shape `type`** allowlist validation (five strings) on create/update payloads; return **400** with stable error text for legacy tokens if we choose reject over map.
2. Extend **block instance** sanitization to ensure the three booleans are present as booleans when provided; strip or reject unknown keys only if project policy requires (default: rely on Sequelize + existing unknown keys in body already pass through — focus on the three fields + `agentPermissions` already handled).
3. Smoke: PUT/PATCH a block shape and block instance via existing patterns (or document manual Thunder Client) without introducing tests (project suspended).
4. Run **server lint**; note **FEATURE_20 §9.1** drift line in `DOMAIN_REWRITE_WORKLOG.md` when done.

## Checkpoint
- Confirm no change introduces **server-side** fee/time **resolution** endpoints.
- After **task 20.2.1.1**, shapes cannot persist illegal `type` values through the happy path.
- After **task 20.2.1.2**, instance three-property fields round-trip through entity CRUD used by admin.

## Deliverables
- Updated **`entitySanitizers.ts`** (and any small validation module) for `blockShape` + `blockInstance`.
- Optional **`entitySchemas.ts`** or route-level validation if decomposition chooses stricter Joi.
- Short note in **`DOMAIN_REWRITE_WORKLOG.md`** for session 20.2.1 API decisions.

## Decomposition
- **Task 20.2.1.1:** **Block shape `type` validation** — Allowlist `user|service|time|event|price` on create/update; clear errors for legacy values; wire through all entity CRUD entry points that use sanitizers for `blockShape`.
- **Task 20.2.1.2:** **Block instance three-property fields** — Validate/coerce `composite`, `orchestrator`, `wizardVisible` on create/update; align with `block_instance` model; verify interaction with existing versioning hooks in `entityCrudRouter`.

## Acceptance Criteria
- [ ] `blockShape` create/update rejects `type` outside the five canonical domain types (or documents explicit legacy mapping if product chooses map over reject).
- [ ] `blockInstance` create/update accepts boolean `composite`, `orchestrator`, `wizardVisible` consistent with DB columns; invalid types yield 400 or Sequelize validation errors surfaced via existing `handleRouteError` path (no empty catches).
- [ ] No new server endpoints compute booking totals or PartFinalizer-equivalent aggregates.
- [ ] `cd server && npm run lint` passes after tasks.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved at session-end
- [ ] Tasks **20.2.1.1** and **20.2.1.2** complete (`/task-end` each)
- [ ] Session log and handoff updated at **session-end**

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.2-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
