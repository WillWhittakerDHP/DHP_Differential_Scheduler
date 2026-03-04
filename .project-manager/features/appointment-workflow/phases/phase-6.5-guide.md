## Phase intent from feature guide

### Phase 6.5: Rescheduling Flow (Not Started)
- **Wizard mode:** Single source of truth for flow type: `initial` (new booking), `quote` (new quote), `reschedule` (editing existing). Drives themes, submit button label (“Submit” | “Send quote” | “Update appointment”), submit action (create vs update), and availability params (e.g. `reschedulingAppointmentId`). User role (post–Feature 7) is a separate axis: admin vs non-admin drives visibility of “Hold Slot,” “Override constraints,” “Force schedule,” etc.
- **Same flow as quote and dev load:** Appointment loads at step 3 (Availability); user adjusts and saves/holds quote or books/reschedules. No new wizard steps; reuse `handleLoadAppointment` and update path.
- **Bypass current appointment as constraint:** Add `reschedulingAppointmentId` to computed-availability request. Server excludes that appointment’s calendar event (and its drive buffers) from the overlap list used in slot computation, while still returning it in `calendarEvents` so it stays visible on the calendar.
- **Original-inspection slot UI:** Pass the loaded appointment’s time range into the slot grid; mark slots that match/overlap the original time; style with a distinct class (e.g. `appointment-slot-btn--original-inspection`) or overlay so the current time is visible but still selectable.
- **See:** `features/appointment-workflow/phases/phase-6.5-guide.md` for sessions, implementation details, and relation to Phase 6.8 (allowedExceptions).

- [ ] ### Session 6.5.1: Entry/transitions — wizard mode, load-at-step-3, admin entry

**Goal:** Ensure status `rescheduling` and transitions; expose Reschedule action; wizard mode and load-at-step-3; admin entry (Start new | Edit quote | Reschedule).
**Files:** Wizard composables, admin entry components, status/transition logic.
**Approach:** Add reschedule mode; wire Reschedule action to load appointment at step 3; admin dropdown for Edit quote / Reschedule.
**Checkpoint:** Reschedule flow loads at step 3; submit shows "Update appointment"; admin entry works.

- [x] ### Session 6.5.2: Availability bypass — reschedulingAppointmentId in request

**Goal:** Add reschedulingAppointmentId to computed-availability request; server excludes that appointment's event from overlap while keeping it in calendarEvents.
**Files:** Client availability composable, server computedAvailabilityService.
**Approach:** Pass reschedulingAppointmentId when reschedule mode; server omits from overlap, includes in calendarEvents.
**Checkpoint:** Reschedule flow: current appointment does not block slots; calendar still shows it.

- [ ] ### Session 6.5.3: Original-inspection slot UI — distinct styling, selectable

**Goal:** Original inspection slot visually distinct (e.g. `appointment-slot-btn--original-inspection`) but still selectable.
**Files:** AppointmentSlotGrid.vue, AppointmentSlotGrid.scss, useAvailabilityOrchestrator.ts, AvailabilityStep.vue.
**Approach:** Compute originalInspectionButtonIndex when reschedule + loaded state + date match; pass to grid; add class and styles.
**Checkpoint:** Reschedule: original slot distinct and selectable; new/quote unchanged.

- [ ] ### Session 6.5.4: Client-facing entry — reschedule/quote/cancel links

**Goal:** URL scheme for reschedule, quote, cancel; "Copy quote link" button; optional `{rescheduleLink}` and `{cancelLink}` in invite template.
**Files:** Router, BookingWizardView, cancel route, URL utility, invite template resolver.
**Approach:** Route accepts mode + appointmentId; wizard entry from query; cancel flow; quote-link button; template variables.
**Checkpoint:** All links work; quote link copyable; invite variables resolve.
