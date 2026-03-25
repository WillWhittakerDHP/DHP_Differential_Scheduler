<!-- harness-planning-rollup tier=session id=8.5.3 consolidatedAt=2026-03-25T17:43:28.744Z -->

# Consolidated planning: session 8.5.3

## Session 8.5.3 (parent)

## Story

**This session delivers** systematic Joi validation on mutating internal routes in batch A **so that** invalid payloads fail fast with consistent 400s, CSRF/ownership ordering stays correct, and the gap-closure checklist row for this batch can be marked verified with evidence.
**Estimated size:** M

---

## Analysis

- **Problem:** Some internal `POST`/`PUT`/`PATCH` handlers may omit the shared `validateRequest` middleware or equivalent Joi validation, which weakens input guarantees and makes security/governance audits noisy.
- **Why now:** Phase 8.5 is security headers + hardening; validation is part of the same “defense in depth” thread and is explicitly scoped as session 8.5.3 in the phase guide.
- **Domains:** **Server / internal API** only for implementation. **Docs** for checklist evidence. No Vue/composable work unless a task discovers a required shared type (then follow ARCHITECTURE.md — prefer `@shared` only if both sides need it).
- **Patterns to follow:** Existing routers already import `validateRequest` from `server/src/middlewares/validateRequest.js` and co-locate `*Schema` / `*Validators` modules (see `adminMetadataCrudRouter`, `entityCrudRouter`, `calendarSettingsCrudRouter`). Preserve **middleware order**: CSRF and ownership checks must stay in the documented sequence relative to validation.
- **Risks:** Over-validating and breaking admin flows; missing multipart/streaming edge cases; diverging schema shapes from Sequelize models. Mitigate with incremental rollout per task and manual smoke of affected endpoints.
- **Alternatives:** Central per-route wrapper vs inline validators — **follow existing per-route `validateRequest(schema)` pattern** for consistency with the codebase.

## Goal

Close **Joi gap closure — internal routes batch A**: (1) produce an audit of mutating routes in the first half of `server/src/routes/internal` missing `validateRequest` (or equivalent); (2) add Joi schemas and wire `validateRequest` without changing security middleware order; (3) verify behavior and update the **GC-8-JOI** row in `.project-manager/GAP_CLOSURE_CHECKLIST.md` when the batch is objectively done.

## Files

- `server/src/routes/internal/**` — batch A scope (task 8.5.3.1 defines “first half”; typically alphabetical or `index.ts` mount order — lock exact boundary in task 8.5.3.1 output).
- `server/src/middlewares/validateRequest.ts` — shared validation middleware (routers import `validateRequest.js` after build; read-only unless contract requires extension).
- Co-located `*Validators.ts` / `*Constants.ts` next to touched routers (match sibling feature folders).
- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — row **GC-8-JOI** (create or update per repo state).
- `.project-manager/features/security-hardening/sessions/session-8.5.3-log.md` — task entries as work completes.

## Approach

1. **Task 8.5.3.1 — Audit:** Enumerate `POST`/`PUT`/`PATCH` routes in batch A; note which lack `validateRequest`; document CSRF/ownership neighbors; write findings in session log or a short audit subsection for traceability.
2. **Task 8.5.3.2 — Implement:** For each audited gap, add Joi schemas consistent with existing patterns, import `validateRequest`, place middleware **after** CSRF/ownership where those apply (mirror sibling routers). Use `createLogger` in any new catch paths per coding standards.
3. **Task 8.5.3.3 — Verify + checklist:** Smoke critical paths; run `npm run start:dev` and server lint; only then mark **GC-8-JOI** complete with a one-line evidence pointer (e.g. “batch A routers listed in session log”).

## Checkpoint

- Audit list exists and matches batch A boundary before code changes.
- Each changed route has schema + `validateRequest` wired; no silent validation failures.
- Checklist row updated with evidence; app starts and server lint passes.

## Deliverables

- Written audit for batch A internal mutating routes (task 8.5.3.1).
- Joi schemas + `validateRequest` wiring for all audited gaps in scope (task 8.5.3.2).
- **GC-8-JOI** updated + session log / handoff reflecting completion (task 8.5.3.3).

---

## Task 8.5.3.1 (source: task-8.5.3.1-planning.md)

### Story

**This task produces** a structured audit of every POST/PUT/PATCH handler in batch A of `server/src/routes/internal` **because** task 8.5.3.2 needs an objective gap list before adding Joi schemas, and the checklist row (GC-8-JOI) requires traceable evidence of what was inspected.

---

### Analysis

- **Problem:** Some internal `POST`/`PUT`/`PATCH` handlers may omit the shared `validateRequest` middleware or equivalent Joi validation, which weakens input guarantees and makes security/governance audits noisy.
- **Why now:** Phase 8.5 is security headers + hardening; validation is part of the same “defense in depth” thread and is explicitly scoped as session 8.5.3 in the phase… _(truncated)_

### Goal

Produce a structured, traceable audit of every POST/PUT/PATCH handler in batch A (`server/src/routes/internal` mounts 1–11 from `index.ts`) documenting: (a) whether `validateRequest` middleware is present, (b) what local/inline validation exists, (c) CSRF/ownership middleware ordering. No code changes — audit only.

### Files

- `server/src/routes/internal/**/*.ts` — batch A scope (entities through wizardSettings + businessRules)
- `server/src/middlewares/validateRequest.ts` — reference for what "covered" means
- `server/src/routes/helpers/createCrudRouter.ts` — reference for factory-based routes
- This planning doc — audit table lives in Design section

### Approach

1. Walk each batch A directory’s router files.
2. For each `router.post`/`router.put`/`router.patch`, inspect middleware chain.
3. Classify as COVERED / LOCAL_PATTERN / GAP.
4. Record in the Design section table.
5. No code changes; session log entry on completion.

### Checkpoint

- Audit table is complete and accurate (31 routes inspected across 11 mount points).
- GAPs and LOCAL_PATTERN candidates clearly identified for task 8.5.3.2.

### Deliverables

- Completed audit table in Design section (31 routes).
- Summary: 17 COVERED, 11 LOCAL_PATTERN, 3 GAP.
- Actionable guidance for task 8.5.3.2.

### Acceptance Criteria

- Every POST/PUT/PATCH in batch A scope is listed with a verdict.
- GAP routes (users CRUD) explicitly called out.
- LOCAL_PATTERN routes have brief description of existing validation.
- CSRF ordering noted for all routes.
- No code changed — audit only.

### Design

### Batch A boundary (locked)

Mount order from `server/src/routes/internal/index.ts` lines 23–40:

1. `/entities` → `entities/`
2. `/relationships` → `relationships/`
3. `/properties` → `properties/`
4. `/users` → `users/`
5. `/appointments` → `appointments/`
6. `/appointment-fee-summaries` → `appointment-fees/`
7. `/availability` → `availabilityRouter.ts`
8. `/business-settings` → `businessSettings/`
9. `/calendar-settings` → `calendarSettings/`
10. `/wizard-settings` → `wizardSettings/`
11. `BUSINESS_RULES_ROUTE` → `businessRulesCrudRouter.ts`

### Audit results

| # | File | Method + Path | `validateRequest` MW? | Local/inline validation? | `csrfProtection`? | Verdict |
|---|------|--------------|----------------------|--------------------------|-------------------|---------|
| **entities/** | | | | | | |
| 1 | `entityCrudRouter.ts` | POST `/:entityType` | yes (`entityBodySchema`) | sanitizers after | yes, before | **COVERED** |
| 2 | `entityCrudRouter.ts` | PUT `/:entityType/:id` | yes (`entityBodySchema`) | — | yes, before | **COVERED** |
| 3 | `entityCrudRouter.ts` | PATCH `/:entityType/:id` | yes (`entityBodySchema`) | `validateEntityId` | yes, before | **COVERED** |
| 4 | `entityBulkRouter.ts` | PATCH `/:entityType/order_index` | yes (`entityOrderIndexPatchBodySchema`) | — | yes, before | **COVERED** |
| 5 | `entityBulkRouter.ts` | PATCH `/:entityType/bulk` | yes (`entityBulkPatchBodySchema`) | `validateBulkUpdateArray` | yes, before | **COVERED** |
| **relationships/** | | | | | | |
| 6 | `relationshipCrudRouter.ts` | POST `/:relationshipType` | **no** | `validateRequiredFields`, `validateParentChildDifferent`, domain checks | yes | **LOCAL_PATTERN** |
| 7 | `relationshipInstanceComponentRouter.ts` | PATCH `/:id` | **no** | Joi `patchBodySchema.validate()` inline | yes | **LOCAL_PATTERN** |
| 8 | `relationshipAnnotationAssignmentRouter.ts` | PATCH `/:blockInstanceId/:annotationId` | **no** | Joi for params + body inline | yes | **LOCAL_PATTERN** |
| **properties/** | | | | | | |
| 9 | `propertyCrudRouter.ts` | POST `/` | yes (`propertyCreateBodySchema`) | `validateAddressFields` after | yes, before | **COVERED** |
| 10 | `propertyCrudRouter.ts` | PUT `/:id` | yes (`propertyUpdateBodySchema`) | — | yes → ownership → MW | **COVERED** |
| 11 | `propertyCrudRouter.ts` | PATCH `/:id` | yes (`propertyPatchBodySchema`) | `validatePropertyDetailsPatchBody` | yes → ownership → MW | **COVERED** |
| 12 | `propertyTypesRouter.ts` | POST `/:id/types` | yes (`propertyTypePostBodySchema`) | domain checks | yes, before | **COVERED** |
| 13 | `propertyTypesRouter.ts` | PATCH `/:id/types/:typeId` | yes (`propertyTypePatchBodySchema`) | — | yes → ownership → MW | **COVERED** |
| 14 | `propertyTypesRouter.ts` | PUT `/:id/types` | yes (`propertyTypesPutBodySchema`) | `validateBlockInstances` | yes, before | **COVERED** |
| **users/** | | | | | | |
| 15 | `userCrudRouter.ts` (createCrudRouter) | POST `/` | **no** | **none** | yes | **GAP** |
| 16 | `userCrudRouter.ts` (createCrudRouter) | PUT `/:id` | **no** | **none** | yes → ownership | **GAP** |
| 17 | `userCrudRouter.ts` (createCrudRouter) | PATCH `/:id` | **no** | **none** | yes → ownership | **GAP** |
| **appointments/** | | | | | | |
| 18 | `appointmentCrudRouter.ts` (createCrudRouter) | POST `/` | **no** | `beforeCreate`, `sanitizeInput`, domain hooks | yes | **LOCAL_PATTERN** |
| 19 | `appointmentCrudRouter.ts` (createCrudRouter) | PUT `/:id` | **no** | `beforeUpdate`, `sanitizeInput` | yes → ownership | **LOCAL_PATTERN** |
| 20 | `appointmentCrudRouter.ts` (createCrudRouter) | PATCH `/:id` | **no** | same | yes → ownership | **LOCAL_PATTERN** |
| 21 | `forceCreateRouter.ts` | POST `/` | yes (`forceCreateBodySchema`) | — | yes → auth → role → MW | **COVERED** |
| **appointment-fees/** | | | | | | |
| — | `appointmentFeeCrudRouter.ts` | (no POST/PUT/PATCH) | — | — | — | **N/A** |
| **availability** | | | | | | |
| 22 | `availabilityRouter.ts` | POST `/computed-data` | yes (`computedAvailabilityRequestSchema`) | + redundant domain validator | yes, before | **COVERED** |
| **businessSettings/** | | | | | | |
| 23 | `businessSettingsCrudRouter.ts` | POST `/` | **no** | `validateSettingKey`, `validateSettingValue`, `validateAvailabilitySettingsWithDetails` | yes | **LOCAL_PATTERN** |
| 24 | `businessSettingsCrudRouter.ts` | PUT `/:key` | **no** | same validators | yes → ownership | **LOCAL_PATTERN** |
| 25 | `businessSettingsCrudRouter.ts` | PATCH `/:key` | **no** | same + `mergeSettingValues` | yes → ownership | **LOCAL_PATTERN** |
| **calendarSettings/** | | | | | | |
| 26 | `calendarSettingsCrudRouter.ts` | PUT `/` | yes (`calendarSettingsPutBodySchema`) | — | yes → ownership → MW | **COVERED** |
| **wizardSettings/** | | | | | | |
| 27 | `wizardSettingsCrudRouter.ts` | PUT `/` | yes (`wizardSettingsPutBodySchema`) | — | yes → ownership → MW | **COVERED** |
| 28 | `wizardSettingsLogoUploadRouter.ts` | POST `/logo` | **no** | multer + file checks (multipart) | yes → ownership → multer | **LOCAL_PATTERN** (upload) |
| **businessRules** | | | | | | |
| 29 | `businessRulesCrudRouter.ts` (createCrudRouter) | POST `/` | **no** | factory `config.validateRequest` callback | yes | **LOCAL_PATTERN** |
| 30 | `businessRulesCrudRouter.ts` (createCrudRouter) | PUT `/:id` | **no** | factory callback | yes → ownership | **LOCAL_PATTERN** |
| 31 | `businessRulesCrudRouter.ts` (createCrudRouter) | PATCH `/:id` | **no** | factory returns `{ valid: true }` (no-op) | yes → ownership | **LOCAL_PATTERN** |

### Summary

| Category | Count | Routes |
|----------|-------|--------|
| **COVERED** (shared `validateRequest` middleware) | 17 | entities (5), properties (6), forceCreate (1), availability (1), calendarSettings (1), wizardSettings PUT (1), entityCrud (already counted) |
| **LOCAL_PATTERN** (inline Joi or domain validators) | 11 | relationships (3), appointments CRUD (3), businessSettings (3), wizardSettings logo (1), businessRules (3 via factory) |
| **GAP** (no validation at all) | 3 | **users POST `/`, PUT `/:id`, PATCH `/:id`** |
| **N/A** (no mutating routes) | — | appointment-fees |

### Actionable for task 8.5.3.2

**Hard GAPs (priority):** Users CRUD — 3 routes with zero body validation.

**LOCAL_PATTERN candidates (evaluate per-route):**
- Relationship routes (#6–8): already do inline Joi — strong candidates for extracting schemas into the middleware.
- Appointment CRUD (#18–20): relies on domain hooks/sanitizers — may need Joi schemas for body shape, keep domain logic.
- Business settings (#23–25): meaningful local validators, could migrate or document.
- Business rules (#29–31): factory callback pattern, PATCH is a no-op.
- Wizard logo (#28): multipart/multer — `validateRequest` doesn't apply to file uploads; document as exception.

---

## Task 8.5.3.2 (source: task-8.5.3.2-planning.md)

### Story

**This task adds** Joi schemas and `validateRequest` middleware to the 3 user CRUD routes (POST/PUT/PATCH) that had zero body validation **because** invalid payloads currently pass straight through to the ORM, bypassing the project's standard defense-in-depth pattern used by entities, properties, and other validated routers.

---

### Analysis

- **Problem:** Some internal `POST`/`PUT`/`PATCH` handlers may omit the shared `validateRequest` middleware or equivalent Joi validation, which weakens input guarantees and makes security/governance audits noisy.
- **Why now:** Phase 8.5 is security headers + hardening; validation is part of the same “defense in depth” thread and is explicitly scoped as session 8.5.3 in the phase… _(truncated)_

### Goal

Add Joi body-validation schemas and wire `validateRequest` middleware for the **3 GAP user CRUD routes** identified in task 8.5.3.1. Document LOCAL_PATTERN routes as accepted exceptions.

### Files

- `server/src/routes/schemas/userSchemas.ts` — **new**: Joi schemas for user POST/PUT/PATCH
- `server/src/routes/internal/users/userCrudRouter.ts` — **modify**: replace `createCrudRouter` with explicit routes + `validateRequest`
- `server/src/routes/internal/users/userConstants.ts` — **read-only** reference
- `server/src/middlewares/validateRequest.ts` — **read-only** reference

### Approach

1. Create `server/src/routes/schemas/userSchemas.ts` with Joi schemas matching the User model fields.
2. Rewrite `userCrudRouter.ts` from `createCrudRouter` to explicit route registrations with `validateRequest` in the middleware chain.
3. Preserve existing behavior: same error messages, same CSRF/ownership order.
4. Verify app starts and server lint passes.
5. Document LOCAL_PATTERN exceptions in session log.

### Checkpoint

- `userCrudRouter.ts` uses explicit routes with `validateRequest` for POST/PUT/PATCH.
- Joi schemas match User model fields (firstName, lastName, email, phone, userRole).
- Middleware order: csrf → ownership → validateRequest → handler.
- `npm run start:dev` succeeds; `cd server && npm run lint` passes.

### Deliverables

- `server/src/routes/schemas/userSchemas.ts` with 3 Joi schemas.
- Rewritten `server/src/routes/internal/users/userCrudRouter.ts` with explicit validated routes.
- LOCAL_PATTERN exception documentation in session log.

### Acceptance Criteria

- User POST/PUT/PATCH routes reject invalid bodies with 400 + Joi details.
- Valid requests continue to work (same behavior as before).
- CSRF and ownership middleware order unchanged.
- No silent fallbacks or empty catch blocks.
- Server lint passes; app starts.

### Design

### Strategy: Replace `createCrudRouter` with explicit routes for users

The `createCrudRouter` factory registers routes internally with `csrfProtection` and `checkOwnership` but has **no hook point** for injecting `validateRequest` middleware. Rather than modifying the shared factory (which would affect all consumers), we’ll convert `userCrudRouter.ts` to explicit route definitions — the same pattern used by `entityCrudRouter.ts`, `propertyCrudRouter.ts`, and other validated routers.

### New file: `server/src/routes/schemas/userSchemas.ts`

```typescript
import Joi from 'joi'

const userRoleValues = ['client', 'agent', 'transaction_manager', 'seller', 'inspector'] as const

export const userCreateBodySchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(null, '').optional(),
  userRole: Joi.string().valid(...userRoleValues).required(),
}).required()

export const userUpdateBodySchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().allow(null, '').optional(),
  userRole: Joi.string().valid(...userRoleValues).optional(),
}).min(1).required()

export const userPatchBodySchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().allow(null, '').optional(),
  userRole: Joi.string().valid(...userRoleValues).optional(),
}).min(1).required()
```

### Modified file: `server/src/routes/internal/users/userCrudRouter.ts`

Replace `createCrudRouter` usage with explicit `router.post`/`router.put`/`router.patch` registrations that include `validateRequest(schema)` in the middleware chain. Preserve `csrfProtection` and `checkOwnership` in the same order as the factory.

Middleware chain per route:
- **POST `/`:** `csrfProtection` → `validateRequest(userCreateBodySchema)` → handler
- **PUT `/:id`:** `csrfProtection` → `checkOwnership('user', 'id')` → `validateRequest(userUpdateBodySchema)` → handler
- **PATCH `/:id`:** `csrfProtection` → `checkOwnership('user', 'id')` → `validateRequest(userPatchBodySchema)` → handler

GET routes and DELETE keep the same factory behavior (re-implement with same `fetchAll`/`fetchById`/`deleteRecord` helpers).

### LOCAL_PATTERN routes: documented exceptions

The 11 LOCAL_PATTERN routes (relationships, appointments, businessSettings, businessRules, wizard logo) have existing validation. They are **not** converted in this task. Each is documented as an accepted exception in the session log with rationale (e.g. "inline Joi already validates body", "multer handles multipart", "factory callback validates").

---

## Task 8.5.3.3 (source: task-8.5.3.3-planning.md)

### Story

**This task verifies** the user CRUD validation changes from task 8.5.3.2 and updates session documentation with evidence **because** the session acceptance criteria require verified closure before session-end.

---

### Analysis

- **Problem:** Some internal `POST`/`PUT`/`PATCH` handlers may omit the shared `validateRequest` middleware or equivalent Joi validation, which weakens input guarantees and makes security/governance audits noisy.
- **Why now:** Phase 8.5 is security headers + hardening; validation is part of the same “defense in depth” thread and is explicitly scoped as session 8.5.3 in the phase… _(truncated)_

### Goal

Verify app starts and server lint passes after task 8.5.3.2 changes; update session log with batch A closure evidence.

### Files

- `.project-manager/features/security-hardening/sessions/session-8.5.3-log.md` — update with verification evidence and session summary

### Approach

1. Verify `npm run start:dev` succeeds (check running terminal).
2. Run `cd server && npm run lint` — confirm clean.
3. Update session log with: (a) what was audited (31 routes, 3 GAP, 11 LOCAL_PATTERN, 17 COVERED), (b) what was fixed (user CRUD — 3 routes), (c) verification evidence.

### Checkpoint

- App starts confirmed.
- Server lint passes confirmed.
- Session log updated with batch A closure summary.

### Deliverables

- Verified app + lint baseline.
- Session log entry documenting batch A closure.

### Acceptance Criteria

- App starts without errors.
- Server lint passes.
- Session log has evidence summary for batch A Joi gap closure.

### Design

1. Confirm `npm run start:dev` is running (already verified by dev server in terminal).
2. Run `cd server && npm run lint` one final time for a clean baseline.
3. Update the session log with a summary of what was accomplished across all 3 tasks.
4. Note: `GAP_CLOSURE_CHECKLIST.md` does not exist on disk; the evidence for this batch lives in the task 8.5.3.1 planning doc (audit table) and task 8.5.3.2 planning doc (implementation details). The session log will serve as the closure record.

---
