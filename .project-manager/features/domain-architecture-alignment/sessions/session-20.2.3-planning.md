# Plan: session 20.2.3 — Relationships & event-instance preview

## Contract
- **Tier:** session | **ID:** 20.2.3
- **Scope:** Internal **relationship** routes and **`event-instance-preview`**: validate **`eventAssignments`** and **`attendeeAssignments`** (`event_instance_attendees`) for segment ownership and integrity; confirm **`validEventCascades`** (shape-level) behavior; re-scope preview API to a **specific event instance (segment)** under its **parent event block instance** per **FEATURE_20 §5.1** / **Principles §5.2**. No server-side booking totals or PartFinalizer.
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
Completed Task - Begin Session 20.2.3 <!-- harness-across-ladder:start -->

## Story
**This session delivers** aligned **relationship writes** and a **parent-scoped preview** path **so that** event segments cannot be wired to the wrong block instance, attendee rows stay consistent with segment ownership, and admin “real preview” resolves templates against the same segment metadata (e.g. link strip flags) the invite path uses — without adding server-side scheduling math (**ARCHITECTURE** §10 / FEATURE_20 §4).
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

- **Paths reviewed:** `server/src/routes/internal/relationships/relationshipConstants.ts` (**RELATIONSHIP_REGISTRY** — `eventAssignments`, `attendeeAssignments` → `EventInstanceAttendee`, `validEventCascades`); `relationshipCrudRouter.ts` (create path calls `validateAttendeeAssignmentEntities` for **attendeeAssignments** only); `relationshipHelpersMapping.ts` (`mapEventAssignmentsFields` checks parent is **BlockInstance**, no child segment check); `relationshipHelpersValidation.ts` (`validateAttendeeAssignmentEntities` — existence + user-type child only, **no** `parent_block_instance_id` on segment); `relationshipQueryBuilders.ts` (**eventAssignments** include shape for list UI); `server/src/db/models/booking/event_assignment.ts`, `event_instance.ts`, `event_instance_attendee.ts`; `server/src/routes/internal/event-instance-preview/eventInstancePreviewRouter.ts`; `server/src/services/invites/eventInstancePreviewService.ts` (**findOne** on `EventInstance` by **`eventShapeRef` only** — wrong segment if multiple); `shared/types/eventInstancePreview.ts`; `server/src/routes/schemas/eventInstancePreviewBodySchema.ts`; `client/src/composables/admin/useEventTemplatePreview.ts` + `client/src/utils/api/eventInstancePreviewApi.ts`; `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §5.1 rows for these routes.
- **Patterns / call sites:** Relationship creates use **normalizeRelationshipKind** + **mapRelationshipFields**; **pricing** cascades have shape-rule validation — **eventAssignments** do not yet mirror **validEventCascade** or **parent_block_instance_id**. Preview reuses **invite** template resolution (**buildInviteContext**, **resolveEventTemplates**); strip set comes from **sampleInstance** today via arbitrary first row for shape.
- **Gaps / unknowns:** Whether **DELETE** / batch relationship paths need the same integrity checks as POST; exact admin editor source for **eventInstanceId** when calling preview (likely `EventInstanceBuilderBody` / entity card — verify at task start).

## Analysis
- **Problem / why now:** Session **20.2.2** locked **entity** routes (event shape placement, event instance parent + §5.4 fields). **Relationships** and **preview** still allow ambiguous or cross-owner wiring: **`eventAssignments`** only verify parent is *some* block instance; **`eventInstancePreviewService`** picks an arbitrary segment by **`eventShapeRef`**. That violates **§5.2** ownership and risks wrong template/link behavior.
- **Boundaries:** **Admin / config** + **integrations-adjacent preview** only — **no** booking resolution on server. Touches **relationships** router, **invite/preview** service, **shared** preview types, **client** admin composable. **Out of scope for this session:** appointment persistence overhaul and **calendar external** routes (**20.2.4**).
- **Patterns to follow:** Mirror **validatePricingCascadeAgainstShapeRules** style (explicit `ValidationResult` or thrown errors with stable messages); reuse **TEMPORARY_ID** / UUID checks from **entityValidators** where relationship IDs are validated; keep **resolveEventTemplates** / **buildInviteContext** unchanged — only **which EventInstance row** is selected changes.
- **Risks:** Breaking admin preview API for callers that only send **`eventShapeRef`** — mitigate with clear **400** + client update in the same session. **validEventCascades** may need no code change beyond audit/comment if shape-level create is already consistent.
- **Alternatives considered:** Preview keyed by **`parentBlockInstanceId` + eventShapeRef** vs **`eventInstanceId`** — prefer **`eventInstanceId`** (single canonical segment, matches DB row for link flags and future fields).

## Goal
Relationship creates for **`eventAssignments`** and **`attendeeAssignments`** enforce **segment ↔ parent event block instance** integrity (and shape-level **`validEventCascades`** where applicable). **`POST /event-instance-preview`** (and shared/client contracts) identify a **single** **event instance** under the correct parent; preview service loads that row’s metadata — **no** global **`findOne` by `eventShapeRef`**. No server-side resolved booking totals.

## Files
- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §5.1, `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md` §4–§5, `.project-manager/ARCHITECTURE.md`
- **Harness / PM:** `phases/phase-20.2-guide.md`, `sessions/session-20.2.2-handoff.md`, `DOMAIN_REWRITE_WORKLOG.md` (decision log after tasks)
- **Server:** `server/src/routes/internal/relationships/relationshipCrudRouter.ts`, `relationshipHelpersValidation.ts`, `relationshipHelpersMapping.ts` (if field mapping needs extension), optionally `relationshipHelpers.ts` / delete handlers if parity required
- **Preview:** `server/src/routes/internal/event-instance-preview/eventInstancePreviewRouter.ts`, `server/src/services/invites/eventInstancePreviewService.ts`, `server/src/routes/schemas/eventInstancePreviewBodySchema.ts`
- **Shared:** `shared/types/eventInstancePreview.ts`
- **Client:** `client/src/composables/admin/useEventTemplatePreview.ts`, `client/src/views/admin/tabs/components/EventInstanceBuilderBody.vue` (or sibling) as needed to pass **segment id**; `client/src/utils/api/eventInstancePreviewApi.ts`

## Approach
1. **Relationships (task 1):** Add **`validateEventAssignmentIntegrity(parentBlockInstanceId, eventInstanceId)`** (names indicative): load **BlockInstance** + **BlockShape** (parent **`type === 'event'`**), load **EventInstance**, assert **`eventInstance.parentBlockInstanceId === parentId`** and non-null parent; optionally assert **validEventCascade** exists for (**parent shape**, **event shape ref**) when child segment’s shape ref is known. Extend **`validateAttendeeAssignmentEntities`** to require **`eventInstance.parentBlockInstanceId`** non-null (align with **20.2.2** API). Wire from **`relationshipCrudRouter`** **POST** (and DELETE if orphan risk) for **`eventAssignments`** / **`attendeeAssignments`**.
2. **Preview (task 2):** Extend request body with **`eventInstanceId`** (required for real preview); deprecate or reject **`eventShapeRef`-only** requests with **400** + message. Service: **`EventInstance.findByPk`** including attributes needed for **`linkStripSetForEventShape`**; verify instance belongs to expected context if additional guard is needed. Update Joi, **`@shared`** types, **`useEventTemplatePreview`**, and admin UI draft shape.
3. **validEventCascades:** Read-only pass in task 1 — document current create validation; add shape-pair check only if missing and FEATURE_20 requires it.
4. After each task: **`cd server && npm run lint`**, **`npx tsc --noEmit`**, **`cd client && npm run lint`** for touched client files; **`npm run start:dev`** smoke at session end.

## Checkpoint
- **20.2.2** complete: **eventInstance** POST requires parent; segment rows are ownership-capable.
- Re-read **phase-20.2-guide.md** session **20.2.3** bullet before **`/task-start`**.

## Deliverables
- Validated **eventAssignments** / **attendeeAssignments** creates (and documented parity for other verbs if implemented).
- **event-instance-preview** request/response contract updated; client admin preview uses **segment id**.
- Lint + **tsc** clean for touched paths; session log / handoff updated at **session-end**.

## Acceptance Criteria
- **eventAssignments** create: **400** when child **EventInstance** is missing, **`parent_block_instance_id` is null**, or **≠** relationship parent block id; **400** when parent block is not **`type === 'event'`** (or product-defined equivalent).
- **attendeeAssignments** create: **400** when segment has no parent block instance (if still nullable in DB).
- **validEventCascades:** Documented in planning/task notes; code change only if audit finds missing shape-level guard inconsistent with FEATURE_20.
- **Preview:** **400** when **`eventInstanceId`** missing or unknown; resolved templates use **that** instance’s **`includeRescheduleLink` / `includeCancelLink`** (and no **`findOne({ eventShapeRef })`** for production path).
- No new server endpoints compute **resolvedTime** / **resolvedFee** / **resolvedEvent** totals.

## Decomposition
- **Task 20.2.3.1:** **Relationship integrity** — `eventAssignments` + `attendeeAssignments` (+ `validEventCascades` audit / minimal fixes) in `server/src/routes/internal/relationships/**`.
- **Task 20.2.3.2:** **Preview re-scope** — `eventInstanceId`-based **POST /event-instance-preview`, service + shared types + **`useEventTemplatePreview`** + admin builder wiring.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.2-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.2-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
