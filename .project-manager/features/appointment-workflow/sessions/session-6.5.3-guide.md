# Session 6.5.3 Guide: Original-Inspection UI

**Purpose:** Session-level guide for original inspection slot visually distinct but still selectable.

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

### Session Overview

**Session ID:** 6.5.3
**Session Name:** Original-Inspection UI
**Description:** Original inspection slot visually distinct (e.g. `appointment-slot-btn--original-inspection`) but still selectable.

**Duration:** [Estimated]
**Status:** In Progress

### Tasks

- [x] - [x] #### Task 6.5.3.1: Compute original-inspection slot and pass to grid

**Goal:** Make the original inspection slot (the slot that matches the loaded appointment's current time when rescheduling) visually distinct (e.g. `appointment-slot-btn--original-inspection`) while keeping it selectable. User can see which slot is their current appointment and may keep it or pick another.

**Files:**
- `client/src/composables/booking/useWizardAppointmentManagement.ts` — add `modeOverride?: WizardMode` parameter to `handleLoadAppointment`
- `client/src/components/booking/BookingWizard.vue` — replace single dev load button with VMenu offering Load Random / Load as Reschedule / Load as Quote; add `reschedule-mode-active` class binding
- `client/src/plugins/5.vuetify/theme.ts` — add `rescheduleModeColors` export and `inactiveColors.reschedule`
- `client/src/components/booking/BookingWizard.scss` — add `--reschedule-mode-*` CSS vars and `.reschedule-mode-active` override block
- `client/src/composables/useThemeMode.ts` — expand watcher to handle new/quote/reschedule (three states)
- `client/src/components/booking/AppointmentSlotGrid.vue` — add `appointment-slot-btn--original-inspection` class when slot is the original
- `client/src/components/booking/AppointmentSlotGrid.scss` — add styles for `--original-inspection` (distinct color/overlay)
- `client/src/composables/booking/useAvailabilityOrchestrator.ts` — compute `originalInspectionButtonIndex` when reschedule mode + loaded state + date match
- `client/src/components/booking/steps/AvailabilityStep.vue` — pass `originalInspectionButtonIndex` to AppointmentSlotGrid
- `client/src/utils/booking/timeSlotMatching.ts` — reuse or extend for slot-to-loaded-time comparison (if needed)

**Approach:** 1. **Dev load-mode buttons:** Add `modeOverride?: WizardMode` parameter to `handleLoadAppointment` in `useWizardAppointmentManagement.ts`. When provided, use `modeOverride` instead of the current `'random'` vs non-`'random'` branching for mode and persistence. Replace the single "Load Random Appointment" VBtn in BookingWizard.vue with a VMenu (dev-only) offering three items: Load Random (mode `'new'`), Load as Reschedule (mode `'reschedule'`, persists ID), Load as Quote (mode `'quote'`).
2. **Reschedule mode theme:** Add `rescheduleModeColors` to `theme.ts` and `inactiveColors.reschedule`. Muted ocean blue + amber palette (extra 20% desaturation vs quote mode approach). Add `--reschedule-mode-*` CSS vars in BookingWizard.scss with `.reschedule-mode-active` override block mirroring `.quote-mode-active`. Expand `useThemeMode` to handle three mode states. Add `'reschedule-mode-active': isRescheduleMode` to BookingWizard.vue class bindings. Color spec:
   - primary: `#5B9BD5` (muted ocean blue), darken: `#4A86BC`
   - secondary: `#D4943D` (muted amber), darken: `#BC8236`
   - warning: `#D4636F` (muted red), darken: `#BC5763`
   - on-primary/secondary/warning: `#fff`
   - inactive-primary: `#DEEBF7` (80% white + 20% ocean), inactive-secondary: `#F6EAD8` (80% white + 20% amber)
3. **Compute original-inspection slot:** In orchestrator, when `wizardMode === 'reschedule'` and `loadedWizardState` has availability data, and `selectedDate` matches `loadedWizardState.availability.candidateDate.start`, find the slot whose `startTime` matches `loadedWizardState.availability.candidateTimeSlots[0].time` (first/inspector slot). Use existing `timeSlotMatching` or normalize both for comparison. Return `buttonIndex` or `null`.
4. **Pass to grid:** Add `originalInspectionButtonIndex?: number | null` prop to AppointmentSlotGrid; AvailabilityStep passes it from orchestrator.
5. **Apply class:** In AppointmentSlotGrid, add `'appointment-slot-btn--original-inspection': slotData.buttonIndex === originalInspectionButtonIndex` to the button's `:class`.
6. **Style:** Add `.appointment-slot-btn--original-inspection` in AppointmentSlotGrid.scss — distinct but not disabled (e.g. different border/background tint, optional "Current" label). Slot remains selectable (`:disabled` unchanged).
7. **Governance:** Keep components thin; matching logic in composable or util. Follow component/composable playbooks.

**Checkpoint:**
- Dev buttons: "Load as Reschedule" loads random appointment with mode `'reschedule'`, persists ID, lands at Availability step. "Load as Quote" loads with mode `'quote'`. "Load Random" behaves as before (mode `'new'`).
- Reschedule theme: wizard in reschedule mode shows muted ocean blue/amber palette (stepper, buttons, slots all reflect theme). Switching modes restores correct palette. No regression for new/quote themes.
- Original-inspection: load appointment for reschedule, go to Availability step, select same date as appointment; the slot matching the current appointment time shows distinct styling (e.g. `appointment-slot-btn--original-inspection`).
- Slot is still clickable and selectable; selecting it keeps the same time.
- No regression for new-booking or quote flows (no original-inspection styling).- [ ] #### Task 6.5.3.2: Add original-inspection class and styles

**Goal:** Make the original inspection slot (the slot that matches the loaded appointment's current time when rescheduling) visually distinct (e.g. `appointment-slot-btn--original-inspection`) while keeping it selectable. User can see which slot is their current appointment and may keep it or pick another.

**Files:**
- `client/src/composables/booking/useWizardAppointmentManagement.ts` — add `modeOverride?: WizardMode` parameter to `handleLoadAppointment`
- `client/src/components/booking/BookingWizard.vue` — replace single dev load button with VMenu offering Load Random / Load as Reschedule / Load as Quote; add `reschedule-mode-active` class binding
- `client/src/plugins/5.vuetify/theme.ts` — add `rescheduleModeColors` export and `inactiveColors.reschedule`
- `client/src/components/booking/BookingWizard.scss` — add `--reschedule-mode-*` CSS vars and `.reschedule-mode-active` override block
- `client/src/composables/useThemeMode.ts` — expand watcher to handle new/quote/reschedule (three states)
- `client/src/components/booking/AppointmentSlotGrid.vue` — add `appointment-slot-btn--original-inspection` class when slot is the original
- `client/src/components/booking/AppointmentSlotGrid.scss` — add styles for `--original-inspection` (distinct color/overlay)
- `client/src/composables/booking/useAvailabilityOrchestrator.ts` — compute `originalInspectionButtonIndex` when reschedule mode + loaded state + date match
- `client/src/components/booking/steps/AvailabilityStep.vue` — pass `originalInspectionButtonIndex` to AppointmentSlotGrid
- `client/src/utils/booking/timeSlotMatching.ts` — reuse or extend for slot-to-loaded-time comparison (if needed)

**Approach:** 1. **Dev load-mode buttons:** Add `modeOverride?: WizardMode` parameter to `handleLoadAppointment` in `useWizardAppointmentManagement.ts`. When provided, use `modeOverride` instead of the current `'random'` vs non-`'random'` branching for mode and persistence. Replace the single "Load Random Appointment" VBtn in BookingWizard.vue with a VMenu (dev-only) offering three items: Load Random (mode `'new'`), Load as Reschedule (mode `'reschedule'`, persists ID), Load as Quote (mode `'quote'`).
2. **Reschedule mode theme:** Add `rescheduleModeColors` to `theme.ts` and `inactiveColors.reschedule`. Muted ocean blue + amber palette (extra 20% desaturation vs quote mode approach). Add `--reschedule-mode-*` CSS vars in BookingWizard.scss with `.reschedule-mode-active` override block mirroring `.quote-mode-active`. Expand `useThemeMode` to handle three mode states. Add `'reschedule-mode-active': isRescheduleMode` to BookingWizard.vue class bindings. Color spec:
   - primary: `#5B9BD5` (muted ocean blue), darken: `#4A86BC`
   - secondary: `#D4943D` (muted amber), darken: `#BC8236`
   - warning: `#D4636F` (muted red), darken: `#BC5763`
   - on-primary/secondary/warning: `#fff`
   - inactive-primary: `#DEEBF7` (80% white + 20% ocean), inactive-secondary: `#F6EAD8` (80% white + 20% amber)
3. **Compute original-inspection slot:** In orchestrator, when `wizardMode === 'reschedule'` and `loadedWizardState` has availability data, and `selectedDate` matches `loadedWizardState.availability.candidateDate.start`, find the slot whose `startTime` matches `loadedWizardState.availability.candidateTimeSlots[0].time` (first/inspector slot). Use existing `timeSlotMatching` or normalize both for comparison. Return `buttonIndex` or `null`.
4. **Pass to grid:** Add `originalInspectionButtonIndex?: number | null` prop to AppointmentSlotGrid; AvailabilityStep passes it from orchestrator.
5. **Apply class:** In AppointmentSlotGrid, add `'appointment-slot-btn--original-inspection': slotData.buttonIndex === originalInspectionButtonIndex` to the button's `:class`.
6. **Style:** Add `.appointment-slot-btn--original-inspection` in AppointmentSlotGrid.scss — distinct but not disabled (e.g. different border/background tint, optional "Current" label). Slot remains selectable (`:disabled` unchanged).
7. **Governance:** Keep components thin; matching logic in composable or util. Follow component/composable playbooks.

**Checkpoint:**
- Dev buttons: "Load as Reschedule" loads random appointment with mode `'reschedule'`, persists ID, lands at Availability step. "Load as Quote" loads with mode `'quote'`. "Load Random" behaves as before (mode `'new'`).
- Reschedule theme: wizard in reschedule mode shows muted ocean blue/amber palette (stepper, buttons, slots all reflect theme). Switching modes restores correct palette. No regression for new/quote themes.
- Original-inspection: load appointment for reschedule, go to Availability step, select same date as appointment; the slot matching the current appointment time shows distinct styling (e.g. `appointment-slot-btn--original-inspection`).
- Slot is still clickable and selectable; selecting it keeps the same time.
- No regression for new-booking or quote flows (no original-inspection styling).- [ ] #### Task 6.5.3.3: Verify end-to-end original-inspection UI

**Goal:** Make the original inspection slot (the slot that matches the loaded appointment's current time when rescheduling) visually distinct (e.g. `appointment-slot-btn--original-inspection`) while keeping it selectable. User can see which slot is their current appointment and may keep it or pick another.

**Files:**
- `client/src/composables/booking/useWizardAppointmentManagement.ts` — add `modeOverride?: WizardMode` parameter to `handleLoadAppointment`
- `client/src/components/booking/BookingWizard.vue` — replace single dev load button with VMenu offering Load Random / Load as Reschedule / Load as Quote; add `reschedule-mode-active` class binding
- `client/src/plugins/5.vuetify/theme.ts` — add `rescheduleModeColors` export and `inactiveColors.reschedule`
- `client/src/components/booking/BookingWizard.scss` — add `--reschedule-mode-*` CSS vars and `.reschedule-mode-active` override block
- `client/src/composables/useThemeMode.ts` — expand watcher to handle new/quote/reschedule (three states)
- `client/src/components/booking/AppointmentSlotGrid.vue` — add `appointment-slot-btn--original-inspection` class when slot is the original
- `client/src/components/booking/AppointmentSlotGrid.scss` — add styles for `--original-inspection` (distinct color/overlay)
- `client/src/composables/booking/useAvailabilityOrchestrator.ts` — compute `originalInspectionButtonIndex` when reschedule mode + loaded state + date match
- `client/src/components/booking/steps/AvailabilityStep.vue` — pass `originalInspectionButtonIndex` to AppointmentSlotGrid
- `client/src/utils/booking/timeSlotMatching.ts` — reuse or extend for slot-to-loaded-time comparison (if needed)

**Approach:** 1. **Dev load-mode buttons:** Add `modeOverride?: WizardMode` parameter to `handleLoadAppointment` in `useWizardAppointmentManagement.ts`. When provided, use `modeOverride` instead of the current `'random'` vs non-`'random'` branching for mode and persistence. Replace the single "Load Random Appointment" VBtn in BookingWizard.vue with a VMenu (dev-only) offering three items: Load Random (mode `'new'`), Load as Reschedule (mode `'reschedule'`, persists ID), Load as Quote (mode `'quote'`).
2. **Reschedule mode theme:** Add `rescheduleModeColors` to `theme.ts` and `inactiveColors.reschedule`. Muted ocean blue + amber palette (extra 20% desaturation vs quote mode approach). Add `--reschedule-mode-*` CSS vars in BookingWizard.scss with `.reschedule-mode-active` override block mirroring `.quote-mode-active`. Expand `useThemeMode` to handle three mode states. Add `'reschedule-mode-active': isRescheduleMode` to BookingWizard.vue class bindings. Color spec:
   - primary: `#5B9BD5` (muted ocean blue), darken: `#4A86BC`
   - secondary: `#D4943D` (muted amber), darken: `#BC8236`
   - warning: `#D4636F` (muted red), darken: `#BC5763`
   - on-primary/secondary/warning: `#fff`
   - inactive-primary: `#DEEBF7` (80% white + 20% ocean), inactive-secondary: `#F6EAD8` (80% white + 20% amber)
3. **Compute original-inspection slot:** In orchestrator, when `wizardMode === 'reschedule'` and `loadedWizardState` has availability data, and `selectedDate` matches `loadedWizardState.availability.candidateDate.start`, find the slot whose `startTime` matches `loadedWizardState.availability.candidateTimeSlots[0].time` (first/inspector slot). Use existing `timeSlotMatching` or normalize both for comparison. Return `buttonIndex` or `null`.
4. **Pass to grid:** Add `originalInspectionButtonIndex?: number | null` prop to AppointmentSlotGrid; AvailabilityStep passes it from orchestrator.
5. **Apply class:** In AppointmentSlotGrid, add `'appointment-slot-btn--original-inspection': slotData.buttonIndex === originalInspectionButtonIndex` to the button's `:class`.
6. **Style:** Add `.appointment-slot-btn--original-inspection` in AppointmentSlotGrid.scss — distinct but not disabled (e.g. different border/background tint, optional "Current" label). Slot remains selectable (`:disabled` unchanged).
7. **Governance:** Keep components thin; matching logic in composable or util. Follow component/composable playbooks.

**Checkpoint:**
- Dev buttons: "Load as Reschedule" loads random appointment with mode `'reschedule'`, persists ID, lands at Availability step. "Load as Quote" loads with mode `'quote'`. "Load Random" behaves as before (mode `'new'`).
- Reschedule theme: wizard in reschedule mode shows muted ocean blue/amber palette (stepper, buttons, slots all reflect theme). Switching modes restores correct palette. No regression for new/quote themes.
- Original-inspection: load appointment for reschedule, go to Availability step, select same date as appointment; the slot matching the current appointment time shows distinct styling (e.g. `appointment-slot-btn--original-inspection`).
- Slot is still clickable and selectable; selecting it keeps the same time.
- No regression for new-booking or quote flows (no original-inspection styling).## Notes

[Session-specific notes and decisions]
