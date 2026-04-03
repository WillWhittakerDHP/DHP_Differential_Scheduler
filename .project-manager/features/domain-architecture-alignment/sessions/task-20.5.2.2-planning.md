# Plan: task 20.5.2.2 — 20.5.2.2

## Contract
- **Tier:** task | **ID:** 20.5.2.2
- **Scope:** 20.5.2.2
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
- [ ] #### Task 20.5.2.2: **Gap closure + §9.6** — **Goal:** retire **`#### Gaps for session 20.5.2`**, add **FEATURE_20 §9.6** mitigation prose, align §9.5 crosswalk **Notes** cell; **Files:** `DOMAIN_REWRITE_WORKLOG.md` only.

## Parent context (session planning — Analysis excerpt)

- **Why now:** **20.5.1.2** left **`gap:`** for orchestrator baseline; **§9.6** requires explicit mitigation language.
- **Boundaries:** **`.project-manager/analysis/`** only; cite **migrations** by id, do not change them.
- **Risks:** Claiming migrations insert full routing graphs — **avoid**; state **admin + validity graph** responsibility clearly.

## Story
**This task closes** the open **Checkpoint 9** gap list and **records FEATURE_20 §9.6 risk mitigation** in the worklog **because** **20.5.2.1** added the baseline narrative body; **20.5.2.2** wires that narrative back to **§9.5 / §9.6** so readers do not assume implicit ORM routing after migrate.

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

- **Paths reviewed:** `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` (**`#### Gaps for session 20.5.2`**, **`### Baseline placement & event routing`**); `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` **§9.6** risk table (row *Migration sequence leaves default routing implicit*); `server/src/db/` (no **`seeders/`** directory).
- **Patterns:** **Mitigation** in **FEATURE_20** §9.6 table is procedural (“include baseline … checks in the migration pass”); this task satisfies it **for the worklog** by stating **documented expectations** + **no server invention** of **`event_assignments`**, consistent with **§5.2**.
- **Gaps / unknowns:** None for this doc pass; future **seeders** would need a separate ops note if added.

## Analysis
- **Problem:** **`#### Gaps for session 20.5.2`** still reads as open work though **20.5.2.1** answered it in prose.
- **Boundaries:** **`DOMAIN_REWRITE_WORKLOG.md`** only; do not edit migration files.
- **Dependency:** Baseline **`###`** must stay stable so **`#### Addressed`** can link to **`#### Fresh database`**, **`#### Upgraded database`**, **`#### Orchestrator baseline vs profile override`**, etc.

## Design
1. **Rename/replace** **`#### Gaps for session 20.5.2`** → **`#### Addressed (session 20.5.2)`** with **short bullets**: each former gap → pointer to the relevant **`####`** under **`### Baseline placement & event routing`**; **seeders** → **N/A** (no `server/src/db/seeders/` in repo; enumerate if introduced).
2. **Append** final subsection **`#### FEATURE_20 §9.6 mitigation (session 20.5.2)`** under the same **`### Baseline placement & event routing`**, explicitly mapping the §9.6 row *Migration sequence leaves default routing implicit* to: **documentation** + **operator/product** responsibility for instance graphs; **061** = placement **catalog** only; **no** API path synthesizes **`event_assignments`** as silent defaults.
3. **Optional alignment:** In the **§9.5 crosswalk** table, replace the lingering **`gap:`** phrasing in the **“Seed or confirm baseline…”** row **Notes** cell with **“Addressed in worklog …”** + anchor to **`### Baseline placement & event routing`** and the new **§9.6 mitigation** subsection (keeps crosswalk consistent with body).

## Goal
1. Replace **`#### Gaps for session 20.5.2`** with **`#### Addressed (session 20.5.2)`** and resolution bullets that **link** to existing baseline subsections.
2. Add **`#### FEATURE_20 §9.6 mitigation (session 20.5.2)`** under **`### Baseline placement & event routing (session 20.5.2)`**.
3. Update the **§9.5 crosswalk** table **Notes** for the baseline seed row to remove stale **`gap:`** language and point at the baseline **`###`** + §9.6 mitigation.

## Files
- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (§9.6), `DOMAIN_REWRITE_WORKLOG.md`
- **Write:** `DOMAIN_REWRITE_WORKLOG.md`

## Approach
1. Edit **Gaps** block → **Addressed** block (pointers + seeders **N/A**).
2. Append **§9.6 mitigation** `####` after **Orchestrator baseline vs profile override**.
3. Tighten crosswalk table **Notes** cell for **061** / orchestrator baseline row.

## Checkpoint
- **`/accepted-code`** → implement → **`/task-end 20.5.2.2`** → **`/session-end 20.5.2`**.

## Deliverables
- **`#### Addressed (session 20.5.2)`** + **`#### FEATURE_20 §9.6 mitigation (session 20.5.2)`** + updated **§9.5** table **Notes** (one row).

## Acceptance Criteria
- [ ] No heading **`#### Gaps for session 20.5.2`** remains (replaced or clearly superseded).
- [ ] **§9.6** row *Migration sequence leaves default routing implicit* explicitly mitigated in worklog prose.
- [ ] **Seeders** bullet resolved (**N/A** + path) or equivalent.
- [ ] **§9.5** crosswalk no longer implies an open **`gap:`** for orchestrator baseline without pointer to **20.5.2** narrative.

## Decomposition
**Leaf** — one markdown file, three localized edits.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.2-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.2.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
