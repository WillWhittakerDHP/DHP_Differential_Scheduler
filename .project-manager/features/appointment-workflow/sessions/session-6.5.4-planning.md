# Plan: session 6.5.4 — ** Client-facing entry — reschedule / cancel / quote links

## Contract
- **Tier:** session | **ID:** 6.5.4
- **Scope:** ** Client-facing entry — reschedule / cancel / quote links
- **Governance:** 4 governance highlights — read reports before filling slots

## Where we left off
Completed Task - Begin Session 6.5.4

## Goal
Enable clients to open reschedule, view-quote, or cancel flows via URLs (mode + appointmentId). Reschedule and cancel links can be embedded in calendar invites via optional template variables. The quote link is not in the invite template; a "Copy quote link" button in the app generates a copyable URL for staff to send manually.

## Files
- `client/src/router/index.ts` — URL scheme, booking route with query params, cancel route
- `client/src/views/` — BookingWizardView, cancel view/component
- `client/src/composables/booking/` — useBookingWizard, useWizardAppointmentManagement (wizard entry from query)
- `client/src/utils/` — shared URL-building utility for link generation
- `server/src/services/invites/` — templateResolver, inviteContextBuilder for {rescheduleLink}, {cancelLink}
- Admin components — appointment row/detail "Copy quote link" button; template help

## Approach
1. **URL scheme and router:** Define booking route with `mode` and `appointmentId` query params; separate cancel route; document base URL source.
2. **Wizard entry from query:** On booking route load, read query params, set wizard mode and loadedAppointmentId; load-at-step-3 runs for reschedule/quote.
3. **Cancel flow:** Cancel URL → confirm page → PATCH to cancelled → success/error and navigation.
4. **Copy quote link button:** Button on appointment row/detail (quote-status) builds quote URL, copies to clipboard, shows "Link copied" feedback.
5. **Invite template variables (optional):** Add {rescheduleLink} and {cancelLink} only; resolve to full URLs; update admin template help.
6. **Verification and docs:** Smoke-test all links; document URL scheme; update handoff/session log.

## Checkpoint
- Visiting `/booking?mode=reschedule&appointmentId=<id>` loads appointment and lands at step 3.
- Cancel link works end-to-end; only valid statuses allow cancel.
- Staff can copy quote link and paste into email/Slack; opening pasted link loads wizard in quote mode at step 3.
- Calendar invite can include reschedule and cancel links via variables.
- Session docs and handoff updated.

## How we build the tierDown to achieve them
- **Task 6.5.4.1:** URL scheme and router
- **Task 6.5.4.2:** Wizard entry from query
- **Task 6.5.4.3:** Cancel flow
- **Task 6.5.4.4:** Copy quote link button
- **Task 6.5.4.5:** Invite template variables (optional)
- **Task 6.5.4.6:** Verification and docs
---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/phases/phase-6.5-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/session-6.5.3-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
