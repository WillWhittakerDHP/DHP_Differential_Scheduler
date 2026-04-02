# Plan: task 20.5.1.2 — 20.5.1.2

## Contract
- **Tier:** task | **ID:** 20.5.1.2
- **Scope:** 20.5.1.2
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
- [x] Task **20.5.1.1** landed **Checkpoint 9** ordered inventory in **`DOMAIN_REWRITE_WORKLOG.md`**.
- [ ] #### Task 20.5.1.2: **§9.5 crosswalk + narrative + gaps** — append under same worklog; **no** `MIGRATION_SEQUENCE.md` unless table exceeds ~80 lines (not expected).

## Parent context (session planning — Analysis excerpt)

- **Why now:** **§8.5** / **§9.5** require an **explicit** sequence; code exists but the **narrative** was fragmented across phase logs.
- **Boundaries:** **`.project-manager/analysis/`** + migration **filenames** as evidence; **no** client/server product code in **20.5.1** unless a task discovers a **blocking** doc error (then note follow-up, do not expand scope silently).
- **C… _(truncated)_

## Story
**This task adds** the **FEATURE_20 §9.5 crosswalk** (table + short narrative + **§9.6** mitigation pointer) **to** **`DOMAIN_REWRITE_WORKLOG.md`** **because** **§8.5** acceptance requires every migration note to map to **concrete** migration ids and to surface **gaps** (especially **baseline event-orchestrator** prose) for **session 20.5.2**.

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

- **Paths reviewed:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` **§9.5** (five bullets), **§9.6** (implicit default routing row); `DOMAIN_REWRITE_WORKLOG.md` **Checkpoint 9** (inventory from **20.5.1.1**); `server/src/db/migrations/20260432_000058` … **061** headers (for crosswalk citations).
- **Patterns:** **§9.5** is **logical** deploy order, not identical to lexicographic `20260432` order (auth/wizard files interleave); crosswalk must **cite** files by id and **note** “run full chain” for greenfield.
- **Gaps / unknowns:** **Baseline event-orchestrator** rows are **not** fully specified in a single migration comment — document as **`gap → 20.5.2`**.

## Analysis
- **Problem:** Inventory alone does not prove **§9.5** compliance; need explicit **bullet → migration** mapping.
- **Boundaries:** **`.project-manager/analysis/`** only.
- **Depends on:** **Checkpoint 9** list (do not duplicate the 28-line inventory).
- **Risk:** Over-claiming orchestrator seeds — **mitigate** with **`partial`** + **20.5.2** handoff bullets.

## Design
1. Under **`DOMAIN_REWRITE_WORKLOG.md`** after **Checkpoint 9** content, add **`### FEATURE_20 §9.5 migration crosswalk (task 20.5.1.2)`**.
2. **Table** with columns: **§9.5 bullet (paraphrase)** | **Primary migrations** | **Supporting / prerequisite** | **Notes or `gap:`**.
3. **Narrative:** 1 short paragraph stating **§9.5 logical order** vs **full `20260432` lex order** (operators run all pending migrations; Feature 20 tranche is **058–062** with prerequisites **034–036**, **051–055**).
4. **`### Gaps for session 20.5.2`** — bullets: e.g. explicit **event-orchestrator baseline** data definition; optional **seeders/** audit; **§9.6** mitigation sentence referencing planned **20.5.2** prose.
5. **`### Canonical narrative home`** — one sentence: **continue in `DOMAIN_REWRITE_WORKLOG.md`**; **no** `MIGRATION_SEQUENCE.md` for this pass.

## Goal
- Map **each** of the **five** **§9.5** bullets to **migration file id(s)** and/or a **`gap:`** line.
- Add **concise** narrative + **20.5.2** gap list + **canonical home** statement.
- Reference **§9.6** “implicit default routing” mitigation as **partially** addressed by **061** placement seeds + **035** relational parent rule; **remainder** in **20.5.2**.

## Files
- **Read:** `FEATURE_20_ARCHITECTURE_REDESIGN.md` §9.5–§9.6; `DOMAIN_REWRITE_WORKLOG.md` (Checkpoint 9)
- **Write:** `DOMAIN_REWRITE_WORKLOG.md`

## Approach
1. Copy §9.5 bullets verbatim or tight paraphrase into table left column.
2. Fill rows using Checkpoint 9 tags + migration headers; use **`gap:`** where orchestrator baseline is not migration-documented.
3. Add narrative + gaps + canonical home subsections.
4. No code or migration execution.

## Checkpoint
- **`/accepted-code`** → edit worklog → **`/task-end 20.5.1.2`** → **`/session-end 20.5.1`**.

## Deliverables
- **`DOMAIN_REWRITE_WORKLOG.md`** updated with **§9.5 crosswalk**, **narrative**, **gaps for 20.5.2**, **canonical home** note.

## Acceptance Criteria
- [ ] Table has **exactly five** rows (one per **§9.5** bullet).
- [ ] Every row has **at least one** of: migration id(s), **`none`**, or **`gap:`** explanation.
- [ ] **Gaps for 20.5.2** mentions **baseline event-orchestrator** explicitly.
- [ ] **Canonical home** sentence present (**worklog**, not new file).
- [ ] No changes outside **`.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`**.

## Decomposition
**Leaf tier** — single documentation edit in one file; no sub-tasks.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.5.1-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.5.1.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
