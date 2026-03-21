# Plan: phase 6.12 — 6.12

## Contract
- **Tier:** phase | **ID:** 6.12
- **Scope:** 6.12
- **Governance:** 2 governance highlights — read reports before filling slots

## Work Profile
- **Execution intent:** plan
- **Action type:** decomposition
- **Scope shape:** architectural
- **Governance domains:** docs
- **Recommended context pack:** decomposition_pack
- **Planning artifact action:** create
- **Decomposition mode:** light
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Phase 6.11 completed with sessions: 6.11.1.

## Goal
Deliver **Phase 6.12 — Annotation Content Layer and Entity Enhancements**: (1) event-shape toggles for reschedule/cancel links in invites, plus block-shapes tab entity cards that expand reliably; (2) relational annotation content per user-type block instance (`annotation_instance_content`), migration off deprecated `AnnotationInstance.userType` / WithMetadata-style paths, and **409** (not 500) on annotation shape delete when instances depend on the shape; (3) shared `ANNOTATION_UI_SLOTS` / registry, `annotation_shapes.ui_slot`, admin validation and dropdown; (4) wizard pipeline — transformer attaches annotations to `BookingBlockInstance`, `useAnnotationContent` resolves by slot, SelectionCard/IndependentSelectCard and grid overlay consume slots with sensible fallbacks. **Done** when phase guide success criteria are met and client lint + app start pass.

## Files
- **TierUp:** `.project-manager/features/appointment-workflow/phases/phase-6.12-guide.md`, `feature-appointment-workflow-guide.md`
- **Prior handoff:** `.project-manager/features/appointment-workflow/phases/phase-6.11-handoff.md`
- **Event shape & invites:** `server/src/db/models/booking/event_shape.ts`, `server/src/services/invites/inviteContextBuilder.ts`; client field config / metadata for event shape
- **Block shapes admin:** shape list / entity card components (e.g. ShapeCardList, EntityCard, expansion panels under admin shapes)
- **Annotations DB & API:** `annotation_instances`, `annotation_assignments`, annotation shape CRUD routes; new migration for `annotation_instance_content`
- **Shared constants:** new `shared/constants/annotationSlots.ts` (mirror pattern of `shared/constants/templateVariables.ts`)
- **Wizard:** `client/src/utils/transformers/globalToBookingTransformer.ts`, new `useAnnotationContent` composable; `SelectionCard` / `IndependentSelectCard`; `AvailabilityStep.vue` grid overlay + availability/differential settings fallback
- **Governance:** `client/.audit-reports/*`, playbooks under `.project-manager/*_AUTHORING_PLAYBOOK.md`

## Approach
1. **Session 6.12.1:** Schema and server first — event shape columns + model sync; invite builder reads toggles; fix block-shapes expansion bug; add `annotation_instance_content` with migration from existing rows; simplify assignment model and deprecate `userType`; annotation shape DELETE → 409 with clear message when FK blocks delete.
2. **Session 6.12.2:** Add `annotationSlots` constant + registry; `annotation_shapes.ui_slot` + server validation; seed/map existing shapes to slots; admin UI dropdown from registry; extend transformer and composable; wire cards and grid overlay with fallback to current settings text.
3. Follow **Vue-only** frontend rule, **explicit types** and **no silent fallbacks** per project standards; keep components thin and composables testable.

## Checkpoint
After **6.12.1:** DB migrations apply; toggles persist; invites respect them; block cards expand; content table populated; delete returns 409 when appropriate; smoke admin + one invite path. After **6.12.2:** slots constant wired both sides; wizard shows annotation-driven copy where configured; grid overlay prefers `gridOverlay` slot; `cd client && npm run lint` and `npm run start:dev` (or project equivalent) clean.

## How we build the tierDown to achieve them
- **Session 6.12.1:** Entity enhancements and annotation data layer
- **Session 6.12.2:** Annotation UI slots registry and wizard pipeline
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/feature-appointment-workflow-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/phases/phase-6.11-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
