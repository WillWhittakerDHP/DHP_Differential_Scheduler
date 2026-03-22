# Plan: task 6.12.2.1 — Annotation UI slots constant, `ui_slot` column, validation, and admin

## Contract
- **Tier:** task | **ID:** 6.12.2.1
- **Scope:** `shared/constants/annotationSlots.ts`, DB `annotation_shapes.ui_slot`, server validation against registry, data seed/map for existing shapes, admin dropdown for `ui_slot`
- **Governance:** Clean — shared constant is single source of truth for allowed slot strings; explicit validation, no silent accept of invalid `ui_slot`

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
Session **6.12.2** started on branch `session-6.12.2`; first task in session. TierUp: `sessions/session-6.12.2-planning.md`. **Out of next task:** wizard transformer, `useAnnotationContent`, card/grid wiring (**6.12.2.2**).

## Goal
Establish the **annotation UI slot vocabulary** and **persisted `ui_slot` on annotation shapes** so admin and server agree on allowed values. Deliver: (1) `shared/constants/annotationSlots.ts` with `ANNOTATION_UI_SLOTS`, `AnnotationUiSlot`, and `ANNOTATION_UI_SLOT_REGISTRY` matching `phase-6.12-guide.md` Reference; (2) nullable `ui_slot` column (e.g. VARCHAR(50)) on `annotation_shapes` via migration + Sequelize model field mapping; (3) validate `ui_slot` on create/update (and batch if applicable) — reject unknown values with a clear error; (4) seed or migrate existing rows: map legacy shape kinds per phase guide (Description → `cardDescription`, Tooltip → `cardTooltip`, validation_message → `validationMessage`, etc.); (5) admin: expose `ui_slot` as a select whose options come from `ANNOTATION_UI_SLOT_REGISTRY` (labels for humans, slot keys as values). **Out of scope:** `globalToBookingTransformer`, `useAnnotationContent`, `SelectionCard` / `IndependentSelectCard`, `AvailabilityStep` (**task 6.12.2.2**); new automated tests (project policy).

## Files
- **Intent:** `.project-manager/features/appointment-workflow/phases/phase-6.12-guide.md` (Reference: registry snippet)
- **New:** `shared/constants/annotationSlots.ts` (mirror style of `shared/constants/templateVariables.ts`)
- **Server:** new migration under `server/src/db/migrations/`; `server/src/db/models/booking/annotation_shape.ts` (or current path for annotation shape model); annotation shape routes/services/validators and any batch entity codec that maps `annotationShape`
- **Client:** `client/src/types/entities.ts` (or equivalent) — `ui_slot` on annotation shape entity; `client/src/configs/adminConfig.ts` / primitive field metadata / select options builder for annotation shape entity
- **Governance:** `client/.audit-reports/*`, `.project-manager/*_AUTHORING_PLAYBOOK.md`

## Approach
1. Add **`annotationSlots.ts`** with const object, type alias from `typeof`, and `ANNOTATION_UI_SLOT_REGISTRY` array; export helpers if useful: e.g. `isAnnotationUiSlot(value: string)`, `getAnnotationUiSlotLabels()` for admin (keep functions shallow, explicit return types).
2. **Migration:** add `ui_slot` nullable; in same or follow-up migration, `UPDATE` existing `annotation_shapes` rows from existing discriminator columns (e.g. internal name / type / slug — inspect current schema and phase seed rules); log counts updated.
3. **Model + API:** map camelCase `uiSlot` / snake_case `ui_slot` consistently with project conventions; include in list/detail/batch responses used by admin.
4. **Validation:** on PATCH/POST (and bulk paths if present), if `ui_slot` is non-null it must be in the allowed set from shared constant; empty string → treat as null if that matches UX.
5. **Admin:** add primitive/select field bound to registry options; ensure create/edit flows persist and reload correctly.
6. **Verify:** migration applies on dev DB; admin can set/clear slot; invalid slot rejected by API; `cd client && npm run lint` and server compile clean.

## Checkpoint
- [ ] `annotationSlots.ts` exists; server and client import it (no duplicated magic strings for validation)
- [ ] Column + model + API payloads include `ui_slot`; validation rejects unknown values
- [ ] Legacy rows mapped per phase guide; admin dropdown shows registry labels
- [ ] No work deferred into 6.12.2.2 except consumer-side wiring

## How we build the tierDown to achieve them
- **Session 6.12.2:** Annotation UI slots registry and wizard pipeline
- **Task 6.12.2.1:** Leaf task — slots constant, `ui_slot` schema, validation, admin, seed mapping (complete before **Task 6.12.2.2**)
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.12.2-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
