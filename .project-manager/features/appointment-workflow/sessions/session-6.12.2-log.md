# Session 6.12.2: Annotation UI slots, wizard pipeline, and assignment edges

## Session status

**Status:** Complete (retro-documented)  
**Phase:** 6.12  
**Last updated:** 2026-03-21

---

## Completed tasks

### Task 6.12.2.1: Annotation UI slots constant, `ui_slot` column, validation, admin

**Goal:** `shared/constants/annotationSlots.ts`, `annotation_shapes.ui_slot`, server validation, legacy shape mapping, admin dropdown.  
**Planning:** `sessions/task-6.12.2.1-planning.md`

### Task 6.12.2.2: Booking transformer, `useAnnotationContent`, wizard cards and grid overlay

**Goal:** `globalToBookingTransformer` / booking payload, `useAnnotationContent`, SelectionCard / IndependentSelectCard, `AvailabilityStep` grid overlay fallbacks.  
**Planning:** `sessions/task-6.12.2.2-planning.md`

### Task 6.12.2.3: Annotation assignment edges, user-type filter, content rows in wizard

**Goal:** Flat `annotationAssignmentEdges` on `GlobalData`, `buildBookingBlockAnnotationUi` candidates with `assignmentUserTypeFilter`, `resolveAnnotationTextForAssignment`; admin `AnnotationContentEditor` + `EntityCard` metadata for per-user copy; relationship fetch normalization overlaps **session 6.12.8** for `FetchedRelationship.userTypeBlockInstanceId` scoping.  
**Planning:** `sessions/task-6.12.2.3-planning.md`

---

## Test status

Tests deferred per project policy (`TEST_ENABLED` / Phase 3.0). Manual: admin `ui_slot`, wizard slot copy, user-type selection + assignment rows.

---

## Technical reference (backfill)

### A. Annotation UI slots — purpose and source of truth

How the booking wizard surfaces annotation copy: which **slot** on the UI a given annotation shape fills, and how text is resolved when multiple assignments exist.

**Source of truth**

- **Registry:** `shared/constants/annotationSlots.ts` — `ANNOTATION_UI_SLOTS`, `AnnotationUiSlot`, validation helpers.
- **Shape config:** `annotation_shapes.ui_slot` (nullable). Invalid values rejected on write (server normalization).
- **Legacy mapping:** Migrations / seed rules map older shape kinds to registry values where applicable.

**Data flow**

1. Admin sets `ui_slot` on an annotation shape.
2. Global hydrate loads shapes + instances + `annotationAssignments`.
3. `buildBookingBlockAnnotationUi` (per block instance) produces **candidates** with `uiSlot`, `orderIndex`, `text`, `contentRows`, and `assignmentUserTypeFilter` (see section B).
4. Wizard uses `useAnnotationContent` → `resolveBookingAnnotationSlotText(slot, selectedUserTypeBlockInstanceId)` for slots such as `cardDescription`, `cardTooltip`, `gridOverlay`.

**Resolution order**

- Filter candidates by matching `uiSlot`.
- Apply user-type assignment filter (`assignmentUserTypeFilter` null or equals selected user-type block instance id).
- Tie-break by `orderIndex` (**higher** wins: `reduce` prefers `a` when `a.orderIndex >= b.orderIndex` in `resolveBookingAnnotationSlotText`).
- Resolve body text via `resolveAnnotationTextForAssignment` (legacy `text` vs `contentRows`).

**Fallbacks**

- Missing slot on shape: candidate omitted (no wizard copy from that assignment for slot-based UI).
- Grid overlay: may fall back to availability settings / differential graph label (see `phase-6.12-guide.md` and `AvailabilityStep`).

**Code references:** `buildBookingBlockAnnotationUi.ts`, `resolveBookingAnnotationSlotText.ts`, `useAnnotationContent.ts`, `annotationShapeUiSlot.ts` (server).

**Open maintenance**

- [ ] List all wizard touchpoints that call `textForSlot` vs hardcoded copy.

### B. Annotation assignments, user-type scope, content rows

How block instances link to annotation instances for booking and admin; **user-type** scoping on the assignment row; **per–user-type text** on the instance.

| Concept | Storage | Notes |
|--------|---------|--------|
| Assignment | `annotation_assignments` | `block_instance_id`, `annotation_id` (instance), optional `user_type_block_instance_id`, `order_index` |
| Per–user-type copy | `annotation_instance_content` / `contentRows` on instance API | Rows keyed by `userTypeBlockInstanceId` (null = generic) |

**Straight relationship vs extra columns**

- Primary relationship: **block instance → annotation instance**.
- `user_type_block_instance_id` on the assignment is **metadata** (“this link applies when the selected user-type block instance matches”), or `null` for all user types — not a second parent/child graph.

**Client normalization**

- Batch relationships → `FetchedRelationship`; **`userTypeBlockInstanceId`** populated **only** for `annotationAssignments` (see session **6.12.8** — avoids `attendeeAssignments` child-id collision).
- `buildAnnotationAssignmentEdges` → `AnnotationAssignmentEdge[]` on `GlobalData`.

**Booking pipeline**

- `buildBookingBlockAnnotationUi` sets `assignmentUserTypeFilter` from `edge.userTypeBlockInstanceId`.
- `resolveBookingAnnotationSlotText` filters by slot + filter + order; then `resolveAnnotationTextForAssignment` picks `contentRows` or legacy `text`.

**Admin**

- `AnnotationContentEditor` + `EntityCard` metadata patterns for per-user copy vs generic `text`.

**Code references:** `annotation_assignment.ts` (server model), `fetchToGlobalTransformer.ts`, `globalData.ts` (`AnnotationAssignmentEdge`), `resolveAnnotationTextForAssignment.ts`.

<!-- end excerpt session -->
