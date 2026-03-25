<!-- harness-planning-rollup tier=session id=8.8.1 consolidatedAt=2026-03-25T20:21:02.990Z -->

# Consolidated planning: session 8.8.1

## Session 8.8.1 (parent)

## Story

**This session delivers** Joi schemas and `validateRequest` callbacks for the 3 remaining unvalidated CRUD routers **so that** all internal mutating routes reject malformed payloads at the middleware layer, and GC-8-JOI is accurately closed.
**Estimated size:** S

---

## Analysis

**Problem:** `userCrudRouter.ts` and both CRUD instances in `propertyMappingsRouter.ts` use `createCrudRouter` without a `validateRequest` callback. Request bodies pass unsanitized to Sequelize.

**Domain:** Server-only, security domain. Admin/Config routers per ARCHITECTURE.md §2.

**Pattern to follow:** The CRUD factory `validateRequest` callback signature is `(req: Request, method: 'create' | 'update' | 'patch') => ValidationResult`. The callback uses Joi `.validate()` internally and returns `{ valid: true }` or `{ valid: false, error }`. See `betaFeedbackCrudRouter.ts` and `businessRulesCrudRouter.ts` for reference implementations.

**Joi schema placement:** New files in `server/src/routes/schemas/` — the convention is one schema file per resource domain with named exports.

**Risks:** Minimal. Adding validation to previously unvalidated routes is additive. Only malformed payloads will be newly rejected. Existing valid payloads remain unaffected because schemas use `.unknown(true)`.

**No cross-domain dependencies.** Joi `^18.0.2` already installed.

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
3. Updated `server/src/routes/internal/users/userCrudRouter.ts` — `validateRequest` callback wired
4. Updated `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` — `validateRequest` callbacks wired on both CRUD instances
5. Updated `.project-manager/GAP_CLOSURE_CHECKLIST.md` — GC-8-JOI status corrected

## Acceptance Criteria

- [ ] User POST/PUT rejects missing firstName, lastName, email, or userRole → 400
- [ ] User PATCH accepts partial body (at least one field required)
- [ ] PropertyFieldMapping POST/PUT rejects missing sourceField or targetField → 400
- [ ] PropertyFeatureMapping POST/PUT rejects missing sourceField, matchType, or blockInstanceId → 400
- [ ] Both property mapping PATCHes accept partial bodies
- [ ] `cd server && npm run lint` passes
- [ ] Server starts without errors
- [ ] GC-8-JOI checklist row updated

---

## Task 8.8.1.1 (source: task-8.8.1.1-planning.md)

### Story

**This task creates** two new Joi schema files (`userSchemas.ts`, `propertyMappingSchemas.ts`) **because** the CRUD routers for User, PropertyFieldMapping, and PropertyFeatureMapping need schemas to validate request bodies before they reach Sequelize.

---

### Analysis

**Problem:** `userCrudRouter.ts` and both CRUD instances in `propertyMappingsRouter.ts` use `createCrudRouter` without a `validateRequest` callback. Request bodies pass unsanitized to Sequelize.

**Domain:** Server-only, security domain. Admin/Config routers per ARCHITECTURE.md §2.

**Pattern to follow:** The CRUD factory `validateRequest` callback signature is `(req: Request, me… _(truncated)_

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

1. `server/src/routes/schemas/userSchemas.ts` — 3 named Joi schema exports
2. `server/src/routes/schemas/propertyMappingSchemas.ts` — 6 named Joi schema exports

### Acceptance Criteria

- [ ] `userSchemas.ts` exports `userCreateBodySchema`, `userUpdateBodySchema`, `userPatchBodySchema`
- [ ] `propertyMappingSchemas.ts` exports field-mapping and feature-mapping schemas (create/update/patch × 2 models)
- [ ] All schemas use `.unknown(true)` for forward compatibility
- [ ] Create/update schemas enforce required fields; patch schemas use `.min(1)`
- [ ] `cd server && npm run lint` passes

### Design

**File 1: `userSchemas.ts`**
- `userCreateBodySchema`: requires `firstName` (string), `lastName` (string), `email` (string, email format), `userRole` (string, valid enum values). Optional: `phone` (string, allow null/empty). `.unknown(true)`.
- `userUpdateBodySchema`: same as create (full replace semantics).
- `userPatchBodySchema`: all fields optional, `.min(1).unknown(true)`.

**File 2: `propertyMappingSchemas.ts`**
- `fieldMappingCreateBodySchema`: requires `sourceField` (string), `targetField` (string). Optional: `dataSource` (string), `valueMapping` (object, allow null), `fallbackValue` (string, allow null/empty), `active` (boolean), `notes` (string, allow null/empty). `.unknown(true)`.
- `fieldMappingUpdateBodySchema`: same as create.
- `fieldMappingPatchBodySchema`: all optional, `.min(1).unknown(true)`.
- `featureMappingCreateBodySchema`: requires `sourceField` (string), `matchType` (string), `blockInstanceId` (string UUID). Optional: `dataSource` (string), `matchValue` (string, allow null/empty), `active` (boolean), `priority` (number, integer), `notes` (string, allow null/empty). `.unknown(true)`.
- `featureMappingUpdateBodySchema`: same as create.
- `featureMappingPatchBodySchema`: all optional, `.min(1).unknown(true)`.

---

## Task 8.8.1.2 (source: task-8.8.1.2-planning.md)

### Story

**This task consolidates** property-mapping Joi schemas into `propertyMappingSchemas.ts` and **updates** GC-8-JOI **because** the branch already had `validateRequest` on users (middleware) and property mappings (CRUD callbacks); the remaining gap was duplicate schema definitions and accurate checklist documentation.

---

### Analysis

**Problem:** `userCrudRouter.ts` and both CRUD instances in `propertyMappingsRouter.ts` use `createCrudRouter` without a `validateRequest` callback. Request bodies pass unsanitized to Sequelize.

**Domain:** Server-only, security domain. Admin/Config routers per ARCHITECTURE.md §2.

**Pattern to follow:** The CRUD factory `validateRequest` callback signature is `(req: Request, me… _(truncated)_

### Goal

Add Joi-backed `validateRequest` callbacks to three CRUD router configurations that currently accept unvalidated request bodies: `userCrudRouter.ts` (User model), `propertyMappingsRouter.ts` field-mappings (PropertyFieldMapping model), and `propertyMappingsRouter.ts` feature-mappings (PropertyFeatureMapping model). Close the GC-8-JOI gap in `GAP_CLOSURE_CHECKLIST.md` accurately.

### Files

- `server/src/routes/schemas/propertyMappingSchemas.ts` — canonical Joi schemas (updated)
- `server/src/routes/internal/property-mappings/propertyMappingsValidators.ts` — import schemas from above; thin wrapper
- `server/src/routes/internal/users/userCrudRouter.ts` — no change required (already uses `validateRequest` + `userSchemas.ts`)
- `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` — no change required (already passes `validateRequest`)
- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — GC-8-JOI harness anchor + Notes

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

1. `propertyMappingSchemas.ts` — single source of truth for field/feature mapping Joi schemas
2. `propertyMappingsValidators.ts` — imports schemas; no duplicate Joi definitions
3. `GAP_CLOSURE_CHECKLIST.md` — GC-8-JOI row points to phase 8.8 / session 8.8.1

### Acceptance Criteria

- [ ] `propertyMappingsValidators` imports from `propertyMappingSchemas` only
- [ ] `cd server && npm run lint` passes
- [ ] GC-8-JOI row updated with accurate harness anchor and notes

### Design

**Consolidation:** Move canonical Joi object definitions into `server/src/routes/schemas/propertyMappingSchemas.ts` — export `fieldMappingCreateSchema`, `fieldMappingUpdatePatchSchema`, `featureMappingCreateSchema`, `featureMappingUpdatePatchSchema`, and `PROPERTY_FEATURE_MATCH_TYPES`.  
**Thin validators:** `propertyMappingsValidators.ts` imports those schemas and only runs `joiResult` + `validateFieldMappingBody` / `validateFeatureMappingBody`.  
**Checklist:** Update GC-8-JOI harness anchor to phase 8.8 / session 8.8.1 and refresh Notes.

---
