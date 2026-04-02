# Plan: session 20.3.4 — Segment manager relocation (FEATURE_20 §8.3 #4)

## Contract
- **Tier:** session | **ID:** 20.3.4
- **Scope:** Relocate **segment / `eventInstance`** management from the **Instances tab → Events** surface into **event-shaped block instance** editing (per-block-instance segment list + CRUD), aligned with Phase **20.2** entity/relationship APIs and server validation (`parentBlockInstanceId` on create).
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
Completed Task - Begin Session 20.3.4 <!-- harness-across-ladder:start -->

## Story
**This session delivers** an **event block instance–scoped** segment (event instance) manager **so that** admins configure **calendar segments where the orchestration lives** (on the event block instance card), not on a separate **Instances → Events** island — matching FEATURE_20 **§8.3 #4** and keeping **Shapes** structural-only.

**Estimated size:** M (UI relocation + shared CRUD wiring + tab cleanup)

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

- **Paths reviewed:** `client/src/views/admin/tabs/InstancesTab.vue` (VTabs: per–block-shape windows + **`eventInstances`** tab → `EventInstancesSection`); `client/src/views/admin/tabs/components/EventInstancesSection.vue`; `client/src/composables/admin/useInstancesTab.ts` (builds `InstancesTabContext`, `provide(instancesTabContextKey)`, wires `useInstancesTabEventInstance`, `useInstancesTabEventInstanceDrag`, `useEntityCrud('eventInstance')`); `client/src/composables/admin/useEventInstancesSection.ts`; `client/src/composables/admin/useInstancesTabEventInstance.ts` (create payload — **does not set `parentBlockInstanceId`** today); `client/src/types/admin/adminInjectionKeys.ts` (`InstancesTabContext` shape); `client/src/components/admin/generic/EntityCardContent.vue` (block instance editors; no segment list yet); `server/src/routes/internal/entities/eventInstanceEntityValidation.ts` (**create requires `parentBlockInstanceId`**); `server/src/routes/internal/relationships/relationshipHelpersValidation.ts` (event assignment + segment parent consistency).
- **Patterns / call sites:** Global event-instance UX is **centralized** in Instances tab via context + thin section component; list/drag/order uses the same CRUD hooks as the rest of admin. **Relocation** should **extract** list/create/delete/reorder behavior into a **parameterized** composable or shared module keyed by **`blockInstanceId`**, then mount a thin component from **`EntityCardContent`** when the resolved block shape **`type === 'event'`** (reuse `getBlockInstanceShapeProperties` / existing shape-type resolution patterns from **20.3.3**).
- **Gaps / unknowns:** Confirm runtime path for `createEventInstance` from Instances tab vs server validation (if create is currently failing or uses a bypass, fix as part of **20.3.4.1**). Confirm how **`eventAssignments`** on `blockInstance` and **`parentBlockInstanceId`** on `eventInstance` stay in sync after moves (read relationship merge/transformer paths during task **20.3.4.1**).

## Analysis
- **Problem / why now:** §8.3 sequence places **segment relocation** after domain editors (**20.3.3**). Today, segments are edited under **Instances → Events**, away from the **event block instance** that owns orchestration context — admins lack a single place to manage “this block’s calendar segments.”
- **Domain boundaries:** **Admin / config** client; **reuse** existing `eventInstance` entity CRUD and relationship routes from Phase **20.2** — **no** new booking math, **no** PartFinalizer changes. Server validation already treats **`parentBlockInstanceId`** as required on create; client must align.
- **Patterns:** Thin **EntityCard** slices + composables; reuse **`EventInstanceBuilderBody`**, **`EventInstanceListItem`**, template variable warnings, and drag/order patterns from `useInstancesTabEventInstanceDrag` where possible rather than duplicating templates.
- **Risks:** Shrinking **`InstancesTabContext`** or removing the Events tab without a clear **empty state** may confuse admins — mitigate with copy + link to open the right block shape tab. Drag-and-drop refs (`eventInstancesContainer`) are tied to Instances tab today; **20.3.4.1** must re-bind or replace with a card-local container.
- **Alternatives considered:** (a) Keep global Events tab as read-only aggregate — **optional** fallback if product needs a bird’s-eye list; default per phase guide is **relocate**. (b) New server endpoints for “segments by block” — **rejected**; filter client global entities + existing relationships.

## Goal
Finish FEATURE_20 **§8.3 #4** on this branch: **embed** event-segment (**`eventInstance`**) management under **event-shaped block instance** cards and **remove or replace** the redundant **Instances tab → Events** workflow, while staying aligned with **20.2** APIs and **§9** (instances hold orchestration behavior; shapes stay structural).

## Files
- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§8.3), `.project-manager/ARCHITECTURE.md` (§8–§10)
- **PM / harness:** `phases/phase-20.3-guide.md`, `sessions/session-20.3.3-handoff.md` (prior context)
- **Implementation (expected hotspots):** `client/src/views/admin/tabs/InstancesTab.vue`; `client/src/composables/admin/useInstancesTab.ts`; `client/src/views/admin/tabs/components/EventInstancesSection.vue`; `client/src/composables/admin/useInstancesTabEventInstance.ts`; `client/src/composables/admin/useInstancesTabEventInstanceDrag.ts`; `client/src/components/admin/generic/EntityCardContent.vue`; new composable(s) under `client/src/composables/admin/`; optional new presentational component(s) under `client/src/components/admin/generic/`; `client/src/types/admin/adminInjectionKeys.ts` (only if context is refactored); `client/src/types/entities.ts` / transformers if field plumbing is missing for `parentBlockInstanceId` in create payloads

## Approach
1. **20.3.4.1 — Segment panel on event block instance card:** Resolve block shape type for the open card; when **`event`**, render a **Segments** sub-panel (list + create + delete + reorder) scoped to **`parentBlockInstanceId === entityId`**. Ensure **create** sends **`parentBlockInstanceId`** per `eventInstanceEntityValidation`. Extract shared logic from Instances-tab composables into reusable modules to avoid duplication.
2. **20.3.4.2 — Instances tab cleanup:** Remove or replace the **`Events (n)`** tab and `EventInstancesSection` mount with a short **guidance** surface (“Segments are edited on each event block instance”) or a **read-only** aggregate if we keep minimal visibility; delete dead context fields only after call sites are gone; run **regression** on Instances + Shapes tabs.
3. **Quality:** After each task: `cd client && npm run lint` + `npm run type-check`; manual smoke on one **event** block instance card and remaining Instances navigation.
4. **§9.1 drift:** Record checklist notes in **`session-20.3.4-log.md`** at **`/session-end`**.

## Checkpoint
- **After 20.3.4.1:** Editing an **event** block instance shows segment list; create/delete/order works; payloads include valid **`parentBlockInstanceId`**.
- **After 20.3.4.2:** Instances tab no longer duplicates full segment editor (per chosen UX); no broken imports; lint/type-check clean.
- **Before `/session-end 20.3.4`:** Session log + handoff updated; phase-20.3 guide **Segments** objective ready to check.

## Deliverables
- [ ] **Event block instance** UI: embedded **segment / `eventInstance`** manager (scoped by block instance id).
- [ ] **Client** create/update paths aligned with server **`parentBlockInstanceId`** rules (Phase **20.2** contract).
- [ ] **Instances tab** Events island removed, replaced, or reduced to non-duplicative UX (document which in task **20.3.4.2**).
- [ ] **§9.1** drift notes captured at session-end.
- [ ] Lint + vue-tsc clean; manual smoke documented.

## Acceptance Criteria
- [ ] **§8.3 #4:** Segment / **`eventInstance`** editing is available in **event block instance** context (not only the global Events tab).
- [ ] **API alignment:** Create/update flows respect server rules (**`parentBlockInstanceId`** on create; no ad-hoc endpoints contradicting Phase **20.2**).
- [ ] **Shapes remain structural:** No new shape-level editors for segment templates beyond existing **20.3.1** placement work; this session does not move validity definition onto instance cards.
- [ ] **No duplicate primary UX:** After **20.3.4.2**, admins are not required to use two full segment editors for the same operation (document if a **read-only** aggregate remains).
- [ ] **Quality:** Client **lint** + **type-check** pass; manual smoke on Instances + at least one **event** block instance card.

## Decomposition
- **Task 20.3.4.1 — Event block instance segment panel:** Composable + thin component on **`EntityCardContent`** (gated to **event** shape + `!isNew`); filter segments by parent block instance; wire CRUD/order using existing `useEntityCrud('eventInstance')` patterns; fix create payload to include **`parentBlockInstanceId`**; reuse builder/list/drag pieces from Instances tab where practical.
- **Task 20.3.4.2 — Instances tab relocation / cleanup:** Remove or replace **`EventInstancesSection`** + **`eventInstances`** `VTab`/`VWindowItem`; trim **`InstancesTabContext`** and composables only after consumers updated; add admin copy for discoverability; regression pass on Instances + Shapes.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.3-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
