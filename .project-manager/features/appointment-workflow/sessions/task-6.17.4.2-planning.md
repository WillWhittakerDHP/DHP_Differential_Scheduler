# Plan: task 6.17.4.2 — 6.17.4.2

## Contract
- **Tier:** task | **ID:** 6.17.4.2
- **Scope:** 6.17.4.2
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
- [ ] #### Task 6.17.4.2: Entity card — dependency delete wizard **Goal:** For `partShape` (and future registry keys), card delete opens `AdminEntityDeleteWizard` instead of raw confirm + `remove`; match list behavior and cache invalidation.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** 6.17.3 built the wizard + API client; operators still delete from lists/cards via raw `DELETE`, so they never see preflight/blocking UX. This session connects product surfaces to the contract for registered types.
- **Domains:** Admin config + client HTTP + shared DTOs already defined; no booking domain change.
- **Patterns child tiers follow:** Thin list… _(truncated)_

## Story
**This task changes** entity-card delete for keys in `usesDependencyDeleteContract` **because** operators editing a **part shape** (and future registered types) from a card still used browser confirm + direct `remove`, bypassing preflight/blocking UX. **6.17.4.1** wired the **list** path (`PartShapeList` + `entityListDelete` `contractDelete`); this task wires the **card** path (`EntityCard` → `useEntityCardActions` / `executeEntityCardDelete`).

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

- **Paths reviewed:** `client/src/utils/admin/dependencyDeleteContractKeys.ts` (allowlist + `usesDependencyDeleteContract`); `client/src/views/admin/entities/PartShapeList.vue` (reference: `AdminEntityDeleteWizard` + `entityListDelete({ contractDelete })` + `invalidateQueries(['globalData'])` on `@finalized`); `client/src/components/admin/generic/EntityCard.vue` (uses `useEntityCardSaveAndActions`; `VDialog` confirm + `handleDelete`); `client/src/composables/admin/useEntityCardSaveAndActions.ts` (wraps `useEntityCardActions`); `client/src/composables/admin/useEntityCardActions.ts` + `entityCardActionsPersistence.ts` (`executeEntityCardDelete` → `remove` only); `client/src/types/admin/entityCardActions.ts`, `entityCardSaveAndActions.ts`.
- **Patterns / call sites:** List path already branches on `contractDelete` in `entityList` / `entityListDelete`. Card path always opens `showDeleteDialog` then `handleDelete` → `executeEntityCardDelete`. Contract keys must skip that dialog and open the same wizard component as the list, then on success invalidate `globalData` and emit `delete` like today’s `onDelete` callback.
- **Gaps / unknowns:** Whether `AdminEntityDeleteWizard` already shows success toasts (avoid duplicate notifications when adding `success()` in finalized handler) — verify in wizard + align with list `onDeleteWizardFinalized` (list only invalidates + closes).

## Analysis
- **Problem / why now:** Session 6.17.4 requires **list + card** entry points for the dependency-delete contract. **6.17.4.1** completed the list (`PartShapeList`). Cards still call `executeEntityCardDelete` → direct `remove`, so operators miss preflight and blocking explanations.
- **Domains:** Admin config client only; reuses existing `@/utils/api/entityDeleteContractApi` via `AdminEntityDeleteWizard`. No server or shared type changes unless a type export is needed for new composable surface.
- **Grounding:** `EntityCard.vue` funnels delete through `useEntityCardSaveAndActions` → `useEntityCardActions` → `executeEntityCardDelete`. Branching must mirror `usesDependencyDeleteContract(entityKey)` from `dependencyDeleteContractKeys.ts` (stays aligned with server `dependencyDeleteRegistry`).
- **Patterns to follow:** Same wizard props as `PartShapeList` (`entity-key`, `entity-id`, `entity-label`, `v-model` open, `@finalized`). Thin component: keep orchestration in `useEntityCardActions` (or a tiny helper) so `EntityCard.vue` only binds template.
- **Risks:** Duplicate success toasts if both wizard and composable call `success()`. **Mitigation:** match `PartShapeList` finalized behavior (invalidate + close + reset state); add `success()` only if wizard does not already notify.
- **Alternatives considered:** (1) Embed wizard only in `PartShapeForm` — rejected: other views using `EntityCard` for `partShape` would stay wrong; (2) Push all logic into `EntityCard.vue` — rejected: violates thin-component / composable governance.

## Design
1. **`useEntityCardActions`:** If `usesDependencyDeleteContract(entityKey)` and `!isNew`, `handleDeleteClick` opens contract wizard state (refs: dialog open, string `entityId`, human-readable `entityLabel` derived from current entity, e.g. `name` fallback like the list). Otherwise keep existing `showDeleteDialog = true`.
2. **Finalized handler:** `queryClient.invalidateQueries({ queryKey: ['globalData'] })`, invoke existing `onDelete` with the deleted id (parent emits `delete`), clear wizard state / close. Optionally mirror `executeEntityCardDelete` success string only if wizard does not surface completion — **verify wizard UX first**.
3. **`handleDelete` (legacy dialog):** For contract keys, dialog should not be shown; guard `handleDelete` with early return or assert non-contract if ever called.
4. **`useEntityCardSaveAndActions` + types:** Plumb new refs/handlers through return type so `EntityCard.vue` can render `AdminEntityDeleteWizard` next to existing `VDialog`.
5. **`EntityCard.vue`:** Import wizard + bind `entityKey` from props; `v-model` to composable-controlled open state.
6. **Verification:** `partShape` card delete opens wizard; non-contract cards (e.g. `blockShape`) unchanged.

## Goal
For **`partShape`** (keys where `usesDependencyDeleteContract` is true), **entity card** delete opens **`AdminEntityDeleteWizard`**, finalizes via the contract API, then **invalidates `globalData`** and emits **`delete`** like today. **List** behavior stays as completed in **6.17.4.1**. All other entity keys keep confirm + **`executeEntityCardDelete`** unchanged.

## Files
- `client/src/composables/admin/useEntityCardActions.ts` — branch delete click; wizard state; finalized handler (`useQueryClient`).
- `client/src/composables/admin/useEntityCardSaveAndActions.ts` — pass-through of new wizard surface to `EntityCard`.
- `client/src/types/admin/entityCardActions.ts`, `client/src/types/admin/entityCardSaveAndActions.ts` — return shape for wizard bindings.
- `client/src/components/admin/generic/EntityCard.vue` — render `AdminEntityDeleteWizard`; keep existing `VDialog` for non-contract keys.
- `client/src/utils/admin/dependencyDeleteContractKeys.ts` — **read-only** branch (`usesDependencyDeleteContract`); no duplicate allowlist.
- Reference only: `PartShapeList.vue`, `AdminEntityDeleteWizard.vue`, `entityCardActionsPersistence.ts`.

## Approach
1. In **`useEntityCardActions`**, import `usesDependencyDeleteContract` and `useQueryClient`.
2. Add refs: wizard open, `entityId` string, `entityLabel` string; set them in `handleDeleteClick` when contract + `!isNew` (label: same pattern as list — `name` or `` `Part Shape ${id}` `` for `partShape`).
3. Implement `handleContractDeleteWizardFinalized`: invalidate `['globalData']`, call `onDelete` with id, close + reset wizard state; align notifications with wizard behavior.
4. **`handleDelete`:** If contract key, return early (defensive).
5. Extend **`UseEntityCardActionsReturn`** and **`useEntityCardSaveAndActions`** return; **`EntityCard.vue`** template: `AdminEntityDeleteWizard` with `v-model`, `:entity-key`, `:entity-id`, `:entity-label`, `@finalized`.
6. Run **`cd client && npm run lint`** and **`npx vue-tsc -b`**.

## Checkpoint
- **partShape** card: delete control opens wizard (not browser-style card confirm only); after successful finalize, list/card data refreshes via `globalData` invalidation and parent still receives `delete` emit.
- **Non-contract** card: still uses `VDialog` + `executeEntityCardDelete`.

## Deliverables
- Updated composables and types wiring contract delete for entity cards.
- `EntityCard.vue` hosts `AdminEntityDeleteWizard` for contract keys only.
- Lint + vue-tsc clean for touched files.

## Acceptance Criteria
- `usesDependencyDeleteContract(entityKey) && !isNew` ⇒ delete click opens `AdminEntityDeleteWizard` with correct id/label; `@finalized` ⇒ `invalidateQueries({ queryKey: ['globalData'] })` and `onDelete` invoked with string id.
- Non-contract keys: no wizard shown; existing dialog + `remove` path unchanged.
- No new allowlist duplication beyond existing `dependencyDeleteContractKeys.ts` comment about server sync.
- Client lint and project typecheck pass.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.17.4-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.17.4.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
