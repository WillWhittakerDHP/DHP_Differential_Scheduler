**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# API Versioning Audit Summary (Generated)

Generated from `client/.audit-reports/api-versioning-audit.json`.

- Breaking: **47**
- Non-breaking: **0**
- Unchanged: **0**

## Breaking changes

- `GET /events-cache` (endpoint-removed)
- `GET /rate-limit` (endpoint-removed)
- `POST /events` (endpoint-removed)
- `GET /` (endpoint-removed)
- `GET /callback` (endpoint-removed)
- `GET /status` (endpoint-removed)
- `GET /test-url` (endpoint-removed)
- `GET /drive-time-cache` (endpoint-removed)
- `POST /clear-drive-time-cache` (endpoint-removed)
- `GET /autocomplete` (endpoint-removed)
- `GET /place-details` (endpoint-removed)
- `GET /session-token` (endpoint-removed)
- `POST /` (endpoint-removed)
- `GET /batch` (endpoint-removed)
- `GET /:entityType/:entityId` (endpoint-removed)
- `POST /:entityType/:entityId` (endpoint-removed)
- `DELETE /:entityType/:entityId/:fieldKey` (endpoint-removed)
- `DELETE /:entityType/:entityId/:relationshipKey` (endpoint-removed)
- `GET /:id/versions` (endpoint-removed)
- `POST /computed-data` (endpoint-removed)
- `GET /block/:blockInstanceId` (endpoint-removed)
- `GET /:key` (endpoint-removed)
- `PUT /:key` (endpoint-removed)
- `PATCH /:key` (endpoint-removed)
- `DELETE /:key` (endpoint-removed)
- `PATCH /:entityType/order_index` (endpoint-removed)
- `PATCH /:entityType/bulk` (endpoint-removed)
- `GET /config` (endpoint-removed)
- `GET /:entityType` (endpoint-removed)
- `GET /:entityType/:id` (endpoint-removed)
- `POST /:entityType` (endpoint-removed)
- `PUT /:entityType/:id` (endpoint-removed)
- `PATCH /:entityType/:id` (endpoint-removed)
- `DELETE /:entityType/:id` (endpoint-removed)
- `GET /:id` (endpoint-removed)
- `PUT /:id` (endpoint-removed)
- `PATCH /:id` (endpoint-removed)
- `DELETE /:id` (endpoint-removed)
- `GET /:id/types` (endpoint-removed)
- `POST /:id/types` (endpoint-removed)
- `PATCH /:id/types/:typeId` (endpoint-removed)
- `DELETE /:id/types/:typeId` (endpoint-removed)
- `PUT /:id/types` (endpoint-removed)
- `PATCH /:blockInstanceId/:annotationId` (endpoint-removed)
- `GET /:relationshipType` (endpoint-removed)
- `POST /:relationshipType` (endpoint-removed)
- `DELETE /:relationshipType/:parentId/:childId` (endpoint-removed)
