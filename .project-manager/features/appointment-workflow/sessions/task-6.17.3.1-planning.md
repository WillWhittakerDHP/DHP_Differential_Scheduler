# Plan: task 6.17.3.1 — 6.17.3.1

## Contract
- **Tier:** task | **ID:** 6.17.3.1
- **Scope:** 6.17.3.1
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
- [ ] #### Task 6.17.3.1: Delete-contract client API + URL helpers **Goal:** Typed HTTP helpers for preflight/resolve/finalize + URL builders **Files:** `client/src/utils/api/entityDeleteContractApi.ts` (new), `client/src/utils/api/entityApi.ts` (extend)

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Server **6.17.2** implements real preflight/resolve/finalize for at least **`part_shape`**. Without a shared client orchestration layer, **6.17.4** would duplicate URL construction, token handling, and step logic across list and card.
- **Domain boundaries:** **Admin client** only (`client/src/composables/admin/`, `components/admin/`, `utils/admin/`). **S… _(truncated)_

## Story
**This task adds** typed client HTTP helpers for the three delete-contract endpoints (preflight, resolve, finalize) and matching URL builders **because** the composable (6.17.3.2) and wiring (6.17.4) need a single, tested source of URL paths and typed request/response calls — no raw `apiClient.get`/`post` with inline strings scattered across callers.

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

- **Paths reviewed:**
  - `client/src/utils/api/entityApi.ts` — existing URL builders (`getEntityByIdEndpoint`); re-exported via `apiExportBundleA` → `index.ts`.
  - `client/src/utils/api/apiClientCore.ts` — axios instance; baseURL `/api/v1/internal`; CSRF auto-attached for mutating methods; `withCredentials: true`.
  - `shared/types/adminDeleteDependency.ts` — all request/response DTOs, `DeleteContractErrorCode`, `DeleteDependencyPolicy`.
  - `server/src/routes/internal/entities/entityDeleteContractResponse.ts` — server error shape: `{ error, code, details?, id? }`.
  - `server/src/routes/internal/entities/entityConstants.ts` → `ENTITY_DELETE_ROUTE_SEGMENTS` (`delete-preflight`, `delete-resolve`, `delete-finalize`).
  - `client/src/composables/useApiErrorMessage.ts` / `client/src/utils/api/axiosErrorMessage.ts` — existing error extraction pattern.
- **Patterns / call sites:** `apiClient.get(url)` / `apiClient.post(url, body)` returning `AxiosResponse`; callers unwrap `.data`. `getEntityByIdEndpoint(key, id)` is the canonical path builder. Error handling: `getApiErrorMessage` for human strings; structured `code` field from server for machine use.
- **Gaps / unknowns:** Exact HTTP status codes the server returns for each error code (mapped in `entityDeleteContractFacade` / `entityDeleteContractResponse`). The client helper should expose the raw `code` field when present for composable branching, not only the human message.

## Analysis
- **Problem / why now:** Without a shared API module, the composable (6.17.3.2) and future callers (6.17.4) would inline URL construction and response parsing. Centralizing early means callers get type safety and error classification for free.
- **Domain:** Client admin utilities only (`client/src/utils/api/`). Imports from `@shared/types/adminDeleteDependency` (read-only). No server changes.
- **Patterns:** Follow `entityApi.ts` style for URL builders (plain string returns). Follow `apiClientCore` patterns for actual HTTP calls. Structured error extraction parallels `getApiErrorMessage` but adds a `code?: DeleteContractErrorCode` field for machine branching.
- **Risks:** None significant — pure utility file with no reactivity or side effects. The one concern is aligning error body shape with what the server actually sends (`sendDeleteContractError`).
- **Alternative considered:** Extend `entityApi.ts` directly. Rejected: that file is re-exported through the bundle and is currently pure URL builders — adding async I/O would change its character. A sibling file `entityDeleteContractApi.ts` keeps separation clean while sharing the same `utils/api/` home.

## Design

### 1. URL builders (in `entityApi.ts`)
Add three functions next to existing builders:
- `getDeletePreflightEndpoint(entityKey, id)` → `/entities/${entityKey}/${id}/delete-preflight`
- `getDeleteResolveEndpoint(entityKey, id)` → `/entities/${entityKey}/${id}/delete-resolve`
- `getDeleteFinalizeEndpoint(entityKey, id)` → `/entities/${entityKey}/${id}/delete-finalize`

Segment strings match `ENTITY_DELETE_ROUTE_SEGMENTS` on server; hardcoded here because the client cannot import server code.

### 2. API functions (new `entityDeleteContractApi.ts`)

```typescript
import apiClient from './apiClientCore'
import { getDeletePreflightEndpoint, getDeleteResolveEndpoint, getDeleteFinalizeEndpoint } from './entityApi'
import type { DeletePreflightResponse, DeleteResolveRequest, DeleteResolveResponse, DeleteFinalizeRequest, DeleteFinalizeResponse, DeleteContractErrorCode } from '@shared/types/adminDeleteDependency'

export interface DeleteContractApiError {
  message: string
  code?: DeleteContractErrorCode
  details?: string
  httpStatus?: number
}

function extractDeleteContractError(error: unknown): DeleteContractApiError { ... }

export async function fetchDeletePreflight(entityKey: string, entityId: string): Promise<DeletePreflightResponse> { ... }
export async function postDeleteResolve(entityKey: string, entityId: string, body: DeleteResolveRequest): Promise<DeleteResolveResponse> { ... }
export async function postDeleteFinalize(entityKey: string, entityId: string, body: DeleteFinalizeRequest): Promise<DeleteFinalizeResponse> { ... }
```

Each function: calls apiClient, unwraps `.data`, returns typed body. On error: wraps via `extractDeleteContractError`, throws `DeleteContractApiError` (or rethrows with enriched shape) so the composable can branch on `code`.

### 3. Re-export
Add `export * from './entityDeleteContractApi'` in `apiExportBundleA.ts` so callers can import from `@/utils/api`.

## Goal
Add **typed client HTTP helpers** for the three delete-contract endpoints (preflight, resolve, finalize) and matching URL builders — this is **task 6.17.3.1 only** (API layer, no Vue reactivity).

## Files
- **Edit:** `client/src/utils/api/entityApi.ts` — add three URL builders.
- **New:** `client/src/utils/api/entityDeleteContractApi.ts` — three async functions + `DeleteContractApiError` + `extractDeleteContractError`.
- **Edit:** `client/src/utils/api/apiExportBundleA.ts` — re-export new module.

## Approach
1. Add URL builder functions to `entityApi.ts` matching `ENTITY_DELETE_ROUTE_SEGMENTS`.
2. Create `entityDeleteContractApi.ts` with typed async functions (import `apiClient`, unwrap `.data`, throw structured errors).
3. Re-export from bundle so callers can use `import { fetchDeletePreflight } from '@/utils/api'`.

## Checkpoint
- All three functions compile, are typed against `@shared/types/adminDeleteDependency`, and follow project conventions.
- `extractDeleteContractError` returns structured `{ message, code?, details?, httpStatus? }`.
- Lint passes on touched files; app starts.

## Deliverables
- `getDeletePreflightEndpoint`, `getDeleteResolveEndpoint`, `getDeleteFinalizeEndpoint` in `entityApi.ts`.
- `fetchDeletePreflight`, `postDeleteResolve`, `postDeleteFinalize` in `entityDeleteContractApi.ts`.
- `DeleteContractApiError` interface + `extractDeleteContractError` helper.
- Re-export in `apiExportBundleA.ts`.

## Acceptance Criteria
- [ ] URL builders return correct paths matching server `ENTITY_DELETE_ROUTE_SEGMENTS`.
- [ ] API functions are typed: return `Promise<DeletePreflightResponse>` / `Promise<DeleteResolveResponse>` / `Promise<DeleteFinalizeResponse>`.
- [ ] `extractDeleteContractError` reads `code`, `details`, `error` from axios error response body without swallowing.
- [ ] No Vue reactivity (pure async utils).
- [ ] Lint passes on all touched files.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.17.3-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
