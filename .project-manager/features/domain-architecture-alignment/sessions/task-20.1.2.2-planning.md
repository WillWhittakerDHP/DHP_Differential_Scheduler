# Plan: task 20.1.2.2 — Block shape legacy boolean cleanup

## Contract
- **Tier:** task | **ID:** 20.1.2.2
- **Scope:** Drop `composable`, `isStateControl`, and `canHaveParts` from `block_shapes` (migration + Sequelize + types) and re-home every runtime branch that still depends on those columns. **Source of truth:** `block_shapes.type` (`user` | `service` | `time` | `event` | `price`) and instance-level fields already on `block_instances` (`composite`, `orchestrator`, `wizardVisible`) per `FEATURE_20_ARCHITECTURE_REDESIGN.md` §8.1.
- **Governance (harness snapshot):**
  - Governance Context (Task)
  - File-Scoped Violations
  - No existing violations in task files.
  - Thresholds (Quick Reference)

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** cross_cutting (DB + server + client)
- **Governance domains:** function, type
- **Gate profile:** fast
- **Suggested depth:** leaf — advisory; agent decides in Analysis / Decomposition
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition.

## Where we left off
- [ ] **Task 20.1.2.2:** Block shape legacy boolean cleanup — migration drops three columns; models and all consumers updated; grep clean in product code for removed field names (except intentional docs/archived strings).

## Parent context (session planning — Analysis excerpt)

- **Problem / why now:** Session 20.1.1 aligned type vocabulary; 20.1.2.1 moved orchestration/visibility to `block_instances`. Shape-level booleans duplicate semantics now expressed by `type` + instance flags; they must be removed so later admin/booking work does not branch on stale columns.
- **Domain boundaries:** Server persistence (`db/migrations`, `db/models`), internal routes/repos/utils, client entities/transformers/composables/components. Shared package has no `block_shape` boolean fields today — changes stay client/server local unless a shared contract is explicitly needed.

## Story
**This task changes** persistence and all branches that read `block_shapes.composable`, `isStateControl`, or `canHaveParts` **because** Feature 20 locks semantics on `block_shapes.type` and instance-level properties; leaving legacy columns risks divergent behavior and blocks the next phase.

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

- **Paths reviewed (grep + spot reads):**
  - **Server model:** `server/src/db/models/admin/block_shape.ts` — declares three booleans + Sequelize `beforeValidate` mutual exclusivity for `isStateControl` / `canHaveParts`.
  - **Server routes/utils/repos:** `server/src/routes/internal/entities/entityCrudRouter.ts` (PATCH normalization), `server/src/routes/internal/entities/entityConstants.ts` (`MUTUAL_EXCLUSIVITY_MESSAGE`), `server/src/routes/internal/relationships/relationshipHelpersValidation.ts` (`validateBlockShapesComposable` uses `composable`; `validateAttendeeAssignmentEntities` uses `isStateControl`), `server/src/routes/internal/relationships/relationshipCrudRouter.ts` (calls `validateBlockShapesComposable`), `server/src/routes/internal/relationships/relationshipConstants.ts` (`NOT_COMPOSABLE`), `server/src/utils/validateUserRoleBlockAlignmentPayload.ts` (attributes + `isStateControl` check), `server/src/utils/userTypeMapping.ts` (`where: { isStateControl: true }`), `server/src/repositories/stateControlUserTypeBlockInstanceIds.ts`, `server/src/repositories/availabilityDifferentialAttendeeCleanup.ts`, `server/src/db/models/booking/event_shape_attendee.ts` (comment only).
  - **Client types/transformers:** `client/src/types/entities.ts` (`BlockShapeEntity`), `client/src/types/transformers/bookingData.ts` (`BookingBlockShape`), `client/src/utils/transformers/globalToBookingTransformer.ts`, `client/src/constants/statusButtonLabels.ts`, `client/src/constants/entitySchemaDefaults.ts`, `client/src/configs/field/display/appliedDisplay/blockShapeDisplays.ts`.
  - **Client runtime:** `client/src/utils/eventAttendeeUtils.ts`, `client/src/utils/admin/eligibleUserRoleAlignmentBlockInstances.ts`, `client/src/utils/admin/blockInstanceShape.ts`, `client/src/utils/admin/blockInstancePartsTotalsResolution.ts`, `client/src/utils/admin/statusButtonTogglePayloads.ts`, `client/src/utils/admin/booleanInputNewEntityToggle.ts`, `client/src/utils/transformers/composePropertyValue.ts`, `client/src/utils/formFields/buildUseFormFieldsReturn.ts`, `client/src/composables/formFields/useFormFields.ts`, `client/src/composables/formFields/types.ts`, `client/src/composables/admin/useInstanceGrouping.ts`, `client/src/composables/admin/useSelectFiltering.ts`, `client/src/composables/admin/usePartsTotals.ts`, `client/src/composables/entityCrud/usePrimitiveMutation.ts` (`BLOCK_SHAPE_MUTUAL_EXCLUSION_KEYS`), `client/src/components/admin/generic/RelationshipCollection.vue`, `client/src/components/admin/generic/EntityCard.vue`, `client/src/components/booking/steps/ServiceSelectionStep.vue`, `client/src/types/admin/partsTotals.ts`.
  - **Shared:** no matches for these three field names under `shared/`.

- **Patterns / call sites:** “User type block” is currently detected via `isStateControl === true` (often combined with `type === 'user'`). “Composable” for **instance components** is enforced in `validateBlockShapesComposable` on **shape** `composable`. `canHaveParts` gates admin parts totals and form-field helpers; it was mutually exclusive with `isStateControl` at the shape layer.

- **Gaps / unknowns:** Confirm edge DB rows where `type` and old booleans disagree before drop (optional one-off SQL or migration pre-step); if any row has `type !== 'user'` but `isStateControl === true`, fix data before or during migration.

## Analysis

- **Problem / why now:** Feature 20 explicitly removes these columns; 20.1.2.1 already added instance-level `orchestrator` / `wizardVisible` / `composite`. Keeping shape booleans duplicates semantics and risks inconsistent UI and API behavior.
- **Domain boundaries:** Touches **admin/config** (CRUD, forms, mutations, displays), **relationships** (instance components, attendee validation), **booking** (transformers, attendee utils, wizard copy), and **repos** (availability cleanup, user-type ID discovery). Does not rename `event_shape` / attendee tables (later session).
- **Replacement mapping (implement in code, not only in docs):**
  - **`isStateControl`** → **`blockShape.type === 'user'`** (use `BLOCK_SHAPE_TYPES.USER` on client; server string `'user'`). Applies to: user-type block discovery, attendee validation, alignment payloads, availability cleanup, filters that required “state control” shapes.
  - **`canHaveParts`** → **no per-row shape column.** Per Feature 20, the part-instance ledger applies broadly; **practical gate for “same as old canHaveParts && !isStateControl”** is **`type !== 'user'`** for shapes that participate in part totals / parts UI (verify against product intent if any `service` shape should differ — default assumption: non-user types match prior `canHaveParts === true` cases).
  - **`composable` (shape)** → **instance-level `composite`** for **instance-component** relationships: `relationshipCrudRouter` should validate `parentBlockInstance.composite && childBlockInstance.composite` (and retain same-`blockShapeRef` rule). Update error strings in `relationshipConstants` / validation helpers accordingly.
- **Risks:** Missing a grep hit leaves a runtime `undefined` or Sequelize attribute error after migration. Relationship and admin form code paths are the highest risk.
- **Alternatives:** Deferred column drop — rejected; architecture locks removal in this phase.

## Design

1. **Migration:** New `.mjs` migration drops columns `composable`, `can_have_parts`, `is_state_control` on `block_shapes` (Sequelize `underscored: true` maps camelCase attributes to these names). Idempotent `IF EXISTS` / information_schema guards per project pattern.
2. **Sequelize `BlockShape`:** Remove fields and the `beforeValidate` hook; remove `MUTUAL_EXCLUSIVITY` usage from entity CRUD for these keys.
3. **Server consumers:** Replace queries/filters/attributes; switch attendee validation to `type === 'user'`; switch instance-component validation to instance `composite` flags; delete or narrow entity PATCH coercions for removed keys.
4. **Client:** Remove properties from `BlockShapeEntity` and booking DTOs; replace every branch with `type` or instance-level data; remove mutual-exclusion toggles in `usePrimitiveMutation` / boolean form helpers / `entitySchemaDefaults` / `blockShapeDisplays` / status button labels as appropriate; update `globalToBookingTransformer` to stop emitting removed keys (or emit derived fields only if booking layer still needs transitional shape — prefer **derive in transformer** from `type` if something still expects a boolean in booking-only types).
5. **Copy:** User-facing strings that say `isStateControl: true` → plain language or `user` type (e.g. `ServiceSelectionStep.vue`).

## Goal

Complete **task 20.1.2.2 only:** remove `composable`, `isStateControl`, and `canHaveParts` from `block_shapes` at the database and type level, and update all server and client code that depended on them so behavior uses **`block_shapes.type`** and **`block_instances.composite`** (and related instance fields) as the locked sources of truth.

**Not in this task:** `block_instances` column work (done in 20.1.2.1); event/attendee table renames (20.1.3+).

## Files (expected touch set)

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §8.1; `.project-manager/ARCHITECTURE.md` (block domain sections).
- **New:** `server/src/db/migrations/*_drop_block_shape_legacy_booleans.mjs` (name to match sequence).
- **Server:** `server/src/db/models/admin/block_shape.ts`, `entityCrudRouter.ts`, `entityConstants.ts`, `relationshipHelpersValidation.ts`, `relationshipCrudRouter.ts`, `relationshipConstants.ts`, `validateUserRoleBlockAlignmentPayload.ts`, `userTypeMapping.ts`, `stateControlUserTypeBlockInstanceIds.ts`, `availabilityDifferentialAttendeeCleanup.ts`, `event_shape_attendee.ts` (comment).
- **Client:** `client/src/types/entities.ts`, `bookingData.ts`, `globalToBookingTransformer.ts`, `statusButtonLabels.ts`, `entitySchemaDefaults.ts`, `blockShapeDisplays.ts`, `useFormFields.ts`, `formFields/types.ts`, `buildUseFormFieldsReturn.ts`, `usePrimitiveMutation.ts`, `useInstanceGrouping.ts`, `useSelectFiltering.ts`, `usePartsTotals.ts`, `blockInstanceShape.ts`, `blockInstancePartsTotalsResolution.ts`, `statusButtonTogglePayloads.ts`, `booleanInputNewEntityToggle.ts`, `composePropertyValue.ts`, `eventAttendeeUtils.ts`, `eligibleUserRoleAlignmentBlockInstances.ts`, `RelationshipCollection.vue`, `EntityCard.vue`, `ServiceSelectionStep.vue`, `partsTotals.ts`, plus any additional hits from final grep.

## Approach

1. Final grep in `client/src`, `server/src` for `composable`, `isStateControl`, `canHaveParts` (and snake_case in migrations).
2. Implement replacement logic per **Design** before applying migration locally.
3. Author migration dropping columns; run only if `DB_HOST` is localhost per project policy.
4. `cd server && npm run lint`, `cd client && npm run lint`, `npm run start:dev` smoke check.
5. Grep again to ensure product paths are clean.

## Checkpoint

- Sequelize `BlockShape` has no legacy boolean attributes; migration matches.
- Instance-component creation validates `composite` on instances, not shape `composable`.
- “User type” paths use `type === 'user'` consistently.
- Parts/admin gating uses `type !== 'user'` (or agreed equivalent) without referencing `canHaveParts`.
- Lint + app start pass.

## Deliverables

- [ ] Idempotent migration removing three columns from `block_shapes`.
- [ ] Updated Sequelize model and server route/repo/utils validation and queries.
- [ ] Updated client entities, transformers, composables, admin UI, and booking copy.
- [ ] Error messages and constants updated (no stale mutual-exclusivity copy for removed fields).

## Acceptance Criteria

- [ ] No database column or Sequelize attribute for `composable`, `canHaveParts`, `isStateControl` on `block_shapes`.
- [ ] Creating instance components succeeds when both instances are `composite: true` and same shape rule holds; fails with clear errors when not (no reliance on deleted shape columns).
- [ ] User-type block discovery and attendee-related validation use `block_shapes.type === 'user'`.
- [ ] Client and server lint pass; dev app starts.
- [ ] Grep shows no remaining product-code references to the removed shape fields (allow listed docs/archived paths only if any).

## Definition of Done

- [ ] App starts (`npm run start:dev`)
- [ ] Lint passes (`cd client && npm run lint`, `cd server && npm run lint`)
- [ ] Governance score maintained or improved
- [ ] Session guide task status updated (after `/task-end`)

---

## Reference (read before filling — governance and inventory compliance is required)
- TierUp guide: `.project-manager/features/domain-architecture-alignment/sessions/session-20.1.2-guide.md`
- Architecture: `.project-manager/ARCHITECTURE.md`
- Feature 20: `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md`
- Workflow friction log: `.project-manager/WORKFLOW_FRICTION_LOG.md`
- Agent model preferences: `.project-manager/agent-model-config.json`
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
