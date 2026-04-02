# Plan: phase 20.5 — 20.5

## Contract
- **Tier:** phase | **ID:** 20.5
- **Scope:** 20.5
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
Phase 20.4 completed with sessions: 20.4.1, 20.4.2, 20.4.3, 20.4.4.

## Story
**As a** maintainer shipping Feature 20, **I want** an **explicit, ordered migration and data narrative** (sequence, seeds, baseline event routing, legacy-to-target mapping) **aligned to FEATURE_20 §8.5 and §9.5**, **so that** no environment relies on **undocumented implicit defaults** and future rollout / phase **20.6** cleanup can proceed safely.
**Estimated size:** M (mostly documentation and verification; optional small migration/seed fixes only if gaps are found).

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

- **Paths reviewed:** `phases/phase-20.5-guide.md` (§8.5 verbatim); `FEATURE_20_ARCHITECTURE_REDESIGN.md` §8.5, §9.5, §9.6; `server/src/db/migrations/20260432_00005*.mjs` … `20260432_000062_*` (rename enum, three-property instances, event schema, placement admin metadata); `phases/phase-20.4-handoff.md` (entry into 20.5); `feature-domain-architecture-alignment-guide.md` (phase row 20.5).
- **Patterns / call sites:** Much **schema work** for Feature 20 already landed in **20.1–20.4** via numbered **`20260432_*`** migrations (block shape type rename **058**, block instance three-property **059**, shape legacy column drop **060**, event schema / **`event_instance_attendees`** **061**, placement admin metadata **062**, plus earlier rename / valid_* / event-assignment migrations). Phase **20.5** is the **governance pass** that **documents** the end-to-end sequence, **seed/baseline expectations**, and **legacy → replacement** mapping per §8.5 acceptance checks—not assumed greenfield migrations unless recon finds a documented gap.
- **Gaps / unknowns:** Whether **seed scripts** or **one-off data backfills** (beyond migrations) are required for **baseline event-orchestrator routing** in empty/staging DBs—must be stated explicitly in session **20.5.2** output. Whether **`DOMAIN_REWRITE_WORKLOG.md`** (or successor) is the single home for the narrative vs adding a short **`MIGRATION_SEQUENCE.md`**—decide in **20.5.1**.

## Analysis
- **Problem / why now:** **§8.5** requires **written** migration sequence, **seed expectations**, and **no implicit-default** steps. Implementation passes **20.1–20.4** executed many migrations; without a consolidated narrative, operators and reviewers cannot prove **§9.5** ordering and **§9.6** “implicit default routing” risk is mitigated.
- **Boundaries:** Primarily **`.project-manager/analysis/`** + **worklog** + optional **`server/src/db/migrations`** commentary or README; **no** booking/client refactors unless a recon session finds a **blocking** mismatch (then spin a follow-up task, not silent code drift).
- **Patterns:** Cite **FEATURE_20** sections by number; keep **ARCHITECTURE_PRINCIPLES** / **PartFinalizer-on-client** constraints in any narrative about server vs client responsibilities.
- **Risks:** Documenting the wrong order (e.g. implying placement UX before instance columns) confuses deploy; mitigated by mapping each bullet in **§9.5** to concrete **`20260432_*`** files and noting dependencies.
- **Alternatives:** Single monolithic doc session — **rejected**; split **inventory → baseline routing → legacy closure** for clearer session-end gates.

## Goal
**Phase 20.5 only:** Satisfy **FEATURE_20_ARCHITECTURE_REDESIGN §8.5** by producing **migration + data conversion documentation** that:

1. Defines the **data migration sequence** (enums, moved fields, placement, event-instance ownership, attendee rename, legacy cleanup) in **implementation order**, tied to **existing or planned** migration artifacts.
2. Documents **seed expectations** for **baseline placement types** and **baseline event-orchestrator** data so **default routing is never “whatever Sequelize defaults to.”**
3. Closes the **§8.5 acceptance checks:** explicit baseline event routing narrative; **§0.2 / §2** legacy assumptions removed or mapped; **no step relies on undocumented implicit defaults**.

**Feature-wide goal** (unchanged context): complete **20.1–20.6** per guides; **20.5** is the **planning/documentation** pass that unlocks confident **20.6** rollout/cleanup.

## Files
- **Canonical:** `ARCHITECTURE_PRINCIPLES.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§8.5, §9.5, §9.6**), `ARCHITECTURE.md`
- **Phase:** `phases/phase-20.5-guide.md`, `phases/phase-20.5-planning.md`, `phases/phase-20.5-handoff.md` (update status as sessions complete)
- **Worklog / narrative target:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` and/or new short **`MIGRATION_SEQUENCE.md`** under `.project-manager/analysis/` (only if worklog would become unwieldy — decide in **20.5.1**)
- **Evidence:** `server/src/db/migrations/20260432_*.mjs`, optional `server/src/db/seeders/**` if present and relevant

## Approach
1. Run **`/session-start 20.5.1` → …** in order (see **Decomposition**); **`/session-end`** each before the next; **`/phase-end 20.5`** when all sessions complete.
2. For each session: grep/read migrations and docs; **write** findings into the chosen canonical narrative file(s); update **phase guide** session checkboxes.
3. **Do not** run **`npm run migrate`** against non-local **DB_HOST** (project policy); authoring new migration **files** is allowed if a session identifies a **documented** gap—execution stays on the host that owns the DB.
4. Cross-check every **§9.5** bullet against the narrative; cross-check **§9.6** “implicit default routing” row for an explicit mitigation paragraph.
5. If **§8.5** acceptance checks are fully met by end of **20.5.3**, mark phase objectives complete and hand off to **`/phase-start 20.6`**.

## Checkpoint
- After **`/accepted-plan`:** **`/session-start 20.5.1`** on **`feature/domain-architecture-alignment`**.
- Each session-end: **§9.1** drift checklist on edited docs; verify no new “implicit default” language slipped in.
- Phase-end: **§8.5** acceptance checks satisfied in writing; **phase-20.5-handoff.md** lists **Next Action** → **`/phase-start 20.6`**.

## Deliverables
- **Migration sequence doc:** Ordered table or numbered list mapping **§9.5** → **`20260432_*`** migrations (and any seed steps), with **dependencies** and **rollback notes** where relevant.
- **Baseline routing doc:** Explicit description of how **baseline event-orchestrator** and **placement** defaults are established in fresh vs upgraded DBs (no silent defaults).
- **Legacy mapping:** Table or subsection mapping **§0.2** legacy assumptions to **removed** or **replacement storage** (cite migrations or code).
- **Updated** `phase-20.5-guide.md` (objectives + session task bullets checked as you go).

## Acceptance Criteria
- [ ] **§8.5** scope and acceptance checks are traceable to concrete doc sections (not chat-only).
- [ ] **§9.5** each bullet has a corresponding narrative line and migration/seed pointer.
- [ ] **§9.6** risk “implicit default routing” has an explicit mitigation in the written plan.
- [ ] Phase guide **Status** reflects completion; handoff **Next Action** points to **20.6**.

## Decomposition
- **Session 20.5.1 — Migration chain inventory:** Map existing **`20260432_*`** migrations to **FEATURE_20 §1–2** and **§9.5** ordering; note any **ordering gaps** or **undocumented steps**; choose **worklog vs `MIGRATION_SEQUENCE.md`** as the canonical narrative home; first draft of the sequence table.
- **Session 20.5.2 — Baseline placement & event routing:** Document **seed expectations** and **how baseline event routing is established** for new and upgraded environments; align language with relational **`event_assignments`** and event orchestrator baseline model (**§9.5** last bullet, **§9.6** mitigation).
- **Session 20.5.3 — Legacy assumption closure:** Complete **§0.2 / §2** legacy-to-target mapping in writing; verify **no migration step** depends on undocumented implicit defaults; final edit pass on **§8.5** acceptance checklist; prepare **phase handoff** for **20.6**.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child sessions complete
- [ ] Phase guide and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/feature-domain-architecture-alignment-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/phases/phase-20.4-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
