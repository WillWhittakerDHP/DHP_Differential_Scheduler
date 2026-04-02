# Plan: session 20.5.1 — Migration chain inventory

## Contract
- **Tier:** session | **ID:** 20.5.1
- **Scope:** Map **`server/src/db/migrations/20260432_*.mjs`** to **FEATURE_20** §1–2 and **§9.5** ordering; flag gaps; choose canonical doc home; land **first draft** ordered sequence table.
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
Phase **20.5** started after **20.4** (placement-only booking + shared cleanup). **20.5.1** is the first session of **Pass 5 (§8.5)** — documentation-only unless a gap forces a new migration file (author only; run on DB host per policy).

## Story
**This session delivers** a **traceable migration narrative** (ordered files + **§9.5** crosswalk) **so that** **20.5.2** can document **baseline routing/seeds** without guessing order, and **§8.5** acceptance stays auditable.
**Estimated size:** S–M (docs + table; no app code unless explicitly scoped later).

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

- **Paths reviewed:** `server/src/db/migrations/` — **28** files matching **`20260432_*.mjs`** (034–062 plus gaps in numbering); headers skimmed for **058** (enum rename), **059** (three-property + instance admin metadata), **060** (drop shape-level legacy booleans), **061** (event schema + **`event_instance_attendees`** + placement columns + default placement seed), **062** (event_shape placement admin metadata); **035** (`event_assignments` blockInstance parent); **051–055** (valid_* table renames + cleanup functions); `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` (checkpoint narrative — suitable anchor for a new migration-inventory section); `phases/phase-20.5-guide.md` (session 20.5.1 task bullets).
- **Patterns / call sites:** Sequelize migrations are **ordered by filename**; many are **idempotent** / conditional on table existence. **Feature 20** schema work clusters in **051–062**; **034–043** mix domain (valid_events, availability, wizard copy) with **auth** tables (**040–041**) and **sessions/magic_links** (**045–048**). **056–057** align **user_role** / role–block alignment (Feature 6 adjacency, not §9.5 core but in same sequence).
- **Gaps / unknowns:** **§9.5** bullet “seed or confirm baseline … event-orchestrator” is only **partially** answered by **061**’s default placement seed — full **orchestrator baseline** prose waits for **20.5.2**. Whether a standalone **`MIGRATION_SEQUENCE.md`** is worth splitting out vs a **worklog** section — **decide in-task** (default: **worklog section** first).

## Analysis
- **Why now:** **§8.5** / **§9.5** require an **explicit** sequence; code exists but the **narrative** was fragmented across phase logs.
- **Boundaries:** **`.project-manager/analysis/`** + migration **filenames** as evidence; **no** client/server product code in **20.5.1** unless a task discovers a **blocking** doc error (then note follow-up, do not expand scope silently).
- **Child tasks:** Prefer **small commits**: inventory markdown first, then crosswalk table.
- **Risks:** Mis-ordering migrations in prose could mislead operators — mitigate by **copying numeric order from filesystem** and citing file names.
- **Alternatives:** New **`MIGRATION_SEQUENCE.md`** only — deferred unless worklog becomes too long (**>~100 lines** added).

## Goal
1. **Ordered inventory** of all **`20260432_*.mjs`** migrations with **one-line purpose** each, grouped so **§9.5** ordering is visible (type rename → three-property on instances → placement + event-instance schema → relational routing preserved).
2. **Crosswalk table:** each **FEATURE_20 §9.5** bullet → **migration id(s)** or **`none (document gap)`**.
3. **Canonical home decision:** add a new section to **`DOMAIN_REWRITE_WORKLOG.md`** *or* create **`MIGRATION_SEQUENCE.md`** — record the decision in the same PR/commit as the table.

## Files
- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` §1, §2, §9.5; `phases/phase-20.5-guide.md`
- **Write:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` (preferred) **or** `.project-manager/analysis/MIGRATION_SEQUENCE.md`; optional one-line pointer from `phases/phase-20.5-planning.md` if split file wins
- **Evidence (read-only):** `server/src/db/migrations/20260432_*.mjs`

## Approach
1. **Task 20.5.1.1:** Sort migrations lexicographically; annotate **Feature 20 relevance** (core / adjacent / unrelated-but-same-prefix); map **§1** enum rename and **§2** schema targets to specific files.
2. **Task 20.5.1.2:** Author **§9.5** crosswalk + **ordered narrative paragraph**; append to chosen doc; list **explicit gaps** for **20.5.2** (baseline seeds / orchestrator language).
3. Do **not** run DB migrations from agent unless **DB_HOST** is local (project policy).

## Checkpoint
- After **`/accepted-plan`:** run **`/task-start 20.5.1.1`**, then **`/accepted-code`** for each task before implementation; **`/task-end`** per task; **`/session-end 20.5.1`** when both tasks complete.
- Session-end: phase guide checkbox for **20.5.1**; session log/handoff per harness.

## Deliverables
- Updated **`DOMAIN_REWRITE_WORKLOG.md`** (or new **`MIGRATION_SEQUENCE.md`**) containing **Checkpoint / section: Feature 20 — `20260432` migration sequence** with ordered list + **§9.5** table.
- Short **gaps** list (bullets) handed to **20.5.2**.

## Acceptance Criteria
- [ ] Every **`20260432_*.mjs`** file appears in the inventory or is explicitly excluded with reason (e.g. out-of-scope auth-only).
- [ ] Each **§9.5** line from **FEATURE_20** has a table row with **migration pointer** or **`gap:`** note.
- [ ] **Canonical doc choice** is stated in prose (not only in chat).
- [ ] No claim that **baseline event-orchestrator** data is fully specified **in this session** (that is **20.5.2**).

## Decomposition
- **Task 20.5.1.1:** **Ordered migration inventory** — list all **`20260432_*.mjs`** in run order with one-line descriptions; tag **§1 / §2** relevance; separate **core Feature 20** vs **adjacent** (auth, user_role).
- **Task 20.5.1.2:** **§9.5 crosswalk + doc land** — add the **§9.5** table and narrative to **`DOMAIN_REWRITE_WORKLOG.md`** (or **`MIGRATION_SEQUENCE.md`**); document **canonical home** decision; export **gaps for 20.5.2**.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.5-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
