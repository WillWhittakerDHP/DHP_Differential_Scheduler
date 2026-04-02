# Plan: task 20.1.3.2 — 20.1.3.2

## Contract
- **Tier:** task | **ID:** 20.1.3.2
- **Scope:** 20.1.3.2
- **Governance (harness snapshot):**
  - Governance Context (Task)
  - File-Scoped Violations
  - No existing violations in task files.
  - Thresholds (Quick Reference)

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function, booking
- **Gate profile:** fast
- **Suggested depth:** leaf — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
- [ ] #### Task 20.1.3.2: Relationships, validation, and booking/admin consumers **Goal:** `attendeeAssignments` parent is **event instance**; client `backendName` and validation match; remove `differentialRole` usage from `partFinalizer`, `eventAttendeeUtils`, admin shapes tab; grep cleanup; `npm run start:dev` + client/server lint clean. **Files:** - `server/src/routes/internal/relationships/relationshipConstants.ts`, `relationshipHelpersValidation.ts`, related CRUD handlers - `client/src/constants/relationships.ts` - `client/src/utils/booking/partFinalizer.ts`, `eventAttendeeUtils.ts` - `cl (See tier-up guide linked below)

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Sessions 20.1.1–20.1.2 aligned block shapes and instances; event modeling still encodes placement as `differential_role` and hangs calendar toggles on the shape. Principles §5.1–§5.4 require **placement types** on shapes and **named segments** (instances) with **per-segment** toggles and attendees — this session applies the DDL + model/type layer so later… _(truncated)_

## Story
**This task changes** booking and admin code that still depends on **`differentialRole` / `differential_role`** for event segment ordering and attendee matrices **because** migration **000061** removed that column from `event_shapes`; placement is now **`placement_kind`** + **`anchor_edge`**. It also **confirms and finishes** the **`attendeeAssignments` → `event_instance_attendees`** relationship (parent **`eventInstance`**) across validation, fetch paths, and any straggling UI defaults so the stack matches Feature 20 §2.2–§2.4.

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

- **Paths reviewed:** `client/src/constants/relationships.ts` (`attendeeAssignments.backendName: 'event_instance_attendees'`, parent `eventInstance`); `server/src/routes/internal/relationships/relationshipConstants.ts` (`EventInstanceAttendee`, parent `eventInstance`); `client/src/types/entities.ts` (`EventShapeEntity` still exposes derived `differentialRole` + `placementKind` / `anchorEdge`); `client/src/utils/transformers/entityTransformers.ts` (`eventShapeDifferentialRoleFromPlacementFields`); `client/src/utils/booking/partFinalizer.ts`, `minimizerEventShapes.ts`, `partFinalizerSlotShape.ts`, `partFinalizerSlotShapeHelpers.ts`, `perspectiveResolver.ts`; `client/src/utils/eventAttendeeUtils.ts`; `client/src/composables/admin/useShapesTab.ts` (default `differentialRole: 'major'`); `client/src/utils/admin/differentialRoleMatrixRows.ts`, `selectFieldValueResolution.ts`, `selectHandlersNormalization.ts`; `client/src/components/admin/generic/fields/DifferentialEventRoleOverridesField.vue`; `client/src/constants/entityFieldConstants.ts` (`DIFFERENTIAL_ROLE`); `client/src/utils/booking/appointmentShapeEventAttendees.ts`, `composables/booking/useAppointmentShape.ts`; `shared/utils/differentialRoleUtils.ts`, `shared/types/differentialRole.ts`.
- **Patterns / call sites:** `effectiveDifferentialRole(shapeId, templateRole, overrides)` is used to merge template + per-appointment overrides for major/minor segment ordering. After 000061, template role must come from **placement** fields (or a single shared helper), not from API `differential_role`. Relationship registry already targets **instance** attendees; batch fetch + merge path must use `eventInstanceId` consistently (verified in 20.1.3.1 handoff).
- **Gaps / unknowns:** Baseline **admin_metadata** seeds may still attach `attendeeAssignments` UI to **`eventShape`** (`20260320_000001_baseline_data.sql`); may need a follow-up migration or manual metadata update — flag if product still shows wrong parent in admin after code changes.

## Analysis
- **Problem / why now:** Schema no longer stores `differential_role` on shapes; client code that still types or branches on `differentialRole` is misleading and can desync from DB. Task 20.1.3.1 delivered models + migration; this task **cuts over** consumers.
- **Boundaries:** **Booking** (PartFinalizer, minimizer, slot helpers, perspective), **admin** (shapes tab, matrix overrides field, select normalization), **shared** (differential role utils may shrink to “ordering from placement” or stay for override map only). **Server:** `relationshipHelpersValidation.ts` and any Joi still naming `event_shape_attendees` or shape-parent attendees.
- **Patterns:** Prefer one **placement → ordering** helper (e.g. extend existing transformer helper) used by PartFinalizer and admin; keep **`event_assignments`** as the only scalar event routing on parts (ARCHITECTURE §10).
- **Risks:** Admin **DifferentialEventRoleOverridesField** UX may still be labeled “differential”; either rename copy or keep field as “segment overrides” with new semantics. **Grep** for `differentialRole`, `differential_role`, `event_shape_attendees`, `EventShapeAttendee` after edits.
- **Alternatives:** (a) Keep transient derived `differentialRole` on `EventShapeEntity` until all consumers migrated — rejected for this task (goal is removal from PartFinalizer / eventAttendeeUtils / shapes tab). (b) Replace overrides map with placement-keyed structure — **out of scope** unless required for compile; prefer minimal change: same override map keys with semantics documented.

## Design
1. **Ordering / template role:** Introduce or reuse a small function **`placementFieldsToSegmentOrderRole`** (name TBD) mapping `(placementKind, anchorEdge)` → the same major/minor/none semantics `effectiveDifferentialRole` expected from the template. PartFinalizer, minimizer, slot helpers, and `eventAttendeeUtils` call this instead of reading `es.differentialRole` from the entity (and drop `differentialRole` from `EventShapeEntity` when no longer needed).
2. **Entity layer:** Remove `differentialRole` from `EventShapeEntity` once all consumers use placement; remove `eventShapeDifferentialRoleFromPlacementFields` from transformers or reduce to internal helper only.
3. **Admin:** `useShapesTab` defaults: set **`placementKind` / `anchorEdge`** defaults instead of `differentialRole`. Matrix rows + `DifferentialEventRoleOverridesField`: drive rows from placement or keep override storage but label consistently; `selectFieldValueResolution` / `selectHandlersNormalization`: drop `differentialRole` field keys if fields removed from metadata registry (coordinate with `entityFieldConstants` / admin metadata).
4. **Server validation:** `validateAttendeeAssignmentEntities` and related: assert parent is **event instance** row, child is user-type **block instance**; table name **`event_instance_attendees`** only.
5. **Verification:** `npm run start:dev`, `cd client && npm run lint`, `cd server && npm run lint`; ripgrep gates for forbidden identifiers above.

## Implementation Orders (after /accepted-code)
1. Add **`placementKind` + `anchorEdge` → ordering role** helper in `shared/` or `client/src/utils/booking/` (single source); unit-equivalent behavior to current major/minor for default placement seeds.
2. Update **`partFinalizer.ts`**, **`minimizerEventShapes.ts`**, **`partFinalizerSlotShape.ts`**, **`partFinalizerSlotShapeHelpers.ts`**, **`perspectiveResolver.ts`** to use the helper; remove `DifferentialRole` imports where obsolete.
3. Update **`eventAttendeeUtils.ts`** to use helper + overrides only.
4. Update **`useShapesTab.ts`**, **`differentialRoleMatrixRows.ts`**, **`DifferentialEventRoleOverridesField.vue`**, **`selectFieldValueResolution.ts`**, **`selectHandlersNormalization.ts`**, **`entityFieldConstants.ts`** as needed for placement-first admin.
5. Remove **`differentialRole`** from **`EventShapeEntity`** and **`entityTransformers.ts`** / **`apiEntityFieldNormalization.ts`** once nothing reads it.
6. Server: **`relationshipHelpersValidation.ts`** (and related) — confirm **`validateAttendeeAssignmentEntities`** uses **event instance** parent + **`EventInstanceAttendee`** model.
7. **`rg`** cleanup; run **start:dev** + **lint** both packages.

## Goal
For **session 20.1.3 only** (phase 20.1 checklist items that remain for events):
- `event_shapes`: add **`placement_kind`**, **`anchor_edge`**; remove **`differential_role`**, **`include_reschedule_link`**, **`include_cancel_link`** (after data copied to instances where required).
- `event_instances`: add **`parent_block_instance_id`**, **location** fields per FEATURE_20 §2.3, and **`include_reschedule_link`**, **`include_cancel_link`** (per-segment).
- Rename **`event_shape_attendees` → `event_instance_attendees`** with FK to **`event_instance_id`** (model file rename, associations, registry).
- Seed **default placement type** rows per FEATURE_20 §2.2 (if still specified as DB seed vs enum-only — implement per locked doc).
- Update **Sequelize models**, **client entity types**, **transformers/sanitizers**, **relationship constants + validation**, and **direct consumers** (`partFinalizer`, `eventAttendeeUtils`, shapes-tab composables) so the app **starts** and **lint passes**.

**Out of scope for 20.1.3:** Full UX polish for segment pickers, public booking wizard copy, and deep route refactors beyond what is required to compile and preserve behavior.

## Files
- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§2.2–§2.4, §5, §8.1 event bullets), `ARCHITECTURE_PRINCIPLES.md`, `.project-manager/ARCHITECTURE.md`, `phases/phase-20.1-guide.md`
- **Migrations (create):** `server/src/db/migrations/*.mjs` — event shape/instance columns; attendee table rename + FK; optional backfill steps; placement seeds
- **Server models:** `event_shape.ts`, `event_instance.ts`, `event_shape_attendee.ts` → `event_instance_attendee.ts` (table `event_instance_attendees`), `index.ts`, `sequelizeModelAssociationsPartA.ts`, `config/app.js`
- **Server routes/utils:** `entitySanitizers.ts`, `relationshipConstants.ts`, `relationshipCrudRouter` / handlers if table names appear, `relationshipHelpersValidation.ts`, internal entity Joi if event fields validated
- **Client:** `client/src/types/entities.ts`, `entityTransformers.ts`, `apiEntityFieldNormalization.ts`, `constants/relationships.ts`, `partFinalizer.ts`, `eventAttendeeUtils.ts`, `useShapesTabEventPanel.ts`, `ShapesTabEventPanel.vue`, `useEntityCardFormSetup.ts`, any grep hits for `differentialRole`, `event_shape_attendees`, `EventShapeAttendee`

## Approach
1. **Task 20.1.3.1:** Author migration(s): add new enums/columns; backfill `include_*` from shapes to all related `event_instances` (or documented rule); add instance location + `parent_block_instance_id`; drop removed shape columns; rename attendee table and column FKs; insert placement seeds; update `EventShape` / `EventInstance` / attendee Sequelize models + `index.ts` / associations / `app.js` exports; update client `EventShapeEntity` / `EventInstanceEntity` and field normalization/transformers (relationship registry and `partFinalizer` follow in 20.1.3.2).
2. **Task 20.1.3.2:** Complete **attendee relationship** rename: `RELATIONSHIP_REGISTRY` parent `eventInstance`, new Sequelize model name, `client/src/constants/relationships.ts` `backendName`, `validateAttendeeAssignmentEntities`, admin relationship UI labels if hard-coded; replace **`differentialRole`** usage in **`partFinalizer`** / **`eventAttendeeUtils`** and admin shapes tab with **`placement_kind` / `anchor_edge`** (or interim ordering helper); verify **event routing** still flows through `event_assignments` only (no scalar event fields on part instances).
3. **Verification:** `npm run start:dev`; `cd client && npm run lint`; `cd server && npm run lint`. Migrations: author always; **run** only when `DB_HOST` is localhost/127.0.0.1 per project policy.

## Checkpoint
- After 20.1.3.1: DB schema + core models + client types reflect new columns; no references to dropped shape columns in models (consumers may be temporarily broken until 20.1.3.2 — prefer completing both tasks in one session push if policy allows).
- After 20.1.3.2: No `differentialRole` on event shapes in TS; attendees keyed to instances; relationship admin path works for create/list/delete; phase-20.1 event bullets in `phase-20.1-guide.md` can be checked.

## Deliverables
- [ ] No production use of **`es.differentialRole`** on event shapes in `partFinalizer.ts`, `eventAttendeeUtils.ts`, `minimizerEventShapes.ts`, `partFinalizerSlotShape*.ts`, `perspectiveResolver.ts` — use **placement** (+ shared helper) instead.
- [ ] Admin **`useShapesTab`** (and related event shape defaults) use **placement** fields, not `differentialRole`.
- [ ] **Matrix / overrides** path (`differentialRoleMatrixRows`, `DifferentialEventRoleOverridesField`) updated to use placement-derived template or documented interim bridge without reading dropped DB column.
- [ ] **Server** relationship validation and messages aligned with **`event_instance_attendees`** + parent **event instance**.
- [ ] **`EventShapeEntity`** (and transformers) updated: remove `differentialRole` when safe; **`entityFieldConstants` / select normalization** updated if field keys removed.
- [ ] Grep cleanup: no stray `event_shape_attendees` / `EventShapeAttendee` in app code paths that should be instance-based.
- [ ] App starts; client + server lint clean.

## Acceptance Criteria
- [ ] `attendeeAssignments` client `backendName` and server registry both reference **`event_instance_attendees`** with parent **`eventInstance`** (already true — re-verify after edits).
- [ ] PartFinalizer pipeline resolves segment ordering from **placement_kind / anchor_edge** (and existing override map), not from removed shape column.
- [ ] `eventAttendeeUtils` does not depend on template `differentialRole` from the entity for the same purpose.
- [ ] Admin shapes event panel does not send or default **`differentialRole`** as the primary placement control.
- [ ] `npm run start:dev` succeeds; `client` and `server` lint pass (no new tests; testing suspended).

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.3-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.3.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
