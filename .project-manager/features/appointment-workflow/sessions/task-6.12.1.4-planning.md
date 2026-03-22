# Plan: task 6.12.1.4 — Annotation shape delete returns 409

## Contract
- **Tier:** task | **ID:** 6.12.1.4
- **Scope:** `DELETE` on **annotation shapes** when `annotation_instances.type` still references the shape → **409** with actionable JSON (not **500**). Successful delete when no dependents unchanged.
- **Governance:** Thin route branch + named helper if logic grows; explicit messages in `entityConstants`; log conflict at info/warn with shape id + count (no silent swallow).

## Work Profile
- **Execution intent:** implement
- **Action type:** localized_change
- **Scope shape:** file_local
- **Governance domains:** function
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Task **6.12.1.3** complete (`annotation_instance_content`, read/write alignment). TierUp: `sessions/session-6.12.1-planning.md`. Prior handoff: `task-6.12.1.3-handoff.md`.

## Goal
Admin/API `DELETE` of an **annotation shape** that is still referenced by **annotation instances** must return **409 Conflict** with a JSON body the client can surface (short `error`, longer `details`, plus `shapeId` and `dependentCount` or equivalent). Deleting a shape with **zero** referencing instances keeps current success behavior. **Out of scope:** session 6.12.2 UI slots; changing FK semantics in DB; bulk-delete APIs unless they already call the same path.

## Files
- `server/src/routes/internal/entities/entityCrudRouter.ts` — in `DELETE /:entityType/:id`, when `entityType` is `annotationShape` / `ENTITY_KEYS.ANNOTATION_SHAPE`, pre-check dependents before `deleteRecord`.
- `server/src/routes/internal/entities/entityConstants.ts` — user-facing strings for the 409 response (`error` + `details` template).
- Optional: small helper under `server/src/services/annotations/` (e.g. `countAnnotationInstancesForShape(shapeId)`) if the DELETE handler would otherwise exceed function-governance size.

## Approach
1. **Pre-count (primary):** `AnnotationInstance.count({ where: { type: shapeId } })` (or equivalent on registered model). If `> 0`, `res.status(409).json({ error, details, shapeId, dependentCount })` and return — do not call `deleteRecord`.
2. **Consistency:** Mirror the spirit of `relationshipErrorHandler` 409 bodies (`error`, `details`, contextual ids) so admin clients can reuse error-display patterns.
3. **Fallback (optional safety net):** If delete still throws `SequelizeForeignKeyConstraintError` (race), extend `entityErrorHandler.handleDatabaseConstraintError` to map that case to the same 409 body when constraint/name indicates `annotation_instances` → `annotation_shapes`.
4. **Verify:** Unused shape → existing success; in-use shape → 409, no 500; server `npm run compile` + `npm run lint`.

## Design Before Execute (pseudocode)
```
DELETE annotationShape(id):
  if entityType !== annotationShape: existing delete path
  n = count(annotation_instances where type = id)
  if n > 0:
    return 409 { error, details, shapeId: id, dependentCount: n }
  return deleteRecord(model, id) as today
```

## Checkpoint
- [ ] Referenced shape → **409** + structured JSON; unreferenced → delete succeeds.
- [ ] Server compile and lint clean for touched files.

## How we build the tierDown
- **Session 6.12.1:** Entity enhancements and annotation data layer
- **Task 6.12.1.1:** Event shape invite link toggles
- **Task 6.12.1.2:** Block shapes tab expansion
- **Task 6.12.1.3:** Annotation instance content table
- **Task 6.12.1.4:** Annotation shape delete — 409 when dependents exist (this task)

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.12.1-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.12.1.3-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
