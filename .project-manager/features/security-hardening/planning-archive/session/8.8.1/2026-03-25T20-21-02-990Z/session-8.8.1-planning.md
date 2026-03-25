# Plan: session 8.8.1 — ** ** Create Joi schemas for User, PropertyFieldMapping, and PropertyFeatureMapping models; wire `validateRequest` callbacks into all three CRUD router configs; run server lint; update GC-8-JOI checklist

## Contract
- **Tier:** session | **ID:** 8.8.1
- **Scope:** ** ** Create Joi schemas for User, PropertyFieldMapping, and PropertyFeatureMapping models; wire `validateRequest` callbacks into all three CRUD router configs; run server lint; update GC-8-JOI checklist
- **Governance (harness snapshot):**
  - Governance Context (Session)
  - Function Governance
  - Clean — no violations detected.
  - Component Governance
  - Clean — no violations detected.
  - 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
  - `client/src/composables/booking/useAvailabilitySubStepContent.ts` — oversized-return: Return surface has 15 properties; decompose into focused composables

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs, architecture
- **Gate profile:** standard
- **Suggested depth:** full — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
Phase 8.7 completed ownership checks. GC-8-JOI was marked "done" but code audit found 3 CRUD router configs with zero validation. Phase 8.8 was created to close the gap.

## Story
**This session delivers** Joi schemas and `validateRequest` callbacks for the 3 remaining unvalidated CRUD routers **so that** all internal mutating routes reject malformed payloads at the middleware layer, and GC-8-JOI is accurately closed.
**Estimated size:** S

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

## 5. Per-domain conventions

### Booking / wizard

- **Composable prefixes:** `useBooking*`, `useAvailability*`, `useWizard*`, `useAppointment*`, `useProperty*` (orchestrators such as `useAvailabilityOrchestrator`, `useBookingWizardSetup`).
- **Components:** under `components/booking/` (steps in `components/booking/steps/`).
- **Depends on** admin metadata (wizard blocks, availability rules) — document cross-domain deps in planning **Analysis**.

### Admin

- **Prefixes:** `useAdmin*`, `useEntity*`, entity CRUD around `EntityBase<GlobalEntityKey>` + `ENTITY_CONFIGS`.
- **Pattern:** Generic admin components + config objects + transformers.

### Auth

- **Emerging domain;** keep route and model changes aligned with `routes/internal/auth` and `db/models/auth`. Consumed by all domains via middleware/guards over time.

### Integrations

- Prefer **dedicated services** and **external routes**; avoid mixing full-URL axios into `apiClient` call sites without reason.

### Beta

- Isolated feedback capture; keep `beta` paths grouped under composables/views/components/beta.

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

## Decomposition
- **Task 8.8.1.1:** Create Joi schema files — `userSchemas.ts` and `propertyMappingSchemas.ts` with create/update/patch schemas for all three models
- **Task 8.8.1.2:** Wire `validateRequest` callbacks into `userCrudRouter.ts` and `propertyMappingsRouter.ts` (both CRUD instances); run server lint; update GC-8-JOI checklist

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.8-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
