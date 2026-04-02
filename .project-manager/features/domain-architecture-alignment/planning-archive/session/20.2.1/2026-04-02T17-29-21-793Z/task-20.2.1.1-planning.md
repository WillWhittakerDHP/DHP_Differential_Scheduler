# Plan: task 20.2.1.1 — Block shape `type` validation on entity CRUD

## Contract
- **Tier:** task | **ID:** 20.2.1.1
- **Scope:** Validate `blockShape.type` on internal entity POST/PUT/PATCH; reject legacy enum tokens with actionable errors.
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
Session **20.2.1** accepted; first task is API alignment for **block shapes** only. Block instance booleans are **task 20.2.1.2**.

## Parent context (session planning — Analysis excerpt)

- **Problem:** Generic entity CRUD accepts almost any body (`entityBodySchema` is permissive). Legacy **`block_shapes.type`** values (`property`, `option`, `coupon`) or mistyped instance flags could still be sent until validation fails deep in Sequelize or slips through coercions.
- **Boundaries:** **Server-only** route layer + sanitizers; mirror canonical five types with **`clie… _(truncated)_

## Story
**This task changes** internal **`/internal/entities/blockShape`** writes **because** permissive `entityBodySchema` lets legacy `type` values reach Sequelize; we fail fast with **400** and clear copy that points admins to **`user` / `service` / `time` / `event` / `price`** (aligned with `client/src/constants/blockShapeTypes.ts` and `ARCHITECTURE.md` §8).

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

- **Paths reviewed:** `server/src/routes/internal/entities/entityCrudRouter.ts` (POST/PUT/PATCH → `sanitizeEntityDataFor*` then `createRecord` / `updateRecord` / `patchRecord`); `server/src/routes/internal/entities/entitySanitizers.ts` (no `blockShape` branch today); `server/src/routes/schemas/entitySchemas.ts` (`.unknown(true)` only); `server/src/db/models/admin/block_shape.ts` (ENUM matches five canonical types); `client/src/constants/blockShapeTypes.ts`.
- **Patterns / call sites:** Validation should live next to other entity hygiene (`eventShape` differential strip); respond with **`sendBadRequest`** before DB writes, same as other entity routes.
- **Gaps / unknowns:** Confirm no alternate write path for `blockShape` bypasses `entityCrudRouter` (quick grep during implementation).

## Analysis
- **Problem:** Admins or stale clients can POST/PATCH `type: property|option|coupon` (or garbage strings); errors surface late or as opaque DB errors.
- **Boundaries:** Server route + small validation module only; no client bundle change required for this task; no booking math.
- **Design choice:** **Reject** legacy tokens (no silent remap) so data fixes are explicit; error text names allowed set and nudges legacy → canonical mapping per `ARCHITECTURE.md` §8 legacy line.
- **Risks:** Strict create may break a scripted create missing `type` — mitigated by requiring `type` on POST (matches `allowNull: false` on model).

## Design
1. Add **`entitySanitizers.ts`** (or `blockShapeEntityValidation.ts` colocated) exports:
   - `validateBlockShapeTypeValue(raw: unknown): string | null` — non-string, empty, unknown string, or legacy `property` / `option` / `coupon` → single-line user-facing message; canonical five → `null`.
   - `validateBlockShapeCreateBody(body: Record<string, unknown>): string | null` — **`type` required** on POST.
   - `validateBlockShapeUpdateBody(body: Record<string, unknown>): string | null` — if **`type`** key present, validate value (PATCH partial OK).
2. **`entityCrudRouter.ts`:** Before `sanitizeEntityDataForCreate` / `sanitizeEntityDataForUpdate` on POST, PUT, PATCH, when `entityType` is `blockShape`:
   - If validation returns string → `sendBadRequest(res, msg, msg)` and `return`.
3. PATCH supports `{ key, value }` — when `key === 'type'`, same validator on `value`.
4. Run **`cd server && npm run lint`**.
5. Optional one-line **DOMAIN_REWRITE_WORKLOG.md** under Feature 20 noting block-shape type pre-validation.

## Goal
**Block shape** entity writes: every **POST** includes a valid **`type`**; every **PUT/PATCH** that includes **`type`** uses only **`user` | `service` | `time` | `event` | `price`**; legacy tokens get **400** with clear guidance.

## Files
- `server/src/routes/internal/entities/entitySanitizers.ts` and/or new `server/src/routes/internal/entities/blockShapeEntityValidation.ts`
- `server/src/routes/internal/entities/entityCrudRouter.ts`
- `.project-manager/analysis/DOMAIN_REWRITE_WORKLOG.md` (optional note)

## Approach
Implement Design steps 1–3 in order; keep router branches thin by delegating to named validators; no new tests (project policy).

## Checkpoint
- No new routes; only guards on existing `blockShape` CRUD.
- After merge, illegal `type` never reaches `createRecord` / `patchRecord` for `blockShape`.

## Deliverables
- Exported validators + wired POST/PUT/PATCH for `blockShape`.
- Server lint clean.

## Acceptance Criteria
- POST `blockShape` without `type` → **400** with clear message.
- POST/PUT/PATCH with `type: property` (or `option` / `coupon`) → **400** mentioning canonical types and legacy mapping hint.
- POST/PUT/PATCH with `type: time` (etc.) → unchanged success path (still passes through sanitizer/ORM).
- `npm run lint` in `server/` passes.

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Session guide task checkbox for 20.2.1.1 updated at **task-end**
- [ ] **`/task-end`** run after implementation with cascade to **20.2.1.2** or session-end per harness

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.2.1-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
