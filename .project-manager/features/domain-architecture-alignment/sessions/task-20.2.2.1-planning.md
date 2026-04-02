# Plan: task 20.2.2.1 — Event shape placement validation & API hygiene (no differential-role)

## Contract
- **Tier:** task | **ID:** 20.2.2.1
- **Scope:** **`eventShape`** only on internal entity writes + reads/batch: placement invariants, reject legacy differential-role keys, strip any legacy keys from JSON responses.
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
Session **20.2.2** accepted; first task is **`eventShape`** API alignment. **Task 20.2.2.2** covers **`eventInstance`** (parent + §5.4) — out of scope here.

## Parent context (session planning — Analysis excerpt)

- **Problem:** **`entityBodySchema`** is still permissive; **`eventInstance.parent_block_instance_id`** is **nullable** in DB but **§5.2** requires every segment be **owned** by an event block instance — API should **reject creates** without parent context. Event shapes must not reintroduce **differential-role** as a writable or visible API field after **Phase 20.1** migration.
-… _(truncated)_

## Story
**This task changes** **`/internal/entities/eventShape`** (and **`/entities/batch`** list entries for **`eventShape`**) **because** §8.2 requires **placement-only** event-shape APIs: invalid **placement_kind / anchor_edge** pairs must fail fast with **400**, clients must not send or receive **`differentialRole`**, and permissive **`entityBodySchema`** must not rely on silent **`sanitize*`** nulling alone.

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
| **Auth / Sessions** | Router guards; future `composables/auth/` | `routes/internal/auth`, `auth/`, `db/models/auth` | Sessions, users, magic links (evolving); **`users.user_role`** (ENUM + API) | Auth contracts in `@shared` as they stabilize; **canonical role strings** via `@shared` (`USER_ROLE_VALUES` — Feature 6 Session 6.18.1) |
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

- **Paths reviewed:** `server/src/db/models/booking/event_shape.ts` — **`placementKind`**, **`anchorEdge`** only (no **`differential_role`** on model); `server/src/routes/internal/entities/entitySanitizers.ts` — **`sanitizeEventShapeFields`** uses **`shared/utils/eventPlacementUtils.ts`** and **deletes** **`differentialRole` / `differential_role`** on write; **`sanitizeEventPlacementKindInput`** returns **`null`** for invalid input (silent) — needs **pre-sanitize** strict validation for writes; `server/src/routes/internal/entities/entityConstants.ts` — **`FIELD_NAMES.PLACEMENT_KIND`**, **`PLACEMENT_KIND_SNAKE`**, **`ANCHOR_EDGE`**, **`ANCHOR_EDGE_SNAKE`**, **`DIFFERENTIAL_ROLE`**; `server/src/routes/internal/entities/entityCrudRouter.ts` — POST/PUT/PATCH before **`sanitizeEntityDataFor*`** (same hook pattern as **20.2.1**); `server/src/routes/internal/entities/entityBulkRouter.ts` — bulk rows for **`order_index`** and **`bulk`**; `server/src/routes/internal/entities/entityCrudReadHandlers.ts` + `entityBatchRouter.ts` — **`buildFetchOptions`** / **`getModelAttributes`** → JSON is plain Sequelize rows; legacy column absent on model but belt-and-suspenders strip on response is cheap.
- **Patterns / call sites:** Mirror **`blockShapeEntityValidation`**: **`sendBadRequest`** + early return; reuse **`isEventPlacementKind`** / **`isEventAnchorEdge`** from **`eventPlacementUtils`** for strict checks.
- **Gaps / unknowns:** PATCH with only one of kind/anchor — rule below forces consistent pairs when either key appears in the payload.

## Analysis
- **Problem:** Invalid placement strings can become **`null`** and hit DB defaults; **`differentialRole`** in body is stripped silently — product wants explicit **400** and §8.2 “placement fields only.”
- **Boundaries:** Server entity + bulk routes; **no** **`eventInstance`** changes in this task.
- **Rules (Principles §5.1):** **`primary`** ⇒ anchor must be **null / omitted / empty**; **`secondary` | `marginal` | `floating`** ⇒ **`anchorEdge`** must be **`start`** or **`end`**. When **`placementKind`** (or snake) is **present** in the write payload and value is non-primary, **`anchorEdge`** (or snake) must be **present** in the **same** request with a valid edge. When kind is **primary** and anchor keys are present with a non-empty value → **400**.
- **Risks:** Stricter PATCH may require admin to send both fields when changing placement — acceptable and clearer than inconsistent rows.

## Design
1. Add **`server/src/routes/internal/entities/eventShapeEntityValidation.ts`**:  
   - **`isEventShapeEntityType`**.  
   - **`validateEventShapeForbiddenKeys(body)`** — if **`differentialRole`** or **`differential_role`** is **own** property → error string.  
   - **`validateEventShapePlacementWrite(body)`** — parse kind from **`placementKind`** / **`placement_kind`** when present (must satisfy **`isEventPlacementKind`** or **400**); same for anchor when present (**`isEventAnchorEdge`** or null/empty); enforce **primary ↔ null anchor** and **non-primary ↔ required anchor** when kind key is present; if only anchor keys present without kind key, validate anchor values are null/empty **or** require kind in same payload (**implementation choice:** if anchor alone is non-empty without kind → **400** “include placementKind”).  
   - **POST create:** if **no** placement keys, allow (DB defaults **primary**); if **any** placement key present, run full rules.
2. **`entityCrudRouter`:** before sanitize on POST/PUT/PATCH for **`eventShape`**, run forbidden + placement validators.  
3. **`entityBulkRouter`:** for **`eventShape`** rows in **`order_index`** and **`bulk`**, run same validators on each row (ids + patch fields only — usually no placement; cheap no-op).  
4. **Reads:** **`stripLegacyEventShapeResponseFields(plain: Record<string, unknown>)`** — **`delete differentialRole`**, **`differential_role`**; apply in **`handleEntityCrudList`**, **`handleEntityCrudGetById`**, and **`entityBatchRouter`** when **`entityKey === eventShape`**.  
5. **`cd server && npm run lint`**.

## Goal
**`eventShape`** writes: no **`differentialRole`**; placement/anchor combinations always valid per §5.1 when placement fields are supplied; **reads/batch** never expose legacy differential-role keys.

## Files
- `server/src/routes/internal/entities/eventShapeEntityValidation.ts` (new)
- `server/src/routes/internal/entities/entityCrudRouter.ts`
- `server/src/routes/internal/entities/entityBulkRouter.ts`
- `server/src/routes/internal/entities/entityCrudReadHandlers.ts`
- `server/src/routes/internal/entities/entityBatchRouter.ts`
- Reuse: `shared/utils/eventPlacementUtils.ts`, `server/src/routes/internal/entities/entityConstants.ts`

## Approach
Implement **Design** steps 1–5; keep router conditionals thin; explicit return types on exported validators.

## Checkpoint
- Invalid pair (e.g. **`secondary`** without anchor) → **400** before DB.
- **GET** list / by id / batch **`eventShape`** objects have no **`differentialRole`** keys even if introduced by a future include/raw query.

## Deliverables
- New validation module + router/bulk/read/batch wiring.
- Server lint clean.

## Acceptance Criteria
- POST/PUT/PATCH **`eventShape`** with body containing **`differentialRole`** → **400**.
- POST with **`placementKind: 'primary'`** and **`anchorEdge: 'start'`** → **400**.
- POST with **`placementKind: 'secondary'`** without anchor → **400**.
- POST with **`placementKind: 'secondary'`**, **`anchorEdge: 'end'`** → passes validation (then existing sanitizer/ORM).
- Batch + GET responses for **`eventShape`** do not include **`differentialRole`** / **`differential_role`**.
- **`cd server && npm run lint`** passes.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Session guide task **20.2.2.1** updated at **`/task-end`**
- [ ] **`/task-end 20.2.2.1`** then cascade **`/task-start 20.2.2.2`** per harness

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.2-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
