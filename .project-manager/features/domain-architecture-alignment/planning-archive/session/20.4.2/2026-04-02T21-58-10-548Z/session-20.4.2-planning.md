# Plan: session 20.4.2 — Remove differential-role enrichment; narrow PartFinal (§8.4 / §4.3)

## Contract
- **Tier:** session | **ID:** 20.4.2
- **Scope:** Remove **`enrichBlockFinalsWithDifferentialRoles`** from the booking pipeline; drive layout/scheduling inputs from **event_assignments + event shape placement** (`placement_kind`, `anchor_edge`) and instance grouping; narrow or remove **`PartFinal.major` / `minor` / `minimizer`** per FEATURE_20 **§4.3**; update first-party booking consumers in the same vertical slice. **PartFinalizer stays client-side**; no server-side booking calculator.
- **Governance (harness snapshot):** Session context; function/component audits clean at start; advisory items elsewhere in repo do not block this session’s scope.

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
Session **20.4.1** completed: pipeline map + consumer inventory in `session-20.4.1-log.md`; safe dead-code removed (`mergeBlockDifferentialRoleOverrides`; empty overrides in `appointmentSlotBuilder`). This session executes the first substantive **§8.4** slice: drop role **enrichment** and move toward placement-derived structure.

## Story
**This session delivers** a booking pipeline slice where block/part finals no longer depend on a dedicated **`enrichBlockFinalsWithDifferentialRoles`** stage and **PartFinal** role ternaries are removed or replaced by data tied to **event instances + placement**, **so that** later tasks (slot shape, time axis, minimizer, perspective — this session or follow-ons) align with FEATURE_20 **§4.2** target ordering and **§4.3** removals without breaking lineage or zero-out ordering.
**Estimated size:** M (two tasks; touches core `client/src/utils/booking/` paths)

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

- **Paths reviewed:**
  - `client/src/utils/booking/partFinalizer.ts` — defines **`enrichBlockFinalsWithDifferentialRoles`**, **`differentialRolesForEventShape`**, **`filterZeroedParts`**; imports **`DifferentialRole`**, **`effectiveDifferentialRole`**, **`eventShapeDifferentialRoleFromPlacementFields`**.
  - `client/src/utils/booking/appointmentSlotBuilder.ts` — pipeline calls **`enrichBlockFinalsWithDifferentialRoles`** after **`buildEventAssignmentsByPartShape`**; passes **`differentialEventRoleOverrides: {}`** (post–20.4.1.2).
  - `client/src/utils/booking/PartFinal.ts` + `client/src/types/booking/partFinal.ts` — **`createPartFinal`** seeds **`major` / `minor` / `minimizer`** as default `'false'`; type documents minimizer **`override`** semantics (phase 6.16).
  - `shared/utils/differentialRoleUtils.ts` — **`effectiveDifferentialRole`**, **`parseDifferentialRole`**, override sanitization.
  - `shared/utils/eventPlacementUtils.ts` — **`eventShapeDifferentialRoleFromPlacementFields`** (placement → stored role).
  - `client/src/utils/eventAttendeeUtils.ts` — same placement + effective role pattern for attendee/event UI.
  - `client/src/utils/booking/partFinalizerSlotShapeHelpers.ts`, `availabilityStepData.ts`, `appointmentSlotsComputeds.ts` — major/minor **event names** and slot bounds (related but not identical to PartFinal ternaries).
  - Admin: `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue` — UI for overrides (booking pipeline currently passes empty overrides).
  - Server: `server/src/routes/internal/entities/eventShapeLegacyDifferentialRoleKeys.ts` (imported from validation/sanitizers) — legacy keys; out of scope for client pipeline unless shared types change.
- **Patterns / call sites:** Current chain matches FEATURE_20 **§4.1**: … → **`enrichBlockFinalsWithDifferentialRoles`** → **`calculateSlotShape`** → **`applyShapeToTime`** → perspective / minimizer (see `appointmentSlotBuilder` and related imports). Role resolution combines **event shape placement** with optional **per-shape-id overrides** into **ternary** `major`/`minor`/`minimizer` on each **`PartFinal`**.
- **Gaps / unknowns:** Exact downstream consumers of **`PartFinal.major|minor|minimizer`** inside **`calculateSlotShape` / `applyShapeToTime` / `perspectiveResolver` / `minimizerSchedulingBounds`** need line-level inventory in **task 20.4.2.1** before deleting fields. Whether **`differentialRoleUtils`** can shrink in this session vs a later grep-clean pass depends on admin + **`eventAttendeeUtils`** still using **`effectiveDifferentialRole`**.

## Analysis
- **Problem / why now:** Phase **20.4** session **20.4.1** documented the pipeline and removed only confirmed dead code. Session **20.4.2** is the first **behavioral** step toward FEATURE_20 **§4.3**: stop treating “differential role” as a separate enrichment pass on finals; express scheduling/placement from **event instances + placement data** and grouping, preserving **lineage** and **§4.4** resolution order.
- **Domain boundaries:** Primarily **booking** (`client/src/utils/booking/*`, composables/steps that consume slots). **Shared** (`@shared` placement + differential role types) may change only if booking still compiles and admin contracts remain valid. **Server** booking persistence is unchanged (no PartFinalizer on server).
- **Child tier patterns:** Prefer **replacement-before-delete**: thread placement/instance-derived inputs through the same choke points (`buildAppointmentShape` / slot builder), then remove **`enrichBlockFinalsWithDifferentialRoles`** and **`PartFinal`** role fields when grep-clean. Keep **zero-out** and lineage ordering explicit in task planning.
- **Risks:** Regressions in **AvailabilityStep** / minimizer / perspective if slot shape inputs change before consumers are updated. Mitigation: task **20.4.2.1** ends with lint + targeted manual smoke; **20.4.2.2** covers downstream layout helpers.
- **Alternatives:** Big-bang delete of `@shared/differentialRole*` — **rejected** for this session if admin and **`eventAttendeeUtils`** still need it; prefer narrow booking-path removal first, §6.2 shared cleanup when grep-clean.

## Goal
Complete **FEATURE_20 §8.4 — Pass 4 (Booking pipeline alignment)** on branch `feature/domain-architecture-alignment`: remove differential-role **pipeline** enrichment where placement + instances suffice; rewrite **grouping, slot shape, time-axis application, minimizer bounds, and perspective** inputs to use **event shapes / instances + placement**; delete or rewrite **§6.2**-listed shared paths when no longer referenced; **PartFinalizer stays client-side**.

## Files
- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§4, §4.2–4.4, §6.2, §8.4), `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` (§4.4 where cited), `.project-manager/ARCHITECTURE.md` §8–§14
- **PM / harness:** `phases/phase-20.4-guide.md`, `phases/phase-20.4-planning.md` (this file), `feature-domain-architecture-alignment-guide.md`, `DOMAIN_REWRITE_WORKLOG.md`
- **Implementation (expected hotspots):** `client/src/utils/booking/partFinalizer.ts`, slot/shape helpers (e.g. `partFinalizerSlotShape*`, `calculateSlotShape`, `applyShapeToTime`), `perspectiveResolver`, `minimizerSchedulingBounds` / `minimizerEventShapes`, shared `shared/**/differentialRole*` or client mirrors, booking composables that assume **major/minor/minimizer** on **PartFinal**

## Approach
1. **Map** current pipeline stages to FEATURE_20 **§4.2**; note every import of **`DifferentialRole`**, **`enrichBlockFinalsWithDifferentialRoles`**, and **PartFinal** role fields before editing.
2. **Session order:** audit + safe dead-code → **remove role enrichment / narrow PartFinal** → **slot + time axis** → **minimizer + perspective + shared cleanup** (adjust if discovery shows tighter coupling).
3. **Replacement-before-delete:** migrate call sites to **placement + instance/segment** inputs, then remove shared utilities per **§6.2** when grep is clean.
4. **Testing:** Suspended project-wide — **lint**, **typecheck**, manual booking smoke on representative wizard paths per Definition of Done.
5. After **phase-end:** update **phase-20.4-guide** checkboxes, **phase log**, **handoff** for **20.5** (or next planned phase).

## Checkpoint
- **Before `/accepted-plan`:** This **Decomposition** matches **§8.4** scope; sessions are ordered so **zero-out / grouping order** is not violated (§4.4).
- **Per session:** No new server-side PartFinalizer; lineage + zero-out ordering preserved or explicitly documented if intentionally changed (requires plan amendment).
- **Before `/phase-end 20.4`:** Grep shows no booking-pipeline **requirement** for differential-role enrichment for layout (admin may still have transitional strings — out of scope unless duplicated in booking).

## Deliverables
- Grep-backed inventory (in **task 20.4.2.1** planning or session log) of every reader of **`PartFinal.major` / `minor` / `minimizer`** and of **`enrichBlockFinalsWithDifferentialRoles`**.
- Booking pipeline updated so **`enrichBlockFinalsWithDifferentialRoles`** is removed or reduced to a no-op bridge **only** if an interim step is required (prefer full removal within the session).
- **`PartFinal`** type and **`createPartFinal`** aligned with **§4.3** (role ternaries removed or replaced by placement/segment-linked fields) **or** explicitly documented interim if two-step migration is required across 20.4.2.1 / 20.4.2.2.
- **`calculateSlotShape`**, **`applyShapeToTime`**, and related helpers updated in **20.4.2.2** to use **placement / segment** inputs rather than role flags, or task scope narrowed with explicit follow-up documented if coupling forces it.
- Client (+ server if touched) **lint** clean; **app starts**; session **log** + **handoff** updated at **session-end**.

## Decomposition
- **Task 20.4.2.1:** **Remove role enrichment + narrow PartFinal** — Inventory all consumers of **`enrichBlockFinalsWithDifferentialRoles`** and **`PartFinal` role fields**; implement replacement data path from **event_assignments + event shape placement** (and instance grouping) through block/part finals; remove **`enrichBlockFinalsWithDifferentialRoles`** from **`appointmentSlotBuilder`** / **`partFinalizer`**; update **`PartFinal`** / **`createPartFinal`** and fix immediate compile/runtime breakages.
- **Task 20.4.2.2:** **Slot shape, time axis, perspective, minimizer** — Rewrite **`calculateSlotShape`**, **`applyShapeToTime`**, **`perspectiveResolver`**, **`minimizerSchedulingBounds`** / related to consume the new structure; remove dead imports; begin **§6.2** shared cleanup only where grep shows no remaining booking dependency.

## Acceptance Criteria
- Pipeline ordering intent matches FEATURE_20 **§4.2** / Principles **§4.4** (no new server-side finalizer; zero-out and lineage rules preserved or any intentional change documented in the task log).
- Placement semantics come from **event shape / instance data**, not a reintroduced “compute role flags then paste on PartFinal” enrichment step.
- **`grep`** shows no remaining **booking** call to **`enrichBlockFinalsWithDifferentialRoles`** after **20.4.2.1** (or documented waiver with follow-up task id).
- **Lint** passes on **`client/`** and **`server/`**; **`npm run start:dev`** starts after the session’s code changes.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.4-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.4.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
