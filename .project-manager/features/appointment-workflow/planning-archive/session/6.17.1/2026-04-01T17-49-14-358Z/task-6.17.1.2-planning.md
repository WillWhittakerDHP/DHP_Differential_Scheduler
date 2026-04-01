# Plan: task 6.17.1.2 — Delete preflight API v1 (doc + route constants)

## Contract
- **Tier:** task | **ID:** 6.17.1.2
- **Scope:** Author **Delete preflight API v1** markdown (paths, methods, JSON examples, error table); add **route segment constants** in `entityConstants.ts` and a **JSDoc block** on `entityCrudRouter.ts` pointing to the doc. **No** new Express handlers, **no** behavior change (6.17.2 implements handlers).
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
Cascade from **6.17.1.1** complete; shared types live in `@shared/types/adminDeleteDependency`. This task locks the **HTTP surface** in prose + constants only.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Phase 6.17 depends on a single **contract** for preflight → user resolution → finalize. Without frozen DTOs, server and client work in 6.17.2–6.17.4 will diverge.
- **Domains:** **Shared** (`shared/` / `@shared`) for cross-boundary DTOs and policy literals; **docs** for HTTP contract; **server** touch limited to **naming alignment** (constants/comments/ro… _(truncated)_

## Story

**This task adds** a versioned markdown contract and server-local route naming **so that** Session **6.17.2** can mount handlers without debating URLs, and the client can target stable paths. Types are already frozen in **6.17.1.1**; this task connects them to **how** the API will look on the wire.

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

## Analysis

- **Problem:** 6.17.2 needs agreed **URLs**, **verbs**, and **error semantics** before coding handlers.
- **Boundaries:** **Docs** (`.project-manager/features/appointment-workflow/`) + **server** constants/comments only — no `@shared` changes unless a tiny re-export is explicitly needed (prefer not).
- **Patterns:** Entity routes mount at **`/api/v1/internal/entities`** (see `server/src/routes/internal/index.ts` + `entityRouter.ts`). Reuse **`entityType`** param + **`id`** UUID pattern already used by CRUD (`entityCrudRouter.ts`). Reference **`DeletePreflightResponse`**, **`DeleteResolveRequest`**, **`DeleteFinalizeRequest`**, **`DeleteContractErrorCode`** from `@shared/types/adminDeleteDependency`.
- **Risks:** Spec drift vs future implementation — doc version header **v1** and “additive-only” note. **Auth:** same as existing entity mutations (`csrfProtection`, `requireAuth`) — state in doc.
- **Alternatives:** Sub-router file `entityDeleteRouter.ts` in 6.17.2 only; this task does **not** create it.

## Design

**Base path (canonical):** `/api/v1/internal/entities`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/:entityType/:id/delete-preflight` | **GET** | Return `DeletePreflightResponse` (dependency graph + `canDirectDelete` + optional `preflightToken`). |
| `/:entityType/:id/delete-resolve` | **POST** | Body: `DeleteResolveRequest` → `DeleteResolveResponse`. |
| `/:entityType/:id/delete-finalize` | **POST** | Body: `DeleteFinalizeRequest` → `DeleteFinalizeResponse`. |

**Full paths (examples):**  
`GET /api/v1/internal/entities/block_shape/{uuid}/delete-preflight`

**Errors (v1):** Document JSON shape aligned with existing entity errors where possible: e.g. `{ error: string, details?: string, code?: DeleteContractErrorCode }` — note that **`entityErrorHandler`** may need extension in 6.17.2 to emit **`code`** consistently; table maps each `DeleteContractErrorCode` → suggested HTTP status.

**Idempotency:** Document that `preflightToken` / `resolveToken` (if used) are opaque server-issued; finalize should be safe to retry only when server documents idempotency keys (6.17.2).

**Constants:** Add `ENTITY_DELETE_ROUTE_SEGMENTS` (or similar) in `entityConstants.ts` with string literals `delete-preflight`, `delete-resolve`, `delete-finalize` — handlers in 6.17.2 import these to avoid typos.

**Router comment:** Top of `entityCrudRouter.ts` (after imports or in existing file header): block linking to **relative path** from repo root to the markdown file.

## Goal

**Explicit coding goal:** Add **`docs/delete-preflight-api-v1.md`** under the appointment-workflow feature, **`ENTITY_DELETE_*` route segment constants** in `entityConstants.ts`, and a short **JSDoc** on `entityCrudRouter.ts` referencing that doc. **Do not** register new routes.

## Files

| Action | Path |
|--------|------|
| Create | `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md` |
| Edit | `server/src/routes/internal/entities/entityConstants.ts` — route segment constants |
| Edit | `server/src/routes/internal/entities/entityCrudRouter.ts` — header JSDoc / comment block only |

## Approach

1. Draft markdown: overview, auth/csrf note, three endpoints with example JSON (mirror shared interfaces field names).
2. Error table: each `DeleteContractErrorCode` → HTTP status + client guidance.
3. Add constants; run `cd server && npm run lint`.
4. No client changes in this task.

## Checkpoint

- [ ] Another agent can implement 6.17.2 using only the markdown + constants + shared types
- [ ] Documented paths match constants character-for-character
- [ ] Phase 6.17 guide policy names still match shared types (no new literals introduced)

## Deliverables

1. **`delete-preflight-api-v1.md`** with version banner, endpoints, examples, error catalog.
2. **Route segment constants** in `entityConstants.ts`.
3. **`entityCrudRouter.ts`** comment linking to the doc.

## Acceptance Criteria

- [ ] Markdown lists full paths under `/api/v1/internal/entities/...` and references `@shared/types/adminDeleteDependency` type names.
- [ ] Constants export the three segment strings; `entityCrudRouter` references the doc path (relative to repo root or feature doc path as team prefers — pick one and use consistently in comment).
- [ ] No new route registrations; server lint passes.
- [ ] Policy category names are **not** redefined in the doc (link to `phase-6.17-guide.md` or state “see shared type / phase guide”).

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.17.1-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.17.1.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
