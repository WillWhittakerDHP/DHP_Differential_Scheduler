# Plan: task 20.1.1.1 — 20.1.1.1

## Contract
- **Tier:** task | **ID:** 20.1.1.1
- **Scope:** 20.1.1.1
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
Session 20.1.1 planning accepted. This is the first task: author the PG enum rename migration and update all server-side references to old block shape type strings.

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** The DB enum and all code still use legacy type names (`property`/`coupon`/`option`). Every subsequent phase (API, admin, booking) depends on the canonical names being in place first.
- **Domain boundaries:** Server persistence (model + migration) and client constants/types. Some server middleware and repositories also reference the strings. No UI or route… _(truncated)_

## Story
**This task changes** the PostgreSQL `block_shapes.type` enum values and the Sequelize model type declaration from `property`/`coupon`/`option` to `time`/`price`/`event`, plus updates all server files referencing those strings in block-type context, **because** the locked domain principles require the target vocabulary and all subsequent passes depend on it.

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

- **Paths reviewed:**
  - `server/src/db/models/admin/block_shape.ts` — line 23: `type: 'user' | 'service' | 'property' | 'option' | 'coupon'`; line 52: `DataTypes.ENUM('user', 'service', 'property', 'option', 'coupon')`.
  - `server/src/db/migrations/20260432_000057*.mjs` — latest migration; pattern confirmed: `.mjs`, `export default { async up(qi) {}, async down(qi) {} }`, raw SQL via `qi.sequelize.query()`.
  - `server/src/repositories/appointmentSelectionRepository.ts`, `appointmentSelectionCodec.ts`, `server/src/middlewares/ownershipRegistry.ts`, `ownershipEnforcement.ts`, `server/src/db/models/booking/appointment_selection_line.ts` — all reference `'property'`, `'coupon'`, or `'option'` in block-type context (need per-file verification).
- **Patterns:** Migration 000056 uses `ALTER TYPE ... RENAME VALUE` for enum rename. Same pattern applies here.
- **Gaps:** Each server file hit for `'property'`/`'option'` needs manual verification to distinguish block-type usage from real-estate property references.

## Analysis
- **Problem:** Server model and DB enum still use `property`/`coupon`/`option`. Must be `time`/`price`/`event` per ARCHITECTURE.md §8 and plan §1.1.
- **Domain:** Server persistence only (model + migration + server code references). No client changes in this task.
- **Pattern:** `ALTER TYPE ... RENAME VALUE` one value at a time (PG >=10). Update model TS type and ENUM in same task.
- **Risks:** `'property'` in server code may refer to real-estate property, not block type. Verify each hit.

## Design
1. **Migration file** (`20260432_000058_rename_block_shape_type_enum.mjs`):
   - `up`: Three `ALTER TYPE "enum_block_shapes_type" RENAME VALUE 'property' TO 'time'` (repeat for coupon->price, option->event).
   - `down`: Reverse renames (time->property, price->coupon, event->option).
   - Idempotent: wrap in `DO $$ ... IF EXISTS ... $$ LANGUAGE plpgsql` or check `pg_enum` before rename.
2. **Model update** (`block_shape.ts`):
   - Line 23: `'user' | 'service' | 'time' | 'event' | 'price'`
   - Line 52: `DataTypes.ENUM('user', 'service', 'time', 'event', 'price')`
3. **Server file updates** (only block-type context references):
   - `appointmentSelectionRepository.ts` — update any `'property'`/`'coupon'`/`'option'` strings used as block type values.
   - `appointmentSelectionCodec.ts` — same.
   - `ownershipRegistry.ts` — same.
   - `ownershipEnforcement.ts` — same.
   - `appointment_selection_line.ts` — same.
   - **Skip** any `'property'` that refers to real-estate property (e.g. property_details, propertyId).

## Goal
Author the PG enum rename migration and update all **server-side** references to old block shape type strings (`property`->`time`, `coupon`->`price`, `option`->`event`). This is the server half of the block shape type rename.

**Done for this task:** Migration file authored; `block_shape.ts` model updated; server files with block-type string references updated.

## Files
- **Migration (create):** `server/src/db/migrations/20260432_000058_rename_block_shape_type_enum.mjs`
- **Server model (modify):** `server/src/db/models/admin/block_shape.ts` -- type union + DataTypes.ENUM
- **Client constants (modify):** `client/src/constants/blockShapeTypes.ts` -- keys + values + exported type
- **Client types (modify):** `client/src/types/entities.ts` -- `BlockShapeEntity` type usage
- **Server files to update (block-type string refs):** `server/src/repositories/appointmentSelectionRepository.ts`, `server/src/repositories/appointmentSelectionCodec.ts`, `server/src/middlewares/ownershipRegistry.ts`, `server/src/middlewares/ownershipEnforcement.ts`, `server/src/db/models/booking/appointment_selection_line.ts`
- **Client files to update (BLOCK_SHAPE_TYPES refs):** `client/src/utils/transformers/appointmentToWizardHelpers.ts`, `client/src/utils/booking/cascadeFilterPipeline.ts`, `client/src/utils/blockInstanceUtils.ts`, `client/src/utils/admin/calibrationChartTransforms.ts`, `client/src/types/transformers/bookingData.ts`, `client/src/composables/booking/useWizardFilteredOptions.ts`, `client/src/composables/booking/useDevPanelsComputed.ts`, `client/src/composables/admin/useSelectEnumOptions.ts`

## Approach
1. **Task 1 (migration + server model):** Author `.mjs` migration with three `ALTER TYPE ... RENAME VALUE` statements. Update `block_shape.ts` type union and `DataTypes.ENUM`. Update server files that reference old strings in block-type context (verify each hit is actually a block type, not a real-estate property reference).
2. **Task 2 (client constants + all client refs):** Rename `BLOCK_SHAPE_TYPES` keys (`PROPERTY`->`TIME`, `COUPON`->`PRICE`, `OPTION`->`EVENT`) and values. Update all client files that import or reference the old constants. Update `BlockShapeEntity` type if needed.
3. **Verify:** App starts, lint passes, no orphaned old strings in block-type context.

## Checkpoint
- After Task 1: server starts with new enum values; model file clean.
- After Task 2: client builds with new constants; no lint errors.
- Final: grep for `'property'`, `'coupon'`, `'option'` in block-type context returns zero hits (excluding real-estate `property` references like `property_details`, `propertyId`).

## Deliverables
- `server/src/db/migrations/20260432_000058_rename_block_shape_type_enum.mjs`
- Updated `server/src/db/models/admin/block_shape.ts` (type union + ENUM)
- Updated server files (~5) with block-type string references

## Acceptance Criteria
- [ ] Migration renames `property`->`time`, `coupon`->`price`, `option`->`event` in the PG enum with idempotent guards.
- [ ] `block_shape.ts` model type is `'user' | 'service' | 'time' | 'event' | 'price'`.
- [ ] All server files verified: block-type `'property'`/`'coupon'`/`'option'` references updated; real-estate `property` references untouched.
- [ ] Server lint passes (`cd server && npm run lint`).

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.1-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
