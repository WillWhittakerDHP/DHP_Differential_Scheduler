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
**Status:** Not Started

**Dependencies:** Session 6.5.1 (wizard mode, load-at-step-3, admin entry).

### Tasks

- [ ] #### Task 6.5.4.1: URL scheme and router
**Goal:** Define URL scheme; booking route accepts `mode` and `appointmentId`; cancel route if separate; app base URL available for link building.
**Files:** `client/src/router/index.ts`, env/config for base URL.
**Checkpoint:** Route definitions and base URL source documented/implemented.

- [ ] #### Task 6.5.4.2: Wizard entry from query
**Goal:** On booking route with query params, set wizard mode and `loadedAppointmentId`; load-at-step-3 runs for reschedule/quote.
**Files:** `BookingWizardView.vue`, wizard composables (`useBookingWizard`, `useWizardAppointmentManagement`).
**Checkpoint:** Visiting `/booking?mode=reschedule&appointmentId=<id>` loads appointment and lands at step 3.

- [ ] #### Task 6.5.4.3: Cancel flow
**Goal:** Cancel URL leads to confirm page; on confirm, PATCH to cancelled; success/error and navigation.
**Files:** New cancel view or route component; appointment PATCH/composable.
**Checkpoint:** Cancel link works end-to-end; only valid statuses allow cancel.

- [ ] #### Task 6.5.4.4: "Copy quote link" button
**Goal:** Button (e.g. on appointment row/detail for quote-status) builds quote URL, copies to clipboard, shows "Link copied" feedback; use shared URL-building utility.
**Files:** Appointments table/detail components; shared URL utility (client).
**Checkpoint:** Staff can copy quote link and paste into email/Slack; opening pasted link loads wizard in quote mode at step 3.

- [ ] #### Task 6.5.4.5: Invite template variables (optional)
**Goal:** Add only `{rescheduleLink}` and `{cancelLink}` to invite template context; resolve to full URLs; update admin template help. Do not add `{quoteLink}`.
**Files:** `server/src/services/invites/` (templateResolver, inviteContextBuilder); admin Instances tab template help.
**Checkpoint:** Calendar invite description can include reschedule and cancel links via variables.

- [ ] #### Task 6.5.4.6: Verification and docs
**Goal:** Smoke-test all links (including quote via pasted link from button); document URL scheme; update handoff/session log.
**Checkpoint:** Session complete; docs updated.

---

## Session Workflow

Follow the same workflow as other sessions: use `/session-start 6.5.4 [description]` to begin; work one task at a time with checkpoints; use `/session-end 6.5.4 [description] [next-session]` when done. See session template or `session-6.5.1-guide.md` for full workflow (before/during/after session, checkpoints, end-of-session steps).

---

## Reference

- **Planning:** `sessions/session-6.5.4-planning.md` — goal, approach, tasks, files
- **Phase guide:** `phases/phase-6.5-guide.md` — Session 6.5.4 success criteria
- **Feature 3 (invites):** Phase 3.5 template resolver and variable list — for adding `{rescheduleLink}` and `{cancelLink}` only (quote link is via button, not template)

---

## Notes

[Session-specific notes, URL design decisions, base URL source choice]
