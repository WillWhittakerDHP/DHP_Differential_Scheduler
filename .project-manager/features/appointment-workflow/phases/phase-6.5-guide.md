## Phase intent from feature guide

Phase 6.5: Rescheduling Flow
**Description:** Reschedule confirmed appointments using the same flow as quote and dev-mode load: appointment loads at step 3 (Availability); user adjusts and reschedules. The current appointment stays on the calendar but is temporarily excluded from availability constraints so its time and drive buffers do not block slots; the original inspection slot has a distinct UI indicator (e.g. different color or overlay).
**Sessions:** 3–4 (6.5.1 entry/transitions, 6.5.2 availability bypass, 6.5.3 original-inspection UI, 6.5.4 client-facing links)
**Dependencies:** Phase 6.3 (transition guards: confirmed → rescheduling → submitted)
**Success Criteria:**
- Reschedule action available for confirmed appointments; wizard reuses load-at-step-3 and update path (same as quote/dev load)
- `reschedulingAppointmentId` in computed-availability request; server excludes that appointment’s calendar event from overlap while keeping it in calendarEvents
- Original-inspection slot visually distinct (e.g. `appointment-slot-btn--original-inspection`) but still selectable
- Wizard mode set to `reschedule` when loading for reschedule; submit shows “Update appointment” and calls update path
- Admin entry: step 0 or pre-wizard (admin-only) — Start new | Edit quote | Reschedule; dropdown of non-completed inspections when Edit quote or Reschedule; selection sets wizard mode and loadedAppointmentId
- Client-facing entry (6.5.4): URL scheme for reschedule/quote/cancel links (mode + appointmentId); router reads params; "Copy quote link" button for staff to send quote URL manually; optional invite template variables only {rescheduleLink}, {cancelLink} for calendar/confirmation email
- Status transitions: confirmed → rescheduling → submitted
**See:** `phases/phase-6.5-guide.md` for implementation details, session breakdown, and relation to Phase 6.8 (allowedExceptions)

- [ ] ### Phase 6.6: Soft Delete vs Hard Delete
**Description:** Policy and UI for cancelled vs deleted; retention rules; audit trail.
**Sessions:** To be planned
**Success Criteria:**
- Clear policy for cancelled vs deleted appointments
- Admin UI for soft delete and hard delete actions
- Retention and audit behavior documented

- [ ] ### Phase 6.7: Scheduled By Auto-Population
**Description:** Set `scheduled_by_id` from logged-in user on appointment creation.
**Sessions:** To be planned
**Dependencies:** Feature 7 (Authentication) — requires `req.user`
**Success Criteria:**
- `scheduled_by_id` populated from authenticated user on create
- Displayed in admin appointment details

- [ ] ### Phase 6.8: Admin Force-Create & Constraint Overrides
**Description:** Force-create appointments bypassing blockers; `constraint_overrides` table; reschedule with exceptions.
**Sessions:** 4 (6.8.1–6.8.4)
**Dependencies:** Feature 7 (Authentication) — requires `req.user` for `authorized_by_id`
**Success Criteria:**
- Force-create route creates appointment + override record
- Admin UI shows blocked slots with force-create option
- Reschedule flow respects override exceptions
- Override constraints and Force schedule visibility gated by **user role** (admin); wizard may be in `reschedule` or other modes when those actions are shown; block-level `agentPermissions` (when added) respected for tooltips and permissions
- Full architecture, data model, and implementation details in phase guide

- [ ] ### Phase 6.9: Availability Step Mini-Wizard
**Description:** Reframe the Appointment Availability (3rd) wizard step as a mini-wizard: (1) Pick a day, (2) Pick block instance options when they exist (they affect differential calculation), (3) Pick perspective only when a date is selected and the booking is differential, (4) Pick a time. Wide screens: expanded panels with step labels; narrow screens: each sub-step as an expandable card, current step expanded and completed steps showing a done indicator when collapsed.
**Sessions:** To be planned (1–2)
**Dependencies:** Phase 6.4 (differential consolidation and option blocks in place). No new backend; UX and layout only.
**Success Criteria:**
- Sub-steps ordered and labeled (day → options [if any] → perspective [if differential] → time)
- Block instance options appear as a dedicated sub-step when available
- Perspective sub-step only visible when date selected and booking is differential
- Wide: all panels expanded; narrow: expandable cards per sub-step with smart expand/collapse and done state
- Existing validation and differential/slot behavior unchanged

- [ ] ### Phase 6.10: Fee Preview & Coupon Visibility
**Description:** Add a fee preview bar at the top of the Availability step showing total fee; on hover, show fee details (same as Confirmation step) in a popover, with optional Coupon row/Apply Coupon when enabled. Make the apply-coupon line and button toggleable from admin: Business Controls → Calendar → Confirmation & Holds.
**Sessions:** 2 (6.10.1: Admin toggle and settings; 6.10.2: Availability-step fee bar and popover)
**Dependencies:** None (reuses `buildConfirmationPriceData`, existing Confirmation step fee UI, and availability settings payload).
**Success Criteria:**
- Admin: "Show apply coupon in wizard" switch in Confirmation & Holds; setting persisted and read by wizard
- Availability step: compact "Fee preview: $X.XX" bar at top; hover shows popover with Bag Total, optional Coupon row (+ Apply Coupon when enabled), Order Total, line items, Total (no submit)
- Confirmation step: Coupon Discount row and Apply Coupon button only visible when `showApplyCouponInWizard` is true
**See:** `phases/phase-6.10-guide.md`, `sessions/session-6.10.1-guide.md`, `sessions/session-6.10.2-guide.md`

- [ ] ### Phase 6.11: Drive Time Fee Line Item
**Description:** Add a "Drive time" fee line item. Admin configures complimentary drive time (minutes), driving rate per hour ($), and rounding (e.g. nearest 15 min). Billable drive = max(0, total drive to candidate + total drive from candidate − complimentary); round to configured interval; fee = (rounded / 60) × rate. Settings live in Business Controls (driving / business rules or fee area). If driving logic exists in business rules tabs, add these settings there. **Persistence:** Store drive time in the fee breakdown using a single system "Drive time" block instance (virtual block — one row in block_instances, not user-selectable; amount stored in the fee entry only) so the current schema (appointment_fee_entries require block_instance_id) is unchanged.
**Sessions:** 1 (6.11.1: settings, calculation, line item, persistence via virtual block)
**Dependencies:** Availability/slot pipeline exposes drive-to and drive-from minutes for the selected slot; fee pipeline (`buildConfirmationPriceData`) and Confirmation step (and Phase 6.10 fee popover) already show line items.
**Success Criteria:**
- Admin: complimentary drive (min), driving rate ($/hr), and drive-time rounding (min) configurable and persisted
- Fee pipeline: accepts optional drive context (total drive to + from); computes drive time fee; adds "Drive time" line item and includes it in total
- Confirmation step and availability-step fee popover show Drive time row when applicable
- Stored fee breakdown includes drive time as a fee entry referencing the system Drive time block instance when applicable
**See:** `phases/phase-6.11-guide.md`, `sessions/session-6.11.1-guide.md`

---

- [ ] ### Session 6.5.1: Guide: Rescheduling Flow

**Description:** Deliver Phase 6.5 Rescheduling Flow per phase guide. Sessions 6.5.1–6.5.4.

**Tasks:**
Create phase branch; run sessions in order; cascade session-end to next or phase-end.

- [x] ### Session 6.5.2: Availability Bypass

**Description:** Deliver Phase 6.5 Rescheduling Flow per phase guide. Sessions 6.5.1–6.5.4.

**Tasks:**
Create phase branch; run sessions in order; cascade session-end to next or phase-end.

- [ ] ### Session 6.5.3: Original-Inspection UI

**Description:** Deliver Phase 6.5 Rescheduling Flow per phase guide. Sessions 6.5.1–6.5.4.

**Tasks:**
Create phase branch; run sessions in order; cascade session-end to next or phase-end.

- [ ] ### Session 6.5.4: Client-facing entry — reschedule / cancel / quote links

**Description:** Deliver Phase 6.5 Rescheduling Flow per phase guide. Sessions 6.5.1–6.5.4.

**Tasks:**
Create phase branch; run sessions in order; cascade session-end to next or phase-end.
