# Session 6.5.4 Guide: Client-facing entry — reschedule / cancel / quote links

**Purpose:** Session-level guide for URL-based client entry and optional invite link variables

**Tier:** Session (Tier 2 - Medium-Level)

---

## Quick Start

### Session Overview

**Session ID:** 6.5.4
**Session Name:** Client-facing entry — reschedule / cancel / quote links
**Description:** Enable clients to open reschedule, view-quote, or cancel flows via links (URLs with mode and appointmentId). Reschedule and cancel links can be embedded in calendar invites via optional template variables. The quote link is not in the invite template; a **"Copy quote link" button** in the app generates a copyable URL so staff can send it manually (email, Slack, etc.).

**Duration:** [Estimated]
**Status:** In Progress

**Dependencies:** Session 6.5.1 (wizard mode, load-at-step-3, admin entry).

### Tasks

- [x] #### Task 6.5.4.1: URL scheme and router

**Goal:** Enable clients to open reschedule, view-quote, or cancel flows via URLs (mode + appointmentId). Reschedule and cancel links can be embedded in calendar invites via optional template variables. The quote link is not in the invite template; a "Copy quote link" button in the app generates a copyable URL for staff to send manually.

**Files:**
- `client/src/router/index.ts` — URL scheme, booking route with query params, cancel route
- `client/src/views/` — BookingWizardView, cancel view/component
- `client/src/composables/booking/` — useBookingWizard, useWizardAppointmentManagement (wizard entry from query)
- `client/src/utils/` — shared URL-building utility for link generation
- `server/src/services/invites/` — templateResolver, inviteContextBuilder for {rescheduleLink}, {cancelLink}
- Admin components — appointment row/detail "Copy quote link" button; template help

**Approach:** 1. **URL scheme and router:** Define booking route with `mode` and `appointmentId` query params; separate cancel route; document base URL source.
2. **Wizard entry from query:** On booking route load, read query params, set wizard mode and loadedAppointmentId; load-at-step-3 runs for reschedule/quote.
3. **Cancel flow:** Cancel URL → confirm page → PATCH to cancelled → success/error and navigation.
4. **Copy quote link button:** Button on appointment row/detail (quote-status) builds quote URL, copies to clipboard, shows "Link copied" feedback.
5. **Invite template variables (optional):** Add {rescheduleLink} and {cancelLink} only; resolve to full URLs; update admin template help.
6. **Verification and docs:** Smoke-test all links; document URL scheme; update handoff/session log.

**Checkpoint:**
- Visiting `/booking?mode=reschedule&appointmentId=<id>` loads appointment and lands at step 3.
- Cancel link works end-to-end; only valid statuses allow cancel.
- Staff can copy quote link and paste into email/Slack; opening pasted link loads wizard in quote mode at step 3.
- Calendar invite can include reschedule and cancel links via variables.
- Session docs and handoff updated.- [ ] #### Task 6.5.4.2: Wizard entry from query

**Goal:** Enable clients to open reschedule, view-quote, or cancel flows via URLs (mode + appointmentId). Reschedule and cancel links can be embedded in calendar invites via optional template variables. The quote link is not in the invite template; a "Copy quote link" button in the app generates a copyable URL for staff to send manually.

**Files:**
- `client/src/router/index.ts` — URL scheme, booking route with query params, cancel route
- `client/src/views/` — BookingWizardView, cancel view/component
- `client/src/composables/booking/` — useBookingWizard, useWizardAppointmentManagement (wizard entry from query)
- `client/src/utils/` — shared URL-building utility for link generation
- `server/src/services/invites/` — templateResolver, inviteContextBuilder for {rescheduleLink}, {cancelLink}
- Admin components — appointment row/detail "Copy quote link" button; template help

**Approach:** 1. **URL scheme and router:** Define booking route with `mode` and `appointmentId` query params; separate cancel route; document base URL source.
2. **Wizard entry from query:** On booking route load, read query params, set wizard mode and loadedAppointmentId; load-at-step-3 runs for reschedule/quote.
3. **Cancel flow:** Cancel URL → confirm page → PATCH to cancelled → success/error and navigation.
4. **Copy quote link button:** Button on appointment row/detail (quote-status) builds quote URL, copies to clipboard, shows "Link copied" feedback.
5. **Invite template variables (optional):** Add {rescheduleLink} and {cancelLink} only; resolve to full URLs; update admin template help.
6. **Verification and docs:** Smoke-test all links; document URL scheme; update handoff/session log.

**Checkpoint:**
- Visiting `/booking?mode=reschedule&appointmentId=<id>` loads appointment and lands at step 3.
- Cancel link works end-to-end; only valid statuses allow cancel.
- Staff can copy quote link and paste into email/Slack; opening pasted link loads wizard in quote mode at step 3.
- Calendar invite can include reschedule and cancel links via variables.
- Session docs and handoff updated.- [ ] #### Task 6.5.4.3: Cancel flow

**Goal:** Enable clients to open reschedule, view-quote, or cancel flows via URLs (mode + appointmentId). Reschedule and cancel links can be embedded in calendar invites via optional template variables. The quote link is not in the invite template; a "Copy quote link" button in the app generates a copyable URL for staff to send manually.

**Files:**
- `client/src/router/index.ts` — URL scheme, booking route with query params, cancel route
- `client/src/views/` — BookingWizardView, cancel view/component
- `client/src/composables/booking/` — useBookingWizard, useWizardAppointmentManagement (wizard entry from query)
- `client/src/utils/` — shared URL-building utility for link generation
- `server/src/services/invites/` — templateResolver, inviteContextBuilder for {rescheduleLink}, {cancelLink}
- Admin components — appointment row/detail "Copy quote link" button; template help

**Approach:** 1. **URL scheme and router:** Define booking route with `mode` and `appointmentId` query params; separate cancel route; document base URL source.
2. **Wizard entry from query:** On booking route load, read query params, set wizard mode and loadedAppointmentId; load-at-step-3 runs for reschedule/quote.
3. **Cancel flow:** Cancel URL → confirm page → PATCH to cancelled → success/error and navigation.
4. **Copy quote link button:** Button on appointment row/detail (quote-status) builds quote URL, copies to clipboard, shows "Link copied" feedback.
5. **Invite template variables (optional):** Add {rescheduleLink} and {cancelLink} only; resolve to full URLs; update admin template help.
6. **Verification and docs:** Smoke-test all links; document URL scheme; update handoff/session log.

**Checkpoint:**
- Visiting `/booking?mode=reschedule&appointmentId=<id>` loads appointment and lands at step 3.
- Cancel link works end-to-end; only valid statuses allow cancel.
- Staff can copy quote link and paste into email/Slack; opening pasted link loads wizard in quote mode at step 3.
- Calendar invite can include reschedule and cancel links via variables.
- Session docs and handoff updated.- [ ] #### Task 6.5.4.4: "Copy quote link" button

**Goal:** Enable clients to open reschedule, view-quote, or cancel flows via URLs (mode + appointmentId). Reschedule and cancel links can be embedded in calendar invites via optional template variables. The quote link is not in the invite template; a "Copy quote link" button in the app generates a copyable URL for staff to send manually.

**Files:**
- `client/src/router/index.ts` — URL scheme, booking route with query params, cancel route
- `client/src/views/` — BookingWizardView, cancel view/component
- `client/src/composables/booking/` — useBookingWizard, useWizardAppointmentManagement (wizard entry from query)
- `client/src/utils/` — shared URL-building utility for link generation
- `server/src/services/invites/` — templateResolver, inviteContextBuilder for {rescheduleLink}, {cancelLink}
- Admin components — appointment row/detail "Copy quote link" button; template help

**Approach:** 1. **URL scheme and router:** Define booking route with `mode` and `appointmentId` query params; separate cancel route; document base URL source.
2. **Wizard entry from query:** On booking route load, read query params, set wizard mode and loadedAppointmentId; load-at-step-3 runs for reschedule/quote.
3. **Cancel flow:** Cancel URL → confirm page → PATCH to cancelled → success/error and navigation.
4. **Copy quote link button:** Button on appointment row/detail (quote-status) builds quote URL, copies to clipboard, shows "Link copied" feedback.
5. **Invite template variables (optional):** Add {rescheduleLink} and {cancelLink} only; resolve to full URLs; update admin template help.
6. **Verification and docs:** Smoke-test all links; document URL scheme; update handoff/session log.

**Checkpoint:**
- Visiting `/booking?mode=reschedule&appointmentId=<id>` loads appointment and lands at step 3.
- Cancel link works end-to-end; only valid statuses allow cancel.
- Staff can copy quote link and paste into email/Slack; opening pasted link loads wizard in quote mode at step 3.
- Calendar invite can include reschedule and cancel links via variables.
- Session docs and handoff updated.- [ ] #### Task 6.5.4.5: Invite template variables (optional)

**Goal:** Enable clients to open reschedule, view-quote, or cancel flows via URLs (mode + appointmentId). Reschedule and cancel links can be embedded in calendar invites via optional template variables. The quote link is not in the invite template; a "Copy quote link" button in the app generates a copyable URL for staff to send manually.

**Files:**
- `client/src/router/index.ts` — URL scheme, booking route with query params, cancel route
- `client/src/views/` — BookingWizardView, cancel view/component
- `client/src/composables/booking/` — useBookingWizard, useWizardAppointmentManagement (wizard entry from query)
- `client/src/utils/` — shared URL-building utility for link generation
- `server/src/services/invites/` — templateResolver, inviteContextBuilder for {rescheduleLink}, {cancelLink}
- Admin components — appointment row/detail "Copy quote link" button; template help

**Approach:** 1. **URL scheme and router:** Define booking route with `mode` and `appointmentId` query params; separate cancel route; document base URL source.
2. **Wizard entry from query:** On booking route load, read query params, set wizard mode and loadedAppointmentId; load-at-step-3 runs for reschedule/quote.
3. **Cancel flow:** Cancel URL → confirm page → PATCH to cancelled → success/error and navigation.
4. **Copy quote link button:** Button on appointment row/detail (quote-status) builds quote URL, copies to clipboard, shows "Link copied" feedback.
5. **Invite template variables (optional):** Add {rescheduleLink} and {cancelLink} only; resolve to full URLs; update admin template help.
6. **Verification and docs:** Smoke-test all links; document URL scheme; update handoff/session log.

**Checkpoint:**
- Visiting `/booking?mode=reschedule&appointmentId=<id>` loads appointment and lands at step 3.
- Cancel link works end-to-end; only valid statuses allow cancel.
- Staff can copy quote link and paste into email/Slack; opening pasted link loads wizard in quote mode at step 3.
- Calendar invite can include reschedule and cancel links via variables.
- Session docs and handoff updated.- [ ] #### Task 6.5.4.6: Verification and docs

**Goal:** Enable clients to open reschedule, view-quote, or cancel flows via URLs (mode + appointmentId). Reschedule and cancel links can be embedded in calendar invites via optional template variables. The quote link is not in the invite template; a "Copy quote link" button in the app generates a copyable URL for staff to send manually.

**Files:**
- `client/src/router/index.ts` — URL scheme, booking route with query params, cancel route
- `client/src/views/` — BookingWizardView, cancel view/component
- `client/src/composables/booking/` — useBookingWizard, useWizardAppointmentManagement (wizard entry from query)
- `client/src/utils/` — shared URL-building utility for link generation
- `server/src/services/invites/` — templateResolver, inviteContextBuilder for {rescheduleLink}, {cancelLink}
- Admin components — appointment row/detail "Copy quote link" button; template help

**Approach:** 1. **URL scheme and router:** Define booking route with `mode` and `appointmentId` query params; separate cancel route; document base URL source.
2. **Wizard entry from query:** On booking route load, read query params, set wizard mode and loadedAppointmentId; load-at-step-3 runs for reschedule/quote.
3. **Cancel flow:** Cancel URL → confirm page → PATCH to cancelled → success/error and navigation.
4. **Copy quote link button:** Button on appointment row/detail (quote-status) builds quote URL, copies to clipboard, shows "Link copied" feedback.
5. **Invite template variables (optional):** Add {rescheduleLink} and {cancelLink} only; resolve to full URLs; update admin template help.
6. **Verification and docs:** Smoke-test all links; document URL scheme; update handoff/session log.

**Checkpoint:**
- Visiting `/booking?mode=reschedule&appointmentId=<id>` loads appointment and lands at step 3.
- Cancel link works end-to-end; only valid statuses allow cancel.
- Staff can copy quote link and paste into email/Slack; opening pasted link loads wizard in quote mode at step 3.
- Calendar invite can include reschedule and cancel links via variables.
- Session docs and handoff updated.## Session Workflow

Follow the same workflow as other sessions: use `/session-start 6.5.4 [description]` to begin; work one task at a time with checkpoints; use `/session-end 6.5.4 [description] [next-session]` when done. See session template or `session-6.5.1-guide.md` for full workflow (before/during/after session, checkpoints, end-of-session steps).

---

## Reference

- **Planning:** `sessions/session-6.5.4-planning.md` — goal, approach, tasks, files
- **Phase guide:** `phases/phase-6.5-guide.md` — Session 6.5.4 success criteria
- **Feature 3 (invites):** Phase 3.5 template resolver and variable list — for adding `{rescheduleLink}` and `{cancelLink}` only (quote link is via button, not template)

---

## Notes

[Session-specific notes, URL design decisions, base URL source choice]
