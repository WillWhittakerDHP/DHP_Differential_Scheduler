# Plan: session 6.16.3 — Integration + rename tranches

## Contract
- **Tier:** session | **ID:** 6.16.3
- **Scope:** End-to-end verification of margin + multi-minimizer scheduling; downstream inventory (persistence, calendar, API, confirmation UX); close rename/migration tranches so there is no half-renamed public API (execute migrations on **localhost** only per project rules).
- **Governance (harness snapshot):**
  - Function / component governance: clean at last session audit.
  - Composable governance: advisory — `useAvailabilitySubStepContent.ts` and `useMinimizerPartsScheduling.ts` still flagged oversized return; **do not expand** return surfaces in 6.16.3 unless a task explicitly refactors them.
  - Testing: **suspended** project-wide — no new test files; verification is manual / checklist.

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** booking, architecture, integrations (documentation)
- **Gate profile:** standard
- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Session **6.16.2** complete: multi-segment minimizer detection utilities, summed duration, labels, `useMinimizerPartsScheduling` + `useMinimizerAvailableDayKeys`, orchestrator alignment. Session **6.16.1** landed **margin** on `DifferentialRole`, `PartFinal.minimizer: 'override'`, pipeline + admin overrides. Phase guide session **6.16.3** row is the active focus.

---

## Story
**This session delivers** verified integration of margin + multi-minimizer flows and a closed book on **minimizer** rename/storage alignment **so that** phase 6.16 can complete without undocumented downstream gaps or a split public vocabulary (`moveable` vs `minimizer`).
**Estimated size:** M

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
| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Phase 6.18) |
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

## 5. Per-domain conventions

### Booking / wizard

- **Composable prefixes:** `useBooking*`, `useAvailability*`, `useWizard*`, `useAppointment*`, `useProperty*` (orchestrators such as `useAvailabilityOrchestrator`, `useBookingWizardSetup`).
- **Components:** under `components/booking/` (steps in `components/booking/steps/`).
- **Depends on** admin metadata (wizard blocks, availability rules) — document cross-domain deps in planning **Analysis**.

### Admin

- **Prefixes:** `useAdmin*`, `useEntity*`, entity CRUD around `EntityBase<GlobalEntityKey>` + `ENTITY_CONFIGS`.
- **Pattern:** Generic admin components + config objects + transformers.

### Auth

- **Emerging domain;** keep route and model changes aligned with `routes/internal/auth` and `db/models/auth`. Consumed by all domains via middleware/guards over time.

### Users / `user_role`

- **`users.user_role`** is a **small closed set** (PostgreSQL ENUM + Joi + client types). **Planned (Feature 6 Phase 6.18):** a single **`@shared`** module exports **`USER_ROLE_VALUES`** and per-role constants; server and client **import** that list — no duplicate hardcoded arrays. Product rename **`seller` → `owner`** is part of Phase 6.18 Session 6.18.1.
- **User-type block instances** (state-control shapes) drive scheduling/display semantics; **`getUserTypeBlockIdForRole`** maps **DB role** → block instance. **Session 6.18.2** adds **admin-persisted alignment** (role → `block_instance_id`) so mappings are configurable without code edits where product allows. See `features/appointment-workflow/phases/phase-6.18-guide.md`.
- **Feature 7 Enactment** exposes role to the client using the **same** shared vocabulary as the API.

### Integrations

- Prefer **dedicated services** and **external routes**; avoid mixing full-URL axios into `apiClient` call sites without reason.

### Beta

- Isolated feedback capture; keep `beta` paths grouped under composables/views/components/beta.

---

## Analysis

- **Problem / why now:** Phases 6.16.1–6.16.2 implemented storage semantics, pipeline, and multi-segment minimizer UX in code. Phase 6.16 success criteria still require **downstream honesty** (persistence, calendar, API, confirmation copy) and **rename discipline** (no mixed `moveable` / `minimizer` vocabulary in public layers). This session closes those gaps or documents phased follow-ups explicitly.
- **Cross-domain:** Booking composables ↔ server appointment/availability routes ↔ optional Google Calendar / invite documentation; admin overrides (`differentialEventRoleOverrides`) where they touch event shapes.
- **Patterns to follow:** Existing `useMinimizerPartsScheduling` / orchestrator wiring; `shared/utils/differentialRoleUtils.ts` — **no** legacy coercion from obsolete tokens; use `@shared` for API-aligned enums.
- **Risks:** `DB_HOST` remote — **do not** run migrations on shared DB from this machine; author or verify migrations only, execute on localhost. Oversized composable refactors are **out of scope** unless they block correctness.
- **Alternatives:** Full calendar implementation vs **document-first** for split events — prefer document + gap list unless product demands code in-session.

## Goal

1. **Verify** margin + multi-minimizer scheduling end-to-end in the booking wizard (happy paths + at least one edge: no silent fallback when multiple segments exist).
2. **Inventory** downstream: appointment persistence payloads, relevant internal APIs, confirmation UX strings, and calendar/invite touchpoints; **document** Google Calendar split behavior (separate events vs inline) per phase guide or file a concise gap in session log.
3. **Rename / storage tranches:** Align remaining **public** API and stored JSON with **`minimizer`** vocabulary; confirm migration `server/src/db/migrations/20260432_000049_rename_moveable_to_minimizer.mjs` scope; grep for stale **`moveable`** in user-facing or cross-boundary surfaces; update phase/session docs when tranches complete.

## Files (expected touch set)

| Area | Paths |
|------|--------|
| Booking / minimizer | `client/src/composables/booking/useMinimizerPartsScheduling.ts`, `useMinimizerAvailableDayKeys.ts`, `useAvailabilityOrchestrator*.ts`, `utils/booking/minimizer*.ts`, `types/minimizerScheduling.ts` |
| Part final / roles | `client/src/utils/booking/partFinalizer*.ts`, `enrichBlockFinalsWithDifferentialRoles*`, `shared/utils/differentialRoleUtils.ts`, `shared/types` for `DifferentialRole` / event shapes |
| Server | `server/src/db/migrations/20260432_000049_rename_moveable_to_minimizer.mjs`, models/repos/routes touching `event_shapes.differential_role`, wizard JSONB columns |
| Calendar / invites | `server/src/services/google/` (or calendar invite pipeline), relevant routes — **inventory + doc** |
| Docs | `phases/phase-6.16-guide.md` (session 6.16.3 checkbox), `session-6.16.3-log.md`, `session-6.16.3-handoff.md` when created |

## Approach

1. **Task 6.16.3.1** — Run integration verification + downstream checklist; record findings in session log; add or update a short **calendar split** note (markdown in `.project-manager` or inline in phase guide) as appropriate.
2. **Task 6.16.3.2** — Rename/storage alignment: verify migration coverage, fix any remaining boundary leaks, run **localhost** migration only if `DB_HOST` is local; lint + app start; tick phase guide success items that are truly done.

## Checkpoint

Before **session-end:** app starts; client + server lint clean for touched code; session log lists verification evidence; handoff **Next Action** filled; no silent fallback in resolver paths for multi-segment minimizer.

## Deliverables

- Checklist-style **downstream inventory** (persistence / API / UX / calendar) with **done** or **documented gap**.
- **Google Calendar / invite** behavior documented for multi-minimizer + margin (matches code or explicit gap).
- **Rename tranche** status: migration verified + stale public `moveable` eliminated **or** explicit phased notes in planning/log.
- Phase **6.16** guide session **6.16.3** row and success criteria updated where satisfied.

## Acceptance Criteria

- [ ] Wizard flow exercised with **margin** and **multi-minimizer** data; scheduling behavior matches intent (aggregate duration / labels; no silent single-segment collapse).
- [ ] Downstream inventory complete; calendar split **documented** or gap explicitly logged.
- [ ] Public API / stored JSON vocabulary consistent with **`minimizer`** tranche plan; migration path documented; **no** unauthorized migration run against remote `DB_HOST`.
- [ ] `client` + `server` lint pass for touched files; `npm run start:dev` verified for session closeout.
- [ ] Session log + handoff updated; child tasks completed via task-end cascade.

## Decomposition

- **Task 6.16.3.1:** **E2E verification + downstream inventory** — Exercise booking wizard with margin + multi-minimizer shapes; trace persistence and API surfaces; audit confirmation copy; document calendar/invite split or log gaps; update session log.
- **Task 6.16.3.2:** **Rename / migration tranches + phase closure** — Verify `20260432_000049_rename_moveable_to_minimizer.mjs` and code alignment; eliminate stale `moveable` on public boundaries; localhost migration only; lint + app start; update `phase-6.16-guide.md` / handoff as appropriate.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved (no optional large composable splits unless scoped)
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---

## Reference (read before execute — governance and inventory compliance)

- TierUp guide: `.project-manager/features/appointment-workflow/phases/phase-6.16-guide.md`
- Phase contract: `.project-manager/features/appointment-workflow/phases/phase-6.16-planning.md`
- Prior handoff: `.project-manager/features/appointment-workflow/sessions/session-6.16.2-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md`
- Workflow friction log: `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences: `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/`
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `COMPOSABLE_AUTHORING_PLAYBOOK.md`, `FUNCTION_AUTHORING_PLAYBOOK.md`, `COMPONENT_AUTHORING_PLAYBOOK.md`
- Friction reader: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`

---

## Coverage check (agent)

**If this is the goal, have we outlined enough steps to enact it?** **Yes.** **6.16.3.1** covers behavioral verification and downstream documentation; **6.16.3.2** covers storage/rename closure and phase checklist updates. Together they map to `phase-6.16-guide.md` session 6.16.3 description and phase success criteria without duplicating 6.16.1/6.16.2 implementation work.

When ready, **run `/accepted-plan`** (then **`/accepted-build`** if Gate 2 applies for this feature profile).
