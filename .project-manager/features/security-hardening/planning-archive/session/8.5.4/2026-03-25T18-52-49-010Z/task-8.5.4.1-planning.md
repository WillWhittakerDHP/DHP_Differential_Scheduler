# Plan: task 8.5.4.1 — 8.5.4.1

## Contract
- **Tier:** task | **ID:** 8.5.4.1
- **Scope:** 8.5.4.1
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
- [ ] #### Task 8.5.4.1: Audit batch B routes (mounts 12–17) **Goal:** Enumerate all POST/PUT/PATCH in batch B scope; classify as COVERED/LOCAL_PATTERN/GAP; document findings in planning doc. **Files:** - `server/src/routes/internal/index.ts` (read-only — mount order) - All router files under mounts 12–17 (read-only) **Approach:** Walk each batch B mount's router files. For each `router.post`/`.put`/`.patch`, inspect middleware chain. Classify and record. **Checkpoint:** Audit table complete with all batch B mutating routes classified.

## Parent context (session planning — Analysis excerpt)

- **Problem:** Session 8.5.3 (batch A) audited mounts 1–11 of `server/src/routes/internal/index.ts` and found 3 GAP routes (users CRUD — fixed), 11 LOCAL_PATTERN routes (accepted exceptions), and 17 COVERED routes. Mounts 12–17 were not audited. Without completing this sweep, GC-8-JOI cannot be closed.
- **Why now:** This is the direct successor to 8.5.3. The gap-closure checklis… _(truncated)_

## Story
**This task produces** a structured audit of every POST/PUT/PATCH handler in batch B (mounts 12–17 of `server/src/routes/internal`) **because** task 8.5.4.2 needs an objective gap list before adding validators, and GC-8-JOI requires traceable evidence of what was inspected.

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

- **Problem:** Mounts 12–17 of `server/src/routes/internal` were not audited in batch A (session 8.5.3). Task 8.5.4.2 needs a gap list before implementing validators.
- **Why now:** Direct prerequisite for batch B implementation. No code changes in this task — audit only.
- **Domains:** Server internal API (read-only inspection). No cross-domain impact.
- **Patterns:** Same classification used in 8.5.3 task 8.5.3.1: COVERED (shared `validateRequest` middleware), LOCAL_PATTERN (factory callback or inline validators), GAP (no validation), N/A (no mutating routes).

## Design

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

## Goal

Produce a structured, traceable audit of every POST/PUT/PATCH handler in batch B (`server/src/routes/internal` mounts 12–17) documenting: (a) whether `validateRequest` middleware is present, (b) what local/inline validation exists, (c) CSRF/ownership middleware ordering. No code changes — audit only.

## Files

- `server/src/routes/internal/index.ts` — mount order reference (read-only)
- `server/src/routes/internal/organizationDefaults/organizationDefaultsCrudRouter.ts` — read-only
- `server/src/routes/internal/admin-metadata/adminMetadataCrudRouter.ts` — read-only
- `server/src/routes/internal/dev/devStatusRouter.ts` — read-only
- `server/src/routes/internal/beta-feedback/betaFeedbackCrudRouter.ts` — read-only
- `server/src/routes/internal/property-mappings/propertyMappingsRouter.ts` — read-only
- `server/src/routes/internal/event-instance-preview/eventInstancePreviewRouter.ts` — read-only

## Approach

1. Walk each batch B mount's router files (already completed during session planning).
2. For each `router.post`/`.put`/`.patch`, inspect middleware chain.
3. Classify as COVERED / LOCAL_PATTERN / GAP.
4. Record in the Design section audit table above.
5. No code changes; this task is audit-only.

## Checkpoint

- Audit table complete and accurate (12 routes inspected across 6 mount points).
- GAPs and LOCAL_PATTERN candidates clearly identified for task 8.5.4.2.

## Deliverables

- Completed audit table in Design section (12 routes).
- Summary: 3 COVERED, 3 LOCAL_PATTERN, 6 GAP.
- Actionable guidance for task 8.5.4.2.

## Acceptance Criteria

- Every POST/PUT/PATCH in batch B scope is listed with a verdict.
- GAP routes (property mappings, 6 total) explicitly called out.
- LOCAL_PATTERN routes (betaFeedback) have brief description of existing validation.
- CSRF ordering noted for all routes.
- No code changed — audit only.

## Definition of Done

- [ ] Audit table complete in Design section
- [ ] GAP and LOCAL_PATTERN routes identified with rationale
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.5.4-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
