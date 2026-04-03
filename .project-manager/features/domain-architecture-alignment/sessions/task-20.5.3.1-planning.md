# Plan: task 20.5.3.1 — 20.5.3.1

## Contract
- **Tier:** task | **ID:** 20.5.3.1
- **Scope:** 20.5.3.1
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
- [ ] #### Task 20.5.3.1: **Legacy closure + migration audit (worklog)** — **`DOMAIN_REWRITE_WORKLOG.md`** only; **20.5.3.2** adds **§8.5** table + **phase-20.5-handoff**.

## Parent context (session planning — Analysis excerpt)

- **Why now:** **20.5.1–20.5.2** documented **sequence** and **baseline routing**; **20.5.3** is the **closure** pass: map **legacy assumptions** to **replacements** and prove **§8.5** is satisfied before **20.6** deletes code.
- **Boundaries:** **`.project-manager/analysis/`** + **`phase-20.5-handoff.md`** only unless a guide checkbox must flip; **no** `client/` / `server/` prod… _(truncated)_

## Story
**This task appends** **`### Legacy assumption closure (session 20.5.3)`** to the worklog **because** **FEATURE_20** §0.2 / §2 must be **traceable** to migrations + prior narrative (**Checkpoint 9**, **20.5.2**) before **20.5.3.2** can sign **§8.5** and the phase handoff.

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

- **Paths reviewed:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (**§0.2** six bullets, **§2.2–§2.5** themes); `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` (end of **`### Baseline placement & event routing`** — append **after** that **`###`**); session **20.5.2** anchors (**§9.6 mitigation**, **Addressed** block). No product-code edits in this task.
- **Patterns:** Evidence column points to **`20260432_*`** filenames from **Checkpoint 9** list and/or “**FEATURE_20** §1.2 / worklog **Orchestrator baseline**” where DDL does not apply.
- **Gaps / unknowns:** Purely **behavioral** legacy (e.g. differential-role **language** in UI) → evidence **“phase 20.4 / client — see FEATURE_20 §4”** without claiming a single migration file.

## Analysis
- **Problem:** §8.5 asks for legacy mapping closure; this task supplies the **§0.2 / §2** traceability **before** the §8.5 sign-off table (**20.5.3.2**).
- **Boundaries:** **`DOMAIN_REWRITE_WORKLOG.md`** only for this task’s diff.
- **Risk:** Duplicating **FEATURE_20** — keep tables **short**; one row per §0.2 bullet.

## Design
Append **after** the last subsection of **`### Baseline placement & event routing (session 20.5.2)`** (after **`#### FEATURE_20 §9.6 mitigation`**):

1. **`### Legacy assumption closure (session 20.5.3)`**
2. **`#### §0.2 legacy assumptions → replacement`** — markdown table with **6 rows** (one per §0.2 bullet).
3. **`#### §2 model targets vs legacy (closure)`** — compact table: **Theme** (e.g. enum rename, three-property, relational events, drops) | **FEATURE_20 §2 ref** | **Evidence** (migrations **058–062**, **034–036**, **051–055**, **035**, worklog **Checkpoint 9**).
4. **`#### Migration implicit-default audit`** — bullets: migrations state **explicit** DDL/data moves; routing graphs per **20.5.2**; no reliance on undocumented ORM null semantics for **`event_assignments`**.

## Goal
Add **`### Legacy assumption closure (session 20.5.3)`** with the **three `####` subsections** above to **`DOMAIN_REWRITE_WORKLOG.md`**. **Do not** add **`### FEATURE_20 §8.5 acceptance`** or edit **`phase-20.5-handoff.md`** in this task.

## Files
- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` (§0.2, §2), `DOMAIN_REWRITE_WORKLOG.md`
- **Write:** `DOMAIN_REWRITE_WORKLOG.md`

## Approach
1. Open worklog; scroll to **`### Baseline placement & event routing`**; append new **`###`** after **§9.6 mitigation** `####`.
2. Build §0.2 table from **FEATURE_20** lines 41–48 (paraphrase OK).
3. Build §2 closure table from **§2.2–§2.5** headings (themes, not full column lists).
4. Write implicit-default audit referencing **`### Baseline placement`** and **`#### FEATURE_20 §9.6 mitigation`**.

## Checkpoint
- **`/accepted-code`** → implement → **`/task-end 20.5.3.1`** → **`/task-start 20.5.3.2`**.

## Deliverables
- **`### Legacy assumption closure (session 20.5.3)`** in **`DOMAIN_REWRITE_WORKLOG.md`**.

## Acceptance Criteria
- [ ] **Six** §0.2 rows (or explicit **N/A** + reason — expect **six** filled).
- [ ] §2 closure covers **enum**, **three-property**, **relational `event_assignments`**, **drops** (JSON overrides / shape booleans / differential_role), **attendee rename** — without pasting full §2.
- [ ] Implicit-default audit **links** to **20.5.2** baseline + **§9.6 mitigation** headings.
- [ ] **No** **`### FEATURE_20 §8.5 acceptance`** and **no** `phase-20.5-handoff.md` edits in this diff.

## Decomposition
**Leaf** — single markdown append.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.3-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
