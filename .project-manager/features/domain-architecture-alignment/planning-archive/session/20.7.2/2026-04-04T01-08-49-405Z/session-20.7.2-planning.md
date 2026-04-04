# Plan: session 20.7.2 — Preflight evidence package

## Contract
- **Tier:** session | **ID:** 20.7.2
- **Scope:** Produce the **written preflight package** required by **`phase-20.7-guide.md`**: event-routing watchpoint (`event_assignments`), invariant audit with phase ownership, migration execution policy restatement, and **`property_details`** vs time-configuration boundary — as **in-repo markdown** (and optional **`DOMAIN_REWRITE_WORKLOG.md`** pointers), not silent code refactors.
- **Governance (harness snapshot):**
  - Governance Context (Session)
  - Function Governance
  - Clean — no violations detected.
  - Component Governance
  - Clean — no violations detected.
  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
  - `client/src/composables/admin/useEntityCardSaveAndActions.ts` — oversized-return: Return surface has 14 properties; decompose into focused composables
  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Return surface has 15 properties; decompose into focused composables

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

**Session 20.7.1** closed: canonical **`architecture-alignment-closeout-master-plan.md`**, link normalization, and handoff/guide alignment. **Session 20.7.2** is the **evidence** slice — master plan “Phase 0” preflight artifacts before **20.8+** execution.

## Story

**This session delivers** a cited, reviewable **preflight evidence package** (routing, invariants, migrations, MLS boundary) **so that** phases **20.8–20.13** can execute against explicit pass/fail rows instead of rediscovering ambiguity in **`event_assignments`** or **`property_details`**.

**Estimated size:** M–L (mostly docs + targeted code reads; product changes only where evidence requires a one-line fix with explicit follow-on task).

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
| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
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
- **Depends on** admin configuration data (wizard blocks, availability rules) served as **entities and settings** — document cross-domain deps in planning **Analysis** (the legacy DB-driven admin metadata row model was removed in Feature **20** Pass **6**; booking must not reintroduce it).
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
- **Direction:** **Domain-specific editors** for all admin entity surfaces, **including annotations** — no long-lived exception for DB-driven field metadata (plan §3.6, §6.3).

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

_Source (keep in sync): `.project-manager/ARCHITECTURE.md` §8–§14._

## Codebase recon (agent-led — required)

Preflight evidence crosses **booking pipeline** (client **`PartFinalizer`**, **`event_assignments`** relationships), **admin** (code-first **`eventAssignments`** on block instances), and **project-manager** narrative surfaces.

- **Paths reviewed (grep / spot-read):** `client/src/utils/booking/appointmentSlotBuilder.ts`, `partFinalizerSlotShape.ts`, `partFinalizerSlotShapeHelpers.ts` (build `eventAssignmentsByPartShape`); `client/src/utils/admin/codeFirstMetadataCache.ts` + `codeFirstSelectInputConfigs.ts` (admin **`eventAssignments`** collection contract); `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` (existing narrative); **`phase-20.7-guide.md`** Session **20.7.2** task list.
- **Patterns:** Relational **`event_assignments`** per **ARCHITECTURE.md** §10.1; client aggregates via **`partFinalizer`** helpers; admin exposes **`eventAssignments`** as a structured relationship — ambiguity = any path that resolves events without **`event_assignments`** / lineage rules.
- **Gaps:** Full server model list for **`event_assignments`** and migration policy live in **`server/`** migrations + **FEATURE_20** — task tier should **cite** migration names and DB guard rules when writing the evidence doc.

## Analysis

- **Problem / why now:** Close-out phases **20.8+** assume the preflight package exists; without it, execution work re-litigates **`event_assignments`** and **`property_details`** boundaries.
- **Domains:** Booking + admin + migrations — **evidence is mostly markdown**; code changes only for **documented** follow-ons (separate task).
- **Dependencies:** **Session 20.7.1** delivered **`architecture-alignment-closeout-master-plan.md`**; this session adds **evidence** files under **`.project-manager/`** (or append to **`DOMAIN_REWRITE_WORKLOG.md`** with clear headings).
- **Risks:** Scope creep into product refactors — **mitigate** by PASS/FAIL table + “deferred to phase X” rows.

## Goal

1. **Event-routing watchpoint:** Written note: how **`event_assignments`** flow from global/booking transforms into **`PartFinalizer`**, and where ambiguity or legacy naming remains.
2. **Invariant audit:** Table of **ARCHITECTURE.md** §14-style checks with **pass/fail/unknown** and **owning phase (20.8–20.13)** for each gap.
3. **Migration policy:** Short restatement aligned with project **migration authority** rules (localhost-only execution) and Feature **20** ordering.
4. **`property_details` boundary:** Confirm appointment-scoped data vs time-configuration storage per §10.4 / §12 (evidence only).

## Files

- **New or append:** `.project-manager/features/domain-architecture-alignment/preflight-evidence-20.7.2.md` (single package) **or** sections in **`DOMAIN_REWRITE_WORKLOG.md`** — pick one primary surface and link from **`phase-20.7-guide.md`** / **`phase-20.7-log.md`** when done.
- **Read:** `client/src/utils/booking/*` (above), `server/src/db/migrations/` (relevant Feature **20** migrations — cite by filename), `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (migration sequencing context).

## Approach

1. Draft **`preflight-evidence-20.7.2.md`** with four sections matching **Goal**.
2. Map each **fail/unknown** invariant row to a **target phase guide** (`phase-20.8-guide.md` … **`phase-20.13-guide.md`**) in a table.
3. Cross-check admin **`eventAssignments`** config vs booking pipeline for a single “source of truth” paragraph.
4. Session **20.7.3** (if run) will **only** reshape backlog text — avoid duplicating that work here beyond explicit forward pointers.

## Checkpoint

- A new reader can answer: “What is still ambiguous about **`event_assignments`**?” and “Which phase owns each open gap?” without opening IDE.
- No silent production behavior change without a **task** under **20.8+** that cites this evidence doc.

## Deliverables

- **`preflight-evidence-20.7.2.md`** (or equivalent single narrative) committed under the feature folder **or** clearly delimited append to **`DOMAIN_REWRITE_WORKLOG.md`**.
- **`phase-20.7-log.md`** (or guide) updated with a pointer to the evidence package when implementation completes.

## Acceptance Criteria

- [ ] Watchpoint section names **≥2** concrete code paths (client booking + admin) for **`event_assignments`** and states **pass** or **risk** for each ambiguity called out in **`phase-20.7-guide.md`**.
- [ ] Invariant audit covers **lineage**, **zero-out**, relational **events**, client **PartFinalizer**, and **`property_details`** separation; each **fail/unknown** names an owning **phase 20.8–20.13** target.
- [ ] Migration policy paragraph cites **localhost / shared DB** execution rule from workspace policy and points to **FEATURE_20** ordering where relevant.
- [ ] No undocumented production behavior change — refactors are **out of scope** unless filed as follow-on tasks with phase IDs.

## Decomposition

- **Task 20.7.2.1:** Event-routing watchpoint — document **`event_assignments`** data flow and ambiguity list (client + admin touchpoints cited).
- **Task 20.7.2.2:** Invariant audit table — §14 / PartFinalizer / lineage / zero-out / **`property_details`** rows with **pass/fail/unknown** and **owning extension phase**.
- **Task 20.7.2.3:** Migration execution policy restatement + **`property_details`** vs time-atomic storage boundary paragraph; link relevant migrations and **ARCHITECTURE.md** §10.4 / §12.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.7-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
