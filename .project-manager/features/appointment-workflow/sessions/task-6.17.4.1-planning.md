# Plan: task 6.17.4.1 — List rows: contract-aware delete (registry keys)

## Contract
- **Tier:** task | **ID:** 6.17.4.1
- **Scope:** Wire **admin entity list** delete so keys in the dependency-delete contract use `AdminEntityDeleteWizard` + preflight/finalize; v1 registry = **`partShape`** only. **Out of scope for this task:** entity-card delete (task **6.17.4.2**).
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
Session **6.17.4** approved; first task is list-row wiring for contract-backed deletes.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** 6.17.3 built the wizard + API client; list rows still call plain `remove` → raw `DELETE`.
- **Domains:** Admin + client HTTP only for this task.
- **Patterns:** Thin list SFCs; shared helpers in `utils/admin`; TanStack `globalData` invalidation unchanged.

## Story
**This task changes** list-row delete for **`partShape`** (and any key in the client mirror of `dependencyDeleteRegistry`) **so that** operators see dependency preflight/blocking UX from the list without waiting for task 6.17.4.2 (cards).

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
Injected docs above are not a substitute for opening real code. Search/read `client/`, `server/`, and `shared/` as relevant to this tier.

- **Paths reviewed:**
  - `client/src/utils/admin/entityList.ts` — `handleDelete`: `confirm` → `remove(id)`; used by `useBlockInstanceList` and similar.
  - `client/src/utils/admin/entityListDelete.ts` — same pattern for SFCs that pass `useEntityCrud().remove` (e.g. `PartShapeList.vue`, `BlockShapeList.vue`).
  - `client/src/views/admin/entities/PartShapeList.vue` — `entityListDelete({ remove, confirmMessage, ... })`.
  - `client/src/components/admin/generic/AdminEntityDeleteWizard.vue` — `entityKey`, `entityId`, `entityLabel`, `v-model`; emits `finalized` / `cancel`.
  - `server/src/services/entityDelete/dependencyDeleteRegistry.ts` — only `partShape` registered today.
- **Patterns / call sites:** Lists either use `entityList()` composable helper or `entityListDelete()` directly. Contract wizard already expects `GlobalEntityKey` + string id + label.
- **Gaps / unknowns:** After finalize, today’s `remove()` mutation already invalidates `globalData`; wizard finalize must trigger the same invalidation (e.g. `queryClient.invalidateQueries({ queryKey: ['globalData'] })`) if not handled inside wizard.

## Analysis
- **Problem:** Part shape rows use legacy delete; server can return structured contract errors on plain DELETE — list UX should use preflight/finalize flow for registered keys.
- **Boundaries:** Client admin only; no server edits required if registry already correct.
- **Risks:** Client allowlist drifts from server registry — mitigate with a single exported constant + comment pointing at `dependencyDeleteRegistry.ts`.
- **Alternatives:** Per-list `if (entityKey === 'partShape')` only — rejected: duplicate logic when 6.17.5 adds keys.

## Design

1. **New module** `client/src/utils/admin/dependencyDeleteContractKeys.ts` (name may adjust):
   - `export const DEPENDENCY_DELETE_CONTRACT_ENTITY_KEYS: readonly GlobalEntityKey[] = ['partShape']`
   - `export function usesDependencyDeleteContract(entityKey: GlobalEntityKey): boolean`
   - File comment: *Keep in sync with `server/src/services/entityDelete/dependencyDeleteRegistry.ts`.*

2. **Extend `entityList` (`entityList.ts`):** Optional `contractDelete?: { run: (id: GlobalEntityId) => Promise<void> }` (or named `onContractDelete`). When `usesDependencyDeleteContract(entityKey)` **and** `contractDelete` is provided, `handleDelete` **skips** `remove` and calls `contractDelete.run(id)` after the same confirm step **or** skip browser `confirm` if wizard owns confirmation — **Decision:** keep one lightweight `confirm` before opening wizard for parity with current lists, **or** rely on wizard copy only; **prefer** skip outer confirm when `contractDelete` is set (wizard has its own steps) to avoid double confirmation.

3. **Extend `entityListDelete`:** Same optional hook for SFCs that do not use `entityList()`.

4. **`PartShapeList.vue`:** Mount `AdminEntityDeleteWizard` + refs for `dialogOpen`, `pendingDeleteId`, `pendingLabel` (from row). Pass `contractDelete` / updated handler so delete button opens wizard with selected row. On `@finalized`, invalidate `['globalData']` (match `createEntityRemoveMutationOptions` behavior) and close dialog.

5. **Pseudocode (PartShapeList):**
   ```
   const pending = ref<{ id, label } | null>(null)
   const wizardOpen = computed(() => pending != null)
   handleDelete = (id) => { pending = { id, label: lookupLabel(id) }; /* no confirm */ }
   Wizard @finalized -> invalidateQueries globalData; pending = null
   ```

## Goal
Admin **list** delete for **`partShape`** runs through **AdminEntityDeleteWizard** + delete contract HTTP. All other list keys keep existing confirm + `remove`. **Cards** unchanged (6.17.4.2).

## Files
- **Add:** `client/src/utils/admin/dependencyDeleteContractKeys.ts`
- **Edit:** `client/src/utils/admin/entityList.ts`, `entityListDelete.ts`
- **Edit:** `client/src/views/admin/entities/PartShapeList.vue` (wizard + wiring)
- **Read-only reference:** `server/src/services/entityDelete/dependencyDeleteRegistry.ts`, `AdminEntityDeleteWizard.vue`

## Approach
Implement Design §1–§4 in order; run `npm run lint` in `client/`; manually smoke: open Part shapes list → delete → wizard appears → success path invalidates list.

## Checkpoint
- PartShape list delete opens wizard; legacy lists (e.g. blockShape if not in registry) unchanged.
- `globalData` refetch after successful finalize.

## Deliverables
- Client registry helper + `entityList` / `entityListDelete` contract hook.
- `PartShapeList` integrated with wizard + invalidation.

## Acceptance Criteria
- [ ] `usesDependencyDeleteContract('partShape') === true`; `usesDependencyDeleteContract('blockShape') === false` (until registry extended).
- [ ] Deleting from Part shapes list never calls plain `remove` for the primary path when wizard completes (finalize handles persistence).
- [ ] No double-delete or stale table after successful wizard completion.
- [ ] `cd client && npm run lint` passes.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
