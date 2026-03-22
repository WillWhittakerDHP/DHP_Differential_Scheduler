# Plan: task 6.12.2.2 — Wizard annotation pipeline (transformer, composable, cards, grid overlay)

## Contract
- **Tier:** task | **ID:** 6.12.2.2
- **Scope:** Extend booking wizard data and UI to consume annotation shapes tagged with `uiSlot` (`cardDescription`, `cardTooltip`, `gridOverlay`): transformer output, `useAnnotationContent`, `SelectionCard` / `IndependentSelectCard`, and `AvailabilityStep` overlay with settings fallback.
- **Governance:** Thin components; composable owns resolution logic; explicit types; log or surface gaps per project rules (no silent misconfiguration).

## Work Profile
- **Execution intent:** implement
- **Action type:** cross_cutting
- **Scope shape:** cross_cutting
- **Governance domains:** function, composable, component, type
- **Recommended context pack:** local_implementation_pack
- **Planning artifact action:** update
- **Decomposition mode:** moderate
- **Downstream advice:** Planning doc is advisory; guide owns current-tier decomposition. Inherit intent, constraints, and governance emphasis; avoid pre-specifying child execution detail unless decomposition mode is explicit.

## Where we left off
Task **6.12.2.1** complete: `shared/constants/annotationSlots.ts`, `annotation_shapes.ui_slot` migration/model, server validation, admin dropdown. TierUp: `sessions/session-6.12.2-planning.md`. Optional: `sessions/task-6.12.2.1-handoff.md`.

## Goal
Wire the **booking wizard** to **read** annotation copy by **UI slot** and **selected user type**, using **`annotation_instance_content`** (and shape `uiSlot`) as the server/API already exposes after 6.12.1 / 6.12.2.1. Deliver: (1) extend **`globalToBookingTransformer`** so each **`BookingBlockInstance`** (and event-shape path if the wizard needs it) carries a **structured annotation payload** the UI can query by slot; (2) add **`useAnnotationContent`** to resolve **text/tooltip** for `cardDescription` / `cardTooltip` / `gridOverlay` given current user-type selection; (3) update **`SelectionCard.vue`** and **`IndependentSelectCard.vue`** to show description/tooltip from the composable when configured; (4) update **`AvailabilityStep.vue`** so the grid overlay label prefers **`gridOverlay`** slot content, else falls back to **`differentialPerspectives.differentialGraphDefaultLabel`** (or equivalent settings key in code). **Out of scope:** new migrations, admin `ui_slot` UI, new test files (project policy); re-doing 6.12.2.1 server/constants work.

## Files
- **Intent:** `.project-manager/features/appointment-workflow/phases/phase-6.12-guide.md`, `sessions/session-6.12.2-guide.md`
- **Types / transformer:** `client/src/utils/transformers/globalToBookingTransformer.ts`; booking/wizard types that describe block instances (e.g. `client/src/types/booking/` or adjacent — locate current `BookingBlockInstance` / step props)
- **New composable:** `client/src/composables/booking/useAnnotationContent.ts` (or `client/src/composables/booking/` sibling to existing booking composables)
- **UI:** `client/src/components/booking/SelectionCard.vue`, `client/src/components/booking/IndependentSelectCard.vue`, `client/src/components/booking/steps/AvailabilityStep.vue`
- **Shared slots (read-only):** `shared/constants/annotationSlots.ts` — `AnnotationUiSlot`, `isAnnotationUiSlot`, registry labels if needed for dev-only logging
- **Governance:** `client/.audit-reports/*`, `.project-manager/*_AUTHORING_PLAYBOOK.md`

## Approach
1. **Types first:** Define a small **annotation-on-instance** shape on the transformed booking model (e.g. list of `{ uiSlot, contentsByUserTypeBlockInstanceId }` or map keyed by slot — match how relationship/batch data already exposes `annotation_instance_content`).
2. **Transformer:** In `globalToBookingTransformer`, **attach** that structure when building each block instance from global entities; preserve existing fields; avoid deep nesting in the transformer — delegate grouping/mapping to a **named helper** if branching grows.
3. **`useAnnotationContent`:** Input: current **block instance** (or annotation blob) + **selected user type block instance id** (nullable → generic row). Output: **computed** `getText(slot)`, `getTooltip` if applicable, or `{ description, tooltip }` for card slots; use **`AnnotationUiSlot`** literals and `isAnnotationUiSlot` only at boundaries.
4. **Cards:** `SelectionCard` / `IndependentSelectCard` — inject or call composable with parent-supplied instance + selection; bind **description** / **tooltip** (or subtitle slots) from resolved strings; keep templates thin.
5. **AvailabilityStep:** Resolve **`gridOverlay`** string via composable or a one-line helper; **if empty**, use existing settings fallback property already used for the differential graph label.
6. **Verify:** `cd client && npm run lint`, `npm run type-check`; manual smoke: shape with `uiSlot` + content rows shows in wizard; fallback path unchanged when no annotation.

## Design before execute (pseudocode)
- `buildAnnotationUiPayload(globalRow, relationships)` → `AnnotationUiPayload | undefined`
- `globalToBookingTransformer`: `block.annotations = buildAnnotationUiPayload(...)` (exact property name aligned with existing booking types)
- `useAnnotationContent(payload, selectedUserTypeId)`:
  - `resolveRow(slot)` → find shape with `uiSlot === slot`, pick content row matching `userTypeBlockInstanceId` or null
  - return `{ textFor(slot), tooltipFor(slot) }` or getters
- `SelectionCard`: `const { cardDescription, cardTooltip } = useAnnotationContent(...)` → pass to existing text props/slots

## Checkpoint
- [ ] Transformed booking instances include annotation-by-slot data the wizard can consume without extra round-trips.
- [ ] `useAnnotationContent` resolves copy per user type with generic-row fallback consistent with server relationship logic.
- [ ] Cards show `cardDescription` / `cardTooltip` when configured; no layout regression when absent.
- [ ] `AvailabilityStep` grid overlay: annotation `gridOverlay` first, then settings fallback.
- [ ] Client lint and type-check clean; no new tests (deferred).

## How we build the tierDown to achieve them
- **Phase 6.12:** Annotation and event-shape UX + data model alignment
- **Session 6.12.2:** Annotation UI slots registry and wizard pipeline
- **Task 6.12.2.1:** Shared slots constant, `ui_slot` schema, server validation, admin dropdown and legacy mapping
- **Task 6.12.2.2:** `globalToBookingTransformer`, `useAnnotationContent`, SelectionCard / IndependentSelectCard, AvailabilityStep grid overlay fallback

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.12.2-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.12.2.1-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
