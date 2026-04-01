# Plan: session 6.17.2 — Server preflight / resolution / finalize infrastructure

## Contract
- **Tier:** session | **ID:** 6.17.2
- **Scope:** Server-only: mount dependency-delete routes, structured errors, registry/strategy layer, transactional resolve + finalize — per `delete-preflight-api-v1.md` and `@shared/types/adminDeleteDependency`. **No** Vue wizard (6.17.3) or generic CRUD wiring (6.17.4).
- **Governance (harness snapshot):**
  - Governance Context (Session)
  - Function Governance
  - Clean — no violations detected.
  - Component Governance
  - Clean — no violations detected.
  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Return surface has 15 properties; decompose into focused composables
  - `client/src/composables/booking/useMinimizerPartsScheduling.ts` — oversized-return: 
  - … _(truncated)_

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs, architecture
- **Gate profile:** standard
- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Session **6.17.1** complete: shared DTOs, API v1 markdown, `ENTITY_DELETE_ROUTE_SEGMENTS`, router JSDoc. <!-- harness-across-ladder:start -->

## Story / epic

**This session delivers** working **Express handlers** and a **server registry** for preflight / resolve / finalize **so that** Session **6.17.3** can call real endpoints from the delete wizard without redesigning URLs or payloads.

**Estimated size:** **M–L** (routing + domain layer + transactions + at least one registrable path or documented no-op registry boundary).

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

- **Problem / why now:** Contracts from **6.17.1** are frozen; without server behavior, **6.17.3** cannot integrate. This session implements the **wire + domain** side only.
- **Domains:** **Server** (`server/src/routes/internal/entities/`, `server/src/services/` or co-located delete module). **Shared** is **read-only** — import existing `@shared/types/adminDeleteDependency`; avoid new shared types unless both sides will need them in the same PR (unlikely).
- **Patterns:** Match existing CRUD: `csrfProtection`, `requireAuth`, `entityTypeParamHandler`, `validateEntityId`, `handleRouteError` / `entityErrorHandler`. Reuse dependency counting patterns (e.g. `countPartShapeDeleteDependencies`) when building graphs — extract shared helpers if duplication appears.
- **Risks:** Token storage (memory vs DB), idempotency semantics, and **scope creep** into client. Keep tokens **opaque**; document TTL; defer DB-backed tokens unless required for multi-instance. **Transactions:** resolve + finalize must not leave partial state; use Sequelize transactions where multiple rows change.
- **Out of scope:** Admin UI, TanStack Query, `entityListDelete`, entity card — **6.17.3–6.17.4**. Full rollout of every entity policy — **6.17.5**; this session may register **zero or one** pilot strategy if needed to prove the pipe.

## Goal (session 6.17.2 only)

1. **Mount** the three routes from **`delete-preflight-api-v1.md`** using **`ENTITY_DELETE_ROUTE_SEGMENTS`** (same base path as CRUD).
2. **Return** JSON bodies that satisfy **`DeletePreflightResponse`**, **`DeleteResolveResponse`**, **`DeleteFinalizeResponse`** (validate/sanitize inputs; reject malformed bodies with **`RESOLUTION_INVALID`** / **`PREFLIGHT_FAILED`** as appropriate).
3. **Introduce** a **registry** (map from admin entity key → strategy) for preflight graph, apply resolutions, and finalize delete; unregistered keys return a clear **4xx** with **`DeleteContractErrorCode`** (e.g. not supported yet) — **not** a silent 500.
4. **Extend** error responses so clients can read **`code`** where the spec calls for it (align with `entityErrorHandler` / small helper to avoid duplication).

## Files (primary)

| Area | Paths |
|------|--------|
| Routes | `server/src/routes/internal/entities/entityCrudRouter.ts` and/or new `entityDeleteRouter.ts` mounted from `entityRouter.ts` |
| Constants / errors | `entityConstants.ts`, `entityErrorHandler.ts` (or dedicated `entityDeleteErrors.ts` if cleaner) |
| Domain | New module under `server/src/services/` or `server/src/routes/internal/entities/` — e.g. `deleteDependencyRegistry.ts`, `deleteDependencyStrategies/*` (exact names at implement time) |
| Contract reference | `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md`, `shared/types/adminDeleteDependency.ts` |

## Approach

1. **Task 6.17.2.1** — **HTTP surface:** register routes; parse `entityType` / `id`; delegate to a thin service entrypoint; implement **structured error helper** for delete contract codes; default behavior for **unregistered** entity keys (documented status + code).
2. **Task 6.17.2.2** — **Domain:** registry interface + preflight builder(s), resolve application, finalize + transaction; optional **pilot** registration for one entity key to prove end-to-end server behavior (or explicit “registry ready, strategies in 6.17.5” if product prefers — then acceptance criteria must still include **one** happy-path preflight for a stub/synthetic key — prefer real pilot when low cost).
3. Update **`delete-preflight-api-v1.md`** only if implementation reveals a **necessary** v1 correction (prefer additive errata footnote over silent drift).

## Checkpoint

- [ ] All three endpoints reachable and return JSON (no 404 from missing route).
- [ ] Responses match shared types at the field level (names, not ad-hoc aliases).
- [ ] At least one code path exercises preflight → resolve → finalize **or** documented sequential stub with explicit next task for strategies (team choice locked in **6.17.2.1** planning).
- [ ] `npm run lint` (server) clean; app starts.

## Deliverables

1. Mounted **preflight / resolve / finalize** routes with auth/csrf parity to CRUD.
2. **Registry + strategy** hooks for entity-specific dependency logic.
3. **Structured errors** including `DeleteContractErrorCode` where applicable.
4. Session guide task rows filled as work proceeds; session log / handoff at session-end.

## Acceptance criteria

- [ ] Handlers conform to **`delete-preflight-api-v1.md`** (verbs, paths, response shapes) unless the doc is explicitly amended with rationale.
- [ ] Request/response bodies align with **`@shared/types/adminDeleteDependency`**.
- [ ] No new client files required for this session’s definition of done.
- [ ] No silent catch blocks; use `createLogger` per project standards.
- [ ] Transaction boundaries documented in code comments for finalize (and resolve if multi-write).

## Decomposition

| Task | Outcome |
|------|--------|
| **6.17.2.1** | **Routes + errors:** Mount `GET/POST` delete-contract routes using `ENTITY_DELETE_ROUTE_SEGMENTS`; wire middleware stack; thin handler → service facade; helper(s) for JSON errors with `DeleteContractErrorCode`; explicit behavior for unregistered entity keys. |
| **6.17.2.2** | **Registry + transactions:** Strategy registry; preflight graph construction; apply `DeleteResolveRequest`; transactional `DeleteFinalize` calling existing delete/deleteRecord patterns where appropriate; optional pilot strategy for one admin entity key. |

**Coverage check:** *If the goal is working server infrastructure for dependency-aware delete, do these two tasks cover it?* **Yes:** (1) exposes stable HTTP + error contract; (2) holds all domain rules and DB work. Client integration and broad entity rollout are explicitly deferred to **6.17.3–6.17.5**.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.17.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
