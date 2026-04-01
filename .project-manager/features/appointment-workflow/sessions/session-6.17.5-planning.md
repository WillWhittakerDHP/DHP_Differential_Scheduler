# Plan: session 6.17.5 — Entity-policy rollout + documentation

## Contract
- **Tier:** session | **ID:** 6.17.5
- **Scope:** Entity-policy rollout + documentation (registry expansion + client allowlist sync + operator docs)
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
Session **6.17.4** shipped generic **list + entity card** entry points that funnel **`partShape`** deletes through **`AdminEntityDeleteWizard`** + preflight/finalize; server registry currently registers **`partShape` only** (`dependencyDeleteRegistry.ts`). Session **6.17.5** expands **policies to additional shape keys** and documents how to add more without copy-paste. <!-- harness-across-ladder:start -->

## Story
**This session delivers** registered **dependency-delete strategies** for **`blockShape`** and **`annotationShape`** (plus client allowlist + list wiring where those entities use generic delete), **and** an up-to-date **extension guide** **so that** operators get the same preflight/wizard experience as **`partShape`**, and future entity keys follow one documented path (server strategy + client mirror + surfaces).
**Estimated size:** M (two tasks: server domain work + client/docs)

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

- **Paths reviewed:** `server/src/services/entityDelete/dependencyDeleteRegistry.ts` (only **`partShape`** strategy today); `server/src/services/entityDelete/strategies/partShapeDependencyDeleteStrategy.ts` (pattern for preflight nodes, `canDirectDelete`, finalize transaction); `client/src/utils/admin/dependencyDeleteContractKeys.ts` + `usesDependencyDeleteContract` (client mirror must stay in sync); `client/src/views/admin/entities/PartShapeList.vue` (wizard + `entityListDelete` `contractDelete`); `client/src/views/admin/entities/BlockShapeList.vue` (exists — likely still raw delete until wired); `client/src/components/admin/generic/EntityCard.vue` + `useEntityCardActions.ts` (contract path already keyed off allowlist); `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md` (contract doc; status line still “spec only” — update when rollout is real); `phase-6.17-guide.md` §First rollout entities (`partShape`, `blockShape`, `annotationShape`).
- **Patterns / call sites:** New keys require **(a)** `DependencyDeleteStrategy` implementation + **registry** entry using `ENTITY_KEYS.*`; **(b)** client **`DEPENDENCY_DELETE_CONTRACT_ENTITY_KEYS`**; **(c)** any **list** views using `entityListDelete` without `contractDelete` need the same pattern as `PartShapeList`; **EntityCard** picks up new keys automatically once allowlist matches server.
- **Gaps / unknowns:** **Annotation shape** admin list surface may not mirror `BlockShapeList`/`PartShapeList` naming — search `annotationShape` views during **6.17.5.2**; dependency counts for block/annotation shapes may need **new server count helpers** (mirror `countPartShapeDeleteDependencies` pattern). Confirm **`ENTITY_KEYS`** string values match API `entityType` segments.

## Analysis
- **Problem / why now:** Phase **6.17** success criteria require rollout beyond **`partShape`** and documentation for adding entities. Infrastructure and generic UI wiring exist; remaining work is **domain-specific strategies** + **client allowlist alignment** + **operator-facing extension doc**.
- **Domains:** Admin config **server** (delete strategies, Sequelize), **client** admin (allowlist, list wiring), **project-manager docs** — no booking pipeline change.
- **Boundaries:** Reuse **`@shared/types/adminDeleteDependency`**; do not invent new policy strings. Keep **thin** list components: wizard + `invalidateQueries(['globalData'])` on `@finalized` like **6.17.4**.
- **Child task patterns:** Follow **`partShapeDependencyDeleteStrategy`** structure (preflight graph, `canDirectDelete`, finalize with transaction); extract heavy counting to dedicated modules under `server/src/services/` as needed for governance.
- **Risks:** **blockShape** / **annotationShape** dependency graphs may be **more complex** than part shape — scope each task to **documented** dependencies from phase guide; if a key is not ready, register only after counts/finalize are correct (no stub that lies in preflight). **Composable return surface** (`useEntityCardSaveAndActions`) is already large — prefer **not** expanding it in this session; split is a **future** governance item unless a task forces a change.
- **Alternatives:** Single mega-task — rejected (session gate profile expects **two** harness tasks). Per-entity sessions — rejected (phase already batches rollout in **6.17.5**).

## Goal
Register **dependency-delete policies** on the server for **`blockShape`** and **`annotationShape`**, keep the **client allowlist** in lockstep with **`dependencyDeleteRegistry`**, wire **generic admin list delete** for those keys where applicable, and update **delete-preflight / phase** documentation so new entity keys have a **checklist** (server strategy + registry + client keys + list/card behavior).

## Files
- `server/src/services/entityDelete/dependencyDeleteRegistry.ts` — add strategy entries
- `server/src/services/entityDelete/strategies/*` — new or extended strategies; possible new `count*DeleteDependencies` helpers under `server/src/services/`
- `client/src/utils/admin/dependencyDeleteContractKeys.ts` — expand `DEPENDENCY_DELETE_CONTRACT_ENTITY_KEYS` in sync with server
- `client/src/views/admin/entities/BlockShapeList.vue` — `AdminEntityDeleteWizard` + `contractDelete` pattern (if not already)
- Other admin views for **annotation** shapes (discover during task **6.17.5.2**)
- `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md` — implementation status + “how to add an entity”
- `phases/phase-6.17-guide.md` / `session-6.17.5-guide.md` — session checklist alignment as needed

## Approach
1. **Task 6.17.5.1 (server):** Implement strategies for **`blockShape`** and **`annotationShape`** (preflight counts, blocked vs ready, finalize deletes consistent with FK/participation rules); register in **`dependencyDeleteRegistry`**; verify routes already mounted in **6.17.2** serve new types.
2. **Task 6.17.5.2 (client + docs):** Update **`dependencyDeleteContractKeys.ts`**; wire **list** entry points to match **PartShapeList**; confirm **EntityCard** covers new keys via allowlist; refresh **delete-preflight-api-v1.md** and short **phase/session** notes for extension steps.
3. **Verification:** `npm run start:dev` sanity; `cd client && npm run lint` and `cd server && npm run lint`; manual delete flows for each new key from **list + card** where exposed.

## Checkpoint
- **`blockShape`** and **`annotationShape`** return **accurate** preflight from live API; finalize succeeds for **clean** rows and blocks or guides when dependencies exist (per policy).
- Client **allowlist** matches server registry **exactly** (comment references **`dependencyDeleteRegistry.ts`**).
- Documentation lists **ordered steps** to add a **new** `GlobalEntityKey` to the contract path.

## Deliverables
- Extended **server** `DependencyDeleteStrategy` registry with **block** + **annotation** shape behavior.
- Extended **client** contract allowlist + **list** wiring for those keys (every generic-delete surface that applies).
- Updated **delete-preflight-api-v1.md** (and minimal phase/session doc touch-ups) describing **rollout complete** and **how to extend**.

## Acceptance Criteria
- [ ] Server: `getDependencyDeleteStrategy` returns a strategy for **`blockShape`** and **`annotationShape`** (using canonical `ENTITY_KEYS` values).
- [ ] Client: `usesDependencyDeleteContract` is true for exactly the **same** keys registered on the server (single source comment for sync).
- [ ] Operators: deleting from **admin list** and **entity card** for each rolled-out key uses **`AdminEntityDeleteWizard`** (no raw-only path for those keys when dependencies matter).
- [ ] Docs: extension checklist committed; **delete-preflight** doc reflects **implemented** status for v1 handlers + rollout notes.
- [ ] Lint + typecheck pass on touched **client** and **server** paths.

## Decomposition
- **Task 6.17.5.1:** **Server** — `blockShape` + `annotationShape` dependency-delete strategies, dependency counting helpers, registry wiring, structured errors unchanged from existing contract.
- **Task 6.17.5.2:** **Client + documentation** — sync `dependencyDeleteContractKeys`, wire **BlockShapeList** (and any **annotation** list), invalidate `globalData` on finalize, update **delete-preflight-api-v1.md** + brief phase/session guide notes for “add a new entity.”

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.17.4-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
