# Plan: task 6.17.1.1 — Shared admin delete dependency types (`@shared`)

## Contract
- **Tier:** task | **ID:** 6.17.1.1
- **Scope:** Add `shared/types` module for dependency-aware delete: policy union, graph DTOs, preflight/resolve/finalize payloads, structured API error codes. **No** Express routes, **no** Vue in this task.
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
Session 6.17.1 planning locked; first task is shared contracts only (see session `session-6.17.1-planning.md` decomposition table).

**Implementation (6.17.1.1):** `shared/types/adminDeleteDependency.ts` added — policy union, graph DTOs, preflight/resolve/finalize types, `DeleteContractErrorCode`, `DELETE_DEPENDENCY_POLICIES` + `isDeleteDependencyPolicy`. Client + server lint clean.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Phase 6.17 depends on a single **contract** for preflight → user resolution → finalize. Without frozen DTOs, server and client work in 6.17.2–6.17.4 will diverge.
- **Domains:** **Shared** (`shared/` / `@shared`) for cross-boundary DTOs and policy literals; **docs** for HTTP contract; **server** touch limited to **naming alignment** (constants/comments/ro… _(truncated)_

## Story

**This task adds** a single shared TypeScript module **so that** server (6.17.2) and client (6.17.3) import the **same** DTOs and policy literals for delete preflight / resolve / finalize, avoiding stringly-typed drift.

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

- **Problem:** Phase 6.17 needs a frozen contract before HTTP handlers and wizard UI.
- **Boundary:** `@shared/types` only — matches `ARCHITECTURE.md` §4 for API-shaped DTOs used by client + server.
- **Patterns:** Mirror small unions like [`shared/types/differentialRole.ts`](../../../../../shared/types/differentialRole.ts); add runtime **type guards** or `const` arrays where the server will validate JSON (optional but preferred for one shared source of policy strings).
- **Risks:** Over-modeling — keep v1 minimal: flat graph, opaque `metadata` record on nodes/edges if needed later.
- **Out of scope:** Joi/Zod here (server validates in 6.17.2); no imports from `client/` or `server/`.

## Design

**New file:** `shared/types/adminDeleteDependency.ts` (name final at implement time).

**Exports (v1):**

1. **`DeleteDependencyPolicy`** — string union, **exactly** these literals (phase guide):
   `'reassign_required' | 'safe_auto_remove' | 'confirm_bulk_remove' | 'hard_blocked' | 'allow_direct_delete'`

2. **`DELETE_DEPENDENCY_POLICIES`** — readonly tuple or array for runtime iteration/validation.

3. **Graph**
   - `DeleteDependencyNode` — at minimum: `id` (string), `kind` (e.g. `'entity' | 'relationship' | 'summary'`), `label` (optional), `entityType?`, `entityId?`, `count?`, `metadata?: Record<string, unknown>`
   - `DeleteDependencyEdge` — `id`, `fromNodeId`, `toNodeId`, `policy: DeleteDependencyPolicy`, optional `message`, `metadata?`

4. **Preflight response** — `DeletePreflightResponse`:
   - `entityType: string`, `entityId: string`
   - `nodes: DeleteDependencyNode[]`, `edges: DeleteDependencyEdge[]`
   - `canDirectDelete: boolean` (true when graph allows fast path per server rules in 6.17.2)
   - `preflightToken?: string` (opaque, for finalize correlation — optional on type for v1)
   - `blockedReasons?: string[]` (human-readable; machine codes use errors below)

5. **Resolve** — `DeleteResolveRequest` / `DeleteResolveResponse` (minimal):
   - Request: `entityType`, `entityId`, `preflightToken?`, `resolutions: DeleteResolutionAction[]`
   - `DeleteResolutionAction` — discriminated union, e.g. `{ type: 'reassign'; edgeId: string; targetEntityId: string }` | `{ type: 'confirm_bulk_remove'; edgeId: string }` | `{ type: 'noop' }` — extend in 6.17.2 as needed
   - Response: `applied: boolean`, `partialErrors?`, `nextPreflightToken?` (if multi-round)

6. **Finalize** — `DeleteFinalizeRequest` / `DeleteFinalizeResponse`:
   - Request: `entityType`, `entityId`, `preflightToken?` or `resolveToken?`
   - Response: `deleted: boolean`, `entityId: string`

7. **Errors** — `DeleteContractErrorCode` union (starter set, extensible):
   - e.g. `PREFLIGHT_FAILED`, `ENTITY_NOT_FOUND`, `STALE_PREFLIGHT`, `RESOLUTION_INVALID`, `HARD_BLOCKED`, `FINALIZE_CONFLICT`, `INTERNAL` — tune list during implement to align with `entityErrorHandler` patterns.

**Pseudocode (implementer)**

```ts
// adminDeleteDependency.ts
export type DeleteDependencyPolicy = 'reassign_required' | ...
export const DELETE_DEPENDENCY_POLICIES: readonly DeleteDependencyPolicy[] = [...]
export function isDeleteDependencyPolicy(x: unknown): x is DeleteDependencyPolicy { ... }

export interface DeleteDependencyNode { ... }
export interface DeleteDependencyEdge { ... }
export interface DeletePreflightResponse { ... }
// ... resolve/finalize + error code union
```

**Import path:** `@shared/types/adminDeleteDependency` (verify repo/tsconfig path alias matches other `shared/types/*` imports).

## Goal

**Explicit coding goal:** Ship **`shared/types/adminDeleteDependency.ts`** (or chosen filename) with the types above, exported for use by server and client, with **no** behavioral code beyond small type guards / const arrays if needed.

## Files

| Action | Path |
|--------|------|
| Create | `shared/types/adminDeleteDependency.ts` |
| Verify | `tsconfig` / workspace references so `server` and `client` resolve `@shared/types/...` (no edit if already generic) |

## Approach

1. Add the module with types + optional guards/constants.
2. Grep one existing `@shared/types/` consumer and match import style.
3. Run `cd server && npm run lint` and `cd client && npm run lint` (or root script if monorepo) — shared must not introduce lint issues.
4. Do **not** add HTTP or UI in this task.

## Checkpoint

- [ ] Types compile from both `server` and `client` perspective (import smoke via existing build/lint).
- [ ] Policy literals **character-for-character** match `phase-6.17-guide.md` table.
- [ ] No circular deps; file stays free of Vue/Express imports.

## Deliverables

- New **`shared/types/adminDeleteDependency.ts`** (full export surface as in Design).
- Session guide checkbox for task 6.17.1.1 updated after merge (optional in same PR).

## Acceptance Criteria

- [ ] `DeleteDependencyPolicy` includes exactly the five phase-guide categories.
- [ ] `DeletePreflightResponse`, resolve, and finalize request/response types are exported and documented in-file with short JSDoc.
- [ ] `DeleteContractErrorCode` (or equivalent) lists at least the starter codes; JSDoc notes extension in later tasks.
- [ ] Lint passes for touched workspace scope; app start not required for a types-only change but keep project habit if CI includes shared.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.17.1-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
