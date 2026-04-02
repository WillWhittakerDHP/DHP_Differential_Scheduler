<!-- harness-planning-rollup tier=session id=20.1.2 consolidatedAt=2026-04-02T15:39:17.295Z -->

# Consolidated planning: session 20.1.2

## Session 20.1.2 (parent)

## Story

**This session delivers** block-instance three-property schema alignment and block-shape legacy cleanup across migrations, Sequelize models, and directly impacted type/validation consumers **so that** later passes can treat `block_instances` as the home of `composite` / `orchestrator` / `wizardVisible` without carrying legacy shape booleans or stale instance fields.
**Estimated size:** M

---

## Analysis

- **Problem / why now:** Session 20.1.1 renamed the type vocabulary; the next locked architecture rule is that the three orthogonal properties live on `block_instances`, not `block_shapes`. Current models and client types still encode the old split, so later event/admin passes would build on the wrong shape.
- **Domain boundaries:** Server persistence (`db/models`, migrations) plus client-only entity types and direct consumers in admin/booking flows. No new shared types are needed; this remains local to `server/` and `client/src/types`.
- **Grounding in code:** `block_instance.ts` and `client/src/types/entities.ts` prove the old instance fields are still modeled. `block_shape.ts`, `entityCrudRouter.ts`, and `relationshipHelpersValidation.ts` prove runtime code still assumes shape-level booleans are authoritative.
- **Patterns to follow:** Keep migrations idempotent (`IF EXISTS` / `DROP COLUMN IF EXISTS`) and pair model/type changes in the same task. Prefer narrow targeted cleanup around direct field references instead of broad refactors.
- **Risks / open questions:** The biggest risk is **runtime behavior**, not lint. Removing `isStateControl` / `composable` from the model without replacing their call sites will break attendee validation, user-role alignment, and component relationship rules. We should explicitly capture that in task scope instead of pretending this is “models only.”
- **Alternatives considered:** Doing one giant task for all model + consumer cleanup would blur risk and make recovery harder. Splitting by entity family (`block_instances` first, `block_shapes` second) gives cleaner checkpoints.

## Goal

Align **block instance** and **block shape** storage with the locked three-property model for this session only:
- `block_instances` owns `composite`, `orchestrator`, `wizardVisible`.
- Remove legacy instance columns `bookingMode`, `differential`, `differentialEventRoleOverrides`.
- Remove legacy shape booleans `composable`, `isStateControl`, `canHaveParts`.
- Update Sequelize models, client entity types, and direct runtime references that would break once those columns disappear.

**Done for this session:** Migration(s) authored; `BlockInstance` / `BlockShape` Sequelize models updated; `BlockInstanceEntity` / `BlockShapeEntity` updated; direct legacy field references addressed enough for app start + lint to pass.

## Files

- **Canonical (read-only references):** `.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md`, `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` (§1, §2, §8.1), `.project-manager/ARCHITECTURE.md` (§8–§14)
- **Harness / PM:** `phases/phase-20.1-guide.md`, this planning doc, feature handoff/log
- **Migration(s) (create):** `server/src/db/migrations/` — add `orchestrator`, `wizard_visible`; drop legacy columns from `block_instances` / `block_shapes`
- **Server models (modify):** `server/src/db/models/booking/block_instance.ts`, `server/src/db/models/admin/block_shape.ts`
- **Server direct consumers (verify/update as needed):** `server/src/routes/internal/entities/entityCrudRouter.ts`, `server/src/routes/internal/relationships/relationshipHelpersValidation.ts`, `server/src/utils/validateUserRoleBlockAlignmentPayload.ts`, `server/src/utils/userTypeMapping.ts`, `server/src/repositories/stateControlUserTypeBlockInstanceIds.ts`, `server/src/repositories/availabilityDifferentialAttendeeCleanup.ts`
- **Client types / direct consumers (modify):** `client/src/types/entities.ts`, plus any direct references revealed by grep (initially `client/src/utils/eventAttendeeUtils.ts`, `client/src/utils/admin/eligibleUserRoleAlignmentBlockInstances.ts`, booking consumers of `differentialEventRoleOverrides`)
- **Out of scope for this session:** event schema / attendee table rename files (`event_shape`, `event_instance`, attendee model rename) — session 20.1.3

## Approach

1. **Task 20.1.2.1:** Handle `block_instances` storage: author migration for `orchestrator` + `wizard_visible`, drop `bookingMode`, `differential`, `differentialEventRoleOverrides`, update `block_instance.ts`, `BlockInstanceEntity`, and any direct booking/client consumers that must compile once those fields are gone.
2. **Task 20.1.2.2:** Handle `block_shapes` cleanup: drop `composable`, `isStateControl`, `canHaveParts`, remove model validate hook, update `BlockShapeEntity`, and re-home or remove direct runtime checks that still depend on those booleans.
3. **Migration pattern:** `.mjs` raw SQL with JSDoc header + idempotent guards. If runtime code still reads a field, update that code in the same task before considering the drop complete.
4. **Verification:** run `cd server && npm run lint`, `cd client && npm run lint`, and app start check after both tasks. Grep for removed field names in touched domains before `session-end`.
5. **DB_HOST policy:** author files here; only execute migrations locally if DB host is `localhost` / `127.0.0.1`.

## Checkpoint

- After Task 20.1.2.1: `block_instances` model + client type compile with `orchestrator` / `wizardVisible`; removed instance fields no longer block build.
- After Task 20.1.2.2: no `BlockShape` model fields or direct client/server checks depend on `composable` / `isStateControl` / `canHaveParts`.
- Final session checkpoint: app starts; client + server lint pass; grep confirms removed field names are only present in intentional non-domain strings / archived docs.

## Deliverables

- Migration file(s) for `block_instances` / `block_shapes` column alignment
- Updated `server/src/db/models/booking/block_instance.ts`
- Updated `server/src/db/models/admin/block_shape.ts`
- Updated `client/src/types/entities.ts`
- Focused cleanup of direct runtime references to removed fields in server/client call sites

## Acceptance Criteria

- [ ] Migration(s) add `orchestrator` and `wizard_visible` to `block_instances` with safe defaults, and drop `bookingMode`, `differential`, `differentialEventRoleOverrides`.
- [ ] Migration(s) drop `composable`, `is_state_control`, and `can_have_parts` from `block_shapes`.
- [ ] `server/src/db/models/booking/block_instance.ts` and `client/src/types/entities.ts` reflect the new block-instance shape.
- [ ] `server/src/db/models/admin/block_shape.ts` and `client/src/types/entities.ts` no longer expose the removed block-shape booleans.
- [ ] Direct runtime references to removed fields are either updated to the new source of truth or removed so `cd server && npm run lint` and `cd client && npm run lint` pass.
- [ ] Coverage check: these two tasks are enough to enact the session goal without spilling event-shape work into 20.1.2.

---

## Task 20.1.2.1 (source: task-20.1.2.1-planning.md)

### Story

**This task changes** `block_instances` storage, its Sequelize/client contracts, and the direct booking/admin/versioning code that still reads `bookingMode`, `differential`, or `differentialEventRoleOverrides` **because** Session 20.1.2 must move the three-property model onto block instances before block-shape cleanup can happen safely.

---

### Analysis

- **Problem / why now:** Session 20.1.1 renamed the type vocabulary; the next locked architecture rule is that the three orthogonal properties live on `block_instances`, not `block_shapes`. Current models and client types still encode the old split, so later event/admin passes would build on the wrong shape.
- **Domain boundaries:** Server persistence (`db/models`, migrations) pl… _(truncated)_

### Goal

**Task 20.1.2.1 only:** Bring `block_instances` in line with the three-property model by adding `orchestrator` / `wizardVisible`, removing `bookingMode`, `differential`, and `differentialEventRoleOverrides`, and updating the server/client code paths that directly depend on those fields.

**Done for this task:** Migration authored; `block_instance.ts` updated; direct versioning/client type consumers updated; client + server lint pass for the touched surface.

### Files

- **Migration (create):** `server/src/db/migrations/` — add `orchestrator`, `wizard_visible`; drop `booking_mode`, `differential`, `differential_event_role_overrides` from `block_instances`
- **Server model (modify):** `server/src/db/models/booking/block_instance.ts`
- **Versioning / snapshot server consumers:** `server/src/db/models/booking/block_instance_version.ts`, `server/src/services/instanceVersioning.ts`, `server/src/services/appointmentSnapshotLoader.ts`
- **Client entity + transforms:** `client/src/types/entities.ts`, `client/src/utils/transformers/entityTransformers.ts`, `client/src/utils/transformers/globalToBookingTransformerBlocks.ts`
- **Client direct consumers to verify/update:** `client/src/composables/admin/useInstanceFiltering.ts`, `client/src/utils/booking/appointmentSlotBuilder.ts`, plus any smaller booking/admin files still reading removed fields
- **Out of scope for this task:** `block_shapes` boolean removal and its server/client consumers — task `20.1.2.2`

### Approach

1. Author the migration for `block_instances` only. Keep it idempotent and avoid touching `block_shapes` in this task.
2. Update `block_instance.ts` declarations + `init()` entries to the new field set.
3. Remove or rework version/snapshot code that still reads `instanceData.differential`.
4. Update `BlockInstanceEntity` and the client hydration / booking/admin consumers that directly rely on the removed fields.
5. Run `cd server && npm run lint` and `cd client && npm run lint`; grep for removed instance field names in code, excluding docs and unrelated “differential” domains.

### Checkpoint

- `BlockInstance` and `BlockInstanceEntity` compile with `orchestrator` / `wizardVisible`.
- No touched code path still expects `blockInstance.bookingMode`, `blockInstance.differential`, or `blockInstance.differentialEventRoleOverrides`.
- Server and client lint pass for this narrowed scope.

### Deliverables

- Migration for `block_instances` field alignment
- Updated `server/src/db/models/booking/block_instance.ts`
- Updated versioning/snapshot code for removed instance fields
- Updated `client/src/types/entities.ts` plus direct client consumers of removed instance fields

### Acceptance Criteria

- [ ] `block_instances` migration adds `orchestrator` / `wizard_visible` and drops `booking_mode`, `differential`, `differential_event_role_overrides`.
- [ ] `server/src/db/models/booking/block_instance.ts` reflects the new schema.
- [ ] Versioning/snapshot code no longer depends on removed instance fields.
- [ ] `client/src/types/entities.ts` and direct client consumers compile without `bookingMode`, `differential`, or `differentialEventRoleOverrides` on `BlockInstanceEntity`.
- [ ] `cd server && npm run lint` and `cd client && npm run lint` pass.

### Design

1. Author a migration that adds `orchestrator` + `wizard_visible` to `block_instances` with safe defaults and drops `booking_mode`, `differential`, and `differential_event_role_overrides`.
2. Update `block_instance.ts` to expose `orchestrator` / `wizardVisible` and remove the dropped fields.
3. Update versioning/snapshot touchpoints so they no longer depend on removed block-instance fields (`instanceVersioning.ts`, `block_instance_version.ts`, `appointmentSnapshotLoader.ts` as needed).
4. Update `BlockInstanceEntity` and the direct client hydration / booking / admin call sites that currently read those fields.
5. Verify whether any remaining `bookingMode` / `differentialEventRoleOverrides` usage belongs in later sessions; if yes, leave a documented follow-up rather than silent dead code.

---

## Task 20.1.2.2 (source: task-20.1.2.2-planning.md)

### Story

**This task changes** persistence and all branches that read `block_shapes.composable`, `isStateControl`, or `canHaveParts` **because** Feature 20 locks semantics on `block_shapes.type` and instance-level properties; leaving legacy columns risks divergent behavior and blocks the next phase.

---

### Analysis

- **Problem / why now:** Session 20.1.1 aligned type vocabulary; 20.1.2.1 moved orchestration/visibility to `block_instances`. Shape-level booleans duplicate semantics now expressed by `type` + instance flags; they must be removed so later admin/booking work does not branch on stale columns.
- **Domain boundaries:** Server persistence (`db/migrations`, `db/models`), internal routes/repos/utils, client entities/transformers/composables/components. Shared package has no `block_shape` boolean fields today — changes stay client/server local unless a shared contract is explicitly needed.

### Goal

Complete **task 20.1.2.2 only:** remove `composable`, `isStateControl`, and `canHaveParts` from `block_shapes` at the database and type level, and update all server and client code that depended on them so behavior uses **`block_shapes.type`** and **`block_instances.composite`** (and related instance fields) as the locked sources of truth.

**Not in this task:** `block_instances` column work (done in 20.1.2.1); event/attendee table renames (20.1.3+).

### Files

- **Canonical:** `.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md` §8.1; `.project-manager/ARCHITECTURE.md` (block domain sections).
- **New:** `server/src/db/migrations/*_drop_block_shape_legacy_booleans.mjs` (name to match sequence).
- **Server:** `server/src/db/models/admin/block_shape.ts`, `entityCrudRouter.ts`, `entityConstants.ts`, `relationshipHelpersValidation.ts`, `relationshipCrudRouter.ts`, `relationshipConstants.ts`, `validateUserRoleBlockAlignmentPayload.ts`, `userTypeMapping.ts`, `stateControlUserTypeBlockInstanceIds.ts`, `availabilityDifferentialAttendeeCleanup.ts`, `event_shape_attendee.ts` (comment).
- **Client:** `client/src/types/entities.ts`, `bookingData.ts`, `globalToBookingTransformer.ts`, `statusButtonLabels.ts`, `entitySchemaDefaults.ts`, `blockShapeDisplays.ts`, `useFormFields.ts`, `formFields/types.ts`, `buildUseFormFieldsReturn.ts`, `usePrimitiveMutation.ts`, `useInstanceGrouping.ts`, `useSelectFiltering.ts`, `usePartsTotals.ts`, `blockInstanceShape.ts`, `blockInstancePartsTotalsResolution.ts`, `statusButtonTogglePayloads.ts`, `booleanInputNewEntityToggle.ts`, `composePropertyValue.ts`, `eventAttendeeUtils.ts`, `eligibleUserRoleAlignmentBlockInstances.ts`, `RelationshipCollection.vue`, `EntityCard.vue`, `ServiceSelectionStep.vue`, `partsTotals.ts`, plus any additional hits from final grep.

### Approach

1. Final grep in `client/src`, `server/src` for `composable`, `isStateControl`, `canHaveParts` (and snake_case in migrations).
2. Implement replacement logic per **Design** before applying migration locally.
3. Author migration dropping columns; run only if `DB_HOST` is localhost per project policy.
4. `cd server && npm run lint`, `cd client && npm run lint`, `npm run start:dev` smoke check.
5. Grep again to ensure product paths are clean.

### Checkpoint

- Sequelize `BlockShape` has no legacy boolean attributes; migration matches.
- Instance-component creation validates `composite` on instances, not shape `composable`.
- “User type” paths use `type === 'user'` consistently.
- Parts/admin gating uses `type !== 'user'` (or agreed equivalent) without referencing `canHaveParts`.
- Lint + app start pass.

### Deliverables

- [ ] Idempotent migration removing three columns from `block_shapes`.
- [ ] Updated Sequelize model and server route/repo/utils validation and queries.
- [ ] Updated client entities, transformers, composables, admin UI, and booking copy.
- [ ] Error messages and constants updated (no stale mutual-exclusivity copy for removed fields).

### Acceptance Criteria

- [ ] No database column or Sequelize attribute for `composable`, `canHaveParts`, `isStateControl` on `block_shapes`.
- [ ] Creating instance components succeeds when both instances are `composite: true` and same shape rule holds; fails with clear errors when not (no reliance on deleted shape columns).
- [ ] User-type block discovery and attendee-related validation use `block_shapes.type === 'user'`.
- [ ] Client and server lint pass; dev app starts.
- [ ] Grep shows no remaining product-code references to the removed shape fields (allow listed docs/archived paths only if any).

### Design

1. **Migration:** New `.mjs` migration drops columns `composable`, `can_have_parts`, `is_state_control` on `block_shapes` (Sequelize `underscored: true` maps camelCase attributes to these names). Idempotent `IF EXISTS` / information_schema guards per project pattern.
2. **Sequelize `BlockShape`:** Remove fields and the `beforeValidate` hook; remove `MUTUAL_EXCLUSIVITY` usage from entity CRUD for these keys.
3. **Server consumers:** Replace queries/filters/attributes; switch attendee validation to `type === 'user'`; switch instance-component validation to instance `composite` flags; delete or narrow entity PATCH coercions for removed keys.
4. **Client:** Remove properties from `BlockShapeEntity` and booking DTOs; replace every branch with `type` or instance-level data; remove mutual-exclusion toggles in `usePrimitiveMutation` / boolean form helpers / `entitySchemaDefaults` / `blockShapeDisplays` / status button labels as appropriate; update `globalToBookingTransformer` to stop emitting removed keys (or emit derived fields only if booking layer still needs transitional shape — prefer **derive in transformer** from `type` if something still expects a boolean in booking-only types).
5. **Copy:** User-facing strings that say `isStateControl: true` → plain language or `user` type (e.g. `ServiceSelectionStep.vue`).

---
