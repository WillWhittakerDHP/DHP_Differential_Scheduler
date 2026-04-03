# Plan: session 20.6.3 — Legacy differential-role and event-shape remnants

## Contract
- **Tier:** session | **ID:** 20.6.3
- **Scope:** Legacy differential-role and event-shape remnants
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
- **20.6.1–20.6.2** complete and pushed: metadata stack removed, **`EntityCard.vue`** deleted, **`AdminEntityEditorPanel`** is the shared admin shell.
- **20.6.3** starts here: **placement-first** event model is canonical per **FEATURE_20**; remove **legacy differential-role override** UI/types and **booking** remnants that assumed `block_instances.differential_event_role_overrides` (column dropped in migration **`20260432_000059_block_instance_three_property_columns.mjs`**).

## Story
**This session delivers** removal of **superseded differential-event-role override** wiring and related **event-shape / event-instance** legacy paths that conflict with **placement_kind + anchor_edge** + relational **event_assignments**, **so that** Pass **§8.6** cleanup grouping is satisfied before **20.6.4** doc/review closeout — **without** changing **PartFinalizer** resolution rules or inventing server-side booking math.

**Estimated size:** **M** (admin field stack + appointment/transformer touchpoints; two-task split).

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

- **Paths reviewed:**
  - **Plan intent:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` — **`block_instances.differential_event_role_overrides`** listed for removal; **“Differential role matrix on block-instance forms | Remove”**; event shapes use **`placement_kind` / `anchor_edge`** (§2.x, §3.6).
  - **DDL:** `server/src/db/migrations/20260432_000059_block_instance_three_property_columns.mjs` — **`DROP COLUMN differential_event_role_overrides`** + metadata field_key cleanup for **`differentialEventRoleOverrides`**.
  - **Server API guard:** `server/src/routes/internal/entities/eventShapeLegacyDifferentialRoleKeys.ts`, `eventShapeEntityValidation.ts`, `entitySanitizers.ts` — reject legacy **`differentialRole`** on **event_shape** payloads.
  - **Admin UI remnants:** `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`; `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts` (**`differentialEventRoleOverrides`** display row); `client/src/utils/admin/differentialRoleMatrixRows.ts`; `client/src/constants/primitives.ts` (**`DifferentialEventRoleOverridesMap`**).
  - **Booking / shared (still live for placement-derived roles):** `shared/utils/differentialRoleUtils.ts`, `shared/utils/eventPlacementUtils.ts` (**`eventShapeDifferentialRoleFromPlacementFields`**), `client/src/utils/eventAttendeeUtils.ts` (**`effectiveDifferentialRole`** + override branches), `client/src/types/appointmentModels.ts` (**optional overrides** on appointment shape).
  - **Transform strip:** `client/src/utils/transformers/entityTransformers.ts` — deletes **`differential_role` / `differentialRole`** on transform (legacy payload hygiene).
  - **Event instance admin:** `EventInstanceEditor.vue`, `EventInstanceBuilderBody.vue`, `instancesTabEventInstance.ts`, `EntityCardContent.vue` → **`EventInstanceTemplateRef`** (segment-manager direction in plan; flag any **standalone** editing remnants vs target UX).
- **Patterns / call sites:** **Placement** drives template scheduling role; **overrides map** on block instances is the deprecated layer. **Availability “differential perspectives”** (`availability_differential_attendees`, wizard **`differentialGraphDefaultLabel`**) is **unrelated** — do **not** remove unless explicitly scoped (different “differential” meaning).
- **Gaps / unknowns:** Whether **`DifferentialEventRoleOverridesField`** is still reachable via **FieldRenderer** / **renderAs** after code-first migration — grep at task start; whether any **server** create/update still accepts **`differential_event_role_overrides`** after column drop (should error or strip).

## Analysis
- **Problem / why now:** **20.6.1–20.6.2** removed metadata + generic **EntityCard**. **DB** migration **000059** already drops the overrides column; **client** still carries **matrix field**, **display config**, **appointment** optional overrides, and **attendee utils** branches — dead or misleading vs **placement-first** architecture.
- **Boundaries:** **Client** admin + booking transformers/types; **server** only if dead validators/helpers remain. **Do not** alter **PartFinalizer** core contract or add server recomputation of booking totals (**ARCHITECTURE.md** / plan §4).
- **Task order:** **Admin/UI + primitives first** (stop surfacing overrides), then **booking + shared** simplification once no product path persists overrides.
- **Risks:** **False positive deletion** if any environment has not applied **000059** — prefer **grep + typecheck** over silent runtime failure; **availability differential** naming collision — avoid touching **`useBusinessControlsTab` / `WizardConfigPanel`** differential sub-step unless scoped.
- **Alternatives:** Keep overrides field read-only “for debug” — **rejected** by FEATURE_20 removal list.

## Goal
**Session 20.6.3 only:** Eliminate **legacy differential-event-role override** surfaces and **stray types/transformer** branches aligned to **FEATURE_20** placement model; trim **event-instance admin** paths that are clearly superseded by the **segment-manager** narrative **only where** code is provably unused or redundant after grep + typecheck. **Out of scope:** **20.6.4** documentation/review gate; **feature-end**; wholesale rename of **`DifferentialRole`** shared types if still used for **placement-derived** roles.

## Files
- **Canonical (read-only):** `ARCHITECTURE_PRINCIPLES.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§2.2, §3.6, §8.6**), `ARCHITECTURE.md` (**§5 event placement**)
- **Harness / PM:** `phases/phase-20.6-guide.md`, `DOMAIN_REWRITE_WORKLOG.md`, `session-20.6.2-handoff.md`
- **Implementation (expected hotspots):**
  - `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`
  - `client/src/configs/field/display/appliedDisplay/blockInstanceDisplays.ts`
  - `client/src/utils/admin/differentialRoleMatrixRows.ts`
  - `client/src/constants/primitives.ts` (**`GlobalFieldKey` / map types**)
  - `client/src/types/appointmentModels.ts`
  - `client/src/utils/eventAttendeeUtils.ts`
  - `client/src/utils/transformers/entityTransformers.ts`
  - `server/src/routes/internal/entities/eventShapeLegacyDifferentialRoleKeys.ts` (retain if still needed for API rejection; delete only if redundant)
  - **Field wiring:** `FieldRenderer.vue` / `PrimitiveInputs.vue` / `codeFirstMetadataCache.ts` — only if **`differentialEventRoleOverrides`** still registered
  - **Event instance UI:** `client/src/views/admin/tabs/components/EventInstanceEditor.vue`, `EventInstanceBuilderBody.vue`, `EventInstanceListItem.vue`, `EventInstanceTemplateFields.vue`, `EventInstancePreviewPanel.vue`, `EventInstanceCalendarSettings.vue`, `EventInstanceVariableChips.vue`; composables under `composables/admin/useInstancesTab*`

## Approach
1. **Task 20.6.3.1:** **Grep** `differentialEventRoleOverrides` / **`DifferentialEventRoleOverrides`** / matrix component; remove **admin** field component + **blockInstance** display row + **matrix rows** util if orphaned; tighten **`primitives.ts`** / **FieldRenderer** wiring so the property cannot render; smoke **Instances** tab block instance form (**Events** panel / field groups).
2. **Task 20.6.3.2:** Remove **`differentialEventRoleOverrides`** from **appointment** types and booking helpers; simplify **`eventAttendeeUtils`** to **placement + event_shape** template role only (drop override map branches when always empty); audit **`entityTransformers`** deletes; remove dead **shared** imports on client; **optional:** thin **event-instance** standalone editor remnants if grep shows no route/consumers — document in handoff if deferred.
3. **Verification:** `npm run start:dev`; `cd client && npm run lint`; `cd server && npm run lint`; `vue-tsc` / `tsc` as in repo; **no new tests** (project rule).

## Checkpoint
- **`/accepted-plan`:** Two tasks cover **admin removal** then **booking/shared**; **no PartFinalizer** file churn unless a task explicitly needs import cleanup only.
- **After 20.6.3.1:** Zero **admin** references to **`differentialEventRoleOverrides`** field component / display config (grep).
- **After 20.6.3.2:** **`appointmentModels`** and **attendee** utilities carry **no** override map; **`DOMAIN_REWRITE_WORKLOG.md`** one-line note for **20.6.3** retirement.

## Deliverables
- **Removed or unreachable** **block-instance differential event role overrides** UI and config.
- **Booking/types** no longer model **appointment-level** override map (if fully dead).
- **Worklog** updated; session **log/handoff** with smoke notes.
- **Grep audit** saved in session log (commands + “before/after” hit counts optional).

## Acceptance Criteria
- **`rg differentialEventRoleOverrides`** across **`client/src`** shows **no** functional references (comments acceptable only if explaining removal).
- **Admin:** Block instance editor does not show **differential role matrix**; no runtime errors on Instances / Shapes event flows touched.
- **Lint + vue-tsc** (client) and **server lint** green per DoD.
- **No** changes to **PartFinalizer** business logic beyond **type/import** cleanup **unless** a dead branch is removed with identical behavior for placement-only paths.

## Decomposition
- **Task 20.6.3.1 — Admin: strip override matrix and field plumbing**
  - **Goal:** Remove **`DifferentialEventRoleOverridesField`**, **`differentialRoleMatrixRows`**, **`blockInstanceDisplays.differentialEventRoleOverrides`**, and any **FieldRenderer / code-first** registration for **`differentialEventRoleOverrides`**.
  - **Files:** Listed under Implementation; adjust **`GlobalFieldKey`** / **`primitives`** if the key is removed from the union.
  - **Checkpoint:** Grep clean for component name and field key in admin configs.

- **Task 20.6.3.2 — Booking + types + optional event-instance remnant scan**
  - **Goal:** Remove **`differentialEventRoleOverrides`** from **`appointmentModels`** and consumers; simplify **`eventAttendeeUtils`**; keep **placement-derived** **`DifferentialRole`** usage via **`eventShapeDifferentialRoleFromPlacementFields`**; **`entityTransformers`** only if still needed or simplified; scan **event-instance** admin components (list under **Files**) for deprecated standalone flows — remove or ticket in handoff if risky.
  - **Files:** `appointmentModels.ts`, `eventAttendeeUtils.ts`, booking callers of attendee utils, `entityTransformers.ts`; optionally **event instance** views/composables.
  - **Checkpoint:** Typecheck + lint; **`DOMAIN_REWRITE_WORKLOG.md`** updated; brief smoke (wizard availability + admin instances) per session guide.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.2-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
