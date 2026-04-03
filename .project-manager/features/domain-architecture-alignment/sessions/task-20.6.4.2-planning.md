# Plan: task 20.6.4.2 — 20.6.4.2

## Contract
- **Tier:** task | **ID:** 20.6.4.2
- **Scope:** Phase **20.6** handoff, **session 20.6.4** handoff/guide, **PROJECT_PLAN** note, **§9.3–9.4** outcome (deferred vs complete)
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
Task **20.6.4.1** complete: **`session-20.6.4-log`** holds §**9.1**/**9.1a** + grep evidence; **`DOMAIN_REWRITE_WORKLOG`** has **Pass 6 verification**; **`session-20.6.3-handoff`** cleaned; **`ARCHITECTURE.md`** admin row updated.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Phase **20.6** execution sessions are done; without **20.6.4**, **§8.6** acceptance and ladder/handoff state stay ambiguous and **`phase-20.6-handoff.md`** misleads the next agent.
- **Boundaries:** **`.project-manager/`** docs plus optional tiny **`ARCHITECTURE.md`** / worklog edits; **no** booking or server behavior change unless a checklist failure for… _(truncated)_

## Story
**This task changes** phase + session PM artifacts and **PROJECT_PLAN** notes **because** the next human/agent step must be **`/phase-end 20.6`** then **`/feature-end`** without stale “start 20.6.1” text.

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

- **Paths reviewed:** `.project-manager/features/domain-architecture-alignment/phases/phase-20.6-handoff.md` (still lists **20.6.1** as active — **stale**); `.project-manager/PROJECT_PLAN.md` Feature Summary row **#20** = **📋 Planning** with generic notes; `session-20.6.4-log.md` exists with **20.6.4.1** evidence; **`session-20.6.4-handoff.md`** likely missing or empty — **create** in Design.
- **Patterns / call sites:** PM handoffs follow **Current Status / Next Action / Transition Context**; feature-end is **harness** command, not a code path.
- **Gaps / unknowns:** **`feature-domain-architecture-alignment-handoff.md`** may need a one-line “Pass 6 complete” pointer — **optional** if phase handoff is enough.

## Analysis
- **Problem:** **`phase-20.6-handoff.md`** and **PROJECT_PLAN** do not yet reflect that execution sessions **20.6.1–20.6.4** are done or in final closeout.
- **Boundaries:** **`.project-manager/`** only; **no** `client/` / `server/` edits.
- **§9.3–9.4:** Per session plan, **do not** replace **`DOMAIN_ARCHITECTURE_REDESIGN.md`** on disk without explicit product decision — record **deferred** with rationale (human review gate + file swap not executed in-repo this sprint).
- **Risks:** Over-editing **PROJECT_PLAN** Feature **20** narrative — **mitigation:** touch Summary table **Notes** + optional **⏳ In Progress** if aligned with repo emoji usage elsewhere.

## Design
1. **`phases/phase-20.6-handoff.md`:** Set **Phase Status** to **Ready for `/phase-end 20.6`**; **Last Completed Session** **20.6.4**; **Next Action** = run **`/phase-end 20.6`**, then **`/feature-end`** (Feature **20**); refresh **Transition Context** (sessions **20.6.1–20.6.4** summarized); keep **Across ladder** block or let harness refresh.
2. **`sessions/session-20.6.4-handoff.md`:** Create or rewrite — **Current Status** (task **20.6.4.2** complete after implement), **Next Action** **`/session-end 20.6.4`** then **`/phase-end 20.6`**; **Transition Context** points to phase handoff.
3. **`sessions/session-20.6.4-log.md`:** Append **### Task 20.6.4.2** with **§9.3–9.4** subsection: bullets checked **deferred** (redesign file replacement not performed; checklist items satisfied at narrative level only where applicable) + one sentence on **§9.3** (principle coverage lives in **FEATURE_20** v2 doc — no swap).
4. **`sessions/session-20.6.4-guide.md`:** Mark **Task 20.6.4.1** **[x]** and **20.6.4.2** **[x]** when done (match task titles from session plan).
5. **`PROJECT_PLAN.md`:** Feature row **20** — set status **⏳ In Progress** (or keep **📋 Planning** if you prefer) and **Notes** → e.g. **Pass 6 (phase 20.6) execution complete; run `/phase-end 20.6` + `/feature-end` for feature closeout.**
6. **Optional:** **`feature-domain-architecture-alignment-handoff.md`** — one short **Next Action** line if file exists and is stale.

## Goal
Finalize **PM runway** for Phase **20.6** and Feature **20**: accurate **`phase-20.6-handoff.md`**, **`session-20.6.4-handoff.md`**, session log **§9.3–9.4** statement, guide checkboxes, and **PROJECT_PLAN** alignment. **Depends on:** task **20.6.4.1** complete.

## Files
- **Edit:** `phases/phase-20.6-handoff.md`, `sessions/session-20.6.4-log.md`, `sessions/session-20.6.4-guide.md`, `.project-manager/PROJECT_PLAN.md`
- **Create/update:** `sessions/session-20.6.4-handoff.md`
- **Optional read:** `feature-domain-architecture-alignment-handoff.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md` §**9.3–9.4** (wording only)

## Approach
1. Rewrite **`phase-20.6-handoff.md`** body (status, next action, transition).
2. Append **20.6.4.2** + **§9.3–9.4** to **`session-20.6.4-log.md`**.
3. Write **`session-20.6.4-handoff.md`**.
4. Update **`session-20.6.4-guide.md`** task checkboxes.
5. Patch **`PROJECT_PLAN.md`** Feature **20** row (and optional **## Feature 20** intro sentence if one line needed).

## Checkpoint
- User runs **`/accepted-code`** → implement → **`/task-end 20.6.4.2`** → **`/session-end 20.6.4`**.

## Deliverables
- **`phase-20.6-handoff.md`** reflects **20.6.4** complete and **`/phase-end`** / **`/feature-end`** next.
- **`session-20.6.4-handoff.md`** exists with required sections.
- **`session-20.6.4-log.md`** documents **§9.3–9.4** outcome (**deferred** for file swap).
- **`session-20.6.4-guide.md`** tasks **20.6.4.1** and **20.6.4.2** checked.
- **`PROJECT_PLAN.md`** Feature **20** notes (and status if changed) match branch reality.

## Acceptance Criteria
- No stale “run **`/session-start 20.6.1`**” or “active **20.6.1**” in **`phase-20.6-handoff`**.
- **§9.3–9.4** explicitly addressed in **`session-20.6.4-log`** (not silent).
- **Next Action** chain: **`/task-end 20.6.4.2`** → **`/session-end 20.6.4`** → **`/phase-end 20.6`** → **`/feature-end`** documented in handoffs.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.6.4-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.6.4.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
