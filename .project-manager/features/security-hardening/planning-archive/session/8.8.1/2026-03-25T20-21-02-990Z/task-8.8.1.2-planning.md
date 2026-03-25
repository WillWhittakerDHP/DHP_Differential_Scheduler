# Plan: task 8.8.1.2 — 8.8.1.2

## Contract
- **Tier:** task | **ID:** 8.8.1.2
- **Scope:** 8.8.1.2
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
- [ ] #### Task 8.8.1.2: Wire validateRequest callbacks and update checklist **Goal:** Add `validateRequest` callbacks to all three CRUD router configs; update GC-8-JOI **Files:** - `server/src/routes/internal/users/userCrudRouter.ts` - `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` - `.project-manager/GAP_CLOSURE_CHECKLIST.md` **Approach:** Import schemas from task 1; add `validateRequest: (req, method) => { ... }` callback per CRUD config following `betaFeedbackCrudRouter` pattern. Update GC-8-JOI status and notes. Lint + verify server starts. **Checkpoint:** All th (See tier-up guide linked below)

## Parent context (session planning — Analysis excerpt)

**Problem:** `userCrudRouter.ts` and both CRUD instances in `propertyMappingsRouter.ts` use `createCrudRouter` without a `validateRequest` callback. Request bodies pass unsanitized to Sequelize.

**Domain:** Server-only, security domain. Admin/Config routers per ARCHITECTURE.md §2.

**Pattern to follow:** The CRUD factory `validateRequest` callback signature is `(req: Request, me… _(truncated)_

## Story
**This task consolidates** property-mapping Joi schemas into `propertyMappingSchemas.ts` and **updates** GC-8-JOI **because** the branch already had `validateRequest` on users (middleware) and property mappings (CRUD callbacks); the remaining gap was duplicate schema definitions and accurate checklist documentation.

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
`userCrudRouter.ts` on this branch is a custom Router (not `createCrudRouter`) and already uses `validateRequest` middleware with `userSchemas.ts`. Property mappings already wire `validateRequest` via `propertyMappingsValidators.ts` with inline Joi — duplicated with `propertyMappingSchemas.ts` from task 8.8.1.1.

## Design
**Consolidation:** Move canonical Joi object definitions into `server/src/routes/schemas/propertyMappingSchemas.ts` — export `fieldMappingCreateSchema`, `fieldMappingUpdatePatchSchema`, `featureMappingCreateSchema`, `featureMappingUpdatePatchSchema`, and `PROPERTY_FEATURE_MATCH_TYPES`.  
**Thin validators:** `propertyMappingsValidators.ts` imports those schemas and only runs `joiResult` + `validateFieldMappingBody` / `validateFeatureMappingBody`.  
**Checklist:** Update GC-8-JOI harness anchor to phase 8.8 / session 8.8.1 and refresh Notes.

## Goal
Add Joi-backed `validateRequest` callbacks to three CRUD router configurations that currently accept unvalidated request bodies: `userCrudRouter.ts` (User model), `propertyMappingsRouter.ts` field-mappings (PropertyFieldMapping model), and `propertyMappingsRouter.ts` feature-mappings (PropertyFeatureMapping model). Close the GC-8-JOI gap in `GAP_CLOSURE_CHECKLIST.md` accurately.

## Files
- `server/src/routes/schemas/propertyMappingSchemas.ts` — canonical Joi schemas (updated)
- `server/src/routes/internal/property-mappings/propertyMappingsValidators.ts` — import schemas from above; thin wrapper
- `server/src/routes/internal/users/userCrudRouter.ts` — no change required (already uses `validateRequest` + `userSchemas.ts`)
- `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` — no change required (already passes `validateRequest`)
- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — GC-8-JOI harness anchor + Notes

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
1. `propertyMappingSchemas.ts` — single source of truth for field/feature mapping Joi schemas
2. `propertyMappingsValidators.ts` — imports schemas; no duplicate Joi definitions
3. `GAP_CLOSURE_CHECKLIST.md` — GC-8-JOI row points to phase 8.8 / session 8.8.1

## Acceptance Criteria
- [ ] `propertyMappingsValidators` imports from `propertyMappingSchemas` only
- [ ] `cd server && npm run lint` passes
- [ ] GC-8-JOI row updated with accurate harness anchor and notes

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.8.1-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.8.1.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
