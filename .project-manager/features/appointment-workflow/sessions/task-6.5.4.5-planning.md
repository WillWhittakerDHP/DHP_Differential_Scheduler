# Plan: task 6.5.4.5 — 6.5.4.5

## Contract
- **Tier:** task | **ID:** 6.5.4.5
- **Scope:** 6.5.4.5
- **Governance:** 1 governance highlights — read reports before filling slots

## Where we left off
No prior handoff for this task.

## Goal
Add `{rescheduleLink}` and `{cancelLink}` as optional template variables for calendar invites. When used in event instance templates (title, description, location), resolve to full URLs. Update admin template help so staff can discover these variables. Quote link is **not** in the template (staff use Copy quote link button).

## Files
- `shared/constants/templateVariables.ts` — Add rescheduleLink, cancelLink to EVENT_TEMPLATE_VARIABLES
- `server/src/services/invites/inviteContextBuilder.ts` — Add rescheduleLink and cancelLink to buildInviteContext; use base URL from env
- `server/src/config/` or env — Document/add APP_BASE_URL (or VITE_APP_BASE_URL) for server-side link building
- Admin template help — Uses EVENT_TEMPLATE_VARIABLES from shared; auto-picks up new entries

## Approach
1. **Shared constants:** Add `{ name: 'rescheduleLink', description: '...', example: '...' }` and `{ name: 'cancelLink', ... }` to EVENT_TEMPLATE_VARIABLES.
2. **Server invite context:** In buildInviteContext, compute `rescheduleLink` = baseUrl + `/booking?mode=reschedule&appointmentId=${id}` and `cancelLink` = baseUrl + `/cancel?appointmentId=${id}`. Base URL from `process.env.APP_BASE_URL` or `process.env.VITE_APP_BASE_URL` (fallback empty or localhost for dev).
3. **Template resolver:** No change — already resolves any `{var}` from context.
4. **Admin help:** No code change — useInstancesTabEventInstance imports EVENT_TEMPLATE_VARIABLES; new entries appear automatically.
5. **Docs:** Document APP_BASE_URL in env example or config; update session handoff.

## Checkpoint
- Event instance template with `{rescheduleLink}` in description produces full reschedule URL in calendar invite.
- Event instance template with `{cancelLink}` in description produces full cancel URL in calendar invite.
- Admin Instances tab template help lists rescheduleLink and cancelLink.

## How we build the tierDown
- **Session 6.5.4:** Client-facing entry — reschedule / cancel / quote links
- **Task 6.5.4.5:** Invite template variables (optional)
- **Task 6.5.4.6:** Verification and docs

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.5.4-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.5.4.4-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
