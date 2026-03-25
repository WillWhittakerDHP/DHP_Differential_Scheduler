<!-- harness-planning-rollup tier=session id=8.5.4 consolidatedAt=2026-03-25T18:52:49.010Z -->

# Consolidated planning: session 8.5.4

## Session 8.5.4 (parent)

## Story

**This session delivers** Joi validation coverage on the remaining internal mutating routes (batch B — mounts 12–17) and a final cross-batch closure assessment **so that** GC-8-JOI can be marked done with evidence that every internal POST/PUT/PATCH route is validated or explicitly exempted.
**Estimated size:** M

---

## Analysis

- **Problem:** Session 8.5.3 (batch A) audited mounts 1–11 of `server/src/routes/internal/index.ts` and found 3 GAP routes (users CRUD — fixed), 11 LOCAL_PATTERN routes (accepted exceptions), and 17 COVERED routes. Mounts 12–17 were not audited. Without completing this sweep, GC-8-JOI cannot be closed.
- **Why now:** This is the direct successor to 8.5.3. The gap-closure checklist row GC-8-JOI is `pending`. All batch A work is merged on `feature/security-hardening`; batch B completes the remaining internal routes.
- **Domains:** **Server / internal API** only for implementation. **Docs** for checklist closure. No Vue/composable work.
- **Patterns to follow:** Two established validation patterns in the codebase:
  1. **Middleware pattern** (`validateRequest(schema)` as Express middleware) — used by entities, properties, orgDefaults, adminMetadata, eventInstancePreview, and users (converted in 8.5.3). Standard for explicit route registrations.
  2. **Factory callback pattern** (`createCrudRouter({ validateRequest: (req, method) => ... })`) — used by betaFeedback, appointments, businessRules. The factory calls the callback before database operations and rejects with 400 on failure.
  Both patterns provide input validation before data operations. Batch B GAPs (property mappings) use `createCrudRouter` with **neither** pattern — no validation at all.
- **Risks:** Over-validating mapping payloads used by admin tooling; schemas drifting from model constraints. Mitigate by deriving schemas from model field definitions (types, lengths, nullability).
- **Alternatives considered:**
  - *Convert property mapping routers to explicit routes with middleware* — more aligned with COVERED standard but high disruption for simple CRUD routers.
  - *Add factory `validateRequest` callbacks with validators* (recommended) — follows existing betaFeedback pattern, lower disruption, validation still runs before DB operations. Moves routes from GAP → LOCAL_PATTERN (accepted).
- **Dependencies:** Session 8.5.3 completed (batch A). No client-side changes needed.

## Goal

Close **Joi gap closure — internal routes batch B**: (1) audit all POST/PUT/PATCH handlers in mounts 12–17 of `server/src/routes/internal`; (2) add validation to the 6 GAP routes in property field-mappings and feature-mappings; (3) combine batch A + B results and update GC-8-JOI in `GAP_CLOSURE_CHECKLIST.md` to `done` with cross-batch evidence.

## Files

- `server/src/routes/internal/index.ts` — mount order reference (read-only)
- `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` — **modify**: add `validateRequest` callbacks + validators to both `createCrudRouter` configs
- `server/src/routes/internal/property-mappings/propertyMappingsValidators.ts` — **new**: Joi-based validators for field and feature mapping CRUD
- `server/src/routes/internal/organizationDefaults/organizationDefaultsCrudRouter.ts` — read-only (already COVERED)
- `server/src/routes/internal/admin-metadata/adminMetadataCrudRouter.ts` — read-only (already COVERED)
- `server/src/routes/internal/beta-feedback/betaFeedbackCrudRouter.ts` — read-only (LOCAL_PATTERN accepted)
- `server/src/routes/internal/event-instance-preview/eventInstancePreviewRouter.ts` — read-only (already COVERED)
- `server/src/routes/internal/dev/devStatusRouter.ts` — read-only (N/A — GET only, dev-only)
- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — **modify**: update GC-8-JOI row to `done`

## Approach

1. **Task 8.5.4.1 — Audit:** Walk each batch B mount (12–17). For every `router.post`/`.put`/`.patch`, classify as COVERED / LOCAL_PATTERN / GAP. Document in planning doc.
2. **Task 8.5.4.2 — Implement:** Create `propertyMappingsValidators.ts` with Joi-based validators for field-mapping and feature-mapping create/update/patch. Wire `validateRequest` callbacks into both `createCrudRouter` configs in `propertyMappingsRouter.ts`. Preserve CSRF/ownership middleware order (factory handles this automatically). Run server lint.
3. **Task 8.5.4.3 — Verify + close GC-8-JOI:** Verify `npm run start:dev` + server lint. Produce combined batch A+B summary. Update `GAP_CLOSURE_CHECKLIST.md` row GC-8-JOI to `done` with evidence. Update session log/handoff.

## Checkpoint

- Audit table complete for all batch B routes.
- Property mapping routes reject invalid bodies with 400 + validation details.
- App starts; server lint passes.
- GC-8-JOI set to `done` with cross-batch evidence pointer.

## Deliverables

- Written audit for batch B internal mutating routes (task 8.5.4.1).
- `propertyMappingsValidators.ts` with create/update/patch validators for field-mappings and feature-mappings.
- Modified `propertyMappingsRouter.ts` wiring `validateRequest` callbacks.
- GC-8-JOI updated to `done` in `GAP_CLOSURE_CHECKLIST.md`.
- Session log / handoff reflecting cross-batch closure.

## Acceptance Criteria

- Every POST/PUT/PATCH in batch B scope is listed with a verdict in the audit.
- Property mapping GAP routes (6 total) have validation via factory `validateRequest` callback.
- Valid requests continue to work (same behavior).
- CSRF and ownership middleware order unchanged.
- No silent fallbacks or empty catch blocks.
- Server lint passes; app starts.
- GC-8-JOI row in checklist is `done` with evidence.

---

## Task 8.5.4.1 (source: task-8.5.4.1-planning.md)

### Story

**This task produces** a structured audit of every POST/PUT/PATCH handler in batch B (mounts 12–17 of `server/src/routes/internal`) **because** task 8.5.4.2 needs an objective gap list before adding validators, and GC-8-JOI requires traceable evidence of what was inspected.

---

### Analysis

- **Problem:** Session 8.5.3 (batch A) audited mounts 1–11 of `server/src/routes/internal/index.ts` and found 3 GAP routes (users CRUD — fixed), 11 LOCAL_PATTERN routes (accepted exceptions), and 17 COVERED routes. Mounts 12–17 were not audited. Without completing this sweep, GC-8-JOI cannot be closed.
- **Why now:** This is the direct successor to 8.5.3. The gap-closure checklis… _(truncated)_

### Goal

Produce a structured, traceable audit of every POST/PUT/PATCH handler in batch B (`server/src/routes/internal` mounts 12–17) documenting: (a) whether `validateRequest` middleware is present, (b) what local/inline validation exists, (c) CSRF/ownership middleware ordering. No code changes — audit only.

### Files

- `server/src/routes/internal/index.ts` — mount order reference (read-only)
- `server/src/routes/internal/organizationDefaults/organizationDefaultsCrudRouter.ts` — read-only
- `server/src/routes/internal/admin-metadata/adminMetadataCrudRouter.ts` — read-only
- `server/src/routes/internal/dev/devStatusRouter.ts` — read-only
- `server/src/routes/internal/beta-feedback/betaFeedbackCrudRouter.ts` — read-only
- `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` — read-only
- `server/src/routes/internal/event-instance-preview/eventInstancePreviewRouter.ts` — read-only

### Approach

1. Walk each batch B mount's router files (already completed during session planning).
2. For each `router.post`/`.put`/`.patch`, inspect middleware chain.
3. Classify as COVERED / LOCAL_PATTERN / GAP.
4. Record in the Design section audit table above.
5. No code changes; this task is audit-only.

### Checkpoint

- Audit table complete and accurate (12 routes inspected across 6 mount points).
- GAPs and LOCAL_PATTERN candidates clearly identified for task 8.5.4.2.

### Deliverables

- Completed audit table in Design section (12 routes).
- Summary: 3 COVERED, 3 LOCAL_PATTERN, 6 GAP.
- Actionable guidance for task 8.5.4.2.

### Acceptance Criteria

- Every POST/PUT/PATCH in batch B scope is listed with a verdict.
- GAP routes (property mappings, 6 total) explicitly called out.
- LOCAL_PATTERN routes (betaFeedback) have brief description of existing validation.
- CSRF ordering noted for all routes.
- No code changed — audit only.

### Design

### Batch B boundary (locked)

Mount order from `server/src/routes/internal/index.ts` lines 38–50:

12. `/organization-defaults` → `organizationDefaults/`
13. `/admin-metadata` → `admin-metadata/`
14. `/dev` → `dev/`
15. `/beta-feedback` → `beta-feedback/`
16. `/property-mappings` → `property-mappings/`
17. `/event-instance-preview` → `event-instance-preview/`

### Audit results

| # | Mount / File | Method + Path | `validateRequest` MW? | Local/inline validation? | `csrfProtection`? | Verdict |
|---|-------------|--------------|----------------------|--------------------------|-------------------|---------|
| **organizationDefaults/** | | | | | | |
| 1 | `organizationDefaultsCrudRouter.ts` | PUT `/` | yes (`organizationDefaultsPutBodySchema`) | `validateOrganizationDefaultsPayload` after | yes → ownership → MW | **COVERED** |
| **admin-metadata/** | | | | | | |
| 2 | `adminMetadataCrudRouter.ts` | POST `/:entityType/:entityId` | yes (`adminMetadataPostBodySchema`) | domain validators after (entityType, requiredFields, renderAs, inputConfig) | yes | **COVERED** |
| **dev/** | | | | | | |
| — | `devStatusRouter.ts` | (GET `/status` only) | — | — | — | **N/A** (GET-only, dev-only) |
| **beta-feedback/** | | | | | | |
| 3 | `betaFeedbackCrudRouter.ts` (createCrudRouter) | POST `/` | **no MW** | factory callback: `validateCreateBody` (required fields, category, severity) | yes | **LOCAL_PATTERN** |
| 4 | `betaFeedbackCrudRouter.ts` (createCrudRouter) | PUT `/:id` | **no MW** | factory callback: `validateUpdateBody` (status) | yes → ownership | **LOCAL_PATTERN** |
| 5 | `betaFeedbackCrudRouter.ts` (createCrudRouter) | PATCH `/:id` | **no MW** | factory callback: `validateUpdateBody` (status) | yes → ownership | **LOCAL_PATTERN** |
| **property-mappings/** | | | | | | |
| 6 | `propertyMappingsRouter.ts` (fieldMappingsRouter) | POST `/` | **no** | **none** | yes | **GAP** |
| 7 | `propertyMappingsRouter.ts` (fieldMappingsRouter) | PUT `/:id` | **no** | **none** | yes → ownership | **GAP** |
| 8 | `propertyMappingsRouter.ts` (fieldMappingsRouter) | PATCH `/:id` | **no** | **none** | yes → ownership | **GAP** |
| 9 | `propertyMappingsRouter.ts` (featureMappingsRouter) | POST `/` | **no** | **none** | yes | **GAP** |
| 10 | `propertyMappingsRouter.ts` (featureMappingsRouter) | PUT `/:id` | **no** | **none** | yes → ownership | **GAP** |
| 11 | `propertyMappingsRouter.ts` (featureMappingsRouter) | PATCH `/:id` | **no** | **none** | yes → ownership | **GAP** |
| **event-instance-preview/** | | | | | | |
| 12 | `eventInstancePreviewRouter.ts` | POST `/` | yes (`eventInstancePreviewPostBodySchema`) | — | yes | **COVERED** |

### Summary

| Category | Count | Routes |
|----------|-------|--------|
| **COVERED** (shared `validateRequest` middleware) | 3 | orgDefaults PUT (1), adminMetadata POST (1), eventInstancePreview POST (1) |
| **LOCAL_PATTERN** (factory callback validators) | 3 | betaFeedback POST/PUT/PATCH (3) |
| **GAP** (no validation at all) | 6 | **propertyMappings field-mappings POST/PUT/PATCH (3), feature-mappings POST/PUT/PATCH (3)** |
| **N/A** (no mutating routes) | — | dev (GET-only) |

### Actionable for task 8.5.4.2

**Hard GAPs (priority):** Property mappings — 6 routes with zero body validation across two `createCrudRouter` instances (`fieldMappingsRouter`, `featureMappingsRouter`).

**Recommended fix:** Add `validateRequest` factory callbacks with Joi-based validators (same pattern as `betaFeedbackCrudRouter`). This moves them from GAP → LOCAL_PATTERN (accepted).

**LOCAL_PATTERN routes (no action needed):** Beta feedback uses factory `validateRequest` callback with `validateCreateBody`/`validateUpdateBody`. Already has meaningful validation. Accepted exception.

---

## Task 8.5.4.2 (source: task-8.5.4.2-planning.md)

### Story

**This task adds** Joi-based validators and `validateRequest` factory callbacks to the 6 property mapping CRUD routes (field-mappings + feature-mappings) **because** they currently accept any body payload without validation, passing untrusted input directly to the ORM.

---

### Analysis

- **Problem:** Session 8.5.3 (batch A) audited mounts 1–11 of `server/src/routes/internal/index.ts` and found 3 GAP routes (users CRUD — fixed), 11 LOCAL_PATTERN routes (accepted exceptions), and 17 COVERED routes. Mounts 12–17 were not audited. Without completing this sweep, GC-8-JOI cannot be closed.
- **Why now:** This is the direct successor to 8.5.3. The gap-closure checklis… _(truncated)_

### Goal

Add Joi-based body validation to the 6 GAP routes in `propertyMappingsRouter.ts` (field-mappings POST/PUT/PATCH + feature-mappings POST/PUT/PATCH) via `createCrudRouter` factory `validateRequest` callbacks.

### Files

- `server/src/routes/internal/property-mappings/propertyMappingsValidators.ts` — **new**: validators for field and feature mapping CRUD
- `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` — **modify**: wire `validateRequest` callbacks

### Approach

1. Create `propertyMappingsValidators.ts` with 4 validation functions (create + update for each mapping type).
2. Import validators into `propertyMappingsRouter.ts`.
3. Add `validateRequest` callback to both `createCrudRouter` configs.
4. Run `cd server && npm run lint`.

### Checkpoint

- Property mapping routes reject invalid bodies with 400 + validation details.
- Valid requests continue to work (same behavior).
- CSRF and ownership middleware order unchanged (factory-managed).
- Server lint passes.

### Deliverables

- `server/src/routes/internal/property-mappings/propertyMappingsValidators.ts` with 4 validation functions.
- Modified `propertyMappingsRouter.ts` with `validateRequest` callbacks wired.

### Acceptance Criteria

- Field mapping POST/PUT/PATCH reject bodies missing required fields (sourceField, targetField for create).
- Feature mapping POST/PUT/PATCH reject bodies missing required fields (sourceField, matchType, blockInstanceId for create).
- Update/patch accept partial bodies with `.min(1)`.
- No silent fallbacks or empty catch blocks.
- Server lint passes; app starts.

### Design

### New file: `server/src/routes/internal/property-mappings/propertyMappingsValidators.ts`

Validators using the factory `ValidationResult` interface (same as `betaFeedbackValidators.ts`):

**Field mapping validators** (derived from `PropertyFieldMapping` model):
- `validateFieldMappingCreate`: requires `sourceField` (string, max 100), `targetField` (string, max 100); optional `dataSource` (string, max 50), `valueMapping` (object | null), `fallbackValue` (string | null), `active` (boolean), `notes` (string | null)
- `validateFieldMappingUpdate`: same fields but all optional, `.min(1)` to require at least one

**Feature mapping validators** (derived from `PropertyFeatureMapping` model):
- `validateFeatureMappingCreate`: requires `sourceField` (string, max 100), `matchType` (one of 'exists', 'contains', 'equals', 'greater_than'), `blockInstanceId` (UUID); optional `dataSource` (string, max 50), `matchValue` (string | null), `active` (boolean), `priority` (integer), `notes` (string | null)
- `validateFeatureMappingUpdate`: same fields but all optional, `.min(1)`

### Modified file: `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts`

Add to each `createCrudRouter` config:
- `validateRequest: (req, method) => { if (method === 'create') return validateFieldMappingCreate(req.body); return validateFieldMappingUpdate(req.body); }` (and analogous for feature mappings)

Middleware chain order unchanged — `createCrudRouter` factory handles csrf + ownership placement automatically.

---

## Task 8.5.4.3 (source: task-8.5.4.3-planning.md)

### Story

**This task verifies** server lint and documents cross-batch Joi closure **so that** row **GC-8-JOI** can be set to `done` with a single evidence pointer (sessions 8.5.3 + 8.5.4).

---

### Analysis

- **Problem:** Session 8.5.3 (batch A) audited mounts 1–11 of `server/src/routes/internal/index.ts` and found 3 GAP routes (users CRUD — fixed), 11 LOCAL_PATTERN routes (accepted exceptions), and 17 COVERED routes. Mounts 12–17 were not audited. Without completing this sweep, GC-8-JOI cannot be closed.
- **Why now:** This is the direct successor to 8.5.3. The gap-closure checklis… _(truncated)_

### Goal

Run `cd server && npm run lint` (clean). Confirm dev server healthy if already running. Update `.project-manager/GAP_CLOSURE_CHECKLIST.md` row **GC-8-JOI** to `done` with harness anchor and Notes. Refresh session log **Last updated** line if present.

### Files

- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — **modify** GC-8-JOI row only
- `.project-manager/features/security-hardening/sessions/session-8.5.4-log.md` — optional closing note (harness may update on task-end)

### Approach

1. Run `cd server && npm run lint`.
2. Edit `GAP_CLOSURE_CHECKLIST.md`: GC-8-JOI status, Harness anchor, Notes, footer `_Last updated_`.
3. No client lint required for this row (server-only Joi work); skip client lint per task scope unless session DoD requires it — session definition of done lists both; run client lint only if quick (user preference: verify app — dev server already running).

### Checkpoint

- Server lint exit 0.
- GC-8-JOI shows `done` with evidence text.

### Deliverables

- Updated `GAP_CLOSURE_CHECKLIST.md` (GC-8-JOI row).
- Verification note: server lint command + result.

### Acceptance Criteria

- `cd server && npm run lint` passes.
- GC-8-JOI status is `done`; Notes reference batch A + B closure.

### Design

### Combined closure summary (for Notes column)

- **Batch A (8.5.3):** Mounts 1–11 audited (31 mutating routes). **GAPs fixed:** users POST/PUT/PATCH (`userSchemas.ts`, explicit `userCrudRouter`). Remaining routes: COVERED (middleware `validateRequest`) or LOCAL_PATTERN (inline Joi / factory / domain validators); wizard logo multipart documented as exception.
- **Batch B (8.5.4):** Mounts 12–17 audited (12 mutating routes). **GAPs fixed:** property field-mappings + feature-mappings (6 routes) via factory `validateRequest` + Joi in `propertyMappingsValidators.ts`. Other batch B routes: COVERED, LOCAL_PATTERN (beta feedback), or N/A (dev GET-only).

### Checklist update

- Set **GC-8-JOI** `Status` → `done`.
- **Harness anchor** → `[session-8.5.4-guide.md](features/security-hardening/sessions/session-8.5.4-guide.md)` (session that closed the sweep).
- **Notes** → one line pointing to 8.5.3 + 8.5.4 task/session planning evidence.

---
