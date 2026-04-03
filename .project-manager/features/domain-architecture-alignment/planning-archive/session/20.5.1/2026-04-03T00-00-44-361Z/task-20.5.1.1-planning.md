# Plan: task 20.5.1.1 — 20.5.1.1

## Contract
- **Tier:** task | **ID:** 20.5.1.1
- **Scope:** 20.5.1.1
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
- [ ] #### Task 20.5.1.1: Ordered migration inventory — **Goal:** append **ordered `20260432_*` list** with **§1 / §2 / adjacent** tags to **`DOMAIN_REWRITE_WORKLOG.md`** (task **20.5.1.2** adds **§9.5** crosswalk).

## Parent context (session planning — Analysis excerpt)

- **Why now:** **§8.5** / **§9.5** require an **explicit** sequence; code exists but the **narrative** was fragmented across phase logs.
- **Boundaries:** **`.project-manager/analysis/`** + migration **filenames** as evidence; **no** client/server product code in **20.5.1** unless a task discovers a **blocking** doc error (then note follow-up, do not expand scope silently).
- **C… _(truncated)_

## Story
**This task adds** a single **ordered inventory section** for all **`20260432_*.mjs`** migrations (one-line purpose + Feature 20 relevance tags) **to** **`DOMAIN_REWRITE_WORKLOG.md`**, **because** **§8.5 / §9.5** need a traceable sequence before **20.5.1.2** can author the **§9.5** crosswalk table.

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

- **Paths reviewed:** `server/src/db/migrations/20260432_000034` … `000062` (28 files, lexicographic order = Sequelize run order); first comment blocks captured for one-line summaries; `sessions/session-20.5.1-planning.md` (session decomposition).
- **Patterns / call ids:** **`20260432_*`** mixes **Feature 20** DDL (valid_* renames **051–055**, enum **058**, instances **059–060**, event schema **061–062**, event routing **034–036**, minimizer rename **049–050**) with **Feature 7** auth (**040–041**, **045–048**), **Feature 6** user_role (**056–057**), and product tweaks (availability **037–038**, wizard copy **039**, **043**, differential enum **044**).
- **Gaps / unknowns:** **§9.5** bullet-by-bullet mapping is **explicitly deferred** to task **20.5.1.2**.

## Analysis
- **Problem:** Operators and reviewers cannot skim one file for **what ran, in what order**, under the shared **`20260432`** prefix.
- **Boundaries:** **`.project-manager/analysis/`** write only; **no** `client/` / `server/src` product code.
- **Dependency:** **20.5.1.2** consumes this list for the **§9.5** table.
- **Risk:** Wrong tag (**core** vs **adjacent**) — mitigate by tying **core** to **§1 / §2** headings in **FEATURE_20**.

## Design
1. Open **`DOMAIN_REWRITE_WORKLOG.md`**, append **`## Checkpoint 6 — Feature 20: `20260432` ordered migration inventory (task 20.5.1.1)`** (or sibling heading if Checkpoint 6 exists — bump number).
2. Subsection **Run order (lexicographic)** — numbered list: **`filename`** — one-line purpose (from migration header) — tags: **`§1`** | **`§2`** | **`core`** | **`adjacent`** | **`other`** (use `core` when both §1 and §2 touched in one file, e.g. **061**).
3. Optional short **Grouping callout** (markdown) grouping **034–036** (relational event), **051–055** (valid_*), **058–062** (phase 20.1 tranche) without re-sorting (order stays filename order).

## Goal
Produce an **ordered, tagged inventory** of every **`server/src/db/migrations/20260432_*.mjs`** file in **lexicographic run order**, each with a **one-line purpose** and **Feature 20 relevance** tags (**§1**, **§2**, **core**, **adjacent**, **other**), **appended to** **`DOMAIN_REWRITE_WORKLOG.md`**.

## Files
- **Write:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`
- **Read (evidence):** `server/src/db/migrations/20260432_*.mjs`

## Approach
1. Confirm file list via `ls` / glob (28 files).
2. Draft list from each file’s leading comment (trim to one line where multi-line).
3. Tag each row: **§1** = block shape type enum rename (**058**); **§2** = schema targets in **FEATURE_20** §2 (esp. **059–062**, parts of **034–036**, **051**); **adjacent** = auth / user_role / wizard copy / availability / differential enum not central to §2 table; **other** when none apply.
4. Paste into worklog; no migration execution.

## Checkpoint
- **`/accepted-code`** → implement doc edit → **`/task-end 20.5.1.1`** → cascade **`/task-start 20.5.1.2`**.

## Deliverables
- New **Checkpoint / section** in **`DOMAIN_REWRITE_WORKLOG.md`** containing the full ordered inventory.

## Acceptance Criteria
- [ ] All **28** `20260432_*.mjs` files appear **once**, in **lexicographic** order.
- [ ] Each line includes **filename** + **one-line purpose** + at least one **tag** (**§1**, **§2**, **core**, **adjacent**, or **other**).
- [ ] **No** §9.5 crosswalk table in this task (that is **20.5.1.2**).
- [ ] **No** application source changes outside **`.project-manager/analysis/`**.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
