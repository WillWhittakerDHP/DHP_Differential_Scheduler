# Plan: phase 20.6 — 20.6

## Contract
- **Tier:** phase | **ID:** 20.6
- **Scope:** 20.6
- **Governance (harness snapshot):**
  - Governance Context (Phase)
  - Type Inventory Issues
  - Duplication Hotspots (top 4)
  - Import Graph
  - **1** fan-in violations: `client/src/composables/entityCrud/useEntityCrud` (21)
  - **7** composable chain depth violations (max depth exceeded)

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** docs, architecture, booking
- **Gate profile:** decomposition
- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Phase 20.5 completed with sessions: 20.5.1, 20.5.2, 20.5.3.

## Story
**As a** maintainer completing Feature 20, **I want** Pass 6 (**§8.6**) executed as ordered sessions—metadata DDL teardown, **EntityCard** deletion, differential-role/event-shape legacy cleanup, and doc review gates—**so that** the codebase matches the **replacement-first** acceptance checks and the admin stack no longer carries the DB-driven metadata pipeline.

**Estimated size:** **L** (multiple cross-cutting deletes across server, client, and migrations; order-sensitive).

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

- **Paths reviewed:** `server/src/routes/internal/index.ts` (mounts **`/admin-metadata`**); `server/src/routes/internal/admin-metadata/` (router + helpers); `server/src/routes/internal/shared/metadataValidatorFactory.ts`; `server/src/routes/schemas/adminMetadata*.ts`; `client/` grep targets for `admin-metadata`, `EntityCard`, `useEntityCard` (per **`ENTITY_CARD_CONSUMERS_20.6.md`**); `.project-manager/features/domain-architecture-alignment/ANNOTATION_METADATA_DEFERRALS_20.6.md`; **`DOMAIN_REWRITE_WORKLOG.md`** (Pass 5 admin metadata retirement ordering); **`phases/phase-20.6-guide.md`** (verbatim §8.6 scope).
- **Patterns / call sites:** Admin metadata is still a **first-class internal API** (`adminMetadataRouter` and related Joi schemas). **EntityCard** remains in **Shapes** tab panels, **RelationshipCollection**, modals, and **`AnnotationShapeListCard`** façade. Pass **20.3–20.5** delivered replacement editors and **written** retirement order; **20.6** is **execution** of deletes and route/model removal **after** proven cutover.
- **Gaps / unknowns:** Exact **migration file names** and **table list** for metadata drops must be taken from **§6.3a** + current Sequelize models under **`server/src/db/models/admin/`** at implementation time; confirm **no** booking or wizard path still prefetch metadata before deleting client queries. **Differential-role** deletion set should be re-scanned with ripgrep at **session 20.6.3** start (symbol list drifts).

## Analysis
- **Problem / why now:** Phases **20.1–20.5** aligned schema, API, admin UX, booking pipeline, and **documented** migration/metadata retirement. **§8.6** is the **final** pass: remove infrastructure that violates the target architecture (metadata pipeline, **EntityCard** generic shell, legacy differential-role paths) **without** reversing “replacement first.”
- **Boundaries:** Crosses **admin** (Vue + composables), **server** (routes, models, migrations), and **shared** (validators/types touched by metadata). **Booking** must remain **PartFinalizer-on-client**; no server-side recomputation of wizard totals as part of cleanup.
- **Patterns:** Follow **§6.3a** inventory and **`ENTITY_CARD_CONSUMERS_20.6.md`**; use **explicit domain components** already introduced in Pass 3–4 instead of preserving metadata-driven renderers. Migrations obey **DB_HOST** policy (localhost only for execute).
- **Risks:** Deleting metadata **before** last consumer is cut over breaks admin screens; order must match **DOMAIN_REWRITE_WORKLOG** narrative. **EntityCard** internal tree is large—delete only when import graph is zero.
- **Alternatives:** “Big bang” single PR — **rejected**; phased sessions **20.6.1–20.6.4** match cleanup grouping and rollback clarity.

## Goal
Complete **Phase 20.6 (Pass 6 — Rollout and cleanup)** per **`FEATURE_20_ARCHITECTURE_REDESIGN.md` §8.6** and **`phases/phase-20.6-guide.md`**: prove **replacement-first** cleanup of admin metadata (full stack), **EntityCard** tree removal, differential-role / event-shape remnants listed in the plan, and closeout docs/review gates as scoped in **§9.3–§9.4** when applicable.

**Feature-wide:** Finishing **20.6** is the last numbered pass in Feature 20; after it, run **`/feature-end`** when the feature guide and **PROJECT_PLAN** say the feature is complete.

## Files
- **Canonical (read-only intent):** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§6.3a, §8.6, §9.3–§9.5**), `.project-manager/ARCHITECTURE.md`
- **Harness / PM:** `feature-domain-architecture-alignment-guide.md` (now includes **`## Phase 20.6`** for tier context), `phases/phase-20.6-guide.md`, `ENTITY_CARD_CONSUMERS_20.6.md`, `ANNOTATION_METADATA_DEFERRALS_20.6.md`, `DOMAIN_REWRITE_WORKLOG.md`, `phases/phase-20.5-handoff.md`
- **Implementation hotspots (Pass 6):** `server/src/routes/internal/admin-metadata/**`, `server/src/db/models/admin/**` (metadata models), `server/src/routes/internal/index.ts`, `client/src/components/admin/generic/EntityCard*.vue`, `client/src/components/admin/**` (consumers in inventory), `client/src/composables/admin/**` (entity-card composables), client services calling **`/admin-metadata`**

## Approach
1. **Session order:** **20.6.1** metadata server/client API removal → **20.6.2** EntityCard → **20.6.3** differential-role / event-shape remnants → **20.6.4** docs and review gate. Adjust only if a dependency discovery forces it; document in session logs.
2. **Replacement first:** Each session starts with a **consumer check** (grep + smoke admin paths); no DDL or bulk delete until the prior replacement is proven in the guide’s sense (**§8.6** acceptance).
3. **Migrations:** Author migration files in-repo; **execute** only when **`DB_HOST`** is local per project rule; shared environments consume migrations from the host.
4. **Verification:** After each session, **`npm run start:dev`**, **`cd client && npm run lint`**, **`cd server && npm run lint`** (per Definition of Done); regen typecheck audit if tier-end complains about stale JSON.
5. **Coordination:** If **Feature 6** surfaces overlap (booking), cite **ARCHITECTURE.md** booking boundary; do not expand scope into new product behavior.

## Checkpoint
- **`/accepted-plan`:** Confirms decomposition **20.6.1–20.6.4** covers **§8.6** scope and **§6.3a** inventory paths.
- **Per session:** **§9.1 / §9.1a** drift checklist at start and end; update **`DOMAIN_REWRITE_WORKLOG.md`** when retirement steps land.
- **Branch:** Stay on **`feature/domain-architecture-alignment`** for implementation (already standard for this feature).

## Deliverables
- **Code:** Admin metadata **routes, models, and client callers** removed or detached per **§6.3a**; **EntityCard** tree deleted; listed **differential-role** / **event-shape** remnants removed per **§8.6** grouping.
- **Migrations:** DDL for metadata tables (or equivalent) authored and documented; execution per **DB_HOST** policy.
- **Docs:** **`ARCHITECTURE.md`**, feature/phase handoffs, and **`DOMAIN_REWRITE_WORKLOG.md`** updated to describe **end state**; **§9.3–§9.4** artifacts if doc promotion is in scope for **20.6.4**.
- **Guides:** `phase-20.6-guide.md` session checkboxes advanced; session guides/logs for **20.6.x** created via harness.

## Acceptance Criteria
- [ ] **§8.6 — Cleanup follows replacement, not the reverse** (no metadata or EntityCard delete while required consumers remain).
- [ ] **§8.6 — Review gate artifacts** complete before any redesign doc promotion / filename consolidation (if attempted this phase).
- [ ] **§6.3a — Full metadata stack** removed from server + client (no orphan **`/admin-metadata`** mount or prefetch).
- [ ] **EntityCard —** zero imports of **`EntityCard.vue`** and internal tree removed per inventory.
- [ ] **Lint / app start —** Definition of Done satisfied at phase end.
- [ ] **Phase guide** status and **phase-20.6-handoff** **`## Next Action`** point to **`/feature-end`** or explicit follow-up.

## Decomposition
- **Session 20.6.1:** Admin metadata stack removal — server routes/models/migrations + client API usage (see **phase-20.6-guide** Sessions Breakdown).
- **Session 20.6.2:** EntityCard tree and façade consumers — replace/delete per **`ENTITY_CARD_CONSUMERS_20.6.md`**.
- **Session 20.6.3:** Differential-role utilities and event-instance / event-shape cleanup remnants.
- **Session 20.6.4:** Review gate, **`ARCHITECTURE.md`** / handoff / worklog sync; **`/feature-end`** readiness.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child sessions complete
- [ ] Phase guide and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/phases/phase-20.5-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
