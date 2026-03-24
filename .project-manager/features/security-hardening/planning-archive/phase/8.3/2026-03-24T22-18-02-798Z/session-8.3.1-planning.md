<!-- harness-planning-rollup tier=session id=8.3.1 consolidatedAt=2026-03-24T22:18:02.783Z -->

# Consolidated planning: session 8.3.1

## Session 8.3.1 (parent)

## Goal

Add Joi and create validation middleware or helper pattern. Wire validation to one sample internal route as proof of concept. Session 8.3.2 will apply validation across internal routes.

## Files

- `server/package.json` — add Joi
- `server/src/middlewares/validateRequest.ts` — validation middleware or helper
- `server/src/routes/internal/` — wire validation to one sample POST route
- `server/docs/SECURITY_STUBS.md` — document validation pattern (brief)

## Approach

1. Install Joi. 2. Create `validateRequest(schema)` middleware that validates `req.body` against a Joi schema; on failure, return 400 with validation errors. 3. Wire to one sample internal route (e.g. entities POST or appointments POST) as proof of concept. 4. Add brief "Request validation" section to SECURITY_STUBS.

## Checkpoint

- Joi installed; validateRequest middleware in place
- Sample route validated; invalid payload returns 400 with error details
- SECURITY_STUBS documents validation pattern

---

## Task 8.3.1.2 (source: task-8.3.1.2-planning.md)

### Goal

Wire `validateRequest` to one sample internal POST route as proof of concept; add brief "Request validation" section to SECURITY_STUBS.md. Session 8.3.2 will apply validation across internal routes.

### Files

- `server/src/routes/internal/` — wire `validateRequest(schema)` to one sample POST route
- `server/docs/SECURITY_STUBS.md` — add "Request validation" section documenting the pattern

### Approach

1. Pick a sample internal POST route (e.g. entities POST or appointments POST). 2. Define a Joi schema for its body. 3. Apply `validateRequest(schema)` middleware before the route handler. 4. Add a brief "Request validation" section to SECURITY_STUBS describing the pattern (middleware usage, error shape, how to verify). Joi and validateRequest already exist from 8.3.1.1.

### Checkpoint

- Sample route returns 400 on invalid payload with `{ error: 'Validation failed', details: [...] }`
- SECURITY_STUBS documents the validation pattern

---

## Task 8.3.1.1 (source: task-8.3.1.1-planning.md)

### Goal

Install Joi and create `validateRequest(schema)` middleware that validates `req.body` against a Joi schema; on failure return 400 with validation error details. Task 8.3.1.2 will wire it to a sample route.

### Files

- `server/package.json` — add Joi dependency
- `server/src/middlewares/validateRequest.ts` — new: validateRequest(schema) middleware

### Approach

1. Add Joi to server dependencies. 2. Create validateRequest.ts: export function `validateRequest(schema: Joi.ObjectSchema)` that returns Express middleware. Middleware: run `schema.validate(req.body, { abortEarly: false })`; on error, `res.status(400).json({ error: 'Validation failed', details: error.details })` and `next()` is not called; on success, `next()`. 3. Use Joi types for schema param; explicit return type on exported function.

### Checkpoint

- Joi installed and imported
- validateRequest middleware exported; accepts schema, validates body, returns 400 with details on failure

---
