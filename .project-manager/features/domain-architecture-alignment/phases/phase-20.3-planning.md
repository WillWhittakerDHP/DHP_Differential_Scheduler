# Plan: phase 20.3 — 20.3

## Contract
- **Tier:** phase | **ID:** 20.3
- **Scope:** 20.3
- **Governance (harness snapshot):**
  - Governance Context (Phase)
  - Type Inventory Issues
  - Duplication Hotspots (top 4)
  - Import Graph
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
Phase 20.2 completed with sessions: 20.2.1, 20.2.2, 20.2.3, 20.2.4.

## Story
**As an** admin configurator, **I want** domain-specific editors that respect instance-level orchestration and event placement (no differential-role UX), **so that** admin behavior matches **ARCHITECTURE** §8–§9 and the **20.2** API contracts without reintroducing legacy mental models.
**Estimated size:** L (multiple editor surfaces + EntityCard rollout start)

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

- **Paths reviewed:** `client/src/views/admin/tabs/InstancesTab.vue` (block-instance groups + **Events** tab / `EventInstancesSection`); `client/src/views/admin/tabs/ShapesTab.vue` + `ShapesTabEventPanel.vue` (event **shape** structural editing); `client/src/configs/field/display/appliedDisplay/eventShapeDisplays.ts` (placement field display); `client/src/constants/entityFieldConstants.ts` (`placementKind`, `anchorEdge`); `client/src/composables/admin/useShapesTab.ts` (defaults for new event shapes); `client/src/utils/transformers/entityTransformers.ts` (placement sanitization on transform); `client/src/components/admin/generic/EntityCard.vue` + `RelationshipCollection.vue` (generic card + collection pattern); `client/src/utils/admin/differentialRoleMatrixRows.ts` (placement → role display — verify copy moves to placement language); `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §8.3, §3, §6 / §6.3; `phases/phase-20.3-guide.md`; `phases/phase-20.2-handoff.md`.
- **Patterns / call sites:** Event **placement** already flows through transformers + `GlobalEntity` types (`client/src/types/entities.ts`). Admin **metadata** path is `MetadataEditModal` → `AdminPrimitiveMetadataEditor` (rendering config, not domain scheduling). **EntityCard** remains the workhorse for instance/shape editing in collections; FEATURE_20 §8.3 orders **PlacementTypeEditor** first, then **ServiceAtomicEditor**, then other editors, then **segment-manager relocation**, then annotation narrowing + EntityCard replacement start.
- **Gaps / unknowns:** Exact file names **PlacementTypeEditor** / **ServiceAtomicEditor** may not exist yet — child sessions create or promote them. Scope of “segment manager” relocation vs current `EventInstancesSection` UX needs task-level wireframes in session planning. Server changes should be **minimal** in 20.3 unless an API gap blocks admin (prefer aligning UI to **20.2** contracts).

## Analysis
- **Problem / why now:** Phases **20.1–20.2** moved schema and APIs to **placement + instance three-property** semantics. Admin UI still mixes generic cards, legacy tabs, and differential-role **language** in places. Pass **§8.3** makes admin **reflect** the new model: shapes = structural validity; instances = orchestration selection + segments + placement types.
- **Domain boundaries:** Primarily **client admin** (`components/admin`, `composables/admin`, `views/admin`, `configs/field`). Touches **shared** only if new display enums or copy constants belong in `@shared`. **No** server-side PartFinalizer or booking totals. Server edits only for missing internal endpoints or bugs uncovered by UI (document in session if any).
- **Patterns to follow:** Thin components; composables with explicit return types; reuse `ENTITY_CONFIGS` / field display configs; governance playbooks (component, composable, type). Replacement-before-delete for EntityCard per §6.3.
- **Risks:** Over-scoping “rewrite all admin” — stay within §8.3 sequence. Regression risk on **Instances** and **Shapes** tabs; verify block-instance vs event-instance flows after relocation.
- **Alternatives:** Big-bang EntityCard removal — **rejected**; plan requires incremental high-confidence replacements first.

## Goal
Complete **FEATURE_20 §8.3 — Pass 3 (Admin UX alignment)** on branch `feature/domain-architecture-alignment`: orchestration editors use **validity-constrained selection** language; **shapes** UI stays **structural**; **event** editing centers on **segments**, **placement**, and **part-instance** assignments; begin **EntityCard** replacement with the smallest safe editors and annotation-metadata narrowing per plan §6.3.

## Files
- **Canonical:** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§3, §6, §8.3, §9.1), `.project-manager/ARCHITECTURE.md`
- **PM / harness:** `phases/phase-20.3-guide.md`, `phases/phase-20.3-planning.md` (this file), `feature-domain-architecture-alignment-guide.md`, `DOMAIN_REWRITE_WORKLOG.md`
- **Implementation (expected hotspots):** `client/src/views/admin/**`, `client/src/components/admin/**`, `client/src/composables/admin/**`, `client/src/configs/field/**`, `client/src/types/admin/**`, `client/src/types/entities.ts`, `client/src/utils/admin/**`, `client/src/utils/transformers/entityTransformers.ts`

## Approach
1. Follow FEATURE_20 **first execution sequence** §8.3 (Placement → service atomic → other domain editors → segment relocation → annotation / EntityCard start).
2. For each session: plan tasks under **`/session-start`**, keep **§9.1 drift checklist** in session notes, prefer **feature flag or incremental rollout** only if product requires it (default: ship behind existing admin routes).
3. **Copy and labels:** Replace user-facing **differential-role** explanations with **placement / segment** language where §8.3 applies; keep internal `differentialRoleUtils` usage only where it is derived from placement (document in task if confusing).
4. **Testing:** Suspended project-wide — rely on **lint**, **typecheck**, and **manual admin smoke** per Definition of Done.
5. After phase-end: update **phase-20.3-guide** checkboxes, **phase log**, **handoff** for **20.4** (booking pipeline).

## Checkpoint
- **Before `/accepted-plan`:** Phase **20.2** is complete and pushed; this plan’s **Decomposition** matches §8.3 order.
- **Per session:** §9.1 drift checklist; no new server booking calculator; shapes vs instances separation preserved in UI.
- **Before `/phase-end 20.3`:** All sessions **20.3.x** closed; guide objectives checked; handoff lists **20.4** context.

## Deliverables
- **Placement-focused editor(s)** for event **shapes** (`placementKind` / `anchorEdge`) meeting §8.3 item 1 (named or equivalent to **PlacementTypeEditor**).
- **Service atomic convergence editor** (§8.3 item 2) for service-instance orchestration UX.
- **Remaining domain editors** (§8.3 item 3) for instance-level orchestration where product requires, using validity-constrained selection.
- **Segment manager** UX relocated into **event block-instance** editing context (§8.3 item 4); reduced reliance on standalone “events” island where replaced.
- **Annotation-only metadata narrowing** and **first EntityCard replacement** slice (§8.3 item 5 + §6.3 rollout discipline).
- Updated **phase-20.3-guide**, **phase-20.3-log**, **phase-20.3-handoff**; **DOMAIN_REWRITE_WORKLOG** checkpoint when material.

## Acceptance Criteria
- [ ] Orchestration UI copy and controls reflect **validity-constrained selection** (orchestrator selects among **valid** downstream instances, does not redefine structure).
- [ ] **Shapes** tab / event **shape** flows remain **structural** (valid relationships, templates); instance three-property flags edited in **instance** contexts, not on shapes.
- [ ] **Event** admin flows emphasize **segments** (event instances), **placement types**, and **part-instance** ties per §8.3 acceptance checks.
- [ ] At least one **EntityCard** call site replaced or narrowed per §6.3 “smallest high-confidence first,” or documented deferral with reason in phase log.
- [ ] Client + server **lint** clean; app starts; no new `@audit-allow` without justification.

## Decomposition
- **Session 20.3.1 — Placement type editor (§8.3 #1):** Introduce or elevate **PlacementTypeEditor** (or equivalent) for `eventShape` **placementKind** / **anchorEdge**; align field displays (`eventShapeDisplays.ts`), forms, and admin copy with placement semantics; remove or reword differential-role-forward labels on shape surfaces.
- **Session 20.3.2 — Service atomic editor (§8.3 #2):** **ServiceAtomicEditor** — service block-instance **convergence / atomic** editing aligned with §3 / §9 instance model (`orchestrator`, `composite`, `wizardVisible` where applicable).
- **Session 20.3.3 — Remaining domain editors (§8.3 #3):** Other shape-type instance editors: orchestration selection UX for **time** / **price** / **event** instances as needed; shared patterns from 20.3.1–20.3.2.
- **Session 20.3.4 — Segment manager relocation (§8.3 #4):** Move or embed **segment / event-instance** management from `InstancesTab` **Events** surface into **event block-instance** editing (per-instance segment list, links to `eventInstance` CRUD); keep API alignment with **20.2**.
- **Session 20.3.5 — Annotation metadata + EntityCard wave (§8.3 #5):** Narrow non-annotation metadata scope where plan allows; replace lowest-risk **EntityCard** usage with focused component(s); document remaining EntityCard debt for **20.6**.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child sessions complete
- [ ] Phase guide and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/phases/phase-20.2-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
