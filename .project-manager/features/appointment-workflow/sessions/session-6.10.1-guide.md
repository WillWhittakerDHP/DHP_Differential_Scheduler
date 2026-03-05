# Session 6.10.1 Guide: Add New Block Shapes Button on Admin Shapes Tab

**Phase:** 6.10 — Fee Preview & Coupon Visibility  
**Session:** 6.10.1 — Add New Block Shapes Button  
**Status:** Not Started  
**Branch:** TBD (e.g. `appointment-workflow-phase-6.10-session-6.10.1`)

---

## Session Overview

We used to have an "Add new block shape" button on the admin Shapes tab; it is no longer there. This session restores it so admins can create new block shapes from the UI again. If the original implementation can’t be recovered, adapt the same add-new button pattern already used on the other shapes sub-tabs (Part Shapes, Annotation Shapes, Event Shapes) — same UX and flow shape, wired for block shapes. Implementation must follow existing patterns (useShapesTab / useShapesTabCreation, entity config, API) and governance.

---

## Key Context

- **ShapesTab.vue** — Admin tab with sub-tabs for Block Shapes, Part Shapes, Annotation Shapes, Event Shapes. Part/Annotation/Event have "Create" flows (e.g. "Create Part Shape", "Create Annotation Shape", "Create Event Shape"); the Block Shapes sub-tab used to have an equivalent add-new button but it’s missing now. Restore it; if needed, mirror the same add-new button and flow used on the other sub-tabs.
- **useShapesTab.ts** — Orchestrates state, modals, tab labels, entity config. useShapesTabCreation.ts already provides createPartShape, handleAnnotationShapeCreate, handleEventShapeCreate; add or restore createBlockShape and handleBlockShapeCreated following the same pattern.
- **Entity/API:** Block shapes use the same entity CRUD pattern as other shapes (blockShapes composable, create mutation). Ensure types, API route, and payload support creating a block shape with required fields (e.g. name, type, ref).

---

## Tasks

### Task 6.10.1.1: Restore "Add new block shape" entry point

**Goal:** Restore the add-new block shape action on the Block Shapes sub-tab. If the original can’t be restored, add a button or "New block shape" card that matches the same pattern as the other sub-tabs ("Create Part Shape", "Create Annotation Shape", "Create Event Shape").

**Files:**
- `client/src/views/admin/tabs/ShapesTab.vue` — In the Block Shapes section, restore or add the entry point that triggers the create flow (same UX as the other shapes sub-tabs: button or inline card that opens create modal or expands inline form).
- `client/src/composables/admin/useShapesTab.ts` and/or `useShapesTabCreation.ts` — Restore or add createBlockShape and handleBlockShapeCreated, mirroring the Part/Annotation/Event creation pattern; wire to block shape entity create mutation and list refresh. Ensure new block shape gets required fields (name, type/ref per entity config).

**Checkpoint:** Add-new entry point visible in Block Shapes tab; clicking it starts the create flow (modal or inline), same as the other sub-tabs.

---

### Task 6.10.1.2: Block shape create flow and API

**Goal:** Create flow collects required fields, calls API, and refreshes the list; new block shape appears in the tab.

**Files:**
- `client/src/composables/admin/useShapesTabCreation.ts` — Implement createBlockShape and handleBlockShapeCreated (or equivalent names). Use block shape entity composable create mutation; set initial values per entity config (e.g. id placeholder, name, type). On success, clear form and collapse/close create UI; invalidate or refetch block shapes list.
- Entity config and API — Confirm block shapes have a create endpoint and payload shape; add or extend types if needed so the client can send a valid create payload (name, type, ref, or whatever the server requires).

**Checkpoint:** Submitting the create form creates a block shape via API; list updates and shows the new shape.

---

### Task 6.10.1.3: Governance and polish

**Goal:** Follow component/composable governance (thin component, logic in composable); no new Tier1 hotspots; explicit return types; lint and app start pass.

**Files:**
- ShapesTab.vue — Keep template thin; delegate all create logic to useShapesTab/useShapesTabCreation.
- useShapesTabCreation.ts (and useShapesTab if extended) — Explicit return types; flat contract; action-based mutation (createBlockShape, handleBlockShapeCreated).

**Checkpoint:** Lint passes; app starts; no new component-logic or composable-health regressions.

---

## Success Criteria

- [ ] "Add new block shape" (or equivalent) entry point exists on the admin Shapes tab (Block Shapes section).
- [ ] Create flow collects required fields, calls API, and refreshes the list; new block shape appears.
- [ ] Implementation follows existing Shapes tab patterns and governance.
- [ ] Lint passes; app starts.

---

## Related Documents

- Phase 6.10 guide: `phases/phase-6.10-guide.md`
- Session 6.10.2: `session-6.10.2-guide.md` (admin toggle and settings)
- Session 6.10.3: `session-6.10.3-guide.md` (fee bar and popover)
- useShapesTab.ts, useShapesTabCreation.ts — creation patterns for Part/Annotation/Event shapes
