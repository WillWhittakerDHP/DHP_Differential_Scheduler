# Plan: task 6.5.4.1 — 6.5.4.1

## Contract
- **Tier:** task | **ID:** 6.5.4.1
- **Scope:** 6.5.4.1
- **Governance:** 1 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this task.

## Goal
Define the URL scheme and router infrastructure so reschedule, quote, and cancel flows can be opened via URLs. This task establishes routes and a shared URL-building utility; wizard entry from query params and cancel flow implementation are separate tasks.

## Files
- `client/src/router/index.ts` — Add cancel route; ensure booking route path supports query params (existing `/` and `/booking` already render BookingWizardView; query is available via `to.query`)
- `client/src/utils/booking/buildClientLinks.ts` — New utility: `buildRescheduleLink`, `buildQuoteLink`, `buildCancelLink`; document base URL source (client: `window.location.origin`; server/invites: future `VITE_APP_BASE_URL` or env)
- `client/src/vite-env.d.ts` — Add `VITE_APP_BASE_URL?: string` for optional server-side link building (invites); client-side defaults to `window.location.origin`

## Approach
1. **URL scheme (document):** Reschedule: `/booking?mode=reschedule&appointmentId=<id>`. Quote: `/booking?mode=quote&appointmentId=<id>`. Cancel: `/cancel?appointmentId=<id>` (separate route).
2. **Router:** Add cancel route (`/cancel`) pointing to a placeholder view (CancelConfirmView stub); Task 6.5.4.3 will implement the flow.
3. **URL utility:** Create `buildClientLinks.ts` with `buildRescheduleLink(appointmentId, baseUrl?)`, `buildQuoteLink(appointmentId, baseUrl?)`, `buildCancelLink(appointmentId, baseUrl?)`. Base URL: client uses `typeof window !== 'undefined' ? window.location.origin : ''`; optional override for server/invites via param or `VITE_APP_BASE_URL`.
4. **Document base URL source:** In utility JSDoc and session handoff — client runtime uses `window.location.origin`; server-side invite templates (Task 6.5.4.5) will use env var.

## Checkpoint
- `/booking?mode=reschedule&appointmentId=abc` and `/booking?mode=quote&appointmentId=abc` are valid URLs (router accepts; wizard entry in 6.5.4.2).
- `/cancel?appointmentId=abc` navigates to cancel route (stub view).
- `buildRescheduleLink`, `buildQuoteLink`, `buildCancelLink` return correct URLs; base URL source documented.

## How we build the tierDown
- **Task 6.5.4.1:** URL scheme and router
- **Task 6.5.4.2:** Wizard entry from query
- **Task 6.5.4.3:** Cancel flow
- **Task 6.5.4.4:** Copy quote link button
- **Task 6.5.4.5:** Invite template variables (optional)
- **Task 6.5.4.6:** Verification and docs

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.5.4-guide.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
