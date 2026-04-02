# Plan: session 20.1.2 — ** ** Block instance three-property alignment and legacy cleanup -- migration: ADD `orchestrator` (bool), ADD `wizardVisible` (bool) to `block_instances`; DROP `bookingMode`, `differential`, `differentialEventRoleOverrides` from `block_instances`; DROP `composable`, `isStateControl`, `canHaveParts` from `block_shapes`; update both Sequelize models; update `BlockInstanceEntity` and `BlockShapeEntity` client types.

## Contract
- **Tier:** session | **ID:** 20.1.2
- **Scope:** ** ** Block instance three-property alignment and legacy cleanup -- migration: ADD `orchestrator` (bool), ADD `wizardVisible` (bool) to `block_instances`; DROP `bookingMode`, `differential`, `differentialEventRoleOverrides` from `block_instances`; DROP `composable`, `isStateControl`, `canHaveParts` from `block_shapes`; update both Sequelize models; update `BlockInstanceEntity` and `BlockShapeEntity` client types.
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
Completed Session 20.1.1: block shape type rename landed on server + client constants. This session picks up the next schema pass: move the three-property booleans onto `block_instances`, remove legacy instance/shape columns, and update direct consumers before app/lint verification. <!-- harness-across-ladder:start -->

## Story
**This session delivers** block-instance three-property schema alignment and block-shape legacy cleanup across migrations, Sequelize models, and directly impacted type/validation consumers **so that** later passes can treat `block_instances` as the home of `composite` / `orchestrator` / `wizardVisible` without carrying legacy shape booleans or stale instance fields.
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

- **Paths reviewed:** `server/src/db/models/booking/block_instance.ts`; `server/src/db/models/admin/block_shape.ts`; `client/src/types/entities.ts`; `server/src/routes/internal/entities/entityCrudRouter.ts`; `server/src/routes/internal/relationships/relationshipHelpersValidation.ts`; grep across `server/src/**` for `bookingMode`, `differentialEventRoleOverrides`, `differential`, `composable`, `isStateControl`, `canHaveParts`, `wizardVisible`, `orchestrator`; grep across `client/src/**` for the same field names.
- **Patterns / call sites:** `BlockInstance` still stores `bookingMode`, `differential`, `differentialEventRoleOverrides`, and already has `composite`; `BlockShape` still stores `composable`, `canHaveParts`, `isStateControl` plus a validate hook and relationship validation messages built around those flags. Client `BlockInstanceEntity` / `BlockShapeEntity` mirror those legacy fields. Direct server logic depends on shape booleans in `entityCrudRouter.ts`, `relationshipHelpersValidation.ts`, `validateUserRoleBlockAlignmentPayload.ts`, `userTypeMapping.ts`, `stateControlUserTypeBlockInstanceIds.ts`, and `availabilityDifferentialAttendeeCleanup.ts`. Client logic still filters `BlockShapeEntity.isStateControl` in `eventAttendeeUtils.ts` and `eligibleUserRoleAlignmentBlockInstances.ts`; booking code still reads `differentialEventRoleOverrides` from `BlockInstanceEntity`.
- **Gaps / unknowns:** Architecture says shapes should not store the three booleans, but some existing server rules still use shape-level `isStateControl` / `composable`. This session must either (a) re-home those checks to stable replacement signals now, or (b) narrow the schema drop to what can be safely removed without breaking runtime flows. Verify migration order against current DB columns before execute.

## Analysis
- **Problem / why now:** Session 20.1.1 renamed the type vocabulary; the next locked architecture rule is that the three orthogonal properties live on `block_instances`, not `block_shapes`. Current models and client types still encode the old split, so later event/admin passes would build on the wrong shape.
- **Domain boundaries:** Server persistence (`db/models`, migrations) plus client-only entity types and direct consumers in admin/booking flows. No new shared types are needed; this remains local to `server/` and `client/src/types`.
- **Grounding in code:** `block_instance.ts` and `client/src/types/entities.ts` prove the old instance fields are still modeled. `block_shape.ts`, `entityCrudRouter.ts`, and `relationshipHelpersValidation.ts` prove runtime code still assumes shape-level booleans are authoritative.
- **Patterns to follow:** Keep migrations idempotent (`IF EXISTS` / `DROP COLUMN IF EXISTS`) and pair model/type changes in the same task. Prefer narrow targeted cleanup around direct field references instead of broad refactors.
- **Risks / open questions:** The biggest risk is **runtime behavior**, not lint. Removing `isStateControl` / `composable` from the model without replacing their call sites will break attendee validation, user-role alignment, and component relationship rules. We should explicitly capture that in task scope instead of pretending this is “models only.”
- **Alternatives considered:** Doing one giant task for all model + consumer cleanup would blur risk and make recovery harder. Splitting by entity family (`block_instances` first, `block_shapes` second) gives cleaner checkpoints.

## Goal
Align **block instance** and **block shape** storage with the locked three-property model for this session only:
- `block_instances` owns `composite`, `orchestrator`, `wizardVisible`.
- Remove legacy instance columns `bookingMode`, `differential`, `differentialEventRoleOverrides`.
- Remove legacy shape booleans `composable`, `isStateControl`, `canHaveParts`.
- Update Sequelize models, client entity types, and direct runtime references that would break once those columns disappear.

**Done for this session:** Migration(s) authored; `BlockInstance` / `BlockShape` Sequelize models updated; `BlockInstanceEntity` / `BlockShapeEntity` updated; direct legacy field references addressed enough for app start + lint to pass.

## Files
- **Canonical (read-only references):** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§1, §2, §8.1), `.project-manager/ARCHITECTURE.md` (§8–§14)
- **Harness / PM:** `phases/phase-20.1-guide.md`, this planning doc, feature handoff/log
- **Migration(s) (create):** `server/src/db/migrations/` — add `orchestrator`, `wizard_visible`; drop legacy columns from `block_instances` / `block_shapes`
- **Server models (modify):** `server/src/db/models/booking/block_instance.ts`, `server/src/db/models/admin/block_shape.ts`
- **Server direct consumers (verify/update as needed):** `server/src/routes/internal/entities/entityCrudRouter.ts`, `server/src/routes/internal/relationships/relationshipHelpersValidation.ts`, `server/src/utils/validateUserRoleBlockAlignmentPayload.ts`, `server/src/utils/userTypeMapping.ts`, `server/src/repositories/stateControlUserTypeBlockInstanceIds.ts`, `server/src/repositories/availabilityDifferentialAttendeeCleanup.ts`
- **Client types / direct consumers (modify):** `client/src/types/entities.ts`, plus any direct references revealed by grep (initially `client/src/utils/eventAttendeeUtils.ts`, `client/src/utils/admin/eligibleUserRoleAlignmentBlockInstances.ts`, booking consumers of `differentialEventRoleOverrides`)
- **Out of scope for this session:** event schema / attendee table rename files (`event_shape`, `event_instance`, attendee model rename) — session 20.1.3

## Approach
1. **Task 20.1.2.1:** Handle `block_instances` storage: author migration for `orchestrator` + `wizard_visible`, drop `bookingMode`, `differential`, `differentialEventRoleOverrides`, update `block_instance.ts`, `BlockInstanceEntity`, and any direct booking/client consumers that must compile once those fields are gone.
2. **Task 20.1.2.2:** Handle `block_shapes` cleanup: drop `composable`, `isStateControl`, `canHaveParts`, remove model validate hook, update `BlockShapeEntity`, and re-home or remove direct runtime checks that still depend on those booleans.
3. **Migration pattern:** `.mjs` raw SQL with JSDoc header + idempotent guards. If runtime code still reads a field, update that code in the same task before considering the drop complete.
4. **Verification:** run `cd server && npm run lint`, `cd client && npm run lint`, and app start check after both tasks. Grep for removed field names in touched domains before `session-end`.
5. **DB_HOST policy:** author files here; only execute migrations locally if DB host is `localhost` / `127.0.0.1`.

## Checkpoint
- After Task 20.1.2.1: `block_instances` model + client type compile with `orchestrator` / `wizardVisible`; removed instance fields no longer block build.
- After Task 20.1.2.2: no `BlockShape` model fields or direct client/server checks depend on `composable` / `isStateControl` / `canHaveParts`.
- Final session checkpoint: app starts; client + server lint pass; grep confirms removed field names are only present in intentional non-domain strings / archived docs.

## Deliverables
- Migration file(s) for `block_instances` / `block_shapes` column alignment
- Updated `server/src/db/models/booking/block_instance.ts`
- Updated `server/src/db/models/admin/block_shape.ts`
- Updated `client/src/types/entities.ts`
- Focused cleanup of direct runtime references to removed fields in server/client call sites

## Decomposition
- **Task 20.1.2.1:** Block instance three-property columns — add `orchestrator` / `wizardVisible`, drop legacy instance fields, update `BlockInstance` model + `BlockInstanceEntity` + direct consumers.
- **Task 20.1.2.2:** Block shape legacy boolean cleanup — remove `composable` / `isStateControl` / `canHaveParts`, update `BlockShape` model + `BlockShapeEntity` + direct server/client checks that still depend on them.

## Acceptance Criteria
- [ ] Migration(s) add `orchestrator` and `wizard_visible` to `block_instances` with safe defaults, and drop `bookingMode`, `differential`, `differentialEventRoleOverrides`.
- [ ] Migration(s) drop `composable`, `is_state_control`, and `can_have_parts` from `block_shapes`.
- [ ] `server/src/db/models/booking/block_instance.ts` and `client/src/types/entities.ts` reflect the new block-instance shape.
- [ ] `server/src/db/models/admin/block_shape.ts` and `client/src/types/entities.ts` no longer expose the removed block-shape booleans.
- [ ] Direct runtime references to removed fields are either updated to the new source of truth or removed so `cd server && npm run lint` and `cd client && npm run lint` pass.
- [ ] Coverage check: these two tasks are enough to enact the session goal without spilling event-shape work into 20.1.2.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.1-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
