# Plan: task 6.12.1.3 — Annotation instance content table and migration

## Contract
- **Tier:** task | **ID:** 6.12.1.3
- **Scope:** Relational **`annotation_instance_content`** keyed by **`annotation_instance_id`** + **`user_type_block_instance_id`** (nullable for “generic” row), backfill from legacy **`annotation_instances.user_type`** + **`text`**, then align read/write paths so per–user-type copy lives in the new table; narrow or stop writing **`AnnotationInstance.userType`** / single **`text`** where content rows replace that model.
- **Governance:** Migrations explicit; no silent backfill failures — log counts and any skipped rows; keep functions shallow; explicit return types on new exports.

## Work Profile
- **Execution intent:** implement
- **Action type:** cross_cutting
- **Scope shape:** cross_cutting
- **Governance domains:** function, type
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Tasks **6.12.1.1**–**6.12.1.2** complete. TierUp: `sessions/session-6.12.1-planning.md`. Prior task handoff: `task-6.12.1.2-handoff.md`.

## Goal
Introduce **`annotation_instance_content`** with FKs to **`annotation_instances`** and **`block_instances`** (`user_type_block_instance_id`, **NULL** = generic/default copy for that instance). **Backfill:** for each `annotation_instances` row, insert content row(s) from existing **`text`** (and **`user_type`** when present — map to `user_type_block_instance_id`). **API / Sequelize:** new model file, `server/src/db/models/index.ts` associations, and update loaders/serializers that today assume a single `text` + `userType` on the instance (e.g. `relationshipQueryBuilders.ts`, batch/CRUD paths, any codec/transformer). **Deprecate:** document and stop relying on **`annotation_instances.user_type`** for new writes once content table is source of truth; **`annotation_assignments`** already carries `user_type_block_instance_id` — align reads so effective text resolves from content table by (instance id, user type id | null). **Out of scope:** annotation shape DELETE **409** (**task 6.12.1.4**); UI slots / wizard (**6.12.2**).

## Files
- **New:** `server/src/db/migrations/*_annotation_instance_content.mjs` — create table, unique constraint on `(annotation_instance_id, user_type_block_instance_id)` with NULLS DISTINCT or partial unique for generic row per project DB rules; backfill from `annotation_instances`.
- **New:** `server/src/db/models/booking/annotation_instance_content.ts` — Sequelize model + factory.
- `server/src/db/models/index.ts` — register model; `belongsTo` AnnotationInstance, BlockInstance (user type).
- `server/src/db/models/booking/annotation_instance.ts` — comments / optional follow-up: stop exposing `userType` in new code paths (column may remain until a later migration drops it).
- `server/src/routes/internal/relationships/relationshipQueryBuilders.ts` — attributes/includes: join or subquery content for `text` per assignment context.
- `server/src/routes/internal/relationships/relationshipAnnotationAssignmentRouter.ts` — if payloads touch annotation text or user-type scoping.
- `server/src/routes/internal/relationships/relationshipHelpers.ts` — field mapping for annotation payloads.
- Shared/client types and transformers that embed `annotationInstance` / `userType` / `text` (grep `annotation_instances`, `AnnotationInstance`, `userType` under `client/src` and `shared/`).
- `server/src/config/models.ts` / `server/src/config/app.ts` if new model must be registered for sync.

## Approach
1. **Schema:** Table columns at minimum: `id`, `annotation_instance_id`, `user_type_block_instance_id` (nullable), `text` (TEXT), `order_index`/`active` only if needed; timestamps. FK + indexes matching query patterns.
2. **Backfill migration:** For each `annotation_instances` row: insert one row with `user_type_block_instance_id` = UUID from `user_type` when set, else **NULL**; `text` from legacy column. Log inserted count vs source count.
3. **Read path:** When returning annotations for admin/booking, resolve display text from content table: match `(annotationId, userTypeBlockInstanceId)` else fall back to `(annotationId, NULL)` else legacy `annotation_instances.text` during transition.
4. **Write path:** On create/update of annotation instance “copy”, upsert content rows instead of (or in addition to) mutating `annotation_instances.text` / `user_type` — pick one consistent strategy and document in model comments.
5. **Verify:** Migration on empty and seeded DB; existing relationships still load; no 500s on relationship routes.

## Checkpoint
- [ ] Migration applies; backfill completes; logged summary.
- [ ] At least one read path (e.g. relationship query used by admin or booking) returns correct text per user type using content table.
- [ ] Server compiles; client types aligned if API shape changes.
- [ ] **Out of scope check:** no DELETE 409 work in this task (defer to **6.12.1.4**).

## How we build the tierDown to achieve them
- **Session 6.12.1:** Entity enhancements and annotation data layer
- **Task 6.12.1.1:** Event shape invite link toggles
- **Task 6.12.1.2:** Block/part shape expansion + drag handle
- **Task 6.12.1.3:** Annotation instance content table and migration (this task)
- **Task 6.12.1.4:** Annotation shape delete — 409 when dependents exist

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.12.1-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.12.1.2-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
