# Plan: task 8.5.4.2 — 8.5.4.2

## Contract
- **Tier:** task | **ID:** 8.5.4.2
- **Scope:** 8.5.4.2
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
- [ ] #### Task 8.5.4.2: Add Joi validators for property mapping GAPs **Goal:** Create validators and wire `validateRequest` factory callbacks for the 6 GAP routes in field-mappings and feature-mappings. **Files:** - `server/src/routes/internal/property-mappings/propertyMappingsValidators.ts` (new) - `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` (modify) **Approach:** Create Joi-based validators matching model fields. Wire `validateRequest` callbacks + `sanitizeInput` into `createCrudRouter` configs. Server lint. **Checkpoint:** Property mapping routes reject invalid (See tier-up guide linked below)

## Parent context (session planning — Analysis excerpt)

- **Problem:** Session 8.5.3 (batch A) audited mounts 1–11 of `server/src/routes/internal/index.ts` and found 3 GAP routes (users CRUD — fixed), 11 LOCAL_PATTERN routes (accepted exceptions), and 17 COVERED routes. Mounts 12–17 were not audited. Without completing this sweep, GC-8-JOI cannot be closed.
- **Why now:** This is the direct successor to 8.5.3. The gap-closure checklis… _(truncated)_

## Story
**This task adds** Joi-based validators and `validateRequest` factory callbacks to the 6 property mapping CRUD routes (field-mappings + feature-mappings) **because** they currently accept any body payload without validation, passing untrusted input directly to the ORM.

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

- **Problem:** Task 8.5.4.1 identified 6 GAP routes in `propertyMappingsRouter.ts` — both `createCrudRouter` instances (field-mappings and feature-mappings) have zero body validation.
- **Domains:** Server internal API only. No client changes.
- **Pattern to follow:** `betaFeedbackCrudRouter.ts` — uses `createCrudRouter` with a `validateRequest` factory callback. The factory calls the callback inside the handler before DB operations and sends 400 on failure via `handleValidationResult`.
- **Risks:** Over-constraining admin mapping payloads. Mitigate by deriving schemas from model field definitions (types, lengths, nullability) and keeping update/patch permissive with `.min(1)`.

## Design

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

## Goal

Add Joi-based body validation to the 6 GAP routes in `propertyMappingsRouter.ts` (field-mappings POST/PUT/PATCH + feature-mappings POST/PUT/PATCH) via `createCrudRouter` factory `validateRequest` callbacks.

## Files

- `server/src/routes/internal/property-mappings/propertyMappingsValidators.ts` — **new**: validators for field and feature mapping CRUD
- `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` — **modify**: wire `validateRequest` callbacks

## Approach

1. Create `propertyMappingsValidators.ts` with 4 validation functions (create + update for each mapping type).
2. Import validators into `propertyMappingsRouter.ts`.
3. Add `validateRequest` callback to both `createCrudRouter` configs.
4. Run `cd server && npm run lint`.

## Checkpoint

- Property mapping routes reject invalid bodies with 400 + validation details.
- Valid requests continue to work (same behavior).
- CSRF and ownership middleware order unchanged (factory-managed).
- Server lint passes.

## Deliverables

- `server/src/routes/internal/property-mappings/propertyMappingsValidators.ts` with 4 validation functions.
- Modified `propertyMappingsRouter.ts` with `validateRequest` callbacks wired.

## Acceptance Criteria

- Field mapping POST/PUT/PATCH reject bodies missing required fields (sourceField, targetField for create).
- Feature mapping POST/PUT/PATCH reject bodies missing required fields (sourceField, matchType, blockInstanceId for create).
- Update/patch accept partial bodies with `.min(1)`.
- No silent fallbacks or empty catch blocks.
- Server lint passes; app starts.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd server && npm run lint`)
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.5.4-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.5.4.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
