# Plan: task 20.2.2.2 — Event instance `parentBlockInstanceId` + §5.4 field validation

## Contract
- **Tier:** task | **ID:** 20.2.2.2
- **Scope:** **`eventInstance`** internal entity writes: require **`parentBlockInstanceId`** on **POST**; validate parent UUID when parent keys appear on **PUT/PATCH**; strict types for §5.4 calendar/segment fields when those keys are sent; **`entityBulkRouter`** parity.
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
Task **20.2.2.1** shipped **`eventShape`** placement + response hygiene. This task is **`eventInstance`** only (**20.2.3** relationships / preview remains out of scope).

## Parent context (session planning — Analysis excerpt)

- **Problem:** **`entityBodySchema`** is still permissive; **`eventInstance.parent_block_instance_id`** is **nullable** in DB but **§5.2** requires every segment be **owned** by an event block instance — API should **reject creates** without parent context. Event shapes must not reintroduce **differential-role** as a writable or visible API field after **Phase 20.1** migration.
-… _(truncated)_

## Story
**This task changes** **`/internal/entities/eventInstance`** (and matching **bulk** rows) **because** Principles **§5.2–§5.4** treat instances as **named segments** owned by an event **block instance**; the DB still allows **`NULL`** **`parent_block_instance_id`**, so the API must **reject creates** without a parent and reject mistyped calendar/segment payloads before Sequelize.

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

- **Paths reviewed:** `server/src/db/models/booking/event_instance.ts` — **`parentBlockInstanceId`** (**`parent_block_instance_id`**, FK **`block_instances`**), segment/location fields, calendar enums (**`visibility`**, **`transparency`**, **`sendUpdates`**, **`status`**), guest/boolean flags, **`reminderOverrides`** JSONB; **`server/src/routes/internal/entities/entityCrudRouter.ts`** — POST/PUT/PATCH hooks pattern (**blockShape**, **blockInstance**, **eventShape** already); **`entityBulkRouter.ts`** — per-row validation loops; **`entityValidators.ts`** — temp ID rules (**`TEMPORARY_ID_PATTERNS`**) for reuse on parent UUID; **`server/src/utils/validateUserRoleBlockAlignmentPayload.ts`** — local **`isUuidString`** regex pattern we can mirror (no import to keep entity layer isolated).
- **Patterns / call sites:** Same as **20.2.1.2** / **20.2.2.1**: **`sendBadRequest`** before **`sanitizeEntityDataFor*`**; dual-key read for **`parentBlockInstanceId`** / **`parent_block_instance_id`** with conflict **400** (mirror **`eventShapeEntityValidation`** **`readDualKey`**).
- **Gaps / unknowns:** Do **not** verify parent row is **`type === 'event'`** block in this task (extra query); UUID format + non-temp is enough unless product later requires FK existence check.

## Analysis
- **Problem:** Creates without parent leak **NULL** owners; strings where booleans are expected cause confusing Sequelize errors.
- **Boundaries:** Server entity + bulk routes only; **no** **`eventShape`** edits (**20.2.2.1** done); **no** booking math.
- **Parent rule:** **POST** must include a valid UUID string for **`parentBlockInstanceId`** (camel preferred; snake accepted if equal to camel when both sent). Reject **`new-*`**, **`00000000-0000-0000-0000-000000000000`**. **PUT/PATCH:** if either parent key is **present**, value must be a **non-empty** valid UUID (do **not** allow clearing parent in this slice — **`null`** / empty → **400**).
- **§5.4 strict keys when present:** **`typeof === 'boolean'`** for **`guestsCanModify`**, **`guestsCanInviteOthers`**, **`guestsCanSeeOtherGuests`**, **`addConferenceLink`**, **`active`**, **`includeRescheduleLink`**, **`includeCancelLink`**; closed string sets for **`visibility`**, **`transparency`**, **`sendUpdates`**, **`status`** matching model comments; **`locationLat`/`locationLng`**: **`null`** or **finite `number`**; optional text fields (**`locationType`**, **`locationPlaceId`**, **`locationAddress`**, templates): **`null`** or **`string`**; **`reminderOverrides`**: **`null`** or **array** of **`{ method: 'email'|'popup', minutes: number }`** with **`minutes`** finite (skip deep validation of edge cases beyond shape).
- **Risks:** Legacy admin that POSTs without parent will **400** — intended per §5.2.

## Design
1. **`eventInstanceEntityValidation.ts`:**  
   - **`isEventInstanceEntityType`**.  
   - **`readDualKey`** for parent camel/snake (copy minimal helper or private duplicate to avoid importing event shape module).  
   - **`validateEventInstanceParentForCreate(body)`** — parent keys required; valid UUID; not temp/null UUID.  
   - **`validateEventInstanceParentForUpdate(body)`** — if parent key specified, same UUID rules; reject null/empty.  
   - **`validateEventInstanceSegmentFieldsWhenPresent(body)`** — §5.4 checks above; first failure message wins.  
   - **`validateEventInstanceWritePayload(body, mode: 'create' | 'update')`** — compose parent + segment.  
2. **`entityCrudRouter`:** after **eventShape** block (or with other validators), call **`eventInstance`** validator for POST (**create**) and PUT/PATCH (**update**).  
3. **`entityBulkRouter`:** for **`ENTITY_KEYS.EVENT_INSTANCE`** only, loop **`validateEventInstanceWritePayload(row, 'update')`** on **`order_index`** and **`bulk`** (rows are partial updates; use **`update`** mode — parent optional unless key present).  
4. **TypeScript:** avoid **`|| 'eventInstance'`** on **`EntityKey`** iterations in **`entityBulkRouter`** (same **TS2367** lesson as **20.2.2.1** / batch router).  
5. **`cd server && npm run lint`** and **`tsc --noEmit`**.

## Goal
**`eventInstance`** writes: **POST** always carries a valid **parent block instance** id; **PUT/PATCH/bulk** rows never set an invalid parent when parent fields are included; §5.4-typed fields are type-safe when sent.

## Files
- `server/src/routes/internal/entities/eventInstanceEntityValidation.ts` (new)
- `server/src/routes/internal/entities/entityCrudRouter.ts`
- `server/src/routes/internal/entities/entityBulkRouter.ts`
- Reference: `server/src/db/models/booking/event_instance.ts`, `server/src/routes/internal/entities/entityConstants.ts` (**`TEMPORARY_ID_PATTERNS`** if re-exported — else duplicate check with **entityValidators** constants)

## Approach
Implement **Design** steps 1–5; keep exported validators **explicit return type** **`string | null`**; thin router branches.

## Checkpoint
- Create without parent → **400** before **`createRecord`**.
- PATCH **`{ key: 'guestsCanModify', value: 'true' }`** → **400**.
- Valid minimal create (parent + required model fields) still passes.

## Deliverables
- Validator module + CRUD + bulk wiring.
- Server lint + **`tsc`** clean.

## Acceptance Criteria
- **POST** **`eventInstance`** without **`parentBlockInstanceId`** / **`parent_block_instance_id`** → **400**.
- **POST** with parent **`new-…`** or **null UUID** → **400**.
- **POST** with valid UUID parent + otherwise valid body → passes validator stage.
- **PATCH** with **`guestsCanModify`** string → **400**; with boolean → OK if other fields valid.
- **PUT/PATCH** with **`parentBlockInstanceId: null`** when key sent → **400**.
- **`entityBulkRouter`** applies same rules for **`eventInstance`** rows.
- **`cd server && npm run lint`** passes; **`npx tsc --noEmit`** in **`server/`** passes.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] **`/task-end 20.2.2.2`** then harness cascade (**session-end** if last session task)
- [ ] Session guide checkbox **20.2.2.2** at task-end

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.2-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.2.2.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
