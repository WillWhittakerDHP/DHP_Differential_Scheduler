# Feature 6 Guide: Appointment Workflow & Booking Calculations

**Purpose:** Feature-level guide for planning and tracking the appointment status workflow and booking calculation logic

**Tier:** Feature (Tier 0 - Highest Level)

---

## Feature Overview

**Feature Name:** Appointment Workflow & Booking Calculations
**Feature Number:** 6
**Description:** Appointment status workflow with 8 statuses, user tracking, and UI enhancements; plus fee and time calculation logic for the booking wizard.
**Status:** In Progress

**Started:** January 2026 (Phase 6.1)
**Branch:** `feature/google-apis-integration`

---

## Feature Objectives

- Implement full appointment lifecycle: started → held → submitted → confirmed → rescheduling → cancelled → deleted
- Build status transition validation (state machine pattern) to prevent invalid transitions
- Create admin actions for confirmation, hold, force-create, and rescheduling
- Consolidate fee and time calculation logic into reusable composables
- Establish notification infrastructure (in-app now, email hooks for Feature 7)
- Prepare auth-dependent stubs for Feature 7 enactment

---

## Architecture

Feature 6 spans the Vue client (booking wizard, admin business controls), the Node server (appointments, availability, fees), and shared TypeScript types. The booking wizard is the primary UX surface; wizard **mode** (`new` | `quote` | `reschedule`) and (after Feature 7) **user role** drive theming, submit actions, and gated admin tools. Fee and time logic live in client composables and `client/src/utils/booking/` with API-backed settings. Vertical slices are tracked per **phase** under `.project-manager/features/appointment-workflow/phases/` with sessions and tasks beneath them.

---

## Implementation Plan

Deliver phases incrementally using the tier workflow: `/phase-start` / `/session-start` / `/task-start` for branches and planning artifacts; phase guides list sessions and success criteria. Completed work (e.g. 6.1–6.3) stays documented in guides and logs; in-flight phases (6.4+) follow session breakdowns in each `phase-6.x-guide.md`. Auth-dependent phases (6.7, 6.8) unblock when Feature 7 is available. Keep PROJECT_PLAN and handoff sections updated at session end.

---

## Wizard mode and user context

**Wizard mode** — A single state (`initial` | `quote` | `reschedule`) that drives theme, submit button label, submit action (create vs update), and reschedule-specific behavior (e.g. `reschedulingAppointmentId`, original-slot UI). Replaces or extends the current single `isQuoteMode` boolean so that “Send quote,” “Update appointment,” and “Submit” (new booking) are driven from one place. Reschedule flow sets mode to `reschedule` when loading an appointment for reschedule; submit shows “Update appointment” and calls the update path.

**User role** — From Feature 7 (Authentication). Controls visibility of admin-only UI in the wizard and admin appointments: Hold Slot, Override constraints, Force schedule. Implementation of role checks lives in Feature 7; this feature describes *usage* of role in the wizard (e.g. show Override constraints only when user is admin; wizard may be in `reschedule` or other modes when those actions are shown).

**Block-level `agentPermissions`** — Add to block_instances a column `agent_permissions` (TernaryBoolean: `'true' | 'false' | 'override'`), same pattern as `differential`. `true` = feature/block is for agents; `false` = for clients; `override` = admins can use regardless. Full stack: migration → model → versioning (if used) → client types → transformer. **Effective permission** is derived from (user role, block.agentPermissions): e.g. admin always allowed; agent allowed when `agentPermissions === 'true' || 'override'`; client when `'false' || 'override'`. Tooltips and permissions (Override constraints, future agent-only features) are driven by this state so they remain variable and consistent.

**Admin entry: step 0 or pre-wizard** — For admins only, before or as step 0 of the wizard: choose **Start new inspection** | **Edit quote** | **Reschedule**. When “Edit quote” or “Reschedule” is selected, show a **dropdown of non-completed inspections** (exclude statuses `cancelled`, `deleted`; optionally filter by status for quote vs reschedule). List is also filtered by an admin-configurable **time-out** (e.g. only appointments where scheduling began within the last X days/weeks, or the quote has been in quote status for the last X; X set in admin panel, e.g. Business Controls → Calendar or Confirmation & Holds). Appointment picker dropdown shows columns: **Address**, **Client name**, **Agent name**. Selection sets wizard mode and `loadedAppointmentId`; then the wizard proceeds (e.g. load appointment and go to step 3 for edit/reschedule). **API:** List appointments filtered by status, by time-out window, and (post–Feature 7) by permission.

**State** — Tooltips and permissions are driven by state: **(wizard mode, user role, block.agentPermissions)**. Admins get override behavior for `agentPermissions`; wizard mode drives submit label and action; user role gates Hold Slot, Override constraints, Force schedule.

**Implementation:** Session 6.8.5 (Block-level agentPermissions); Session 6.8.6 (Admin entry).

---

## Phases Breakdown

### Phase status (quick reference)

| Phase | Name | Status | What |
|-------|------|--------|------|
| 6.1 | Status Workflow & UI Enhancements | Complete (Jan 2026) | — |
| 6.2 | Held & Override Stubs | Complete | Prep held status and admin-override as stubs; Feature 7 enacts when auth is set up (trusted hold; admin override). |
| 6.3 | Confirmation Routine | Complete | submitted to confirmed; admin or auto confirm; notifications. |
| 6.4 | Moveable Modal & preClosing | Not Started | preClosing property; differential consolidation; modal gate logic; UX softening; re-enable MoveablePartsModal; unified required-confirmation modal shell (6.4.4). |
| 6.5 | Rescheduling Flow | Not Started | Reschedule confirmed; reuse wizard (same flow as quote/dev load at step 3); bypass current appointment as constraint (`reschedulingAppointmentId`); UI indicator for original inspection slot. |
| 6.6 | Soft Delete vs Hard Delete | Not Started | Policy and UI for cancelled vs deleted; retention; audit. |
| 6.7 | Scheduled By Auto-Population | Not Started (depends on Feature 7 Auth) | Set scheduled_by_id from logged-in user. |
| 6.8 | Admin Force-Create & Constraint Overrides | Not Started (depends on Feature 7 Auth) | Force-create appointments bypassing blockers; constraint_overrides table; reschedule with exceptions. |
| 6.9 | Availability Step Mini-Wizard | Not Started | Time-picking as sub-steps: day → options (if any) → perspective (if differential) → time → confirm moveable details (optional); responsive expandable panels on narrow screens. Sessions 6.9.1 (sub-step model & wide layout, optional 5th in model + placeholder), 6.9.2 (narrow expandable cards & state), 6.9.3 (a11y & focus), 6.9.4 (moveable content in 5th, remove modal, deprecate). |
| 6.10 | Fee Preview & Coupon Visibility | Not Started | Add new block shapes button on admin Shapes tab (6.10.1); fee preview bar on availability step (total + hover with fee details); admin toggle to show/hide apply-coupon in wizard (Business Controls → Calendar → Confirmation & Holds). Sessions 6.10.1 (Shapes tab button), 6.10.2 (admin toggle + settings), 6.10.3 (availability-step fee bar + popover). |
| 6.11 | Drive Time Fee Line Item | In Progress | Admin-configurable complimentary drive time (min), driving rate per hour ($), and rounding; billable drive = max(0, totalDrive − complimentary); round and multiply by rate; add "Drive time" line item to fees. Business Controls (driving / business rules area). Session 6.11.1. |
| 6.12 | Annotation Content Layer and Entity Enhancements | Not Started | Event shape link toggles; annotation_instance_content; UI slots registry; wizard pipeline for selection cards and grid overlay. Sessions 6.12.1–6.12.2. |
| 6.13 | Wizard Theme Tokens & Brand Palettes | Not Started | OKLCH/HSL-derived palettes; quote/reschedule/brand alignment; single pipeline for theme.ts, useThemeMode, BookingWizard.scss. To be sessioned from phase guide. |
| 6.14 | Organization Defaults & Resolved Numeric Policy | Not Started | Canonical defaults + merge at read for increments, fees, holds, constraint baselines; admin tab; shared types and resolver. Session 6.14.1. |
| 6.15 | Admin Brand Customization: Logo Upload & Color Anchors | Not Started | Logo upload + serving; extract/verify primary+secondary anchors; wizard_settings fields; wire OKLCH pipeline; logo in BookingWizard. Depends on 6.13. Sessions 6.15.1–6.15.3. |

---

- [x] ### Phase 6.1: Status Workflow & UI Enhancements
**Description:** Updated status ENUM from 5 to 8 values, added `scheduled_by_id` column, interactive tooltips, cross-tab navigation, and color-coded status chips.
**Sessions:** Completed January 2026
**Success Criteria:**
- 8-value status ENUM in place
- Admin UI displays status chips with tooltips
- Cross-tab navigation working

- [x] ### Phase 6.2: Held & Override Stubs
**Description:** Prepare held appointment status and admin constraint-override as stub implementations for Feature 7 enactment.
**Sessions:** 2 (6.2.1: Held Status Stub, 6.2.2: Admin Override Stub)
**Success Criteria:**
- Hold via PATCH works with computed heldUntil
- Override via PATCH works with stub auth
- Client UI elements exist but are properly gated
- Enactment requirements documented for Feature 7

- [x] ### Phase 6.3: Confirmation Routine
**Description:** Implement submitted → confirmed transition with status transition guards, admin confirmation action, optional auto-confirm, and notification stubs.
**Sessions:** 3 (6.3.1: Data Model & Transition Guards, 6.3.2: Admin Confirmation & Auto-Confirm, 6.3.3: Notifications & Docs)
**Status:** Complete
**Success Criteria:**
- Status transition validation prevents invalid transitions
- Confirmation timestamps auto-populated
- Admin Confirm button works for submitted appointments
- Auto-confirm business setting toggleable
- Notification stubs ready for Feature 7 email

- [ ] ### Phase 6.4: Moveable Modal & preClosing Property
**Description:** Refine MoveablePartsModal; add `preClosing` to block_instances; consolidate differential derivation; gate modal on preClosing services; soften UX; re-enable modal. Session 6.4.4: Unified required-confirmation modal shell — one shell component for all "must complete before next step" modals (property, moveable, future submit); MoveablePartsModal and PropertyConfirmationModal use it; transitions/sizing live in the shell only.
**Sessions:** 1+ (6.4.1+)
**Dependencies:** Phase 6.3 (Confirmation Routine)
**Success Criteria:**
- `preClosing` flows through full stack
- Differential derivation consolidated
- Modal gated on preClosing, time grid on closing date, passthrough enabled
- Modal re-enabled, smaller, delayed, animated

- [ ] ### Phase 6.5: Rescheduling Flow
**Description:** Reschedule confirmed appointments using the same flow as quote and dev-mode load: appointment loads at step 3 (Availability); user adjusts and reschedules. **Wizard mode** is the single source of truth for flow type (`initial` | `quote` | `reschedule`); **user role** (post–Feature 7) is a separate axis (admin vs non-admin drives visibility of Hold Slot, Override constraints, Force schedule). Reuse `handleLoadAppointment` and update path. The current appointment stays on the calendar but is temporarily excluded from availability constraints so its time and drive buffers do not block slots; the original inspection slot has a distinct UI indicator (e.g. different color or overlay).
**Sessions:** 3–4 (6.5.1 entry/transitions, 6.5.2 availability bypass, 6.5.3 original-inspection UI, 6.5.4 client-facing links)
**Dependencies:** Phase 6.3 (transition guards: confirmed → rescheduling → submitted)
**Success Criteria:**
- Reschedule action available for confirmed appointments; wizard reuses load-at-step-3 and update path (same as quote/dev load)
- `reschedulingAppointmentId` in computed-availability request; server excludes that appointment’s calendar event from overlap while keeping it in calendarEvents
- Original-inspection slot visually distinct (e.g. `appointment-slot-btn--original-inspection`) but still selectable
- Wizard mode set to `reschedule` when loading for reschedule; submit shows “Update appointment” and calls update path
- **Note:** Admin entry (Start new | Edit quote | Reschedule + dropdown) moved to Phase 6.8 Session 6.8.6.
- Client-facing entry (Session 6.5.4): URLs with mode and appointmentId for reschedule, quote, and cancel; "Copy quote link" button in app for staff to send quote URL manually; optional template variables only `{rescheduleLink}` and `{cancelLink}` for calendar invites and confirmation email (no quote link in invite template)
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
- Override constraints and Force schedule visibility gated by **user role** (admin); wizard may be in `reschedule` or other modes when those actions are shown; block-level `agentPermissions` (Session 6.8.5) respected for tooltips and permissions
- Full architecture, data model, and implementation details in phase guide

- [ ] ### Phase 6.9: Availability Step Mini-Wizard
**Description:** Reframe the Appointment Availability (3rd) wizard step as a mini-wizard: (1) Pick a day, (2) Pick block instance options when they exist (they affect differential calculation), (3) Pick perspective only when a date is selected and the booking is differential, (4) Pick a time, (5) Confirm moveable details — optional, when the selected slot has moveable parts and the service has preClosing. Replace MoveablePartsModal with this optional 5th sub-step; deprecate the modal. Wide screens: expanded panels with step labels; Narrow screens: collapse each sub-step into an expandable card; current sub-step expanded by default; completed sub-steps show a done indicator when collapsed.
**Sessions:** 4 (6.9.1: sub-step model & wide layout, optional 5th in model + placeholder; 6.9.2: narrow expandable cards & state; 6.9.3: a11y & focus for cards; 6.9.4: moveable content in 5th sub-step, remove modal, deprecate)
**Dependencies:** Phase 6.4 (differential consolidation and option blocks in place). No new backend; UX and layout only.
**Success Criteria:**
- Sub-steps ordered and labeled (day → options [if any] → perspective [if differential] → time → confirm moveable [when applicable])
- Block instance options appear as a dedicated sub-step when available
- Perspective sub-step only visible when date selected and booking is differential
- MoveablePartsModal replaced by optional 5th sub-step; modal deprecated and not used in AvailabilityStep
- Wide: all panels expanded; narrow: expandable cards per sub-step with smart expand/collapse and done state
- Existing validation and differential/slot behavior unchanged

- [ ] ### Phase 6.10: Fee Preview & Coupon Visibility
**Description:** Restore the add new block shapes button on the admin Shapes tab (it used to exist and is missing; if needed, adapt the same add-new pattern as the other shapes sub-tabs). Add a fee preview bar at the top of the Availability step showing total fee; on hover, show fee details (same as Confirmation step) in a popover, with optional Coupon row/Apply Coupon when enabled. Make the apply-coupon line and button toggleable from admin: Business Controls → Calendar → Confirmation & Holds.
**Sessions:** 3 (6.10.1: Add new block shapes button; 6.10.2: Admin toggle and settings; 6.10.3: Availability-step fee bar and popover)
- **Session 6.10.1:** Add new block shapes button on admin Shapes tab — restore it (it used to be there); if the original can’t be recovered, adapt the same add-new button pattern as the other shapes sub-tabs.
- **Session 6.10.2:** Admin toggle and settings — add `showApplyCouponInWizard` to availability settings types and API; add switch in `AppointmentConfirmationPanel`; wire form state and save; wizard reads setting (e.g. from `useAvailabilitySettings().settings` or shared config).
- **Session 6.10.3:** Availability-step fee bar and popover — compute `priceData` with `buildConfirmationPriceData` in `AvailabilityStep.vue` (wizard + propertyDetailsStepData); add compact bar at top; add hover popover with fee details; show coupon row in popover only when `showApplyCouponInWizard`; wrap Confirmation step coupon row in same conditional.
**Dependencies:** None (reuses `buildConfirmationPriceData`, existing Confirmation step fee UI, and availability settings payload).
**Success Criteria:**
- Shapes tab: Add new block shapes button works; admins can create block shapes from the UI
- Admin: "Show apply coupon in wizard" switch in Confirmation & Holds; setting persisted and read by wizard
- Availability step: compact "Fee preview: $X.XX" bar at top; hover shows popover with Bag Total, optional Coupon row (+ Apply Coupon when enabled), Order Total, line items, Total (no submit)
- Confirmation step: Coupon Discount row and Apply Coupon button only visible when `showApplyCouponInWizard` is true
**See:** `phases/phase-6.10-guide.md`, `sessions/session-6.10.1-guide.md`, `sessions/session-6.10.2-guide.md`, `sessions/session-6.10.3-guide.md`

- [ ] ### Phase 6.11: Drive Time Fee Line Item
**Description:** Add a "Drive time" fee line item. Admin configures complimentary drive time (minutes), driving rate per hour ($), and rounding (e.g. nearest 15 min). Billable drive = max(0, total drive to candidate + total drive from candidate − complimentary); round to configured interval; fee = (rounded / 60) × rate. Settings live in Business Controls (driving / business rules or fee area). If driving logic exists in business rules tabs, add these settings there. **Persistence (virtual block instance):** Preserve drive time in the stored fee breakdown by using a single system "Drive time" block instance (one real row in `block_instances` with lineItem block shape, not user-selectable). The block has minimal/zero parts so the normal block fee formula yields 0; the actual amount is stored only in the fee entry: when persisting, add one `appointment_fee_entries` row with that block's id, `block_name` "Drive time", and computed fee in `total_fee`/`base_fee`. This keeps `block_instance_id` required and avoids schema changes; reporting and existing "every entry has a block" assumptions remain valid. Ensure the drive-time block exists (e.g. seed or create per calendar) and is excluded from wizard block selection.
**Sessions:** 1 (6.11.1: settings, calculation, line item, persistence via virtual block)
- **Session 6.11.1:** Drive Time Fee — settings (complimentary, rate, rounding) in admin; formula in fee pipeline; pass drive context into `buildConfirmationPriceData`; add line item and persist via virtual block instance when fee breakdown is stored.
**Dependencies:** Availability/slot pipeline exposes drive-to and drive-from minutes for the selected slot; fee pipeline (`buildConfirmationPriceData`) and Confirmation step (and Phase 6.10 fee popover) already show line items.
**Success Criteria:**
- Admin: complimentary drive (min), driving rate ($/hr), and drive-time rounding (min) configurable and persisted
- Fee pipeline: accepts optional drive context (total drive to + from); computes drive time fee; adds "Drive time" line item and includes it in total
- Confirmation step and availability-step fee popover show Drive time row when applicable
- Stored fee breakdown includes drive time as a fee entry referencing the system Drive time block instance when applicable
**See:** `phases/phase-6.11-guide.md`, `sessions/session-6.11.1-guide.md`

- [ ] ### Phase 6.12: Annotation Content Layer and Entity Enhancements
**Description:** Entity enhancements (event shape reschedule/cancel link toggles; block shapes tab expansion fix); annotation data layer (`annotation_instance_content`, deprecate WithMetadata); annotation shape delete 409 handling; annotation UI slots registry and wizard pipeline (SelectionCard, grid overlay). See phase guide for session 6.12.1 and 6.12.2 breakdown.
**Sessions:** 2 (6.12.1, 6.12.2)
**Success Criteria:**
- As defined in `phases/phase-6.12-guide.md` (event toggles, content table, UI slots, wizard wiring, lint/app start)
**See:** `phases/phase-6.12-guide.md`

- [ ] ### Phase 6.13: Wizard Theme Tokens & Brand Palettes
**Description:** Perceptual color pipeline (OKLCH or HSL) so primary, secondary, warning, darken-1, on-*, inactive, and optional tertiary/semantic roles share consistent chroma and lightness; distinct quote/reschedule variants when admin **Brand colors** (DHP) is on; unify duplicated hex across `theme.ts`, `useThemeMode`, and `BookingWizard.scss`. Full analysis in `phases/phase-6.13-planning.md`.
**Sessions:** TBD — set in `phases/phase-6.13-guide.md` after scoping.
**Success Criteria:**
- Single source generates wizard/Vuetify CSS variables for brand and non-brand paths
- Quote and reschedule remain visually coherent with brand toggle on
- No regressions to admin `useBrandColors` toggle or wizard modes
- Lint and app start pass
**See:** `phases/phase-6.13-guide.md`, `phases/phase-6.13-planning.md`

- [ ] ### Phase 6.14: Organization Defaults & Resolved Numeric Policy
**Description:** Organization-level defaults model (canonical defaults object + optional overrides, merge at read time) for admin numeric policy scattered across Business Controls. Covers time grid & rounding, drive-time billing, holds & admin entry timeout, and optional constraint baselines.
**Sessions:** 6.14.1 (see `sessions/session-6.14.1-planning.md`)
**Success Criteria:**
- Shared `OrganizationDefaults` (or equivalent) types and JSON-serializable shape
- Resolver used (or wired with documented follow-up) for minuteIncrement, duration rounding, driveTimeFee where booking reads them
- Admin surface for org defaults; persistence strategy documented; tests for merge edge cases
- Lint/app start pass; no silent misconfiguration fallbacks per project standards
**See:** `phases/phase-6.14-guide.md`, `sessions/session-6.14.1-planning.md`

---


- [ ] ### Phase 6.13: Guide: Wizard Theme Tokens & Brand Palettes
**Description:** Guide: Wizard Theme Tokens & Brand Palettes
**Sessions:** [To be planned]
**Success Criteria:**
- [To be defined]


- [ ] ### Phase 6.15: Admin Brand Customization: Logo Upload & Color Anchors — Logo upload (file storage + public serving); client-side color extraction from uploaded logo (e.g. color-thief-browser / Canvas getImageData); admin verification and selection of primary + secondary anchor hex; DB schema for custom brand anchors and logo URL on wizard_settings; wire custom anchors into the existing OKLCH pipeline (replace hardcoded DHP_ANCHOR_PRIMARY / DHP_ANCHOR_SECONDARY with DB-sourced values in theme.ts / useThemeMode); render uploaded logo in BookingWizard header. Depends on 6.13 (OKLCH token pipeline). Sessions: 6.15.1 (DB schema + server API — migration for brand_primary_hex, brand_secondary_hex, logo_url on wizard_settings; multer upload endpoint; GET/PUT brand settings routes), 6.15.2 (Admin UI — logo upload component, color extraction from image, swatch presentation with editable color picker, live palette preview using buildWizardModePaletteFromAnchors, save flow), 6.15.3 (Wizard consumption — replace DHP_ANCHOR constants with DB values in theme.ts / useThemeMode; render logo in BookingWizard.vue; verify all mode × brand combinations with custom colors; client lint).
**Description:** Admin Brand Customization: Logo Upload & Color Anchors — Logo upload (file storage + public serving); client-side color extraction from uploaded logo (e.g. color-thief-browser / Canvas getImageData); admin verification and selection of primary + secondary anchor hex; DB schema for custom brand anchors and logo URL on wizard_settings; wire custom anchors into the existing OKLCH pipeline (replace hardcoded DHP_ANCHOR_PRIMARY / DHP_ANCHOR_SECONDARY with DB-sourced values in theme.ts / useThemeMode); render uploaded logo in BookingWizard header. Depends on 6.13 (OKLCH token pipeline). Sessions: 6.15.1 (DB schema + server API — migration for brand_primary_hex, brand_secondary_hex, logo_url on wizard_settings; multer upload endpoint; GET/PUT brand settings routes), 6.15.2 (Admin UI — logo upload component, color extraction from image, swatch presentation with editable color picker, live palette preview using buildWizardModePaletteFromAnchors, save flow), 6.15.3 (Wizard consumption — replace DHP_ANCHOR constants with DB values in theme.ts / useThemeMode; render logo in BookingWizard.vue; verify all mode × brand combinations with custom colors; client lint).
**Sessions:** [To be planned]
**Success Criteria:**
- [To be defined]

## Booking Calculations (Core Complete)

**Fee calculations:** `calculateBlockInstanceFee()`, `buildConfirmationPriceData()`, `calculatePartsTotals()`, pricing cascade resolution via `pricingCascadeResolver.ts`.

**Time calculations:** `useTimeSlotCalculations()`, `calculateAppointmentSlots()`, `calculateTotalDurationFromAppointmentSlots()`, `createBlockFinal()` / `createPartFinals()`.

Shared finalization and fee utilities live in `client/src/utils/booking/` and are used by the confirmation step and related composables.

**Key Files:**
- **Workflow:** Feature 6 appointment-workflow planning (see Related Documents)
- **Calculations:** confirmationStepData, partsTotals, pricingCascadeResolver, appointmentTimeCalculations, useTimeSlotCalculations, BlockFinal/PartFinals (booking utils)
- **Archived planning:** booking-calculations planning (archived in `../booking-calculations/`)

**Remaining:**
- **useFeeCalculations composable:** Consolidate fee logic parallel to `useTimeSlotCalculations()`
- **Admin-configurable fee settings:** Move hardcoded coupon discount, delivery charges, and delivery-free behavior to business settings

---

## Dependencies

**Prerequisites:**
- Feature 1 (Data Flow Alignment) — Complete
- Feature 3 (Calendar & Appointment Availability) — slot computation and calendar infrastructure

**Downstream Impact:**
- Feature 7 (Authentication) enactment activates auth-dependent phases (6.7, 6.8) and populates user fields (`confirmed_by`, `held_by`, `authorized_by_id`, `scheduled_by_id`)
- Feature 7 must expose **user role** (e.g. admin) to the client so the wizard and admin UI can gate Hold Slot, Override constraints, and Force schedule; state (wizard mode, user role, block.agentPermissions) drives tooltips and permissions
- Phase 6.5 (Rescheduling) integrates with Phase 6.8 constraint relaxation

**External Dependencies:**
- Feature 7 (Authentication) — Phases 6.7 and 6.8 blocked until auth is in place

---

## Success Criteria

- [ ] All phases completed
- [ ] All research questions answered
- [ ] Architecture decisions documented
- [ ] Code quality checks passing
- [ ] Documentation updated
- [ ] Tests passing
- [ ] Performance targets met
- [ ] Ready for production

---

## Git Branch Strategy

**Branch Name:** `feature/google-apis-integration` (shared feature branch)
**Current Working Branch:** `appointment-workflow-phase-6.3-session-6.3.2`

---

## End of Feature Workflow

**CRITICAL: Prompt before ending feature**

After completing all phases in a feature, **prompt the user** before running `/feature-end`:

```
## Ready to End Feature?

All phases complete. Ready to merge feature branch?

**This will:**
- Generate feature summary
- Merge feature/[name] → develop
- Delete feature branch
- Finalize documentation

**Proceed with /feature-end?** (yes/no)
```

**If user says "yes":**
- Run `/feature-end` command automatically
- Complete all feature-end steps (verify completion, update docs, generate summary)
- **After all checks pass and docs are updated, prompt for commit/merge/push:**
  ```
  ## Ready to Commit, Merge, and Push?
  
  All feature-end checks completed successfully:
  - ✅ Feature summary generated
  - ✅ Feature documentation closed
  - ✅ All documentation updated
  
  **Ready to commit, merge, and push all changes?**
  
  This will:
  - Commit all changes with feature completion message
  - Merge feature/[name] → develop
  - Delete feature branch
  - Push to remote repository
  
  **Proceed with commit, merge, and push?** (yes/no)
  ```
- **If user says "yes" to commit/merge/push:** Execute git commit, merge, delete branch, and push, then end feature
- **If user says "no" to commit/merge/push:** End feature without committing (user can commit and merge manually later)

**If user says "no" to feature-end:**
- Address any requested changes
- Re-prompt when ready

After completing all phases in a feature:

1. **Verify feature completion** - All phases complete, success criteria met
2. **Update feature status** - Mark feature as Complete
3. **Update feature handoff** - Document feature completion and transition context
4. **Generate feature summary** - Create completion summary
5. **PROMPT USER FOR COMMIT/MERGE/PUSH** - After all checks pass and docs are updated, prompt user before git operations
6. **Merge feature branch** - Merge to develop (after user approval)
7. **Delete feature branch** - Clean up branch (after merge)
8. **Workflow Feedback** (Optional - only if issues encountered):
   - Were there any problems managing this feature workflow or issues with results?
   - Note any sticking points, inefficiencies, or workflow friction for future improvement
   - Consider if feature-level issues suggest improvements needed at phase, session, or task level

---

## Notes

- **Phase 6.1 was the only phase completed before the project management system was formalized.** Its session logs don't exist in the current structure.
- **Booking calculation logic is feature-complete but not consolidated.** The `useFeeCalculations` composable and admin-configurable fee settings are the remaining calculation work.
- **Phases 6.2–6.4 follow the full session guide structure.** Phase 6.8 has a detailed guide ready for when Feature 7 unblocks it.

---

## Related Documents

- Feature Log: `feature-appointment-workflow-log.md`
- Feature Handoff: `feature-appointment-workflow-handoff.md`
- Booking Calculations Guide: `../booking-calculations/feature-booking-calculations-guide.md`
- Booking Calculations Handoff: `../booking-calculations/feature-booking-calculations-handoff.md`
- Phase 6.4 Guide: `phases/phase-6.4-guide.md` (Moveable Modal & preClosing)
- Phase 6.5 Guide: `phases/phase-6.5-guide.md` (Rescheduling flow, availability bypass, original-inspection UI)
- Phase 6.8 Guide: `phases/phase-6.8-guide.md` (architecture, data model, implementation checklist, decision log for Admin Force-Create)
- Phase 6.9 Guide: `phases/phase-6.9-guide.md` (Availability Step Mini-Wizard)
- Phase 6.10 Guide: `phases/phase-6.10-guide.md` (Fee Preview & Coupon Visibility)
- Phase 6.11 Guide: `phases/phase-6.11-guide.md` (Drive Time Fee Line Item)
- LAUNCH_CHECKLIST.md Phase 8A (force-create detail)
- PROJECT_PLAN: `.project-manager/PROJECT_PLAN.md` (Feature 6)

