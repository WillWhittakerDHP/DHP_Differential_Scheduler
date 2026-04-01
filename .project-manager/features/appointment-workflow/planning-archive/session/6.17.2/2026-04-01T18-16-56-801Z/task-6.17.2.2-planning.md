# Plan: task 6.17.2.2 — Registry + transactional resolve/finalize (partShape pilot)

## Contract
- **Tier:** task | **ID:** 6.17.2.2
- **Scope:** Server registry for dependency-delete strategies; in-memory **`preflightToken`**; **`partShape`** pilot: real preflight graph from **`countPartShapeDeleteDependencies`**, noop resolve path, **`finalize`** in **Sequelize transaction** when **`canDirectDelete`**. Unregistered entity keys: explicit contract error. **No** Vue; **no** changing **`DELETE /:entityType/:id`** behavior beyond optional shared extraction if needed.
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
Task **6.17.2.1** shipped routes + **`entityDeleteContractFacade`** stubs + **`sendDeleteContractError`**. This task replaces stubs with registry-backed behavior for at least **`ENTITY_KEYS.PART_SHAPE`** (`partShape`).

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Contracts from **6.17.1** are frozen; without server behavior, **6.17.3** cannot integrate. This session implements the **wire + domain** side only.
- **Domains:** **Server** (`server/src/routes/internal/entities/`, `server/src/services/` or co-located delete module). **Shared** is **read-only** — import existing `@shared/types/adminDeleteDependency`; avo… _(truncated)_

## Story

**This task adds** a **strategy registry** and a **partShape** implementation **so that** preflight reflects real dependency counts, finalize can delete a **clean** part shape inside a transaction, and **6.17.3** can exercise a full HTTP loop without waiting for **6.17.5** rollout of every entity.

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

## Codebase recon (verified)

- **`server/src/routes/internal/entities/entityDeleteContractFacade.ts`** — Validates body/params; preflight stub empty graph; resolve/finalize return **`PREFLIGHT_FAILED`** stub.
- **`server/src/routes/internal/entities/entityCrudRouter.ts`** — **`DELETE /:entityType/:id`** runs **`countPartShapeDeleteDependencies`** for **`partShape`**; blocks with **409** + shape error messages when **`totalCount > 0`**; else **`deleteRecord(entityConfig.model, entityId)`** (no transaction today).
- **`server/src/services/partShapes/countPartShapeDeleteDependencies.ts`** — Single source for part-shape dependency counts.
- **`server/src/routes/helpers/dataController.ts`** — **`deleteRecord`** uses **`Model.destroy({ where: { id } })`** — **no `transaction` option** yet; finalize can call **`model.destroy({ where, transaction })`** locally or extend **`deleteRecord`** with optional **`Transaction`** (choose one in implement; document in Analysis).
- **`server/src/constants/entities.ts`** — **`ENTITY_KEYS.PART_SHAPE`** / **`partShape`**.
- **`shared/types/adminDeleteDependency.ts`** — DTOs + **`DeleteContractErrorCode`**.

## Analysis

- **Problem:** Stubs block **6.17.3** integration testing; we need **one** real entity path and a **registry** pattern for **6.17.5** expansion.
- **Boundary:** **Server-only** under **`server/src/services/entityDelete/`** (suggested folder) + thin changes in **`entityDeleteContractFacade`** to delegate to **registry + token store**.
- **Patterns:** Reuse **`countPartShapeDeleteDependencies`**; mirror delete guards (no delete when deps > 0). Use **`createLogger`**; **`sendDeleteContractError`** for contract failures; **`handleRouteError`** only for unexpected exceptions in async paths (facade may need **`async`** handlers if strategies await DB).
- **Risks:** **In-memory tokens** — not valid across multiple server processes; document in module JSDoc. **Race:** counts change between preflight and finalize — use token snapshot **`canDirectDelete`** + optional **re-count** inside transaction before destroy (recommended in Design).
- **Alternatives:** DB-backed tokens — deferred. Full **`reassign_required`** implementation — deferred to later phase/session; pilot uses **`hard_blocked`** edges when deps > 0 so user cannot finalize without clearing deps via existing admin flows.

## Design

### 1. `DependencyDeleteStrategy` (server-local interface)

Methods (signatures at implement time; use explicit return types):

- **`preflight(args)`** → **`Promise<DeletePreflightResponse>`** (must set **`entityType`**, **`entityId`** from args; may set **`preflightToken`** — see store)
- **`resolve(args)`** → **`Promise<DeleteResolveResponse>`**
- **`finalize(args)`** → **`Promise<DeleteFinalizeResponse>`**

`args` carry **`entityConfig`**, **`entityId`**, **`entityType`**, parsed body, validated **`preflightToken`**, Sequelize **`sequelize`** (from `app` config) for transactions.

### 2. In-memory token store (`deleteContractPreflightTokenStore.ts`)

- **`issue(record)`** → random opaque string; store **`{ entityType, entityId, canDirectDelete, issuedAt }`**.
- **`consume(token)`** → validate TTL (e.g. **15 minutes**), match **`entityType`/`entityId`** to request; return record or **`null`** (**`STALE_PREFLIGHT`**).
- **Concurrency:** single Node process assumption; comment **multi-instance gap**.

### 3. Registry (`dependencyDeleteRegistry.ts`)

- **`getStrategy(entityType: string): DependencyDeleteStrategy | undefined`**
- Register **`partShape`** / **`ENTITY_KEYS.PART_SHAPE`** pilot only in this task.

### 4. `partShape` pilot behavior

**Preflight**

- Call **`countPartShapeDeleteDependencies(entityId)`**.
- If **`totalCount === 0`**: **`nodes`**: minimal target node; **`edges: []`**; **`canDirectDelete: true`**; issue **`preflightToken`**.
- If **`totalCount > 0`**: Build **read-only** graph (target node + summary / category nodes optional); **`edges`** with policy **`hard_blocked`** and message aligned with **`ERROR_MESSAGES.PART_SHAPE_IN_USE`** intent; **`canDirectDelete: false`**; still issue token so client can correlate (finalize will reject).

**Resolve (v1)**

- If token snapshot **`canDirectDelete`**: accept **`resolutions`** that are only **`{ type: 'noop' }`** or empty array → **`applied: true`**.
- If **`!canDirectDelete`**: **`applied: false`**, **`partialErrors`** with **`HARD_BLOCKED`** (or **`RESOLUTION_INVALID`** if body requests impossible actions) — keep branches shallow; log via **`createLogger`** when rejecting.

**Finalize**

- Require valid token; if **`!canDirectDelete`**, **`FINALIZE_CONFLICT`** or **`HARD_BLOCKED`** (409) with **`code`**.
- If **`canDirectDelete`**: **`sequelize.transaction`**, inside: **re-run** **`countPartShapeDeleteDependencies`**; if **> 0**, abort with **`FINALIZE_CONFLICT`**; else **`PartShape.destroy({ where: { id: entityId }, transaction })`** (or extend **`deleteRecord`** — pick one). Return **`DeleteFinalizeResponse`** **`deleted: true`**.

### 5. Facade wiring

- After **`readEntityRouteContext`**, if **`getStrategy(entityType)`** missing → **`PREFLIGHT_FAILED`** 400 with stable message (“not registered”).
- If present → **preflight:** call **`strategy.preflight`**, then **`tokenStore.issue(...)`** and attach **`preflightToken`** to the response object (keeps strategies free of store imports). **resolve/finalize:** **`tokenStore.peek` or `consume`** per product choice (document: recommend **consume on finalize** only, **peek** on resolve if multi-step); validate **`entityType`/`entityId`** match record, then call strategy.

### 6. Optional follow-up (not required in this task)

- Extract shared **“delete entity row with part/annotation guards”** used by **`entityCrudRouter`** and finalize to one internal helper — only if it reduces duplication without risky behavior change.

## Goal

Ship **registry + token store + partShape strategy** and wire **`entityDeleteContractFacade`** so **partShape** supports **preflight → resolve (noop) → finalize** when there are **no** dependencies.

## Files (primary)

| Action | Path |
|--------|------|
| Create | `server/src/services/entityDelete/dependencyDeleteRegistry.ts` |
| Create | `server/src/services/entityDelete/deleteContractPreflightTokenStore.ts` |
| Create | `server/src/services/entityDelete/strategies/partShapeDependencyDeleteStrategy.ts` (or flat `partShapeDeleteDependencyStrategy.ts`) |
| Create | `server/src/services/entityDelete/dependencyDeleteStrategyTypes.ts` (interface + arg types) |
| Edit | `server/src/routes/internal/entities/entityDeleteContractFacade.ts` — delegate to registry + store; **`async`** handlers if needed |

## Approach

1. Add types + token store + registry registration for **`partShape`** only.
2. Implement **`partShape`** preflight/resolve/finalize per Design §4.
3. Refactor facade to async delegation; preserve existing body validation for unregistered keys.
4. **`cd server && npm run lint`**.

## Checkpoint

- [ ] Unregistered **`entityType`** returns JSON error with **`DeleteContractErrorCode`** (not generic 500).
- [ ] **`partShape`** with **zero** deps: preflight **`canDirectDelete: true`** + token; resolve **`applied: true`** for noop; finalize **`deleted: true`**.
- [ ] **`partShape`** with **deps**: preflight **`hard_blocked`** edge; finalize fails with structured **`code`** (409/400 per spec table).
- [ ] Finalize uses **Sequelize transaction** for the destroy path.

## Deliverables

- Registry + token store + **partShape** strategy + facade integration.
- JSDoc on token store stating **in-memory / single-process** limitation.

## Acceptance Criteria

- [ ] **`@shared/types/adminDeleteDependency`** shapes honored for success responses (field names).
- [ ] Error responses use **`sendDeleteContractError`** with valid **`DeleteContractErrorCode`**.
- [ ] No new **`shared/`** types unless client needs them in same PR (not expected).
- [ ] **`npm run lint`** (server) passes.
- [ ] **`delete-preflight-api-v1.md`** updated only if response semantics **must** change (prefer footnote errata).

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.17.2-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.17.2.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
