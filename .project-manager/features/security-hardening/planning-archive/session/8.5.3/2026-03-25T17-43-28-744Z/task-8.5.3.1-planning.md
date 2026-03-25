# Plan: task 8.5.3.1 — 8.5.3.1

## Contract
- **Tier:** task | **ID:** 8.5.3.1
- **Scope:** 8.5.3.1
- **Governance:** Governance Context (Task)

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Gate profile:** fast
- **Suggested depth:** leaf — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
- [ ] #### Task 8.5.3.1: Audit internal routes (batch A) **Goal:** Inventory POST/PUT/PATCH handlers in the first half of `server/src/routes/internal` that lack `validateRequest`; note ordering vs CSRF/ownership middleware. **Files:** - `server/src/routes/internal/**/*.ts` (first half of tree, per playbook) - `.project-manager/GAP_CLOSURE_CHECKLIST.md` (GC-8-JOI) **Approach:** Match checklist scope; document gaps without changing behavior yet. **Checkpoint:** Written audit list aligned with GC-8-JOI acceptance criteria.

## Parent context (session planning — Analysis excerpt)

- **Problem:** Some internal `POST`/`PUT`/`PATCH` handlers may omit the shared `validateRequest` middleware or equivalent Joi validation, which weakens input guarantees and makes security/governance audits noisy.
- **Why now:** Phase 8.5 is security headers + hardening; validation is part of the same “defense in depth” thread and is explicitly scoped as session 8.5.3 in the phase… _(truncated)_

## Story
**This task produces** a structured audit of every POST/PUT/PATCH handler in batch A of `server/src/routes/internal` **because** task 8.5.3.2 needs an objective gap list before adding Joi schemas, and the checklist row (GC-8-JOI) requires traceable evidence of what was inspected.

---
## Architecture context (harness-injected)

## 1. System overview

Bonsai Differential Scheduler is a **Vue 3 + Express + Sequelize** application with a **shared type layer** (`shared/` / `@shared`). It serves:

- **Public booking users** — wizard-style scheduling and property/availability flows.
- **Admin configurators** — metadata-driven entity CRUD, wizard settings, availability rules, integrations.

TanStack **Vue Query** manages server-state caching. Composables typically expose **`ComputedRef<T>`** for read-only query data. Admin metadata is often batch-prefetched (e.g. router navigation guards).

---

## 2. Domain map

| Domain | Client paths | Server paths | Key models / areas | Shared types |
|--------|----------------|-------------|---------------------|--------------|
| **Booking / Wizard** | `client/src/composables/booking/`, `useBooking.ts`, `useAppointment.ts`, `useProperty.ts`, `components/booking/`, `views/booking/`, `types/booking/`, `configs/wizardSteps`, `configs/availabilitySettings` | `server/src/routes/internal/appointments`, `availability`, `properties`, `services/availability*`, `db/models` booking-related | Appointments, selections, time slots, properties, fees | `@shared/types` availability, appointment-related |
| **Admin / Config** | `composables/admin/`, `components/admin/`, `views/admin/`, `types/admin/`, `configs/` | `routes/internal/entities`, `relationships`, `admin-metadata`, `*-settings`, `db/models` admin | Shapes, instances, wizard settings, calendar settings, business rules | `@shared/types/entities` |
| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving) | Auth contracts in `@shared` as they stabilize |
| **Integrations** | `services/calendarApiService`, `mapsApiService`, `propertyEnrichmentApiService` (full-URL axios) | `routes/external/calendar`, `oauth`, `maps`, `services/google/` | OAuth, external APIs | `@shared/types/calendar` |
| **Beta** | `composables/beta/`, `views/beta/`, `components/beta/` | `routes/internal/beta-feedback`, `db/models/beta` | Beta feedback | (often local types) |

---

## 3. Data flow

Canonical path:

1. **Vue view** → **presentational component**
2. **Composable** (state + orchestration; thin components)
3. **Client HTTP**
   - **Default:** `utils/api/apiClient` — relative paths, same-origin API.
   - **Integrations:** `services/*ApiService` — full-base-URL axios (calendar, maps, enrichment).
4. **Express route** (`routes/internal/*` or `routes/external/*`)
5. **Service** (`server/src/services/`)
6. **Repository** (`server/src/repositories/`) or direct Sequelize access
7. **Sequelize model** (`server/src/db/models/`)

Cross-cutting: **transformers** (e.g. global → booking), **injection keys** for wizard scope, **TanStack Query** keys + invalidation for mutations.

---

## 4. Type boundaries

| Layer | Location | Use when |
|-------|----------|----------|
| **Shared contracts** | Repo `shared/`, imported as `@shared/types/...` | Types needed by **both** client and server (API shapes, branded IDs, shared enums). |
| **Client-only** | `client/src/types/<domain>/` | UI-only: injection keys, wizard step types, transformer helpers, form field types. **Never** imported by server. |
| **Server-only** | `server/src/types/` | Handler params, repository types, internal DTOs. **Never** imported by client. |

**Rule:** If both sides need it → `@shared`. If only one side → keep it local.

**Reactivity boundaries:** Prefer `ComputedRef<T>` for read-only consumer APIs; `Ref<T>` for internal mutable state; avoid leaking `Ref | ComputedRef` unions at public composable boundaries (see type governance rule + TYPE_AUTHORING_PLAYBOOK).

---

## Analysis
- **Problem:** Before adding Joi schemas (task 8.5.3.2), we need an objective inventory of which mutating routes already use `validateRequest` middleware, which use local/inline validation, and which have no validation at all.
- **Boundary:** Batch A = first 10 mounts + businessRules in `server/src/routes/internal/index.ts` (entities through wizard-settings). This is the "first half" of the internal tree.
- **Existing patterns:** Three validation styles found: (1) shared `validateRequest(schema)` middleware from `server/src/middlewares/validateRequest.ts`; (2) local/inline Joi `.validate()` in handler; (3) `createCrudRouter` factory `config.validateRequest` callback (different symbol). Only pattern (1) is the standard.
- **Risks:** None — audit-only task, no code changes.

## Design

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

## Goal
Produce a structured, traceable audit of every POST/PUT/PATCH handler in batch A (`server/src/routes/internal` mounts 1–11 from `index.ts`) documenting: (a) whether `validateRequest` middleware is present, (b) what local/inline validation exists, (c) CSRF/ownership middleware ordering. No code changes — audit only.

## Files
- `server/src/routes/internal/**/*.ts` — batch A scope (entities through wizardSettings + businessRules)
- `server/src/middlewares/validateRequest.ts` — reference for what "covered" means
- `server/src/routes/helpers/createCrudRouter.ts` — reference for factory-based routes
- This planning doc — audit table lives in Design section

## Approach
1. Walk each batch A directory’s router files.
2. For each `router.post`/`router.put`/`router.patch`, inspect middleware chain.
3. Classify as COVERED / LOCAL_PATTERN / GAP.
4. Record in the Design section table.
5. No code changes; session log entry on completion.

## Checkpoint
- Audit table is complete and accurate (31 routes inspected across 11 mount points).
- GAPs and LOCAL_PATTERN candidates clearly identified for task 8.5.3.2.

## Deliverables
- Completed audit table in Design section (31 routes).
- Summary: 17 COVERED, 11 LOCAL_PATTERN, 3 GAP.
- Actionable guidance for task 8.5.3.2.

## Acceptance Criteria
- Every POST/PUT/PATCH in batch A scope is listed with a verdict.
- GAP routes (users CRUD) explicitly called out.
- LOCAL_PATTERN routes have brief description of existing validation.
- CSRF ordering noted for all routes.
- No code changed — audit only.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.5.3-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
