# Session 6.10.5 Guide: Wizard Sub-Tab and Consolidated Wizard Settings

**Phase:** 6.10 — Fee Preview & Coupon Visibility  
**Session:** 6.10.5 — Wizard sub-tab and consolidated settings  
**Status:** Complete  
**Branch:** TBD

**Depends on:** Session 6.10.2 (admin toggle and settings); Session 6.10.3 (fee bar and popover). Wizard settings exist in Holds and Grid; this session consolidates them.

---

## Quick Start

**Session 6.10.5** adds a Wizard sub-tab to Business Controls → Calendar and consolidates all wizard-specific settings there. It also introduces a **`useWizardSettings`** composable (or equivalent) to replace scattered handlers like `handleShowApplyCouponInWizard` with a single, reusable pattern for wizard settings. Run `/session-start 6.10.5` to plan tasks; then cascade to task-start.

---

## Session Workflow

Use `/session-start 6.10.5` to load context and plan tasks. Work tasks in order; run `/task-end <taskId>` after each. After the last task, run `/session-end 6.10.5`.

---

## Session Overview

Add a Wizard sub-tab to Business Controls → Calendar (alongside Integration, Holds, Places, Grid). Move all wizard-specific settings from scattered locations (Holds, Grid, etc.) into the new Wizard tab. Move the brand colors toggle to the Wizard tab. Introduce a **consolidated composable** (`useWizardSettings` or similar) so that wizard settings are accessed and mutated through a single pattern instead of individual handlers like `handleShowApplyCouponInWizard`.

---

## Key Context: useWizardSettings Pattern

**Current state:** Wizard settings are scattered:
- `showApplyCouponInWizard` — in `useCalendarHoldFormState`, `AppointmentConfirmationPanel` (Holds tab), with `handleShowApplyCouponInWizard` and inline emit handlers
- Differential sub-step labels — in `GridConfigPanel` (Grid tab)
- Brand colors toggle — elsewhere (to be moved)

**Proposed pattern:** Create `useWizardSettings` (or equivalent) that:
- Exposes all wizard settings as a flat, typed contract (read-only `ComputedRef` for wizard consumers; writable for Admin panel)
- Replaces individual handlers (`handleShowApplyCouponInWizard`, etc.) with a single composable
- Is used by both Admin WizardConfigPanel and wizard components (AvailabilityStep, ConfirmationStep) for reading settings
- Follows composable governance: explicit return types, action-based mutation (`setShowApplyCouponInWizard`, etc.), no `Ref | ComputedRef` unions at boundaries

**Why:** Reduces duplication, centralizes wizard settings logic, and makes it easier to add new wizard settings in the future.

---

## Tasks

- [x] #### Task 6.10.5.1: Create useWizardSettings composable
**Goal:** Create a composable that consolidates wizard settings access; replace scattered handlers with this pattern.
**Files:** `client/src/composables/admin/useWizardSettings.ts` (or `client/src/composables/booking/useWizardSettings.ts` if wizard-facing); types in `client/src/configs/availabilitySettings/types.ts`.
**Approach:** Extract `showApplyCouponInWizard` (and other wizard settings) into a single composable; expose read path for wizard steps and write path for Admin panel; wire to existing form state / availability settings API.
**Checkpoint:** Composable exists; `handleShowApplyCouponInWizard` and similar handlers replaced with composable usage.

- [x] #### Task 6.10.5.2: Add Wizard sub-tab and WizardConfigPanel
**Goal:** Add Wizard sub-tab to BusinessControlsCalendarSection; create WizardConfigPanel component.
**Files:** `client/src/views/admin/tabs/BusinessControlsCalendarSection.vue`; `client/src/views/admin/tabs/components/WizardConfigPanel.vue`; `client/src/configs/businessControlsTabStrings.ts`.
**Approach:** Add VTab and VWindowItem for "Wizard"; create WizardConfigPanel that uses useWizardSettings; move showApplyCouponInWizard from AppointmentConfirmationPanel to WizardConfigPanel.
**Checkpoint:** Wizard tab visible; showApplyCouponInWizard toggle works from Wizard tab.

- [x] #### Task 6.10.5.3: Move differential sub-step labels and brand colors to Wizard tab
**Goal:** Move differential sub-step labels from GridConfigPanel and brand colors toggle to WizardConfigPanel.
**Files:** `client/src/views/admin/tabs/components/GridConfigPanel.vue`; `client/src/views/admin/tabs/components/WizardConfigPanel.vue`; form state / differential state.
**Approach:** Remove differential sub-step labels from Grid; add to WizardConfigPanel; locate and move brand colors toggle.
**Checkpoint:** All wizard-specific settings live in Wizard tab; Grid tab no longer contains wizard labels.

---

## Success Criteria

- [x] Wizard sub-tab exists in Business Controls → Calendar.
- [x] `useWizardSettings` composable consolidates wizard settings; no scattered handlers.
- [x] showApplyCouponInWizard, differential sub-step labels, brand colors toggle all in Wizard tab.
- [x] Wizard steps (AvailabilityStep, ConfirmationStep) read settings via useWizardSettings or equivalent.
- [x] Lint and app start pass.

---

## Related Documents

- Phase 6.10 guide: `phases/phase-6.10-guide.md`
- Session 6.10.2: `session-6.10.2-guide.md` (admin toggle)
- Session 6.10.3: `session-6.10.3-guide.md` (fee bar and popover)
- COMPOSABLE_AUTHORING_PLAYBOOK.md (composable governance)
- useCalendarHoldFormState.ts, AppointmentConfirmationPanel.vue, GridConfigPanel.vue (current locations)
