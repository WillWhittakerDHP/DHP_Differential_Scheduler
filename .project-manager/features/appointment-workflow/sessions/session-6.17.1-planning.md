# Plan: session 6.17.1 — Delete dependency model + API contract

## Contract
- **Tier:** session | **ID:** 6.17.1
- **Scope:** Shared types + documented HTTP/API contract for dependency-aware delete (preflight / resolve / finalize). **No** full server handlers or client wizard in this session — those are 6.17.2+.
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
Phase 6.17 registered in feature guide and PROJECT_PLAN; scope and five-session breakdown documented in `phase-6.17-guide.md`.

## Story / epic

**This session delivers** machine-readable **contracts** (TypeScript in `shared/` + written API spec) for dependency-aware delete **so that** Session 6.17.2 can implement preflight/resolution/finalize against a stable shape, and Session 6.17.3+ can type client calls without rework.

**Estimated size:** M (mostly types + docs; small optional constants for route paths).

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

- **Problem / why now:** Phase 6.17 depends on a single **contract** for preflight → user resolution → finalize. Without frozen DTOs, server and client work in 6.17.2–6.17.4 will diverge.
- **Domains:** **Shared** (`shared/` / `@shared`) for cross-boundary DTOs and policy literals; **docs** for HTTP contract; **server** touch limited to **naming alignment** (constants/comments/route skeleton optional) — no behavioral delete logic here.
- **Patterns to follow:** `ARCHITECTURE.md` §4 — shared types only where both sides need them; reuse existing **entity key** vocabulary (`GlobalEntityKey` / `ENTITY_KEYS` style) for `entityType` fields in payloads; align error **codes** with existing `entityErrorHandler` / structured response patterns used in `entityCrudRouter`.
- **Risks:** Over-modeling the graph (start minimal: nodes, edges, policy per edge, counts); versioning — document additive-only expectation for v1.
- **Out of scope this session:** Sequelize queries, Vue wizard UI, wiring `useEntityCrud`, transactional apply — **6.17.2+**.

## Goal (session 6.17.1 only)

Introduce **versioned shared types** and a **written API contract** for:

1. **Delete preflight** — response describes blocking/related dependencies with **policy classification** per edge (`reassign_required` | `safe_auto_remove` | `confirm_bulk_remove` | `hard_blocked` | `allow_direct_delete`).
2. **Delete resolve** (optional split from finalize in spec) — request body carries user choices (reassignment targets, bulk confirm tokens).
3. **Delete finalize** — request confirms apply + **entity id**; response confirms completion or structured failure.

**Explicitly not required in 6.17.1:** working Express routes beyond optional **path constants** or commented mount plan.

## Files (this session)

| Area | Paths |
|------|--------|
| Shared types | New module under `shared/types/` (e.g. `adminDeleteDependency.ts` or split by concern) — policy union, graph DTOs, preflight/resolve/finalize bodies, **machine-readable error code** union/string brand |
| Contract doc | `.project-manager/features/appointment-workflow/` or `server/docs/` — single markdown “Delete preflight API v1” (methods, paths, examples, error table) |
| Server (optional) | `server/src/routes/internal/entities/entityConstants.ts` — route segment constants; **or** `entityCrudRouter.ts` top-of-file JSDoc listing future routes — **no** handlers unless stub `501` is explicitly chosen in task |
| Reference | `phases/phase-6.17-guide.md`, `phases/phase-6.17-planning.md`, `server/src/routes/internal/entities/entityCrudRouter.ts` (read-only for alignment) |

## Approach

1. **Types first** — Policy enum/union + dependency node/edge + preflight response envelope + resolve/finalize request/response; export via `shared` package entrypoints if the repo uses barrel files.
2. **Document HTTP** — REST shape under `internal/entities` (or sub-router): e.g. `GET|POST .../:entityType/:id/delete-preflight`, `POST .../delete-resolve`, `POST .../delete-finalize` — **exact paths in doc**; idempotency and auth noted.
3. **Align naming** — Error `code` field matches what `entityErrorHandler` can surface to clients; document mapping.
4. **Leave implementation** to 6.17.2.

## Checkpoint

- [ ] `shared` compiles; client/server can import new types without circular deps
- [ ] Contract doc is reviewable by another agent without reading implementation
- [ ] Phase guide policy table and types use **identical** category spellings

## Deliverables

1. **Shared TypeScript module(s)** exporting delete-preflight dependency model + API DTOs + error codes.
2. **Markdown API contract** (v1) with request/response examples and error catalog.
3. **Optional:** route path constants or router file comments tying contract to `entityCrudRouter` extension points.

## Acceptance criteria

- [ ] Policy categories match `phase-6.17-guide.md` table **exactly** (no synonym drift).
- [ ] Preflight response is sufficient for a wizard to render **per-edge** actions without server-specific JSON blobs.
- [ ] Finalize request explicitly references **entity type + id** and a **resolution payload** (or version token) so 6.17.2 can enforce idempotency.
- [ ] No new automated tests (project policy); `npm run lint` on touched packages if any TS/ESLint config applies to `shared/`.

## Decomposition

| Task | Outcome |
|------|---------|
| **6.17.1.1** | Add `shared/` types: `DeleteDependencyPolicy`, dependency graph types, `DeletePreflightResponse`, resolve/finalize request+response types, structured `DeleteContractErrorCode` (or equivalent); re-export if project uses barrels |
| **6.17.1.2** | Author **Delete preflight API v1** markdown (paths, methods, status codes, JSON examples, error code table); add **route constants** and/or **entityCrudRouter** header comment block linking to doc — no production delete behavior |

**Coverage check:** Two tasks cover **types + documentation + naming alignment** — enough to unlock 6.17.2 server work and 6.17.3 client typing. No gap for session scope; wizard and wiring are explicitly deferred.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
