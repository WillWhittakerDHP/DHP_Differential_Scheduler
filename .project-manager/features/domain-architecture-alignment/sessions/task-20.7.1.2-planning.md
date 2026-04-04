# Plan: task 20.7.1.2 — Feature & phase handoff alignment (extension ladder)

## Contract
- **Tier:** task | **ID:** 20.7.1.2
- **Scope:** Refresh **`feature-domain-architecture-alignment-handoff.md`**, **`phases/phase-20.7-handoff.md`**, and small **`feature-domain-architecture-alignment-guide.md`** tweaks so **Next Action** / status match **active Phase 20.7 / Session 20.7.1** (after **20.7.1.1**); strip template stubs. **No** tombstone grep (**20.7.1.3**).
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

**Task 20.7.1.1** complete: in-repo **`architecture-alignment-closeout-master-plan.md`** + link sweep. **This task** updates human-facing harness handoffs so they stop instructing **`/phase-start 20.7`** when phase/session work has already started.

## Parent context (session planning — Analysis excerpt)

- **Problem:** Feature and phase handoffs still read like **pre-20.7** templates (**Next Action:** run **`/phase-start 20.7`**; placeholder **Feature Summary**; **`feature/[name]`** branch).
- **Domains:** `.project-manager/features/domain-architecture-alignment/**` markdown only.
- **Dependency:** Close-out plan path is now **`./architecture-alignment-closeout-master-plan.md`** — handoffs should cite it by name, not “locked master plan” with no path.

## Story

**This task changes** feature and phase **handoff** documents (and a light **feature guide** consistency pass) **because** stale **Next Action** lines derail harness cascades after **`/session-start 20.7.1`** and **`/task-start 20.7.1.*`**.

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

Docs-only; no `client/` / `server/` / `shared/` product paths.

- **Paths reviewed:** `feature-domain-architecture-alignment-handoff.md` (still **`/phase-start 20.7`**; template **Feature Summary**; **`feature/[name]`**); `phases/phase-20.7-handoff.md` (**Phase Status:** Planned; **Next Action:** **`/phase-start 20.7`**); `feature-domain-architecture-alignment-guide.md` (**Mandatory context** says “both canonical documents” while three bullets exist); `architecture-alignment-closeout-master-plan.md` (correct link target for handoffs).
- **Patterns:** Harness **across-ladder** blocks in handoff may be stale vs **`across-ladder.json`** — prefer not to hand-edit unless obviously wrong; tier-end usually refreshes.
- **Gaps:** Exact git branch name from repo: **`feature/domain-architecture-alignment`**.

## Analysis

- **Why now:** Task **20.7.1.1** fixed links; handoffs are the remaining source of wrong cascades.
- **Risk:** Over-specifying “you are on task X” goes stale after each **`/task-end`** — prefer durable wording: “Phase **20.7** in progress; Session **20.7.1**; continue session tasks then **`/session-end`**.”

## Design

1. **Feature handoff**
   - **Last Updated:** today (ISO date).
   - **Feature Status:** In Progress — extension **20.7–20.13**; Phase **20.7** / Session **20.7.1** active (tasks **20.7.1.1** done; **20.7.1.2**–**20.7.1.3** pending unless already advanced).
   - **Current Status:** One short paragraph: pass **20.6** complete; close-out index committed; session **20.7.1** in flight.
   - **Next Action:** Point to **`session-20.7.1-guide.md`**, **`/task-start 20.7.1.3`** after this task, and **[`architecture-alignment-closeout-master-plan.md`](../architecture-alignment-closeout-master-plan.md)** — **not** **`/phase-start 20.7`**.
   - **Git Branch Status:** **`feature/domain-architecture-alignment`**, in progress (adjust merge lines to honest placeholders or remove if unknown).
   - **Feature Summary / Related Documents:** Replace **`[name]`** placeholders with **`domain-architecture-alignment`** or concise real bullets; remove lorem-style lines where possible.

2. **Phase 20.7 handoff**
   - **Phase Status:** In Progress (or Active).
   - **Next Action:** **`/session-start 20.7.1`** if not started — **else** continue **Session 20.7.1** / next task per session guide (wording that matches post-**phase-start** reality).
   - **What you need to start:** Already satisfied → reframe as “what you need **during** phase 20.7”.

3. **Feature guide**
   - **Mandatory context:** Change “**both** canonical documents” → **three** bullets (principles, redesign, close-out master plan index) or “all canonical sources in § Canonical sources above”.

## Goal

Align feature- and phase-level **handoff** narratives with **active** extension work and remove obvious template noise; add minimal **guide** wording so mandatory context matches the three canonical bullets.

## Files

- `feature-domain-architecture-alignment-handoff.md`
- `phases/phase-20.7-handoff.md`
- `feature-domain-architecture-alignment-guide.md` (§ Mandatory context only unless a one-line status clarification is needed)

## Approach

1. Edit **feature handoff** top matter and **Next Action** / **Git** / **Feature Summary** / **Related Documents** per Design.
2. Edit **phase-20.7-handoff** status and **Next Action** per Design.
3. Patch **feature guide** mandatory-context bullet(s).
4. Re-read both handoffs aloud as a harness user: would you run the wrong slash command?

## Checkpoint

- No **Next Action** in these files instructs **`/phase-start 20.7`** as the only path when work is already under **Session 20.7.1**.
- No **`feature/[name]`** or **`[List phase numbers]`** placeholders remain in **feature handoff** body.

## Deliverables

- Updated **feature** and **phase 20.7** handoffs + **feature guide** mandatory-context line.

## Acceptance Criteria

- [x] **`feature-domain-architecture-alignment-handoff.md`**: **Next Action** references continuing **Session 20.7.1** / next task and links **`architecture-alignment-closeout-master-plan.md`** by path.
- [x] **`phase-20.7-handoff.md`**: Phase reflects **in progress**; **Next Action** continues **Session 20.7.1** (no **`/phase-start 20.7`** as sole step).
- [x] **`feature-domain-architecture-alignment-guide.md`**: Mandatory context references **all canonical sources** in the guide header (three docs).
- [x] Docs-only; client **`npm run lint`** run at wrap (server lint at **`/task-end`** if you want both on record).

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [x] Lint passes (`cd client && npm run lint` — client only here)
- [x] Governance score maintained or improved (docs-only)
- [ ] Session guide task status updated (via **`/task-end`**)

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
