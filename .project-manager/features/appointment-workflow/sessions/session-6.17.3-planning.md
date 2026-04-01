# Plan: session 6.17.3 — Reusable client delete wizard + composable/service

## Contract
- **Tier:** session | **ID:** 6.17.3
- **Scope:** ** Reusable client delete wizard + composable/service
- **Governance (harness snapshot):**
  - Governance Context (Session)
  - Function Governance
  - Clean — no violations detected.
  - Component Governance
  - Clean — no violations detected.
  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Return surface has 15 properties; decompose into focused composables
  - `client/src/composables/booking/useMinimizerPartsScheduling.ts` — oversized-return: 
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
Completed Task - Begin Session 6.17.3 <!-- harness-across-ladder:start -->

## Story
**This session delivers** a **reusable admin delete wizard** (thin UI shell) plus a **composable** and **typed HTTP helpers** that drive **preflight → optional resolve → finalize** using the v1 delete contract **so that** Session **6.17.4** can swap list/card delete entry points without duplicating orchestration or API knowledge.

**Estimated size:** **M** (new surface area: API helpers, state machine, Vuetify wizard; no generic CRUD rewiring yet).

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
| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Phase 6.18) |
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

- **`users.user_role`** is a **small closed set** (PostgreSQL ENUM + Joi + client types). **Planned (Feature 6 Phase 6.18):** a single **`@shared`** module exports **`USER_ROLE_VALUES`** and per-role constants; server and client **import** that list — no duplicate hardcoded arrays. Product rename **`seller` → `owner`** is part of Phase 6.18 Session 6.18.1.
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

- **Paths reviewed:**
  - **Shared contract:** `shared/types/adminDeleteDependency.ts` — `DeletePreflightResponse`, `DeleteResolveRequest` / `DeleteResolveResponse`, `DeleteFinalizeRequest` / `DeleteFinalizeResponse`, `DeleteResolutionAction`, `DeleteContractErrorCode`.
  - **API spec:** `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md` — GET preflight, POST resolve/finalize; same auth/CSRF as entity CRUD.
  - **Server segments:** `server/src/routes/internal/entities/entityConstants.ts` → `ENTITY_DELETE_ROUTE_SEGMENTS` (`delete-preflight`, `delete-resolve`, `delete-finalize`); handlers live on `entityCrudRouter` (6.17.2).
  - **Pilot strategy:** `server/src/services/entityDelete/strategies/partShapeDependencyDeleteStrategy.ts` — `canDirectDelete` when no deps; else `hard_blocked` edge + `blockedReasons`; resolve allows **noop-only** when direct delete allowed.
  - **Client CRUD delete today:** `client/src/utils/entityCrud/createEntityRemoveMutationOptions.ts` — one-shot `apiClient.delete(getEntityByIdEndpoint(...))` + optimistic `globalData` cache update; **no** delete-contract calls yet.
  - **List delete helper:** `client/src/utils/admin/entityListDelete.ts` — `confirm()` + `remove(id)`; will be adapted in **6.17.4**, not this session.
  - **Entity URLs:** `client/src/utils/api/entityApi.ts` — `getEntityByIdEndpoint(entityKey, id)` → `/entities/${entityKey}/${id}`; extend or sibling helpers for `.../delete-preflight` etc.
- **Patterns / call sites:** Use existing `apiClient` + entity path style; surface errors with `getApiErrorMessage` / logger patterns used elsewhere; composable exposes **explicit return type**, read-only query data as `ComputedRef` where appropriate (type-governance).
- **Gaps / unknowns:** Exact shape of axios error body for `DeleteContractErrorCode` (confirm against `entityDeleteContractResponse` / error handler on server) when implementing client parser; manual smoke with `part_shape` only after **6.17.4** wires callers (this session can expose dev-only trigger or story if needed).

## Analysis
- **Problem / why now:** Server **6.17.2** implements real preflight/resolve/finalize for at least **`part_shape`**. Without a shared client orchestration layer, **6.17.4** would duplicate URL construction, token handling, and step logic across list and card.
- **Domain boundaries:** **Admin client** only (`client/src/composables/admin/`, `components/admin/`, `utils/admin/`). **Shared** types are **import-only** from `@shared/types/adminDeleteDependency` — no new shared types unless both sides need them (unlikely this session). **Server** unchanged unless a small contract bug is found (defer to hotfix).
- **Patterns to follow:** Thin SFC; orchestration in composable; named HTTP functions (no reactivity in utils); align with `apiClient`, `entityApi` paths, and TanStack Query **only** where this session explicitly invalidates `globalData` on successful finalize (composable may accept an `onFinalized` callback so **6.17.4** can tie into existing `remove` optimistic patterns).
- **Risks:** Policy-specific UI for `reassign_required` / `confirm_bulk_remove` may be stubbed with clear copy if server does not yet emit those edges for registered keys — wizard must still **render** graph edges and call resolve with **typed** actions when the UI collects them.
- **Out of scope (6.17.4):** Replacing `entityListDelete`, entity card actions, or `createEntityRemoveMutationOptions` with automatic wizard open.

## Goal
Ship **reusable client building blocks** for dependency-aware delete:
1. **URL helpers + API module** — GET preflight, POST resolve, POST finalize; responses typed from `@shared`; parse structured error codes when present.
2. **Composable** — Drives flow: load preflight → present steps (direct-delete confirm vs blocked vs future interactive edges) → call resolve when needed → finalize; tracks `preflightToken` / `nextPreflightToken` per contract; explicit exported return type.
3. **Wizard shell component** — Vuetify dialog/stepper (or equivalent existing admin pattern); props: entity key, id, display label; emits **finalized** / **cancel**; **no** coupling to list or card.

**Session success does not require** end-user wiring from every admin entry point (**6.17.4**).

## Files
- **New (planned):**
  - `client/src/utils/api/entityApi.ts` (extend) **or** `client/src/utils/admin/entityDeleteContractApi.ts` — path builders + three API functions.
  - `client/src/composables/admin/useAdminEntityDeleteWizard.ts` — orchestration + state.
  - `client/src/components/admin/.../AdminEntityDeleteWizard.vue` (exact folder: align with `components/admin/generic/` conventions).
- **Reference only:** `delete-preflight-api-v1.md`, `shared/types/adminDeleteDependency.ts`, `phase-6.17-guide.md`, `session-6.17.2-handoff.md`.

## Approach
1. Add **delete-contract URL builders** next to existing entity endpoints (single source for path shape).
2. Implement **plain async API functions** (GET/POST with JSON) returning typed bodies; centralize **error extraction** (HTTP status + optional `code` from server) without swallowing errors.
3. Implement **composable**: `openPreflight()`, `applyResolutions()`, `finalize()`, `reset()`; expose readonly refs for `preflight`, `loading`, `error`, `phase` (discriminated or enum); handle **`canDirectDelete`** shortcut and **`hard_blocked`** (no finalize).
4. Implement **wizard component** that binds to composable (or receives injected state factory) and shows nodes/edges in a readable list; primary actions: **Cancel**, **Continue** / **Delete** when allowed.
5. **Manual verification:** Dev-only entry or temporary button is acceptable; full list/card integration is **6.17.4**.

## Checkpoint
- Composable + API module are unit-test-shaped (flat return object; no `Ref|ComputedRef` unions at boundary).
- Wizard renders **part_shape** preflight for both **empty** (direct) and **blocked** graphs without crashing.
- Lint passes on touched files; app starts.

## Deliverables
- Typed client API for the three delete-contract endpoints.
- `useAdminEntityDeleteWizard` (or finalized name) with explicit return type and documented public contract.
- Reusable wizard dialog component wired to the composable.
- Planning doc + session guide excerpts updated if harness requires; session log on **session-end**.

## Decomposition
- **Task 6.17.3.1:** **Delete-contract client API + URL helpers** — mirror `ENTITY_DELETE_ROUTE_SEGMENTS`, typed request/response, structured error parsing; no Vue.
- **Task 6.17.3.2:** **`useAdminEntityDeleteWizard` + `AdminEntityDeleteWizard` shell** — step flow, blocked vs direct-delete UX, resolve/finalize orchestration, emits for parent integration in 6.17.4.

## Coverage check (session planning)
**If this is the goal, have we outlined enough steps to enact it?** **Yes.** Task **6.17.3.1** covers all server I/O and types; Task **6.17.3.2** covers user-visible orchestration and reusable UI. **6.17.4** is explicitly separate for wiring `entityListDelete`, entity card, and mutations.

## Acceptance criteria (session 6.17.3)
- [ ] Client can call preflight/resolve/finalize with **typed** shared DTOs and correct paths under `/entities/:entityType/:id/...`.
- [ ] Composable exposes a **stable, test-friendly** public API (explicit return type; action methods for transitions).
- [ ] Wizard component is **reusable** (props/emits only — no hard dependency on list or entity card).
- [ ] **`part_shape`** graphs render: **direct delete** path (finalize after noop/confirm) and **hard_blocked** path (explain block, no finalize).
- [ ] **6.17.4** can integrate via composable + dialog open without copying API code.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`; server lint if server touched)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.17.2-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
