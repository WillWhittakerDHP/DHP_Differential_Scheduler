# Plan: task 8.3.2.2 — 8.3.2.2

## Contract
- **Tier:** task | **ID:** 8.3.2.2
- **Scope:** 8.3.2.2
- **Governance:** Clean — no violations detected

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Task 8.3.2.1 completed: entity CRUD, appointments, availability, property CRUD, and availability router now use Joi. Remaining routes (business/calendar/wizard settings, admin-metadata, property types, entity bulk, relationship routers, forceCreate) lack Joi.

## Goal
Apply Joi validation to remaining internal POST/PUT/PATCH routes and document patterns in SECURITY_STUBS. Use existing `validateRequest(schema)` middleware; add Joi schemas per route. Return 400 with `{ error: 'Validation failed', details }` on invalid payloads.

## Files
- `server/src/middlewares/validateRequest.ts` — reuse
- `server/src/routes/schemas/` — add `businessSettingsSchemas.ts`, `calendarSettingsSchemas.ts`, `wizardSettingsSchemas.ts`, `adminMetadataSchemas.ts`, `propertyTypesSchemas.ts`, `entityBulkSchemas.ts`, `relationshipSchemas.ts`
- `server/src/routes/internal/businessSettings/businessSettingsCrudRouter.ts` — wire validateRequest
- `server/src/routes/internal/calendarSettings/calendarSettingsCrudRouter.ts` — wire validateRequest
- `server/src/routes/internal/wizardSettings/wizardSettingsCrudRouter.ts` — wire validateRequest
- `server/src/routes/internal/admin-metadata/adminMetadataCrudRouter.ts` — wire validateRequest
- `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataCrudRouter.ts` — wire validateRequest
- `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataCrudRouter.ts` — wire validateRequest
- `server/src/routes/internal/properties/propertyTypesRouter.ts` — wire validateRequest
- `server/src/routes/internal/entities/entityBulkRouter.ts` — wire validateRequest
- `server/src/routes/internal/relationships/` — annotation assignment, instance component, relationshipCrudRouter
- `server/src/routes/internal/appointments/forceCreateRouter.ts` — wire validateRequest (admin-only)
- `server/docs/SECURITY_STUBS.md` — add Request validation section: patterns, schema inventory by route, error response shape

## Approach
1. **Create Joi schemas** in `server/src/routes/schemas/` for each route family:
   - `businessSettingsSchemas`: POST/PUT/PATCH body (setting_key, setting_value); validate setting_value shape per key.
   - `calendarSettingsSchemas`: PUT body (setting_value object).
   - `wizardSettingsSchemas`: PUT body (setting_value object).
   - `adminMetadataSchemas`: POST body (fieldKey, dataType, label, visibility, layout, displayOrder, etc.).
   - `propertyTypesSchemas`: POST (blockInstanceId), PATCH/PUT (blockInstanceIds or updates).
   - `entityBulkSchemas`: PATCH order_index body, PATCH bulk body.
   - `relationshipSchemas`: annotation assignment PATCH, instance component PATCH, relationship CRUD POST.
2. **Wire middleware** on each route: `validateRequest(schema)` before handler. For createCrudRouter-based routes, add `validateRequest: joiValidateRequest(schema)` to config.
3. **Keep domain validators** where they add business logic (e.g. validateEntityType, validateSettingKey); Joi runs first to reject malformed input.
4. **Expand SECURITY_STUBS** with "Request validation" section: middleware usage, schema-by-route table, error response `{ error, details }`, and migration notes for future routes.

## Checkpoint
- All remaining internal POST/PUT/PATCH routes have Joi validation wired
- Invalid payloads return 400 with `{ error: 'Validation failed', details }`
- SECURITY_STUBS documents validation patterns and schema inventory
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.3.2-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.3.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
