<!-- harness-planning-rollup tier=session id=6.17.1 consolidatedAt=2026-04-01T17:49:14.358Z -->

# Consolidated planning: session 6.17.1

## Session 6.17.1 (parent)

## Story

**This session delivers** machine-readable **contracts** (TypeScript in `shared/` + written API spec) for dependency-aware delete **so that** Session 6.17.2 can implement preflight/resolution/finalize against a stable shape, and Session 6.17.3+ can type client calls without rework.

**Estimated size:** M (mostly types + docs; small optional constants for route paths).

---

## Analysis

- **Problem / why now:** Phase 6.17 depends on a single **contract** for preflight → user resolution → finalize. Without frozen DTOs, server and client work in 6.17.2–6.17.4 will diverge.
- **Domains:** **Shared** (`shared/` / `@shared`) for cross-boundary DTOs and policy literals; **docs** for HTTP contract; **server** touch limited to **naming alignment** (constants/comments/route skeleton optional) — no behavioral delete logic here.
- **Patterns to follow:** `ARCHITECTURE.md` §4 — shared types only where both sides need them; reuse existing **entity key** vocabulary (`GlobalEntityKey` / `ENTITY_KEYS` style) for `entityType` fields in payloads; align error **codes** with existing `entityErrorHandler` / structured response patterns used in `entityCrudRouter`.
- **Risks:** Over-modeling the graph (start minimal: nodes, edges, policy per edge, counts); versioning — document additive-only expectation for v1.
- **Out of scope this session:** Sequelize queries, Vue wizard UI, wiring `useEntityCrud`, transactional apply — **6.17.2+**.

## Goal

Introduce **versioned shared types** and a **written API contract** for:

1. **Delete preflight** — response describes blocking/related dependencies with **policy classification** per edge (`reassign_required` | `safe_auto_remove` | `confirm_bulk_remove` | `hard_blocked` | `allow_direct_delete`).
2. **Delete resolve** (optional split from finalize in spec) — request body carries user choices (reassignment targets, bulk confirm tokens).
3. **Delete finalize** — request confirms apply + **entity id**; response confirms completion or structured failure.

**Explicitly not required in 6.17.1:** working Express routes beyond optional **path constants** or commented mount plan.

## Files

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

---

## Task 6.17.1.1 (source: task-6.17.1.1-planning.md)

### Story

**This task adds** a single shared TypeScript module **so that** server (6.17.2) and client (6.17.3) import the **same** DTOs and policy literals for delete preflight / resolve / finalize, avoiding stringly-typed drift.

---

### Analysis

- **Problem / why now:** Phase 6.17 depends on a single **contract** for preflight → user resolution → finalize. Without frozen DTOs, server and client work in 6.17.2–6.17.4 will diverge.
- **Domains:** **Shared** (`shared/` / `@shared`) for cross-boundary DTOs and policy literals; **docs** for HTTP contract; **server** touch limited to **naming alignment** (constants/comments/ro… _(truncated)_

### Goal

**Explicit coding goal:** Ship **`shared/types/adminDeleteDependency.ts`** (or chosen filename) with the types above, exported for use by server and client, with **no** behavioral code beyond small type guards / const arrays if needed.

### Files

| Action | Path |
|--------|------|
| Create | `shared/types/adminDeleteDependency.ts` |
| Verify | `tsconfig` / workspace references so `server` and `client` resolve `@shared/types/...` (no edit if already generic) |

### Approach

1. Add the module with types + optional guards/constants.
2. Grep one existing `@shared/types/` consumer and match import style.
3. Run `cd server && npm run lint` and `cd client && npm run lint` (or root script if monorepo) — shared must not introduce lint issues.
4. Do **not** add HTTP or UI in this task.

### Checkpoint

- [ ] Types compile from both `server` and `client` perspective (import smoke via existing build/lint).
- [ ] Policy literals **character-for-character** match `phase-6.17-guide.md` table.
- [ ] No circular deps; file stays free of Vue/Express imports.

### Deliverables

- New **`shared/types/adminDeleteDependency.ts`** (full export surface as in Design).
- Session guide checkbox for task 6.17.1.1 updated after merge (optional in same PR).

### Acceptance Criteria

- [ ] `DeleteDependencyPolicy` includes exactly the five phase-guide categories.
- [ ] `DeletePreflightResponse`, resolve, and finalize request/response types are exported and documented in-file with short JSDoc.
- [ ] `DeleteContractErrorCode` (or equivalent) lists at least the starter codes; JSDoc notes extension in later tasks.
- [ ] Lint passes for touched workspace scope; app start not required for a types-only change but keep project habit if CI includes shared.

### Design

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

---

## Task 6.17.1.2 (source: task-6.17.1.2-planning.md)

### Story

**This task adds** a versioned markdown contract and server-local route naming **so that** Session **6.17.2** can mount handlers without debating URLs, and the client can target stable paths. Types are already frozen in **6.17.1.1**; this task connects them to **how** the API will look on the wire.

---

### Analysis

- **Problem / why now:** Phase 6.17 depends on a single **contract** for preflight → user resolution → finalize. Without frozen DTOs, server and client work in 6.17.2–6.17.4 will diverge.
- **Domains:** **Shared** (`shared/` / `@shared`) for cross-boundary DTOs and policy literals; **docs** for HTTP contract; **server** touch limited to **naming alignment** (constants/comments/ro… _(truncated)_

### Goal

**Explicit coding goal:** Add **`docs/delete-preflight-api-v1.md`** under the appointment-workflow feature, **`ENTITY_DELETE_*` route segment constants** in `entityConstants.ts`, and a short **JSDoc** on `entityCrudRouter.ts` referencing that doc. **Do not** register new routes.

### Files

| Action | Path |
|--------|------|
| Create | `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md` |
| Edit | `server/src/routes/internal/entities/entityConstants.ts` — route segment constants |
| Edit | `server/src/routes/internal/entities/entityCrudRouter.ts` — header JSDoc / comment block only |

### Approach

1. Draft markdown: overview, auth/csrf note, three endpoints with example JSON (mirror shared interfaces field names).
2. Error table: each `DeleteContractErrorCode` → HTTP status + client guidance.
3. Add constants; run `cd server && npm run lint`.
4. No client changes in this task.

### Checkpoint

- [ ] Another agent can implement 6.17.2 using only the markdown + constants + shared types
- [ ] Documented paths match constants character-for-character
- [ ] Phase 6.17 guide policy names still match shared types (no new literals introduced)

### Deliverables

1. **`delete-preflight-api-v1.md`** with version banner, endpoints, examples, error catalog.
2. **Route segment constants** in `entityConstants.ts`.
3. **`entityCrudRouter.ts`** comment linking to the doc.

### Acceptance Criteria

- [ ] Markdown lists full paths under `/api/v1/internal/entities/...` and references `@shared/types/adminDeleteDependency` type names.
- [ ] Constants export the three segment strings; `entityCrudRouter` references the doc path (relative to repo root or feature doc path as team prefers — pick one and use consistently in comment).
- [ ] No new route registrations; server lint passes.
- [ ] Policy category names are **not** redefined in the doc (link to `phase-6.17-guide.md` or state “see shared type / phase guide”).

### Design

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

---
