# Plan: task 8.8.1.1 — 8.8.1.1

## Contract
- **Tier:** task | **ID:** 8.8.1.1
- **Scope:** 8.8.1.1
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
- [ ] #### Task 8.8.1.1: Create Joi schema files **Goal:** Define Joi schemas for User, PropertyFieldMapping, and PropertyFeatureMapping (create/update/patch per model) **Files:** - `server/src/routes/schemas/userSchemas.ts` (new) - `server/src/routes/schemas/propertyMappingSchemas.ts` (new) **Approach:** Follow existing schema pattern (`entitySchemas.ts`, `propertySchemas.ts`). Define create/update schemas with required fields; patch schemas with all optional but `.min(1)`. Use `.unknown(true)` for forward compat. **Checkpoint:** Schema files export named Joi schemas; `cd server && npm run li (See tier-up guide linked below)

## Parent context (session planning — Analysis excerpt)

**Problem:** `userCrudRouter.ts` and both CRUD instances in `propertyMappingsRouter.ts` use `createCrudRouter` without a `validateRequest` callback. Request bodies pass unsanitized to Sequelize.

**Domain:** Server-only, security domain. Admin/Config routers per ARCHITECTURE.md §2.

**Pattern to follow:** The CRUD factory `validateRequest` callback signature is `(req: Request, me… _(truncated)_

## Story
**This task creates** two new Joi schema files (`userSchemas.ts`, `propertyMappingSchemas.ts`) **because** the CRUD routers for User, PropertyFieldMapping, and PropertyFeatureMapping need schemas to validate request bodies before they reach Sequelize.

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
Server-only, no cross-domain. Creates two files in `server/src/routes/schemas/` following the established Joi schema pattern. No risks — additive only.

## Design

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
1. `server/src/routes/schemas/userSchemas.ts` — 3 named Joi schema exports
2. `server/src/routes/schemas/propertyMappingSchemas.ts` — 6 named Joi schema exports

## Acceptance Criteria
- [ ] `userSchemas.ts` exports `userCreateBodySchema`, `userUpdateBodySchema`, `userPatchBodySchema`
- [ ] `propertyMappingSchemas.ts` exports field-mapping and feature-mapping schemas (create/update/patch × 2 models)
- [ ] All schemas use `.unknown(true)` for forward compatibility
- [ ] Create/update schemas enforce required fields; patch schemas use `.min(1)`
- [ ] `cd server && npm run lint` passes

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
