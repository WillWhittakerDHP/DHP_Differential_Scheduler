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
**Status:** Not Started

### Tasks

- [ ] #### Task 6.5.3.1: Dev load-mode buttons (Load as Reschedule / Load as Quote)
**Goal:** Enable manual testing of reschedule and quote flows from the dev load button, so all three wizard modes are testable without client-facing entry points.
**Files:**
- `client/src/composables/booking/useWizardAppointmentManagement.ts`
- `client/src/components/booking/BookingWizard.vue`
**Approach:** Add `modeOverride?: WizardMode` parameter to `handleLoadAppointment`. When provided, use it instead of the current `'random'`-vs-ID branching for mode and localStorage persistence. Replace the single "Load Random Appointment" VBtn with a VMenu (dev-only, `v-if="isDevMode"`) offering: Load Random (mode `'new'`), Load as Reschedule (mode `'reschedule'`, persists ID so submit uses update path), Load as Quote (mode `'quote'`). Update the composable return type if needed.
**Checkpoint:** Clicking "Load as Reschedule" loads a random appointment with wizard mode `'reschedule'`, persists `loadedAppointmentId`, and lands at Availability step. Clicking "Load as Quote" loads with mode `'quote'`. "Load Random" behaves as before.

- [ ] #### Task 6.5.3.2: Reschedule mode theme (ocean blue + amber palette)
**Goal:** Give the wizard a distinct visual identity when in reschedule mode, mirroring the quote-mode theming pattern. Extra 20% desaturation vs quote mode for a calmer feel.
**Files:**
- `client/src/plugins/5.vuetify/theme.ts` — add `rescheduleModeColors` and `inactiveColors.reschedule`
- `client/src/components/booking/BookingWizard.scss` — add `--reschedule-mode-*` CSS vars and `.reschedule-mode-active` override block
- `client/src/composables/useThemeMode.ts` — expand watcher from two states (new/quote) to three (new/quote/reschedule)
- `client/src/components/booking/BookingWizard.vue` — add `'reschedule-mode-active': isRescheduleMode` to root VCard and stepper-header `:class`
**Color spec (11 slots):**
| Slot | Value | Note |
|------|-------|------|
| primary | `#5B9BD5` | Muted ocean blue |
| primary-darken-1 | `#4A86BC` | Darker ocean |
| secondary | `#D4943D` | Muted amber |
| secondary-darken-1 | `#BC8236` | Darker amber |
| warning | `#D4636F` | Muted red |
| warning-darken-1 | `#BC5763` | Darker muted red |
| on-primary | `#fff` | White text on ocean |
| on-secondary | `#fff` | White text on amber |
| on-warning | `#fff` | White text on red |
| inactive-primary | `#DEEBF7` | 80% white + 20% ocean |
| inactive-secondary | `#F6EAD8` | 80% white + 20% amber |
**Approach:** Mirror the quote-mode pattern exactly: (1) define `rescheduleModeColors` object in theme.ts alongside `quoteModeColors`; add `inactiveColors.reschedule`. (2) Add `--reschedule-mode-*` CSS custom properties in BookingWizard.scss; add `.reschedule-mode-active` block that overrides `--v-theme-*` and `--inactive-*`, including `:deep(*)` cascade. Add `.booking-wizard.reschedule-mode-active &` header styling. (3) Expand `useThemeMode` to watch wizard mode (not just isQuoteMode): apply rescheduleModeColors when reschedule, quoteModeColors when quote, remove overrides when new. (4) Add class binding in BookingWizard.vue.
**Checkpoint:** Wizard in reschedule mode shows ocean blue stepper avatars, amber secondary buttons, muted red warning. Switching to quote shows green/orange-brown. Switching to new shows default purple/orange.

- [ ] #### Task 6.5.3.3: Compute original-inspection slot and pass to grid
**Goal:** Compute which slot is the original inspection (matches loaded appointment's time when rescheduling) and pass its buttonIndex to AppointmentSlotGrid.
**Files:**
- `client/src/composables/booking/useAvailabilityOrchestrator.ts`
- `client/src/components/booking/steps/AvailabilityStep.vue`
- `client/src/utils/booking/timeSlotMatching.ts` (reuse if needed)
**Approach:** When wizardMode === 'reschedule' and loadedWizardState has candidateDate + candidateTimeSlots, and selectedDate matches, find slot whose startTime matches loaded first slot; expose originalInspectionButtonIndex. Pass it to AppointmentSlotGrid.
**Checkpoint:** Orchestrator exposes originalInspectionButtonIndex; AvailabilityStep passes it to grid.

- [ ] #### Task 6.5.3.4: Add original-inspection class and styles
**Goal:** Apply `appointment-slot-btn--original-inspection` class and distinct styling to the original slot; keep it selectable.
**Files:**
- `client/src/components/booking/AppointmentSlotGrid.vue`
- `client/src/components/booking/AppointmentSlotGrid.scss`
**Approach:** Add prop originalInspectionButtonIndex; add class when slotData.buttonIndex matches. Add SCSS for distinct visual (border/background tint); do not change :disabled.
**Checkpoint:** Original slot shows distinct styling; slot remains clickable.

- [ ] #### Task 6.5.3.5: Verify end-to-end (dev buttons, reschedule theme, original-inspection UI)
**Goal:** Verify all three additions work together; no regression for new/quote flows.
**Files:**
- Same as 6.5.3.1–6.5.3.4; manual verification
**Approach:** Use "Load as Reschedule" dev button: confirm ocean blue theme activates, go to Availability, select same date; confirm original slot is visually distinct and selectable. Use "Load Random" and "Load as Quote" to confirm correct themes and no original-inspection styling in those flows.
**Checkpoint:** Reschedule: ocean theme + original slot distinct and selectable. Quote: green theme, no original-inspection. New: default purple theme, no original-inspection.

---

## Notes

[Session-specific notes and decisions]
