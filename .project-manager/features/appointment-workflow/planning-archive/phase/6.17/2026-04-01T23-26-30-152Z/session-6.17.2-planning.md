<!-- harness-planning-rollup tier=session id=6.17.2 consolidatedAt=2026-04-01T18:16:56.801Z -->

# Consolidated planning: session 6.17.2

## Session 6.17.2 (parent)

## Story

**This session delivers** working **Express handlers** and a **server registry** for preflight / resolve / finalize **so that** Session **6.17.3** can call real endpoints from the delete wizard without redesigning URLs or payloads.

**Estimated size:** **M–L** (routing + domain layer + transactions + at least one registrable path or documented no-op registry boundary).

---

## Analysis

- **Problem / why now:** Contracts from **6.17.1** are frozen; without server behavior, **6.17.3** cannot integrate. This session implements the **wire + domain** side only.
- **Domains:** **Server** (`server/src/routes/internal/entities/`, `server/src/services/` or co-located delete module). **Shared** is **read-only** — import existing `@shared/types/adminDeleteDependency`; avoid new shared types unless both sides will need them in the same PR (unlikely).
- **Patterns:** Match existing CRUD: `csrfProtection`, `requireAuth`, `entityTypeParamHandler`, `validateEntityId`, `handleRouteError` / `entityErrorHandler`. Reuse dependency counting patterns (e.g. `countPartShapeDeleteDependencies`) when building graphs — extract shared helpers if duplication appears.
- **Risks:** Token storage (memory vs DB), idempotency semantics, and **scope creep** into client. Keep tokens **opaque**; document TTL; defer DB-backed tokens unless required for multi-instance. **Transactions:** resolve + finalize must not leave partial state; use Sequelize transactions where multiple rows change.
- **Out of scope:** Admin UI, TanStack Query, `entityListDelete`, entity card — **6.17.3–6.17.4**. Full rollout of every entity policy — **6.17.5**; this session may register **zero or one** pilot strategy if needed to prove the pipe.

## Goal

1. **Mount** the three routes from **`delete-preflight-api-v1.md`** using **`ENTITY_DELETE_ROUTE_SEGMENTS`** (same base path as CRUD).
2. **Return** JSON bodies that satisfy **`DeletePreflightResponse`**, **`DeleteResolveResponse`**, **`DeleteFinalizeResponse`** (validate/sanitize inputs; reject malformed bodies with **`RESOLUTION_INVALID`** / **`PREFLIGHT_FAILED`** as appropriate).
3. **Introduce** a **registry** (map from admin entity key → strategy) for preflight graph, apply resolutions, and finalize delete; unregistered keys return a clear **4xx** with **`DeleteContractErrorCode`** (e.g. not supported yet) — **not** a silent 500.
4. **Extend** error responses so clients can read **`code`** where the spec calls for it (align with `entityErrorHandler` / small helper to avoid duplication).

## Files

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

---

## Task 6.17.2.1 (source: task-6.17.2.1-planning.md)

### Story

**This task wires** the three delete-contract URLs **so that** the client and integration tests hit real routes immediately; **6.17.2.2** swaps stub responses for registry-backed graphs without changing paths or middleware.

---

### Analysis

- **Problem / why now:** Contracts from **6.17.1** are frozen; without server behavior, **6.17.3** cannot integrate. This session implements the **wire + domain** side only.
- **Domains:** **Server** (`server/src/routes/internal/entities/`, `server/src/services/` or co-located delete module). **Shared** is **read-only** — import existing `@shared/types/adminDeleteDependency`; avo… _(truncated)_

### Goal

Mount the three delete-contract routes; implement **structured error helper** + **facade stubs**; validate **`entityType`** / **`id`** consistently with CRUD; **server lint clean**.

### Files

| Action | Path |
|--------|------|
| Edit | `server/src/routes/internal/entities/entityCrudRouter.ts` — register three routes |
| Create | `server/src/routes/internal/entities/entityDeleteContractFacade.ts` (handlers / stub) |
| Create | `server/src/routes/internal/entities/entityDeleteContractResponse.ts` (optional — or inline helper next to facade) |

### Approach

1. Add **`sendDeleteContractError`** (or equivalent) using shared **`DeleteContractErrorCode`**.
2. Implement facade with explicit stub policy (documented in file header).
3. Wire routes with **`ENTITY_DELETE_ROUTE_SEGMENTS`** — no string literals for path segments.
4. **`cd server && npm run lint`**.

### Checkpoint

- [ ] `GET .../delete-preflight` and both `POST`s return JSON (never bare 404 from missing route).
- [ ] Error responses include **`code`** when using contract helper.
- [ ] No Sequelize / registry imports in facade yet (only **6.17.2.2**).

### Deliverables

- Three live routes + facade module + error helper.
- In-code comment at top of facade: “Stub until task 6.17.2.2 — registry.”

### Acceptance Criteria

- [ ] Paths match **`delete-preflight-api-v1.md`** (relative to `/api/v1/internal/entities`).
- [ ] Middleware stack matches table above.
- [ ] Shared type **`DeleteContractErrorCode`** used for **`code`** field (no ad-hoc strings).
- [ ] **`npm run lint`** passes for `server/`.

### Design

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

---

## Task 6.17.2.2 (source: task-6.17.2.2-planning.md)

### Story

**This task adds** a **strategy registry** and a **partShape** implementation **so that** preflight reflects real dependency counts, finalize can delete a **clean** part shape inside a transaction, and **6.17.3** can exercise a full HTTP loop without waiting for **6.17.5** rollout of every entity.

---

### Analysis

- **Problem / why now:** Contracts from **6.17.1** are frozen; without server behavior, **6.17.3** cannot integrate. This session implements the **wire + domain** side only.
- **Domains:** **Server** (`server/src/routes/internal/entities/`, `server/src/services/` or co-located delete module). **Shared** is **read-only** — import existing `@shared/types/adminDeleteDependency`; avo… _(truncated)_

### Goal

Ship **registry + token store + partShape strategy** and wire **`entityDeleteContractFacade`** so **partShape** supports **preflight → resolve (noop) → finalize** when there are **no** dependencies.

### Files

| Action | Path |
|--------|------|
| Create | `server/src/services/entityDelete/dependencyDeleteRegistry.ts` |
| Create | `server/src/services/entityDelete/deleteContractPreflightTokenStore.ts` |
| Create | `server/src/services/entityDelete/strategies/partShapeDependencyDeleteStrategy.ts` (or flat `partShapeDeleteDependencyStrategy.ts`) |
| Create | `server/src/services/entityDelete/dependencyDeleteStrategyTypes.ts` (interface + arg types) |
| Edit | `server/src/routes/internal/entities/entityDeleteContractFacade.ts` — delegate to registry + store; **`async`** handlers if needed |

### Approach

1. Add types + token store + registry registration for **`partShape`** only.
2. Implement **`partShape`** preflight/resolve/finalize per Design §4.
3. Refactor facade to async delegation; preserve existing body validation for unregistered keys.
4. **`cd server && npm run lint`**.

### Checkpoint

- [ ] Unregistered **`entityType`** returns JSON error with **`DeleteContractErrorCode`** (not generic 500).
- [ ] **`partShape`** with **zero** deps: preflight **`canDirectDelete: true`** + token; resolve **`applied: true`** for noop; finalize **`deleted: true`**.
- [ ] **`partShape`** with **deps**: preflight **`hard_blocked`** edge; finalize fails with structured **`code`** (409/400 per spec table).
- [ ] Finalize uses **Sequelize transaction** for the destroy path.

### Deliverables

- Registry + token store + **partShape** strategy + facade integration.
- JSDoc on token store stating **in-memory / single-process** limitation.

### Acceptance Criteria

- [ ] **`@shared/types/adminDeleteDependency`** shapes honored for success responses (field names).
- [ ] Error responses use **`sendDeleteContractError`** with valid **`DeleteContractErrorCode`**.
- [ ] No new **`shared/`** types unless client needs them in same PR (not expected).
- [ ] **`npm run lint`** (server) passes.
- [ ] **`delete-preflight-api-v1.md`** updated only if response semantics **must** change (prefer footnote errata).

### Design

### 1. `DependencyDeleteStrategy` (server-local interface)

Methods (signatures at implement time; use explicit return types):

- **`preflight(args)`** → **`Promise<DeletePreflightResponse>`** (must set **`entityType`**, **`entityId`** from args; may set **`preflightToken`** — see store)
- **`resolve(args)`** → **`Promise<DeleteResolveResponse>`**
- **`finalize(args)`** → **`Promise<DeleteFinalizeResponse>`**

`args` carry **`entityConfig`**, **`entityId`**, **`entityType`**, parsed body, validated **`preflightToken`**, Sequelize **`sequelize`** (from `app` config) for transactions.

### 2. In-memory token store (`deleteContractPreflightTokenStore.ts`)

- **`issue(record)`** → random opaque string; store **`{ entityType, entityId, canDirectDelete, issuedAt }`**.
- **`consume(token)`** → validate TTL (e.g. **15 minutes**), match **`entityType`/`entityId`** to request; return record or **`null`** (**`STALE_PREFLIGHT`**).
- **Concurrency:** single Node process assumption; comment **multi-instance gap**.

### 3. Registry (`dependencyDeleteRegistry.ts`)

- **`getStrategy(entityType: string): DependencyDeleteStrategy | undefined`**
- Register **`partShape`** / **`ENTITY_KEYS.PART_SHAPE`** pilot only in this task.

### 4. `partShape` pilot behavior

**Preflight**

- Call **`countPartShapeDeleteDependencies(entityId)`**.
- If **`totalCount === 0`**: **`nodes`**: minimal target node; **`edges: []`**; **`canDirectDelete: true`**; issue **`preflightToken`**.
- If **`totalCount > 0`**: Build **read-only** graph (target node + summary / category nodes optional); **`edges`** with policy **`hard_blocked`** and message aligned with **`ERROR_MESSAGES.PART_SHAPE_IN_USE`** intent; **`canDirectDelete: false`**; still issue token so client can correlate (finalize will reject).

**Resolve (v1)**

- If token snapshot **`canDirectDelete`**: accept **`resolutions`** that are only **`{ type: 'noop' }`** or empty array → **`applied: true`**.
- If **`!canDirectDelete`**: **`applied: false`**, **`partialErrors`** with **`HARD_BLOCKED`** (or **`RESOLUTION_INVALID`** if body requests impossible actions) — keep branches shallow; log via **`createLogger`** when rejecting.

**Finalize**

- Require valid token; if **`!canDirectDelete`**, **`FINALIZE_CONFLICT`** or **`HARD_BLOCKED`** (409) with **`code`**.
- If **`canDirectDelete`**: **`sequelize.transaction`**, inside: **re-run** **`countPartShapeDeleteDependencies`**; if **> 0**, abort with **`FINALIZE_CONFLICT`**; else **`PartShape.destroy({ where: { id: entityId }, transaction })`** (or extend **`deleteRecord`** — pick one). Return **`DeleteFinalizeResponse`** **`deleted: true`**.

### 5. Facade wiring

- After **`readEntityRouteContext`**, if **`getStrategy(entityType)`** missing → **`PREFLIGHT_FAILED`** 400 with stable message (“not registered”).
- If present → **preflight:** call **`strategy.preflight`**, then **`tokenStore.issue(...)`** and attach **`preflightToken`** to the response object (keeps strategies free of store imports). **resolve/finalize:** **`tokenStore.peek` or `consume`** per product choice (document: recommend **consume on finalize** only, **peek** on resolve if multi-step); validate **`entityType`/`entityId`** match record, then call strategy.

### 6. Optional follow-up (not required in this task)

- Extract shared **“delete entity row with part/annotation guards”** used by **`entityCrudRouter`** and finalize to one internal helper — only if it reduces duplication without risky behavior change.

---
