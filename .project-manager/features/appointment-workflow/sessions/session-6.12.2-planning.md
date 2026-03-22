# Plan: session 6.12.2 — Annotation UI slots registry and wizard pipeline

## Contract
- **Tier:** session | **ID:** 6.12.2
- **Scope:** Shared `ANNOTATION_UI_SLOTS` / registry, `annotation_shapes.ui_slot`, admin UX, transformer + `useAnnotationContent`, wizard cards and grid overlay with fallbacks
- **Governance:** 3 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** cross_cutting
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Session **6.12.1** complete (event/link toggles, block expansion, `annotation_instance_content`, annotation shape delete **409**). TierUp: `phases/phase-6.12-guide.md` Session 6.12.2 block and Reference (annotation slots snippet). Prior handoff: `sessions/session-6.12.1-handoff.md` (resolve any merge markers in that file before relying on it).

## Goal
Ship **annotation UI slots** end-to-end for the booking wizard and admin: (1) add `shared/constants/annotationSlots.ts` with `ANNOTATION_UI_SLOTS`, `AnnotationUiSlot`, and `ANNOTATION_UI_SLOT_REGISTRY` (per phase guide); (2) add nullable `ui_slot` on `annotation_shapes`, validate values server-side against the shared constant, seed/map legacy shape kinds (e.g. Description → `cardDescription`, Tooltip → `cardTooltip`, validation_message → `validationMessage`), and expose a registry-driven dropdown in admin; (3) extend `globalToBookingTransformer` so `BookingBlockInstance` (and event-shape path where needed) carries annotation data the wizard can read; (4) add `useAnnotationContent` to resolve text/tooltip by slot + selected user type (aligned with `annotation_instance_content`); (5) wire `SelectionCard` / `IndependentSelectCard` for `cardDescription` / `cardTooltip`; (6) migrate grid overlay copy to `gridOverlay` slot on event shapes where applicable — `AvailabilityStep.vue` prefers annotation, falls back to `differentialPerspectives.differentialGraphDefaultLabel`. **Out of scope:** Session 6.12.1 DB/API work; new test files (project policy).

## Files
- **Intent:** `.project-manager/features/appointment-workflow/phases/phase-6.12-guide.md` (Session 6.12.2 + Reference block), `sessions/session-6.12.2-guide.md`
- **Shared:** new `shared/constants/annotationSlots.ts` (pattern: `shared/constants/templateVariables.ts`); re-export or import paths for server + client bundlers
- **Server:** migration for `annotation_shapes.ui_slot`; `server/src/db/models/booking/annotation_shape.ts` (or equivalent); annotation shape create/update validators and batch payloads; optional seed migration or one-time data script for existing rows
- **Client types / admin:** `client/src/types/entities.ts` (or annotation shape entity), `client/src/configs/adminConfig.ts` / field metadata for dropdown bound to registry
- **Wizard:** `client/src/utils/transformers/globalToBookingTransformer.ts`; new `client/src/composables/booking/useAnnotationContent.ts` (path TBD — align with existing composable layout)
- **UI:** `SelectionCard`, `IndependentSelectCard` (locate under `client/src`); `AvailabilityStep.vue` grid overlay
- **Governance:** `client/.audit-reports/*`, `.project-manager/*_AUTHORING_PLAYBOOK.md`

## Approach
1. **Constants first:** Implement `annotationSlots.ts` and ensure server + client can import without duplicate string literals.
2. **Schema + API:** Migration + model; validate `ui_slot` on write; extend serializers so admin and batch loads include `ui_slot`.
3. **Admin:** Dropdown options from `ANNOTATION_UI_SLOT_REGISTRY`; persist `ui_slot` per shape; map existing shapes to slots per phase seed rules.
4. **Transformer:** Attach resolved annotation payloads onto instances the wizard already consumes; keep types explicit and avoid silent empty fallbacks where the guide requires logging for missing configuration.
5. **Composable + UI:** `useAnnotationContent` reads by slot + user-type dimension; cards consume description/tooltip; `AvailabilityStep` tries `gridOverlay` then settings fallback.
6. **Verify:** `cd client && npm run lint`, server build, manual smoke: admin saves `ui_slot`, wizard shows copy from annotations where configured.

## Checkpoint
- [ ] `annotationSlots.ts` + registry consumed by admin and server validation
- [ ] `ui_slot` column migrated; existing shapes seeded/mapped per phase guide
- [ ] Transformer + composable + cards + grid overlay behave per success criteria in `phase-6.12-guide.md`
- [ ] Client lint and app start clean; no new tests (deferred)

## How we build the tierDown to achieve them

- **Task 6.12.2.1:** Shared slots constant, `ui_slot` schema, server validation, admin dropdown and legacy shape mapping
- **Task 6.12.2.2:** `globalToBookingTransformer`, `useAnnotationContent`, SelectionCard/IndependentSelectCard, AvailabilityStep grid overlay fallback
- **Task 6.12.2.3 (retro):** Annotation assignment flat edges, `assignmentUserTypeFilter`, `contentRows` resolution in wizard; see `sessions/task-6.12.2.3-planning.md`

## Session log (technical backfill)

Full retro reference (slots + assignments): `sessions/session-6.12.2-log.md`

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.12-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.12.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
