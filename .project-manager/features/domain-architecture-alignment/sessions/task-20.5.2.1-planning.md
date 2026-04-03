# Plan: task 20.5.2.1 — 20.5.2.1

## Contract
- **Tier:** task | **ID:** 20.5.2.1
- **Scope:** 20.5.2.1
- **Governance:** Governance Context (Task)

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Gate profile:** fast
- **Suggested depth:** leaf — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
- [ ] #### Task 20.5.2.1: **Baseline narrative (worklog)** — **Goal:** add **`### Baseline placement & event routing (session 20.5.2)`** body only; **20.5.2.2** closes gaps + §9.6.

## Parent context (session planning — Analysis excerpt)

- **Why now:** **20.5.1.2** left **`gap:`** for orchestrator baseline; **§9.6** requires explicit mitigation language.
- **Boundaries:** **`.project-manager/analysis/`** only; cite **migrations** by id, do not change them.
- **Risks:** Claiming migrations insert full routing graphs — **avoid**; state **admin + validity graph** responsibility clearly.

## Story
**This task adds** the main **baseline placement & event routing** prose to **`DOMAIN_REWRITE_WORKLOG.md`** **because** **20.5.1.2** deferred orchestrator/placement semantics to **20.5.2** and splitting **narrative** (**20.5.2.1**) from **risk/gap closure** (**20.5.2.2**) keeps task-end diffs reviewable.

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

## Codebase recon (agent-led — required)
Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant to this tier.

- **Paths reviewed:** `sessions/session-20.5.2-planning.md` (session Goal); `DOMAIN_REWRITE_WORKLOG.md` end (after **Canonical narrative home** — insert new `###` there); `FEATURE_20_ARCHITECTURE_REDESIGN.md` §1.2 table (event routing row), §5.2 (server does not re-resolve booking totals).
- **Patterns:** **Orchestrator baseline** = assignments chosen from **shape-level validity** (`valid_event_cascades`, etc.), persisted as **`event_assignments`** from **event instances** → **part instances**; **profile override** = alternate segment assignment path on the client (**PartFinalizer**), not a second server calculator (**§5.2**).
- **Gaps / unknowns:** **061** file-level detail for default placement **names** — cite migration header only; **no** exhaustive SQL in planning doc.

## Analysis
- **Problem:** **Gap list** in worklog names issues but does not explain **operator-visible** baseline behavior.
- **Boundaries:** One **`DOMAIN_REWRITE_WORKLOG.md`** section; **do not** edit **`#### Gaps for session 20.5.2`** in this task (**20.5.2.2**).
- **Dependency:** **Checkpoint 9** / §9.5 crosswalk remains authoritative for **which** migrations ran.

## Design
Insert after **`#### Canonical narrative home`** (still under Checkpoint 9):

- **`### Baseline placement & event routing (session 20.5.2)`**
  - **`#### Fresh database`** — after full **`20260432_*`** migrate: schema + **061** default **placement-type** `event_shapes` rows; **no** automatic population of block/event **instances** or **`event_assignments`**; admin + product config create graphs.
  - **`#### Upgraded database`** — legacy rows migrate per **061** / **035** / validity renames; routing meaning = same relational model, not new scalar columns on parts.
  - **`#### Placement-type seeds (061)`** — what is guaranteed (named catalog); what is **not** (full template graphs).
  - **`#### Relational routing (`event_assignments`)`** — **035** parent = **blockInstance**; edges tie **segments** to **part instances**.
  - **`#### Orchestrator baseline vs profile override`** — vocabulary aligned to **FEATURE_20** §1.2 / client resolution order (**override ?? baseline**).

## Goal
Append **`### Baseline placement & event routing (session 20.5.2)`** with the **five `####` subsections** listed in **Design** to **`DOMAIN_REWRITE_WORKLOG.md`**, **without** modifying **`#### Gaps for session 20.5.2`** or adding the **§9.6** mitigation block (**20.5.2.2**).

## Files
- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (§1.2, §5.2), `DOMAIN_REWRITE_WORKLOG.md`
- **Write:** `DOMAIN_REWRITE_WORKLOG.md`

## Approach
1. Open worklog; append the new **`###`** and subsections after **Canonical narrative home**.
2. Keep prose **short** (bullet lists OK); cite **`20260432_000061_*`**, **`000035_*`** by filename only.
3. Stop before editing the **Gaps for session 20.5.2** heading block.

## Checkpoint
- **`/accepted-code`** → implement → **`/task-end 20.5.2.1`** → **`/task-start 20.5.2.2`**.

## Deliverables
- New **`### Baseline placement & event routing (session 20.5.2)`** section in **`DOMAIN_REWRITE_WORKLOG.md`**.

## Acceptance Criteria
- [ ] Section and all **five** **`####`** children present.
- [ ] States clearly that **migrations do not** create full **`event_assignments`** graphs for production tenants.
- [ ] **`event_assignments`** / **blockInstance** parent rule referenced (**035**).
- [ ] **061** placement catalog role described without over-claiming.
- [ ] **No** edits to **`#### Gaps for session 20.5.2`** in this task’s diff.

## Decomposition
**Leaf** — single append to one markdown file.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
