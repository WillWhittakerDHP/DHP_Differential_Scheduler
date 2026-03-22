# Phase 6.12 Guide: Annotation Content Layer and Entity Enhancements

**Purpose:** Phase-level guide for entity enhancements (event shape link toggles, block shapes expansion fix), annotation data layer (annotation_instance_content table, deprecate WithMetadata), annotation shape delete FK handling, and the annotation UI slots registry with wizard pipeline so annotations drive selection cards and grid overlay.

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 6.12  
**Phase Name:** Annotation Content Layer and Entity Enhancements  
**Description:** (1) **Entity enhancements:** Add `includeRescheduleLink` and `includeCancelLink` booleans to event shape (DB, model, client types, field config, metadata; invite builder reads them). Fix block shapes tab entity cards not expanding when clicked. (2) **Annotation data layer:** Create `annotation_instance_content` table (annotation_instance_id, user_type_block_instance_id FK, text, tooltip); dimensions are dynamic (user type block instances). Deprecate `AnnotationInstance.userType` and simplify `AnnotationAssignment`; migrate existing data. Handle annotation shape delete FK constraint — return 409 with actionable message instead of 500. (3) **Annotation UI slots and wizard pipeline:** Add shared constant `ANNOTATION_UI_SLOTS` and `ANNOTATION_UI_SLOT_REGISTRY`; add `ui_slot` column to annotation_shapes; extend transformer and add `useAnnotationContent` composable; wire annotations into SelectionCard/IndependentSelectCard and migrate grid overlay text to annotation slot.

**Duration:** 8 sessions (6.12.1–6.12.8)  
**Status:** Complete

---

## Context: What Already Exists

**Event shapes:** `server/src/db/models/booking/event_shape.ts`; invite builder in `server/src/services/invites/inviteContextBuilder.ts` resolves `{rescheduleLink}` and `{cancelLink}`.  
**Block shapes tab:** ShapeCardList, EntityCard, expansion panels in client admin.  
**Annotations:** `annotation_instances` (text, type FK to annotation_shapes, deprecated userType), `annotation_assignments` (block_instance_id, annotation_id, user_type_block_instance_id).  
**Wizard:** `globalToBookingTransformer` builds `BookingBlockInstance`; `SelectionCard` / `IndependentSelectCard` have optional description/tooltip via config; `getFilteredServiceDescription` currently returns empty string. Grid overlay in `AvailabilityStep.vue` uses `differentialPerspectives.differentialGraphDefaultLabel` from availability settings.

---

## Phase Objectives

- **Event shape:** `includeRescheduleLink` and `includeCancelLink` booleans (default true); admin toggles; invite builder respects them.
- **Block shapes tab:** Entity cards expand when clicked.
- **Annotations:** `annotation_instance_content` table; content per user type block instance; deprecate WithMetadata pattern; annotation shape delete returns 409 when dependents exist.
- **UI slots:** `shared/constants/annotationSlots.ts` with `ANNOTATION_UI_SLOTS` and `ANNOTATION_UI_SLOT_REGISTRY`; `annotation_shapes.ui_slot` column; server validates against registry; admin dropdown from registry.
- **Wizard pipeline:** Transformer populates annotations on `BookingBlockInstance`; `useAnnotationContent` resolves by slot and selected user type; cards render cardDescription and cardTooltip; grid overlay can use `gridOverlay` annotation slot with fallback to business settings.

---

## Tasks

Sessions and tasks for this phase. See Sessions Breakdown below; per-session task lists live in `sessions/session-6.12.*-guide.md`.

---

## Sessions Breakdown

- [x] ### Session 6.12.1: Entity enhancements and annotation data layer

**Description:** Event shape — add `includeRescheduleLink` and `includeCancelLink` booleans (DB column, model, client type, field config, metadata, invite builder). Block shapes tab — fix entity card expansion. Annotations — create `annotation_instance_content` table (annotation_instance_id, user_type_block_instance_id FK, text, tooltip); dimensions dynamic (user type block instances); deprecate `AnnotationInstance.userType` and simplify `AnnotationAssignment`; migrate existing data. Annotation shape delete — handle FK `annotation_instances_type_fkey`; return 409 with actionable message instead of 500.

**See:** `sessions/session-6.12.1-guide.md` (create via `/phase-start 6.12` or `/session-start 6.12.1`)

- [x] ### Session 6.12.2: Annotation UI slots registry and wizard pipeline

**Description:** Create `shared/constants/annotationSlots.ts` with `ANNOTATION_UI_SLOTS` enum, `AnnotationUiSlot` type, and `ANNOTATION_UI_SLOT_REGISTRY` (see Reference below). Add `ui_slot` column (VARCHAR(50), nullable) to `annotation_shapes`; server validates against shared constant; seed existing shapes (Description → cardDescription, Tooltip → cardTooltip, validation_message → validationMessage); admin dropdown from registry. Wizard transformer pipeline: extend `globalToBookingTransformer` to populate annotations on `BookingBlockInstance`; create `useAnnotationContent` composable (resolves text by slot + selected user type); wire into `SelectionCard` / `IndependentSelectCard` for cardDescription and cardTooltip. Grid overlay migration: move `differentialPerspectives.differentialGraphDefaultLabel` to `gridOverlay` annotation slot on event shapes; `AvailabilityStep.vue` reads from annotation when available, falls back to business settings. Includes assignment edges / content rows (**task 6.12.2.3**).

**See:** `sessions/session-6.12.2-guide.md`

- [x] ### Session 6.12.3: Admin metadata — panels and `render_as`

**Description:** `fieldLocationDispatcher`, `collectionFieldKeys`, `computeRenderAs`, migrations syncing `admin_metadata` so `valid*` relationship fields use multiselect and Events panel routing.

**See:** `sessions/session-6.12.3-guide.md`

- [x] ### Session 6.12.4: Events — block-level ownership

**Description:** `valid_events` parent → block shapes; `event_assignments` on block instance parents; booking and invite code paths updated.

**See:** `sessions/session-6.12.4-guide.md`

- [x] ### Session 6.12.5: Differential event roles

**Description:** Block instance `differentialEventRoleOverrides`, admin matrix over active event shapes.

**See:** `sessions/session-6.12.5-guide.md`

- [x] ### Session 6.12.6: Event instance admin and template preview

**Description:** Event instance admin UI, internal preview endpoint, template variable utilities.

**See:** `sessions/session-6.12.6-guide.md`

- [x] ### Session 6.12.7: Booking and scheduling refinements

**Description:** Booking pipeline alignment with block-owned events, annotation UI, differential overrides.

**See:** `sessions/session-6.12.7-guide.md`

- [x] ### Session 6.12.8: Relationship fetch normalization

**Description:** `FetchedRelationship` / `userTypeBlockInstanceId` scoped to annotation assignments only.

**See:** `sessions/session-6.12.8-guide.md`

---

## Reference: Annotation UI slots constant and registry

Single source for client (wizard components, admin dropdown) and server (validation). When set on an annotation shape, `ui_slot` tells the wizard where to render that shape's content. Implement in `shared/constants/annotationSlots.ts`; pattern follows `shared/constants/templateVariables.ts`.

```ts
export const ANNOTATION_UI_SLOTS = {
  CARD_DESCRIPTION: 'cardDescription',
  CARD_TOOLTIP: 'cardTooltip',
  CARD_COLOR_LABEL: 'cardColorLabel',
  SECTION_HEADER: 'sectionHeader',
  GRID_OVERLAY: 'gridOverlay',
  CONFIRMATION_NOTE: 'confirmationNote',
  VALIDATION_MESSAGE: 'validationMessage',
} as const

export type AnnotationUiSlot = typeof ANNOTATION_UI_SLOTS[keyof typeof ANNOTATION_UI_SLOTS]

export const ANNOTATION_UI_SLOT_REGISTRY = [
  { slot: ANNOTATION_UI_SLOTS.CARD_DESCRIPTION, label: 'Card Description', description: 'Subtitle text below the item name in selection cards', renderTarget: 'SelectionCard', attachesTo: ['blockInstance'] },
  { slot: ANNOTATION_UI_SLOTS.CARD_TOOLTIP, label: 'Card Tooltip', description: 'Hover tooltip or info icon on selection cards', renderTarget: 'SelectionCard', attachesTo: ['blockInstance'] },
  { slot: ANNOTATION_UI_SLOTS.CARD_COLOR_LABEL, label: 'Color Label', description: 'Colored badge/chip on selection cards', renderTarget: 'SelectionCard', attachesTo: ['blockInstance'] },
  { slot: ANNOTATION_UI_SLOTS.SECTION_HEADER, label: 'Section Header', description: 'Introductory text above a selection card group', renderTarget: 'SelectionCardGroup', attachesTo: ['blockShape'] },
  { slot: ANNOTATION_UI_SLOTS.GRID_OVERLAY, label: 'Grid Overlay', description: 'Overlay text on the appointment slot grid', renderTarget: 'AvailabilityStep', attachesTo: ['eventShape'] },
  { slot: ANNOTATION_UI_SLOTS.CONFIRMATION_NOTE, label: 'Confirmation Note', description: 'Note text shown on the confirmation step', renderTarget: 'ConfirmationStep', attachesTo: ['blockInstance', 'eventShape'] },
  { slot: ANNOTATION_UI_SLOTS.VALIDATION_MESSAGE, label: 'Validation Message', description: 'Error/warning message for business rule violations', renderTarget: 'BusinessRule', attachesTo: ['blockInstance'] },
] as const
```

---

## Dependencies

**Prerequisites:** Phase 6.5 (reschedule/cancel links exist to be toggled). No other blockers.

**Downstream Impact:** Annotations become the content layer for wizard UI; admin can assign shapes to registered UI slots; grid overlay and selection card copy can be driven by annotations.

---

## Success Criteria

- [ ] Event shape and event instance show includeRescheduleLink and includeCancelLink toggles; invite builder respects them.
- [ ] Block shapes tab entity cards expand when clicked.
- [ ] annotation_instance_content table exists; content per user type block instance; migration preserves behavior; annotation shape delete returns 409 when dependents exist.
- [ ] shared/constants/annotationSlots.ts exists with ANNOTATION_UI_SLOTS and ANNOTATION_UI_SLOT_REGISTRY; annotation_shapes.ui_slot column; admin dropdown from registry.
- [ ] Wizard transformer populates annotations; useAnnotationContent composable; SelectionCard/IndependentSelectCard show cardDescription and cardTooltip from annotations; grid overlay can use gridOverlay slot with fallback to settings.
- [ ] Lint and app start pass.

---

## Related Documents

- **Phase log (session + task doc index):** `phases/phase-6.12-log.md` — includes retrospective sessions **6.12.2–6.12.8** with links to `sessions/session-6.12.*-log.md` and task planning files.
- PROJECT_PLAN.md — Feature 6 Phase 6.12
- feature-appointment-workflow-guide.md — Phase 6.12 summary
- phases/phase-6.5-guide.md — Rescheduling flow (prerequisite for link toggles)

<!-- end excerpt phase -->