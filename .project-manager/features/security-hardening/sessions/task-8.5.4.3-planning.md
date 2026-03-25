# Plan: task 8.5.4.3 — 8.5.4.3

## Contract
- **Tier:** task | **ID:** 8.5.4.3
- **Scope:** 8.5.4.3
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
- [ ] #### Task 8.5.4.3: Verify + close GC-8-JOI **Goal:** Verify app starts + lint; produce combined A+B summary; update GC-8-JOI to done. **Files:** - `.project-manager/GAP_CLOSURE_CHECKLIST.md` (modify) **Approach:** Run verification checks. Write combined batch summary. Update checklist row. Update session docs. **Checkpoint:** GC-8-JOI is `done` with evidence. App starts; lint passes. ---

## Parent context (session planning — Analysis excerpt)

- **Problem:** Session 8.5.3 (batch A) audited mounts 1–11 of `server/src/routes/internal/index.ts` and found 3 GAP routes (users CRUD — fixed), 11 LOCAL_PATTERN routes (accepted exceptions), and 17 COVERED routes. Mounts 12–17 were not audited. Without completing this sweep, GC-8-JOI cannot be closed.
- **Why now:** This is the direct successor to 8.5.3. The gap-closure checklis… _(truncated)_

## Story
**This task verifies** server lint and documents cross-batch Joi closure **so that** row **GC-8-JOI** can be set to `done` with a single evidence pointer (sessions 8.5.3 + 8.5.4).

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

- **Problem:** GC-8-JOI is still `pending` on the checklist. Batches A (8.5.3) and B (8.5.4) are complete in code; this task records verification and closes the row.
- **Domains:** Docs + verification only; no new product code unless a doc fix is required.
- **Evidence:** Batch A — user CRUD + audit in `session-8.5.3-planning.md` / task planning. Batch B — property mappings in `propertyMappingsValidators.ts` + `propertyMappingsRouter.ts`; audit in `task-8.5.4.1-planning.md`.

## Design

### Combined closure summary (for Notes column)

- **Batch A (8.5.3):** Mounts 1–11 audited (31 mutating routes). **GAPs fixed:** users POST/PUT/PATCH (`userSchemas.ts`, explicit `userCrudRouter`). Remaining routes: COVERED (middleware `validateRequest`) or LOCAL_PATTERN (inline Joi / factory / domain validators); wizard logo multipart documented as exception.
- **Batch B (8.5.4):** Mounts 12–17 audited (12 mutating routes). **GAPs fixed:** property field-mappings + feature-mappings (6 routes) via factory `validateRequest` + Joi in `propertyMappingsValidators.ts`. Other batch B routes: COVERED, LOCAL_PATTERN (beta feedback), or N/A (dev GET-only).

### Checklist update

- Set **GC-8-JOI** `Status` → `done`.
- **Harness anchor** → `[session-8.5.4-guide.md](features/security-hardening/sessions/session-8.5.4-guide.md)` (session that closed the sweep).
- **Notes** → one line pointing to 8.5.3 + 8.5.4 task/session planning evidence.

## Goal

Run `cd server && npm run lint` (clean). Confirm dev server healthy if already running. Update `.project-manager/GAP_CLOSURE_CHECKLIST.md` row **GC-8-JOI** to `done` with harness anchor and Notes. Refresh session log **Last updated** line if present.

## Files

- `.project-manager/GAP_CLOSURE_CHECKLIST.md` — **modify** GC-8-JOI row only
- `.project-manager/features/security-hardening/sessions/session-8.5.4-log.md` — optional closing note (harness may update on task-end)

## Approach

1. Run `cd server && npm run lint`.
2. Edit `GAP_CLOSURE_CHECKLIST.md`: GC-8-JOI status, Harness anchor, Notes, footer `_Last updated_`.
3. No client lint required for this row (server-only Joi work); skip client lint per task scope unless session DoD requires it — session definition of done lists both; run client lint only if quick (user preference: verify app — dev server already running).

## Checkpoint

- Server lint exit 0.
- GC-8-JOI shows `done` with evidence text.

## Deliverables

- Updated `GAP_CLOSURE_CHECKLIST.md` (GC-8-JOI row).
- Verification note: server lint command + result.

## Acceptance Criteria

- `cd server && npm run lint` passes.
- GC-8-JOI status is `done`; Notes reference batch A + B closure.

## Definition of Done

- [ ] Server lint passes
- [ ] GC-8-JOI updated
- [ ] Session guide task status updated (via task-end)

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/security-hardening/sessions/session-8.5.4-guide.md`
- Handoff (full transition context): `.project-manager/features/security-hardening/sessions/task-8.5.4.2-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
