# Plan: task 8.5.3.2 — 8.5.3.2

## Contract
- **Tier:** task | **ID:** 8.5.3.2
- **Scope:** 8.5.3.2
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
- [ ] #### Task 8.5.3.2: Add Joi schemas and wire validation **Goal:** Add schemas and `validateRequest` for audited routes; follow existing server validation patterns; no silent fallbacks. **Files:** - `server/src/routes/internal/**/*.ts` - `server/src/validation/**` (or co-located schemas, per repo convention) **Approach:** Preserve middleware order; use project logger for any intentional warn paths. **Checkpoint:** Affected routes validate body/params/query per audit list.

## Parent context (session planning — Analysis excerpt)

- **Problem:** Some internal `POST`/`PUT`/`PATCH` handlers may omit the shared `validateRequest` middleware or equivalent Joi validation, which weakens input guarantees and makes security/governance audits noisy.
- **Why now:** Phase 8.5 is security headers + hardening; validation is part of the same “defense in depth” thread and is explicitly scoped as session 8.5.3 in the phase… _(truncated)_

## Story
**This task adds** Joi schemas and `validateRequest` middleware to the 3 user CRUD routes (POST/PUT/PATCH) that had zero body validation **because** invalid payloads currently pass straight through to the ORM, bypassing the project's standard defense-in-depth pattern used by entities, properties, and other validated routers.

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
- **Problem:** Task 8.5.3.1 audit found **3 hard GAP routes** (users CRUD: POST `/`, PUT `/:id`, PATCH `/:id`) with zero body validation. There are also 11 LOCAL_PATTERN routes, but the **priority** for this task is the hard GAPs.
- **Scope decision:** Focus on the 3 user CRUD GAP routes. LOCAL_PATTERN routes already have validators (inline Joi or domain checks); converting them is lower priority and risks breaking working code. Document them as accepted exceptions with rationale.
- **Boundary:** Server-only (`server/src/routes/`). No client or shared type changes.
- **Existing pattern to follow:** Joi schemas in `server/src/routes/schemas/` (see `propertySchemas.ts`, `entitySchemas.ts`); `validateRequest` middleware from `server/src/middlewares/validateRequest.ts`; middleware order: `csrfProtection` → `checkOwnership` (PUT/PATCH) → `validateRequest(schema)` → handler.
- **Risk:** The `createCrudRouter` factory doesn’t support injecting Express middleware into the chain. We need to either (a) add middleware support to the factory, or (b) switch `userCrudRouter` from the factory to explicit route registration (like `entityCrudRouter`). Option (b) is safer and matches the pattern of other validated routers.

## Design

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

## Goal
Add Joi body-validation schemas and wire `validateRequest` middleware for the **3 GAP user CRUD routes** identified in task 8.5.3.1. Document LOCAL_PATTERN routes as accepted exceptions.

## Files
- `server/src/routes/schemas/userSchemas.ts` — **new**: Joi schemas for user POST/PUT/PATCH
- `server/src/routes/internal/users/userCrudRouter.ts` — **modify**: replace `createCrudRouter` with explicit routes + `validateRequest`
- `server/src/routes/internal/users/userConstants.ts` — **read-only** reference
- `server/src/middlewares/validateRequest.ts` — **read-only** reference

## Approach
1. Create `server/src/routes/schemas/userSchemas.ts` with Joi schemas matching the User model fields.
2. Rewrite `userCrudRouter.ts` from `createCrudRouter` to explicit route registrations with `validateRequest` in the middleware chain.
3. Preserve existing behavior: same error messages, same CSRF/ownership order.
4. Verify app starts and server lint passes.
5. Document LOCAL_PATTERN exceptions in session log.

## Checkpoint
- `userCrudRouter.ts` uses explicit routes with `validateRequest` for POST/PUT/PATCH.
- Joi schemas match User model fields (firstName, lastName, email, phone, userRole).
- Middleware order: csrf → ownership → validateRequest → handler.
- `npm run start:dev` succeeds; `cd server && npm run lint` passes.

## Deliverables
- `server/src/routes/schemas/userSchemas.ts` with 3 Joi schemas.
- Rewritten `server/src/routes/internal/users/userCrudRouter.ts` with explicit validated routes.
- LOCAL_PATTERN exception documentation in session log.

## Acceptance Criteria
- User POST/PUT/PATCH routes reject invalid bodies with 400 + Joi details.
- Valid requests continue to work (same behavior as before).
- CSRF and ownership middleware order unchanged.
- No silent fallbacks or empty catch blocks.
- Server lint passes; app starts.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.5.3-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.5.3.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
