<!-- harness-planning-rollup tier=session id=8.3.2 consolidatedAt=2026-03-24T22:18:02.785Z -->

# Consolidated planning: session 8.3.2

## Session 8.3.2 (parent)

## Goal

Apply Joi validation to internal API POST/PUT routes that lack schema-based validation. Use existing validateRequest(schema) middleware; add Joi schemas per route or route family. Return 400 with validation details on invalid payloads. Document schemas and patterns in SECURITY_STUBS.

## Files

- `server/src/middlewares/validateRequest.ts` — existing; reuse
- `server/src/routes/internal/` — entity CRUD, property, relationship, appointment, availability, business/calendar/wizard settings, admin-metadata
- `server/docs/SECURITY_STUBS.md` — expand with validation patterns and schema inventory

## Approach

1. Audit internal POST/PUT routes: identify which use Joi (auth, relationshipAnnotationAssignment, relationshipInstanceComponent) vs hand-written validators (CRUD via createCrudRouter) vs none.
2. Prioritize high-impact routes: entity CRUD, appointments, availability, property CRUD.
3. Add Joi schemas and validateRequest(schema) middleware to routes missing validation; for CRUD routes, either integrate Joi into createCrudRouter or add per-route validation.
4. Return 400 Bad Request with { error: 'Validation failed', details } on schema failure (validateRequest already does this).
5. Expand SECURITY_STUBS with validation patterns, schema inventory, and migration notes.

## Checkpoint

- Joi validation applied to entity CRUD and appointment-related internal routes
- Remaining internal POST/PUT routes validated
- SECURITY_STUBS documents validation patterns and schema inventory

---

## Task 8.3.2.1 (source: task-8.3.2.1-planning.md)

### Goal

Audit internal POST/PUT routes for validation coverage. Add Joi schemas and validateRequest middleware to entity CRUD, appointments, availability, and property CRUD — the high-impact routes. Return 400 with validation details on invalid payloads.

### Files

- `server/src/middlewares/validateRequest.ts` — existing; reuse
- `server/src/routes/helpers/createCrudRouter.ts` — CRUD factory; check validation integration point
- `server/src/routes/internal/entities/entityCrudRouter.ts` — entity POST/PUT/PATCH
- `server/src/routes/internal/appointments/` — appointment CRUD and force-create
- `server/src/routes/internal/availabilityRouter.ts` — POST /computed-data
- `server/src/routes/internal/properties/propertyCrudRouter.ts`, `propertyTypesRouter.ts` — property POST/PUT/PATCH

### Approach

1. Audit: List entity, appointment, availability, property routes; note createCrudRouter (hand-written ValidationResult) vs routes with no body validation.
2. For createCrudRouter routes: Either (a) add optional Joi integration to factory, or (b) add validateRequest(schema) per route before CRUD handler. Prefer (b) for minimal factory change.
3. Add Joi schemas: Define schemas per route family (e.g. entityCreateSchema, appointmentPatchSchema). Wire validateRequest(schema) before handlers.
4. Availability router: Add schema for computed-data request body; wire validateRequest.
5. Verify: Invalid payloads return 400 with `{ error: 'Validation failed', details }`.

### Checkpoint

- Entity CRUD, appointment CRUD, availability, property CRUD return 400 with Joi details on invalid POST/PUT/PATCH bodies
---

---

## Task 8.3.2.2 (source: task-8.3.2.2-planning.md)

### Goal

Apply Joi validation to remaining internal POST/PUT/PATCH routes and document patterns in SECURITY_STUBS. Use existing `validateRequest(schema)` middleware; add Joi schemas per route. Return 400 with `{ error: 'Validation failed', details }` on invalid payloads.

### Files

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

### Approach

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

### Checkpoint

- All remaining internal POST/PUT/PATCH routes have Joi validation wired
- Invalid payloads return 400 with `{ error: 'Validation failed', details }`
- SECURITY_STUBS documents validation patterns and schema inventory
---

---
