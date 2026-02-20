# API versioning and breaking changes

The api-versioning audit compares the current API surface to a baseline and reports **breaking** changes (e.g. endpoints that appear removed or changed). The 47 P0 items in the audit are route-level findings, not per-file code defects.

## Intended strategy

- **Current:** Single API surface; no version prefix (e.g. `/v1/`) in use.
- **When introducing breaking changes:** Prefer one or more of:
  - Version header (e.g. `Accept: application/vnd.api+json;version=1`) or query (`?version=1`).
  - Versioned path prefix (e.g. `/v1/...`) for new major behavior.
  - Document breaking changes in changelog and maintain backward compatibility for a deprecation period where feasible.
- **Audit baseline:** Run the audit with `--accept` to update the baseline when the current route set is intentional (e.g. after a planned removal or rename).

## P0 routes (audit breaking list)

The audit currently reports these as breaking (endpoint-removed or similar). Treat as product/versioning backlog until a versioning rollout or baseline update:

- Calendar/external: `GET /events-cache`, `GET /rate-limit`, `POST /events`, `GET /`, `GET /callback`, `GET /status`, `GET /test-url`
- Maps: `GET /drive-time-cache`, `POST /clear-drive-time-cache`, `GET /autocomplete`, `GET /place-details`, `GET /session-token`, `POST /`
- Entity/CRUD: `GET /batch`, `GET /:entityType/:entityId`, `POST /:entityType/:entityId`, `DELETE /:entityType/:entityId/:fieldKey`, `DELETE /:entityType/:entityId/:relationshipKey`
- Other internal: `GET /:id/versions`, `POST /computed-data`, `GET /block/:blockInstanceId`, config, entity types, properties, relationships, etc.

Full list: see `client/.audit-reports/api-versioning-audit.md` or run `npm run audit:api-versioning` (from `client`).

## Reference

- Audit script: `client/.scripts/api-versioning-audit.mjs`
- Baseline: see audit config/baseline used by the script
