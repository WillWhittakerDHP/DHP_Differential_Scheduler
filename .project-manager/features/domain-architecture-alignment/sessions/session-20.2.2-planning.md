# Plan: session 20.2.2 — Event shape & event instance entity routes (API alignment)

## Contract
- **Tier:** session | **ID:** 20.2.2
- **Scope:** Internal **`/internal/entities`** (and **`entityBulkRouter`** where applicable) for **`eventShape`** and **`eventInstance`**: placement-only writes for shapes; **`parentBlockInstanceId`** required for new segments; segment payload validation per **Principles §5.4**; responses must not surface legacy **`differentialRole`** on event shapes.
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
Completed Task - Begin Session 20.2.2 <!-- harness-across-ladder:start -->

## Story
**This session delivers** server-side validation and response hygiene for **`eventShape`** and **`eventInstance`** on generic entity CRUD **so that** admin and preview consumers see **Feature 20** contracts only (placement fields on shapes, owned segments on instances) and **§8.2** acceptance checks hold before **20.2.3** (relationships + preview).

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

- **Paths reviewed:** `server/src/config/entityRegistry.ts` (**`eventShape`**, **`eventInstance`** registered); `server/src/db/models/booking/event_shape.ts` (**`placementKind`**, **`anchorEdge`** only — no **`differential_role`** column on model); `server/src/db/models/booking/event_instance.ts` (**`parentBlockInstanceId`**, segment/location fields **§5.4**, calendar template fields); `server/src/routes/internal/entities/entitySanitizers.ts` — **`sanitizeEventShapeFields`** strips **`differentialRole`** / snake on create+update and normalizes placement via **`shared/utils/eventPlacementUtils.ts`**; `server/src/routes/internal/entities/entityCrudRouter.ts` — same POST/PUT/PATCH + bulk patterns as **20.2.1**; `server/src/routes/internal/entities/entityBulkRouter.ts` — bulk PATCH for order_index + generic bulk; `shared/utils/eventPlacementUtils.ts` — **`sanitizeEventPlacementKindInput`**, **`sanitizeEventAnchorEdgeInput`**, placement ↔ derived role helpers (client/booking — not for API leakage).
- **Patterns / call sites:** Reuse **20.2.1** pattern: small **`eventShapeEntityValidation.ts`** / **`eventInstanceEntityValidation.ts`** (or one **`eventEntityValidation.ts`**) + **`sendBadRequest`** before **`sanitizeEntityDataFor*`**; extend **`entitySanitizers`** only for safe normalizations already in use (placement), not for accepting invalid parent IDs.
- **Gaps / unknowns:** Confirm whether any **read** path attaches legacy **`differentialRole`** via Sequelize **`include`** or admin metadata; if JSON responses still show it, add explicit omit/strip on **`eventShape`** rows (task-level). Confirm **`parent_block_instance_id`** FK existence for supplied UUIDs only if product requires (optional follow-up: async BlockInstance lookup — scope in task if needed).

## Analysis
- **Problem:** **`entityBodySchema`** is still permissive; **`eventInstance.parent_block_instance_id`** is **nullable** in DB but **§5.2** requires every segment be **owned** by an event block instance — API should **reject creates** without parent context. Event shapes must not reintroduce **differential-role** as a writable or visible API field after **Phase 20.1** migration.
- **Boundaries:** **Server** entity + bulk routes only; **no** PartFinalizer, **no** booking totals, **no** new calendar endpoints in this session.
- **Placement invariants (shapes):** Align with **Principles §5.1** table: **`primary`** ⇒ **`anchor_edge`** null; **`secondary` | `marginal` | `floating`** ⇒ **`anchor_edge`** **`start`** or **`end`** (reject invalid pairs with **400**).
- **Segment payloads (instances):** **§5.4** — validate types for location block, lat/lng numeric/null, booleans for link flags, closed sets for **`visibility`**, **`transparency`**, **`sendUpdates`**, **`status`** where body includes those keys (strict typing when present, mirroring **20.2.1.2** boolean discipline where applicable).
- **Risks:** Strict **POST** parent requirement may break admin flows that still create “global” templates without parent — product must send **`parentBlockInstanceId`** (camelCase) or we document a temporary exception (prefer **not** unless Will confirms).
- **Alternatives:** Joi keyed by **`entityType`** in middleware — heavier duplication; prefer named validators + existing router hooks like **20.2.1**.

## Goal
For **session 20.2.2** only: align **`eventShape`** and **`eventInstance`** on internal **entity** CRUD (+ **entity bulk** where those types patch) with **Phase 20.2 guide §8.2** and **Principles §5.1 / §5.2 / §5.4** — placement-only event shapes (no **`differentialRole`** in API), event instances as **named segments** with required **`parentBlockInstanceId`** on create and validated segment/calendar fields when present. **No** relationship routes (**20.2.3**), **no** preview router (**20.2.3**), **no** appointments/calendar (**20.2.4**).

## Files
- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` §5, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §5 / §8.2, `.project-manager/ARCHITECTURE.md` §8–10, `phases/phase-20.2-guide.md`
- **Implementation (expected):** `server/src/routes/internal/entities/entityCrudRouter.ts`, `server/src/routes/internal/entities/entityBulkRouter.ts`, `server/src/routes/internal/entities/entitySanitizers.ts`, new `server/src/routes/internal/entities/eventShapeEntityValidation.ts` and/or `eventInstanceEntityValidation.ts`, `shared/utils/eventPlacementUtils.ts` (reuse only; avoid expanding surface), `server/src/db/models/booking/event_shape.ts` & `event_instance.ts` (reference), read paths in `entityCrudRouterReads.ts` or batch if **`differentialRole`** still appears

## Approach
1. **Task 20.2.2.1 — Event shape:** Add validation for **placement kind + anchor edge** invariants; reject writes that include **`differentialRole`** / **`differential_role`** with clear **400** (defense in depth beside sanitizer delete); verify **GET**/batch JSON for **`eventShape`** omits legacy keys (strip in serializer layer if needed).
2. **Task 20.2.2.2 — Event instance:** **POST** requires non-empty **`parentBlockInstanceId`** (and/or camel/snake parity policy consistent with Sequelize); **PUT/PATCH** validates parent when key is present; validate **§5.4** fields when present (types + enums + booleans); wire **entityCrudRouter** + **entityBulkRouter** for **`eventInstance`** rows.
3. Run **`cd server && npm run lint`** after tasks; optional one-line **`DOMAIN_REWRITE_WORKLOG.md`** for API notes.

## Checkpoint
- **20.2.1** complete on branch **`feature/domain-architecture-alignment`**.
- No server-side booking resolution in any touched file.
- Child tasks each end with **`/task-end`** and cascade per harness.

## Deliverables
- Validators + router (and bulk) wiring for **`eventShape`** and **`eventInstance`** per tasks below.
- Documented acceptance checks satisfied for this session slice.
- Session log + handoff updated at **`/session-end 20.2.2`**.

## Decomposition
- **Task 20.2.2.1 — Event shape placement API & no differential-role leakage**  
  Enforce placement invariants on POST/PUT/PATCH (+ bulk if shape rows are bulk-updated); reject **`differentialRole`** on write; ensure read responses do not include legacy differential-role fields for **`eventShape`**.

- **Task 20.2.2.2 — Event instance parent + §5.4 segment validation**  
  Require **`parentBlockInstanceId`** on **POST** create; validate optional segment/calendar fields when present; integrate **entityCrudRouter** and **entityBulkRouter** for **`eventInstance`**.

## Acceptance Criteria (session)
- [ ] **`eventShape`** create/update cannot persist invalid **placement_kind** / **anchor_edge** combinations (clear **400**).
- [ ] **`eventShape`** API does not expose **`differentialRole`** on responses used by admin batch (strip or never select).
- [ ] **`eventInstance`** **POST** without **`parentBlockInstanceId`** → **400** (or documented exception — default is **require**).
- [ ] **`eventInstance`** payloads with wrong types for **§5.4** fields (when those keys are sent) → **400** with field-level messaging.
- [ ] **`cd server && npm run lint`** passes after the session’s tasks.
- [ ] No new endpoints compute booking totals or duplicate PartFinalizer.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved at session tier
- [ ] Tasks **20.2.2.1** and **20.2.2.2** complete (**`/task-end`** each)
- [ ] Session log and handoff updated at **`/session-end 20.2.2`**

## Coverage check (agent — answer in chat when directing to /accepted-plan)
**If this goal is the scope for 20.2.2, the two tasks above are sufficient:** (1) shapes + placement + no differential leakage, (2) instances + parent + §5.4 validation + bulk parity. Relationship graph, preview re-scope, and appointments/calendar are explicitly **out of scope** here (**20.2.3–20.2.4**).

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.2-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
