# Plan: task 6.17.3.2 — 6.17.3.2

## Contract
- **Tier:** task | **ID:** 6.17.3.2
- **Scope:** 6.17.3.2
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
- [ ] #### Task 6.17.3.2: Delete wizard composable + shell **Goal:** `useAdminEntityDeleteWizard` + `AdminEntityDeleteWizard.vue` **Files:** `client/src/composables/admin/useAdminEntityDeleteWizard.ts`, `client/src/components/admin/generic/AdminEntityDeleteWizard.vue`

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Server **6.17.2** implements real preflight/resolve/finalize for at least **`part_shape`**. Without a shared client orchestration layer, **6.17.4** would duplicate URL construction, token handling, and step logic across list and card.
- **Domain boundaries:** **Admin client** only (`client/src/composables/admin/`, `components/admin/`, `utils/admin/`). **S… _(truncated)_

## Story
**This task adds** a **`useAdminEntityDeleteWizard`** composable and a thin **`AdminEntityDeleteWizard`** `VDialog` shell **because** Session **6.17.3.1** delivered typed HTTP helpers only — orchestration and UX must live in a reusable composable + component so **6.17.4** can open the same dialog from list/card without duplicating preflight/finalize logic.

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
| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Phase 6.18) |
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

**Booking resolution boundary:** The server serves **configuration and raw storage rows** (e.g. part instances, relationships) plus appointment-scoped inputs such as `property_details`. **PartFinalizer** on the **client** resolves wizard time, fee, and segment placement for the live booking flow. On submit, the client sends a **full appointment payload**; the server **persists** it and does **not** re-run PartFinalizer to recompute or “verify” those totals. Do not introduce a second booking calculator on the server for the same contract (see §10).

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

## Codebase recon (agent-led — required)

- **Paths reviewed:**
  - `client/src/utils/api/entityDeleteContractApi.ts` — `fetchDeletePreflight`, `postDeleteResolve`, `postDeleteFinalize`, `DeleteContractApiError`.
  - `server/src/routes/internal/entities/entityDeleteContractFacade.ts` — preflight issues token; finalize **consumes** token; if `!snapshot.canDirectDelete` → **`HARD_BLOCKED`** (no finalize). Direct path: preflight (`canDirectDelete: true`) → **finalize** with `preflightToken` (resolve optional for `part_shape` when only noop — not required before finalize for direct delete).
  - `server/.../partShapeDependencyDeleteStrategy.ts` — blocked path: `hard_blocked` edges; direct path: `canDirectDelete` when `totalCount === 0`.
  - Admin dialog patterns: `client/src/components/admin/BulkEditModal.vue` (`VDialog` + `VCard` + title/actions); `client/src/components/admin/generic/EntityCard.vue` (simple delete `VDialog`).
- **Patterns / call sites:** Thin SFC; props `modelValue`, `entityKey`, `entityId`, `entityLabel`; `VBtn` Cancel / primary Delete; `useDisplay` if needed for responsive — not required for first version.
- **Gaps / unknowns:** Future policies (`reassign_required`, etc.) will need resolve UI — v1 shows graph + **blocked** copy + **confirm delete** when `canDirectDelete`; `postDeleteResolve` can be wired when strategies emit non–hard-block edges (later sessions).

## Analysis
- **Problem:** 6.17.3.1 exposes raw API calls; parents need a **state machine** + **dialog** that maps server semantics (`canDirectDelete`, `hard_blocked`, tokens) to buttons and copy.
- **Boundaries:** Client admin only. Uses `@shared` DTO types via API module; **no** new shared types. Composable: explicit **`UseAdminEntityDeleteWizardReturn`**; public reads via **`ComputedRef`** where appropriate; actions as named functions (no leaked writable refs).
- **Server contract (verified):** Finalize **consumes** `preflightToken` and rejects finalize when `!canDirectDelete` (`HARD_BLOCKED`). Direct delete: one preflight + one finalize with body `{ entityType, entityId, preflightToken }`. **Resolve** is not required on the happy path for `part_shape` direct delete.
- **Risks:** Oversized composable return — keep surface ≤ ~10 public fields; split helpers if needed.

## Design

### Composable `useAdminEntityDeleteWizard()`
- **Internal state:** `phase` ref: `'idle' | 'loading_preflight' | 'ready' | 'blocked' | 'finalizing' | 'success' | 'error'`.
- **Data:** `preflight` ref (`DeletePreflightResponse | null`), `lastError` ref (`string | null`), `lastErrorCode` ref (`DeleteContractErrorCode | undefined`).
- **Actions:**
  - `reset()` — clear state, set `idle`.
  - `runPreflight(entityKey, entityId)` — sets loading, calls `fetchDeletePreflight`, stores result; if `!canDirectDelete` → `blocked`; else `ready`.
  - `confirmFinalize(entityKey, entityId)` — only when `phase === 'ready'` and `preflight?.preflightToken`; calls `postDeleteFinalize` with `{ entityType, entityId, preflightToken }`; on success → `success`.
  - Errors: catch `DeleteContractApiError`, set message + code, `phase = 'error'`.
- **Computed:** `isBlocked`, `canConfirmDelete`, `dependencySummary` (derive short list text from `nodes`/`edges`/`blockedReasons` for UI).
- **Export:** `UseAdminEntityDeleteWizardReturn` interface with explicit return type.

### Component `AdminEntityDeleteWizard.vue`
- **Location:** `client/src/components/admin/generic/AdminEntityDeleteWizard.vue`.
- **Props:** `modelValue: boolean`, `entityKey: GlobalEntityKey` (or string matching entity route key), `entityId: string`, `entityLabel: string`.
- **Emits:** `update:modelValue`, `finalized` (payload `{ entityId }` after successful finalize), `cancel`.
- **Behavior:** `watch(() => props.modelValue, open => { if (open) runPreflight(...) else reset() })`. Template: `VDialog` + `VCard`; show loading skeleton/spinner; **blocked** path: list `blockedReasons` + edges policy/message; disable Delete; **ready** path: confirm copy + Delete button; **success** path: short message + Close (or auto-close emit).
- **Styling:** Match `BulkEditModal` / `EntityCard` delete dialog density; use `tabler-*` icons if used elsewhere.

## Goal
Deliver **only** the composable + wizard shell for dependency-aware delete (preflight → blocked or confirm → finalize). **Exclude** wiring into `EntityCard` / list delete (**6.17.4**).

## Files
- **New:** `client/src/composables/admin/useAdminEntityDeleteWizard.ts`
- **New:** `client/src/components/admin/generic/AdminEntityDeleteWizard.vue`

## Approach
1. Implement composable with typed return + small pure helper for edge display strings (extract if branchy).
2. Implement wizard SFC: bind composable instance; template branches on `phase` / `isBlocked` / `canConfirmDelete`.
3. Run `npm run lint` on `client/`.

## Checkpoint
- Opening dialog triggers preflight; blocked `part_shape` shows dependency message without throwing.
- Direct-delete path completes finalize (manual test with a deletable part shape in dev).
- Lint clean.

## Deliverables
- `useAdminEntityDeleteWizard` with explicit return type.
- `AdminEntityDeleteWizard.vue` with props/emits documented in script.

## Acceptance Criteria
- [ ] Composable exposes stable action names + `ComputedRef` read surfaces (no `Ref|ComputedRef` unions at public boundary).
- [ ] Wizard shows **loading**, **blocked** (no finalize when `!canDirectDelete`), and **ready** (Delete enabled when `canDirectDelete` and token present).
- [ ] Successful finalize emits **`finalized`** with entity id; parent can invalidate queries in 6.17.4.
- [ ] No integration into list/card in this task.
- [ ] Client lint passes.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.17.3-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.17.3.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
