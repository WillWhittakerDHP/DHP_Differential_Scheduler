# Plan: task 8.5.3.3 — 8.5.3.3

## Contract
- **Tier:** task | **ID:** 8.5.3.3
- **Scope:** 8.5.3.3
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
- [ ] #### Task 8.5.3.3: Verify and close GC-8-JOI row **Goal:** Smoke API behavior; confirm checklist row **GC-8-JOI** can be marked done with evidence. **Files:** - `.project-manager/GAP_CLOSURE_CHECKLIST.md` **Approach:** Re-run targeted manual or harness checks; update row only when verified. **Checkpoint:** GC-8-JOI reflects verified state; app still starts. ---

## Parent context (session planning — Analysis excerpt)

- **Problem:** Some internal `POST`/`PUT`/`PATCH` handlers may omit the shared `validateRequest` middleware or equivalent Joi validation, which weakens input guarantees and makes security/governance audits noisy.
- **Why now:** Phase 8.5 is security headers + hardening; validation is part of the same “defense in depth” thread and is explicitly scoped as session 8.5.3 in the phase… _(truncated)_

## Story
**This task verifies** the user CRUD validation changes from task 8.5.3.2 and updates session documentation with evidence **because** the session acceptance criteria require verified closure before session-end.

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
- **Problem:** Tasks 8.5.3.1 (audit) and 8.5.3.2 (implementation) are done. We need to verify the changes work and document evidence so the session can close cleanly.
- **Boundary:** Docs-only task. No new code changes expected unless verification reveals a bug.
- **Risk:** Minimal — the code already passes TypeScript and lint.

## Design
1. Confirm `npm run start:dev` is running (already verified by dev server in terminal).
2. Run `cd server && npm run lint` one final time for a clean baseline.
3. Update the session log with a summary of what was accomplished across all 3 tasks.
4. Note: `GAP_CLOSURE_CHECKLIST.md` does not exist on disk; the evidence for this batch lives in the task 8.5.3.1 planning doc (audit table) and task 8.5.3.2 planning doc (implementation details). The session log will serve as the closure record.

## Goal
Verify app starts and server lint passes after task 8.5.3.2 changes; update session log with batch A closure evidence.

## Files
- `.project-manager/features/security-hardening/sessions/session-8.5.3-log.md` — update with verification evidence and session summary

## Approach
1. Verify `npm run start:dev` succeeds (check running terminal).
2. Run `cd server && npm run lint` — confirm clean.
3. Update session log with: (a) what was audited (31 routes, 3 GAP, 11 LOCAL_PATTERN, 17 COVERED), (b) what was fixed (user CRUD — 3 routes), (c) verification evidence.

## Checkpoint
- App starts confirmed.
- Server lint passes confirmed.
- Session log updated with batch A closure summary.

## Deliverables
- Verified app + lint baseline.
- Session log entry documenting batch A closure.

## Acceptance Criteria
- App starts without errors.
- Server lint passes.
- Session log has evidence summary for batch A Joi gap closure.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.5.3-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.5.3.2-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
