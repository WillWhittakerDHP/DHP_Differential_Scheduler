# Plan: task 20.7.3.2 — Preflight §3–§4 + phase / feature handoffs

## Contract
- **Tier:** task | **ID:** 20.7.3.2
- **Scope:** Replace stubs in **`preflight-evidence-20.7.2.md` §3** (migration execution policy) and **§4** (`property_details` vs time-configuration); update **`phase-20.7-log.md`**, **`feature-domain-architecture-alignment-handoff.md`**, and **`session-20.7.3-handoff.md`** with **Next action** toward **`/phase-start 20.8`**; optionally **`phase-20.7-guide.md`** checkbox / pointer. **Out of scope:** further edits to **`phase-20.8`–`phase-20.13`** guides (**20.7.3.1**), product **`client/`** / **`server/`** code.
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

**20.7.3.1** landed preflight rows in **`phase-20.8`–`phase-20.13`** guides. This task **closes the preflight file** (**§3–§4**) and **aligns harness handoffs** so phase **20.7** can end cleanly.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Preflight evidence is incomplete without **§3–§4**; phase **20.7** log/handoff must state **package complete** and point to **20.8**.
- **Boundaries:** **`.project-manager/`** markdown only.
- **Dependencies:** **20.7.3.1** complete.

## Story

**This task finishes** the **preflight narrative** and **harness transition text** **so that** agents can run **`/phase-end 20.7`** / **`/phase-start 20.8`** with a **single** canonical evidence path and **no** stub sections.

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

## Codebase recon (agent-led — required)

- **Paths reviewed:** `preflight-evidence-20.7.2.md` (current §§1–2, stub §3–§4); `.project-manager/ARCHITECTURE.md` **§10.4**, **§12**, **§14.5**; `.cursor/rules` migration authority (workspace policy: **localhost** only for DDL); `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (pass ordering for migration narrative cite); `client/src/utils/booking/appointmentDataBuilders.ts` (sample `propertyDetails` on requests — cite only, no edits).
- **Patterns:** §3 **restates** policy already in repo rules; §4 **restates** architecture separation of **`property_details`** vs time atomics.
- **Gaps:** None — prose-only task.

## Analysis

- **Problem:** Stubs block calling the preflight package “done”; handoffs still point at stale next steps.
- **Boundary:** Markdown under **`.project-manager/features/domain-architecture-alignment/`** plus root **`.project-manager/`** for `ARCHITECTURE.md` links.

## Design

1. **`preflight-evidence-20.7.2.md`:** Replace **§3** with: who may run migrations (`DB_HOST` **localhost** / **127.0.0.1**); shared DB consumers **must not** run DDL; **author** migrations on any machine, **execute** on host per rules; pointer to **FEATURE_20** / **20.11** for conversion narrative.
2. Replace **§4** with: **`property_details`** = appointment-scoped **inputs** (MLS / wizard); time atomics = **rates**; product = rate × input → duration contribution; cite **ARCHITECTURE** §10.4 / §12; link booking builders for evidence.
3. **Intro paragraph:** State **§3–§4** completed in **session 20.7.3** (not “task 20.7.2.3”); remove stale “**§3–§4** remain for task **20.7.2.3**” line.
4. **`phase-20.7-log.md`:** Append session **20.7.3** outcome + pointer to full preflight + **next: `/phase-start 20.8`**.
5. **`feature-domain-architecture-alignment-handoff.md`**, **`session-20.7.3-handoff.md`:** **Current status**, **Next action** = **`/phase-end 20.7`** then **`/phase-start 20.8`** (with feature slug); **Transition context** — preflight complete, backlog in phase guides **20.8–20.13**.
6. **`phase-20.7-guide.md`:** Optional — mark Session **20.7.3** tasks complete if checklist format exists.

## Goal

Deliver a **non-stub** **`preflight-evidence-20.7.2.md`** §3 and §4 and **updated handoffs** so the feature is ready for **phase 20.8** execution.

## Files

- **Edit:** `preflight-evidence-20.7.2.md`, `phases/phase-20.7-log.md`, `feature-domain-architecture-alignment-handoff.md`, `sessions/session-20.7.3-handoff.md` (create if missing)
- **Optional edit:** `phases/phase-20.7-guide.md`
- **Read-only:** `ARCHITECTURE.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md`, `.cursor/rules` (migration rule)

## Approach

1. Draft §3 / §4 in preflight; fix cross-refs in §2.1 “Next” line.
2. Update logs/handoffs.
3. **Do not** modify `across-ladder.json` unless **`nextTaskAcross`** must advance (harness may refresh at **`/task-end`**).

## Checkpoint

- Reader can answer “Where is migration policy?” and “Where is **`property_details`** boundary?” from **only** `preflight-evidence-20.7.2.md` §3–§4.

## Deliverables

- **`preflight-evidence-20.7.2.md`** — §3, §4 complete; intro updated.
- **`phase-20.7-log.md`** — session **20.7.3** noted.
- **`feature-domain-architecture-alignment-handoff.md`** + **`session-20.7.3-handoff.md`** — next phase **20.8**.

## Acceptance Criteria

- [ ] §3 cites **localhost / shared DB** migration authority and **FEATURE_20** ordering reference.
- [ ] §4 cites **ARCHITECTURE** §10.4 / §12 and at least one **client** booking path for `propertyDetails` (path only).
- [ ] No **`client/`** / **`server/`** code changes.
- [ ] Handoffs list **`/phase-start 20.8`** as next harness step after **`/phase-end 20.7`**.

## Definition of Done

- [ ] Deliverables / acceptance met.
- [ ] App / lint — **N/A** for markdown-only.

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.3-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.3.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
