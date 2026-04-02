# Plan: session 20.3.3 — Remaining domain editors (FEATURE_20 §8.3 #3)

## Contract
- **Tier:** session | **ID:** 20.3.3
- **Scope:** Remaining instance-level editors for **time** and **price** block instances (atomic part ledger UX, mirroring 20.3.2); **event** block-instance orchestration copy and field presentation (validity-constrained selection language) without segment relocation (that is **20.3.4**).
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
Completed Task - Begin Session 20.3.3 <!-- harness-across-ladder:start -->

## Story
**This session delivers** (1) **time** and **price** counterparts to the **service** convergence table pattern from **20.3.2**, and (2) clearer **event** block-instance admin copy and field framing aligned with **orchestrators as active assignment selectors** — **so that** §8.3 item **#3** is satisfied before **segment relocation (20.3.4)**.

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

- **Paths reviewed:**
  - `client/src/composables/admin/useServiceAtomicPartRows.ts` — **service-only** gate; `partAssignments` resolution pattern to generalize or parallel for **time** / **price**
  - `client/src/components/admin/generic/ServiceAtomicEditor.vue` — VCard + VDataTable + `partInstance` **update** pattern
  - `client/src/components/admin/generic/EntityCardContent.vue` — conditional mount pattern for **blockInstance** editors
  - `client/src/constants/blockShapeTypes.ts` — `TIME`, `PRICE`, `EVENT`, `SERVICE`
  - `client/src/types/entities.ts` — `PartInstanceEntity` fields today (**base**/rate scalars only on client type; no `timePerUnit` / `feePerUnit` in TS yet)
  - `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts` — block instance field presentation
  - `client/src/composables/admin/useEntityCardFormSetup.ts` — `composite` detection; three-property model surfaces on **blockInstance**
  - `phase-20.3-guide.md` — §8.3 sequence: **#3** remaining domain editors before **#4** segment manager relocation
- **Patterns / call sites:** **20.3.2** established **one composable + one editor component + EntityCardContent** wiring per **shape type** for part-ledgers. **20.3.3** should **reuse** that structure (extract shared table/update helper if duplication crosses governance thresholds) rather than inventing a second admin paradigm.
- **Gaps / unknowns:** Whether **time**/**price** product priority needs **additional** part columns later (per ARCHITECTURE §10 *PerUnit* language); if absent in API/types, stay with current **`PartInstanceEntity`** scalar set until a future pass adds fields.

## Analysis
- **Problem / why now:** **20.3.1** (placement) and **20.3.2** (service atomic) are done. §8.3 **#3** requires **parity** for other scheduling domains (**time**, **price**, **event**) at the **instance** card level so admins do not fall back to opaque generic fields only.
- **Boundaries:** **Client admin** only; **no** new booking math; **no** server PartFinalizer; **no** segment-island move (deferred to **20.3.4**).
- **Dependencies:** Reuse **`blockInstancePartsTotalsResolution`** + **`useEntityCrud('partInstance')`** patterns from **20.3.2**.
- **Risks:** Copy-heavy task (**20.3.3.2**) can sprawl — keep changes in **display metadata**, **tooltips**, or a **small** presentational component; avoid rewriting **RelationshipCollection** internals in this session.
- **Alternatives:** Single mega-composable for all shape types — **rejected** for readability; prefer **shared utility** + **thin per-type composable** or **parameterized** gate list if duplication is mechanical.

## Goal
Close **FEATURE_20 §8.3 #3** for this feature branch: deliver **time**- and **price**-shaped **block instance** part-ledger editors analogous to **ServiceAtomicEditor**, and improve **event** **block instance** admin **copy / field framing** for orchestration-related surfaces using **validity-constrained selection** language — **without** implementing **segment manager relocation** (session **20.3.4**).

## Files
- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§3, §6, §8.3, §9.1), `.project-manager/ARCHITECTURE.md`
- **PM / harness:** `phases/phase-20.3-guide.md`, `phases/phase-20.3-planning.md` (this file), `feature-domain-architecture-alignment-guide.md`, `DOMAIN_REWRITE_WORKLOG.md`
- **Implementation (expected hotspots):** `client/src/views/admin/**`, `client/src/components/admin/**`, `client/src/composables/admin/**`, `client/src/configs/field/**`, `client/src/types/admin/**`, `client/src/types/entities.ts`, `client/src/utils/admin/**`, `client/src/utils/transformers/entityTransformers.ts`

## Approach
1. **Task 20.3.3.1:** Add **time** and **price** gated composables (or one parameterized composable) + **editor component(s)** mounted from **`EntityCardContent`** for **`blockInstance` && !isNew**, mirroring **ServiceAtomicEditor** (convergence / work-item copy adjusted per domain).
2. **Task 20.3.3.2:** **Event** `blockInstance` — targeted **label / description / display** updates (`blockInstanceDisplays`, optional small helper component) so **orchestrator** / **wizardVisible** / relationship UI reads as **choosing among shape-valid options**, not redefining structure.
3. Run **§9.1 drift checklist** at **session-end**; **lint + vue-tsc** per task; manual Instances-tab smoke for **time**, **price**, **event** shapes.

## Checkpoint
- **After 20.3.3.1:** **Time** and **price** service cards show editable part tables when shape type matches; **service** cards unchanged; **lint/type-check** clean.
- **After 20.3.3.2:** **Event** block instance cards show updated copy on agreed fields; no change to **eventShape** placement editor from **20.3.1**.
- **Before `/session-end 20.3.3`:** §9.1 checklist recorded in session notes; session log + handoff updated.

## Deliverables
- [ ] **Time** + **price** atomic / convergence part tables (composable + UI + **EntityCardContent** wiring).
- [ ] **Event** block-instance orchestration-related **admin copy** and display tweaks (scoped list in task plan).
- [ ] **§9.1** drift checklist completed in session log or handoff.
- [ ] No new server endpoints; PartFinalizer unchanged.

## Acceptance Criteria
- [ ] **Orchestration / atomic** language matches §8.3 acceptance: selectors, not validity definers, on touched surfaces.
- [ ] **Shapes** tab / shape editors remain **structural** — no instance-only business moved onto shape cards in this session.
- [ ] **Client** `npm run lint` and `npm run type-check` pass after tasks.
- [ ] Manual smoke: at least one **time**, one **price**, one **event** block instance card in admin shows expected new UX.

## Decomposition

### Task 20.3.3.1: Time & price atomic part editors (mirror 20.3.2)
**Goal:** For **`blockShape.type`** **`time`** and **`price`**, show the same class of **part-instance ledger** UX as **service** (ordered rows from **`partAssignments`**, persist via **`partInstance` update**), with domain-appropriate card titles/help text.

**Files (expected):** `client/src/composables/admin/` (new or generalized composable), `client/src/components/admin/generic/` (new editor component(s) or shared base), `EntityCardContent.vue`, reuse `blockInstancePartsTotalsResolution.ts`.

**Approach:** Prefer extracting a **small shared** table primitive or **parameterized** composable to avoid triplicating **ServiceAtomicEditor** logic; explicit return types; logger on mutation failures.

### Task 20.3.3.2: Event block instance — orchestration copy & display
**Goal:** On **`event`** `blockInstance` cards, align **labels, descriptions, and/or field display** for **orchestrator** / **wizardVisible** (and closely related fields) with **validity-constrained active assignment** framing per FEATURE_20 §8.3 checks.

**Files (expected):** `blockInstanceDisplays.ts`, optional `client/src/components/admin/generic/` helper, avoid large **EntityCard** surgery.

**Approach:** Metadata/display-first; if a short **hint** component is needed, keep it **presentational** and props-driven.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
