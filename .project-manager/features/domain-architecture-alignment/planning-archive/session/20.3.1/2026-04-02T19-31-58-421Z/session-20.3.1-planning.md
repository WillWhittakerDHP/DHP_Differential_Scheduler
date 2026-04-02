# Plan: session 20.3.1 — Placement type editor (FEATURE_20 §8.3 #1)

## Contract
- **Tier:** session | **ID:** 20.3.1
- **Scope:** Admin UX for **event shapes**: explicit **placement** editing (`placementKind`, `anchorEdge`), aligned field display config and copy; reword shape-surface UI that foregrounds **differential role** where **placement** is the source of truth.
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
Phase **20.2** shipped API/schema alignment for **event_shapes** (placement-only writes, no differential-role body). Phase **20.3** session **20.3.1** is the first §8.3 tranche: admin must edit **placement** clearly before later sessions (service editor, segment relocation).

## Story
**This session delivers** a dedicated **placement** editing experience on **event shape** admin surfaces and placement-forward copy **so that** configurators reason in **FEATURE_20** terms (placement → calendar ordering / scheduling semantics) without legacy differential-role-first labeling on **shape** templates.
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

- **Paths reviewed:** `client/src/views/admin/tabs/components/ShapesTabEventPanel.vue` (event shape list → `EntityCard` per shape); `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts` (labels/placeholders for `placementKind`, `anchorEdge`); `client/src/configs/field/display/fullFieldDisplayConfig.ts` (wires `eventShapeDisplays`); `client/src/utils/transformers/entityTransformers.ts` (sanitizes placement on transform); `client/src/composables/admin/useShapesTab.ts` (defaults for new event shape); `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue` + `client/src/utils/admin/differentialRoleMatrixRows.ts` (matrix still shows **Template:** plus a scheduling role token derived from placement); `shared/utils/eventPlacementUtils.ts` (canonical placement enums / sanitizers); `client/src/utils/admin/selectFieldValueResolution.ts` + `selectHandlersNormalization.ts` (`anchorEdge` null / `__NULL__` handling).
- **Patterns / call sites:** Event shapes use the **generic admin field pipeline** (display config + dynamic fields). Placement fields are plain inputs today — no grouped **PlacementTypeEditor**. Override matrix is **block instance** surface, not shape template; still uses **role** vocabulary in UI while data is placement-backed.
- **Gaps / unknowns:** Exact hook for custom renderer (e.g. `fieldRendererComponentMap.ts`) for **eventShape** + field keys must be confirmed during **20.3.1.1**. Server validation already rejects bad pairs (Phase 20.2); client should mirror **primary → null anchor** for clarity.

## Analysis
- **Problem / why now:** APIs and types are placement-native; admin still presents placement as opaque text fields and elsewhere shows **template role** without tying copy to **placementKind / anchorEdge**. Misalignment risks misconfiguration and reintroduces a differential-role mental model on **shape** templates.
- **Boundaries:** **Client admin only** for this session; **no** server PartFinalizer or booking pipeline changes. **Shared** imports only where already used (`@shared/utils/eventPlacementUtils`, sanitizers).
- **Patterns:** Thin Vue components; composable for pairing logic if non-trivial; reuse `ENTITY_FIELD` / display config patterns; follow COMPONENT/COMPOSABLE playbooks.
- **Risks:** Over-building a new form system — prefer one focused component + map registration. Regression on `anchorEdge` null sentinel — preserve existing select resolution behavior.
- **Alternatives:** Leave generic text fields — **rejected** (fails §8.3 #1). Full EntityCard replacement — **out of scope** for 20.3.1 (later §8.3 items).

## Goal
Ship **PlacementTypeEditor** (or equivalent named component) for **eventShape** so admins set **placementKind** and **anchorEdge** with correct coupling (**primary** clears anchor), and refresh **shape-surface** copy so **placement** is primary; tighten **eventShapeDisplays** and the differential **override** matrix caption to **placement-forward** language where it describes template event shapes.

## Files
- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §8.3, `.project-manager/ARCHITECTURE.md` §8–9
- **PM:** `sessions/session-20.3.1-guide.md`, `phases/phase-20.3-guide.md`
- **Implementation (primary):** `client/src/components/admin/generic/fields/` (new or extended editor), `client/src/components/admin/generic/fields/fieldRendererComponentMap.ts` (if custom render), `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts`, `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`, optional small composable under `client/src/composables/admin/`

## Approach
1. **Task 20.3.1.1:** Implement grouped placement UI (kind + anchor) with disabled/null anchor for **primary**; integrate into event shape field rendering path without breaking save payload shape.
2. **Task 20.3.1.2:** Update display strings and **DifferentialEventRoleOverridesField** helper text / per-row caption to emphasize **placement** (and derived scheduling effect), not “differential role” as the lead concept on template rows.
3. Verify **Shapes → Event shapes** flow manually; run **client lint** + **vue-tsc** on touched paths; grep for user-visible “differential” on **event shape** templates and fix stragglers in scope.

## Checkpoint
- After **20.3.1.1:** Saving an event shape persists **placementKind** / **anchorEdge** consistent with server rules; UI blocks incoherent anchor when **primary**.
- After **20.3.1.2:** No task-level placeholder strings remain in session guide; copy review done for touched components.
- Before **session-end:** Phase **20.3** session checkbox for **20.3.1** ready to mark complete in `phase-20.3-guide.md`.

## Deliverables
- Registered **placement** editor (or equivalent) on **eventShape** admin edit path.
- Updated **`eventShapeDisplays.ts`** (and any related select labels) for clarity.
- **DifferentialEventRoleOverridesField** (and/or matrix helper) uses **placement-forward** explanations where it references template event shapes.
- Session **log** + **handoff** after `session-end`; optional **DOMAIN_REWRITE_WORKLOG** note if material.

## Decomposition
- **Task 20.3.1.1:** **PlacementTypeEditor** — grouped `placementKind` + `anchorEdge` for `eventShape` in admin (component + field-map or context wiring + **primary** ⇒ null anchor UX); preserve existing transform/sanitizer behavior.
- **Task 20.3.1.2:** **Copy and display alignment** — `eventShapeDisplays.ts` help/labels; **DifferentialEventRoleOverridesField** row caption / default help text → placement-first wording; grep cleanup for shape-surface strings in scope.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
