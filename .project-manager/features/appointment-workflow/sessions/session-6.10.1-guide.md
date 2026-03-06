# Session 6.10.1 Guide: Add New Block Shapes Button on Admin Shapes Tab

**Phase:** 6.10 — Fee Preview & Coupon Visibility  
**Session:** 6.10.1 — Add New Block Shapes Button  
**Status:** Not Started  
**Branch:** TBD (e.g. `appointment-workflow-phase-6.10-session-6.10.1`)

---

## Phase intent (goals and context)

# Phase 6.10 Guide: Fee Preview & Coupon Visibility

**Purpose:** Phase-level guide for the fee preview bar on the Availability step and admin-controlled visibility of the apply-coupon UI in the wizard, plus restoring the add new block shapes button on the admin Shapes tab.

**Tier:** Phase (Tier 1 - High-Level)

---

## Session intent from phase guide

- [ ] ### Session 6.10.1: Add New Block Shapes Button on Admin Shapes Tab
**Description:** Restore the add new block shapes button on the admin Shapes tab (it used to exist and is no longer there). If the original can't be recovered, adapt the same add-new button pattern used on the other shapes sub-tabs. Ensure create flow and API work end-to-end.
**See:** `sessions/session-6.10.1-guide.md`

---

## Session Overview

We used to have an "Add new block shape" button on the admin Shapes tab; it is no longer there. This session restores it so admins can create new block shapes from the UI again. If the original implementation can't be recovered, adapt the same add-new button pattern already used on the other shapes sub-tabs (Part Shapes, Annotation Shapes, Event Shapes). Implementation must follow existing patterns (useShapesTab / useShapesTabCreation, entity config, API) and governance.

---

## Key Context

- **ShapesTab.vue** — Admin tab with sub-tabs for Block Shapes, Part Shapes, Annotation Shapes, Event Shapes. Part/Annotation/Event have "Create" flows; the Block Shapes sub-tab used to have an equivalent add-new button but it's missing. Restore it or mirror the same add-new button and flow used on the other sub-tabs.
- **useShapesTab.ts**, **useShapesTabCreation.ts** — Add or restore createBlockShape and handleBlockShapeCreated following the same pattern as Part/Annotation/Event.
- **Entity/API:** Block shapes use the same entity CRUD pattern; ensure create endpoint and payload (name, type, ref or equivalent) are available.
- **Coupons block shape:** Task 6.10.1.4 wires the Apply Coupon UI on step 5 to a block shape named "Coupons" using the same **block-shape-filtered instances** strategy as property block instances on step 2 (see phase 6.10 guide). Admins create the "Coupons" shape and its block instances in the Block Shapes tab; step 5 shows those instances in a dropdown.

---

## Task blocks (Goal, Files, Approach, Checkpoint)

- [ ] #### Task 6.10.1.1: Restore "Add new block shape" entry point

**Goal:** Restore the add-new block shape action on the Block Shapes sub-tab. If the original can't be restored, add a button or "New block shape" card that matches the same pattern as the other sub-tabs ("Create Part Shape", "Create Annotation Shape", "Create Event Shape").

**Files:**
- `client/src/views/admin/tabs/ShapesTab.vue` — In the Block Shapes section, restore or add the entry point that triggers the create flow (same UX as the other shapes sub-tabs).
- `client/src/composables/admin/useShapesTab.ts` and/or `useShapesTabCreation.ts` — Restore or add createBlockShape and handleBlockShapeCreated; wire to block shape entity create mutation and list refresh.

**Approach:** Mirror the Part/Annotation/Event creation pattern; ensure new block shape gets required fields (name, type/ref per entity config).

**Checkpoint:** Add-new entry point visible in Block Shapes tab; clicking it starts the create flow (modal or inline).

---

- [ ] #### Task 6.10.1.2: Block shape create flow and API

**Goal:** Create flow collects required fields, calls API, and refreshes the list; new block shape appears in the tab.

**Files:**
- `client/src/composables/admin/useShapesTabCreation.ts` — Implement createBlockShape and handleBlockShapeCreated. Use block shape entity composable create mutation; set initial values per entity config. On success, clear form and collapse/close create UI; invalidate or refetch block shapes list.
- Entity config and API — Confirm block shapes have a create endpoint and payload shape; add or extend types if needed.

**Checkpoint:** Submitting the create form creates a block shape via API; list updates and shows the new shape.

---

- [ ] #### Task 6.10.1.3: Governance and polish

**Goal:** Follow component/composable governance (thin component, logic in composable); no new Tier1 hotspots; explicit return types; lint and app start pass.

**Files:**
- ShapesTab.vue — Keep template thin; delegate all create logic to useShapesTab/useShapesTabCreation.
- useShapesTabCreation.ts (and useShapesTab if extended) — Explicit return types; flat contract; action-based mutation.

**Checkpoint:** Lint passes; app starts; no new component-logic or composable-health regressions.

---

- [ ] #### Task 6.10.1.4: Apply Coupon dropdown — coupon blockShape blockInstances on step 5

**Goal:** On wizard step 5 (Confirmation), at the "Apply coupon" UI, show a filtered list of coupon blockShape blockInstances in a dropdown. Use the same logic as property block instances on step 2: identify the block shape (for Coupons, by name "Coupons"), then filter `bookingData.blockInstances` by `blockShapeRef`; expose the list to the step and render with a select/dropdown (e.g. WizardSelect like Property Type on PropertyDetailsStep).

**Files:**
- `client/src/utils/blockInstanceUtils.ts` — Add `getBlockShapeIdByName(bookingData, name)` (or equivalent) to resolve the "Coupons" block shape by name; use it to derive coupon block instances (filter instances where `blockShapeRef === shapeId` and `active`).
- Wizard/booking composable (e.g. `useWizardFilteredOptions` or the composable that provides wizard state to Confirmation step) — Expose `availableCouponBlocks` (computed list of block instances for the Coupons shape), same pattern as `availablePropertyTypeBlocks` for step 2.
- `client/src/components/booking/steps/ConfirmationStep.vue` — In the Apply coupon area (Coupon Discount row), add a dropdown/select bound to `availableCouponBlocks`; use WizardSelect with `item-title="name"`, `item-value="id"` like PropertyDetailsSection. Optionally bind selected coupon to wizard state for discount application in a later task.

**Approach:** Mirror step 2 property-type flow: property types come from `cascadeShapePipeline` / `getBlockShapeIdByType(bookingData, BLOCK_SHAPE_TYPES.PROPERTY)` and are shown in PropertyDetailsSection via WizardSelect. For coupons, use name-based lookup (Coupons shape has type `user`), then filter instances; no cascade—just shape-filtered list. Keep Confirmation step thin; put filtering in a composable.

**Checkpoint:** Step 5 "Apply coupon" area shows a dropdown listing coupon block instances (from the "Coupons" block shape); list is empty if no Coupons shape or no instances. Selection can be wired to discount/state in a later task.

---

## Success Criteria

- [ ] "Add new block shape" (or equivalent) entry point exists on the admin Shapes tab (Block Shapes section).
- [ ] Create flow collects required fields, calls API, and refreshes the list; new block shape appears.
- [ ] Implementation follows existing Shapes tab patterns and governance.
- [ ] Step 5 (Confirmation) "Apply coupon" area shows a dropdown of coupon blockShape blockInstances (same pattern as property types on step 2).
- [ ] Lint passes; app starts.

---

## Related Documents

- Phase 6.10 guide: `phases/phase-6.10-guide.md`
- Session 6.10.2: `session-6.10.2-guide.md` (admin toggle and settings)
- Session 6.10.3: `session-6.10.3-guide.md` (fee bar and popover)
- useShapesTab.ts, useShapesTabCreation.ts — creation patterns for Part/Annotation/Event shapes
