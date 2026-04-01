# Plan: task 6.17.5.1 — 6.17.5.1

## Contract
- **Tier:** task | **ID:** 6.17.5.1
- **Scope:** 6.17.5.1
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
- [ ] #### Task 6.17.5.1: Server — `blockShape` + `annotationShape` delete strategies **Goal:** Register `DependencyDeleteStrategy` implementations and dependency counters; **no** client allowlist or docs in this task (**6.17.5.2**).

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Phase **6.17** success criteria require rollout beyond **`partShape`** and documentation for adding entities. Infrastructure and generic UI wiring exist; remaining work is **domain-specific strategies** + **client allowlist alignment** + **operator-facing extension doc**.
- **Domains:** Admin config **server** (delete strategies, Sequelize), **client** ad… _(truncated)_

## Story
**This task changes** the server **`dependencyDeleteRegistry`** **so that** **`blockShape`** and **`annotationShape`** participate in the same **preflight → resolve → finalize** contract as **`partShape`**, with **accurate** dependency graphs and **transactional** deletes when `totalCount === 0`.

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

- **Paths reviewed:** `server/src/services/entityDelete/dependencyDeleteRegistry.ts`; `server/src/services/entityDelete/strategies/partShapeDependencyDeleteStrategy.ts`; `server/src/services/partShapes/countPartShapeDeleteDependencies.ts`; `server/src/services/entityDelete/dependencyDeleteStrategyTypes.ts`; `server/src/config/app.ts` (model exports); `server/src/db/models/sequelizeModelAssociationsPartA.ts` (FK directions for **BlockShape** / **AnnotationShape**); `server/src/db/models/booking/annotation_instance.ts` (`type` → `annotation_shapes.id`); `server/src/routes/internal/entities/entityConstants.ts` (**`ANNOTATION_SHAPE_IN_USE`** exists; **no** `BLOCK_SHAPE_IN_USE` yet — add for symmetry with part/annotation).
- **Patterns / call sites:** Mirror **`partShape`**: (1) **`count*DeleteDependencies`** module returning numeric buckets + **`totalCount`**; (2) **`preflight`**: target node + optional **`hard_blocked`** summary node/edge when `totalCount > 0`; (3) **`resolve`**: reject if `!tokenSnapshot.canDirectDelete` or non-noop resolutions (v1 same as part shape); (4) **`finalize`**: transaction → re-count → **`BlockShape.destroy`** / **`AnnotationShape.destroy`** or structured **`FINALIZE_CONFLICT`** / **`ENTITY_NOT_FOUND`**.
- **Gaps / unknowns:** **`ValidEventCascade.parent_id`** is **BlockShape**; **`child_id`** is **EventShape** — count rows where **`parent_id = blockShapeId`**. Confirm **Sequelize** `where` column names match DB (`block_shape_ref`, `parent_id`, `child_id`, `type` on annotation instances). Add **`BLOCK_SHAPE_IN_USE`** + **`BLOCK_SHAPE_IN_USE_DETAILS`** (placeholders for instance + cascade counts) in **`entityConstants.ts`**.

## Analysis
- **Problem / why now:** Session **6.17.5** splits rollout: this task delivers **server-side** registration so **6.17.5.2** can safely extend the client allowlist without orphan UI calling missing strategies.
- **Domains:** **Server admin / Sequelize only**; shared types **`@shared/types/adminDeleteDependency`** already define DTOs — **do not** change policy literals.
- **Grounding:** Association graph shows **BlockShape** blocks on: **`block_instances.block_shape_ref`**, **`valid_booking_cascades`** (parent or child = shape), **`valid_part_cascades.parent_id`**, **`valid_annotation_assignments.parent_id`**, **`valid_event_cascades.parent_id`**. **AnnotationShape** blocks on: **`annotation_instances.type`**, **`valid_annotation_assignments.child_id`** (annotation shape as child in validity row).
- **Risks:** Miscounting one FK path → false **`canDirectDelete`** or failed finalize; **mitigation** parallel **`Promise.all`** counts + mirror **`partShape`** double-check inside **`finalize`** transaction.
- **Alternatives:** CASCADE delete in DB — **out of scope** (phase guide). Single combined strategy file — **rejected**; keep **one strategy module per entity** + thin count modules for governance.

## Design
1. **`countBlockShapeDeleteDependencies(blockShapeId)`** — parallel counts: `BlockInstance` (`block_shape_ref`), `ValidBookingCascade` (`parent_id` OR `child_id`), `ValidPartCascade` (`parent_id`), `ValidAnnotationAssignment` (`parent_id`), `ValidEventCascade` (`parent_id`). **`totalCount`** = sum.
2. **`blockShapeDependencyDeleteStrategy`** — clone structure from **`partShapeDependencyDeleteStrategy`**: human-readable **`buildBlockedDetails`** using new **`ERROR_MESSAGES.BLOCK_SHAPE_IN_USE_DETAILS`** (substitute counts).
3. **`countAnnotationShapeDeleteDependencies(annotationShapeId)`** — `AnnotationInstance.count({ where: { type: id } })`, `ValidAnnotationAssignment.count({ where: { child_id: id } })`.
4. **`annotationShapeDependencyDeleteStrategy`** — use existing **`ANNOTATION_SHAPE_IN_USE`** / **`ANNOTATION_SHAPE_IN_USE_DETAILS`**; **`finalize`** → **`AnnotationShape.destroy`** in transaction after count check.
5. **`dependencyDeleteRegistry.ts`** — register **`ENTITY_KEYS.BLOCK_SHAPE`** and **`ENTITY_KEYS.ANNOTATION_SHAPE`** (same string keys as CRUD **`entityType`**).

## Goal
On the **server**, register **`DependencyDeleteStrategy`** for **`blockShape`** and **`annotationShape`**, including **dependency counting**, **preflight graph**, **noop-only resolve**, and **transactional finalize** with **`hard_blocked`** semantics when dependencies exist.

## Files
- `server/src/services/blockShapes/countBlockShapeDeleteDependencies.ts` (new)
- `server/src/services/entityDelete/strategies/blockShapeDependencyDeleteStrategy.ts` (new)
- `server/src/services/annotationShapes/countAnnotationShapeDeleteDependencies.ts` (new)
- `server/src/services/entityDelete/strategies/annotationShapeDependencyDeleteStrategy.ts` (new)
- `server/src/services/entityDelete/dependencyDeleteRegistry.ts` (edit — register both)
- `server/src/routes/internal/entities/entityConstants.ts` (edit — **`BLOCK_SHAPE_IN_USE`** messages)

## Approach
1. Add **`BLOCK_SHAPE_IN_USE`** (+ details template with numeric placeholders) next to existing delete messages.
2. Implement **`countBlockShapeDeleteDependencies`** and **`countAnnotationShapeDeleteDependencies`** using models from **`config/app.js`**.
3. Implement **`blockShapeDependencyDeleteStrategy`** and **`annotationShapeDependencyDeleteStrategy`** following **`partShapeDependencyDeleteStrategy`** line structure (keep functions small; extract **`build*BlockedDetails`** if needed for complexity limits).
4. Wire both in **`dependencyDeleteRegistry`**.
5. Run **`cd server && npm run lint`**; smoke **`GET .../delete-preflight`** for each type via running app or existing route tests (no new test files per project policy).

## Checkpoint
- **`GET /api/v1/internal/entities/blockShape/:id/delete-preflight`** returns **`canDirectDelete: true`** only when all configured counts are zero.
- Same for **`annotationShape`**.
- **`delete-finalize`** deletes a **clean** row and returns **409/structured error** when dependencies exist after preflight said blocked.

## Deliverables
- Two new **count** modules + two new **strategy** modules + **registry** entries + **`entityConstants`** messages.

## Acceptance Criteria
- [ ] `getDependencyDeleteStrategy('blockShape')` and `getDependencyDeleteStrategy('annotationShape')` return defined strategies (using **`ENTITY_KEYS`** values).
- [ ] Preflight **`nodes`/`edges`** reflect **`hard_blocked`** when **`totalCount > 0`**; **`canDirectDelete`** matches **`totalCount === 0`**.
- [ ] **`resolve`** returns **`HARD_BLOCKED`** partial error when preflight was not direct-delete; accepts only **noop** resolutions otherwise.
- [ ] **`finalize`** runs in a **transaction**, re-validates counts, **`destroy`**s exactly one shape row on success, returns **404** if row missing, **409** if dependencies race back.
- [ ] **Server lint** passes on touched files.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.17.5-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
