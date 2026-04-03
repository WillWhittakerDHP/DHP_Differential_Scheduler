# Plan: session 20.5.3 — Legacy assumption closure

## Contract
- **Tier:** session | **ID:** 20.5.3
- **Scope:** Close **FEATURE_20** **§0.2** / **§2** legacy-to-target mapping in **`DOMAIN_REWRITE_WORKLOG.md`**; confirm **§8.5** acceptance checks are satisfied **in writing**; audit that **no `20260432_*` step** relies on undocumented implicit defaults; update **`phase-20.5-handoff.md`** for **`/phase-start 20.6`**.
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
Session **20.5.2** closed baseline routing prose in **`DOMAIN_REWRITE_WORKLOG.md`** (**Checkpoint 9** + **`### Baseline placement & event routing`**, **§9.6 mitigation**, **§9.5** crosswalk note). **20.5.3** finishes **phase 20.5** documentation gates before **20.6** rollout/cleanup.

## Story
**This session delivers** a written **legacy → target** closure (**§0.2** + **§2**) and a **§8.5** traceability pass **so that** **FEATURE_20 §8.5 Pass 5** acceptance checks are demonstrably met in-repo and **phase 20.6** can start without undocumented migration assumptions.
**Estimated size:** **S** (analysis docs + one phase handoff file; **no** app code).

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

- **Paths reviewed:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` (**Checkpoint 9**, **§9.5 crosswalk**, **`### Baseline placement & event routing`**, **`#### FEATURE_20 §9.6 mitigation`**); `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§0.2**, **§2**, **§8.5**); `.project-manager/features/domain-architecture-alignment/phases/phase-20.5-guide.md` (session **20.5.3** bullets); `server/src/db/migrations/20260432_*.mjs` (inventory only — **no** new migrations in this session unless a **documented** gap appears).
- **Patterns:** Phase **20.5** narrative is **single-file** (`DOMAIN_REWRITE_WORKLOG.md`); **§8.5** checks are satisfied by **cross-references** from acceptance language to concrete headings/tables, not chat-only claims.
- **Gaps / unknowns:** If a **§0.2** bullet cannot be tied to **migration id** or **already-landed** code path, record **`Decision needed`** in the worklog (do not invent behavior).

## Analysis
- **Why now:** **20.5.1–20.5.2** documented **sequence** and **baseline routing**; **20.5.3** is the **closure** pass: map **legacy assumptions** to **replacements** and prove **§8.5** is satisfied before **20.6** deletes code.
- **Boundaries:** **`.project-manager/analysis/`** + **`phase-20.5-handoff.md`** only unless a guide checkbox must flip; **no** `client/` / `server/` product edits planned.
- **Risks:** Over-long worklog — keep new sections **tabular + bullets**; duplicate **FEATURE_20** text — prefer **pointers** + one closure table.

## Goal
1. Add **`### Legacy assumption closure (session 20.5.3)`** to **`DOMAIN_REWRITE_WORKLOG.md`** with:
   - **`#### §0.2 legacy assumptions → replacement`** — table: assumption (quote or paraphrase from **FEATURE_20** §0.2) | **removed / replaced by** | **evidence** (worklog anchor, migration filename, or “client/server — phase 20.x”).
   - **`#### §2 model targets vs legacy (closure)`** — short table or bullets mapping **§2.2–§2.5** “survive / drop / add” themes to **Checkpoint 9** / **061–062** / three-property migrations (**059–060**), without re-pasting the full **FEATURE_20** §2.
   - **`#### Migration implicit-default audit`** — explicit statement that **`20260432_*`** steps are **idempotent / data-moving** per file headers and **do not** rely on undocumented Sequelize defaults for routing; cite **20.5.2** baseline + **§9.6** mitigation for orchestrator graphs.
2. Add **`### FEATURE_20 §8.5 acceptance (session 20.5.3)`** with a **three-row** table mapping each **§8.5** acceptance bullet → **satisfied by** (worklog heading / table) → **notes**.
3. Update **`.project-manager/features/domain-architecture-alignment/phases/phase-20.5-handoff.md`**: **Current Status**, **Next Action** → **`/phase-start 20.6`**, **Transition Context**, **Last Updated**; optionally tick session **20.5.3** in **`phase-20.5-guide.md`** at **session-end** (task **20.5.3.2** or harness).

## Files
- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (§0.2, §2 headers, §8.5), `DOMAIN_REWRITE_WORKLOG.md`
- **Write:** `DOMAIN_REWRITE_WORKLOG.md`, `phases/phase-20.5-handoff.md` (and `phases/phase-20.5-guide.md` checkbox if not auto-updated by harness at session-end)

## Approach
1. **`/accepted-plan`** → **`/task-start 20.5.3.1`** → **`/accepted-code`** → append **§0.2 / §2 / implicit-default audit** sections to worklog → **`/task-end`**.
2. **`/task-start 20.5.3.2`** → **`/accepted-code`** → append **§8.5** acceptance table → update **phase handoff** (and guide checkbox) → **`/task-end`**.
3. **`/session-end 20.5.3`** → push flow per harness.

## Checkpoint
- **`/accepted-plan`** → task cascade **20.5.3.1** → **20.5.3.2** → **`/session-end 20.5.3`**.

## Deliverables
- New **`### Legacy assumption closure`** and **`### FEATURE_20 §8.5 acceptance`** sections in **`DOMAIN_REWRITE_WORKLOG.md`**.
- Updated **`phase-20.5-handoff.md`** ready for **`/phase-start 20.6`**.

## Acceptance Criteria
- [ ] Every **§0.2** bullet has a **row** (or explicit **N/A** + reason) in the closure table.
- [ ] **§8.5** three acceptance checks each **map** to a specific worklog anchor.
- [ ] **Implicit-default audit** references **20.5.2** baseline narrative and does not claim migrations seed full tenant graphs.
- [ ] **Phase handoff** lists **Next Action** **`/phase-start 20.6`** with accurate **Transition Context**.

## Decomposition
- **Task 20.5.3.1:** **Legacy closure + implicit-default audit** — **`DOMAIN_REWRITE_WORKLOG.md`** (`### Legacy assumption closure` with §0.2 table, §2 closure subsection, migration audit paragraph).
- **Task 20.5.3.2:** **§8.5 traceability + phase handoff** — **`DOMAIN_REWRITE_WORKLOG.md`** (`### FEATURE_20 §8.5 acceptance` table) + **`phase-20.5-handoff.md`** (and **`phase-20.5-guide.md`** session **20.5.3** checkbox if needed).

**Coverage check:** **Goal** has three deliverable clusters (legacy/audit, §8.5 table, handoff); **Approach** orders two tasks that enact them without scope creep. **Yes — enough steps** to enact the session goal; child tasks map 1:1 to worklog sections + handoff.

## Definition of Done

- [ ] App starts (`npm run start:dev`) — **N/A** if no product code touched; run if any accidental edit under `client/` / `server/`.
- [ ] Lint passes — same **N/A** rule as above.
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/phases/phase-20.5-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
