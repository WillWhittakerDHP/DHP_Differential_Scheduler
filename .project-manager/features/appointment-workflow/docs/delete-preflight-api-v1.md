# Delete preflight API — v1 (contract)

**Status:** **Implemented** — HTTP handlers ship with entity routes (Phase **6.17.2**). Per-entity behavior is registered in **`server/src/services/entityDelete/dependencyDeleteRegistry.ts`** (`DependencyDeleteStrategy`: preflight, resolve, finalize).

**Rolled-out entity types (server registry, Phase 6.17.5):** **`partShape`**, **`blockShape`**, **`annotationShape`**. Other `entityType` values return **404** from contract routes until a strategy is registered.

**Client allowlist (must match registry):** `client/src/utils/admin/dependencyDeleteContractKeys.ts` — `DEPENDENCY_DELETE_CONTRACT_ENTITY_KEYS`. List and card entry points use **`AdminEntityDeleteWizard`** when the key is listed.

**Shared types:** `@shared/types/adminDeleteDependency` (`DeletePreflightResponse`, `DeleteResolveRequest`, `DeleteResolveResponse`, `DeleteFinalizeRequest`, `DeleteFinalizeResponse`, `DeleteContractErrorCode`, `DeleteDependencyPolicy`, …).  
**Policy semantics:** See `.project-manager/features/appointment-workflow/phases/phase-6.17-guide.md` — do not introduce synonym policy strings; use the shared type literals only.

**Versioning:** v1 is **additive-only** for compatible clients unless a future version is explicitly documented.

---

## Adding a new entity key (checklist)

1. **Server — dependency counts:** Add a small module (e.g. `count*DeleteDependencies`) that returns buckets and a **`totalCount`** aligned with FK / validity tables.
2. **Server — strategy:** Implement **`DependencyDeleteStrategy`** (`preflight`, `resolve`, `finalize`) under `server/src/services/entityDelete/strategies/`, mirroring **`partShapeDependencyDeleteStrategy.ts`** for v1 noop-only resolve and transactional finalize with a re-count guard.
3. **Server — registry:** Register the strategy in **`dependencyDeleteRegistry.ts`** using the same string as CRUD **`entityType`** (`ENTITY_KEYS` / camelCase as used in routes).
4. **Client — allowlist:** Append the **`GlobalEntityKey`** to **`DEPENDENCY_DELETE_CONTRACT_ENTITY_KEYS`** and keep the **SYNC** comment pointed at **`dependencyDeleteRegistry.ts`**.
5. **Client — surfaces:** For each **list** that calls **`entityListDelete`** / **`entityList`**, pass **`contractDelete`** that opens **`AdminEntityDeleteWizard`** (see **`PartShapeList.vue`** / **`BlockShapeList.vue`**). **Entity cards** pick up the wizard automatically via **`usesDependencyDeleteContract`** in **`useEntityCardActions`** when the key is allowlisted.
6. **Server — legacy `DELETE` (optional):** If the entity already has a guard on raw **`DELETE /:entityType/:id`**, align it with the same dependency rules as preflight/finalize so one-shot delete does not bypass policy.
7. **Docs:** Update this file’s **Rolled-out entity types** line when the key ships.

---

## Base URL and auth

| Item | Value |
|------|--------|
| Base path | `/api/v1/internal/entities` |
| Mount | `server/src/routes/internal/index.ts` → `router.use('/entities', EntityRouter)` |
| Auth | Same as existing entity mutations: **`requireAuth`**, **`csrfProtection`** (and any middleware applied to sibling CRUD routes in `entityCrudRouter.ts`). |
| `entityType` | Same validation as existing CRUD (`ENTITY_KEYS` / `entityTypeParamHandler`). |
| `id` | UUID of the row targeted for delete (same as `:id` on existing `DELETE /:entityType/:id`). |

**Route segment constants (server):** `ENTITY_DELETE_ROUTE_SEGMENTS` in `server/src/routes/internal/entities/entityConstants.ts` — use these in 6.17.2 handlers to avoid path drift.

---

## Endpoints

### 1. Delete preflight

**Inspect** dependencies before delete; response is a **`DeletePreflightResponse`** graph.

| | |
|--|--|
| **Method** | `GET` |
| **Path** | `/api/v1/internal/entities/:entityType/:id/delete-preflight` |
| **Body** | None |
| **Success** | `200` — JSON body matches **`DeletePreflightResponse`** |

**Example**

`GET /api/v1/internal/entities/block_shape/550e8400-e29b-41d4-a716-446655440000/delete-preflight`

**Example response (illustrative)**

```json
{
  "entityType": "block_shape",
  "entityId": "550e8400-e29b-41d4-a716-446655440000",
  "nodes": [
    {
      "id": "n-target",
      "kind": "entity",
      "label": "Block shape",
      "entityType": "block_shape",
      "entityId": "550e8400-e29b-41d4-a716-446655440000"
    },
    {
      "id": "n-dep",
      "kind": "entity",
      "label": "Part instances",
      "count": 3
    }
  ],
  "edges": [
    {
      "id": "e1",
      "fromNodeId": "n-target",
      "toNodeId": "n-dep",
      "policy": "reassign_required",
      "message": "Reassign or remove dependent part instances before delete."
    }
  ],
  "canDirectDelete": false,
  "preflightToken": "opaque-server-token-example",
  "blockedReasons": ["Dependent records require reassignment."]
}
```

---

### 2. Delete resolve

Apply **wizard / user** resolutions (reassign, bulk confirm, noop) for edges from preflight.

| | |
|--|--|
| **Method** | `POST` |
| **Path** | `/api/v1/internal/entities/:entityType/:id/delete-resolve` |
| **Body** | JSON **`DeleteResolveRequest`** |
| **Success** | `200` — JSON **`DeleteResolveResponse`** |

**Example body**

```json
{
  "entityType": "block_shape",
  "entityId": "550e8400-e29b-41d4-a716-446655440000",
  "preflightToken": "opaque-server-token-example",
  "resolutions": [
    { "type": "reassign", "edgeId": "e1", "targetEntityId": "660e8400-e29b-41d4-a716-446655440001" },
    { "type": "noop" }
  ]
}
```

**Example response**

```json
{
  "applied": true,
  "nextPreflightToken": null
}
```

Partial failure may return `applied: false` with **`partialErrors`** (`DeleteResolvePartialError[]`: `code`, `message`, optional `edgeId`).

---

### 3. Delete finalize

**Commit** delete after preflight (and resolve if required).

| | |
|--|--|
| **Method** | `POST` |
| **Path** | `/api/v1/internal/entities/:entityType/:id/delete-finalize` |
| **Body** | JSON **`DeleteFinalizeRequest`** |
| **Success** | `200` — JSON **`DeleteFinalizeResponse`** |

**Example body**

```json
{
  "entityType": "block_shape",
  "entityId": "550e8400-e29b-41d4-a716-446655440000",
  "preflightToken": "opaque-server-token-example",
  "resolveToken": null
}
```

**Example response**

```json
{
  "deleted": true,
  "entityId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Tokens:** `preflightToken` and `resolveToken` are **opaque**, server-issued strings. Semantics and TTL are defined in **6.17.2**. Clients must not parse them.

**Idempotency:** Safe retry behavior for finalize (e.g. duplicate POST after success) is **defined in 6.17.2**; v1 clients should assume idempotency is not guaranteed until documented there.

---

## Error responses

Handlers should return JSON useful for admin UI. Align with existing entity routes where possible (`error`, `details`, optional `id`). **`DeleteContractErrorCode`** should appear as a machine-readable **`code`** field when the server supports it (may require **`entityErrorHandler`** extensions in 6.17.2).

| `DeleteContractErrorCode` | Suggested HTTP | Notes |
|---------------------------|----------------|--------|
| `ENTITY_NOT_FOUND` | `404` | Unknown `entityType`/`id` or row missing. |
| `PREFLIGHT_FAILED` | `400` or `409` | Preflight could not be built (invalid state). |
| `STALE_PREFLIGHT` | `409` | Token expired or graph changed; client should re-preflight. |
| `RESOLUTION_INVALID` | `400` | Body does not match graph / policy. |
| `HARD_BLOCKED` | `409` | Policy `hard_blocked`; delete not allowed without OOB work. |
| `FINALIZE_CONFLICT` | `409` | Concurrent change or dependency still blocks delete. |
| `INTERNAL` | `500` | Unexpected server error. |

**Example error (target shape for v1)**

```json
{
  "error": "Delete blocked",
  "details": "Preflight token is stale or invalid.",
  "code": "STALE_PREFLIGHT"
}
```

---

## Implementation pointer

- **Contract doc (this file):** `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md`
- **Router / facade:** `server/src/routes/internal/entities/entityCrudRouter.ts` and `entityDeleteContractFacade.ts` (delete-preflight, delete-resolve, delete-finalize).
- **Registry:** `server/src/services/entityDelete/dependencyDeleteRegistry.ts`
- **Constants:** `ENTITY_DELETE_ROUTE_SEGMENTS` in `entityConstants.ts`.
