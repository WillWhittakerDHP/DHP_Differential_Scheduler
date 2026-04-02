# Plan: task 20.2.1.2 — Block instance `composite` / `orchestrator` / `wizardVisible` validation

## Contract
- **Tier:** task | **ID:** 20.2.1.2
- **Scope:** Validate the three Feature 20 scheduling flags on **`blockInstance`** internal entity POST/PUT/PATCH: values must be **real booleans** when those keys are present; no silent string/number coercion.
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
Task **20.2.1.1** shipped **`blockShape.type`** allowlist + legacy reject. This task covers **`blockInstance`** only for **`composite`**, **`orchestrator`**, and **`wizardVisible`** (camelCase — Sequelize model attribute names used by entity CRUD).

## Parent context (session planning — Analysis excerpt)

- **Problem:** Generic entity CRUD accepts almost any body (`entityBodySchema` is permissive). Legacy **`block_shapes.type`** values (`property`, `option`, `coupon`) or mistyped instance flags could still be sent until validation fails deep in Sequelize or slips through coercions.
- **Boundaries:** **Server-only** route layer + sanitizers; mirror canonical five types with **`clie… _(truncated)_

## Story
**This task changes** internal **`/internal/entities/blockInstance`** writes **because** permissive `entityBodySchema` allows strings or numbers for boolean columns; Sequelize errors or odd coercions are harder to debug than an immediate **400** with a field-level message. **`agentPermissions`** empty-string defaults stay in **`sanitizeBlockInstancePrimitiveFields`** (already implemented).

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

- **Paths reviewed:** `server/src/db/models/booking/block_instance.ts` — `composite`, `orchestrator`, `wizardVisible` (maps to DB `wizard_visible`) are **`BOOLEAN`**, `allowNull: false`, defaults **`false` / `false` / `true`** respectively; `server/src/routes/internal/entities/entitySanitizers.ts` — `sanitizeBlockInstancePrimitiveFields` only normalizes **`agentPermissions`** empty strings; `server/src/routes/internal/entities/entityCrudRouter.ts` — same POST/PUT/PATCH flow as **20.2.1.1**; `server/src/routes/internal/entities/entityConstants.ts` — **`FIELD_NAMES.ORCHESTRATOR`**, **`WIZARD_VISIBLE`**, **`WIZARD_VISIBLE_SNAKE`** (no **`COMPOSITE`** constant yet — optional to add); `client/src/constants/entitySchemaDefaults.ts` references **`composite`** among block instance fields.
- **Patterns / call sites:** Mirror **20.2.1.1**: small **`blockInstanceEntityValidation.ts`** (or colocated exports) + **`sendBadRequest`** in **`entityCrudRouter`** before **`sanitizeEntityDataFor*`**; keep **`entitySanitizers`** for coercion defaults only, not for accepting invalid boolean payloads.
- **Gaps / unknowns:** Confirm batch/bulk entity routes do not bypass **`entityCrudRouter`** for **`blockInstance`** (quick grep during implementation).

## Analysis
- **Problem:** Admin or tooling can send `"true"`, `1`, or `null` for the three flags; failures should be **explicit 400s** naming the field, not opaque Sequelize validation.
- **Boundaries:** Server route validation only; no PartFinalizer or booking resolution; no **`blockShape`** changes (done in **20.2.1.1**).
- **Strictness:** When a watched key **exists** on the payload (including **`undefined` omitted** — key absent is OK so DB defaults apply on create), the value must be **`typeof value === 'boolean'`**. **Do not** coerce strings/numbers (matches “reject non-boolean” intent; admin JSON normally sends real booleans).
- **Snake case:** Out of scope unless we add explicit **`wizard_visible` → `wizardVisible`** mapping in **`entitySanitizers`**; this task locks the **camelCase** contract only.
- **Risks:** Strict booleans reject **`0`/`1`** from legacy scripts — acceptable; callers must send JSON **`true`/`false`**.

## Design
1. Add **`server/src/routes/internal/entities/blockInstanceEntityValidation.ts`** with:
   - Watched keys: **`composite`**, **`orchestrator`**, **`wizardVisible`** only.
   - `validateBlockInstanceBooleanFields(body: Record<string, unknown>): string | null` — for each key, if **`Object.prototype.hasOwnProperty.call(body, key)`** and value is not **`undefined`**, require **`typeof value === 'boolean'`**; return first violation message (e.g. **`Block instance field "wizardVisible" must be a boolean (true or false).`**).
2. **`entityCrudRouter.ts`:** After annotation body shaping where applicable, before **`sanitizeEntityDataForCreate` / `sanitizeEntityDataForUpdate`**, when **`entityType`** is **`blockInstance`**, if validator returns string → **`sendBadRequest`** and **`return`** (POST, PUT, PATCH — same as block shape pattern).
3. PATCH **`{ key, value }`:** Resolved **`updateData`** already contains the single key; validator covers it.
4. Run **`cd server && npm run lint`**.

## Goal
**Block instance** entity writes: whenever **`composite`**, **`orchestrator`**, or **`wizardVisible`** is **present** in the body (or PATCH **`updateData`**), the value is a **JSON boolean**; otherwise **400** with a clear field message. Omitted keys remain valid (Sequelize defaults on create; partial PATCH unchanged).

## Files
- `server/src/routes/internal/entities/blockInstanceEntityValidation.ts` (new)
- `server/src/routes/internal/entities/entityCrudRouter.ts`
- Reference only: `server/src/db/models/booking/block_instance.ts`, `server/src/routes/internal/entities/entitySanitizers.ts`

## Approach
Implement **Design** steps 1–3; no new tests (project policy); optional **`DOMAIN_REWRITE_WORKLOG.md`** one-liner only if phase guide expects it.

## Checkpoint
- No new routes or shared type changes required for this slice.
- After merge, admin CRUD cannot persist non-boolean values for these flags through the guarded paths.

## Deliverables
- Exported boolean-field validator + POST/PUT/PATCH wiring for **`blockInstance`**.
- **`npm run lint`** clean under **`server/`**.

## Acceptance Criteria
- POST/PUT/PATCH **`blockInstance`** with **`composite: "true"`** (string) → **400** mentioning the field.
- POST/PUT/PATCH with **`orchestrator: true`** and valid payload otherwise → passes validation (continues to sanitizer / ORM).
- Omitted **`wizardVisible`** on POST → still allowed (DB default **`true`** applies via Sequelize).
- PATCH with **`key: "wizardVisible", value: false`** → allowed; **`value: "false"`** → **400**.
- **`cd server && npm run lint`** passes.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Session guide task **20.2.1.2** checkbox updated at **`/task-end`**
- [ ] **`/task-end`** run after implementation (expect cascade to **session-end** or next session task per harness)

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.2.1.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
