# Plan: session 6.10.1 — Add New Block Shapes Button on Admin Shapes Tab

## Contract
- **Tier:** session | **ID:** 6.10.1
- **Scope:** Add New Block Shapes Button on Admin Shapes Tab
- **Governance:** 4 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this session. Block Shapes sub-tab used to have an add-new button; it is missing. Part/Annotation/Event sub-tabs have working add-new flows to mirror.

## Goal
Restore the add new block shapes button on the admin Shapes tab so admins can create block shapes from the UI, and on wizard step 5 (Confirmation) show a filtered list of coupon blockShape blockInstances at the "Apply coupon" UI (same logic as property block instances on step 2). Deliver via four tasks: entry point, create flow + API, governance and polish, then Apply Coupon dropdown on step 5.

## Files
- `client/src/views/admin/tabs/ShapesTab.vue` — Block Shapes section: restore or add entry point (button/card) for create flow.
- `client/src/composables/admin/useShapesTab.ts`, `useShapesTabCreation.ts` — Add createBlockShape, handleBlockShapeCreated; wire to block shape entity create mutation and list refresh.
- Block shape entity config and API — ensure create endpoint and payload (name, type, ref or equivalent) are available.

## Approach
- Task 6.10.1.1: Restore or add "Add new block shape" entry point in ShapesTab and composables; same UX as Part/Annotation/Event.
- Task 6.10.1.2: Implement create flow (form/modal, API call, list refresh); confirm entity/API support.
- Task 6.10.1.3: Keep component thin, composable with explicit return types and flat contract; run lint and app start.
- Task 6.10.1.4: On step 5, at Apply coupon, show dropdown of coupon blockShape blockInstances; use same logic as property block instances on step 2 (getBlockShapeIdByName('Coupons'), filter instances, expose availableCouponBlocks, WizardSelect).

## Checkpoint
- After 6.10.1.1: Entry point visible; clicking it starts create flow.
- After 6.10.1.2: Submitting create adds a block shape; list updates.
- After 6.10.1.3: Lint and app start pass; no new governance regressions.
- After 6.10.1.4: Step 5 Apply coupon area shows dropdown of coupon block instances.

## How we build the tierDown to achieve them
- **Task 6.10.1.1:** Restore "Add new block shape" entry point
- **Task 6.10.1.2:** Block shape create flow and API
- **Task 6.10.1.3:** Governance and polish
- **Task 6.10.1.4:** Apply Coupon dropdown — coupon blockShape blockInstances on step 5
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.10-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
