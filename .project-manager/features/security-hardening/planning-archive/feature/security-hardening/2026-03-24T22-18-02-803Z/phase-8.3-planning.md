<!-- harness-planning-rollup tier=phase id=8.3 consolidatedAt=2026-03-24T22:18:02.798Z -->

# Consolidated planning: phase 8.3

## Phase 8.3 (parent)

## Goal

Add request validation and input sanitization to protect against malformed or malicious POST/PUT payloads. Install Joi, create validation middleware or helpers, apply to internal API routes, and document patterns in SECURITY_STUBS.

## Files

- `server/package.json` — add Joi (or chosen validator)
- `server/src/middlewares/` — validation middleware or schema helpers
- `server/src/routes/internal/` — apply validation to POST/PUT handlers
- `server/docs/SECURITY_STUBS.md` — document validation patterns

## Approach

1. Install Joi; create reusable validation middleware or per-route schema pattern. 2. Wire validation to a sample internal route (proof of concept). 3. Apply across internal POST/PUT routes (entities, appointments, etc.) with appropriate schemas. 4. Return 400 Bad Request with validation errors when schema fails. 5. Document approach and schemas in SECURITY_STUBS.

## Checkpoint

- Validation library installed; middleware or helper pattern in place
- Sample and key internal routes validated; 400 returned on invalid payloads
- Documentation updated

---

## Session 8.3.1 (source: session-8.3.1-planning.md)

### Goal

Add Joi and create validation middleware or helper pattern. Wire validation to one sample internal route as proof of concept. Session 8.3.2 will apply validation across internal routes.

### Files

- `server/package.json` — add Joi
- `server/src/middlewares/validateRequest.ts` — validation middleware or helper
- `server/src/routes/internal/` — wire validation to one sample POST route
- `server/docs/SECURITY_STUBS.md` — document validation pattern (brief)

### Approach

1. Install Joi. 2. Create `validateRequest(schema)` middleware that validates `req.body` against a Joi schema; on failure, return 400 with validation errors. 3. Wire to one sample internal route (e.g. entities POST or appointments POST) as proof of concept. 4. Add brief "Request validation" section to SECURITY_STUBS.

### Checkpoint

- Joi installed; validateRequest middleware in place
- Sample route validated; invalid payload returns 400 with error details
- SECURITY_STUBS documents validation pattern

---

---

## Session 8.3.2 (source: session-8.3.2-planning.md)

### Goal

Apply Joi validation to internal API POST/PUT routes that lack schema-based validation. Use existing validateRequest(schema) middleware; add Joi schemas per route or route family. Return 400 with validation details on invalid payloads. Document schemas and patterns in SECURITY_STUBS.

### Files

- `server/src/middlewares/validateRequest.ts` — existing; reuse
- `server/src/routes/internal/` — entity CRUD, property, relationship, appointment, availability, business/calendar/wizard settings, admin-metadata
- `server/docs/SECURITY_STUBS.md` — expand with validation patterns and schema inventory

### Approach

1. Audit internal POST/PUT routes: identify which use Joi (auth, relationshipAnnotationAssignment, relationshipInstanceComponent) vs hand-written validators (CRUD via createCrudRouter) vs none.
2. Prioritize high-impact routes: entity CRUD, appointments, availability, property CRUD.
3. Add Joi schemas and validateRequest(schema) middleware to routes missing validation; for CRUD routes, either integrate Joi into createCrudRouter or add per-route validation.
4. Return 400 Bad Request with { error: 'Validation failed', details } on schema failure (validateRequest already does this).
5. Expand SECURITY_STUBS with validation patterns, schema inventory, and migration notes.

### Checkpoint

- Joi validation applied to entity CRUD and appointment-related internal routes
- Remaining internal POST/PUT routes validated
- SECURITY_STUBS documents validation patterns and schema inventory

---

---
