# Plan: session 8.5.3 — Joi gap closure — internal routes batch A

## Contract
- **Tier:** session | **ID:** 8.5.3
- **Scope:** Joi gap closure — internal routes batch A (server `validateRequest` + Joi on mutating internal routes)
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
Phase 8.5 session 8.5.2 (CSP via Helmet) is complete. This session continues **security-hardening** by closing documented Joi/validation gaps on **internal** Express routes (batch A — first half of the internal tree per task 8.5.3.1 scope). <!-- harness-across-ladder:start -->

## Story
**This session delivers** systematic Joi validation on mutating internal routes in batch A **so that** invalid payloads fail fast with consistent 400s, CSRF/ownership ordering stays correct, and the gap-closure checklist row for this batch can be marked verified with evidence.
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

## Acceptance criteria
- All `POST`/`PUT`/`PATCH` handlers in **batch A** that accept JSON/body either use `validateRequest` with a Joi schema or have an explicit, documented exception (logged, not silent).
- CSRF and ownership middleware order unchanged for affected routes unless a deliberate security review says otherwise (document in session log).
- `.project-manager/GAP_CLOSURE_CHECKLIST.md` row **GC-8-JOI** reflects verified closure.
- `npm run start:dev` succeeds; `cd server && npm run lint` passes (client lint if any shared types touched).

## Decomposition
- **Task 8.5.3.1:** Audit internal routes (batch A) — inventory gaps; fix route list if harness “first half” needs a concrete rule (e.g. directories A–M or ordered list in session log).
- **Task 8.5.3.2:** Add Joi schemas and wire `validateRequest` for every gap in scope.
- **Task 8.5.3.3:** Verify API behavior, run lint, update **GC-8-JOI** and session documentation.

**Leaf tier:** Session is not a leaf — implementation happens in **tasks 8.5.3.1–8.5.3.3** via `/task-start` after `/accepted-plan`.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] All child tasks complete
- [ ] Session log and handoff updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/phases/phase-8.5-guide.md`
- Session guide (tasks): `.project-manager/features/security-hardening/sessions/session-8.5.3-guide.md`
- Gap closure checklist: `.project-manager/GAP_CLOSURE_CHECKLIST.md` (row **GC-8-JOI**)
- Handoff (prior session): `.project-manager/features/security-hardening/sessions/session-8.5.2-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
