# Plan: session 20.2.4 — Appointments, calendar integration & API cleanup

## Contract
- **Tier:** session | **ID:** 20.2.4
- **Scope:** Appointment persistence helpers/routers (store client-submitted booking context; no server PartFinalizer); calendar / invite pipeline reads **event instance** segment identity and **event shape** placement policy (`placementKind`, `anchorEdge`); remove or isolate **event-shape differential-role** API remnants per FEATURE_20 **§5.3** where safe; phase **20.2** drift checklist + guide/handoff prep for **`/phase-end 20.2`**.
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
Completed Task - Begin Session 20.2.4 <!-- harness-across-ladder:start -->

## Story
**This session delivers** aligned **appointment persistence** and **Google Calendar invite** behavior keyed to **event_instances** + **event_shapes** placement data, and strips remaining **differential-role** noise from the **event-shape entity** API surface, **so that** Phase **20.2** closes with FEATURE_20 **§5.1 / §5.2** satisfied (no server booking calculator; ownership via segments and shapes) and the repo is ready for **20.3** (client-heavy tranche).
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
  - **Appointments:** `server/src/routes/internal/appointments/appointmentCrudRouter.ts`, `appointmentRouter.ts`, `appointmentHelpers.ts` (includes, fee/snapshot/selection codecs), `forceCreateRouter.ts`, `listForAdminEntryHandler.ts`
  - **Invites + calendar:** `server/src/services/invites/inviteOrchestrationService.ts` (`findEventInstancesForBlockInstances` loads `EventInstance` + `EventShape` with `placementKind` / `anchorEdge`; `createEventForInstance` builds `CreateEventParams` from segment templates and **instance-level** link flags), `inviteAppointmentShared.ts` (`normalizeAppointmentForInviteFlow`, `linkStripSetForEventShape` — signature still named “shape” but call sites pass instance link flags), `inviteContextBuilder.ts`
  - **Google Calendar:** `server/src/services/google/calendar/eventCreationService.ts`, `buildCalendarEventResource.ts`, `calendarTypes.ts` (params are summary/description/timing — timing today is **first** `selectedTimeSlots` row for **all** segments)
  - **Entity cleanup (differential role):** `server/src/routes/internal/entities/eventShapeEntityValidation.ts`, `entitySanitizers.ts`, `entityConstants.ts` (`DIFFERENTIAL_ROLE` field names still present for strip/reject)
  - **Out of scope for “remove differential” without explicit scope:** `availability_differential_attendee`, `availabilityRelationalCodec`, `wizard_settings.differentialGraphDefaultLabel` — **different product concept** (availability perspectives), not event-shape differential role
- **Patterns / call sites:** Appointment CRUD persists wizard payload via repositories (`appointmentSelectionRepository`, `appointmentTimeSlotRepository`, `appointmentPropertyDetailsSync`, etc.) — **no** recomputation of resolved totals on server. Invite flow already scopes instances via `event_assignments` to selected block instances and **includes** shape placement attributes; **placement is not yet consumed** for ordering or per-segment time windows in `createEventForInstance`.
- **Gaps / unknowns:** Whether **multi-segment** appointments require **per-instance** start/end (from client-stored snapshots) vs single slot for all Google events — confirm against `selectedTimeSlots` / part snapshot shape during **20.2.4.1**; document intentional single-window behavior if unchanged.

## Analysis
- **Problem / why now:** Sessions **20.2.1–20.2.3** aligned entities, relationships, and preview to Phase **20.1** schema. FEATURE_20 **§5.1** still lists **appointment persistence** and **calendar event creation** as route areas that must use **raw rows + client payload**, and **§5.3** calls for removing **differential-role-specific** event-shape helpers. This session closes that gap and finishes **phase 20.2** checklist items before **`/phase-end 20.2`**.
- **Boundaries:** **Booking** (appointments, invites, Google Calendar) + **admin config** (event shapes) on the server; **no** PartFinalizer port; **no** conflation with **availability “differential”** (major/minor perspectives) unless an explicit alias to event-shape role is found.
- **Patterns to follow:** Keep persistence in repositories/routers **thin** — validate shape, ownership consistency, and required fields; reuse existing `appointmentIncludes` and invite normalization. Calendar code: extend **`inviteOrchestrationService`** / shared helpers rather than duplicating segment lookup.
- **Risks:** Multi-segment timing: today **one** slot drives **all** Google events — changing to per-segment windows may require **client** payload fields; if so, document and split minimal server read path only (still no resolution math).
- **Alternatives:** Key calendar events only by `eventInstanceId` (already true per loop); sort instances by `placementKind` / `anchorEdge` using `@shared` placement ordering helpers if present — prefer shared utility over ad hoc compares.

## Goal
Close **Phase 20.2** session **20.2.4**: (1) **Appointments + calendar** paths satisfy FEATURE_20 **§5.1** rows for appointment persistence and calendar services — segment identity from **`event_instances`**, placement policy from **`event_shapes`**, no server booking-total calculator; (2) **API cleanup** — event-shape **differential-role** keys/helpers removed or isolated per **§5.3** on **entity** routes; (3) **phase wrap-up** — drift checklist, **`phase-20.2-guide.md`** / **`DOMAIN_REWRITE_WORKLOG.md`** / handoff updates for **20.3**.

## Files
- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§5.1–5.4**), `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` (**§4–5**), `.project-manager/ARCHITECTURE.md`
- **Harness / PM:** `phases/phase-20.2-guide.md`, `phases/phase-20.2-planning.md`, `sessions/session-20.2.3-handoff.md`, `DOMAIN_REWRITE_WORKLOG.md` (or feature worklog path in use)
- **Implementation (this session — expect):** `server/src/routes/internal/appointments/**`, `server/src/services/invites/**`, `server/src/services/google/calendar/**`, `server/src/routes/internal/entities/eventShapeEntityValidation.ts`, `entitySanitizers.ts`, `entityConstants.ts`; optionally `shared/utils/eventPlacementUtils.ts` for ordering

## Approach
1. **Task 20.2.4.1:** Trace appointment create/update → stored fields vs FEATURE_20 **§5.1** “persist client-submitted resolved payload”; trace `createInvitesForAppointment` → ensure **segment + shape placement** are loaded and **used** where product requires (ordering, documented timing policy); adjust **`inviteAppointmentShared`** / **`linkStripSetForEventShape`** naming or typing if instance vs shape ownership is confusing — **no** new server calculator.
2. **Task 20.2.4.2:** Grep **`server/src/routes/internal/entities`** (and related serializers) for **`differentialRole` / `differential_role`**; remove dead constants or narrow to validation-only rejects; **do not** rip **availability** differential tables without a separate task.
3. Run **server + client lint** and **`server` `tsc`** on touched paths; update **phase-20.2-guide** session checkbox (already `[ ]` for 20.2.4 until tasks done), **phase log**, **phase handoff** stub, and worklog for **20.3** entry.

## Checkpoint
- **20.2.3** complete: preview uses **`eventInstanceId`**; relationships validate segment ownership.
- **Branch:** `feature/domain-architecture-alignment` (pushed after last session-end).
- **Before coding:** Re-read **`phase-20.2-guide.md` §8.2** acceptance checks (no server booking totals; placement-only event shapes).

## Deliverables
- Audited + adjusted **appointment** persistence and **invite/calendar** pipeline per **§5.1 / §5.2** (with any timing/placement behavior documented in code comments or worklog).
- **Entity** route cleanup for **event-shape differential-role** remnants per **§5.3** (safe scope).
- **Phase 20.2** documentation updates: guide objectives, log, handoff, worklog; ready for **`/session-end 20.2.4`** then **`/phase-end 20.2`**.

## Acceptance Criteria
- No new server route recomputes booking totals or duplicates PartFinalizer.
- Calendar invite creation uses **event instance** rows tied to appointment selections and reads **placement** fields from the related **event shape** (loaded and applied per task findings — at minimum **validated + ordered or documented**).
- **Event shape** write paths do not accept or emit legacy **`differentialRole`** as a supported field (existing reject/strip behavior preserved or tightened); no accidental removal of unrelated **availability** differential features.
- **`cd server && npx tsc --noEmit`**, **`cd server && npm run lint`**, **`cd client && npm run lint`** pass after changes (or unchanged if a task is docs-only — prefer one docs-only task-end at most).

## Decomposition
- **Task 20.2.4.1:** **Appointments + calendar / invites** — Align `appointment*` routers and repositories with FEATURE_20 **§5.1–5.2** persistence story; update **`inviteOrchestrationService`** (and shared invite helpers) so Google Calendar creation **reads segment identity and placement policy** from **`event_instances` / `event_shapes`**; document or implement multi-segment timing policy vs `selectedTimeSlots`.
- **Task 20.2.4.2:** **API cleanup + phase closeout** — Remove or isolate **differential-role** helpers on **event-shape** entity paths per **§5.3**; grep cleanup; update **`phase-20.2-guide.md`**, **`phase-20.2-log.md`**, phase handoff / **`DOMAIN_REWRITE_WORKLOG.md`** for **20.3**; final lint/tsc.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.2-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.3-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
