## Phase intent from feature guide

### Phase 6.5: Rescheduling Flow (Not Started)
- **Wizard mode:** Single source of truth for flow type: `initial` (new booking), `quote` (new quote), `reschedule` (editing existing). Drives themes, submit button label (“Submit” | “Send quote” | “Update appointment”), submit action (create vs update), and availability params (e.g. `reschedulingAppointmentId`). User role (post–Feature 7) is a separate axis: admin vs non-admin drives visibility of “Hold Slot,” “Override constraints,” “Force schedule,” etc.
- **Same flow as quote and dev load:** Appointment loads at step 3 (Availability); user adjusts and saves/holds quote or books/reschedules. No new wizard steps; reuse `handleLoadAppointment` and update path.
- **Bypass current appointment as constraint:** Add `reschedulingAppointmentId` to computed-availability request. Server excludes that appointment’s calendar event (and its drive buffers) from the overlap list used in slot computation, while still returning it in `calendarEvents` so it stays visible on the calendar.
- **Original-inspection slot UI:** Pass the loaded appointment’s time range into the slot grid; mark slots that match/overlap the original time; style with a distinct class (e.g. `appointment-slot-btn--original-inspection`) or overlay so the current time is visible but still selectable.
- **See:** `features/appointment-workflow/phases/phase-6.5-guide.md` for sessions, implementation details, and relation to Phase 6.8 (allowedExceptions).

- [ ] ### Session 6.5.1: Entry/transitions — wizard mode, load-at-step-3, admin entry

**Description:** ** Entry/transitions — wizard mode, load-at-step-3, admin entry

**Tasks:**
1. Run session-start for each session in order (6.5.1 → 6.5.2 → 6.5.3 → 6.5.4).
2. After each session-end, cascade to next session or phase-end.
3. Follow governance (audits, thin components, composables).

- [x] ### Session 6.5.2: Availability bypass — reschedulingAppointmentId in request

**Description:** ** Availability bypass — reschedulingAppointmentId in request

**Tasks:**
1. Run session-start for each session in order (6.5.1 → 6.5.2 → 6.5.3 → 6.5.4).
2. After each session-end, cascade to next session or phase-end.
3. Follow governance (audits, thin components, composables).

- [x] ### Session 6.5.3: Original-inspection slot UI — distinct styling, selectable

**Description:** ** Original-inspection slot UI — distinct styling, selectable

**Tasks:**
1. Run session-start for each session in order (6.5.1 → 6.5.2 → 6.5.3 → 6.5.4).
2. After each session-end, cascade to next session or phase-end.
3. Follow governance (audits, thin components, composables).

- [x] ### Session 6.5.4: Client-facing entry — reschedule/quote/cancel links

**Description:** ** Client-facing entry — reschedule/quote/cancel links

**Tasks:**
1. Run session-start for each session in order (6.5.1 → 6.5.2 → 6.5.3 → 6.5.4).
2. After each session-end, cascade to next session or phase-end.
3. Follow governance (audits, thin components, composables).

<!-- end excerpt phase -->