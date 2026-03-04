# Planning: session 6.5.4 -- Client-facing entry: reschedule / cancel / quote links

## Loaded Context
- **Scope:** 6.5.4
- **Context source policy:** tierUp only. Phase guide (session entry) and phase handoff only. Session handoff, session guide, and session log are excluded.

### What We Are Planning (from context)

Session 6.5.4 is a follow-up to Session 6.5.1 (Guide: Rescheduling Flow). It delivers **client-facing entry** so that recipients can open the reschedule, view-quote, or cancel flow via a link (URL with mode and appointmentId). **Reschedule** and **cancel** links are included in calendar invites (and any confirmation email) via optional template variables. The **quote** link is not in the invite template; instead, a **"Copy quote link" button** in the app (e.g. on appointment row or detail for quote-status appointments) generates a copyable URL so staff can send it manually (email, Slack, etc.). Session 6.5.1 covers admin entry and wizard mode + load-at-step-3; 6.5.4 adds URL-based entry, the quote-link button, and optional invite template variables for reschedule/cancel only.

---

## Session: 6.5.4 - Client-facing entry: reschedule / cancel / quote links

**Date:** [When session starts]
**Duration:** [Estimated]
**Status:** Not Started
**Agent:** —

### Session intent (from phase guide)

- **Reschedule link:** e.g. `https://app.example.com/booking?mode=reschedule&appointmentId=<id>`. Opens wizard in reschedule mode, loads appointment, lands at step 3 (Availability). Reuses 6.5.1 wizard mode and load-at-step-3. Can be embedded in calendar invite via template variable `{rescheduleLink}`.
- **Quote link:** e.g. `https://app.example.com/booking?mode=quote&appointmentId=<id>`. Opens wizard in quote mode with that appointment loaded at step 3; recipient can view/edit and submit or hold quote. **Not** in the invite template. A **"Copy quote link" button** in the app (e.g. on appointment row or detail for quote-status) builds this URL and copies it to the clipboard so staff can paste it into email, Slack, etc. to send to the client.
- **Cancel link:** e.g. `https://app.example.com/booking/cancel?appointmentId=<id>` or `/booking?mode=cancel&appointmentId=<id>`. Leads to a confirm-cancel page; on confirm, PATCH appointment to cancelled. Can be embedded in calendar invite via template variable `{cancelLink}`.
- **Calendar invites / emails:** Optionally add template variables `{rescheduleLink}` and `{cancelLink}` only (no `{quoteLink}`) to the invite pipeline so EventInstance description and future confirmation email can include reschedule and cancel links. Base URL from env or app config.

### Goal

Deliver client-facing entry for reschedule, quote, and cancel via links (URLs with mode and appointmentId): (1) URL design and router/entry logic so mode and appointmentId open the correct flow; (2) cancel flow (confirm page + PATCH or cancel endpoint); (3) **"Copy quote link" button** in the app that builds and copies the quote URL for staff to send manually; (4) optional template variables **only** `{rescheduleLink}` and `{cancelLink}` in calendar invite (and future confirmation email) — quote link is not in the invite template.

### Files

- **Router / entry:** `client/src/router/index.ts` — booking route(s); optionally query params for `mode` and `appointmentId`. `client/src/views/booking/BookingWizardView.vue` (or equivalent) — read route query on mount, set wizard mode and `loadedAppointmentId`, trigger load when present.
- **Wizard composables:** `useBookingWizard.ts`, `useWizardAppointmentManagement.ts` — already support mode and `loadedAppointmentId` from 6.5.1; ensure they are settable from route/entry.
- **Cancel flow:** New view or route component for cancel confirmation (e.g. `BookingCancelView.vue` or step within booking); PATCH appointment to cancelled; success/error messaging.
- **Copy quote link button:** Where quote-status appointments are shown (e.g. admin appointments table row, appointment detail view) — button that builds `?mode=quote&appointmentId=<id>` URL (using app base URL), copies to clipboard, and optionally shows a brief "Link copied" feedback. Shared URL-building utility so router and button use the same format.
- **Invite templates (optional):** `server/src/services/invites/templateResolver.ts` (or equivalent) — extend context with `rescheduleLink` and `cancelLink` only (full URLs using app base URL + path/query). Document in admin template help (Feature 3 Phase 3.5). Do not add `quoteLink` to invite template.

### Approach

1. **URL design:** Decide and document: query params `mode` (reschedule | quote | cancel) and `appointmentId` on `/booking`, or separate path for cancel (e.g. `/booking/cancel?appointmentId=...`). Use same base URL source (env or config) for building links in templates.
2. **Router and wizard entry:** On navigate to booking route with `mode` and `appointmentId`, set wizard mode and `loadedAppointmentId` (e.g. in BookingWizardView or a composable used by it); existing load-at-step-3 runs so user lands at step 3 for reschedule/quote. For cancel, route to cancel view/flow instead of wizard.
3. **Cancel flow:** Cancel view reads `appointmentId` from route; shows confirmation (e.g. "Cancel this appointment?"); on confirm, PATCH appointment status to cancelled; show success and link back to home or booking. Handle not-found and transition rules (e.g. only allow cancel for certain statuses).
4. **Copy quote link button:** Add a button (e.g. "Copy quote link" or "Get link to send") where quote-status appointments are displayed. On click, build the quote URL (base URL + `/booking?mode=quote&appointmentId=<id>`), copy to clipboard, show brief feedback. Use a shared URL-building utility so the same format is used by the router and by this button.
5. **Template variables (optional):** In invite orchestration/template resolution, add only `rescheduleLink` and `cancelLink` (not `quoteLink`). Resolve to full URL. Add to template variable help in admin Instances tab.
6. **Governance:** Keep components thin; route/query reading and URL building in composables or small utilities; reuse existing PATCH and transition guards.

### Checkpoint

- Visiting `/booking?mode=reschedule&appointmentId=<id>` (and quote variant) opens wizard, sets mode and loads appointment, lands at step 3.
- Visiting cancel URL shows confirm page; on confirm, appointment is cancelled and user sees success.
- Optional: Calendar invite description can use `{rescheduleLink}` and `{cancelLink}`; variables resolve to correct URLs. Quote link is available only via the Copy quote link button. Lint and typecheck pass.

---

## Tasks

- [ ] **Task 6.5.4.1 — URL scheme and router**  
  Define and document URL scheme (query params or path for cancel). Update booking route to accept `mode` and `appointmentId`; add cancel route if separate path. Ensure app base URL is available (env or config) for link building.

- [ ] **Task 6.5.4.2 — Wizard entry from query**  
  In booking wizard entry (e.g. BookingWizardView or composable), read `mode` and `appointmentId` from route query on mount; set wizard mode and `loadedAppointmentId`; existing load-at-step-3 logic runs for reschedule/quote so user lands at step 3.

- [ ] **Task 6.5.4.3 — Cancel flow**  
  Implement cancel entry: route (or query) with appointmentId leads to cancel confirmation view; on confirm, PATCH appointment to cancelled (or call cancel endpoint); enforce status transition rules; success/error messaging and navigation.

- [ ] **Task 6.5.4.4 — "Copy quote link" button**  
  Add a button (e.g. on appointment row or detail for quote-status appointments) that builds the quote URL (`?mode=quote&appointmentId=<id>` with app base URL), copies it to the clipboard, and shows brief "Link copied" (or similar) feedback. Use a shared URL-building utility so router and button stay in sync.

- [ ] **Task 6.5.4.5 — Invite template variables (optional)**  
  Add only `{rescheduleLink}` and `{cancelLink}` to invite template context; resolve to full URLs using base URL and same path/query design. Do not add `{quoteLink}` to the invite template. Update template variable help in admin (Instances tab / Phase 3.5 docs).

- [ ] **Task 6.5.4.6 — Verification and docs**  
  Smoke-test: open reschedule and quote links (quote via pasted link from Copy button); open cancel link and confirm cancel. Verify calendar invite description can include reschedule/cancel links when variables are used. Update session guide or handoff; document URL scheme in phase or feature doc.

---

## Decisions Made
[Populated as conversation progresses]

## Insight / Proposal / Decisions
[As needed]
