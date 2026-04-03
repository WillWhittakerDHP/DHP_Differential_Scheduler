# Plan: session 20.6.4 — Review gate, docs, and feature closeout

## Contract
- **Tier:** session | **ID:** 20.6.4
- **Scope:** Review gate, docs, and feature closeout
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
Sessions **20.6.1–20.6.3** completed Pass **6** execution work: admin metadata stack removal, **EntityCard** migration/deletion per phase scope, and placement-first retirement of block-instance differential role overrides plus related booking helpers. **20.6.4** is the **review / docs / closeout** slice only — evidence, handoffs, and **`/feature-end`** readiness, not new feature surface area.

## Story
**This session delivers** auditable **§8.6** acceptance notes, drift checklist evidence (**§9.1 / §9.1a**), and updated phase/feature PM artifacts **so that** Feature **20** can end cleanly with **`/phase-end 20.6`** then **`/feature-end`** without stale handoffs or undocumented residual risk.
**Estimated size:** **S–M** (documentation and verification; small code/doc fixes only if a checklist item fails).

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

- **Paths reviewed:** `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md` (session **20.6.4** bullets); `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md` (still describes **20.6.1** as active — stale); `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-handoff.md` (placeholders + duplicate **Across ladder** blocks); `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` (Pass 6 / **20.6.3.2** note present); `FEATURE_20_ARCHITECTURE_REDESIGN.md` §**8.6**, §**9.1–9.4** (closeout criteria); ripgrep **`admin-metadata` / `AdminMetadata` / `adminMetadata`** under `client/src` and `server/src` → **no** matches (consistent with metadata removal); ripgrep **`EntityCard`** under `client/src` → residual **`EntityCardContent.vue`**, **`EntityCardSubPanels.vue`**, **`useEntityCard*.ts`** naming (implementation may be post–**EntityCard.vue** shell — treat as **inventory + doc**, not automatic delete in **20.6.4** unless §**8.6** gap is proven).
- **Patterns / call sites:** Pass **6** execution lives in prior sessions; **20.6.4** produces **evidence** (grep + checklist) and **PM continuity** (handoffs, **`PROJECT_PLAN`** if required). Booking boundary unchanged (**PartFinalizer** client-only per **ARCHITECTURE.md**).
- **Gaps / unknowns:** Whether product wants **§9.3–9.4** “replace redesign file” work in-repo this sprint — **default: document N/A or deferred** unless Will explicitly scopes file swap; **`npm run start:dev`** smoke may be session-end responsibility per DoD, not necessarily every task.

## Analysis
- **Problem / why now:** Phase **20.6** execution sessions are done; without **20.6.4**, **§8.6** acceptance and ladder/handoff state stay ambiguous and **`phase-20.6-handoff.md`** misleads the next agent.
- **Boundaries:** **`.project-manager/`** docs plus optional tiny **`ARCHITECTURE.md`** / worklog edits; **no** booking or server behavior change unless a checklist failure forces a minimal fix (then document in log).
- **Patterns:** Follow existing feature PM style (`session-*-log.md`, `*-handoff.md`, `across-ladder.json`); cite **FEATURE_20** §**8.6** acceptance bullets when stating completion.
- **Risks:** Over-scoping **§9.4** into a full redesign-file replacement without explicit approval; **mitigation:** record **deferred** with reason. Residual **`EntityCard*`** filenames may look incomplete — **mitigation:** classify as renamed shell vs §**8.6** debt in the log.
- **Alternatives:** Single mega-task for all docs — **rejected**; split **evidence/hygiene** vs **phase closeout** for clearer **`task-end`** boundaries.

## Goal
Close **Session 20.6.4** per **`phase-20.6-guide.md`**: run **§9.1 / §9.1a** drift checklist on the **final** branch state; capture **§8.6** acceptance narrative in **`DOMAIN_REWRITE_WORKLOG.md`** / session log as needed; refresh **`phase-20.6-handoff.md`** and **20.6.3**/**20.6.4** handoffs so **Next Action** points to **`/phase-end 20.6`** then **`/feature-end`**; record **§9.3–9.4** outcome (**complete / deferred / N/A**). **Out of scope unless explicitly added:** replacing **`DOMAIN_ARCHITECTURE_REDESIGN.md`** or **`ARCHITECTURE_PRINCIPLES.md`** files on disk.

## Files
- **Read / update:** `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.4-planning.md` (this doc), `session-20.6.4-guide.md`, `session-20.6.4-log.md`, `session-20.6.4-handoff.md` (create/update at **`/task-start`** / **`/session-end`** as harness expects), `sessions/session-20.6.3-handoff.md` (hygiene), `phases/phase-20.6-handoff.md`, `phases/phase-20.6-guide.md` (session checkbox at **`/session-end`**), `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`, `.project-manager/PROJECT_PLAN.md` (Feature **20** status if playbook requires), `.project-manager/ARCHITECTURE.md` (only if drift vs implementation)
- **Reference (verification):** `FEATURE_20_ARCHITECTURE_REDESIGN.md` §**8.6**, §**9.1–9.4**; `feature-domain-architecture-alignment-guide.md`

## Approach
1. **Task 20.6.4.1:** Evidence + doc hygiene — checklists, grep log, worklog/session-20.6.3-handoff cleanup, optional **ARCHITECTURE.md** touch.
2. **Task 20.6.4.2:** Phase/feature runway — **`phase-20.6-handoff.md`**, **20.6.4** handoff/log, **§9.3–9.4** statement, **`PROJECT_PLAN`** alignment, explicit **`/phase-end`** / **`/feature-end`** next steps.
3. **Harness:** After each task, **`/task-end`**; after **20.6.4.2**, **`/session-end 20.6.4`** (user-run); then **`/phase-end 20.6`** when ready.

## Checkpoint
- **`/accepted-plan`:** Decomposition covers **20.6.4** goal; user runs harness acceptance.
- **Before `/session-end`:** DoD lint/start where applicable; session log lists completed tasks with ids.
- **Branch:** `feature/domain-architecture-alignment`

## Deliverables
- **§9.1 / §9.1a** drift checklist completed and recorded (session log or appendix in handoff).
- **Grep audit** recorded: `admin-metadata` / `differentialEventRoleOverrides` / other §**8.6** symbols as listed in task plan (commands + outcome).
- **`DOMAIN_REWRITE_WORKLOG.md`** updated if **§8.6** closure needs an explicit “Pass 6 complete” line beyond existing **20.6.3.2** note.
- **`phase-20.6-handoff.md`** reflects sessions **20.6.1–20.6.4** and **Next Action** → **`/phase-end 20.6`** (then **`/feature-end`**).
- **`session-20.6.3-handoff.md`** repaired: no empty “Last Completed: Task”, no duplicate **Across ladder** sections.
- **§9.3–9.4** outcome documented (**complete / deferred / N/A** with one-line rationale).
- **`session-20.6.4-handoff.md`** + **`session-20.6.4-log.md`** updated for **`/session-end`**.

## Acceptance Criteria
- Checklist and grep evidence exist under **`.project-manager/features/domain-architecture-alignment/sessions/`** for **20.6.4**.
- Stale **phase-20.6-handoff** “active 20.6.1” text is corrected.
- **Next Action** chain is unambiguous: **`/phase-end 20.6`** → **`/feature-end`** (unless user adds follow-up phase).
- No unintended **`client/`** / **`server/`** product refactors; any code change is tied to a logged checklist failure.

## Decomposition

### Task 20.6.4.1 — Pass 6 evidence, drift checklist, doc hygiene
**Goal:** Prove **§8.6** / **§9.1** state on the branch; clean obvious PM corruption.
**Implementation orders:**
1. Run **§9.1** and **§9.1a** (from **FEATURE_20**); paste or summarize results into **`session-20.6.4-log.md`**.
2. Run ripgrep audits (e.g. `admin-metadata`, `differentialEventRoleOverrides`, `EntityCard.vue` import graph if still relevant); log commands + hit counts / “clean”.
3. Update **`DOMAIN_REWRITE_WORKLOG.md`** only if a **§8.6** “Pass 6 complete” capstone line is missing.
4. Repair **`session-20.6.3-handoff.md`**: fill **Last Completed** (**20.6.3.2** or final task id), remove duplicate **Across ladder** block, keep single harness block.
5. Skim **`ARCHITECTURE.md`** vs known deliveries; edit only for factual drift (optional if none).

### Task 20.6.4.2 — Phase handoff, PROJECT_PLAN, feature-end readiness
**Goal:** Close PM narrative for Phase **20.6** and Feature **20** runway.
**Implementation orders:**
1. Rewrite **`phases/phase-20.6-handoff.md`**: **Last Completed Session** **20.6.4**, **Phase Status** ready for **`/phase-end`**, **Next Action** **`/phase-end 20.6`** then **`/feature-end`**.
2. Complete **`session-20.6.4-handoff.md`** (Current Status, Next Action, Transition Context, **Last Updated**).
3. Update **`session-20.6.4-guide.md`** task checkboxes when tasks complete.
4. **`PROJECT_PLAN.md`**: align Feature **20** / phase **20.6** wording if still “in progress” after **20.6.4**.
5. Add **§9.3–9.4** subsection to log or handoff: **complete** vs **deferred** (e.g. redesign file swap deferred) — **must not** silently skip.

**Leaf tier:** tasks **20.6.4.1** → **20.6.4.2** in order; **`/task-end`** after each.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
