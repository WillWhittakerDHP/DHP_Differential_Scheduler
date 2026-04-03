# Plan: task 20.7.1.2 — 20.7.1.2

## Contract
- **Tier:** task | **ID:** 20.7.1.2
- **Scope:** 20.7.1.2
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
- [ ] #### Task 20.7.1.2: [Task Name] **Goal:** [Task goal] **Files:**

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** The extension ladder (**20.7**, **20.8**) exists on disk, but PM text written for the old “**20.6** then feature-end” story is still discoverable and contradicts the new path.
- **Boundaries:** `.project-manager` harness docs and **`PROJECT_PLAN.md`** only; no `client/` / `server/` refactors.
- **Patterns:** “Locked docs win” order already stated in phase… _(truncated)_

## Story
**This task changes** [what] **because** [why].

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
Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant to this tier.

- **Paths reviewed:** (repo-relative; files or dirs you actually opened or searched)
- **Patterns / call sites:** (what exists today; what this work must align with or extend)
- **Gaps / unknowns:** (what still needs verification later)

[Codebase recon: search and read client/, server/, and shared/ as needed — then remove this line after recording findings below]

## Analysis
Address:
- What problem does this solve and why now?
- What domain boundaries does this cross? (see ARCHITECTURE.md)
- Ground this in **## Codebase recon** (paths you verified) plus ARCHITECTURE.md — not doc injection alone.
- What existing patterns or code should child tiers follow?
- Risks, dependencies, or open questions?
- Alternatives considered (for decomposition tiers)

## Design
[Describe what changes and why]

## Goal
1. Make **feature-level** and **active handoff** **Next Action** text describe **`/session-start 20.7.1`** / continuation of **20.7**, then **20.8**, and **`/feature-end`** only after **20.8**, not immediately after **20.6**.
2. Fix or tombstone **broken** references to **`architecture_alignment_closeout_master_plan_20260403.plan.md`** so agents are not sent to a non-existent path without explanation.
3. Add short **warning/tombstone** blocks where stale planning still implies the old close-out sequence (at minimum: **`phase-20.6-planning.md`**, **`session-20.6.4-handoff.md`**, and key lines in **`session-20.6.4-log.md`** if they remain the canonical “what we did” entry point).

## Files
- `feature-domain-architecture-alignment-guide.md` — ladder table, sequencing, master-plan link / footnote
- `feature-domain-architecture-alignment-handoff.md` — **Current Status** / **Next Action**
- `phases/phase-20.7-guide.md`, `phases/phase-20.7-handoff.md` — canonical sources block + link hygiene
- `phases/phase-20.8-guide.md`, `phases/phase-20.8-planning.md` — same link pattern if present
- `phases/phase-20.6-handoff.md` — ensure **Next Phase** / narrative matches extension (if still “live”)
- `sessions/session-20.6.4-handoff.md`, `sessions/session-20.6.4-log.md` — tombstone or addendum where they mandate immediate **`/feature-end`**
- `phases/phase-20.6-planning.md` — tombstone at top (archival plan doc)
- `PROJECT_PLAN.md` — Feature **20** row notes if still implying **`/feature-end`** without **20.7–20.8**

## Approach
1. **Task 20.7.1.1:** Edit **feature guide + feature handoff + phase-20.7-handoff** (and **`phase-20.6-handoff`** if needed) so **Next Action** and status lines match **20.7** → **20.8** → **`/feature-end`**. Replace broken master-plan links with “committed sequencing” wording + optional relative path only if the file is added later.
2. **Task 20.7.1.2:** Add **tombstones** / **Superseded by extension ladder** notes to **`phase-20.6-planning.md`**, **`session-20.6.4-handoff`**, **`session-20.6.4-log`** (targeted sections), and align **`phase-20.7-guide.md`** / **`phase-20.8-guide.md`** canonical bullet for the master plan.

## Checkpoint
- After **`/accepted-plan`**, run **Task 20.7.1.1** then **20.7.1.2** with **`/task-end`** per task; then **`/session-end 20.7.1`**.
- Grep the feature folder for **`/feature-end`** and confirm only **20.8** / final close-out paths use it as the immediate next step after extension work (archival text carries tombstone).

## Deliverables
[List concrete deliverables]

## Acceptance Criteria
[Define acceptance criteria]

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.7.1-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.7.1.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
