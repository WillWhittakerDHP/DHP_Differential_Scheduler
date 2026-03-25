# Plan: session 8.5.4 — Joi gap closure batch B — Audit remaining server/src/routes/internal routers for missing validateRequest; same constraints as 8.5.3; close or narrow GC-8-JOI when all targeted mutating routes are covered or explicitly exempted with documented rationale. Consult GAP_CLOSURE_HARNESS_ADD_PROMPTS.md and then update GAP_CLOSURE_CHECKLIST GC-8-JOI when batch is verified (lint + smoke).

## Contract
- **Tier:** session | **ID:** 8.5.4
- **Scope:** Joi gap closure batch B — Audit remaining server/src/routes/internal routers for missing validateRequest; same constraints as 8.5.3; close or narrow GC-8-JOI when all targeted mutating routes are covered or explicitly exempted with documented rationale. Consult GAP_CLOSURE_HARNESS_ADD_PROMPTS.md and then update GAP_CLOSURE_CHECKLIST GC-8-JOI when batch is verified (lint + smoke).
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
Completed Task - Begin Session <!-- harness-across-ladder:start -->

## Story
**This session delivers** Joi validation coverage on the remaining internal mutating routes (batch B — mounts 12–17) and a final cross-batch closure assessment **so that** GC-8-JOI can be marked done with evidence that every internal POST/PUT/PATCH route is validated or explicitly exempted.
**Estimated size:** M

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

## Decomposition

- **Task 8.5.4.1:** Audit batch B routes (mounts 12–17) — enumerate POST/PUT/PATCH, classify COVERED/LOCAL_PATTERN/GAP, document in planning doc
- **Task 8.5.4.2:** Add Joi validators for property mapping GAPs — create `propertyMappingsValidators.ts`, wire `validateRequest` callbacks in `propertyMappingsRouter.ts`, run server lint
- **Task 8.5.4.3:** Verify + close GC-8-JOI — app starts, server lint, combined A+B summary, update checklist, update session docs

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd server && npm run lint`)
- [ ] All child tasks complete
- [ ] GC-8-JOI updated to `done` in GAP_CLOSURE_CHECKLIST.md
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.5-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/session-8.5.3-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
