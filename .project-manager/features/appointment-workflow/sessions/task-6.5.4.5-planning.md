# Plan: task 6.5.4.5 — 6.5.4.5

## Contract
- **Tier:** task | **ID:** 6.5.4.5
- **Scope:** 6.5.4.5
- **Governance:** Clean — no violations detected

## Where we left off
No prior handoff for this task.

## Goal
Add `{rescheduleLink}` and `{cancelLink}` as optional template variables for calendar invites. When used in event instance templates (title, description, location), resolve to full URLs. Update admin template help. Quote link is not in the template (staff use Copy quote link button).

## Files
- `shared/constants/templateVariables.ts` — Add rescheduleLink, cancelLink to EVENT_TEMPLATE_VARIABLES
- `server/src/services/invites/inviteContextBuilder.ts` — Add rescheduleLink and cancelLink to buildInviteContext; base URL from env
- Server env/config — Document APP_BASE_URL (or VITE_APP_BASE_URL) for server-side link building
- Admin template help — Uses EVENT_TEMPLATE_VARIABLES from shared; auto-picks up new entries

## Approach
1. Add rescheduleLink and cancelLink to shared EVENT_TEMPLATE_VARIABLES.
2. In buildInviteContext, compute full URLs from base URL env.
3. Template resolver already resolves any {var} from context.
4. Document APP_BASE_URL in env example.

## Checkpoint
- Event template with {rescheduleLink} produces full reschedule URL in calendar invite.
- Event template with {cancelLink} produces full cancel URL in calendar invite.
- Admin Instances tab template help lists rescheduleLink and cancelLink.

## How we build the tierDown
- **Task 6.5.4.5:** Invite template variables (optional)
- **Task 6.5.4.6:** Verification and docs

---
## Reference (read before filling slots — governance and inventory compliance is required)
- TierUp guide (scope and intent): `.project-manager/features/appointment-workflow/sessions/session-6.5.4-guide.md`
- Handoff (full transition context): `.project-manager/features/appointment-workflow/sessions/task-6.5.4.4-handoff.md`
- Governance reports: `client/.audit-reports/` — check function-complexity, component-health, composable-health, type-escape, type-constant-inventory
- Playbooks: `.project-manager/TYPE_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPOSABLE_AUTHORING_PLAYBOOK.md`, `.project-manager/FUNCTION_AUTHORING_PLAYBOOK.md`, `.project-manager/COMPONENT_AUTHORING_PLAYBOOK.md`
