<!-- harness-planning-rollup tier=phase id=6.17 consolidatedAt=2026-04-01T23:26:30.152Z -->

# Consolidated planning: phase 6.17

## Phase 6.17 (parent)

## Story

Admins delete shapes and related catalog rows through generic CRUD. Today deletes are often **binary** and opaque when FKs or relationship rows block removal. We deliver a **dependency-aware funnel**: server explains what blocks deletion and how each edge is classified; the user resolves reassignment or confirms safe/bulk removal; server finalizes in transactions; the client refreshes global entity state — reusable across entity keys via a registry.

## Analysis

- **Domains touched:** Primarily **Admin / Config** (generic entity CRUD, metadata-driven UI, `entityCrudRouter`, relationship helpers). Secondary: **shared contracts** for preflight/finalize DTOs and policy enums. **Booking** is not in the hot path; avoid leaking booking-specific rules into the delete registry.
- **Data flow (per ARCHITECTURE.md §3):** Admin composables/components → `apiClient` → internal entity routes → services/repos/Sequelize. Delete flow must stay **short HTTP calls**: preflight GET/POST, user interaction, then resolve/finalize — not a single blocking DELETE through the wizard.
- **Type boundaries:** Policy enum + graph DTOs that both client and server need → `@shared` (or `shared/`). Wizard step state and injection-only types → `client/src/types/admin/` or co-located with composable. Server-only resolution helpers → `server/src/types` or route-local modules.
- **Risks:** (1) **Transaction scope** — partial apply if finalize fails mid-flight; need clear rollback story and idempotency expectations. (2) **Registry drift** — entity registered on client but not server (or vice versa); document single source of truth. (3) **Silent cascade** — must never remove large subtrees without explicit policy + confirmation (phase guide contract). (4) **Performance** — preflight on huge graphs; consider caps/pagination in contract if needed in later sessions.
- **Cross-phase:** **Phase 6.6** (appointment soft/hard delete) is **terminology alignment only** for this phase; 6.17 is admin generic delete, not appointment lifecycle.
- **Testing:** Suspended until Phase 3.0 — manual smoke only (admin list + card delete, policies).

## Goal

Deliver a **reusable dependency-aware delete** path for admin entities: **preflight** returns structured dependencies and policy actions; **wizard** collects reassignment/removal decisions; **resolve/finalize** applies server-side mutations and final delete in a clear transaction story; **client** invalidates generic entity cache. Replaces one-shot DELETE as the only path for supported types. **Not** a single-table hack — registry/config + typed policies (`reassign_required`, `safe_auto_remove`, `confirm_bulk_remove`, `hard_blocked`, `allow_direct_delete`).

## Files

- `phases/phase-6.17-guide.md` — canonical phase scope, sessions, success criteria
- **Client:** `client/src/composables/entityCrud/useEntityCrud.ts`, `useEntityCrudMutations.ts`, `client/src/utils/admin/entityListDelete.ts`, `client/src/composables/admin/entityCardActionsPersistence.ts`; new wizard/composable/service as designed in 6.17.3–6.17.4
- **Server:** `server/src/routes/internal/entities/entityCrudRouter.ts`; preflight/resolve/finalize handlers; relationship helpers
- **Shared (if used):** types for preflight payload, policy enum, finalize body

## Approach

1. **Contracts (6.17.1)** — Define dependency node/edge types, policy enum, preflight + finalize DTOs; document HTTP shape (separate from long-running DELETE).
2. **Server (6.17.2)** — Registry per entity key: preflight query, apply resolution, final delete; transactions; structured 4xx with machine-readable codes.
3. **Client wizard (6.17.3)** — Composable orchestrates preflight → steps → finalize; thin modal/shell.
4. **Wire (6.17.4)** — List delete + entity card + mutations call the funnel when entity is registered.
5. **Rollout (6.17.5)** — `partShape`, `blockShape`, `annotationShape` (+ related); extension doc; lint + app start.

## Checkpoint

- Preflight/finalize contracts are stable and documented
- At least one entity flows end-to-end through wizard + server
- Unsupported entities unchanged or explicitly excluded
- No silent destructive cascade; policies explicit in code + docs

## Deliverables

1. **Shared + documented API contract** for delete preflight, resolution/finalize payloads, policy categories, and structured error codes (session 6.17.1).
2. **Server infrastructure:** registry-driven preflight, transactional resolve + final delete, structured 4xx (session 6.17.2).
3. **Client:** reusable delete wizard shell + composable/service orchestrating preflight → steps → finalize + cache invalidation (session 6.17.3).
4. **Wiring:** `entityListDelete`, entity card actions, `useEntityCrud` / mutations funnel registered entities into the wizard (session 6.17.4).
5. **Rollout + docs:** `partShape`, `blockShape`, `annotationShape` policies registered; extension guide for new entities (session 6.17.5).

---

## Session 6.17.1 (source: session-6.17.1-planning.md)

### Story

**This session delivers** machine-readable **contracts** (TypeScript in `shared/` + written API spec) for dependency-aware delete **so that** Session 6.17.2 can implement preflight/resolution/finalize against a stable shape, and Session 6.17.3+ can type client calls without rework.

**Estimated size:** M (mostly types + docs; small optional constants for route paths).

---

### Analysis

- **Problem / why now:** Phase 6.17 depends on a single **contract** for preflight → user resolution → finalize. Without frozen DTOs, server and client work in 6.17.2–6.17.4 will diverge.
- **Domains:** **Shared** (`shared/` / `@shared`) for cross-boundary DTOs and policy literals; **docs** for HTTP contract; **server** touch limited to **naming alignment** (constants/comments/route skeleton optional) — no behavioral delete logic here.
- **Patterns to follow:** `ARCHITECTURE.md` §4 — shared types only where both sides need them; reuse existing **entity key** vocabulary (`GlobalEntityKey` / `ENTITY_KEYS` style) for `entityType` fields in payloads; align error **codes** with existing `entityErrorHandler` / structured response patterns used in `entityCrudRouter`.
- **Risks:** Over-modeling the graph (start minimal: nodes, edges, policy per edge, counts); versioning — document additive-only expectation for v1.
- **Out of scope this session:** Sequelize queries, Vue wizard UI, wiring `useEntityCrud`, transactional apply — **6.17.2+**.

### Goal

Introduce **versioned shared types** and a **written API contract** for:

1. **Delete preflight** — response describes blocking/related dependencies with **policy classification** per edge (`reassign_required` | `safe_auto_remove` | `confirm_bulk_remove` | `hard_blocked` | `allow_direct_delete`).
2. **Delete resolve** (optional split from finalize in spec) — request body carries user choices (reassignment targets, bulk confirm tokens).
3. **Delete finalize** — request confirms apply + **entity id**; response confirms completion or structured failure.

**Explicitly not required in 6.17.1:** working Express routes beyond optional **path constants** or commented mount plan.

### Files

| Area | Paths |
|------|--------|
| Shared types | New module under `shared/types/` (e.g. `adminDeleteDependency.ts` or split by concern) — policy union, graph DTOs, preflight/resolve/finalize bodies, **machine-readable error code** union/string brand |
| Contract doc | `.project-manager/features/appointment-workflow/` or `server/docs/` — single markdown “Delete preflight API v1” (methods, paths, examples, error table) |
| Server (optional) | `server/src/routes/internal/entities/entityConstants.ts` — route segment constants; **or** `entityCrudRouter.ts` top-of-file JSDoc listing future routes — **no** handlers unless stub `501` is explicitly chosen in task |
| Reference | `phases/phase-6.17-guide.md`, `phases/phase-6.17-planning.md`, `server/src/routes/internal/entities/entityCrudRouter.ts` (read-only for alignment) |

### Approach

1. **Types first** — Policy enum/union + dependency node/edge + preflight response envelope + resolve/finalize request/response; export via `shared` package entrypoints if the repo uses barrel files.
2. **Document HTTP** — REST shape under `internal/entities` (or sub-router): e.g. `GET|POST .../:entityType/:id/delete-preflight`, `POST .../delete-resolve`, `POST .../delete-finalize` — **exact paths in doc**; idempotency and auth noted.
3. **Align naming** — Error `code` field matches what `entityErrorHandler` can surface to clients; document mapping.
4. **Leave implementation** to 6.17.2.

### Checkpoint

- [ ] `shared` compiles; client/server can import new types without circular deps
- [ ] Contract doc is reviewable by another agent without reading implementation
- [ ] Phase guide policy table and types use **identical** category spellings

### Deliverables

1. **Shared TypeScript module(s)** exporting delete-preflight dependency model + API DTOs + error codes.
2. **Markdown API contract** (v1) with request/response examples and error catalog.
3. **Optional:** route path constants or router file comments tying contract to `entityCrudRouter` extension points.

---

---

## Session 6.17.2 (source: session-6.17.2-planning.md)

### Story

**This session delivers** working **Express handlers** and a **server registry** for preflight / resolve / finalize **so that** Session **6.17.3** can call real endpoints from the delete wizard without redesigning URLs or payloads.

**Estimated size:** **M–L** (routing + domain layer + transactions + at least one registrable path or documented no-op registry boundary).

---

### Analysis

- **Problem / why now:** Contracts from **6.17.1** are frozen; without server behavior, **6.17.3** cannot integrate. This session implements the **wire + domain** side only.
- **Domains:** **Server** (`server/src/routes/internal/entities/`, `server/src/services/` or co-located delete module). **Shared** is **read-only** — import existing `@shared/types/adminDeleteDependency`; avoid new shared types unless both sides will need them in the same PR (unlikely).
- **Patterns:** Match existing CRUD: `csrfProtection`, `requireAuth`, `entityTypeParamHandler`, `validateEntityId`, `handleRouteError` / `entityErrorHandler`. Reuse dependency counting patterns (e.g. `countPartShapeDeleteDependencies`) when building graphs — extract shared helpers if duplication appears.
- **Risks:** Token storage (memory vs DB), idempotency semantics, and **scope creep** into client. Keep tokens **opaque**; document TTL; defer DB-backed tokens unless required for multi-instance. **Transactions:** resolve + finalize must not leave partial state; use Sequelize transactions where multiple rows change.
- **Out of scope:** Admin UI, TanStack Query, `entityListDelete`, entity card — **6.17.3–6.17.4**. Full rollout of every entity policy — **6.17.5**; this session may register **zero or one** pilot strategy if needed to prove the pipe.

### Goal

1. **Mount** the three routes from **`delete-preflight-api-v1.md`** using **`ENTITY_DELETE_ROUTE_SEGMENTS`** (same base path as CRUD).
2. **Return** JSON bodies that satisfy **`DeletePreflightResponse`**, **`DeleteResolveResponse`**, **`DeleteFinalizeResponse`** (validate/sanitize inputs; reject malformed bodies with **`RESOLUTION_INVALID`** / **`PREFLIGHT_FAILED`** as appropriate).
3. **Introduce** a **registry** (map from admin entity key → strategy) for preflight graph, apply resolutions, and finalize delete; unregistered keys return a clear **4xx** with **`DeleteContractErrorCode`** (e.g. not supported yet) — **not** a silent 500.
4. **Extend** error responses so clients can read **`code`** where the spec calls for it (align with `entityErrorHandler` / small helper to avoid duplication).

### Files

| Area | Paths |
|------|--------|
| Routes | `server/src/routes/internal/entities/entityCrudRouter.ts` and/or new `entityDeleteRouter.ts` mounted from `entityRouter.ts` |
| Constants / errors | `entityConstants.ts`, `entityErrorHandler.ts` (or dedicated `entityDeleteErrors.ts` if cleaner) |
| Domain | New module under `server/src/services/` or `server/src/routes/internal/entities/` — e.g. `deleteDependencyRegistry.ts`, `deleteDependencyStrategies/*` (exact names at implement time) |
| Contract reference | `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md`, `shared/types/adminDeleteDependency.ts` |

### Approach

1. **Task 6.17.2.1** — **HTTP surface:** register routes; parse `entityType` / `id`; delegate to a thin service entrypoint; implement **structured error helper** for delete contract codes; default behavior for **unregistered** entity keys (documented status + code).
2. **Task 6.17.2.2** — **Domain:** registry interface + preflight builder(s), resolve application, finalize + transaction; optional **pilot** registration for one entity key to prove end-to-end server behavior (or explicit “registry ready, strategies in 6.17.5” if product prefers — then acceptance criteria must still include **one** happy-path preflight for a stub/synthetic key — prefer real pilot when low cost).
3. Update **`delete-preflight-api-v1.md`** only if implementation reveals a **necessary** v1 correction (prefer additive errata footnote over silent drift).

### Checkpoint

- [ ] All three endpoints reachable and return JSON (no 404 from missing route).
- [ ] Responses match shared types at the field level (names, not ad-hoc aliases).
- [ ] At least one code path exercises preflight → resolve → finalize **or** documented sequential stub with explicit next task for strategies (team choice locked in **6.17.2.1** planning).
- [ ] `npm run lint` (server) clean; app starts.

### Deliverables

1. Mounted **preflight / resolve / finalize** routes with auth/csrf parity to CRUD.
2. **Registry + strategy** hooks for entity-specific dependency logic.
3. **Structured errors** including `DeleteContractErrorCode` where applicable.
4. Session guide task rows filled as work proceeds; session log / handoff at session-end.

---

---
