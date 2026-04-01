# Plan: task 6.17.2.1 — Delete-contract HTTP routes + structured errors

## Contract
- **Tier:** task | **ID:** 6.17.2.1
- **Scope:** Mount `GET/POST` routes for `ENTITY_DELETE_ROUTE_SEGMENTS`; middleware aligned with entity CRUD; JSON errors carrying `DeleteContractErrorCode`; thin handlers → **`entityDeleteContractFacade`** (stub returns until **6.17.2.2** implements registry). **No** dependency graph / Sequelize transactions in this task.
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
Session **6.17.2** accepted; first task is HTTP + errors only (see **`session-6.17.2-planning.md`** decomposition).

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Contracts from **6.17.1** are frozen; without server behavior, **6.17.3** cannot integrate. This session implements the **wire + domain** side only.
- **Domains:** **Server** (`server/src/routes/internal/entities/`, `server/src/services/` or co-located delete module). **Shared** is **read-only** — import existing `@shared/types/adminDeleteDependency`; avo… _(truncated)_

## Story

**This task wires** the three delete-contract URLs **so that** the client and integration tests hit real routes immediately; **6.17.2.2** swaps stub responses for registry-backed graphs without changing paths or middleware.

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

## Codebase recon (verified)

- **`entityCrudRouter.ts`:** `router.param('entityType', entityTypeParamHandler)` then `registerEntityCrudReadRoutes` (GET list + GET by id). Mutations use **`csrfProtection`**, **`requireAuth`**; DELETE adds **`checkOwnership('entity', 'id')`**. `sendError` / `sendBadRequest` / `sendNotFound` in **`routerResponseHelpers.ts`** — today **no** `code` field on errors.
- **`entityRouter.ts`:** Mounts batch/bulk/crud sub-routers; comment notes **`router.param` is per-router** — new routes should live on **`EntityCrudRouter`** (same `Router()` instance as param) unless we duplicate `entityTypeParamHandler`.
- **`ENTITY_DELETE_ROUTE_SEGMENTS`** in **`entityConstants.ts`**: `delete-preflight`, `delete-resolve`, `delete-finalize`.
- **API v1:** `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md` — GET preflight (no body); POST resolve/finalize with JSON bodies; auth note: CSRF on POST; GET preflight **requireAuth** to match sensitive admin reads (csrf N/A for GET).

## Analysis

- **Problem:** Without mounted routes, **6.17.2.2** cannot be exercised via HTTP; clients need stable 4xx shape with **`code: DeleteContractErrorCode`**.
- **Boundary:** **Server-only**; import **`DeleteContractErrorCode`** (and response types if useful as types-only) from **`@shared/types/adminDeleteDependency`**. No new shared types unless both sides need them in the same change.
- **Patterns:** Reuse **`paramString`**, **`validateEntityId`** where appropriate; **`createLogger`** in catch paths; **`handleRouteError`** for unexpected errors, or **`sendDeleteContractError`** helper for contract-shaped failures.
- **Risks:** Route shadowing — paths are **`/:entityType/:id/<segment>`** (three segments); does not collide with **`GET /:entityType/:id`**. **`checkOwnership`** on GET preflight: align with DELETE (yes) so unprivileged users cannot probe dependency graphs.
- **Alternatives:** Separate **`entityDeleteRouter.ts`** with its own **`router.param`** — rejected for this task to avoid duplicate param wiring; add to **`entityCrudRouter`** instead.

## Design

**1. `sendDeleteContractError(res, status, { error, details?, code, id? })`**  
Small helper (new file **`entityDeleteContractResponse.ts`** or next to router) — extends existing JSON shape with optional **`code: DeleteContractErrorCode`**. Use **`HTTP_STATUS_CODES`** from **`constants/router.ts`**.

**2. Facade module `entityDeleteContractFacade.ts`** (name final at implement time)  
Exported functions:

```ts
export async function handleDeletePreflight(req: Request, res: Response): Promise<void>
export async function handleDeleteResolve(req: Request, res: Response): Promise<void>
export async function handleDeleteFinalize(req: Request, res: Response): Promise<void>
```

**Stub behavior (6.17.2.1 — locked):** After **`entityConfig`** and **`validateEntityId`** succeed:

- **Preflight:** **200** + JSON matching **`DeletePreflightResponse`**: `entityType`/`entityId` from params, `nodes: []`, `edges: []`, `canDirectDelete: false` (registry not wired yet).
- **Resolve / finalize:** **400** + **`PREFLIGHT_FAILED`** (or **`RESOLUTION_INVALID`** for malformed body) + short **`details`** — avoids implying delete succeeded until **6.17.2.2** implements registry + transactions.

**3. Routes on `entityCrudRouter`** (after `router.param`, before or after read registration — order irrelevant for path specificity)

| Method | Path pattern | Middleware |
|--------|----------------|------------|
| GET | `/:entityType/:id/${ENTITY_DELETE_ROUTE_SEGMENTS.PREFLIGHT}` | `requireAuth`, `checkOwnership('entity', 'id')` |
| POST | `/:entityType/:id/${ENTITY_DELETE_ROUTE_SEGMENTS.RESOLVE}` | `csrfProtection`, `requireAuth`, `checkOwnership` |
| POST | `/:entityType/:id/${ENTITY_DELETE_ROUTE_SEGMENTS.FINALIZE}` | same as resolve |

**4. POST bodies:** Parse JSON; if missing required fields, **`sendDeleteContractError`** with **`RESOLUTION_INVALID`** (400). Stub finalize/resolve may still return **`PREFLIGHT_FAILED`** until registry.

## Goal

Mount the three delete-contract routes; implement **structured error helper** + **facade stubs**; validate **`entityType`** / **`id`** consistently with CRUD; **server lint clean**.

## Files

| Action | Path |
|--------|------|
| Edit | `server/src/routes/internal/entities/entityCrudRouter.ts` — register three routes |
| Create | `server/src/routes/internal/entities/entityDeleteContractFacade.ts` (handlers / stub) |
| Create | `server/src/routes/internal/entities/entityDeleteContractResponse.ts` (optional — or inline helper next to facade) |

## Approach

1. Add **`sendDeleteContractError`** (or equivalent) using shared **`DeleteContractErrorCode`**.
2. Implement facade with explicit stub policy (documented in file header).
3. Wire routes with **`ENTITY_DELETE_ROUTE_SEGMENTS`** — no string literals for path segments.
4. **`cd server && npm run lint`**.

## Checkpoint

- [ ] `GET .../delete-preflight` and both `POST`s return JSON (never bare 404 from missing route).
- [ ] Error responses include **`code`** when using contract helper.
- [ ] No Sequelize / registry imports in facade yet (only **6.17.2.2**).

## Deliverables

- Three live routes + facade module + error helper.
- In-code comment at top of facade: “Stub until task 6.17.2.2 — registry.”

## Acceptance Criteria

- [ ] Paths match **`delete-preflight-api-v1.md`** (relative to `/api/v1/internal/entities`).
- [ ] Middleware stack matches table above.
- [ ] Shared type **`DeleteContractErrorCode`** used for **`code`** field (no ad-hoc strings).
- [ ] **`npm run lint`** passes for `server/`.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
