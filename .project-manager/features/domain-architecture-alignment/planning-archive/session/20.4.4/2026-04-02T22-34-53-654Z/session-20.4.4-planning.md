# Plan: session 20.4.4 — Perspective, minimizer, and shared differential-role cleanup

## Contract
- **Tier:** session | **ID:** 20.4.4
- **Scope:** Final **20.4** slice for FEATURE_20 **§8.4**: (1) tighten **`perspectiveResolver`** after **20.4.3** (remove dead **`resolveEventShapes`** override arity; dedupe major/minor resolution with **`derivePerspective`**). (2) Minimizer + **`AppointmentShape`** optional **`differentialEventRoleOverrides`** — simplify only where grep proves safe; preserve behavior if persisted snapshots could still carry overrides. (3) **§6.2-style** shared cleanup: **grep-first** removal of **unreferenced** `differentialRole*` symbols — **do not** delete admin/server contract types or **`DifferentialEventRoleOverridesField`** paths.
- **Governance (harness snapshot):** Session-scoped audits clean; repo-wide advisory in `client/.audit-reports/` — out of scope unless blocking.

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
Session **20.4.3** completed: placement-only **`calculateSlotShape`**; booking **`AppointmentShape`** no longer sets **`differentialEventRoleOverrides`**; **`resolveEventShapes`** / **`derivePerspective`** / minimizer call sites use single-arg resolution where applicable. **`resolveEventShapes`** still exposes an unused optional **`overrides`** parameter; **`derivePerspective`** duplicates **`resolveDifferentialMajorMinorFromEventShapes`**.

<!-- harness-across-ladder:start -->

## Story
**This session delivers** a single coherent **perspective + minimizer** story and **safe** shared **`differentialRole*`** pruning **so that** phase **20.4** closes without dead API surface and without breaking admin placement UI or **`@shared`** contracts still referenced by server/client.
**Estimated size:** M (two tasks; booking utils + shared grep)

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

- **Paths reviewed:** Ripgrep **`resolveEventShapes(`**, **`differentialEventRoleOverrides`**, **`differentialRole`** under `client/src`, `shared/`; opened **`perspectiveResolver.ts`**, **`minimizerEventShapes.ts`**, **`appointmentModels.ts`**.
- **Patterns / call sites:** All **`resolveEventShapes`** call sites use **one argument** only (post-**20.4.3**). **`resolveEventShapes`** / **`resolveEventShapesCore`** still accept optional **`overrides`** — unused. **`derivePerspective`** calls **`resolveDifferentialMajorMinorFromEventShapes`** directly instead of reusing **`resolveEventShapes`**. **`minimizerEventShapes`** keeps a **legacy override** branch; booking does **not** set **`differentialEventRoleOverrides`** today — verify persisted payloads before removing type field or branch.
- **Gaps / unknowns:** Saved wizard / appointment JSON may still carry **`differentialEventRoleOverrides`** — grep transformers before deletion.

## Analysis
- **Why now:** **20.4.3** cleared override **threading**; this session removes **dead API** and dedupes **perspective** resolution.
- **Boundaries:** **`client/src/utils/booking/*`** first; **`@shared`** edits only with **full-repo grep** (client + server importers).
- **Risks:** Deleting **`shared/types/differentialRole`** or **`differentialRoleUtils`** wholesale — **rejected**; admin (**`DifferentialEventRoleOverridesField`**) and **`eventPlacementUtils`** still use role **template** mapping.

## Design (session-level)
- **Task 1:** **`perspectiveResolver`:** Remove **`overrides`** from **`resolveEventShapes`**; implement **`derivePerspective`** via **`resolveEventShapes(eventFinals)`** + **`derivePerspectiveWithResolved`** to avoid duplicate **`resolveDifferentialMajorMinorFromEventShapes`**.
- **Task 2:** **`minimizerEventShapes`** + **`@shared` `differentialRole*`** — grep-first: simplify minimizer legacy path **only** if no writers / no payload risk; else **document deferral**; remove **only** **unreferenced** shared symbols.

## Goal
Close **phase 20.4** session **4**: perspective API matches **placement-only** booking; **no dead `resolveEventShapes` parameters**; **§6.2**-style shared pruning **grep-gated**; **admin** + **server** contracts preserved.

## Files
- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.2**, **§8.4**)
- **PM:** `phases/phase-20.4-guide.md`, `sessions/session-20.4.4-guide.md`, `sessions/session-20.4.3-handoff.md`
- **Implementation:** `client/src/utils/booking/perspectiveResolver.ts`; `client/src/utils/booking/minimizerEventShapes.ts`; `shared/utils/differentialRoleUtils.ts`, `shared/constants/differentialRoleMappings.ts`, `shared/types/differentialRole*` — **only if grep-clean**

## Approach
1. Run **20.4.4.1** then **20.4.4.2**; **`vue-tsc`** + **`npm run lint`** (`client/`) per task; **server lint** if **shared/** or **server/** touched.
2. **Grep-before-delete** for any **shared** removal.

## Checkpoint
- **Perspective** / slot **end-time** behavior unchanged for **no-override** templates.
- **Admin** **`DifferentialEventRoleOverridesField`** and block-instance saves unaffected.

## Acceptance criteria
- **`resolveEventShapes`** exposes **no** dead **`overrides`** parameter.
- **`derivePerspective`** reuses **`resolveEventShapes`** (or equivalent single path).
- **Client** ( + **shared** if touched) **typecheck + lint** clean.
- **Shared:** only **grep-verified** dead code removed; else **inventory** in task log.

## Deliverables
- Updated **`perspectiveResolver`** (+ any import fixes).
- Minimizer / **`@shared`** outcomes per task **20.4.4.2** with grep notes.

## Decomposition
- **Task 20.4.4.1:** **`perspectiveResolver`** — remove **`overrides`** from **`resolveEventShapes`**; **`derivePerspective`** through **`resolveEventShapes`**; verify **`minimizerSchedulingBounds`** / **`appointmentSlotBuilder`** compile.
- **Task 20.4.4.2:** **`minimizerEventShapes`** + **`@shared` `differentialRole*`** — grep-first cleanup; simplify legacy minimizer branch **only** if verified safe; otherwise document **deferral**.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.4-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.3-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
