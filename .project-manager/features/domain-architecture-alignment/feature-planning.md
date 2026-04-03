# Plan: feature domain-architecture-alignment — domain-architecture-alignment

## Contract
- **Tier:** feature | **ID:** domain-architecture-alignment
- **Scope:** domain-architecture-alignment
- **Governance (harness snapshot):**
  - Governance Context (Feature)
  - Test Coverage
  - Security Posture
  - Errors: **0** | Warnings: **0**

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
Feature **20** is in **Planning** per `PROJECT_PLAN.md` (Feature Summary row #20). Harness **next phase across:** **20.1** (`across-ladder.json`). Current git branch at feature-start was **`develop`**; expected feature worktree branch: **`feature/domain-architecture-alignment`** (create/checkout when beginning implementation).

## Inherited Open Questions (from project 20)

> Unresolved items from the parent **Open Questions** sections — **planning input** for the agent, not a hard gate.

1. **[Open Questions]** Will we need to adjust or add to the click handlers to create a consistent behavior with for app activities, since clicking and dragging isn't exactly what happens in an app?
2. **[Open Questions]** Will we need to register in the App Store
### Agent: required synthesis

- Treat each item as **design input**: fold decisions, alternatives, and structure hints into **Goal**, **Approach**, **Checkpoint**, and **How we build the tierDown** where they affect scope or sequencing.
- If an item is **deferred**, say so in **Approach** or **Checkpoint** (where and when it will be decided).
- **Do not** require the human to run `/resolve-question` before continuing tier-start; **filling this planning doc** is the contract. Optionally record decisions in the parent guide later with `/resolve-question`.

## Epic
**As a** platform maintainer, **I want** the database, APIs, admin surfaces, and booking client pipeline to match **locked** domain principles and the Feature 20 implementation plan, **so that** we do not maintain two booking calculators, drift on block/event models, or carry legacy shape-type names past the migration passes.

**Estimated size:** XL

---
## Architecture context (harness-injected)

## 1. System overview

Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:

- **Public booking users** — wizard-style scheduling and property/availability flows.
- **Admin configurators** — domain-specific configuration UIs, wizard settings, availability rules, integrations (target: no DB-driven admin metadata pipeline per `FEATURE_20_ARCHITECTURE_REDESIGN.md` §6.3).

TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Legacy admin-metadata prefetch may exist until Pass 6 removal — transitional only.

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
- **Depends on** admin configuration (wizard blocks, availability rules) — document cross-domain deps in planning **Analysis**; do not assume a permanent metadata-row UI model.
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
4. Resolve part-level event assignment (override ?? baseline).  
5. Apply **zero-out last** (after floor) — zero-out wins for that part’s contribution to rollups.  
6. Group resolved time **by event** for layout.  
7. Roll resolved fees **by orchestrator** for presentation / persistence fields the product needs.

### 10.4 Time atomics and `property_details`

Time atomics hold **rates**; **`property_details`** holds appointment-scoped **inputs** (MLS / wizard). Product: rate × input = duration contribution. `property_details` is property **data**, not a substitute for time configuration.

---

## 11. Events, shapes, and placement

- **Event shapes** are admin-managed **placement types** (`placement_kind`, `anchor_edge`) read by the pipeline — extensible via data, not ad-hoc role math.
- **Event instances** are **named segments** owned by an event block instance (`parent_block_instance_id`). Event **orchestrator** holds baseline segment assignments; **event profiles** (composite packages) override assignments per part via `event_assignments`.
- **Pipeline rule:** Placement comes from stored assignment graph + shape placement fields — **no separate placement calculator** from differential roles or hidden rules.

---

## 12. MLS and property enrichment

| Table | Role |
|-------|------|
| `property_details` | Physical characteristics of the inspected property (appointment-scoped). |
| `property_feature_mappings` | MLS-driven rules → suggested time block instances. |
| `property_field_mappings` | MLS field → `property_details` columns. |

**Separation:** `property_details` = what the property **is**; time atomics = how that maps to **duration** (configuration). Keep them distinct.

---

## 13. Admin configuration model

- **Orchestration surface:** Instances with `orchestrator = true` — multi-select style editors constrained by shape-level validity.
- **Services surface:** Atomic services — primary day-to-day hub; inline time/fee/event per part in one view; edits project to part rows and `event_assignments` (UI is not a second source of truth).
- **Direction:** **Domain-specific editors** for all admin surfaces including annotations — **full** retirement of the DB metadata pipeline per plan §6.3 / §8.6.

---

## 14. Invariants (formal drift test)

If any assertion below is violated, the architecture has drifted.

1. **Domain separation:** Each block type writes only its own concern to part instances. Domains compose; they do not overwrite.

2. **Three root block-instance properties:** `composite`, `orchestrator`, and `wizardVisible` on **all** block instances (including user). Any combination is valid; no combination implies another.
   - **2a.** **Composite** = same-shape children.
   - **2b.** **Orchestrator** = cross-shape active assignments selected from the shape-level validity graph.
   - **2c.** **WizardVisible** = appears in wizard lists for that shape when cascades allow.

3. **Part instances are per-block-instance with two resolution tiers:** Own part sets via `part_assignments`; no cross-writes.
   - **3a.** **Base** only on service orchestrator part rows.
   - **3b.** Atomic services do not set base unless they are also orchestrators.
   - **3c.** **PerUnit** on time/price atomic part rows; other columns null.
   - **3d.** **Lineage:** PartFinalizer must not use `part_shape` alone when multiple logical work items could collide.
   - **3e.** **Event assignments** are relational (`event_assignments`); override wins per part else baseline.
   - **3f.** **PartFinalizer is client-side aggregation** for booking totals; server persists submitted payload without recomputing that resolution for the same contract.
   - **3g.** **Per-block-instance** gives provenance, clean undo, and safe reconfiguration.

4. **Events are data, not computation:** Pipeline reads assignments and placement types from storage.
   - **4a.** Event shapes = placement types, not “which parts go where.”
   - **4b.** Event instances = segments with calendar fields.
   - **4c.** New placement types = new shape rows when valid; no mandatory engine code change per row.

5. **`property_details` is appointment data, not configuration** for duration rates.

6. **User instances are orchestrators** driving wizard state and cascades; their three-property flags are configuration, not hard-coded product constraints.

_Source: `.project-manager/ARCHITECTURE.md` §10.3–§14 (kept in sync manually with the canonical file)._

## Codebase recon (agent-led — required)
Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant to this tier.

- **Paths reviewed:**
  - `server/src/db/models/admin/block_shape.ts` — `type` enum still uses **`user` | `service` | `property` | `option` | `coupon`** (legacy labels; plan targets `time` / `event` / `price` per `FEATURE_20_ARCHITECTURE_REDESIGN.md` §1–§2).
  - `server/src/db/models/booking/block_instance.ts` — instance stores **`composite`** (boolean) among booking/admin flags; **no** `orchestrator` or `wizardVisible` columns in this model file today (principles + `ARCHITECTURE.md` §9 target three instance-level booleans — schema work expected in **20.1**).
  - `client/src/utils/booking/partFinalizer.ts`, `client/src/utils/booking/BlockFinal.ts`, `client/src/utils/booking/blockFinalizer.ts`, `client/src/types/booking/partFinal.ts` — **client-side** part/block finalization pipeline (aligns with architecture rule: server persists submitted payload; avoid second calculator on server).
  - `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` — execution passes §8, drift §9, migration §9.5; `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md` — phase map 20.1–20.6.
- **Patterns / call sites:** Admin entity flows under `server/src/routes/internal/entities` and client `composables/admin/` / `components/admin/` align toward **domain editors**; booking transformers (e.g. `globalToBookingTransformer`) consume **entity and relationship** data — not a long-term dependency on admin metadata rows. Booking steps and availability orchestration live under `client/src/components/booking/` and `client/src/composables/booking/`.
- **Gaps / unknowns:** Full inventory of every switch on legacy type strings and every `event_assignments` touchpoint is left to **phase 20.1–20.4** guides (too large for feature-tier recon). Shared package grep for block types was shallow; exhaustive constant maps may live in client/server route validators — verify per pass.

## Analysis
- **Problem / why now:** Architecture docs (`ARCHITECTURE.md` §8–§14, `ARCHITECTURE_PRINCIPLES.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md`) lock a **block / part / event** model that the codebase only partially implements. Without ordered passes, new work (especially **Feature 6** booking surfaces) risks reinforcing legacy enums (`property` / `coupon` / `option`), shape-level three-property confusion, or server-side recomputation of booking totals.
- **Domain boundaries:** Crosses **Admin / Config**, **Booking / Wizard**, **server persistence + API**, and **shared contracts**. PartFinalizer and appointment submit boundaries are **client vs server** concerns per architecture.
- **Grounding:** Recon confirmed legacy **`block_shapes.type`** enum and **`BlockInstance.composite`** on the server, and an existing **client** finalizer chain under `client/src/utils/booking/`. This matches the implementation plan’s direction: rename types, align instance storage, keep resolution on the client unless the plan explicitly adds server validation (and not a second calculator).
- **Patterns child tiers should follow:** TanStack Query + composable boundaries from `ARCHITECTURE.md` §3–§4; explicit return types and logger-in-catch from project rules; phase guides under `phases/phase-20.*-guide.md` as the operational checklist; drift checks **plan §9.1** + **principles §8** at session boundaries per feature guide.
- **Risks / dependencies:** **Migrations** must respect shared DB rules (host-only migrate when `DB_HOST` is not localhost). Overlap with **Feature 6** — product sequencing from appointment-workflow guides must not override architecture locks. **Order of passes** matters (schema before API before UI that assumes new fields).
- **Open questions (inherited):** (1) *Click vs drag / app parity* — product/UX for native or hybrid shells; **defer** to **20.3–20.4** and post-alpha Ionic/Capacitor work; note in checkpoint, not blocking schema alignment. (2) *App Store registration* — **out of scope** for Feature 20; lives in **LAUNCH_CHECKLIST** / milestones, not domain alignment passes.
- **Alternatives:** *Big-bang rewrite* — rejected; plan uses **20.1–20.6** with explicit acceptance checks. *Doc-only alignment* — rejected; recon shows code/enums still on legacy strings.

## Goal
Execute **Feature 20: Domain Architecture Alignment** so that the **codebase and schema** match **ARCHITECTURE_PRINCIPLES.md** and **FEATURE_20_ARCHITECTURE_REDESIGN.md**, using **phases 20.1–20.6** (plus **20.0** governance) as the only execution order unless the canonical docs are explicitly updated first.

**Done for this feature tier:** All phases **20.1–20.6** completed per their guides and acceptance checks; **ARCHITECTURE.md** and related playbooks remain consistent; coordination notes with **Feature 6** preserved where surfaces overlap.

## Files
- **Canonical (read-only intent):** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`, `.project-manager/ARCHITECTURE.md`
- **Harness / PM:** `features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md`, `feature-planning.md` (this file), `feature-domain-architecture-alignment-handoff.md`, `phases/phase-20.*-guide.md`, `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`
- **Implementation hotspots (non-exhaustive):** `server/src/db/models/**`, migrations under `server/` (as authored per pass), `server/src/routes/internal/**`, `client/src/utils/booking/**`, `client/src/composables/booking/**`, `client/src/components/booking/**`, `client/src/composables/admin/**`, `client/src/components/admin/**`, `shared/**` where API or enums are shared

## Approach
1. Treat **analysis docs** as authoritative; on conflict, update guides/planning — not principles or `FEATURE_20_ARCHITECTURE_REDESIGN.md`.
2. Run **Phase 20.0** activities (readiness, migration narrative, worklog) alongside passes as needed — no separate “implementation pass” unless the team adds one.
3. Run **`/phase-start 20.1` … `20.6` in order**; each phase-end gates the next. Inside each phase, follow that phase’s guide and **plan §8** subsection.
4. After **schema/API** passes, update client and admin to the **same** contracts (shared types where both sides consume).
5. **Booking:** Preserve **PartFinalizer-on-client**; align data shapes and event routing with relational **`event_assignments`** per plan — do not introduce scalar event columns on part rows.
6. **Migrations:** Follow **plan §9.5** ordering; respect project **DB_HOST** migration policy.
7. **Inherited UX questions** (pointer vs touch, App Store): track in handoff/milestones; do not expand Feature 20 scope unless product explicitly adds a phase.

## Checkpoint
- Before accepting this plan: agree **phase order 20.1→20.6** is locked and **Feature 6** work will not override principles.
- At each **session start/end** (once coding begins): run **FEATURE_20_ARCHITECTURE_REDESIGN §9.1** drift checklist and cross-check **§9.1a** vs **ARCHITECTURE_PRINCIPLES §8** (per feature guide).
- After **`/accepted-plan`:** checkout/create **`feature/domain-architecture-alignment`** if not already on it; then **`/phase-start 20.1`**.

## Deliverables
- **20.1** — Schema / Sequelize / enum alignment per plan §8.1 (including instance-level model goals where specified).
- **20.2** — Internal API and handler alignment per §8.2.
- **20.3** — Admin UX and domain editors aligned per §8.3 (including annotation editor direction; metadata pipeline retired in Pass 6).
- **20.4** — Booking pipeline (finalizer, transformers, steps) aligned per §8.4.
- **20.5** — Migration planning and data conversion scripts/narrative per §8.5 (includes **admin metadata retirement** narrative traceability).
- **20.6** — Rollout, cleanup, **full admin metadata stack removal**, and documentation per §8.6.
- **20.0** — Governance artifacts: §9.3 readiness when promoting docs; §9.5 ordering respected; **DOMAIN_REWRITE_WORKLOG** updated for major decisions.
- **PM:** Feature handoff/log updated at meaningful milestones; `PROJECT_PLAN` Feature 20 status advanced when the feature completes.

## Acceptance Criteria
- [ ] Phases **20.1–20.6** each completed with their guide’s acceptance checks and **plan §8** criteria satisfied.
- [ ] No intentional regression of **client-side** booking resolution for the live wizard contract; server remains **persist + validate**, not a duplicate PartFinalizer.
- [ ] **Block shape type** vocabulary matches locked rename mapping (`time` / `price` / `event` targets) in DB, server, and client — no orphaned `property`/`coupon`/`option` product paths after cleanup pass.
- [ ] **Event routing** remains relational via **`event_assignments`** (no new scalar default/override event columns on part instances per principles).
- [ ] **Feature 6** overlap documented in phase/session logs where the same files change; architecture doc wins on disputes.
- [ ] App starts and **lint** passes per Definition of Done below when code changes land (per session policy).

## Decomposition
- **Phase 20.0:** Governance — §9.3 readiness, §9.5 migration ordering, worklog; no standalone implementation guide required initially.
- **Phase 20.1:** Pass 1 — Schema alignment (models, enums, instance fields per plan §8.1 / doc §2).
- **Phase 20.2:** Pass 2 — API alignment (routes, validation, shared contracts §8.2 / §5).
- **Phase 20.3:** Pass 3 — Admin UX alignment (domain editors, EntityCard replacement, annotation editor direction §8.3 / §3).
- **Phase 20.4:** Pass 4 — Booking pipeline alignment (finalizer, transformers, steps §8.4 / §4).
- **Phase 20.5:** Pass 5 — Migration planning and data conversion (§8.5), including documented ordering for admin metadata schema retirement.
- **Phase 20.6:** Pass 6 — Rollout, cleanup, admin metadata stack deletion, doc promotion (§8.6).

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child phases complete
- [ ] Feature guide and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
