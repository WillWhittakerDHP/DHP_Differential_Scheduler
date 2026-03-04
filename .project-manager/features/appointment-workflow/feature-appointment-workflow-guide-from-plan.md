# Feature context (from PROJECT_PLAN)

## Feature 6: Appointment Workflow & Booking Calculations

**Status:** ⏳ Partial (Phase 1 Complete for workflow; core complete for calculations)
**Description:** Appointment status workflow with 8 statuses, user tracking, and UI enhancements; plus fee and time calculation logic for the booking wizard. Booking calculation logic is implemented; workflow Phase 1 complete.
**Branch:** `feature/google-apis-integration`

### Appointment Workflow Phases

| Phase | Name | Status | What |
|-------|------|--------|------|
| 6.1 | Status Workflow & UI Enhancements | ✅ Complete (Jan 2026) | — |
| 6.2 | Held & Override Stubs | ✅ Complete | Prep held status and admin-override as stubs; Feature 7 enacts when auth is set up (trusted hold; admin override). |
| 6.3 | Confirmation Routine | ✅ Complete | submitted to confirmed; admin or auto confirm; notifications. |
| 6.4 | Moveable Modal & preClosing | ⏳ Not Started | preClosing property; differential consolidation; modal gate logic; UX softening; re-enable MoveablePartsModal; unified required-confirmation modal shell (6.4.4). |
| 6.5 | Rescheduling Flow | Not Started | Reschedule confirmed; reuse wizard (same flow as quote/dev load at step 3); bypass current appointment as constraint (`reschedulingAppointmentId`); UI indicator for original inspection slot. |
| 6.6 | Soft Delete vs Hard Delete | Not Started | Policy and UI for cancelled vs deleted; retention; audit. |
| 6.7 | Scheduled By Auto-Population | Not Started (depends on Feature 7 Auth) | Set scheduled_by_id from logged-in user. |
| 6.8 | Admin Force-Create & Constraint Overrides | Not Started (depends on Feature 7 Auth) | Force-create appointments bypassing blockers; constraint_overrides table; reschedule with exceptions. |
| 6.9 | Availability Step Mini-Wizard | Not Started | Time-picking as sub-steps: day → options (if any) → perspective (if differential) → time; responsive expandable panels on narrow screens. |
| 6.10 | Fee Preview & Coupon Visibility | Not Started | Fee preview bar on availability step (total + hover with fee details); admin toggle to show/hide apply-coupon in wizard (Business Controls → Calendar → Confirmation & Holds). Sessions 6.10.1 (admin toggle + settings), 6.10.2 (availability-step fee bar + popover). |
| 6.11 | Drive Time Fee Line Item | Not Started | Admin-configurable complimentary drive time (min), driving rate per hour ($), and rounding; billable drive = max(0, totalDrive − complimentary); round and multiply by rate; add "Drive time" line item to fees. Business Controls (driving / business rules area). Session 6.11.1. |

### Phase 6.1 Completed (Workflow)
- Updated status ENUM from 5 to 8 values (started, held, rescheduling, quoted, submitted, confirmed, cancelled, deleted)
- Added `scheduled_by_id` column with FK to users table
- Interactive tooltips and cross-tab navigation in admin UI
- Color-coded status chips

### Phase 6.4: Moveable Modal Refinement & preClosing Property (Not Started)
- Add `preClosing` boolean to block_instances (full stack: migration → model → types → transformer) to distinguish services with pre-closing work
- Consolidate three parallel differential derivations into one canonical `isDifferentialBooking` computed (derive once, propagate everywhere)
- Gate the moveable modal so it only opens for `preClosing` services; show the completion time grid only when a closing date is provided; allow passthrough without timeslot selection
- Soften modal UX: smaller dialog, delayed appearance (~400ms), smooth enter/exit transitions
- Re-enable the currently-disabled MoveablePartsModal and verify full integration
- Session 6.4.4: Unified required-confirmation modal shell — one shell component for all "must complete before next step" modals (property, moveable, future submit); MoveablePartsModal and PropertyConfirmationModal use it; transitions/sizing live in the shell only

### Phase 6.5: Rescheduling Flow (Not Started)
- **Wizard mode:** Single source of truth for flow type: `initial` (new booking), `quote` (new quote), `reschedule` (editing existing). Drives themes, submit button label (“Submit” | “Send quote” | “Update appointment”), submit action (create vs update), and availability params (e.g. `reschedulingAppointmentId`). User role (post–Feature 7) is a separate axis: admin vs non-admin drives visibility of “Hold Slot,” “Override constraints,” “Force schedule,” etc.
- **Same flow as quote and dev load:** Appointment loads at step 3 (Availability); user adjusts and saves/holds quote or books/reschedules. No new wizard steps; reuse `handleLoadAppointment` and update path.
- **Bypass current appointment as constraint:** Add `reschedulingAppointmentId` to computed-availability request. Server excludes that appointment’s calendar event (and its drive buffers) from the overlap list used in slot computation, while still returning it in `calendarEvents` so it stays visible on the calendar.
- **Original-inspection slot UI:** Pass the loaded appointment’s time range into the slot grid; mark slots that match/overlap the original time; style with a distinct class (e.g. `appointment-slot-btn--original-inspection`) or overlay so the current time is visible but still selectable.
- **See:** `features/appointment-workflow/phases/phase-6.5-guide.md` for sessions, implementation details, and relation to Phase 6.8 (allowedExceptions).

### Block-level permissions and admin entry (Feature 6)

- **`agentPermissions` on block_instances:** Add column `agent_permissions` (TernaryBoolean: `'true' | 'false' | 'override'`), same pattern as `differential`. Full stack: migration → model → versioning (if used) → client types → transformer. `true` = agents only; `false` = clients; `override` = admins can use regardless. Drives which blocks/features (e.g. blocker override, future agent features) are visible or usable per role. **Effective permission:** state combines user role (client / agent / admin) with block’s `agentPermissions` so tooltips and permissions (Override constraints, Hold Slot, Force schedule, etc.) are variable and state-driven; admins get override.
- **Admin step 0 or pre-wizard:** For admins only, before (or as step 0 of) the wizard: choose **Start new inspection** | **Edit quote** | **Reschedule**. When “Edit quote” or “Reschedule” is selected, show a **dropdown of non-completed inspections** (exclude statuses `cancelled`, `deleted`; optionally filter by status for Edit quote vs Reschedule). Filter by a **time-out** setting from the admin panel (e.g. only appointments where scheduling began within the last X days/weeks, or the quote has been in quote status for the last X days/weeks; X configurable in admin, e.g. Business Controls → Calendar or Confirmation & Holds). Picker is a dropdown with columns: **Address**, **Client name**, **Agent name**. Selection sets wizard mode and `loadedAppointmentId`; then wizard proceeds (e.g. to step 3 for edit/reschedule). API: list appointments filtered by status, by time-out window, and (post–Feature 7) by permission.

### Phase 6.9: Availability Step Mini-Wizard (Not Started)
- Reframe the 3rd wizard step (Appointment Availability) as a mini-wizard with ordered sub-steps: (1) Pick a day, (2) Pick block instance options when they exist (they affect differential calculation), (3) Pick perspective only when a date is selected and the booking is differential, (4) Pick a time.
- Wide screens: show all sub-steps as expanded panels (current layout preserved; add step labels/numbers).
- Narrow screens: collapse each sub-step into an expandable card; current sub-step expanded by default; completed sub-steps show a done indicator when collapsed.
- Dependencies: Option-type blocks and differential logic already drive availability; no new backend. UX and layout only.

### Phase 6.10: Fee Preview & Coupon Visibility (Not Started)
- **Fee preview bar on availability step:** A bar at the top of the Appointment Availability (step 3) wizard showing total fee as a preview (e.g. "Fee preview: $X.XX"). On hover, show fee details in a popover — same structure as step 5 (Confirmation): Bag Total, optional Coupon Discount row (and Apply Coupon button when enabled by admin), Order Total, line items, Total. No submit buttons in the popover.
- **Apply coupon toggle in admin:** Business Controls → **Calendar** → **Confirmation & Holds** subtab. Add a switch "Show apply coupon in wizard" so the Coupon Discount row and Apply Coupon button can be shown or hidden in the booking flow. Persist the setting with availability/business settings (e.g. `showApplyCouponInWizard` in payload and types); wizard reads it via availability settings and shows the coupon row in Confirmation step and in the availability-step fee popover only when the toggle is on.
- **Session 6.10.1:** Admin toggle and settings — add `showApplyCouponInWizard` to availability settings types and API; add switch in `AppointmentConfirmationPanel`; wire form state and save; wizard reads setting (e.g. from `useAvailabilitySettings().settings` or shared config).
- **Session 6.10.2:** Availability-step fee bar and popover — compute `priceData` with `buildConfirmationPriceData` in `AvailabilityStep.vue` (wizard + propertyDetailsStepData); add compact bar at top; add hover popover with fee details; show coupon row in popover only when `showApplyCouponInWizard`; wrap Confirmation step coupon row in same conditional.
- **See:** `features/appointment-workflow/phases/phase-6.10-guide.md` and sessions `session-6.10.1-guide.md`, `session-6.10.2-guide.md`.

### Phase 6.11: Drive Time Fee Line Item (Not Started)
- **Admin-configurable settings (Business Controls / business rules area):** **Complimentary drive time (minutes)** — drive below this is not charged. **Driving rate per hour ($)** — (rounded billable minutes / 60) × rate. **Rounding (minutes)** — round billable drive to nearest N minutes (configurable in admin). If driving logic or fee-related config lives in Business Controls (e.g. Calendar → Confirmation & Holds or a Driving / Business Rules tab), add these three settings there; persist with business/availability settings API.
- **Calculation:** Total drive to candidate + total drive from candidate (for the selected slot) in minutes. Billable = max(0, totalDrive − complimentary). Round billable to configured interval; drive time fee = (roundedBillable / 60) × drivingRatePerHour. Add **"Drive time"** line item to fee breakdown; include in order total. Selected-slot drive minutes must be available in wizard/confirmation context (from availability step data or slot payload); extend types if needed.
- **Persistence (virtual block instance):** Preserve drive time in the stored fee breakdown by using a single **system "Drive time" block instance** (one real row in `block_instances` with lineItem block shape, not user-selectable). The block has minimal/zero parts so the normal block fee formula yields 0; the **actual amount is stored only in the fee entry**: when persisting, add one `appointment_fee_entries` row with that block’s id, `block_name` "Drive time", and computed fee in `total_fee`/`base_fee`. This keeps `block_instance_id` required and avoids schema changes; reporting and existing "every entry has a block" assumptions remain valid. Ensure the drive-time block exists (e.g. seed or create per calendar) and is excluded from wizard block selection.
- **Session 6.11.1:** Drive Time Fee — settings (complimentary, rate, rounding) in admin; formula in fee pipeline; pass drive context into `buildConfirmationPriceData`; add line item and persist via virtual block instance when fee breakdown is stored.
- **See:** `features/appointment-workflow/phases/phase-6.11-guide.md`, `sessions/session-6.11.1-guide.md`.

### Booking Calculations (Core Complete)
**Fee calculations:** `calculateBlockInstanceFee()`, `buildConfirmationPriceData()`, `calculatePartsTotals()`, pricing cascade resolution via `pricingCascadeResolver.ts`. **Time calculations:** `useTimeSlotCalculations()`, `calculateAppointmentSlots()`, `calculateTotalDurationFromAppointmentSlots()`, `createBlockFinal()` / `createPartFinals()`. Shared finalization and fee utilities live in `client/src/utils/booking/` and are used by the confirmation step and related composables.

**Remaining (calculations):** **useFeeCalculations composable:** Add a composable parallel to `useTimeSlotCalculations()`, reusing existing fee and finalization utils (`calculateBlockInstanceFee`, `buildConfirmationPriceData`, pricing cascade resolution, `createBlockFinal` / `createPartFinals`). Wire it into the confirmation step so fee logic is exposed in one place. **Admin-configurable fee-related settings:** Coupon discount, delivery charges, and delivery-free behavior are currently hardcoded in the fee flow. Move to admin-configurable business settings and have the fee flow (e.g. useFeeCalculations or shared utils) read from those settings.

### Key Files
- **Workflow:** Feature 6 appointment-workflow planning (see Related Documents)
- **Calculations:** confirmationStepData, partsTotals, pricingCascadeResolver, appointmentTimeCalculations, useTimeSlotCalculations, BlockFinal/PartFinals (booking utils)
- **Archived planning:** booking-calculations planning (archived)

### Related Documents
- Phase 6.4 Guide: `features/appointment-workflow/phases/phase-6.4-guide.md` (Moveable Modal & preClosing)
- Phase 6.5 Guide: `features/appointment-workflow/phases/phase-6.5-guide.md` (Rescheduling flow, availability bypass, original-inspection UI)
- Phase 6.8 Guide: `features/appointment-workflow/phases/phase-6.8-guide.md` (architecture, data model, implementation checklist, decision log for Admin Force-Create)
- Phase 6.9 Guide: `features/appointment-workflow/phases/phase-6.9-guide.md` (Availability Step Mini-Wizard)
- Phase 6.10 Guide: `features/appointment-workflow/phases/phase-6.10-guide.md` (Fee Preview & Coupon Visibility)
- Phase 6.11 Guide: `features/appointment-workflow/phases/phase-6.11-guide.md` (Drive Time Fee Line Item)
- LAUNCH_CHECKLIST.md Phase 8A (force-create detail)
- Feature 6 workflow and booking-calculations planning: `features/appointment-workflow/`

---