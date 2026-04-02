# Plan: session 20.3.2 — Service atomic editor (FEATURE_20 §8.3 #2)

## Contract
- **Tier:** session | **ID:** 20.3.2
- **Scope:** **ServiceAtomicEditor** (or equivalent) — **service** `blockInstance` convergence surface: part-instance rows (base time/fee, rates, zero-out) in one table aligned with Principles §4 / §9.1; validity remains shape-level; this session does **not** redefine `valid_*` graphs.
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
Completed Task - Begin Session 20.3.2 <!-- harness-across-ladder:start -->

## Story
**This session delivers** a **service block-instance atomic / convergence editor** (VCard + tabular part rows) **so that** admins see and edit **all work-item part instances** for a service in one place—matching FEATURE_20 **§3.6** / **§8.3** item 2 and proving the **inline part-row** pattern before time/price/event atomic editors.
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

- **Paths reviewed:** `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md` (§8.3 sequence); `FEATURE_20_ARCHITECTURE_REDESIGN.md` §3.6 (Service atomic editor = VCard + VDataTable), §8.3; `client/src/components/admin/generic/EntityCard.vue` / `EntityCardContent.vue` (block instance shell); `client/src/composables/admin/usePartsTotals.ts` + `client/src/utils/admin/blockInstancePartsTotalsResolution.ts` (part instances for a block via `partAssignments`); `client/src/components/admin/PartInstanceBulkEditModal.vue` (part scalar fields: `baseTime`, `baseFee`, `zeroOutPart`, rates); `client/src/views/admin/tabs/components/BlockInstancesGroup.vue` (EntityCard list); `client/src/types/entities.ts` (`BlockInstanceEntity`, `PartInstanceEntity`, `BlockShapeEntity.type`).
- **Patterns / call sites:** Part rows for a block are already **resolved from relationships** (not ad hoc queries). **Service** identification is **`blockShape.type === 'service'`** after loading shape by `blockInstance.blockShapeRef`. Saving part fields should reuse existing **entity CRUD / metadata** patterns used elsewhere for `partInstance` (avoid a second save pipeline).
- **Gaps / unknowns:** Exact **mutation** path for inline table cells (FieldRenderer vs `usePrimitiveMutation` batch) to be chosen in **20.3.2.1–2**; whether **read-only first** slice is needed if edit wiring risks regression—prefer **read-only table + one “Edit in bulk” link** only if task-1 discovers high coupling.

## Analysis
- **Problem / why now:** Session **20.3.1** shipped placement-first event-shape UX. **§8.3 #2** is next: the **service atomic** surface is the highest-value **convergence** view (part ledger per service instance) and templates the **VDataTable** pattern for time/price/event atomics.
- **Boundaries:** **Client admin only.** Do **not** change PartFinalizer math or add server-side resolution. **Shapes** tab stays structural; this editor lives on **Instances** for **service** `blockInstance` only. **Orchestrator / composite / wizardVisible** stay on the existing EntityCard fields—only add the **atomic parts** table (or explicitly defer three-property toggles if already sufficient in metadata).
- **Grounding:** Reuse **`usePartsTotals` / `blockInstancePartsTotalsResolution`** lineage—same part rows the fee preview uses—so admin and booking share one notion of “parts under this block.”
- **Child-tier patterns:** Thin **ServiceAtomicEditor.vue**; composable for row resolution + optional save orchestration; explicit return types; logger on catch per project rules.
- **Risks:** Wide table on mobile—use **horizontal scroll** + compact density. Accidental edits—confirm save path matches **partInstance** entity mutations. **Mitigation:** start with read-only columns if wiring is unclear, then enable edits in 20.3.2.2.
- **Alternatives:** Only link to **PartInstanceList** — **rejected** (fails §3.6 convergence goal). Full **EntityCard** replacement — **out of scope** for this session (additive panel first).

## Goal
Ship **ServiceAtomicEditor** for **service** `blockInstance`: a **VCard + VDataTable** (or equivalent) listing **all part instances** under the instance (via `partAssignments`), showing **convergence-relevant** columns (at minimum **name**, **baseTime**, **baseFee**, **rateOverBaseTime**, **rateOverBaseFee**, **zeroOutPart**; extend with per-unit columns if already on `PartInstanceEntity`). **User-facing copy** describes **work items / convergence**, not generic “rows.” **Session 20.3.1** placement work is **not** repeated here.

## Files
- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` §4 / §7; `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §3.6, §8.3, §9.1 drift checklist; `.project-manager/ARCHITECTURE.md` §8–9
- **PM:** `sessions/session-20.3.2-guide.md`, `phases/phase-20.3-guide.md`, `sessions/session-20.3.1-handoff.md`
- **Implementation (primary):** `client/src/utils/admin/blockInstancePartsTotalsResolution.ts` (reuse/extend), `client/src/composables/admin/` (new composable, e.g. `useServiceAtomicPartRows.ts`), `client/src/components/admin/generic/ServiceAtomicEditor.vue` (new), `client/src/components/admin/generic/EntityCardContent.vue` (conditional mount for service instances), optional `client/src/components/admin/generic/EntityCard.vue` props pass-through; reference `PartInstanceBulkEditModal.vue` for field semantics

## Approach
1. **Task 20.3.2.1:** Implement **composable** (and small pure helpers if needed) that returns **typed rows** for a **service** block instance’s part instances + **part shape** labels; gate on `blockShape.type === 'service'`; no UI beyond dev-only smoke optional.
2. **Task 20.3.2.2:** Add **ServiceAtomicEditor** UI: Vuetify **VDataTable** (or VTable) inside **VCard**; wire **save** to existing **partInstance** update path; insert into **EntityCardContent** above sub-panels or below fee preview per layout review; **lint + vue-tsc**; manual: Instances → **service** block → table matches parts under card.
3. Run **§9.1 drift checklist** in session notes before **session-end**.

## Checkpoint
- **After 20.3.2.1:** Composable returns stable row DTO for at least one real service instance in dev data; unit clarity documented in file header.
- **After 20.3.2.2:** Table visible only for **service** instances; editing one scalar persists and reloads from store; no new server endpoints.
- **Before session-end:** Phase objective **“Service atomic”** in `phase-20.3-guide.md` ready to check when product agrees.

## Deliverables
- Composable (or approved extension) resolving **service atomic** part rows from **`partAssignments` + `partInstance`** store.
- **ServiceAtomicEditor.vue** integrated into **block instance** card for **`blockShape.type === 'service'`**.
- Placement-forward / convergence-oriented **labels** (card title, column headers, empty state).
- Client **lint** + **typecheck** clean on touched paths.

## Acceptance Criteria
- [ ] **Service-only:** Editor does not mount for non-service block instances.
- [ ] **Row completeness:** Table lists the same part instances as **`usePartsTotals`** / resolution helpers for that parent (no orphan rows).
- [ ] **Columns:** At least **baseTime**, **baseFee**, **rateOverBaseTime**, **rateOverBaseFee**, **zeroOutPart** surfaced (read or read/write per task 2 outcome).
- [ ] **Principles §4.8:** **Zeroed-out** parts remain visible in admin (no filter that hides `zeroOutPart` in this view).
- [ ] **No server booking math** added; **no** shape-level validity editing on this surface.
- [ ] **Lint + vue-tsc** pass for touched client files.

## Decomposition
- **Task 20.3.2.1:** **Service atomic row model** — Composable (+ optional pure helpers) resolving part instances and display fields for a **service** `blockInstance`; explicit exported types; reuse `blockInstancePartsTotalsResolution` / `usePartsTotals` patterns.
- **Task 20.3.2.2:** **ServiceAtomicEditor UI + EntityCard integration** — VCard + VDataTable; conditional render in `EntityCardContent`; persist edits via existing **partInstance** mutation path; copy and empty states; manual smoke on Instances tab.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.3-guide.md`
- Session guide (tasks / workflow): `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.2-guide.md`
- Prior session handoff: `.project-manager/features/domain-architecture-alignment/sessions/session-20.3.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
