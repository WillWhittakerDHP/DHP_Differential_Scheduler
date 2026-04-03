# Plan: task 20.6.4.1 — 20.6.4.1

## Contract
- **Tier:** task | **ID:** 20.6.4.1
- **Scope:** Pass 6 evidence (§9.1 / §9.1a), grep audit, worklog capstone, **session-20.6.3-handoff** hygiene
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
Session **20.6.4** accepted; first executable task is **20.6.4.1** (evidence + doc hygiene). Task **20.6.4.2** remains for phase handoff / **PROJECT_PLAN** / §**9.3–9.4** narrative.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Phase **20.6** execution sessions are done; without **20.6.4**, **§8.6** acceptance and ladder/handoff state stay ambiguous and **`phase-20.6-handoff.md`** misleads the next agent.
- **Boundaries:** **`.project-manager/`** docs plus optional tiny **`ARCHITECTURE.md`** / worklog edits; **no** booking or server behavior change unless a checklist failure for… _(truncated)_

## Story
**This task changes** project-manager artifacts (**session log**, **worklog**, **20.6.3 handoff**) **because** **§8.6** / **§9.1** acceptance must be **auditable on the branch** before phase/feature closeout (**20.6.4.2**).

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

## Codebase recon (agent-led — required)
Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant to this tier.

- **Paths reviewed:** `client/src` / `server/src` ripgrep (2026-04-03): **`admin-metadata`**, **`adminMetadata`**, **`AdminMetadata`** → **0** matches in `*.ts`/`*.vue` / `*.ts`/`*.js`; **`differentialEventRoleOverrides`** in `client/src` → **0** matches; **`EntityCard.vue`** file → **not present** (shell removed); comments in **`useEntityCard*.ts`** still mention **EntityCard.vue** historically — **naming debt only**, not a missing component import.
- **Patterns / call sites:** Pass **6** code removals align with greps; evidence belongs in **PM logs**, not new product code.
- **Gaps / unknowns:** **`ARCHITECTURE.md`** may still say “admin-metadata (legacy)” in domain table — confirm line-level on implement pass; optional one-line refresh if still stale.

## Analysis
- **Problem:** Session **20.6.4** needs **on-branch proof** that **§8.6** cleanup targets are met (metadata + override symbols) and principles drift checklist is **recorded**.
- **Boundaries:** **`.project-manager/`** only for this task; **`DOMAIN_REWRITE_WORKLOG.md`** capstone; **`session-20.6.3-handoff.md`** repair.
- **Risks:** Low — doc-only. **Dependency:** **`session-20.6.4-log.md`** must exist or be appended (create section if file minimal).
- **Alternatives:** Skip worklog capstone — **rejected**; session plan calls for explicit **Pass 6** evidence block.

## Design
1. **`session-20.6.4-log.md`:** Add **`### Task 20.6.4.1 — Evidence`** containing:
   - **§9.1** checklist — copy bullets from **FEATURE_20** §**9.1**; mark each **[x] passed** with a **one-line** repo note (e.g. “three-property on instances only — see migrations + ARCHITECTURE”).
   - **§9.1a** — short paragraph: invariants **1–6** acknowledged; no implementation change this task.
   - **Grep audit** — paste commands and results:  
     `rg -l 'admin-metadata|adminMetadata|AdminMetadata' client/src server/src` → none;  
     `rg 'differentialEventRoleOverrides' client/src` → none;  
     `glob **/EntityCard.vue` under `client/src` → none.
2. **`DOMAIN_REWRITE_WORKLOG.md`:** After existing **Pass 6 / session 20.6.3.2** subsection, add **`### Pass 6 verification (session 20.6.4.1)`** with 2–3 bullets: grep-clean metadata + overrides; **EntityCard.vue** absent; pointer to **`session-20.6.4-log.md`** for full checklist.
3. **`session-20.6.3-handoff.md`:** Set **Last Completed** to **20.6.3.2**; remove **duplicate** `## Across ladder` / duplicate harness blocks (keep **one** `<!-- harness-across-ladder:start -->` … **end**); fix **Next Action** / **Transition** prose if still empty.
4. **`ARCHITECTURE.md`:** Read **§2 domain map** row for Admin — if it still says live **admin-metadata** routes, change to **past tense / removed** one clause; if already accurate, **no edit**.

## Goal
Produce **auditable §9.1 / §9.1a + grep evidence** in **`session-20.6.4-log.md`**, add a **short Pass 6 verification** subsection to **`DOMAIN_REWRITE_WORKLOG.md`**, and repair **`session-20.6.3-handoff.md`**. **Defer** **`phase-20.6-handoff`**, **`PROJECT_PLAN`**, and **§9.3–9.4** narrative to **task 20.6.4.2**.

## Files
- **Edit:** `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.4-log.md`, `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md`, `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.3-handoff.md`, optionally `.project-manager/ARCHITECTURE.md`
- **Read:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §**9.1**, §**9.1a** (copy checklist source)

## Approach
1. Open **FEATURE_20** §**9.1** / **9.1a**; draft checklist answers grounded in repo state.
2. Append evidence section to **`session-20.6.4-log.md`** (create file with session header if missing).
3. Append **`### Pass 6 verification (session 20.6.4.1)`** to **`DOMAIN_REWRITE_WORKLOG.md`**.
4. Clean **`session-20.6.3-handoff.md`** (status text + single ladder block).
5. Skim **`ARCHITECTURE.md`** admin row; edit only if factually wrong.

## Checkpoint
- User runs **`/accepted-code`** → agent implements → **`/task-end 20.6.4.1`**.
- **DoD:** No **`client/`** / **`server/`** product code required unless step 5 finds gross error (unlikely).

## Deliverables
- **`session-20.6.4-log.md`** contains **Task 20.6.4.1** evidence (§**9.1**, §**9.1a**, grep).
- **`DOMAIN_REWRITE_WORKLOG.md`** has **Pass 6 verification (session 20.6.4.1)** subsection.
- **`session-20.6.3-handoff.md`** has no duplicate ladder blocks and correct **Last Completed**.

## Acceptance Criteria
- Grep claims in the log match runnable commands on **`feature/domain-architecture-alignment`**.
- **§9.1** checklist appears in **session-20.6.4-log** with each item addressed (pass or explicit “N/A with reason”).
- **20.6.3** handoff is readable and not self-contradictory.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.4-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
