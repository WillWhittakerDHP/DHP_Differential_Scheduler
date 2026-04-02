# Plan: task 20.1.1.2 — 20.1.1.2

## Contract
- **Tier:** task | **ID:** 20.1.1.2
- **Scope:** 20.1.1.2
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
- [ ] #### Task 20.1.1.2: Client block shape type constants + references
**Goal:** Align `BLOCK_SHAPE_TYPES` and all client usages with server/DB vocabulary (`time` / `price` / `event`).
**Files:** See **Files** below (client only; server completed in 20.1.1.1).

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** The DB enum and all code still use legacy type names (`property`/`coupon`/`option`). Every subsequent phase (API, admin, booking) depends on the canonical names being in place first.
- **Domain boundaries:** Server persistence (model + migration) and client constants/types. Some server middleware and repositories also reference the strings. No UI or route… _(truncated)_

## Story
**This task changes** client-side `BLOCK_SHAPE_TYPES` keys/values and every consumer so API-loaded `blockShape.type` matches the renamed PostgreSQL enum (`time`, `price`, `event`) **because** Task 20.1.1.1 already migrated the DB and server codecs; the Vue app must stop emitting or comparing legacy strings (`property`, `coupon`, `option`) for block shapes.

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

- **Paths reviewed:** `client/src/constants/blockShapeTypes.ts`; `client/src/types/entities.ts` (`BlockShapeEntity.type`); `client/src/composables/booking/useWizardFilteredOptions.ts`; `client/src/composables/admin/useSelectEnumOptions.ts`; `client/src/utils/transformers/appointmentToWizardTransformer.ts`; `client/src/utils/transformers/appointmentToWizardHelpers.ts`; `client/src/utils/booking/cascadeFilterPipeline.ts`; `client/src/utils/blockInstanceUtils.ts`; `client/src/types/transformers/bookingData.ts`; `client/src/utils/admin/calibrationChartTransforms.ts`; `client/src/utils/admin/eligibleUserRoleAlignmentBlockInstances.ts`; `client/src/composables/booking/useDevPanelsComputed.ts` (SERVICE-only).
- **Patterns / call sites:** Single source of truth is `BLOCK_SHAPE_TYPES` + `BlockShapeType`. Composables map wizard columns to `shapeType: BLOCK_SHAPE_TYPES.*`. `appointmentToWizardTransformer.resolveBlockCategories` passes `blockShapeType: 'SERVICE' | 'PROPERTY' | 'OPTION'` (keys of const object) into `resolveBlockCategory`, which resolves `BLOCK_SHAPE_TYPES[blockShapeType]`. Admin enum select shows human labels (Property / Option / Coupon). `calibrationChartTransforms` compares `shape?.type === BLOCK_SHAPE_TYPES.SERVICE`. No remaining client files reference legacy block-type strings outside these patterns (grep verified for `BLOCK_SHAPE_TYPES` / `BlockShapeType`).
- **Gaps / unknowns:** After renaming keys to `TIME` / `PRICE` / `EVENT`, update `appointmentToWizardTransformer` call sites from `'PROPERTY'`→`'TIME'`, `'OPTION'`→`'EVENT'` (and any `'COUPON'` if added). Re-grep `client/` for `'property'|'coupon'|'option'` and exclude real-estate/booking field names (`property_details`, `selectedPropertyIds`, etc.).

## Analysis
- **Problem / why now:** Task **20.1.1.1** shipped the DB enum + server model + `appointment_selection_lines` alignment. The client still sends/compares legacy block-shape strings; global entity `blockShape.type` from the API will be `time`/`price`/`event` — mismatches break filtering, admin dropdowns, and wizard transformers.
- **Domain boundaries:** Client-only (`client/src/**`). Types: `BlockShapeType` stays derived from `BLOCK_SHAPE_TYPES` (type governance: single const object). Do not change appointment JSON field names (`selectedPropertyIds`, etc.) in this task — those are API shape names, not block-shape enum values.
- **Patterns:** Keep `keyof typeof BLOCK_SHAPE_TYPES` at `appointmentToWizardHelpers.resolveBlockCategory` boundary; update call sites in `appointmentToWizardTransformer` when const keys rename.
- **Risks:** Grepping `'property'` hits real-estate UI copy and `property_details` — scope strictly to block-shape comparisons and `BLOCK_SHAPE_TYPES` usage.
- **Alternatives:** Aliasing old keys to new values only — rejected; architecture calls for renamed vocabulary end-to-end.

## Design
Rename const keys to **`TIME`**, **`PRICE`**, **`EVENT`** with string values **`time`**, **`price`**, **`event`** (parallel to existing `USER`/`SERVICE`). Update imports/usages; admin select labels → **Time**, **Price**, **Event** (or match product copy in phase guide). `appointmentToWizardTransformer` passes updated key literals (`'TIME'`, `'EVENT'`, `'PRICE'` as applicable). `entities.ts` comment documents the new union.

## Goal
**Client half only:** Update `client/src/constants/blockShapeTypes.ts` and every file that references `BLOCK_SHAPE_TYPES` or `BlockShapeType` so the app matches server/DB block shape types (`time`, `price`, `event`). **Prerequisite:** Task 20.1.1.1 merged/applied on environments that run the app against migrated DB.

**Done for this task:** Constants + types + listed consumers updated; `cd client && npm run lint` passes; app starts; no block-type comparisons using legacy enum strings.

## Files
- **Constants (modify):** `client/src/constants/blockShapeTypes.ts`
- **Types (modify):** `client/src/types/entities.ts` — comment / `BlockShapeEntity.type` semantics
- **Composables:** `client/src/composables/booking/useWizardFilteredOptions.ts`, `client/src/composables/admin/useSelectEnumOptions.ts`
- **Transformers:** `client/src/utils/transformers/appointmentToWizardTransformer.ts`, `client/src/utils/transformers/appointmentToWizardHelpers.ts` (verify `keyof typeof` after const change)
- **Utils / types (import-only or comparisons):** `client/src/utils/booking/cascadeFilterPipeline.ts`, `client/src/utils/blockInstanceUtils.ts`, `client/src/types/transformers/bookingData.ts`, `client/src/utils/admin/calibrationChartTransforms.ts`, `client/src/utils/admin/eligibleUserRoleAlignmentBlockInstances.ts`
- **Optional verify:** `client/src/composables/booking/useDevPanelsComputed.ts` (SERVICE only — likely unchanged)

## Approach
1. Edit `BLOCK_SHAPE_TYPES`: `PROPERTY`→`TIME` (`'time'`), `COUPON`→`PRICE` (`'price'`), `OPTION`→`EVENT` (`'event'`).
2. Replace all `BLOCK_SHAPE_TYPES.PROPERTY|COUPON|OPTION` usages with new names; update admin **titles** to Time / Price / Event.
3. In `appointmentToWizardTransformer.resolveBlockCategories`, update `blockShapeType` literals: `'PROPERTY'`→`'TIME'`, `'OPTION'`→`'EVENT'` (service block stays `'SERVICE'`; no coupon category in this resolver).
4. Run `npm run lint` in `client/`; fix any TS errors from renamed keys.
5. Grep `client/src` for block-shape legacy strings in **type** context; exclude unrelated `property` domains.

## Checkpoint
- Typecheck/lint clean for `client/`.
- Spot-check: wizard filtered options and admin block-shape type select still resolve shapes from global data.
- Final grep: no `BLOCK_SHAPE_TYPES.PROPERTY` / `.OPTION` / `.COUPON` left; no `=== 'property'` against `shape.type` for block shapes.

## Deliverables
- Updated `blockShapeTypes.ts` with `TIME`/`PRICE`/`EVENT` and wire string values.
- Updated consumer files (list above); `entities.ts` comment accurate.
- Lint passing; no behavioral regression in block-shape filtering (manual smoke: admin shapes + booking wizard if available).

## Acceptance Criteria
- [ ] `BLOCK_SHAPE_TYPES` uses keys `TIME`, `PRICE`, `EVENT` with values `time`, `price`, `event`; `USER` and `SERVICE` unchanged.
- [ ] `BlockShapeEntity.type` / `BlockShapeType` reflect new vocabulary; JSDoc/comment in `entities.ts` updated.
- [ ] All listed client files compile; no stale `PROPERTY`/`COUPON`/`OPTION` enum key references for block shapes.
- [ ] `cd client && npm run lint` passes.
- [ ] Spot grep: no accidental edit of real-estate-only strings (`property_details`, ownership `property` resource names on server — out of scope).

## Implementation Orders
**Implement the task now** (edit client files per Goal/Files/Approach). When complete, run **`/task-end 20.1.1.2`** (do not run until implementation is done).

**Task:** 20.1.1.2  
**End command:** `/task-end 20.1.1.2`

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated

---
## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.1-guide.md`
- Handoff (full transition context): `.project-manager/features/domain-architecture-alignment/sessions/task-20.1.1.1-handoff.md`
- Architecture: `.project-manager/ARCHITECTURE.md` — domain map, data flow, type boundaries, naming; **§8–§14** = locked domain rules (block model, part ledger, PartFinalizer, invariants) for booking / admin scheduling work
- Workflow friction log (non-git harness issues): `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences (harness advisory only; Cursor does not auto-switch models): `.project-manager/agent-model-config.json`
- Governance reports: `client/.audit-reports/` — function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
- **Workflow friction:** `.project-manager/WORKFLOW_FRICTION_LOG.md` — classified harness failures are auto-appended (see `HARNESS_WORKFLOW_FRICTION` in the tier playbook). Scan recent entries before changing tier routing: `npx tsx .cursor/commands/utils/read-workflow-friction.ts --last 20`
