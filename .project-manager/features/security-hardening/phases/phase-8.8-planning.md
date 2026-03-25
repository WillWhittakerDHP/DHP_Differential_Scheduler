<!-- harness-planning-rollup tier=phase id=8.8 consolidatedAt=2026-03-25T20:22:30.202Z -->

# Consolidated planning: phase 8.8

## Phase 8.8 (parent)

## Story

**As a** server security maintainer, **I want** Joi request body validation on all remaining unvalidated CRUD routes, **so that** malformed or malicious payloads are rejected at the middleware layer before reaching Sequelize.
**Estimated size:** S

---

## Analysis

**Problem:** Three `createCrudRouter` configurations expose POST/PUT/PATCH/DELETE without any `validateRequest` callback. Request bodies pass directly to Sequelize `model.create()` / `model.update()`. This was flagged during a code audit against the GC-8-JOI checklist item, which was prematurely marked "done."

**Why now:** GC-8-JOI's "done" status is inaccurate. The gap was discovered during a `/phase-add 8.8` preparation audit. Closing it now ensures Feature 8 (security-hardening) is genuinely complete before alpha.

**Domain boundaries:** Server-only (security domain). No client, shared, or cross-domain work. Touches the Admin/Config domain routers (users, property mappings) per `ARCHITECTURE.md` §2 Domain Map.

**Existing patterns to follow:**
1. **CRUD factory `validateRequest` callback** — `(req: Request, method: 'create' | 'update' | 'patch') => ValidationResult`. Examples: `businessRulesCrudRouter.ts`, `betaFeedbackCrudRouter.ts`. Best fit for these routers since they already use `createCrudRouter`.
2. **Joi schemas in `server/src/routes/schemas/`** — named exports, co-located by resource. The CRUD callback can use Joi internally (`.validate()`) and return `ValidationResult`.
3. **Minimal schema pattern** — `entitySchemas.ts` uses `Joi.object().min(1).unknown(true)` for dynamic-shape entities. Property mapping and user schemas can be more specific since their model fields are fixed.

**Risks:** Low. Changes are additive (adding validation where none exists). No existing behavior changes — previously valid payloads still pass; only malformed payloads are newly rejected.

**Dependencies:** None. These routers exist and are wired. Joi is already installed (`^18.0.2`).

**Alternatives considered:**
- **Joi middleware approach** (`validateRequest(schema)` from `server/src/middlewares/validateRequest.ts`): Would require restructuring the CRUD router factory call sites to inject middleware. More invasive than using the built-in `validateRequest` callback.
- **Do nothing / accept risk:** Rejected — the CRUD factory passes raw `req.body` to Sequelize without sanitization. Sequelize's own validation is type-level only (allowNull, ENUM), not shape-level.

## Goal

Add Joi-backed `validateRequest` callbacks to three CRUD router configurations that currently accept unvalidated request bodies: `userCrudRouter.ts` (User model), `propertyMappingsRouter.ts` field-mappings (PropertyFieldMapping model), and `propertyMappingsRouter.ts` feature-mappings (PropertyFeatureMapping model). Close the GC-8-JOI gap in `GAP_CLOSURE_CHECKLIST.md` accurately.

## Files

- `server/src/routes/internal/users/userCrudRouter.ts` — CRUD config; add `validateRequest` callback
- `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` — two `createCrudRouter` calls; add `validateRequest` to both
- `server/src/routes/schemas/userSchemas.ts` — **new file**: Joi schemas for User create/update/patch
- `server/src/routes/schemas/propertyMappingSchemas.ts` — **new file**: Joi schemas for PropertyFieldMapping and PropertyFeatureMapping create/update/patch
- `server/src/routes/helpers/crudRouterTypes.ts` — reference only (defines `validateRequest` callback signature)
- `server/src/routes/helpers/routerValidators.ts` — reference only (defines `ValidationResult` type)
- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — update GC-8-JOI status

## Approach

1. Create Joi schema files in `server/src/routes/schemas/` following the established pattern (named exports, one file per resource domain).
2. For each model, define schemas for `create`, `update`, and `patch` methods. `create` and `update` enforce required fields; `patch` makes all fields optional (partial update). Use `Joi.object().unknown(true)` to avoid breaking if Sequelize or the client sends extra fields (consistent with `entitySchemas.ts` pattern).
3. Wire the schemas into the existing `createCrudRouter` config via the `validateRequest: (req, method) => ValidationResult` callback. The callback selects the schema by method, calls `.validate()`, and returns `{ valid, error }`.
4. No structural changes to the CRUD factory or middleware pipeline — purely additive per-router config.
5. Run `cd server && npm run lint` after changes. Smoke-test by reviewing that the server starts without errors.

## Checkpoint

- After schema creation: Joi schema files exist and export named schemas for all three models
- After CRUD wiring: All three `createCrudRouter` calls include a `validateRequest` callback
- After lint: `cd server && npm run lint` passes with no new errors
- After smoke: `npm run start:dev` starts successfully; no runtime errors in console

## Deliverables

1. `server/src/routes/schemas/userSchemas.ts` — Joi schemas for User create/update/patch
2. `server/src/routes/schemas/propertyMappingSchemas.ts` — Joi schemas for PropertyFieldMapping and PropertyFeatureMapping create/update/patch
3. Updated `userCrudRouter.ts` with `validateRequest` callback
4. Updated `propertyMappingsRouter.ts` with `validateRequest` callbacks on both CRUD instances
5. Updated `GAP_CLOSURE_CHECKLIST.md` GC-8-JOI row: status corrected to reflect actual closure

## Acceptance Criteria

- [ ] `userCrudRouter.ts` rejects POST/PUT with missing required fields (firstName, lastName, email, userRole) → 400
- [ ] `userCrudRouter.ts` PATCH accepts partial bodies (at least one field required)
- [ ] PropertyFieldMapping CRUD rejects POST/PUT with missing required fields (sourceField, targetField) → 400
- [ ] PropertyFeatureMapping CRUD rejects POST/PUT with missing required fields (sourceField, matchType, blockInstanceId) → 400
- [ ] Both property mapping PATCHes accept partial bodies
- [ ] Server lint passes (`cd server && npm run lint`)
- [ ] Server starts without errors (`npm run start:dev`)
- [ ] GC-8-JOI checklist row updated with accurate status and notes

---

## Session 8.8.1 (source: session-8.8.1-planning.md)

### Story

**This session delivers** Joi schemas and `validateRequest` callbacks for the 3 remaining unvalidated CRUD routers **so that** all internal mutating routes reject malformed payloads at the middleware layer, and GC-8-JOI is accurately closed.
**Estimated size:** S

---

### Analysis

**Problem:** `userCrudRouter.ts` and both CRUD instances in `propertyMappingsRouter.ts` use `createCrudRouter` without a `validateRequest` callback. Request bodies pass unsanitized to Sequelize.

**Domain:** Server-only, security domain. Admin/Config routers per ARCHITECTURE.md §2.

**Pattern to follow:** The CRUD factory `validateRequest` callback signature is `(req: Request, method: 'create' | 'update' | 'patch') => ValidationResult`. The callback uses Joi `.validate()` internally and returns `{ valid: true }` or `{ valid: false, error }`. See `betaFeedbackCrudRouter.ts` and `businessRulesCrudRouter.ts` for reference implementations.

**Joi schema placement:** New files in `server/src/routes/schemas/` — the convention is one schema file per resource domain with named exports.

**Risks:** Minimal. Adding validation to previously unvalidated routes is additive. Only malformed payloads will be newly rejected. Existing valid payloads remain unaffected because schemas use `.unknown(true)`.

**No cross-domain dependencies.** Joi `^18.0.2` already installed.

### Goal

Add Joi-backed `validateRequest` callbacks to three CRUD router configurations that currently accept unvalidated request bodies: `userCrudRouter.ts` (User model), `propertyMappingsRouter.ts` field-mappings (PropertyFieldMapping model), and `propertyMappingsRouter.ts` feature-mappings (PropertyFeatureMapping model). Close the GC-8-JOI gap in `GAP_CLOSURE_CHECKLIST.md` accurately.

### Files

- `server/src/routes/internal/users/userCrudRouter.ts` — CRUD config; add `validateRequest` callback
- `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` — two `createCrudRouter` calls; add `validateRequest` to both
- `server/src/routes/schemas/userSchemas.ts` — **new file**: Joi schemas for User create/update/patch
- `server/src/routes/schemas/propertyMappingSchemas.ts` — **new file**: Joi schemas for PropertyFieldMapping and PropertyFeatureMapping create/update/patch
- `server/src/routes/helpers/crudRouterTypes.ts` — reference only (defines `validateRequest` callback signature)
- `server/src/routes/helpers/routerValidators.ts` — reference only (defines `ValidationResult` type)
- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — update GC-8-JOI status

### Approach

1. Create Joi schema files in `server/src/routes/schemas/` following the established pattern (named exports, one file per resource domain).
2. For each model, define schemas for `create`, `update`, and `patch` methods. `create` and `update` enforce required fields; `patch` makes all fields optional (partial update). Use `Joi.object().unknown(true)` to avoid breaking if Sequelize or the client sends extra fields (consistent with `entitySchemas.ts` pattern).
3. Wire the schemas into the existing `createCrudRouter` config via the `validateRequest: (req, method) => ValidationResult` callback. The callback selects the schema by method, calls `.validate()`, and returns `{ valid, error }`.
4. No structural changes to the CRUD factory or middleware pipeline — purely additive per-router config.
5. Run `cd server && npm run lint` after changes. Smoke-test by reviewing that the server starts without errors.

### Checkpoint

- After schema creation: Joi schema files exist and export named schemas for all three models
- After CRUD wiring: All three `createCrudRouter` calls include a `validateRequest` callback
- After lint: `cd server && npm run lint` passes with no new errors
- After smoke: `npm run start:dev` starts successfully; no runtime errors in console

### Deliverables

1. `server/src/routes/schemas/userSchemas.ts` — Joi schemas for User create/update/patch
2. `server/src/routes/schemas/propertyMappingSchemas.ts` — Joi schemas for PropertyFieldMapping and PropertyFeatureMapping create/update/patch
3. Updated `server/src/routes/internal/users/userCrudRouter.ts` — `validateRequest` callback wired
4. Updated `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` — `validateRequest` callbacks wired on both CRUD instances
5. Updated `.project-manager/GAP_CLOSURE_CHECKLIST.md` — GC-8-JOI status corrected

### Acceptance Criteria

- [ ] User POST/PUT rejects missing firstName, lastName, email, or userRole → 400
- [ ] User PATCH accepts partial body (at least one field required)
- [ ] PropertyFieldMapping POST/PUT rejects missing sourceField or targetField → 400
- [ ] PropertyFeatureMapping POST/PUT rejects missing sourceField, matchType, or blockInstanceId → 400
- [ ] Both property mapping PATCHes accept partial bodies
- [ ] `cd server && npm run lint` passes
- [ ] Server starts without errors
- [ ] GC-8-JOI checklist row updated

---

---
